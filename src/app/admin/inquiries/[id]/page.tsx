"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, User, CheckCircle, Clock, Archive, Reply } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { inquiriesApi, ApiInquiry } from "@/lib/services";
import { toast } from "sonner";

export default function InquiryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: inquiryId } = use(params);
  const [inquiry, setInquiry] = useState<ApiInquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    inquiriesApi.get(inquiryId)
      .then((data) => {
        setInquiry(data);
        // Auto-mark as IN_REVIEW when admin opens it for the first time
        if (data.status === "NEW") {
          inquiriesApi.updateStatus(inquiryId, "IN_REVIEW").then(() => {
            setInquiry((prev) => prev ? { ...prev, status: "IN_REVIEW" } : null);
          }).catch(() => {});
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [inquiryId]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    try {
      await inquiriesApi.updateStatus(inquiryId, newStatus);
      toast.success("Inquiry status updated");
      setInquiry(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      // Revert selection by re-fetching or we could just leave it
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

  if (!inquiry) {
    return <div className="text-white/50 py-20 text-center">Inquiry not found</div>;
  }

  const typeLabel =
    inquiry.type === "PUBLISH_WITH_US"
      ? "Publishing Request"
      : inquiry.type === "AUTHOR_INQUIRY"
      ? "Author Inquiry"
      : inquiry.type === "COLLABORATION"
      ? "Collaboration"
      : inquiry.type === "ORDER_SUPPORT"
      ? "Order Support"
      : inquiry.type === "PRODUCT"
      ? "Product Inquiry"
      : inquiry.type === "OTHER"
      ? "Other"
      : "General Inquiry";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/inquiries" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-serif text-[var(--ivory)]">Inquiry Details</h2>
            <p className="text-sm text-white/50">{inquiryId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a href={`mailto:${inquiry.email}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 rounded-md text-sm font-medium hover:bg-[var(--gold)]/20 transition-colors shrink-0">
            <Reply size={16} /> Reply via Email
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          
          <DashboardCard title="Submission Message">
            <div className="p-6 space-y-6">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Message Body</div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-white/80 leading-relaxed whitespace-pre-wrap">
                  {inquiry.message}
                </div>
              </div>
            </div>
          </DashboardCard>

        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-1">
          
          <DashboardCard title="Contact Information">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{inquiry.name}</div>
                  <div className="text-xs text-white/50">Sender</div>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <Mail size={16} className="text-white/40" />
                  <a href={`mailto:${inquiry.email}`} className="hover:text-[var(--gold)] transition-colors">{inquiry.email}</a>
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Phone size={16} className="text-white/40" />
                    <a href={`tel:${inquiry.phone}`} className="hover:text-[var(--gold)] transition-colors">{inquiry.phone}</a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <Calendar size={16} className="text-white/40" />
                  {new Date(inquiry.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Status Management">
            <div className="p-6 space-y-4">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Status</div>
              <select 
                value={inquiry.status} 
                onChange={handleStatusChange}
                className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
              >
                <option value="NEW">New</option>
                <option value="IN_REVIEW">Read</option>
                <option value="RESOLVED">Replied</option>
                <option value="CLOSED">Archived</option>
              </select>

              <div className="pt-4 border-t border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Inquiry Type</div>
                <div className="inline-flex items-center text-xs font-medium text-blue-400">
                  {typeLabel}
                </div>
              </div>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}
