import { Metadata } from "next";
import { AdminWrapper } from "@/components/admin/AdminWrapper";

export const metadata: Metadata = {
  title: "Admin Dashboard | VINVERSE",
  description: "VINVERSE internal management platform",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminWrapper>{children}</AdminWrapper>;
}
