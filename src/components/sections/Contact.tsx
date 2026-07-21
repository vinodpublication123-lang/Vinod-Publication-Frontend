"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";

export function Contact() {
  const { settings } = useStoreSettings();

  const contactCards = [
    {
      icon: Mail,
      title: "Email Us",
      value: settings.supportEmail,
      delay: 0.1,
    },
    {
      icon: Phone,
      title: "Call Us",
      value: settings.supportPhone || "Contact us via email",
      delay: 0.2,
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: settings.businessAddress || "Available on request",
      delay: 0.3,
    },
  ];

  return (
    <section id="contact" className="relative py-24">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold mb-6 block"
          >
            Reach Out
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl tracking-tight"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4"
          >
            We welcome correspondence from authors, agents, and readers alike.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {contactCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: card.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-[var(--gold)]/20 group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-5 group-hover:bg-[var(--gold)]/20 transition-colors duration-500">
                  <Icon size={22} className="text-[var(--gold)]" />
                </div>
                <h3 className="font-serif text-lg mb-3">{card.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.value}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
