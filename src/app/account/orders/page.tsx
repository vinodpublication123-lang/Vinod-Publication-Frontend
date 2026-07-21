"use client";

import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/services";
import { ApiOrder } from "@/lib/services";

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.myOrders()
      .then((res) => setOrders(res.items))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif text-[var(--ivory)]">My Orders</h2>
        </div>
        <div className="flex justify-center py-20 text-white/50">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-[var(--ivory)]">My Orders</h2>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/30">
              <ShoppingCart size={32} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Orders Yet</h3>
            <p className="text-sm text-white/50 max-w-md mb-6">You haven&apos;t placed any orders yet. Discover our latest collection of books and apparel in the store.</p>
            <Link href="/#store" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => {
          let statusColor = "text-white/50 bg-white/10";
          if (order.status === "Shipped") statusColor = "text-blue-400 bg-blue-500/10";
          if (order.status === "Delivered") statusColor = "text-emerald-400 bg-emerald-500/10";
          if (order.status === "Processing") statusColor = "text-amber-400 bg-amber-500/10";

          return (
            <div key={order.id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
              <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-black/20">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Order Placed</div>
                    <div className="text-sm text-white">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Amount</div>
                    <div className="text-sm text-white">₹{(order as any).total ?? order.totalAmount ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Order Number</div>
                    <div className="text-sm text-white">{order.orderNumber || order.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border border-current ${statusColor}`}>
                    {order.status}
                  </span>
                  <Link 
                    href={`/account/order/${order.id}`}
                    className="flex items-center gap-1 text-sm text-[var(--gold)] hover:underline"
                  >
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {order.items && order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm text-white/70">
                      <div className="w-12 h-16 bg-white/5 rounded flex-shrink-0 flex items-center justify-center">
                        <ShoppingCart size={16} className="text-white/20" />
                      </div>
                      <div className="flex flex-col">
                        <span>{item.productName}</span>
                        <span className="text-xs text-white/40">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
