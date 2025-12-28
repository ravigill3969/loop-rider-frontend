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
}

interface TripRequestDataI {
  type: string;
  status: number;
  message: string;
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

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const ws = new WebSocket(`ws://localhost:8081/ws?rider_id=${user?.id}`);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
      setConnected(true);
    };

    ws.onclose = () => {
      console.log("WS disconnected");
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WS error", err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TripRequestDataI;

        if (data.type === "PAYMENT") {
          setReceivedText(data.message);
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

  return (
    <WebSocketContext.Provider value={{ connected, send, receivedText }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export function useWebsocket() {
  const ctx = useContext(WebSocketContext);

  if (!ctx) {
    throw new Error("useWebSocket must be used inside <WebSocketProvider>");
  }

  return ctx;
}
