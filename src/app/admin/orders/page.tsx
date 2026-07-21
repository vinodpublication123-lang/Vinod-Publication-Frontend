"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Filter } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ordersApi, ApiOrder } from "@/lib/services";
import { toast } from "sonner";

type OrderStatus = "pending" | "completed" | "processing" | "shipped" | "cancelled";

function statusType(s: string): OrderStatus {
  const m: Record<string, OrderStatus> = {
    COMPLETED: "completed",
    DELIVERED: "completed",
    PROCESSING: "processing",
    CONFIRMED: "processing",
    SHIPPED: "shipped",
    CANCELLED: "cancelled",
    REFUNDED: "cancelled",
  };
  return m[s.toUpperCase()] ?? "pending";
}

const STATUS_FILTERS = ["All", "PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.adminList({
        status: activeFilter !== "All" ? activeFilter : undefined,
        limit: 50,
      });
      setOrders(res.items);
      setTotal(res.pagination.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns: Column<ApiOrder>[] = [
    {
      header: "Order ID",
      accessorKey: "id",
      cell: (row: ApiOrder) => (
        <div>
          <div className="font-medium text-white font-mono text-xs">
            #{row.orderNumber ?? row.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-xs text-white/40">
            {new Date(row.createdAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer",
      cell: (row: ApiOrder) => {
        const cust = row.customer || (row as any).user;
        return (
          <div>
            <div className="font-medium text-white/90">
              {cust?.name ?? "—"}
            </div>
            <div className="text-xs text-white/40">{cust?.email ?? ""}</div>
          </div>
        );
      },
    },
    {
      header: "Items",
      accessorKey: "items",
      cell: (row: ApiOrder) => (
        <div className="text-sm text-white/70">
          {row.items?.length ?? 0} item{(row.items?.length ?? 0) !== 1 ? "s" : ""}
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (row: ApiOrder) => {
        const val = (row as any).total ?? row.totalAmount ?? 0;
        return (
          <span className="text-white font-medium">
            ₹{Number(val).toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: ApiOrder) => (
        <StatusBadge status={row.status} type={statusType(row.status)} />
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      className: "text-right",
      cell: (row: ApiOrder) => (
        <div className="flex justify-end items-center gap-3">
          <Link
            href={`/admin/orders/${row.id}`}
            className="text-sm text-[var(--gold)] hover:underline font-medium"
          >
            Manage
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)] mb-1">
            Orders Management
          </h2>
          <p className="text-sm text-white/50">
            {isLoading ? "Loading..." : `${total} orders total`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="p-2 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Status filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-white/40 flex items-center gap-1">
          <Filter size={14} /> Status:
        </span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              activeFilter === f
                ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
            }`}
          >
            {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <DashboardCard title="All Orders">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-white/40">No orders found.</div>
        ) : (
          <DataTable columns={columns} data={orders} />
        )}
      </DashboardCard>
    </div>
  );
}
