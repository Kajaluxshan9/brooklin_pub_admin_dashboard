import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import moment from "moment-timezone";
import { api } from "../utils/api";
import logger from "../utils/logger";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set timezone globally
moment.tz.setDefault("America/Toronto");

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch {
      logger.info("No active session");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      logger.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
