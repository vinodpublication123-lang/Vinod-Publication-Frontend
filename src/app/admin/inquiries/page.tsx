"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Eye, RefreshCw } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { inquiriesApi, ApiInquiry } from "@/lib/services";
import { toast } from "sonner";

type InquiryStatusType = "new" | "read" | "replied" | "archived";

function inquiryStatusType(s: string): InquiryStatusType {
  const m: Record<string, InquiryStatusType> = {
    NEW: "new",
    IN_REVIEW: "read",
    RESOLVED: "replied",
    CLOSED: "archived",
  };
  return m[s] ?? "archived";
}

const STATUS_FILTERS = ["All", "NEW", "IN_REVIEW", "RESOLVED", "CLOSED"];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<ApiInquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await inquiriesApi.list({
        status: activeFilter !== "All" ? activeFilter : undefined,
        limit: 50,
      });
      setInquiries(res.items);
      setTotal(res.pagination.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load inquiries"
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Client-side search filter (search is by name/email only since backend may not support it)
  const filtered = inquiries.filter((inq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)] mb-1">
            Inquiries &amp; Support
          </h2>
          <p className="text-sm text-white/50">
            {isLoading ? "Loading..." : `${total} submissions total`}
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          disabled={isLoading}
          className="p-2 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <DashboardCard title="All Inquiries">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40 mr-2 flex items-center gap-1">
              <Filter size={14} /> Filter:
            </span>
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  activeFilter === filter
                    ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                }`}
              >
                {filter === "All"
                  ? "All"
                  : filter === "NEW"
                  ? "New"
                  : filter === "IN_REVIEW"
                  ? "Read"
                  : filter === "RESOLVED"
                  ? "Replied"
                  : "Archived"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080e1a] border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/[0.02] text-xs uppercase text-white/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Contact Details</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Submission Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading &&
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No inquiries found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((inq) => {
                  const typeLabel =
                    inq.type === "PUBLISH_WITH_US"
                      ? "Publishing Request"
                      : inq.type === "AUTHOR_INQUIRY"
                      ? "Author Inquiry"
                      : inq.type === "COLLABORATION"
                      ? "Collaboration"
                      : inq.type === "ORDER_SUPPORT"
                      ? "Order Support"
                      : inq.type === "PRODUCT"
                      ? "Product Inquiry"
                      : inq.type === "OTHER"
                      ? "Other"
                      : "General Inquiry";

                  return (
                    <tr
                      key={inq.id}
                      className={`hover:bg-white/[0.02] transition-colors group ${
                        inq.status === "NEW" ? "bg-white/[0.01]" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 border border-white/10 text-sm font-medium">
                            {inq.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/inquiries/${inq.id}`}
                              className="font-medium text-white hover:text-[var(--gold)] transition-colors"
                            >
                              {inq.name}
                            </Link>
                            <div className="text-xs text-white/40">
                              {inq.email}
                              {inq.phone ? ` • ${inq.phone}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">{typeLabel}</td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            inq.status === "NEW"
                              ? "New"
                              : inq.status === "IN_REVIEW"
                              ? "Read"
                              : inq.status === "RESOLVED"
                              ? "Replied"
                              : "Archived"
                          }
                          type={inquiryStatusType(inq.status)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/inquiries/${inq.id}`}
                            className="p-2 bg-white/5 hover:bg-[var(--gold)]/20 hover:text-[var(--gold)] rounded-md transition-colors text-white/60"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
