"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ApiAuthor } from "@/lib/services";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import { TokenStorage } from "@/lib/auth/token";

async function fetchAuthors(limit = 50): Promise<{ items: ApiAuthor[]; total: number }> {
  const token = TokenStorage.getToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/authors?limit=${limit}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load authors");
  const body = await res.json();
  const data = body.data ?? body;
  return { items: data.items ?? data, total: data.pagination?.total ?? (data.items ?? data).length };
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<ApiAuthor[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { items, total } = await fetchAuthors();
      setAuthors(items);
      setTotal(total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load authors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = authors.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q);
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Active" && a.status === "ACTIVE") ||
      (activeFilter === "Inactive" && a.status !== "ACTIVE");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)] mb-1">Authors Management</h2>
          <p className="text-sm text-white/50">
            {isLoading ? "Loading..." : `${total} authors total`}
          </p>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="p-2 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <DashboardCard title="All Authors">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40 mr-2 flex items-center gap-1">
              <Filter size={14} /> Filter:
            </span>
            {["All", "Active", "Inactive"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  activeFilter === filter
                    ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search authors..."
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
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading &&
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(3)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-white/40">
                    No authors found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((author) => (
                  <tr key={author.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                          {author.avatarUrl ? (
                            <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white/50 font-medium text-sm">
                              {author.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{author.name}</div>
                          <div className="text-xs text-white/40">{author.shortBio ?? author.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={author.status === "ACTIVE" ? "Active" : author.status === "DRAFT" ? "Draft" : "Archived"}
                        type={author.status === "ACTIVE" ? "success" : "neutral"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/authors/${author.id}`}
                          className="p-2 bg-white/5 hover:bg-[var(--gold)]/20 hover:text-[var(--gold)] rounded-md transition-colors text-white/60"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
