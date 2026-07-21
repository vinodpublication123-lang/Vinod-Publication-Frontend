"use client";

import { Suspense } from "react";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home, Copy, Check } from "lucide-react";

function OrderSuccessPageInner() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  
  // The checkout page should redirect here with ?orderNumber=VIN-XXXX
  const orderNumber = searchParams.get("orderNumber") ?? "—";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#080e1a] text-foreground pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--gold)]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 max-w-2xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-12 text-center backdrop-blur-sm"
        >
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 border border-[var(--gold)]/30 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 rounded-full border border-[var(--gold)] animate-[ping_3s_ease-in-out_infinite] opacity-20" />
            <CheckCircle className="w-10 h-10 text-[var(--gold)]" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-serif text-[var(--ivory)] mb-4"
          >
            Thank You
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
          >
            Your order has been placed successfully. We will send you an email confirmation with your order details.
          </motion.p>

          {/* Order Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-black/20 border border-white/5 rounded-2xl p-6 mb-10 max-w-sm mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-2 text-muted-foreground">
              <Package className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Order Number</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-[var(--gold)] tracking-wider">
                {orderNumber}
              </span>
              {orderNumber !== "—" && (
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                  title="Copy order number"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/account/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-[var(--ink)] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] gap-2 group"
              style={{
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
              }}
            >
              View My Orders
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/#store"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white/5 border border-white/10 gap-2"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <OrderSuccessPageInner />
    </Suspense>
  );
}
