"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig, navLinks } from "@/lib/config";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuth } from "@/components/auth/AuthProvider";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hydration safety for Zustand state
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Logo */}
          <Link
            href="#home"
            className="font-serif text-xl sm:text-2xl tracking-[0.15em] text-primary transition-colors duration-300 hover:text-[var(--gold)] relative z-10"
          >
            {siteConfig.name}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground transition-colors duration-300 hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-4 relative z-10">
            {/* User Authentication */}
            {(() => {
              if (!mounted) return <div className="w-16 h-8 animate-pulse bg-white/5 rounded-full mr-2"></div>;
              
              if (isAuthenticated && user) {
                return (
                  <div className="relative group hidden xl:block">
                    <button className="flex items-center gap-2 w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm justify-center focus:outline-none">
                      <div className="w-4 h-4 rounded-full bg-[var(--gold)] flex items-center justify-center text-[#080e1a] text-[10px] font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-[#080e1a] border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-2">
                        {user.role === "ADMIN" && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-[var(--gold)] hover:bg-white/5 font-semibold">Admin Panel</Link>
                        )}
                        <Link href="/account" className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-[var(--gold)]">Dashboard</Link>
                        <Link href="/account/profile" className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-[var(--gold)]">My Profile</Link>
                        <Link href="/account/orders" className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-[var(--gold)]">My Orders</Link>
                        <div className="h-px bg-white/10 my-1" />
                        <button onClick={() => logout()} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Logout</button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="hidden xl:flex items-center gap-4 mr-2">
                    <Link href="/login" className="text-xs uppercase tracking-wider text-white/70 hover:text-[var(--gold)] transition-colors font-semibold">
                      Login
                    </Link>
                    <span className="w-px h-3 bg-white/20" />
                    <Link href="/register" className="text-xs uppercase tracking-wider text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors font-semibold">
                      Register
                    </Link>
                  </div>
                );
              }
            })()}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative cursor-pointer group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.06] hover:border-[var(--gold)]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-[1.02]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[var(--gold)]/0 group-hover:bg-[var(--gold)]/10 transition-colors duration-500" />
              
              <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="pointer-events-none relative z-10 flex items-center gap-2 text-[var(--ivory)] group-hover:text-[var(--gold)] transition-colors duration-300">
                <ShoppingCart size={16} className="text-[var(--gold)] transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Cart ({mounted ? totalItems : 0})
                </span>
              </span>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="xl:hidden text-primary p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu — Full screen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col pt-24 pb-8 px-8"
          >
            <nav className="flex flex-col gap-6 flex-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    className="font-serif text-3xl text-primary transition-colors hover:text-[var(--gold)]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
