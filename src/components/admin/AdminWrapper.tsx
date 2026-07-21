"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Do not apply the admin layout or protection to the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/admin/login">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
