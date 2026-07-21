"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { productsApi, ApiProduct } from "@/lib/services";
import { toast } from "sonner";

type StatusType = "active" | "draft" | "out-of-stock" | "low-stock" | "archived";

function getStatusType(status: string, stock: number): StatusType {
  if (status === "ACTIVE" && stock === 0) return "out-of-stock";
  if (status === "ACTIVE" && stock > 0 && stock < 10) return "low-stock";
  if (status === "ACTIVE") return "active";
  if (status === "ARCHIVED") return "archived";
  return "draft";
}

function getStatusLabel(status: string, stock: number): string {
  if (status === "ACTIVE" && stock === 0) return "Out of Stock";
  if (status === "ACTIVE" && stock > 0 && stock < 10) return "Low Stock";
  if (status === "ACTIVE") return "Active";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

const FILTERS = ["All", "BOOK", "APPAREL", "MERCHANDISE"];

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.list({
        search: searchQuery || undefined,
        category: activeFilter !== "All" ? activeFilter : undefined,
        limit: 50,
      });
      setProducts(res.items);
      setTotal(res.pagination.total);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load products"
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, searchQuery]);

  const handleDelete = (product: ApiProduct) => {
    setDeleteTarget(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)] mb-1">
            Products Management
          </h2>
          <p className="text-sm text-white/50">
            {isLoading ? "Loading..." : `${total} products in total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="p-2 rounded-md border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <DashboardCard title="All Products">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40 mr-2 flex items-center gap-1">
              <Filter size={14} /> Filter:
            </span>
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  activeFilter === filter
                    ? "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                }`}
              >
                {filter === "All" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search products..."
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
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading &&
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    No products found.{" "}
                    <Link href="/admin/products/new" className="text-[var(--gold)] hover:underline">
                      Add your first product.
                    </Link>
                  </td>
                </tr>
              )}

              {!isLoading &&
                products.map((product) => {
                  let stock = product.globalStock ?? 0;
                  if (product.category === "APPAREL" && product.variants && product.variants.length > 0) {
                    stock = product.variants.reduce((sum, v) => sum + (v.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0), 0);
                  } else if (product.sizes?.length > 0) {
                    stock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
                  }
                  const statusType = getStatusType(product.status, stock);
                  const statusLabel = getStatusLabel(product.status, stock);
                  const img =
                    product.primaryImage ??
                    product.book?.coverUrl ??
                    product.galleryImages?.[0];
                  const priceDisplay = `₹${(product.salePrice ?? product.price).toLocaleString("en-IN")}`;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                            {img ? (
                              <img
                                src={img}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-medium text-white hover:text-[var(--gold)] transition-colors"
                            >
                              {product.name}
                            </Link>
                            <div className="text-xs text-white/40">{product.sku ?? product.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize">{product.category.toLowerCase()}</td>
                      <td className="px-6 py-4 text-white font-medium">{priceDisplay}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`${
                            stock === 0
                              ? "text-red-400 font-medium"
                              : stock < 10
                              ? "text-amber-400 font-medium"
                              : "text-white/80"
                          }`}
                        >
                          {stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={statusLabel} type={statusType} />
                      </td>
                      <td className="px-6 py-4 text-xs text-white/40">
                        {new Date(product.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 bg-white/5 hover:bg-[var(--gold)]/20 hover:text-[var(--gold)] rounded-md transition-colors text-white/60"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-md transition-colors text-white/60"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors text-white/60"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-[#0c1427] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-white/50 mb-6">
                Are you sure you want to delete{" "}
                <span className="text-white font-medium">
                  {deleteTarget?.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteTarget(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-md transition-colors font-medium text-sm border border-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-md transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-wait"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
