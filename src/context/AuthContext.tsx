// contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { useGetRiderInfo } from "@/api/auth-api";
import { backend_domain } from "@/global/env";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  birth_month: string;
  birth_year: number;
  updated_at: number;
  created_at: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => Promise<unknown>;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Fetch user info
  const { data, isLoading, refetch, isError, isFetching } = useGetRiderInfo();

  const currentUser = data?.user ?? user;

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  useEffect(() => {
    if (isError && !isLoading) {
      setUser(null);
      navigate("/login");
    }
  }, [isError, isLoading, navigate]);

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : (userData as User)));
  };

  const logout = async () => {
    try {
      await fetch(`${backend_domain}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isLoading: isLoading || isFetching,
        isAuthenticated: !!currentUser,
        refetchUser: refetch,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
