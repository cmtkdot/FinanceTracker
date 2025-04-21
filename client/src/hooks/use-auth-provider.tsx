import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/auth/session");
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();
      
      // Update the user state from the response
      if (data.user) {
        setUser(data.user);
        // Immediately check auth status to ensure session is established
        await checkAuth();
        return data.user;
      } else {
        throw new Error("Login failed: User data not received");
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Login failed"));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error : new Error("Logout failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}