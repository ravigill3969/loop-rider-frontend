import { Loader2 } from "lucide-react";

function WaitingPopUp({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-gray-900">Please wait...</p>
      </div>
    </div>
  );
}

// Demo component
export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <WaitingPopUp open={true} />
      <p className="text-gray-600">Demo: Popup is currently showing</p>
    </div>
  );
}