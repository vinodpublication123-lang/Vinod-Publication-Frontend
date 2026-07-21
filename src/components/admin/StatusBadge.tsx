"use client";

import { 
  CheckCircle, Warning, XCircle, Info, MinusCircle, 
  Envelope, EnvelopeOpen, PaperPlaneRight, Archive, 
  Truck, Package, Clock, Prohibit, PencilSimple, Globe 
} from "@phosphor-icons/react";

export type StatusType = 
  | "success" | "warning" | "error" | "info" | "neutral"
  | "new" | "read" | "replied" | "archived"
  | "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled" | "completed"
  | "active" | "draft" | "out-of-stock" | "low-stock" | "published"
  | "enabled" | "disabled";

interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const styles: Record<StatusType, string> = {
    // Generic
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-red-400",
    info: "text-blue-400",
    neutral: "text-white/60",
    // Inquiries
    new: "text-emerald-400",
    read: "text-blue-400",
    replied: "text-[#d4af37]",
    archived: "text-white/50",
    // Orders
    pending: "text-white/60",
    processing: "text-amber-400",
    packed: "text-blue-400",
    shipped: "text-blue-400",
    delivered: "text-emerald-400",
    cancelled: "text-red-400",
    completed: "text-emerald-400",
    // Products/Books
    active: "text-emerald-400",
    draft: "text-white/60",
    "out-of-stock": "text-red-400",
    "low-stock": "text-amber-400",
    published: "text-emerald-400",
    // QR
    enabled: "text-emerald-400",
    disabled: "text-white/60",
  };

  const IconComponent: Record<StatusType, any> = {
    // Generic
    success: CheckCircle,
    warning: Warning,
    error: XCircle,
    info: Info,
    neutral: MinusCircle,
    // Inquiries
    new: Envelope,
    read: EnvelopeOpen,
    replied: PaperPlaneRight,
    archived: Archive,
    // Orders
    pending: Clock,
    processing: Package,
    packed: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: Prohibit,
    completed: CheckCircle,
    // Products/Books
    active: CheckCircle,
    draft: PencilSimple,
    "out-of-stock": XCircle,
    "low-stock": Warning,
    published: Globe,
    // QR
    enabled: CheckCircle,
    disabled: MinusCircle,
  };

  const Icon = IconComponent[type] || Info;
  const colorClass = styles[type] || "text-white/60";

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colorClass}`}>
      <Icon size={14} weight="fill" />
      {status}
    </span>
  );
}
