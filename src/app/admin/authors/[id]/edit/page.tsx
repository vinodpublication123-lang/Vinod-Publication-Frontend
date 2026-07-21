"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { authorsApi, ApiAuthor } from "@/lib/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState("basic");
  const { id: authorId } = use(params);
  const router = useRouter();

  const [author, setAuthor] = useState<ApiAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [avatarUrl, setAvatarUrl] = useState("");

  const pickImage = (onPicked: (url: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => onPicked(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  useEffect(() => {
    authorsApi.get(authorId)
      .then((data) => {
        setAuthor(data);
        setName(data.name || "");
        setShortBio(data.shortBio || "");
        setStatus(data.status || "ACTIVE");
        setAvatarUrl(data.avatarUrl || "");
      })
      .catch((err) => {
        toast.error("Failed to load author");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [authorId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authorsApi.update(authorId, {
        name,
        shortBio,
        status,
        avatarUrl: avatarUrl || null,
      });
      toast.success("Author updated successfully");
      router.push(`/admin/authors/${authorId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update author");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-white/50">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!author) {
    return <div className="text-white/50 py-20 text-center">Author not found</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/authors/${authorId}`} className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-serif text-[var(--ivory)]">Edit Author</h2>
            <p className="text-sm text-white/50">Update profile for {name}.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/admin/authors/${authorId}`} className="flex-1 sm:flex-none px-4 py-2 border border-white/10 text-white/70 rounded-md text-sm font-medium hover:bg-white/5 transition-colors text-center">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-[#080e1a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {["Basic Information", "Author Photo"].map((tab) => {
            const tabId = tab.toLowerCase().split(" ")[0];
            return (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tabId
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
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Author Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Bio</label>
                  <textarea
                    value={shortBio}
                    onChange={(e) => setShortBio(e.target.value)}
                    rows={6}
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Cover Image */}
          <div className={activeTab === "author" ? "block" : "hidden"}>
            <DashboardCard title="Author Photo">
              <div className="p-6">
                <button
                  type="button"
                  onClick={() => pickImage(setAvatarUrl)}
                  className="w-full border-2 border-dashed border-[var(--gold)]/50 bg-white/5 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors group"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-24 h-24 rounded-full object-cover mb-3" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#080e1a] border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[var(--gold)]/10 transition-colors relative overflow-hidden">
                      <Upload size={28} className="text-white/40 group-hover:text-[var(--gold)] transition-colors" />
                    </div>
                  )}
                  <span className="text-base font-medium text-white mb-1">
                    {avatarUrl ? "Click to change photo" : "Click to upload profile photo"}
                  </span>
                  <span className="text-sm text-[var(--gold)] hover:underline">Change photo from device</span>
                </button>
              </div>
            </DashboardCard>
          </div>

        </div>
      </div>
    </div>
  );
}
