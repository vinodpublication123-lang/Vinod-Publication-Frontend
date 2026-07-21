"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, AlertCircle, Music, Book, CheckCircle, Clock, Eye } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/books" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif text-[var(--ivory)]">The Cosmic Journey</h2>
              <StatusBadge status="Published" type="success" />
            </div>
            <p className="text-sm text-white/50">{bookId} • Added Oct 25, 2023</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
            <Eye size={16} /> Live Preview
          </button>
          <Link href={`/admin/books/${bookId}/edit`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 rounded-md text-sm font-medium hover:bg-[var(--gold)]/20 transition-colors shrink-0">
            <Edit size={16} /> Edit Book
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Basic Info */}
          <DashboardCard title="Book Information">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Title</div>
                  <div className="text-white font-medium text-lg">The Cosmic Journey</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Author</div>
                  <div className="text-white">Vinod Naraen</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Genre</div>
                  <div className="text-white">Sci-Fi / Adventure</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Publication Date</div>
                  <div className="text-white">October 25, 2023</div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Synopsis</div>
                <p className="text-white/80 text-sm leading-relaxed">
                  An epic tale exploring the depths of the universe and the human soul. The Cosmic Journey takes readers on an unforgettable voyage across galaxies, testing the limits of hope, love, and existence itself.
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* QR Song Section */}
          <DashboardCard title="QR Song Link" action={<Music size={18} className="text-white/40" />}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">QR Song Enabled</h4>
                    <p className="text-xs text-white/50">This book has an active song link.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Song Title</div>
                <div className="text-white font-medium mb-4">The Cosmic Theme</div>
                
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Destination URL</div>
                <div className="text-blue-400 text-sm truncate">https://spotify.com/track/cosmic-theme-example</div>
              </div>
            </div>
          </DashboardCard>

        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Cover Card */}
          <DashboardCard title="Cover Image" action={<Book size={18} className="text-white/40" />}>
            <div className="p-6 space-y-4 flex flex-col items-center">
              <div className="aspect-[2/3] w-48 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                <Book className="w-12 h-12 text-white/20" />
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Primary Cover</div>
            </div>
          </DashboardCard>

          {/* Quick Visibility */}
          <DashboardCard title="Visibility">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">Published</div>
                  <div className="text-xs text-white/50">Visible on website portfolio</div>
                </div>
              </div>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}
