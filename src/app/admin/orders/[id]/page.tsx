"use client";

import Link from "next/link";
import { ArrowLeft, Save, Truck, Package, CreditCard, MapPin, User, ShoppingCart } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useEffect, useState, use } from "react";
import { ordersApi, ApiOrder, trackingApi } from "@/lib/services";
import { toast } from "sonner";

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Only tracking URL
  const [trackingUrl, setTrackingUrl] = useState("");

  useEffect(() => {
    ordersApi.adminGet(orderId)
      .then((data) => {
        setOrder(data);
        if ((data as any).tracking) {
          setTrackingUrl((data as any).tracking.trackingUrl || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const handleSaveTracking = async () => {
    try {
      await trackingApi.adminUpdate(orderId, { trackingUrl });
      toast.success("Tracking link saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save tracking link");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center py-20 text-white/50">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-white/50 py-20 text-center">Order not found</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-serif text-[var(--ivory)] flex items-center gap-3">
              Order {order.orderNumber || orderId.slice(0,8).toUpperCase()}
              <StatusBadge status={order.status} type={
                ["COMPLETED", "DELIVERED"].includes(order.status.toUpperCase()) ? "completed" :
                ["PROCESSING", "CONFIRMED"].includes(order.status.toUpperCase()) ? "processing" :
                order.status.toUpperCase() === "SHIPPED" ? "shipped" :
                ["CANCELLED", "REFUNDED"].includes(order.status.toUpperCase()) ? "cancelled" : "pending"
              } />
            </h2>
            <p className="text-sm text-white/50">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Customer, Address, Payment */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Details */}
          <DashboardCard title="Customer Details" action={<User size={18} className="text-white/40" />}>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Name</div>
                <div className="text-white font-medium">{((order as any).user || order.customer)?.name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Email</div>
                <div className="text-blue-400 hover:underline">{((order as any).user || order.customer)?.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Phone</div>
                <div className="text-white">{((order as any).user || order.customer)?.phone || "—"}</div>
              </div>
            </div>
          </DashboardCard>

          {/* Shipping Address */}
          <DashboardCard title="Shipping Address" action={<MapPin size={18} className="text-white/40" />}>
            <div className="p-6 space-y-1 text-sm text-white/80">
              <p className="font-medium text-white text-base mb-2">{((order as any).address || order.shippingAddress)?.fullName || ((order as any).address || order.shippingAddress)?.name || "Customer"}</p>
              <p>{((order as any).address || order.shippingAddress)?.line1 || ((order as any).address || order.shippingAddress)?.address1}</p>
              {(((order as any).address || order.shippingAddress)?.line2 || ((order as any).address || order.shippingAddress)?.address2) && (
                <p>{((order as any).address || order.shippingAddress)?.line2 || ((order as any).address || order.shippingAddress)?.address2}</p>
              )}
              <p>{((order as any).address || order.shippingAddress)?.city}, {((order as any).address || order.shippingAddress)?.state} - {((order as any).address || order.shippingAddress)?.postalCode || ((order as any).address || order.shippingAddress)?.pincode}</p>
              <p>{((order as any).address || order.shippingAddress)?.country || "India"}</p>
              <p className="mt-4 pt-4 border-t border-white/5">Phone: {((order as any).address || order.shippingAddress)?.phone}</p>
            </div>
          </DashboardCard>

          {/* Payment Info */}
          <DashboardCard title="Payment Information" action={<CreditCard size={18} className="text-white/40" />}>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Payment Method</span>
                <span className="text-white text-sm font-medium">{(order as any).paymentMethod || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Transaction ID</span>
                <span className="text-white text-sm font-mono">{(order as any).paymentIntentId || "—"}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-white font-medium">Total Amount</span>
                <span className="text-[var(--gold)] font-bold text-lg">₹{Number((order as any).total ?? order.totalAmount ?? 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Column: Ordered Products & Tracking */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Tracking Link */}
          <DashboardCard title="Shipment Tracking" action={<Truck size={18} className="text-[var(--gold)]" />} className="border border-[var(--gold)]/20 shadow-[0_4px_30px_rgba(212,175,55,0.05)]">
            <div className="p-6">
              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-lg space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Tracking URL</label>
                  <input 
                    type="url" 
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.courier.com/..." 
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" 
                  />
                </div>
                <div className="flex items-center gap-3 justify-end pt-2 border-t border-white/5">
                  <button 
                    onClick={() => setTrackingUrl("")}
                    className="px-5 py-2.5 border border-white/10 text-white/70 rounded-md text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={handleSaveTracking}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg"
                  >
                    <Save size={16} /> Save Tracking Link
                  </button>
                </div>
                <p className="text-xs text-white/40 text-center">Saving the tracking link will make it available in the customer&apos;s account dashboard.</p>
              </div>
            </div>
          </DashboardCard>

          {/* Ordered Products */}
          <DashboardCard title="Ordered Products" action={<Package size={18} className="text-white/40" />}>
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-white/5 border border-white/10 rounded flex-shrink-0 flex items-center justify-center">
                        <ShoppingCart size={20} className="text-white/20" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{item.productName}</h4>
                        {item.sizeLabel && <p className="text-xs text-white/50 mt-1">Size: {item.sizeLabel}</p>}
                        <p className="text-sm text-white/70 mt-1">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium text-lg">₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}
