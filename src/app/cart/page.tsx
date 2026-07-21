"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, Lock } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";

export default function Cart() {
  const [mounted, setMounted] = useState(false);
  const cart = useCartStore();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    let hasError = false;
    cart.items.forEach((item) => {
      if (item.availableStock !== undefined && item.quantity > item.availableStock) {
        toast.error(`Items not available: ${item.name}`, {
          description: `Only ${item.availableStock} items of this product are in stock.`,
          duration: 6000,
        });
        hasError = true;
      }
    });

    if (!hasError) {
      router.push("/checkout");
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const items = cart.items;
  const subtotal = cart.getSubtotal();
  const totalItems = cart.getTotalItems();
  const total = subtotal;
  const currency = items.length > 0 ? items[0].currency : '$';

  return (
    <main className="min-h-screen bg-[#080e1a] text-foreground pt-32 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Link href="/#store" className="inline-flex items-center text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--ivory)] tracking-tight">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 border border-white/5 rounded-3xl bg-white/[0.02] text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-[var(--gold)]/50" />
            </div>
            <h2 className="text-2xl font-serif text-[var(--ivory)] mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md">Looks like you haven&apos;t added any items to your cart yet. Explore our collection and find something you love.</p>
            <Link
              href="/#store"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-[var(--ink)] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              style={{
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
              }}
            >
              Explore Store
            </Link>
          </motion.div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative group"
                >
                  {/* Image */}
                  <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs text-[var(--gold)] uppercase tracking-wider mb-1">{item.category}</p>
                        <h3 className="text-lg font-serif text-[var(--ivory)] leading-snug">{item.name}</h3>
                        {item.size && (
                          <p className="text-sm text-muted-foreground mt-1">Size: <span className="text-white">{item.size}</span></p>
                        )}
                        {/* Low stock / over-stock warnings */}
                        {item.availableStock !== undefined && (
                          item.quantity > item.availableStock ? (
                            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                              ⚠️ Only {item.availableStock} in stock — reduce quantity
                            </p>
                          ) : item.availableStock <= (item.lowStockThreshold ?? 10) ? (
                            <p className="text-xs text-amber-400 mt-1.5">
                              Only {item.availableStock} left in stock
                            </p>
                          ) : null
                        )}
                      </div>
                      <p className="text-lg font-semibold text-white whitespace-nowrap">{currency}{item.price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-6 sm:mt-0">
                      {/* Quantity */}
                      <div className="flex items-center border border-white/20 rounded-full bg-white/5 p-1">
                        <button
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-[var(--ivory)]">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.availableStock !== undefined && item.quantity >= item.availableStock) {
                              toast.error(`Maximum stock reached`, {
                                description: `Only ${item.availableStock} items of ${item.name} are available.`,
                              });
                            } else {
                              cart.updateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            item.availableStock !== undefined && item.quantity >= item.availableStock
                              ? "text-white/20 cursor-not-allowed"
                              : "hover:bg-white/10 text-white"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => cart.removeItem(item.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-2 flex items-center gap-2 text-sm"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
                <h3 className="text-xl font-serif text-[var(--ivory)] mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-muted-foreground pb-4 border-b border-white/10">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-white">{currency}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-[var(--ivory)] font-medium text-base">Total</span>
                    <span className="text-3xl font-bold text-[var(--gold)]">{currency}{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="relative cursor-pointer group flex items-center justify-center w-full px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.08] hover:border-[var(--gold)]/40 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(212,175,55,0.15)]"
                >
                  <div className="pointer-events-none absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="pointer-events-none relative z-10 flex items-center gap-2 text-white group-hover:text-[var(--gold)] transition-colors duration-300">
                    <Lock className="w-4 h-4" />
                    Checkout
                  </span>
                </button>
                
                <div className="flex flex-col items-center gap-2 mt-6">
                  <p className="text-xs text-center text-muted-foreground">
                    Taxes and shipping calculated at checkout.
                  </p>
                  <div className="flex items-center justify-center gap-2 opacity-50 mt-2">
                    {/* Tiny secure checkout indicators */}
                    <svg className="w-8 h-5 text-white" viewBox="0 0 38 24" fill="currentColor"><path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" opacity=".2"/><path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32z" fill="#fff"/><path d="M28.3 10.1c0-.8-.7-1.5-1.5-1.5H11.2c-.8 0-1.5.7-1.5 1.5v3.8c0 .8.7 1.5 1.5 1.5h15.6c.8 0 1.5-.7 1.5-1.5v-3.8z" fill="#ff5f00"/><path d="M23.5 10.1c0-.8-.7-1.5-1.5-1.5H11.2c-.8 0-1.5.7-1.5 1.5v3.8c0 .8.7 1.5 1.5 1.5H22c.8 0 1.5-.7 1.5-1.5v-3.8z" fill="#eb001b"/><path d="M22 15.4c1-.8 1.6-2 1.6-3.4 0-1.4-.6-2.6-1.6-3.4-.6.8-1 1.9-1 3.4s.4 2.6 1 3.4z" fill="#f79e1b"/></svg>
                    <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none"><rect width="38" height="24" rx="3" fill="#172B4D"/><path d="M19.3 12.3c-.6-.2-1-.4-1-.7 0-.4.4-.7 1-.7.7 0 1.3.2 1.9.6l.4-1.2c-.6-.4-1.4-.6-2.3-.6-1.5 0-2.6.8-2.6 2 0 1.5 2.1 1.8 2.2 2.5 0 .4-.4.7-1.1.7-.8 0-1.6-.3-2.1-.8l-.4 1.2c.6.5 1.6.8 2.6.8 1.6 0 2.6-.8 2.6-2.1-.1-1.3-2-1.7-2.2-2.5zm5.7-2.6H23l-1.3 5.9h1.7l1.6-5.9zm-4.7 0h-1.3l-2.4 5.9h1.7l.3-1h2.1l.2 1h1.6l-2.2-5.9zm-1.8 3.6l.7-2.1.4 2.1h-1.1zm-8.8-3.6H8.2l-1.6 5.9h1.7l1.4-5.9z" fill="#fff"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
