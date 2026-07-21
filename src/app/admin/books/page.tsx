"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { booksApi, ApiBook } from "@/lib/services";
import { toast } from "sonner";

export default function BooksPage() {
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await booksApi.list({ limit: 50 });
      setBooks(res.items);
      setTotal(res.pagination.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filtered = books.filter((book) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      book.title.toLowerCase().includes(q) ||
      (book.author?.name ?? "").toLowerCase().includes(q);
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "QR Enabled" && book.qrEnabled);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)] mb-1">Books Management</h2>
          <p className="text-sm text-white/50">
            {isLoading ? "Loading..." : `${total} books total`}
          </p>
        </div>
        <button
          onClick={fetchBooks}
          disabled={isLoading}
          className="p-2 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <DashboardCard title="All Books">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40 mr-2 flex items-center gap-1">
              <Filter size={14} /> Filter:
            </span>
            {["All", "QR Enabled"].map((filter) => (
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
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search books..."
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
                <th className="px-6 py-4 font-medium">Book</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Genre</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">QR Song</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading &&
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No books found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-12 rounded bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-b from-white/10 to-transparent" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{book.title}</div>
                          <div className="text-xs text-white/40">{book.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{book.author?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-white/60">{book.genre ?? "—"}</td>
                    <td className="px-6 py-4 text-white/60">
                      {book.publicationDate
                        ? new Date(book.publicationDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={book.qrEnabled ? "Enabled" : "Disabled"}
                        type={book.qrEnabled ? "enabled" : "disabled"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${book.product?.id || book.id}`}
                          className="p-2 bg-white/5 hover:bg-[var(--gold)]/20 hover:text-[var(--gold)] rounded-md transition-colors text-white/60"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/products/${book.product?.id || book.id}/edit`}
                          className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-md transition-colors text-white/60"
                        >
                          <Edit size={16} />
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
