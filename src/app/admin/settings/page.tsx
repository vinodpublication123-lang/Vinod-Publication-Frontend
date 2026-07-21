"use client";

import { useState, useEffect } from "react";
import { Save, Store, Mail, Phone, MapPin, Truck, Shield } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { toast } from "sonner";
import { storeSettingsApi } from "@/lib/services";
import { bustSettingsCache } from "@/lib/hooks/useStoreSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);

  // General Info
  const [storeName, setStoreName] = useState("VINVERSE Publication");
  const [supportEmail, setSupportEmail] = useState("support@vinodnaraen.com");
  const [supportPhone, setSupportPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");



  // Shipping
  const [deliveryCharge, setDeliveryCharge] = useState("50");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("1500");
  const [deliveryNotes, setDeliveryNotes] = useState("Please allow 3-5 business days for standard delivery within India.");

  // Legal
  const [terms, setTerms] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [refund, setRefund] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // ── Load existing settings on mount ────────────────────────────────────────
  useEffect(() => {
    storeSettingsApi.get()
      .then((data) => {
        if (data.storeName) setStoreName(data.storeName as string);
        if (data.supportEmail) setSupportEmail(data.supportEmail as string);
        if (data.supportPhone) setSupportPhone(data.supportPhone as string);

        const meta = (data.metadata ?? {}) as Record<string, unknown>;

        if (meta.businessAddress) setBusinessAddress(meta.businessAddress as string);

        const shipping = (meta.shipping ?? {}) as Record<string, unknown>;
        if (shipping.deliveryCharge !== undefined) setDeliveryCharge(String(shipping.deliveryCharge));
        if (shipping.freeShippingThreshold !== undefined) setFreeShippingThreshold(String(shipping.freeShippingThreshold));
        if (shipping.deliveryNotes) setDeliveryNotes(shipping.deliveryNotes as string);

        const legal = (meta.legal ?? {}) as Record<string, unknown>;
        if (legal.termsAndConditions) setTerms(legal.termsAndConditions as string);
        if (legal.privacyPolicy) setPrivacy(legal.privacyPolicy as string);
        if (legal.refundPolicy) setRefund(legal.refundPolicy as string);


      })
      .catch(() => {
        // Settings not found yet — defaults are fine
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);

    const payload = {
      storeName,
      supportEmail,
      supportPhone: supportPhone || undefined,
      currency: "INR",
      metadata: {
        businessAddress,
        shipping: {
          deliveryCharge: parseFloat(deliveryCharge) || 0,
          freeShippingThreshold: parseFloat(freeShippingThreshold) || 0,
          deliveryNotes,
        },
        legal: {
          termsAndConditions: terms,
          privacyPolicy: privacy,
          refundPolicy: refund,
        },

      },
    };

    try {
      await storeSettingsApi.update(payload);
      bustSettingsCache(); // Clear frontend cache so footer/contact update instantly
      toast.success("Settings saved successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[var(--ivory)]">Store Settings</h2>
          <p className="text-sm text-white/50">Configure your website, payment gateways, and policies.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait"
        >
          {isSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: "general", label: "General Info", icon: Store },
              { id: "shipping", label: "Shipping Rules", icon: Truck },
              { id: "legal", label: "Legal Policies", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 shadow-[0_4px_20px_rgba(212,175,55,0.05)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">

            {/* ── General Information ──────────────────────────────────────── */}
            <div className={activeTab === "general" ? "block" : "hidden"}>
              <DashboardCard title="Store & Contact Information">
                <div className="p-6 space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Store Name</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Support Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full bg-[#080e1a] border border-white/10 rounded-md py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Support Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        placeholder="+91"
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Business Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <textarea
                        rows={3}
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Full operational address..."
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md py-2.5 pl-9 pr-4 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                </div>
              </DashboardCard>
            </div>


            {/* ── Shipping ─────────────────────────────────────────────────── */}
            <div className={activeTab === "shipping" ? "block" : "hidden"}>
              <DashboardCard title="Shipping Configuration">
                <div className="p-6 space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Default Delivery Charge (₹)</label>
                      <input
                        type="number"
                        value={deliveryCharge}
                        onChange={(e) => setDeliveryCharge(e.target.value)}
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Free Shipping Threshold (₹)</label>
                      <input
                        type="number"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                      />
                      <p className="text-xs text-white/30">Orders above this amount get free shipping.</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Delivery Notes / Warning Message</label>
                    <textarea
                      rows={3}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none"
                    />
                    <p className="text-xs text-white/40">This message will appear on the checkout page.</p>
                  </div>

                </div>
              </DashboardCard>
            </div>

            {/* ── Legal ────────────────────────────────────────────────────── */}
            <div className={activeTab === "legal" ? "block" : "hidden"}>
              <DashboardCard title="Legal Policies">
                <div className="p-6 space-y-6">

                  {[
                    { label: "Terms & Conditions", value: terms, setter: setTerms, placeholder: "Enter your full terms of service..." },
                    { label: "Privacy Policy", value: privacy, setter: setPrivacy, placeholder: "Enter your privacy policy..." },
                    { label: "Refund Policy", value: refund, setter: setRefund, placeholder: "Enter your refund policy..." },
                  ].map((field) => (
                    <div key={field.label} className="space-y-2">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{field.label}</label>
                      <textarea
                        rows={4}
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors resize-none font-mono text-sm"
                      />
                    </div>
                  ))}

                </div>
              </DashboardCard>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
