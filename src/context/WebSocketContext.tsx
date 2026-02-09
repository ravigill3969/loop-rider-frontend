import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface WebSocketConextT {
  connected: boolean;
  send: (data: unknown) => void;
  receivedText: string;
  tripStatus: TripRequestDataI | null;
  driverLocationUpdate: DriverLocationUpdateI | null;
  clearTripStatus: () => void;
}

interface TripRequestDataI {
  type: "TRIP_STATUS";
  status: number;
  message: string;
}

interface DriverLocationUpdateI {
  type: "DRIVER_LOCATION_UPDATE";
  trip_id: string;
  rider_id: string;
  driver_id: string;
  lat: number;
  lng: number;
  status: string;
  driver_name: string;
  driver_phone_number: string;
  driver_profile_pic: string;
  driver_car_number: string;
  driver_car_color: string;
}

const WebSocketContext = createContext<WebSocketConextT | null>(null);

export const WebSocketConextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [receivedText, setReceivedText] = useState("Loading");
  const [tripStatus, setTripStatus] = useState<TripRequestDataI | null>(null);
  const [driverLocationUpdate, setDriverLocationUpdate] =
    useState<DriverLocationUpdateI | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const ws = new WebSocket(`ws://localhost:8081/ws?rider_id=${user.id}`);

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as
          | TripRequestDataI
          | DriverLocationUpdateI;

        if (data.type === "TRIP_STATUS") {
          setReceivedText(data.message);
          setTripStatus(data);

          if (data.status === 200 && data.message === "trip completed") {
            window.location.replace("/");
          }
          return;
        }

        if (data.type === "DRIVER_LOCATION_UPDATE") {
          setDriverLocationUpdate(data);
        }
      } catch (err) {
        console.error("Invalid WS payload", err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [user?.id]);

  const send = (data: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  const clearTripStatus = () => {
    setTripStatus(null);
  };

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        send,
        receivedText,
        tripStatus,
        driverLocationUpdate,
        clearTripStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useWebsocket() {
  const ctx = useContext(WebSocketContext);

  if (!ctx) {
    throw new Error("useWebSocket must be used inside <WebSocketProvider>");
  }

  return ctx;
}
