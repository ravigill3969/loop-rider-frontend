import { Loader2 } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { useWebsocket } from "./WebSocketContext";

interface WaitingContextT {
  open: boolean;
  updateShow: (val: boolean) => void;
}

const WaitingContext = createContext<WaitingContextT | undefined>(undefined);

export function WaitingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { connected, receivedText } = useWebsocket();

  function updateShow(val: boolean) {
    setOpen(val);
  }

  return (
    <WaitingContext.Provider value={{ open, updateShow }}>
      {children}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-gray-900">{ connected == false  ? "trying to connect" : receivedText}</p>
          </div>
        </div>
      )}
    </WaitingContext.Provider>
  );
}

export function useWaiting() {
  const ctx = useContext(WaitingContext);
  if (!ctx) {
    throw new Error("useWaiting must be used inside WaitingContextProvider");
  }
  return ctx;
}
