"use client";

import { Suspense } from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, ShieldCheck, Check, ShoppingCart, FlaskConical, MapPin, LogIn } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { ordersApi, addressesApi, paymentsApi } from "@/lib/services";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { toast } from "sonner";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  formData: Record<string, string>;
  errors: Record<string, string>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  formData,
  errors,
  handleInputChange,
}: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-[var(--ivory)] mb-2">
      {label} {required && <span className="text-[var(--gold)]">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={`w-full bg-black/20 border ${errors[name] ? "border-red-500/50" : "border-white/10"
        } rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all`}
    />
    {errors[name] && (
      <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
);

// ── Load Razorpay checkout script on demand ─────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPageInner() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCartStore();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { settings } = useStoreSettings();

  // Session expired modal
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Saved address
  const [savedAddress, setSavedAddress] = useState<Record<string, string> | null>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show expired modal if redirected from a session expiry
    if (searchParams?.get("expired") === "1") {
      setShowExpiredModal(true);
    }
  }, [searchParams]);

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Load saved (default) address for logged-in users
  useEffect(() => {
    if (!isAuthenticated) return;
    addressesApi.list().then((list) => {
      const addresses = list as any[];
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (def) {
        setSavedAddress({
          fullName: def.fullName || "",
          phone: def.phone || "",
          address1: def.line1 || "",
          address2: def.line2 || "",
          city: def.city || "",
          state: def.state || "",
          pincode: def.postalCode || "",
          country: def.country || "India",
        });
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  // When "use saved address" is toggled, import or clear address fields
  useEffect(() => {
    if (useSavedAddress && savedAddress) {
      setFormData((prev) => ({ ...prev, ...savedAddress }));
    }
  }, [useSavedAddress, savedAddress]);

  if (!mounted || authLoading) {
    return (
      <main className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const items = cart.items;
  const subtotal = cart.getSubtotal();
  const totalItems = cart.getTotalItems();
  const deliveryCharge = settings.shipping.deliveryCharge;
  const freeThreshold = settings.shipping.freeShippingThreshold;
  const shipping = totalItems > 0
    ? (freeThreshold > 0 && subtotal >= freeThreshold ? 0 : deliveryCharge)
    : 0;
  const total = subtotal + shipping;
  const currency = items.length > 0 ? items[0].currency : "₹";
  const isTestMode = settings.payment.testMode;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address1.trim()) newErrors.address1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const checkoutItems = cart.items
        .filter((item) => item.productId)
        .map((item) => {
          let sizeLabel = item.size;
          if (sizeLabel && sizeLabel.startsWith("Size: ")) {
            sizeLabel = sizeLabel.replace("Size: ", "");
          }
          return {
            productId: item.productId as string,
            quantity: item.quantity,
            variantId: item.variantId,
            sizeLabel: sizeLabel,
          };
        });

      if (checkoutItems.length === 0) {
        toast.error("Your cart items are missing backend IDs. Please clear cart and add them again.");
        setIsProcessing(false);
        return;
      }

      // Step 1 — Create our internal order (PENDING status)
      const result = await ordersApi.checkout({
        shippingAddress: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        items: checkoutItems,
        paymentMethod: isTestMode ? "TEST" : "RAZORPAY",
        notes: isTestMode ? "TEST MODE — no real payment" : undefined,
      });

      const orderId = (result as any).id;
      const orderNum = (result as any).orderNumber || (result as any).order?.orderNumber || "";

      // Step 2 — Test mode: skip payment, go directly to success
      if (isTestMode) {
        cart.clearCart();
        router.push(`/order-success${orderNum ? `?orderNumber=${orderNum}` : ""}`);
        return;
      }

      // Step 3 — Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      // Step 4 — Create Razorpay order on backend
      const { razorpayOrderId, amount, currency, key } = await paymentsApi.createOrder(orderId);

      // Step 5 — Open Razorpay payment popup
      const rzpOptions = {
        key,
        amount,
        currency,
        name: "VINVERSE Publication",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 6 — Verify payment signature on backend
            await paymentsApi.verify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            cart.clearCart();
            router.push(`/order-success${orderNum ? `?orderNumber=${orderNum}` : ""}`);
          } catch {
            toast.error("Payment verification failed. Please contact support with your order number.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#c084fc" },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Your order is saved — you can retry from My Orders.");
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error?.description || "Unknown error"}`);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      if (msg.toLowerCase().includes("stock") || msg.toLowerCase().includes("inventory") || msg.toLowerCase().includes("insufficient")) {
        toast.error("📦 Stock Issue", { description: msg, duration: 6000 });
      } else {
        toast.error(msg);
      }
    }
  };

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#080e1a] text-foreground pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 border border-white/5 rounded-3xl bg-white/[0.02] flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-6 border border-[var(--gold)]/20">
              <Lock className="w-10 h-10 text-[var(--gold)]" />
            </div>
            <h2 className="text-2xl font-serif text-[var(--ivory)] mb-4">
              Login Required
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              You must be logged in to your VINVERSE account to proceed with
              checkout and track your orders.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-[var(--ink)] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
                }}
              >
                Login to Checkout
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-[var(--gold)] border border-[var(--gold)]/30 font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[var(--gold)]/10"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (items.length === 0 && !isProcessing) {
    return (
      <main className="min-h-screen bg-[#080e1a] text-foreground pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 border border-white/5 rounded-3xl bg-white/[0.02] flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-[var(--gold)]/50" />
            </div>
            <h2 className="text-2xl font-serif text-[var(--ivory)] mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              You need items in your cart to proceed to checkout.
            </p>
            <Link
              href="/#store"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-[var(--ink)] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
              }}
            >
              Return to Store
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080e1a] text-foreground pt-32 pb-24">

      {/* Session Expired Modal */}
      <AnimatePresence>
        {showExpiredModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-[#0c1427] border border-amber-500/30 rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
                <LogIn className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-serif text-[var(--ivory)] mb-2">Session Expired</h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Your session has timed out for security purposes. Please log in again to continue with your purchase.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[var(--ink)] font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                  style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))" }}
                >
                  <LogIn className="w-4 h-4" /> Log In Again
                </Link>
                <button
                  onClick={() => setShowExpiredModal(false)}
                  className="w-full px-6 py-3 rounded-full border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--ivory)] tracking-tight">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-8">
            {/* Customer Information */}
            <section className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-serif text-[var(--ivory)] mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-bold">
                  1
                </span>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div className="md:col-span-2">
                  <InputField
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    label="Full Name"
                    name="fullName"
                    required
                    placeholder="John Doe"
                  />
                </div>
                <InputField
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                />
                <InputField
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                />
              </div>
            </section>

            {/* Shipping Information */}
            <section className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-serif text-[var(--ivory)] mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-bold">
                  2
                </span>
                Shipping Address
              </h2>

              {/* Saved address import */}
              {savedAddress && (
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 hover:bg-[var(--gold)]/10 transition-colors">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={useSavedAddress}
                        onChange={(e) => setUseSavedAddress(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div 
                        className="w-5 h-5 border rounded transition-colors flex items-center justify-center"
                        style={{
                          borderColor: "var(--gold)",
                          backgroundColor: useSavedAddress ? "var(--gold)" : "rgba(0,0,0,0.2)"
                        }}
                      >
                        <Check className={`w-3.5 h-3.5 text-black ${useSavedAddress ? "opacity-100" : "opacity-0"} transition-all`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--gold)]" />
                        <span className="text-sm font-medium text-[var(--ivory)]">Use my saved address</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {savedAddress.address1}{savedAddress.address2 ? `, ${savedAddress.address2}` : ""}, {savedAddress.city}, {savedAddress.state} — {savedAddress.pincode}
                      </p>
                    </div>
                  </label>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <div className="md:col-span-2">
                  <InputField
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    label="Address Line 1"
                    name="address1"
                    required
                    placeholder="House/Flat No., Building Name"
                  />
                </div>
                <div className="md:col-span-2">
                  <InputField
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    label="Address Line 2"
                    name="address2"
                    placeholder="Street, Area, Landmark"
                  />
                </div>
                <InputField
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  label="City"
                  name="city"
                  required
                  placeholder="Mumbai"
                />
                <InputField
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  label="State"
                  name="state"
                  required
                  placeholder="Maharashtra"
                />
                <InputField
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  label="Pincode"
                  name="pincode"
                  required
                  placeholder="400001"
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[var(--ivory)] mb-2">
                    Country <span className="text-[var(--gold)]">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all appearance-none"
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
            </section>

             {/* Delivery Information */}
            <section className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
              <h2 className="text-xl font-serif text-[var(--ivory)] mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-bold">
                  3
                </span>
                Delivery Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-[var(--gold)]/30 bg-[var(--gold)]/5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-medium text-[var(--ivory)]">
                      Standard Delivery
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {shipping === 0 ? "Free shipping applied" : `₹${settings.shipping.deliveryCharge} flat rate`}
                    </span>
                  </div>
                  <span className="text-[var(--gold)] font-medium">
                    {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                {settings.shipping.deliveryNotes && (
                  <p className="text-xs text-muted-foreground italic flex items-start gap-2">
                    <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {settings.shipping.deliveryNotes}
                  </p>
                )}
                {settings.shipping.freeShippingThreshold > 0 && shipping > 0 && (
                  <p className="text-xs text-[var(--gold)]/70 flex items-start gap-2">
                    Add ₹{(settings.shipping.freeShippingThreshold - subtotal).toFixed(0)} more for free shipping!
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              {/* Order Summary Card */}
              <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
                <h3 className="text-xl font-serif text-[var(--ivory)] mb-6">
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 relative border border-white/5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--gold)] rounded-full flex items-center justify-center text-[8px] font-bold text-black border-2 border-[#080e1a] z-10">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-serif text-[var(--ivory)] truncate">
                          {item.name}
                        </h4>
                        {item.size && (
                          <p className="text-xs text-muted-foreground">
                            Size: {item.size}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {currency}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-white">
                      {currency}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-white">
                      {shipping === 0
                        ? "Free"
                        : `${currency}${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-white/10">
                    <span className="text-[var(--ivory)] font-medium text-lg">
                      Total
                    </span>
                    <span className="text-3xl font-bold text-[var(--gold)]">
                      {currency}
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent">
                <h3 className="text-xl font-serif text-[var(--ivory)] mb-6 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] text-xs font-bold">
                    4
                  </span>
                  Payment
                </h3>

                {/* Test Mode Banner */}
                {isTestMode && (
                  <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                    <FlaskConical className="w-4 h-4 flex-shrink-0" />
                    Test mode active — no real payment will be charged.
                  </div>
                )}

                <div className="mb-6">
                  <div className="p-4 border-2 border-[var(--gold)]/50 bg-[var(--gold)]/5 rounded-xl flex items-center justify-between cursor-pointer relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-4 h-4 rounded-full border-4 border-[var(--gold)] bg-[#080e1a]" />
                      <span className="font-medium text-[var(--ivory)]">
                        {isTestMode ? "Test Checkout (No Payment)" : "Razorpay Secure Checkout"}
                      </span>
                    </div>
                    <div className="text-[var(--gold)] font-bold text-xs uppercase tracking-wider relative z-10 opacity-70">
                      {isTestMode ? "TEST" : "Razorpay"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5 justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {isTestMode
                      ? "Test mode: order will be created without payment."
                      : "Payments are securely processed through Razorpay."}
                  </p>
                </div>

                {/* Terms Checkbox */}
                <div className="mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div 
                        className="w-5 h-5 border rounded transition-colors flex items-center justify-center"
                        style={{
                          borderColor: "var(--gold)",
                          backgroundColor: termsAccepted ? "var(--gold)" : "rgba(0,0,0,0.2)"
                        }}
                      >
                        <Check
                          className={`w-3.5 h-3.5 text-black ${termsAccepted
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-50"
                            } transition-all`}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-[var(--gold)] hover:underline"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-[var(--gold)] hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={!termsAccepted || isProcessing}
                  className={`group relative flex items-center justify-center w-full px-8 py-5 rounded-full text-xs uppercase tracking-[0.2em] font-bold transition-all duration-500 overflow-hidden ${!termsAccepted
                    ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                    : "cursor-pointer bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.08] hover:border-[var(--gold)]/40 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(212,175,55,0.15)] disabled:opacity-70 disabled:cursor-wait"
                    }`}
                >
                  {termsAccepted && !isProcessing && (
                    <>
                      <div className="pointer-events-none absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                  )}
                  <span
                    className={`pointer-events-none relative z-10 flex items-center gap-2 transition-colors duration-300 ${!termsAccepted
                      ? "text-white/30"
                      : "text-white group-hover:text-[var(--gold)]"
                      }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Proceed To Payment
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <CheckoutPageInner />
    </Suspense>
  );
}
