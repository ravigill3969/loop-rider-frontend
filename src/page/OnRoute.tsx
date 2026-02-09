import {
  useGetActiveRideRequest,
  useGetActiveRideRequestWithID,
} from "@/api/ride-api";
import type { ActiveTrip } from "@/api/ride-api-type";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { map_token } from "@/global/env";
import { Button } from "@/components/ui/button";
import { useCancelRide } from "@/api/ride-api";
import { useWebsocket } from "@/context/WebSocketContext";

mapboxgl.accessToken = map_token;

type CarColor = "black" | "red" | "silver";

const CAR_COLORS: Record<CarColor, string> = {
  black: "#111111",
  red: "#b91c1c",
  silver: "#c0c0c0",
};

const createCarMarkerElement = (color: CarColor) => {
  const el = document.createElement("div");
  el.className = "car-marker";
  el.style.color = CAR_COLORS[color];
  el.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1zm2.3-4.5L6.4 9h11.2l-.9-2.5a1 1 0 0 0-1-.7H8.3a1 1 0 0 0-1 .7zM7 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
    </svg>
  `;
  return el;
};

const applyCarMarkerColor = (el: HTMLElement, color: CarColor) => {
  el.style.color = CAR_COLORS[color];
};

const isOnRouteStatus = (status: string) => {
  const normalized = status.toLowerCase().trim().replace(/\s+/g, "_");
  return normalized === "on_route" || normalized === "onroute";
};

export default function OnRoute() {
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const driverAnimationFrameRef = useRef<number | null>(null);
  const routeDrawTimeoutRef = useRef<number | null>(null);
  const activeTripRef = useRef<ActiveTrip | null>(null);
  const driverLocationRef = useRef<[number, number] | null>(null);
  const driverRouteStatusRef = useRef<string>("assigned");

  const [carColor, setCarColor] = useState<CarColor>("red");
  const carColorRef = useRef(carColor);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  const { mutateAsync: cancelRide, isPending: isCancelling } = useCancelRide();

  const { tripStatus, clearTripStatus, driverLocationUpdate } = useWebsocket();

  const { data, isLoading } = useGetActiveRideRequest();
  const tripId = data?.trip_id;

  const {
    data: tripData,
    isLoading: tripLoading,
    error,
  } = useGetActiveRideRequestWithID(tripId ?? "");
  const activeTrip: ActiveTrip | null = tripData ?? null;
  const activeTripId = activeTrip?.trip_id;
  const driverLocation = useMemo<[number, number] | null>(() => {
    if (!activeTrip) return null;

    if (
      driverLocationUpdate?.type === "DRIVER_LOCATION_UPDATE" &&
      driverLocationUpdate.trip_id === activeTrip.trip_id
    ) {
      return [driverLocationUpdate.lat, driverLocationUpdate.lng];
    }

    return [activeTrip.pickup_lat, activeTrip.pickup_lng];
  }, [activeTrip, driverLocationUpdate]);
  const driverRouteStatus = useMemo(() => {
    if (
      activeTrip &&
      driverLocationUpdate?.type === "DRIVER_LOCATION_UPDATE" &&
      driverLocationUpdate.trip_id === activeTrip.trip_id
    ) {
      return driverLocationUpdate.status;
    }

    return "assigned";
  }, [activeTrip, driverLocationUpdate]);

  useEffect(() => {
    if (error) navigate("/");
  }, [error, navigate]);

  useEffect(() => {
    activeTripRef.current = activeTrip;
  }, [activeTrip]);

  useEffect(() => {
    driverLocationRef.current = driverLocation;
  }, [driverLocation]);

  useEffect(() => {
    driverRouteStatusRef.current = driverRouteStatus;
  }, [driverRouteStatus]);

  useEffect(() => {
    driverRouteStatusRef.current = "assigned";
  }, [activeTripId]);

  useEffect(() => {
    if (activeTrip?.status === "cancelled") {
      navigate("/", { replace: true });
    }
  }, [activeTrip, navigate]);

  useEffect(() => {
    carColorRef.current = carColor; 
  }, [carColor]);

  const createOrUpdateDriverMarker = useCallback((lng: number, lat: number) => {
    if (!mapRef.current) return;
    if (!driverMarkerRef.current) {
      const carMarkerEl = createCarMarkerElement(carColorRef.current);
      driverMarkerRef.current = new mapboxgl.Marker({
        element: carMarkerEl,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      return;
    }
    driverMarkerRef.current.setLngLat([lng, lat]);
  }, []);

  const createOrUpdateDestinationMarker = useCallback(
    (trip: ActiveTrip, status: string) => {
      if (!mapRef.current) return;

      const isOnRoute = isOnRouteStatus(status);
      const targetLng = isOnRoute ? trip.dropoff_lng : trip.pickup_lng;
      const targetLat = isOnRoute ? trip.dropoff_lat : trip.pickup_lat;
      const markerColor = isOnRoute ? "#ef4444" : "#22c55e";

      destinationMarkerRef.current?.remove();
      destinationMarkerRef.current = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([targetLng, targetLat])
        .addTo(mapRef.current);
    },
    [],
  );

  const animateDriverMarker = useCallback(
    (lng: number, lat: number) => {
      if (!mapRef.current) return;

      if (!driverMarkerRef.current) {
        createOrUpdateDriverMarker(lng, lat);
        return;
      }

      if (driverAnimationFrameRef.current !== null) {
        cancelAnimationFrame(driverAnimationFrameRef.current);
        driverAnimationFrameRef.current = null;
      }

      const marker = driverMarkerRef.current;
      const start = marker.getLngLat();
      const duration = 700;
      const startTime = performance.now();

      const animate = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const easedProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentLng = start.lng + (lng - start.lng) * easedProgress;
        const currentLat = start.lat + (lat - start.lat) * easedProgress;

        marker.setLngLat([currentLng, currentLat]);

        if (progress < 1) {
          driverAnimationFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        driverAnimationFrameRef.current = null;
      };

      driverAnimationFrameRef.current = requestAnimationFrame(animate);
    },
    [createOrUpdateDriverMarker],
  );

  const drawRoute = useCallback(async () => {
    const trip = activeTripRef.current;
    const map = mapRef.current;
    if (!trip || !map) return;
    if (!map.isStyleLoaded()) return;

    const pickupCoords = { lng: trip.pickup_lng, lat: trip.pickup_lat };
    const dropoffCoords = { lng: trip.dropoff_lng, lat: trip.dropoff_lat };

    const latestDriverLocation = driverLocationRef.current;
    const startLng = latestDriverLocation
      ? latestDriverLocation[1]
      : pickupCoords.lng;
    const startLat = latestDriverLocation
      ? latestDriverLocation[0]
      : pickupCoords.lat;
    const shouldRouteToDropoff = isOnRouteStatus(driverRouteStatusRef.current);
    const targetCoords = shouldRouteToDropoff ? dropoffCoords : pickupCoords;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${targetCoords.lng},${targetCoords.lat}?geometries=geojson&overview=full&access_token=${map_token}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || !data.routes[0]) return;

    const route = data.routes[0].geometry;
    if (!route.coordinates || route.coordinates.length < 2) return;

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route.coordinates,
      },
    };

    if (map.getSource("route")) {
      (map.getSource("route") as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("route", {
        type: "geojson",
        data: geojson,
      });
    }

    if (!map.getLayer("route")) {
      map.addLayer(
        {
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": 5,
            "line-opacity": 0.9,
          },
        },
        "waterway-label",
      );
    }
  }, []);

  const scheduleRouteDraw = useCallback(() => {
    if (routeDrawTimeoutRef.current !== null) {
      window.clearTimeout(routeDrawTimeoutRef.current);
    }

    routeDrawTimeoutRef.current = window.setTimeout(() => {
      void drawRoute();
      routeDrawTimeoutRef.current = null;
    }, 250);
  }, [drawRoute]);

  // 🗺️ Initialize map ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !activeTripId) return;
    const trip = activeTripRef.current;
    if (!trip) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [trip.pickup_lng, trip.pickup_lat],
      zoom: 10,
    });

    mapRef.current.on("load", () => {
      // Driver marker starts at pickup and then follows live updates.
      createOrUpdateDriverMarker(trip.pickup_lng, trip.pickup_lat);
      createOrUpdateDestinationMarker(trip, driverRouteStatusRef.current);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([trip.pickup_lng, trip.pickup_lat]);
      bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
      mapRef.current!.fitBounds(bounds, { padding: 50 });

      scheduleRouteDraw();
    });

    return () => {
      if (driverAnimationFrameRef.current !== null) {
        cancelAnimationFrame(driverAnimationFrameRef.current);
        driverAnimationFrameRef.current = null;
      }
      if (routeDrawTimeoutRef.current !== null) {
        window.clearTimeout(routeDrawTimeoutRef.current);
        routeDrawTimeoutRef.current = null;
      }
      destinationMarkerRef.current?.remove();
      destinationMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [
    activeTripId,
    createOrUpdateDriverMarker,
    createOrUpdateDestinationMarker,
    scheduleRouteDraw,
  ]);

  useEffect(() => {
    if (!mapRef.current || !driverLocation) return;
    animateDriverMarker(driverLocation[1], driverLocation[0]);
    scheduleRouteDraw();
  }, [driverLocation, animateDriverMarker, scheduleRouteDraw]);

  useEffect(() => {
    const trip = activeTripRef.current;
    if (!mapRef.current || !trip) return;
    createOrUpdateDestinationMarker(trip, driverRouteStatus);
    scheduleRouteDraw();
  }, [driverRouteStatus, createOrUpdateDestinationMarker, scheduleRouteDraw]);

  useEffect(() => {
    if (!driverMarkerRef.current) return;
    const el = driverMarkerRef.current.getElement() as HTMLElement;
    applyCarMarkerColor(el, carColor);
  }, [carColor]);

  // Update driver location
  // useEffect(() => {
  //   if (!mapRef.current || !driverLocation) return;

  //   if (!driverMarkerRef.current) {
  //     driverMarkerRef.current = new mapboxgl.Marker({ color: "blue" })
  //       .setLngLat([driverLocation[1], driverLocation[0]])
  //       .addTo(mapRef.current);
  //   } else {
  //     driverMarkerRef.current.setLngLat([
  //       driverLocation[1],
  //       driverLocation[0],
  //     ]);
  //   }
  // }, [driverLocation]);

  if (isLoading) return <div>Loading active ride…</div>;
  if (!tripId) return <div>No active ride</div>;
  if (tripLoading || !activeTrip) return <div>Loading trip details…</div>;

  const handleCancelRide = () => {
    setCancelError("");
    setCancelReason("");
    setShowCancelModal(true);
  };

  const cancelOptions = [
    "I no longer need a ride",
    "Driver asked me to cancel",
    "Wait time is too long",
    "Found another ride",
  ] as const;

  const handleConfirmCancel = async () => {
    if (!activeTrip) return;
    if (!cancelReason) {
      setCancelError("Please select a reason.");
      return;
    }
    setCancelError("");
    try {
      const res = await cancelRide({
        trip_id: activeTrip.trip_id,
        driver_id: activeTrip.driver_id ?? "",
        reason: cancelReason,
      });
      const isSuccess = res?.success === true;
      if (isSuccess) {
        window.location.assign("/");
        return;
      }
      setCancelError("Unable to cancel ride. Please try again.");
    } catch {
      setCancelError("Unable to cancel ride. Please try again.");
    }
  };

  const statusText =
    activeTrip.status === "searching"
      ? "Looking for a driver..."
      : "Locating driver...";
  const isDriverCancelledByWS =
    tripStatus?.type === "TRIP_STATUS" && tripStatus.status === 300;
  const driverCancelMessage = isDriverCancelledByWS
    ? tripStatus.message
    : "Your ride has been cancelled by driver.";

  const handleBackToHome = () => {
    clearTripStatus();
    window.location.replace("/");
  };

  return (
    <div className="relative h-screen w-full">
      <div className="absolute left-1/2 top-5 z-10 -translate-x-1/2 space-y-3 text-center">
        <div className="rounded-full bg-black/80 px-6 py-3 text-lg font-bold text-white shadow-lg">
          {statusText}
        </div>
        <Button
          onClick={handleCancelRide}
          className="h-12 rounded-full bg-rose-500/90 px-6 text-base font-bold text-white shadow hover:bg-rose-600"
        >
          Cancel Ride
        </Button>
        <div className="flex items-center justify-center gap-2">
          {(["black", "red", "silver"] as const).map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setCarColor(color)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                carColor === color
                  ? "border-white bg-white text-black"
                  : "border-white/40 bg-white/10 text-white"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div ref={mapContainerRef} className="h-full w-full" />
      {showCancelModal && !isDriverCancelledByWS && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl">
            <h3 className="text-xl font-bold text-black">Cancel Ride</h3>
            <p className="mt-1 text-sm text-gray-600">
              Why are you canceling your ride?
            </p>

            <div className="mt-4 space-y-2">
              {cancelOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCancelReason(option)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                    cancelReason === option
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {cancelError && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {cancelError}
              </p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Keep Ride
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isCancelling ? "Canceling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isDriverCancelledByWS && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl">
            <h3 className="text-xl font-bold text-black">Ride Cancelled</h3>
            <p className="mt-2 text-sm text-gray-700">{driverCancelMessage}</p>
            <div className="mt-5 flex items-center justify-end">
              <Button
                type="button"
                onClick={handleBackToHome}
                className="bg-black text-white hover:bg-gray-900"
              >
                Go back to home screen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
