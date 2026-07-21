"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, AlertCircle, Box, Image as ImageIcon, CheckCircle, Eye, Plus } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { productsApi, ApiProduct } from "@/lib/services";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productsApi.get(productId)
      .then(setProduct)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64 text-white/50">
        Product not found.
      </div>
    );
  }

  let totalStock = product.globalStock ?? 0;
  if (product.category === "APPAREL" && product.variants && product.variants.length > 0) {
    totalStock = product.variants.reduce((sum, v) => sum + (v.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0), 0);
  } else if (product.sizes && product.sizes.length > 0) {
    totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
  }

  const isLowStock = product.trackStock && totalStock <= (product.lowStockThreshold || 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif text-[var(--ivory)]">{product.name}</h2>
              <StatusBadge status={product.status === "ACTIVE" ? "Active" : product.status} type={product.status === "ACTIVE" ? "success" : "neutral"} />
            </div>
            <p className="text-sm text-white/50">{product.sku || productId} • Added {new Date(product.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/admin/products/${productId}/edit`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 rounded-md text-sm font-medium hover:bg-[var(--gold)]/20 transition-colors shrink-0">
            <Edit size={16} /> Edit Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">

          {/* Basic Info */}
          <DashboardCard title="Product Information">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Product Name</div>
                  <div className="text-white font-medium text-lg">{product.name}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Category</div>
                  <div className="text-white">{product.category}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">SKU</div>
                  <div className="text-white font-mono">{product.sku || "N/A"}</div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Short Description</div>
                <p className="text-white/80 text-sm leading-relaxed">
                  {product.shortDescription || product.book?.shortDescription || "No description provided."}
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* Pricing & Variants */}
          <DashboardCard title="Pricing & Variants">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Regular Price</div>
                  <div className="text-[var(--gold)] font-bold text-xl">₹{Number(product.price).toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Sale Price</div>
                  <div className="text-white font-medium text-xl">{product.salePrice ? `₹${Number(product.salePrice).toLocaleString("en-IN")}` : "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Tax Percentage</div>
                  <div className="text-white font-medium text-xl">{product.tax}% GST</div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-4">Available Variants</div>
                <div className="space-y-3">
                  {product.category === "APPAREL" && product.variants && product.variants.length > 0 ? (
                    product.variants.map((v) => (
                      <div key={v.id} className="space-y-2">
                        <div className="text-xs font-semibold text-white/70 uppercase">Colour: {v.colourName}</div>
                        {v.sizes.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                            <span className="text-white text-sm font-medium">Size: {s.label}</span>
                            <span className="text-white/50 text-sm">Stock: {s.stock}</span>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : product.sizes && product.sizes.length > 0 ? (
                    product.sizes.map(size => (
                      <div key={size.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                        <span className="text-white text-sm font-medium">Size: {size.label}</span>
                        <span className="text-white/50 text-sm">Stock: {size.stock}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/50">No variants available.</div>
                  )}
                </div>
              </div>
            </div>
          </DashboardCard>

        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-1">

          {/* Inventory Card */}
          <DashboardCard title="Inventory Management" action={<Box size={18} className="text-white/40" />}>
            <div className="p-6">
              {/* Low Stock Warning */}
              {isLowStock && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-400">Low Stock Alert</h4>
                    <p className="text-xs text-amber-400/70 mt-1">Stock is critically low. Restock recommended.</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <span className="text-white/70 text-sm">Available Stock</span>
                  <span className="text-white font-bold text-lg">{totalStock}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                  <span className="text-white/70 text-sm">Low Stock Threshold</span>
                  <span className="text-white/50 text-sm">{product.lowStockThreshold ?? 0} items</span>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-xs text-white/50 mb-2">Out of Stock Behaviour</div>
                  <div className="text-sm text-white">{product.outOfStockBehavior === "ALLOW_BACKORDERS" ? "Continue Selling" : "Stop Selling"}</div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Media Card */}
          <DashboardCard title="Product Media" action={<ImageIcon size={18} className="text-white/40" />}>
            <div className="p-6 space-y-4">
              {/* Primary image */}
              <div className="aspect-square w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center relative">
                {product.primaryImage || product.book?.coverUrl ? (
                  <img
                    src={product.primaryImage || product.book?.coverUrl || ""}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-white/20" />
                )}
                <div className="absolute top-2 right-2 bg-[#080e1a]/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                  Primary
                </div>
              </div>
              {/* Gallery thumbnails */}
              {product.galleryImages && product.galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {product.galleryImages.slice(0, 3).map((img, i) => (
                    <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <img src={img} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <Link
                href={`/admin/products/${productId}/edit`}
                className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-white/40 hover:text-[var(--gold)] hover:border-[var(--gold)]/30 transition-colors"
              >
                <Plus className="w-4 h-4" /> Edit Images
              </Link>
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
                  <div className="text-sm text-white font-medium">Online Store</div>
                  <div className="text-xs text-white/50">Visible to customers</div>
                </div>
              </div>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}
// Add Eye icon to Lucide imports inside the file content using replace if necessary.
