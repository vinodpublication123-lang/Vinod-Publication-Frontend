/**
 * useStoreSettings
 * Fetches and caches store settings from the backend.
 * Used by Contact, Checkout, and any other dynamic section.
 */
import { useEffect, useState } from "react";
import { storeSettingsApi } from "@/lib/services";

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  businessAddress: string;
  shipping: {
    deliveryCharge: number;
    freeShippingThreshold: number;
    deliveryNotes: string;
  };
  legal: {
    termsAndConditions: string;
    privacyPolicy: string;
    refundPolicy: string;
  };
  payment: {
    rzpKeyId: string;
    testMode: boolean;
  };
}

const DEFAULTS: StoreSettings = {
  storeName: "VINVERSE Publication",
  supportEmail: "hello@vinverse.com",
  supportPhone: "",
  currency: "INR",
  businessAddress: "",
  shipping: {
    deliveryCharge: 50,
    freeShippingThreshold: 1500,
    deliveryNotes: "Please allow 3-5 business days for standard delivery within India.",
  },
  legal: {
    termsAndConditions: "",
    privacyPolicy: "",
    refundPolicy: "",
  },
  payment: {
    rzpKeyId: "",
    testMode: false,
  },
};

// Simple module-level cache so we don't refetch on every component mount
let cachedSettings: StoreSettings | null = null;
let fetchPromise: Promise<StoreSettings> | null = null;

function fetchAndCache(): Promise<StoreSettings> {
  if (fetchPromise) return fetchPromise;

  fetchPromise = storeSettingsApi
    .get()
    .then((raw) => {
      const meta = ((raw.metadata as Record<string, unknown>) ?? {}) as Record<string, unknown>;
      const shipping = ((meta.shipping as Record<string, unknown>) ?? {}) as Record<string, unknown>;
      const legal = ((meta.legal as Record<string, unknown>) ?? {}) as Record<string, unknown>;
      const payment = ((meta.payment as Record<string, unknown>) ?? {}) as Record<string, unknown>;

      const settings: StoreSettings = {
        storeName: (raw.storeName as string) || DEFAULTS.storeName,
        supportEmail: (raw.supportEmail as string) || DEFAULTS.supportEmail,
        supportPhone: (raw.supportPhone as string) || DEFAULTS.supportPhone,
        currency: (raw.currency as string) || DEFAULTS.currency,
        businessAddress: (meta.businessAddress as string) || DEFAULTS.businessAddress,
        shipping: {
          deliveryCharge:
            shipping.deliveryCharge !== undefined
              ? Number(shipping.deliveryCharge)
              : DEFAULTS.shipping.deliveryCharge,
          freeShippingThreshold:
            shipping.freeShippingThreshold !== undefined
              ? Number(shipping.freeShippingThreshold)
              : DEFAULTS.shipping.freeShippingThreshold,
          deliveryNotes:
            (shipping.deliveryNotes as string) || DEFAULTS.shipping.deliveryNotes,
        },
        legal: {
          termsAndConditions: (legal.termsAndConditions as string) || "",
          privacyPolicy: (legal.privacyPolicy as string) || "",
          refundPolicy: (legal.refundPolicy as string) || "",
        },
        payment: {
          rzpKeyId: (payment.rzpKeyId as string) || "",
          testMode: payment.testMode === true,
        },
      };

      cachedSettings = settings;
      return settings;
    })
    .catch(() => {
      fetchPromise = null; // Allow retry
      return DEFAULTS;
    });

  return fetchPromise;
}

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings ?? DEFAULTS);
  const [isLoading, setIsLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setIsLoading(false);
      return;
    }

    fetchAndCache().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  return { settings, isLoading };
}

/** Call this from server-side / layout to bust the cache after admin saves */
export function bustSettingsCache() {
  cachedSettings = null;
  fetchPromise = null;
}
