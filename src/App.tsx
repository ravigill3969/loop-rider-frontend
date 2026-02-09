import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router";
import Login from "./page/Login";
import "./App.css";
import Home from "./page/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./page/Profile";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import OnRide from "./page/OnRoute";
import { WebSocketConextProvider } from "./context/WebSocketContext";
import { WaitingContextProvider } from "./context/WaitingContext";
import RideRequest from "./page/RideRequest";
import {
  useGetActiveRideRequest,
  useGetActiveRideRequestWithID,
} from "@/api/ride-api";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketConextProvider>
            <WaitingContextProvider>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ride"
                  element={
                    <ProtectedRoute>
                      <RideRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/on-ride"
                  element={
                    <ProtectedRoute>
                      <OnRide />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </WaitingContextProvider>
          </WebSocketConextProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  const [, setAuthChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthChecking(false);
    }
  }, [isLoading]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <ActiveRideOverlay />
      {children}
    </>
  );
}

function ActiveRideOverlay() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useGetActiveRideRequest();
  const tripId = data?.trip_id ?? "";
  const { data: tripData, isLoading: tripLoading } =
    useGetActiveRideRequestWithID(tripId);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    moved: boolean;
    offsetX: number;
    offsetY: number;
  }>({ isDragging: false, moved: false, offsetX: 0, offsetY: 0 });

  const hasActiveRide = Boolean(data?.status && data.trip_id);
  const isCancelled = tripData?.status === "cancelled";

  useEffect(() => {
    if (
      !isLoading &&
      !tripLoading &&
      hasActiveRide &&
      !isCancelled &&
      location.pathname === "/"
    ) {
      navigate("/on-ride", { replace: true });
    }
  }, [
    hasActiveRide,
    isCancelled,
    isLoading,
    tripLoading,
    location.pathname,
    navigate,
  ]);

  useEffect(() => {
    if (!pos) {
      setPos({ x: window.innerWidth / 2, y: 84 });
    }
  }, [pos]);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      const radius = 44;
      const nextX = event.clientX - dragRef.current.offsetX;
      const nextY = event.clientY - dragRef.current.offsetY;
      const clampedX = Math.min(
        Math.max(nextX, radius),
        window.innerWidth - radius,
      );
      const clampedY = Math.min(
        Math.max(nextY, radius),
        window.innerHeight - radius,
      );

      if (
        Math.abs(clampedX - (posRef.current?.x ?? clampedX)) > 6 ||
        Math.abs(clampedY - (posRef.current?.y ?? clampedY)) > 6
      ) {
        dragRef.current.moved = true;
      }

      setPos({ x: clampedX, y: clampedY });
    };

    const handleUp = () => {
      dragRef.current.isDragging = false;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  if (isLoading || tripLoading || !hasActiveRide || isCancelled) return null;
  if (location.pathname === "/" || location.pathname === "/on-ride")
    return null;

  if (!pos) return null;

  return (
    <div
      className="active-ride-fab"
      role="button"
      tabIndex={0}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragRef.current.isDragging = true;
        dragRef.current.moved = false;
        dragRef.current.offsetX = event.clientX - pos.x;
        dragRef.current.offsetY = event.clientY - pos.y;
      }}
      onPointerUp={() => {
        if (!dragRef.current.moved) {
          navigate("/on-ride");
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate("/on-ride");
        }
      }}
      aria-label="Go to active ride"
    >
      <span className="active-ride-wave" />
      <span className="active-ride-wave active-ride-wave-delay" />
      <span className="active-ride-label">Active Ride</span>
    </div>
  );
}
