import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./page/Login";
import "./App.css";
import RidePage from "./page/RidePage";
import Home from "./page/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./page/Profile";
import { AuthProvider } from "./context/AuthContext";
import { Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { WebSocketConextProvider } from "./context/WebSocketContext";
import { WaitingContextProvider } from "./context/WaitingContext";

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
                      <RidePage />
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
                  path="/close-tab"
                  element={
                    <ProtectedRoute>
                      <Profile />
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

  return <>{children}</>;
}
