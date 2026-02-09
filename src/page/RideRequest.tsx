import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { map_token } from "../global/env";
import { useCreateRideRequest } from "@/api/ride-api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWaiting } from "@/context/WaitingContext";

mapboxgl.accessToken = map_token;

function RideRequest() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { user } = useAuth();

  const { updateShow } = useWaiting();

  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarker = useRef<mapboxgl.Marker | null>(null);

  const { mutate } = useCreateRideRequest();

  const [tripInfo, setTripInfo] = useState({
    distance: 0,
    eta: 0,
    price: 0,
    pickup_location: "",
    pickup_coords_lat_lng: null as [number, number] | null,
    dropoff_location: "",
    dropoff_coords_lat_lng: null as [number, number] | null,
  });

  const location = useLocation();
  const { from, to, dropoff_location, pickup_location } = location.state as {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    dropoff_location: string;
    pickup_location: string;
  };

  const getRoute = async () => {
    const pickupCoords = pickupMarker.current?.getLngLat();
    const dropoffCoords = dropoffMarker.current?.getLngLat();

    if (!pickupCoords || !dropoffCoords) return;

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?geometries=geojson&overview=full&access_token=${map_token}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || !data.routes[0]) return;

    const route = data.routes[0].geometry;
    if (!route.coordinates || route.coordinates.length < 2) return;

    // Distance + ETA
    const distanceKm = Number((data.routes[0].distance / 1000).toFixed(2));
    const durationMin = Math.ceil(data.routes[0].duration / 60);

    // Price calculation
    const baseFare = 3.5;
    const costPerKm = 1.2;
    const costPerMin = 0.3;
    const price = Number(
      (baseFare + distanceKm * costPerKm + durationMin * costPerMin).toFixed(2),
    );

    // Update React state
    setTripInfo((prev) => ({
      ...prev,
      distance: distanceKm,
      eta: durationMin,
      price,
    }));

    // Draw GeoJSON line
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route.coordinates,
      },
    };

    if (mapRef.current?.getSource("route")) {
      (mapRef.current.getSource("route") as mapboxgl.GeoJSONSource).setData(
        geojson,
      );
    } else {
      mapRef.current?.addSource("route", {
        type: "geojson",
        data: geojson,
      });
    }

    if (!mapRef.current?.getLayer("route")) {
      mapRef.current?.addLayer(
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
  };

  const updateLocationAddress = async (
    lng: number,
    lat: number,
    type: "pickup" | "dropoff",
  ) => {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${map_token}`,
    );
    const data = await res.json();
    const address = data.features?.[0]?.place_name || "Selected location";

    if (type == "pickup") {
      setTripInfo((prev) => ({
        ...prev,
        pickup_coords_lat_lng: [lat, lng],
        pickup_location: address,
      }));
    } else {
      setTripInfo((prev) => ({
        ...prev,
        dropoff_coords_lat_lng: [lat, lng],
        dropoff_location: address,
      }));
    }
  };

  const makeMarkerDraggable = (
    marker: mapboxgl.Marker,
    type: "pickup" | "dropoff",
  ) => {
    marker.setDraggable(true);

    marker.on("dragend", async () => {
      const lngLat = marker.getLngLat();
      await updateLocationAddress(lngLat.lng, lngLat.lat, type);
      await getRoute();
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("trip_info");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTripInfo({
        distance: parsed.distance || 0,
        eta: parsed.eta || 0,
        price: parsed.price || 0,
        pickup_location: parsed.pickup_location || "",
        pickup_coords_lat_lng: parsed.pickup_coords_lat_lng || null,
        dropoff_location: parsed.dropoff_location || "",
        dropoff_coords_lat_lng: parsed.dropoff_coords_lat_lng || null,
      });
    }

    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [from.lng, from.lat],
      zoom: 10,
    });

    mapRef.current.on("load", () => {
      // Pickup marker
      pickupMarker.current = new mapboxgl.Marker({
        color: "green",
        draggable: true,
      })
        .setLngLat([from.lng, from.lat])
        .addTo(mapRef.current!);

      // Dropoff marker
      dropoffMarker.current = new mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat([to.lng, to.lat])
        .addTo(mapRef.current!);

      // Make markers draggable and update on drag
      makeMarkerDraggable(pickupMarker.current, "pickup");
      makeMarkerDraggable(dropoffMarker.current, "dropoff");

      // Set initial locations
      setTripInfo((prev) => ({
        ...prev,
        pickup_coords_lat_lng: [from.lat, from.lng],
        pickup_location: pickup_location,
        dropoff_coords_lat_lng: [to.lat, to.lng],
        dropoff_location: dropoff_location,
      }));

      // Fit map to both points
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([from.lng, from.lat]);
      bounds.extend([to.lng, to.lat]);
      mapRef.current!.fitBounds(bounds, { padding: 50 });

      getRoute();
    });

    return () => mapRef.current?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.lat, from.lng, to.lat, to.lng]);

  const handleRequestRide = () => {
    if (tripInfo.dropoff_coords_lat_lng && tripInfo.pickup_coords_lat_lng) {
      updateShow(true);
      mutate({
        dropoff_location: tripInfo.dropoff_location,
        estimated_distance_km: tripInfo.distance,
        estimated_duration_min: tripInfo.eta,
        estimated_price: Number(tripInfo.price.toFixed(2)),
        pickup_location: tripInfo.pickup_location,
        dropoff_coords: {
          lat: tripInfo.dropoff_coords_lat_lng[0],
          lng: tripInfo.dropoff_coords_lat_lng[1],
        },
        pickup_coords: {
          lat: tripInfo.pickup_coords_lat_lng[0],
          lng: tripInfo.pickup_coords_lat_lng[1],
        },
        rider_name: user?.full_name as string,
        rider_age: 23,
        rider_gender: "male",
      });
    }
  };

  return (
    <>
      <div style={{ width: "100%", height: "100vh" }}>
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 10,
            background: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            width: "240px",
            fontSize: "14px",
          }}
        >
          <p>
            <b>Distance:</b> {tripInfo.distance || "..."} km
          </p>
          <p>
            <b>ETA:</b> {tripInfo.eta || "..."} mins
          </p>
          <p>
            <b>Price:</b> ${tripInfo.price || "..."}
          </p>
        </div>

        {/* Pickup location */}
        <div
          style={{
            position: "absolute",
            top: "150px",
            left: "20px",
            zIndex: 10,
            background: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            width: "240px",
            fontSize: "14px",
          }}
        >
          <b>Pickup:</b>
          <br />
          {tripInfo.pickup_location || "Drag green marker to change"}
        </div>

        {/* Dropoff location */}
        <div
          style={{
            position: "absolute",
            top: "300px",
            left: "20px",
            zIndex: 10,
            background: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            width: "240px",
            fontSize: "14px",
          }}
        >
          <b>Dropoff:</b>
          <br />
          {tripInfo.dropoff_location || "Drag red marker to change"}
        </div>

        {/* Req ride button */}
        <Button
          onClick={handleRequestRide}
          className="bg-black text-white absolute bottom-6 left-[40%] font-bold  z-10 p-3 rounded-lg w-60 text-sm"
        >
          Request Ride
        </Button>

        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </>
  );
}

export default RideRequest;
