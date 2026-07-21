"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload, Music, Image as ImageIcon } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [enableQR, setEnableQR] = useState(true); // Default checked for edit mockup
  const { id: bookId } = use(params);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/books/${bookId}`} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-serif text-[var(--ivory)]">Edit Book</h2>
            <p className="text-sm text-white/50">Update details for The Cosmic Journey.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/admin/books/${bookId}`} className="flex-1 sm:flex-none px-4 py-2 border border-white/10 text-white/70 rounded-md text-sm font-medium hover:bg-white/5 transition-colors text-center">
            Cancel
          </Link>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {["Basic Information", "Cover Image", "QR Song"].map((tab) => {
            const tabId = tab.toLowerCase().split(" ")[0];
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tabId
                    ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Basic Information */}
          <div className={activeTab === "basic" ? "block" : "hidden"}>
            <DashboardCard title="Basic Information">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Book Title *</label>
                    <input type="text" defaultValue="The Cosmic Journey" className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Author *</label>
                    <select defaultValue="vinod" className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors">
                      <option value="vinod">Vinod Naraen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Genre</label>
                    <input type="text" defaultValue="Sci-Fi / Adventure" className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Publication Date</label>
                    <input type="date" defaultValue="2023-10-25" className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Short Description</label>
                  <textarea defaultValue="An epic tale exploring the depths of the universe and the human soul." rows={2} className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Description</label>
                  <textarea defaultValue="The Cosmic Journey takes readers on an unforgettable voyage across galaxies, testing the limits of hope, love, and existence itself." rows={6} className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none" />
                </div>

              </div>
            </DashboardCard>
          </div>

          {/* Cover Image */}
          <div className={activeTab === "cover" ? "block" : "hidden"}>
            <DashboardCard title="Cover Image">
              <div className="p-6">
                <div className="border-2 border-dashed border-[var(--gold)]/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors group relative overflow-hidden bg-white/5">
                  <div className="z-10 bg-[#080e1a] px-4 py-1 rounded-full border border-white/10 mb-2">
                    <span className="text-sm font-medium text-white">Cover_Image.jpg</span>
                  </div>
                  <span className="text-xs text-[var(--gold)] z-10 hover:underline">Change cover image</span>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* QR Song */}
          <div className={activeTab === "qr" ? "block" : "hidden"}>
            <DashboardCard title="QR Song Management">
              <div className="p-6 space-y-6">
                
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="enableQR" 
                    checked={enableQR}
                    onChange={(e) => setEnableQR(e.target.checked)}
                    className="rounded border-white/20 bg-black/20 text-[var(--gold)] focus:ring-[var(--gold)] w-5 h-5" 
                  />
                  <label htmlFor="enableQR" className="text-sm font-medium text-white cursor-pointer">Enable QR Song Feature for this book</label>
                </div>

                {enableQR && (
                  <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Song Title</label>
                        <input type="text" defaultValue="The Cosmic Theme" className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Audio / Music URL</label>
                        <input type="url" defaultValue="https://spotify.com/track/cosmic-theme-example" className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-sm font-medium text-white mb-3">QR Code Preview</h4>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-32 bg-white flex items-center justify-center rounded-lg p-2">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://spotify.com/track/cosmic-theme-example" alt="QR Code Preview" className="w-full h-full" />
                        </div>
                        <p className="text-sm text-white/50 max-w-xs">Scan this code to test the live redirection to your song URL.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </DashboardCard>
          </div>

        </div>
      </div>
    </div>
  );
}
