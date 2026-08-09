"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star as PhStar } from "@phosphor-icons/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { services } from "@/lib/data/services";
import { buttonVariants } from "@/components/ui/Button";

/* ─────────────────────────────── card component ─────────────────────────── */
function ServiceCard({
  service,
  isFeatured,
}: {
  service: (typeof services)[0];
  isFeatured: boolean;
}) {
  const Icon = service.icon;

  return (
    <motion.div
      animate={{
        scale: isFeatured ? 1 : 0.88,
        opacity: isFeatured ? 1 : 0.55,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full text-foreground flex flex-col",
          isFeatured
            ? [
                "border-[var(--gold)]/40",
                "bg-gradient-to-b from-[#0d1a30] via-[#101e38] to-[#0a1525]",
                "shadow-[0px_-12px_260px_0px_rgba(212,175,55,0.18)]",
                "z-20",
              ]
            : [
                "border-white/[0.06]",
                "bg-gradient-to-b from-[#0b1628] via-[#0d1a2e] to-[#091220]",
                "z-10",
              ]
        )}
      >
        {/* "Most Popular" badge — only for the Advanced Package */}
        {service.popular && (
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-30">
            <motion.div
              className="bg-[var(--gold)] py-1.5 px-4 rounded-full flex items-center gap-1.5"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <PhStar className="text-[var(--ink)] h-3.5 w-3.5" weight="fill" />
              <span className="text-[var(--ink)] text-xs font-semibold tracking-wide">
                Most Popular
              </span>
            </motion.div>
          </div>
        )}

        {/* Subtle inner glow for featured */}
        {isFeatured && (
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.06),transparent_60%)]" />
        )}

        <CardHeader className="pb-4">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
            className={cn(
              "mb-5 w-12 h-12 rounded-xl flex items-center justify-center",
              isFeatured ? "bg-[var(--gold)]/15" : "bg-[var(--gold)]/8"
            )}
          >
            <Icon className="w-6 h-6 text-[var(--gold)]" weight="duotone" />
          </motion.div>

        {/* Price */}
          <div className="mb-3">
            <span className="text-muted-foreground text-xs font-medium mr-1">₹</span>
            <span
              className={cn(
                "font-serif text-3xl font-bold tracking-tight",
                isFeatured ? "text-[var(--gold)]" : "text-foreground"
              )}
            >
              {service.price}
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-serif text-2xl mb-2 leading-tight",
              isFeatured ? "text-[var(--gold)]" : "text-foreground"
            )}
          >
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {service.description}
          </p>
        </CardHeader>

        <CardContent className="pt-0 flex flex-col flex-1">
          {/* Feature list */}
          <div className="flex-1 border-t border-white/[0.06] pt-5 space-y-3 mb-7">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold)]/70 mb-3">
              What&apos;s included
            </h4>
            <ul className="space-y-2.5">
              {service.features.map((feature, fi) => (
                <motion.li
                  key={feature}
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: fi * 0.07 }}
                >
                  <span className="flex-none w-4 h-4 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-[var(--gold)]" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTA button */}
          <a
            href="#publish"
            className={cn(
              buttonVariants({
                variant: isFeatured ? "gold" : "outline",
                size: "lg",
              }),
              "w-full text-center",
              !isFeatured &&
                "hover:bg-transparent hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
            )}
          >
            Enquire Now
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────── section ────────────────────────────────── */
export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1); // start at index 1 (Hybrid = "Most Popular")
  const total = services.length;

  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + total) % total),
    [total]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % total),
    [total]
  );

  // Touch/drag swipe support
  const dragStartX = useRef<number | null>(null);
  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    dragStartX.current =
      "touches" in e ? e.touches[0].clientX : e.clientX;
  }, []);
  const onDragEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (dragStartX.current === null) return;
      const endX =
        "changedTouches" in e
          ? e.changedTouches[0].clientX
          : e.clientX;
      const delta = dragStartX.current - endX;
      if (Math.abs(delta) > 50) {
        delta > 0 ? next() : prev();
      }
      dragStartX.current = null;
    },
    [next, prev]
  );

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
              Choose a publishing plan that fits your vision. Every package is crafted to bring your story to the world with the care it deserves.
            </TimelineContent>
          </article>

          {/* ── Carousel ── */}
          <div className="relative select-none">


            {/* Cards track */}
            <div
              className="overflow-hidden px-8 sm:px-24 cursor-grab active:cursor-grabbing"
              onMouseDown={onDragStart}
              onMouseUp={onDragEnd}
              onTouchStart={onDragStart}
              onTouchEnd={onDragEnd}
            >
              <div
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{
                  // centre the active card: shift by -(activeIndex) card widths
                  transform: `translateX(calc(50% - ${activeIndex} * (min(340px, 85vw) + 24px) - min(170px, 42.5vw)))`,
                }}
              >
                {services.map((service, index) => {
                  const isFeatured = index === activeIndex;
                  return (
                    <div
                      key={service.title}
                      className="shrink-0 pt-8 pb-4 cursor-pointer"
                      style={{ width: "min(340px, 85vw)" }}
                      onClick={() => setActiveIndex(index)}
                    >
                      <ServiceCard service={service} isFeatured={isFeatured} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {services.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to service ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === activeIndex
                      ? "w-6 h-2 bg-[var(--gold)]"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={prev}
                aria-label="Previous service"
                className="h-11 w-11 rounded-full border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-105 group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
              </button>
              <button
                onClick={next}
                aria-label="Next service"
                className="h-11 w-11 rounded-full border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-105 group"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom fade-out back to background ── */}
      <div className="h-24 bg-gradient-to-b from-[#080e1a] to-background pointer-events-none" />
    </section>
  );
}

