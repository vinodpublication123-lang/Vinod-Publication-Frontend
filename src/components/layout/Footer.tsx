"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { siteConfig, navLinks } from "@/lib/config";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";

function PolicyModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 flex-shrink-0">
          <h2 className="font-serif text-xl text-[var(--ivory)]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
          {content ? (
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <p className="text-sm text-white/30 italic">
              No policy has been set yet. Please check back later.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const { settings } = useStoreSettings();
  const [modal, setModal] = useState<null | "terms" | "privacy" | "refund">(null);

  const policyContent = {
    terms: { title: "Terms of Service", content: settings.legal.termsAndConditions },
    privacy: { title: "Privacy Policy", content: settings.legal.privacyPolicy },
    refund: { title: "Refund Policy", content: settings.legal.refundPolicy },
  };

  return (
    <>
      {modal && (
        <PolicyModal
          title={policyContent[modal].title}
          content={policyContent[modal].content}
          onClose={() => setModal(null)}
        />
      )}

      <footer className="relative border-t border-border pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
            {/* Brand column */}
            <div className="md:col-span-5">
              <Link
                href="#home"
                className="font-serif text-3xl tracking-[0.15em] block mb-6 text-primary"
              >
                {siteConfig.name}
              </Link>
              <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed text-sm">
                {siteConfig.description}
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-3 md:col-start-7">
              <h4 className="text-xs uppercase tracking-[0.2em] text-[var(--gold)] mb-6 font-semibold">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect — dynamic from settings, no social links */}
            <div className="md:col-span-3">
              <h4 className="text-xs uppercase tracking-[0.2em] text-[var(--gold)] mb-6 font-semibold">
                Connect
              </h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                {settings.supportEmail && <li>{settings.supportEmail}</li>}
                {settings.supportPhone && <li>{settings.supportPhone}</li>}
                {settings.businessAddress && (
                  <li className="leading-relaxed">{settings.businessAddress}</li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <button
                onClick={() => setModal("privacy")}
                className="hover:text-primary transition-colors duration-300"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setModal("terms")}
                className="hover:text-primary transition-colors duration-300"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setModal("refund")}
                className="hover:text-primary transition-colors duration-300"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
