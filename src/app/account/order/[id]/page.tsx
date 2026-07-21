"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Package, ShoppingCart } from "lucide-react";
import { useEffect, useState, use } from "react";
import { ordersApi } from "@/lib/services";
import { ApiOrder } from "@/lib/services";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.myOrder(id)
      .then((data) => setOrder(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Link href="/account/orders" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl font-serif text-[var(--ivory)]">Order Details</h2>
        </div>
        <div className="flex justify-center py-20 text-white/50">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Link href="/account/orders" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl font-serif text-[var(--ivory)]">Order Details</h2>
        </div>
        <div className="text-center py-20 text-white/50">Order not found.</div>
      </div>
    );
  }

  const trackingData = (order as any).tracking;
  const trackingLink = trackingData?.trackingUrl || null;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/account/orders" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-serif text-[var(--ivory)]">Order Details</h2>
      </div>

      {/* Header Info */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-wrap gap-8 justify-between items-center">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Order Number</div>
          <div className="text-lg text-white font-medium">{order.orderNumber || order.id}</div>
        </div>
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Order Date</div>
          <div className="text-white">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Amount</div>
          <div className="text-[var(--gold)] font-medium text-lg">₹{(order as any).total ?? order.totalAmount ?? 0}</div>
        </div>
      </div>

      {/* Tracking Section */}
      <div className="bg-[#0c1427] border border-[var(--gold)]/20 rounded-xl p-6">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Package size={18} className="text-[var(--gold)]" />
          Shipping Information
        </h3>
        
        {trackingLink ? (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
            <div>
              <div className="text-[var(--gold)] font-medium mb-1">Tracking Available</div>
              <p className="text-sm text-white/50 mb-2">Your order is on the way. You can track your shipment below.</p>
              {trackingData?.courierName && trackingData?.trackingNumber && (
                <p className="text-sm text-white/70">
                  <span className="text-white/40 uppercase text-xs tracking-wider">Courier:</span> {trackingData.courierName} &nbsp;|&nbsp; 
                  <span className="text-white/40 uppercase text-xs tracking-wider"> Tracking No:</span> <span className="font-mono">{trackingData.trackingNumber}</span>
                </p>
              )}
            </div>
            <a 
              href={trackingLink} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#080e1a] font-bold text-sm rounded-md hover:bg-[var(--gold-light)] transition-colors shrink-0"
            >
              Track Shipment <ExternalLink size={16} />
            </a>
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-center">
            <p className="text-sm text-white/70">Shipment information will appear once your order has been dispatched.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-semibold text-white">Items Ordered</h3>
          </div>
          <div className="p-6 space-y-6">
            {order.items && order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-24 bg-white/5 rounded-lg shrink-0 flex items-center justify-center">
                  <ShoppingCart size={24} className="text-white/20" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-medium">{item.productName}</h4>
                    <span className="text-white">₹{item.unitPrice}</span>
                  </div>
                  {(item as any).sizeLabel && (
                    <div className="text-sm text-white/50 mt-1">Size/Option: {(item as any).sizeLabel}</div>
                  )}
                  <div className="text-sm text-white/50 mt-1">Qty: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address summary */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden h-fit">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-semibold text-white">Shipping Address</h3>
          </div>
          <div className="p-6 text-sm text-white/70 space-y-1">
            <p className="font-medium text-white text-base mb-2">{(order as any).address?.fullName || (order as any).address?.name || "Customer"}</p>
            <p>{(order as any).address?.line1 || (order as any).address?.address1}</p>
            {((order as any).address?.line2 || (order as any).address?.address2) && (
              <p>{(order as any).address?.line2 || (order as any).address?.address2}</p>
            )}
            <p>{(order as any).address?.city}, {(order as any).address?.state} - {(order as any).address?.postalCode || (order as any).address?.pincode}</p>
            <p>{(order as any).address?.country || "India"}</p>
            <p className="mt-4 pt-4 border-t border-white/5">Phone: {(order as any).address?.phone}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
