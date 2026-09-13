"use client";

import { useRef } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

const packageInquiryUrl =
  "https://wa.me/919363275290?text=Hi%20VINVERSE%20Publication%2C%20I%20would%20like%20to%20know%20more%20about%20your%20publishing%20packages%20and%20prices.";

/* ─────────────────────────────── section ────────────────────────────────── */
export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const headingVariants = {
    hidden: { opacity: 0, y: -16, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" as const },
    }),
  };

  return (
    <section id="services" ref={sectionRef} className="relative overflow-hidden section-fade-out">
      {/* ── Top fade-in from the background ── */}
      <div className="h-24 bg-gradient-to-b from-background to-[#080e1a] pointer-events-none" />

      {/* ── Main dark panel ── */}
      <div className="relative w-full py-24 sm:py-32 bg-[#080e1a]">

        {/* Sparkle particle field */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(55%_55%,white,transparent)]">
          <Sparkles
            density={700}
            speed={0.6}
            color="#d4af37"
            opacity={0.55}
            className="absolute inset-x-0 bottom-0 h-full w-full"
          />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#e1e0cc 1px,transparent 1px),linear-gradient(to bottom,#e1e0cc 1px,transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* Deep gold radial glow */}
        <div
          className="pointer-events-none absolute top-0 left-[10%] right-[10%] w-[80%] h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(212,175,55,0.07) 0%, transparent 65%)",
          }}
        />

        {/* ── Section header ── */}
        <div className="relative z-10 container mx-auto px-6">
          <article className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <TimelineContent
              as="span"
              animationNum={0}
              timelineRef={sectionRef}
              customVariants={headingVariants}
              className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold block"
            >
              What We Offer
            </TimelineContent>

            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-foreground">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.12}
                staggerFrom="first"
                containerClassName="justify-center"
                wordLevelClassName="pb-2"
                transition={{ type: "spring", stiffness: 240, damping: 38, delay: 0.1 }}
              >
                Publishing Packages
              </VerticalCutReveal>
            </h2>

            <TimelineContent
              as="p"
              animationNum={1}
              timelineRef={sectionRef}
              customVariants={headingVariants}
              className="text-muted-foreground text-lg"
            >
              If you want to find out more about packages and prices, connect with us directly.
            </TimelineContent>
          </article>

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Send us a quick message on WhatsApp and our team will share the
              package options, pricing details, and the best fit for your book.
            </p>
            <a
              href={packageInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "gold", size: "lg" }),
                "gap-2.5"
              )}
            >
              <WhatsappLogo className="h-5 w-5" weight="fill" aria-hidden="true" />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom fade-out back to background ── */}
      <div className="h-24 bg-gradient-to-b from-[#080e1a] to-background pointer-events-none" />
    </section>
  );
}

