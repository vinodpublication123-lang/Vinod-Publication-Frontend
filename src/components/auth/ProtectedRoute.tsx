"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { UserRole } from "@/lib/auth/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // User is authenticated but doesn't have the right role
        // Redirect them based on their actual role
        if (user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080e1a]">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null; // Return null while redirecting
  }

  return <>{children}</>;
}
