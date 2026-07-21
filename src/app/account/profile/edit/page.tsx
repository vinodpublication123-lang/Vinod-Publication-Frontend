"use client";

import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { addressesApi, usersApi } from "@/lib/services";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ApiAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function EditProfilePage() {
  const { user, checkAuth } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Address fields
  const [existingAddressId, setExistingAddressId] = useState<string | null>(null);
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrCountry, setAddrCountry] = useState("India");
  const [addrIsDefault, setAddrIsDefault] = useState(true);

  // Load user + default address
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setPhone(user.phone || "");

    addressesApi
      .list()
      .then((data) => {
        const addresses = data as ApiAddress[];
        const def = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (def) {
          setExistingAddressId(def.id);
          setAddrFullName(def.fullName || "");
          setAddrPhone(def.phone || "");
          setAddrLine1(def.line1 || "");
          setAddrLine2(def.line2 || "");
          setAddrCity(def.city || "");
          setAddrState(def.state || "");
          setAddrPostal(def.postalCode || "");
          setAddrCountry(def.country || "India");
          setAddrIsDefault(def.isDefault);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      // Update profile
      await usersApi.updateProfile({ name: name.trim(), phone: phone.trim() || undefined });

      // Update or create address if line1 is filled
      if (addrLine1.trim()) {
        const addrPayload = {
          fullName: addrFullName || name,
          phone: addrPhone || phone,
          line1: addrLine1,
          line2: addrLine2 || undefined,
          city: addrCity,
          state: addrState,
          postalCode: addrPostal,
          country: addrCountry,
          isDefault: addrIsDefault,
        };
        if (existingAddressId) {
          await addressesApi.update(existingAddressId, addrPayload);
        } else {
          await addressesApi.create(addrPayload);
        }
      }

      toast.success("Profile updated successfully");
      // Refresh auth context so header shows updated name
      await checkAuth();
      router.push("/account/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/account/profile" className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl font-serif text-[var(--ivory)]">Edit Profile</h2>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/account/profile" className="flex-1 sm:flex-none px-4 py-2 border border-white/10 text-white/70 rounded-md text-sm font-medium hover:bg-white/5 transition-colors text-center">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#080e1a] rounded-md text-sm font-bold hover:bg-[var(--gold-light)] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DashboardCard title="Personal Information">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-black/40 border border-white/5 rounded-md px-4 py-2.5 text-white/50 cursor-not-allowed"
                />
                <p className="text-xs text-white/30">Email address cannot be changed.</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Default Address">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={addrFullName}
                  onChange={(e) => setAddrFullName(e.target.value)}
                  placeholder="Recipient name"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Address Line 1</label>
                <input
                  type="text"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="House/Flat No., Building Name"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Address Line 2</label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  placeholder="Street, Area, Landmark"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  value={addrPostal}
                  onChange={(e) => setAddrPostal(e.target.value)}
                  placeholder="400001"
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Country</label>
                <select
                  value={addrCountry}
                  onChange={(e) => setAddrCountry(e.target.value)}
                  className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
                >
                  <option value="India">India</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="rounded border-white/20 bg-black/20 text-[var(--gold)] focus:ring-[var(--gold)] w-5 h-5"
                  />
                  <span className="text-sm text-white">Set as Default Address</span>
                </label>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
