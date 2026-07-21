"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthState } from "@/lib/auth/types";
import { TokenStorage } from "@/lib/auth/token";
import { authService } from "@/lib/auth/authService";
import { useRouter } from "next/navigation";

interface AuthContextType extends AuthState {
  login: typeof authService.login;
  register: typeof authService.register;
  logout: (redirectTo?: string) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      // DEV BYPASS — set token "dev-bypass-token" manually to skip the server
      if (process.env.NODE_ENV === "development" && token === "dev-bypass-token") {
        setUser({
          id: "dev-admin-bypass",
          name: "Dev Admin",
          email: "dev@admin.com",
          role: "ADMIN",
        });
        return;
      }

      const { user: fetchedUser } = await authService.getMe();
      setUser(fetchedUser);
    } catch (error) {
      // Intentionally not logging the raw error object to prevent Next.js dev overlay from hijacking it
      console.warn("Session expired or invalid token. Clearing auth state.");
      TokenStorage.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: typeof authService.login = async (credentials) => {
    // DEV BYPASS
    if (
      process.env.NODE_ENV === "development" &&
      credentials.email === "dev@admin.com"
    ) {
      const devUser: User = {
        id: "dev-admin-bypass",
        name: "Dev Admin",
        email: "dev@admin.com",
        role: "ADMIN",
      };
      TokenStorage.setToken("dev-bypass-token");
      setUser(devUser);
      return { token: "dev-bypass-token", user: devUser };
    }

    const data = await authService.login(credentials);
    TokenStorage.setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register: typeof authService.register = async (data) => {
    const res = await authService.register(data);
    TokenStorage.setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = (redirectTo: string = "/login") => {
    authService.logout();
    setUser(null);
    router.push(redirectTo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
