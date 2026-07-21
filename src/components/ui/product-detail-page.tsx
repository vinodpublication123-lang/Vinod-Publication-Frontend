import * as React from "react";
import { ChevronLeft, ChevronRight, Star, Tag, Ruler, Users, Info, Heart, Share2, ShoppingCart, Send, Camera, X, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ProductTag {
  label: string;
  icon?: React.ElementType;
}


export interface VariantOption {
  name: string;
  id?: string;
  originalLabel?: string;
  stock: number;
  images?: string[];
  subVariants?: VariantOption[];
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

export interface Product {
  id?: string;
  name: string;
  category?: string;
  price: number;
  shippingCost: number;
  currency: string;
  images: string[];
  description: string;
  tags: ProductTag[];
  variantGroups?: VariantGroup[];
  availableStock?: number;
  lowStockThreshold?: number;
}

export interface ProductDetailPageProps {
  product: Product;
  breadcrumbs: BreadcrumbItem[];
  onClose?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, breadcrumbs, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariants, setSelectedVariants] = React.useState<Record<string, string>>({});

  const addItem = useCartStore((state) => state.addItem);

  const isApparel = product.category === "Apparel";

  // Compute derived images based on color variant selection
  let derivedImages = product.images;
  const colourName = selectedVariants["Colour"];
  if (colourName && product.variantGroups) {
    const group = product.variantGroups.find(g => g.name === "Colour");
    const option = group?.options.find(o => o.name === colourName);
    if (option && option.images && option.images.length > 0) {
      derivedImages = option.images;
    }
  }

  // Ensure current image index is valid for derived images
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [derivedImages]);

  const isAddToCartDisabled = React.useMemo(() => {
    const available = (product.availableStock ?? 1) > 0;
    if (!available) return true;
    if (product.variantGroups && product.variantGroups.length > 0) {
      for (const group of product.variantGroups) {
        if (!selectedVariants[group.name]) return true;
        const option = group.options.find(o => o.name === selectedVariants[group.name]);
        if (option?.subVariants && option.subVariants.length > 0) {
          if (!selectedVariants[`${group.name}-Sub`]) return true;
        }
      }
    }
    return false;
  }, [product.availableStock, product.variantGroups, selectedVariants]);

  const handleAddToCart = () => {
    if (isAddToCartDisabled) {
      toast.error("Please select all options before adding to cart");
      return;
    }
    // Format selected variants for cart
    let variantString = undefined;
    let variantId = undefined;
    let sizeLabel = undefined;

    if (Object.keys(selectedVariants).length > 0) {
       // Since APPAREL maps Colour as top-level and Size as sub-level, we can extract them if they match our new logic
       const colourName = selectedVariants["Colour"];
       const sizeSubName = selectedVariants["Colour-Sub"];

       if (colourName) {
         const group = product.variantGroups?.find(g => g.name === "Colour");
         const option = group?.options.find(o => o.name === colourName);
         if (option) {
            variantId = option.id;
            if (sizeSubName && option.subVariants) {
              const subOption = option.subVariants.find(s => s.name === sizeSubName);
              if (subOption) {
                sizeLabel = subOption.originalLabel || subOption.name;
              }
            }
         }
       }
       
       variantString = Object.entries(selectedVariants).map(([k, v]) => {
          if (k.endsWith("-Sub")) {
            return `Size: ${v}`;
          }
          return `${k}: ${v}`;
        }).join(" | ");
    }

    addItem({
      productId: product.id,
      name: product.name,
      category: product.category || "General",
      price: product.price,
      currency: product.currency,
      imageUrl: derivedImages[0],
      quantity,
      size: sizeLabel || variantString,
      variantId: variantId,
      availableStock: product.availableStock,
      lowStockThreshold: product.lowStockThreshold,
    });
    
    toast.success(`Added ${product.name} to cart`, {
      description: variantString ? `${variantString} | Qty: ${quantity}` : `Qty: ${quantity}`,
      icon: <ShoppingCart className="w-4 h-4 text-[var(--gold)]" />
    });

    // Auto-close modal after adding to cart
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 text-foreground relative">
      {onClose && (
        <div className="sticky top-0 right-0 z-50 flex justify-end mb-4 -mt-2 -mr-2">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md shadow-xl"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground mb-8">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <a href={item.href} className="hover:text-[var(--gold)] transition-colors">{item.label}</a>
            {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Main content grid */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="w-full p-6 md:p-10 border border-white/10 flex flex-col items-center">
          <div className="relative w-full max-w-md mx-auto group">
             <AnimatePresence mode="wait">
               <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-[4/5] w-full flex items-center justify-center p-8"
               >
                  <img
                      src={derivedImages[currentImageIndex]}
                      alt={`${product.name} image ${currentImageIndex + 1}`}
                      className="object-contain w-full h-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
                  />
               </motion.div>
             </AnimatePresence>

             {/* Navigation Buttons */}
             {derivedImages.length > 1 && (
               <>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setCurrentImageIndex((prev) => (prev - 1 + derivedImages.length) % derivedImages.length);
                   }}
                   className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:text-white border border-white/10 backdrop-blur-sm z-10"
                   aria-label="Previous image"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setCurrentImageIndex((prev) => (prev + 1) % derivedImages.length);
                   }}
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:text-white border border-white/10 backdrop-blur-sm z-10"
                   aria-label="Next image"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>
               </>
             )}
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="flex gap-2">
                {derivedImages.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    currentImageIndex === index ? "bg-[var(--gold)]" : "bg-white/20 hover:bg-white/40"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                />
                ))}
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-5xl font-serif tracking-tight text-[var(--ivory)]">{product.name}</h1>
          <div className="mt-4 mb-6">
            <span className="text-4xl font-bold text-white">{product.currency}{product.price}</span>
          </div>

          {/* Dynamic Variant Selectors */}
          {product.variantGroups && product.variantGroups.length > 0 && (
            <div className="space-y-6 mb-6">
              {product.variantGroups.map((group) => {
                const selectedOptionName = selectedVariants[group.name];
                const selectedOption = group.options.find(o => o.name === selectedOptionName);
                
                return (
                  <div key={group.name} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[var(--ivory)]">{group.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => {
                          const isSelected = selectedOptionName === option.name;
                          // If it has sub-variants, total stock might be sum, or we just trust the top-level option stock which admin sets.
                          // To be safe, if subVariants exist, check if any subVariant has stock > 0
                          const totalStock = option.subVariants && option.subVariants.length > 0 
                            ? option.subVariants.reduce((acc, sv) => acc + sv.stock, 0)
                            : option.stock;
                          const isOutOfStock = totalStock <= 0;
                          
                          return (
                            <button
                              key={option.name}
                              disabled={isOutOfStock}
                              onClick={() => {
                                const newSelections = { ...selectedVariants, [group.name]: option.name };
                                // Clear sub-variant selection if main variant changes
                                delete newSelections[`${group.name}-Sub`];
                                setSelectedVariants(newSelections);
                              }}
                              className={cn(
                                "flex items-center justify-center px-4 py-2 min-w-[3rem] h-12 rounded-lg border font-medium transition-all",
                                isSelected
                                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                                  : isOutOfStock
                                  ? "border-white/5 bg-white/5 text-white/20 cursor-not-allowed"
                                  : "border-white/20 text-muted-foreground hover:border-white/40 hover:text-white"
                              )}
                            >
                              {option.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Render Sub-variants if the selected option has them */}
                    {selectedOption && selectedOption.subVariants && selectedOption.subVariants.length > 0 && (
                      <div className="pl-4 border-l-2 border-white/10 ml-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[var(--ivory)]">Specific Size / Option</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedOption.subVariants.map((subVariant) => {
                            const isSelected = selectedVariants[`${group.name}-Sub`] === subVariant.name;
                            const isOutOfStock = subVariant.stock <= 0;
                            return (
                              <button
                                key={subVariant.name}
                                disabled={isOutOfStock}
                                onClick={() => setSelectedVariants({ ...selectedVariants, [`${group.name}-Sub`]: subVariant.name })}
                                className={cn(
                                  "flex items-center justify-center px-3 py-1.5 min-w-[3rem] h-10 text-sm rounded-lg border font-medium transition-all",
                                  isSelected
                                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                                    : isOutOfStock
                                    ? "border-white/5 bg-white/5 text-white/20 cursor-not-allowed"
                                    : "border-white/20 text-muted-foreground hover:border-white/40 hover:text-white"
                                )}
                              >
                                {subVariant.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}


          {/* Quantity Selector */}
          <div className="mb-6">
            <span className="text-sm font-medium text-[var(--ivory)] block mb-2">Quantity</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-white/20 rounded-full bg-white/5 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium text-[var(--ivory)]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 my-8">
            <button
              disabled={isAddToCartDisabled}
              onClick={() => {
                if (isAddToCartDisabled) return;
                handleAddToCart();
                window.location.href = "/checkout";
              }}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300",
                isAddToCartDisabled
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "text-[var(--ink)] hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              )}
              style={isAddToCartDisabled ? {} : {
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
                boxShadow: "0 8px 25px rgba(212,175,55,0.25)",
              }}
            >
              Buy Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </button>
            <button 
              disabled={isAddToCartDisabled}
              onClick={handleAddToCart}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 border",
                isAddToCartDisabled
                  ? "border-white/10 bg-transparent text-white/40 cursor-not-allowed"
                  : "border-[var(--gold)]/30 bg-transparent text-[var(--gold)] hover:bg-[var(--gold)]/10"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>

          {/* Description */}
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <h3 className="text-xl font-serif text-[var(--gold)]">Description</h3>
            <p>
              {product.description}
            </p>
          </div>
          

        </div>
      </main>
    </div>
  );
};
