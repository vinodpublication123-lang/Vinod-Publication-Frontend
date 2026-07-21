"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Package, BookOpen, Users, ShoppingCart, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { productsApi, ordersApi, inquiriesApi, ApiOrder, ApiInquiry } from "@/lib/services";

interface Stats {
  totalProducts: number;
  publishedBooks: number;
  totalOrders: number;
  newInquiries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    publishedBooks: 0,
    totalOrders: 0,
    newInquiries: 0,
  });
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<ApiInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.allSettled([
      productsApi.list({ limit: 1 }),
      productsApi.list({ limit: 1, category: "BOOK" }),
      ordersApi.adminList({ limit: 5 }),
      inquiriesApi.list({ limit: 5, status: "NEW" }),
    ]).then((results) => {
      if (cancelled) return;

      const [productsAll, productsBooks, orders, inquiries] = results;

      setStats({
        totalProducts:
          productsAll.status === "fulfilled"
            ? productsAll.value.pagination.total
            : 0,
        publishedBooks:
          productsBooks.status === "fulfilled"
            ? productsBooks.value.pagination.total
            : 0,
        totalOrders:
          orders.status === "fulfilled" ? orders.value.pagination.total : 0,
        newInquiries:
          inquiries.status === "fulfilled"
            ? inquiries.value.pagination.total
            : 0,
      });

      if (orders.status === "fulfilled") {
        setRecentOrders(orders.value.items.slice(0, 3));
      }
      if (inquiries.status === "fulfilled") {
        setRecentInquiries(inquiries.value.items.slice(0, 3));
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function orderStatusType(
    s: string
  ): "pending" | "completed" | "processing" | "shipped" | "cancelled" {
    const m: Record<
      string,
      "pending" | "completed" | "processing" | "shipped" | "cancelled"
    > = {
      COMPLETED: "completed",
      DELIVERED: "completed",
      PROCESSING: "processing",
      CONFIRMED: "processing",
      SHIPPED: "shipped",
      CANCELLED: "cancelled",
      REFUNDED: "cancelled",
    };
    return m[s?.toUpperCase()] ?? "pending";
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)] mb-1">Overview</h2>
          <p className="text-sm text-white/50">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link
            href="/admin/products/new"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium text-white transition-colors"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Products"
          value={isLoading ? "—" : String(stats.totalProducts)}
          icon={Package}
          trend="Live"
          trendUp={true}
        />
        <StatCard
          title="Published Books"
          value={isLoading ? "—" : String(stats.publishedBooks)}
          icon={BookOpen}
          trend="Live"
          trendUp={true}
        />
        <StatCard
          title="Total Orders"
          value={isLoading ? "—" : String(stats.totalOrders)}
          icon={ShoppingCart}
          trend="Live"
          trendUp={true}
        />
        <StatCard
          title="New Inquiries"
          value={isLoading ? "—" : String(stats.newInquiries)}
          icon={MessageSquare}
          trend="Unread"
          trendUp={stats.newInquiries === 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <DashboardCard
          title="Recent Orders"
          className="lg:col-span-2"
          action={
            <Link
              href="/admin/orders"
              className="text-sm text-[var(--gold)] hover:underline"
            >
              View All
            </Link>
          }
        >
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-sm">
                No orders yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/[0.02] text-xs uppercase text-white/40 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white font-mono text-xs">
                        #{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          {((order as any).user || order.customer)?.name ?? "Guest"}
                        </div>
                        <div className="text-xs text-white/40">
                          {((order as any).user || order.customer)?.email ?? ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            order.status.charAt(0) +
                            order.status.slice(1).toLowerCase()
                          }
                          type={orderStatusType(order.status)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-white font-medium">
                        ₹{Number((order as any).total ?? order.totalAmount ?? 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DashboardCard>

        {/* Recent Inquiries */}
        <DashboardCard
          title="New Inquiries"
          action={
            <Link
              href="/admin/inquiries"
              className="text-sm text-[var(--gold)] hover:underline"
            >
              View All
            </Link>
          }
        >
          <div className="p-2">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : recentInquiries.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">
                No new inquiries.
              </div>
            ) : (
              recentInquiries.map((inquiry) => {
                const typeLabel =
                  inquiry.type === "PUBLISHING"
                    ? "Publishing"
                    : inquiry.type === "COLLABORATION"
                    ? "Collaboration"
                    : "General";
                return (
                  <Link
                    key={inquiry.id}
                    href={`/admin/inquiries/${inquiry.id}`}
                    className="block p-4 hover:bg-white/[0.02] rounded-lg transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-white">
                        {inquiry.name}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--gold)]/80 mb-1">
                      {typeLabel}
                    </div>
                    <div className="text-xs text-white/50">{inquiry.email}</div>
                  </Link>
                );
              })
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
