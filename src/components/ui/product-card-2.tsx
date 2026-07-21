import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { ShoppingCart } from "lucide-react";

export interface ProductCardProps extends Omit<HTMLMotionProps<"div">, "name"> {
  imageUrl: string;
  name: string;
  tagline: string;
  description?: string;
  price: number;
  category?: string;
  currency?: string;
  isCouponPrice?: boolean;
  originalPrice?: number;
  offerText: string;
  isOutOfStock?: boolean;
  onViewDetails?: () => void;
  onAddToCart?: () => void;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      className,
      imageUrl,
      name,
      tagline,
      description,
      price,
      category,
      currency = "₹",
      isCouponPrice = false,
      originalPrice,
      offerText,
      isOutOfStock = false,
      onViewDetails,
      onAddToCart,
      ...props
    },
    ref
  ) => {
    // Price formatter for consistent currency display
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
      })
        .format(amount)
        .replace("₹", `${currency}`);
    };

    const overlayVariants: Variants = {
      rest: { 
        y: "100%", 
        opacity: 0,
        filter: "blur(4px)",
      },
      hover: { 
        y: "0%", 
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.6,
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
      },
    };

    const contentVariants: Variants = {
      rest: { 
        opacity: 0, 
        y: 20,
        scale: 0.95,
      },
      hover: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.5,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        initial="rest"
        whileHover={isOutOfStock ? undefined : "hover"}
        className={cn(
          "group relative flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-2xl border border-white/5 bg-transparent text-center text-foreground transition-all duration-500 ease-in-out",
          isOutOfStock
            ? "opacity-50 grayscale cursor-not-allowed"
            : "hover:border-[var(--gold)]/20 hover:bg-white/[0.02]",
          className
        )}
        {...props}
      >
        {/* Product Image */}
        <div className="relative flex h-80 w-full items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Seamless fade into background */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080e1a] to-transparent pointer-events-none group-hover:from-[#091120] transition-colors duration-500" />
        </div>

        {/* Card Body */}
        <div className="p-6 pt-0 flex flex-col items-center w-full z-10 -mt-6">
          {/* Product Details */}
          <div className="flex flex-grow flex-col items-center gap-2 relative z-0">
            <h3 className="font-serif text-xl leading-snug text-[var(--ivory)]">{name}</h3>
            <p className="text-sm text-muted-foreground">{tagline}</p>
          </div>

          {/* Pricing and Offers */}
          <div className="mt-4 flex flex-col items-center gap-2 relative z-0">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">{formatPrice(price)}</span>
            {isCouponPrice && (
              <span className="text-xs font-medium text-[var(--gold)]">
                Coupon Price
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-foreground mt-2">
            {originalPrice && (
              <span className="text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="font-semibold text-[var(--gold)]">
              {offerText}
            </span>
          </div>
        </div>
        </div>

        {/* Reveal Overlay */}
        <motion.div
          variants={overlayVariants}
          className="absolute inset-0 bg-[var(--navy-mid)]/95 backdrop-blur-xl flex flex-col justify-end border border-[var(--gold)]/20 rounded-2xl z-20"
        >
          <div className="p-6 space-y-4 text-left">
            {/* Product Description */}
            <motion.div variants={contentVariants}>
              <h4 className="font-serif text-lg text-[var(--gold)] mb-2">{name}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {description || tagline || "Premium quality product from the VINVERSE collection."}
              </p>
            </motion.div>

            {/* Price tag in overlay */}
            <motion.div variants={contentVariants} className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-muted-foreground">Total Price</span>
              <span className="text-xl font-bold text-foreground">{formatPrice(price)}</span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={contentVariants} className="space-y-3 mt-4">
              {category !== "Apparel" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-md bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-light)] text-[var(--ink)] font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={onViewDetails}
                    className="w-full h-11 rounded-md border border-white/20 bg-transparent text-[var(--ivory)] font-medium hover:bg-white/5 transition-colors"
                  >
                    View Details
                  </button>
                </>
              ) : (
                <button
                  onClick={onViewDetails}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-md bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-light)] text-[var(--ink)] font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Shop Now
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };
