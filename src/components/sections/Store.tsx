"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { ProductCard } from "@/components/ui/product-card-2";
import { ProductDetailPage } from "@/components/ui/product-detail-page";
import { Star, Info, Tag, ShoppingCart, Package } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";
import { productsApi, ApiProduct } from "@/lib/services";

// ── Helpers ──────────────────────────────────────────────────────────────────

function categoryLabel(cat: ApiProduct["category"]): string {
  const map: Record<string, string> = {
    BOOK: "Merchandise",
    MERCHANDISE: "Merchandise",
    APPAREL: "Apparel",
    ACCESSORIES: "Accessories",
  };
  return map[cat] ?? cat;
}

function primaryImage(p: ApiProduct): string {
  if (p.primaryImage) return p.primaryImage;
  if (p.book?.coverUrl) return p.book.coverUrl;
  if (p.galleryImages?.[0]) return p.galleryImages[0];
  return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop";
}

type Tab = "Merchandise" | "Apparel";

export function Store() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Merchandise");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    productsApi
      .list({ status: "ACTIVE", limit: 20 })
      .then((res) => {
        if (!cancelled) setProducts(res.items);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load products"
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const headingVariants = {
    hidden: { opacity: 0, y: -16, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" as const },
    }),
  };

  const merchandise = products.filter(
    (p) => p.category === "BOOK" || p.category === "MERCHANDISE"
  );
  const apparel = products.filter(
    (p) => p.category === "APPAREL" || p.category === "ACCESSORIES"
  );
  const activeProducts = activeTab === "Merchandise" ? merchandise : apparel;

  return (
    <section
      id="store"
      ref={sectionRef}
      className="relative py-28 overflow-hidden section-fade-out bg-[#080e1a]"
    >
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-8 md:px-14 lg:px-20 xl:px-24">
        {/* Section Header */}
        <article className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <TimelineContent
            as="span"
            animationNum={0}
            timelineRef={sectionRef}
            customVariants={headingVariants}
            className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold block"
          >
            VINVERSE Store
          </TimelineContent>

          <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-foreground">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.12}
              staggerFrom="first"
              containerClassName="justify-center"
              wordLevelClassName="pb-2"
              transition={{ type: "spring", stiffness: 240, damping: 38, delay: 0.1 }}
            >
              Shop VINVERSE
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={1}
            timelineRef={sectionRef}
            customVariants={headingVariants}
            className="text-muted-foreground text-lg"
          >
            Explore books, merchandise, and exclusive collections from the
            VINVERSE community.
          </TimelineContent>
        </article>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-16 relative z-20">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/[0.02] border border-white/5">
            {(["Merchandise", "Apparel"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-300 rounded-full ${
                  activeTab === tab
                    ? "text-[var(--gold)]"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="store-tab-pill"
                    className="absolute inset-0 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-full z-0 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/40 text-sm">Could not load products.</p>
            <p className="text-red-400/60 text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && activeProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/40 text-sm">No {activeTab} products available yet.</p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && activeProducts.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {activeProducts.map((product, index) => {
                const img = primaryImage(product);
                const displayPrice = product.salePrice ?? product.price;
                const originalPrice = product.salePrice ? product.price : undefined;
                const offerText = product.salePrice
                  ? `${Math.round(((product.price - product.salePrice) / product.price) * 100)}% Off`
                  : undefined;
                const catLabel = categoryLabel(product.category);

                // ── Stock awareness ───────────────────────────────────────────
                let totalStock = product.globalStock ?? 0;
                if (product.category === "APPAREL" && product.variants && product.variants.length > 0) {
                  totalStock = product.variants.reduce((sum, v) => sum + (v.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0), 0);
                } else if (product.sizes && product.sizes.length > 0) {
                  totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
                }
                const isOutOfStock = product.trackStock && totalStock <= 0;
                const isLowStock =
                  product.trackStock &&
                  !isOutOfStock &&
                  totalStock > 0 &&
                  totalStock <= (product.lowStockThreshold ?? 10);

                return (
                  <TimelineContent
                    key={product.id}
                    as="div"
                    animationNum={2 + index}
                    timelineRef={sectionRef}
                    customVariants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: (i) => ({
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
                      }),
                    }}
                  >
                    <div className="relative">
                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 z-30 rounded-2xl bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {/* Low stock badge */}
                      {isLowStock && (
                        <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                          Only {totalStock} left
                        </div>
                      )}
                      <ProductCard
                        name={product.name}
                        category={catLabel}
                        imageUrl={img}
                        tagline={product.shortDescription ?? product.book?.shortDescription ?? ""}
                        description={product.shortDescription ?? product.book?.shortDescription ?? "A premium product from the VINVERSE collection."}
                        price={displayPrice}
                        originalPrice={originalPrice}
                        offerText={offerText ?? ""}
                        currency="₹"
                        isOutOfStock={isOutOfStock}
                        onViewDetails={() => !isOutOfStock && setSelectedProduct(product)}
                        onAddToCart={isOutOfStock ? undefined : () => {
                          // If product has variants or multiple sizes, open the modal instead of quick-adding
                          if ((product.category === "APPAREL" && product.variants && product.variants.length > 0) || 
                              (product.sizes && product.sizes.length > 0)) {
                            setSelectedProduct(product);
                            return;
                          }

                          addItem({
                            productId: product.id,
                            name: product.name,
                            category: catLabel,
                            price: displayPrice,
                            currency: "₹",
                            imageUrl: img,
                            quantity: 1,
                            availableStock: product.trackStock ? totalStock : undefined,
                            lowStockThreshold: product.trackStock ? (product.lowStockThreshold ?? 10) : undefined,
                          });
                          toast.success(`Added ${product.name} to cart`, {
                            description: "Qty: 1",
                            icon: (
                              <ShoppingCart className="w-4 h-4 text-[var(--gold)]" />
                            ),
                          });
                        }}
                      />
                    </div>
                  </TimelineContent>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-white/10 bg-[#080e1a] custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <ProductDetailPage
                onClose={() => setSelectedProduct(null)}
                product={{
                  id: selectedProduct.id,
                  name: selectedProduct.name,
                  availableStock: selectedProduct.trackStock 
                    ? (selectedProduct.category === "APPAREL" && selectedProduct.variants && selectedProduct.variants.length > 0
                        ? selectedProduct.variants.reduce((sum, v) => sum + (v.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0), 0)
                        : (selectedProduct.sizes && selectedProduct.sizes.length > 0
                           ? selectedProduct.sizes.reduce((s, sz) => s + sz.stock, 0)
                           : (selectedProduct.globalStock ?? 0)))
                    : undefined,
                  lowStockThreshold: selectedProduct.trackStock ? (selectedProduct.lowStockThreshold ?? 10) : undefined,
                  category: categoryLabel(selectedProduct.category),
                  price: selectedProduct.salePrice ?? selectedProduct.price,
                  shippingCost: 5.0,
                  currency: "₹",
                  images: (() => {
                    const gallery = (selectedProduct.galleryImages ?? []).filter(Boolean);
                    if (gallery.length > 0) return gallery;
                    // No gallery images — fall back to primaryImage or book cover
                    const fallback = selectedProduct.primaryImage
                      || selectedProduct.book?.coverUrl
                      || "";
                    return fallback ? [fallback] : [];
                  })(),
                  description:
                    selectedProduct.fullDescription ??
                    selectedProduct.book?.fullDescription ??
                    selectedProduct.shortDescription ??
                    selectedProduct.book?.shortDescription ??
                    `A ${categoryLabel(selectedProduct.category)} product from the VINVERSE collection.`,
                  tags: [
                    { label: categoryLabel(selectedProduct.category), icon: Tag },
                    { label: "Premium", icon: Star },
                    { label: "Authentic", icon: Info },
                  ],
                  // Build real variant groups from DB sizes — only if product has sizes
                  variantGroups: (() => {
                    if (selectedProduct.category === "APPAREL" && selectedProduct.variants && selectedProduct.variants.length > 0) {
                      return [
                        {
                          name: "Colour",
                          options: selectedProduct.variants.map((v) => ({
                            id: v.id,
                            name: v.colourName,
                            stock: v.sizes.reduce((sum, s) => sum + s.stock, 0),
                            images: v.images.map(img => img.url),
                            subVariants: v.sizes.map((s) => ({
                              name: {
                                SMALL: "S",
                                MEDIUM: "M",
                                LARGE: "L",
                                XL: "XL",
                                XXL: "XXL",
                              }[s.label] ?? s.label,
                              originalLabel: s.label,
                              stock: s.stock ?? 0,
                            })),
                          })),
                        },
                      ];
                    }
                    if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
                      return [
                        {
                          name: "Size",
                          options: selectedProduct.sizes.map((s) => ({
                            name: {
                              SMALL: "S",
                              MEDIUM: "M",
                              LARGE: "L",
                              XL: "XL",
                              XXL: "XXL",
                            }[s.label] ?? s.label,
                            originalLabel: s.label,
                            stock: s.stock ?? 0,
                          })),
                        },
                      ];
                    }
                    return undefined;
                  })(),
                }}

                breadcrumbs={[
                  { label: "Store", href: "#" },
                  {
                    label: categoryLabel(selectedProduct.category),
                    href: "#",
                  },
                  { label: selectedProduct.name, href: "#" },
                ]}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
