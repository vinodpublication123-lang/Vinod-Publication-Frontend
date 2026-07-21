"use client";

import Link from "next/link";
import { Package, User, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect, useState } from "react";
import { ordersApi, ApiOrder } from "@/lib/services";

export default function AccountDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setOrdersLoading(true);
    ordersApi
      .myOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.items.slice(0, 3));
      })
      .catch(() => {
        // silently ignore — user sees empty state
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8">
        <h2 className="text-2xl font-serif text-[var(--ivory)] mb-2">
          Welcome back, {user?.name ?? "there"}!
        </h2>
        <p className="text-white/50 text-sm">
          From your account dashboard you can view your recent orders and edit
          your password and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders Overview */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Package size={18} className="text-[var(--gold)]" />
              Recent Orders
            </h3>
            <Link
              href="/account/orders"
              className="text-xs text-[var(--gold)] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-4">
            {ordersLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-4 text-center text-white/50 text-sm">
                <p>You haven&apos;t placed any orders recently.</p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/order/${order.id}`}
                    className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="text-white text-sm font-mono">
                        #{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-white/40">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-medium">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-[var(--gold)]/80 capitalize">
                        {order.status.toLowerCase()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <User size={18} className="text-[var(--gold)]" />
              Profile Summary
            </h3>
            <Link
              href="/account/profile"
              className="text-xs text-[var(--gold)] hover:underline"
            >
              Edit Profile
            </Link>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Name</div>
              <div className="text-white">{user?.name ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Email</div>
              <div className="text-white">{user?.email ?? "—"}</div>
            </div>
            {user?.phone && (
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Phone</div>
                <div className="text-white">{user.phone}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Account Type</div>
              <div className="text-[var(--gold)] text-sm font-medium capitalize">
                {user?.role?.toLowerCase() ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
