import { AccountLayout } from "@/components/account/AccountLayout";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]} redirectTo="/login">
      <AccountLayout>{children}</AccountLayout>
    </ProtectedRoute>
  );
}
