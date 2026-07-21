"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { addressesApi } from "@/lib/services";

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

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    addressesApi
      .list()
      .then((data) => setAddresses(data as ApiAddress[]))
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-[var(--ivory)]">My Profile</h2>
        <Link
          href="/account/profile/edit"
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 text-sm font-medium transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-2">
            <User size={18} className="text-[var(--gold)]" />
            <h3 className="font-semibold text-white">Personal Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Full Name</div>
                <div className="text-white">{user?.name ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Phone Number</div>
                <div className="text-white">{user?.phone ?? "—"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Email Address</div>
                <div className="text-white">{user?.email ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[var(--gold)]" />
              <h3 className="font-semibold text-white">Default Address</h3>
            </div>
            <Link href="/account/profile/edit" className="text-xs text-[var(--gold)] hover:underline">
              Edit
            </Link>
          </div>
          <div className="p-6 text-sm text-white/70 space-y-1">
            {addrLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : defaultAddress ? (
              <>
                <p className="font-medium text-white text-base mb-2">{defaultAddress.fullName}</p>
                <p>{defaultAddress.line1}</p>
                {defaultAddress.line2 && <p>{defaultAddress.line2}</p>}
                <p>
                  {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
                </p>
                <p>{defaultAddress.country}</p>
                <p className="mt-4 pt-4 border-t border-white/5">Phone: {defaultAddress.phone}</p>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm mb-3">No address saved yet.</p>
                <Link
                  href="/account/profile/edit"
                  className="text-xs text-[var(--gold)] hover:underline"
                >
                  Add an address
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
