"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { CheckCircle, AlertCircle } from "lucide-react";
import { inquiriesApi } from "@/lib/services";

const INQUIRY_TYPE_MAP: Record<string, string> = {
  publish: "PUBLISH_WITH_US",
  author: "AUTHOR_INQUIRY",
  collab: "COLLABORATION",
  general: "GENERAL",
  other: "OTHER",
};

export function PublishWithUs() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [inquiryType, setInquiryType] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") as string).trim();
    const email = (data.get("email") as string).trim();
    const phone = (data.get("phone") as string).trim();
    const typeRaw = (data.get("type") as string) || "general";
    const message = (data.get("message") as string).trim();

    try {
      await inquiriesApi.submit({
        name,
        email,
        phone: phone || undefined,
        type: INQUIRY_TYPE_MAP[typeRaw] ?? "GENERAL",
        message,
      });
      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section id="publish" className="relative py-32">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold mb-6 block"
          >
            Start Your Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl tracking-tight"
          >
            Publish With Us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg mt-4"
          >
            Ready to bring your story to life? Connect with our editorial team.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 md:p-12"
        >
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 text-[var(--gold)] mx-auto mb-6" />
              <h3 className="font-serif text-3xl mb-4">Inquiry Received</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Thank you for your interest. Our editorial team will review your
                submission and contact you shortly.
              </p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => setStatus("idle")}
              >
                Submit Another Inquiry
              </Button>
            </motion.div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{errorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--gold)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--gold)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--gold)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    Inquiry Type
                  </label>
                  <input type="hidden" name="type" value={inquiryType} />
                  <SelectDropdown
                    value={inquiryType}
                    onChange={setInquiryType}
                    options={[
                      { value: "publish", label: "Publish a Book" },
                      { value: "author", label: "Author Inquiry" },
                      { value: "collab", label: "Collaboration" },
                      { value: "general", label: "General Inquiry" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  minLength={5}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-[var(--gold)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300 resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>

              <Button
                type="submit"
                size="xl"
                variant="gold"
                className="w-full rounded-lg"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
