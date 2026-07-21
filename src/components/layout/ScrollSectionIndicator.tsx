"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "home",    label: "Home" },
  { id: "about",   label: "About" },
  { id: "services",label: "Services" },
  { id: "process", label: "Process" },
  { id: "books",   label: "Books" },
  { id: "authors", label: "Authors" },
  { id: "publish", label: "Publish" },
  { id: "contact", label: "Contact" },
];

export function ScrollSectionIndicator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);

  /* ── IntersectionObserver: track which section occupies the viewport ── */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }, index) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(index);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* ── Compute the vertical position of the active dot ── */
  const getActiveDotY = () => {
    const dot = dotRefs.current[activeIndex];
    const rail = railRef.current;
    if (!dot || !rail) return 0;
    const railRect = rail.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    return dotRect.top - railRect.top + dotRect.height / 2;
  };

  const [glowY, setGlowY] = useState(0);

  useEffect(() => {
    // slight delay so layout is settled before measuring
    const id = setTimeout(() => setGlowY(getActiveDotY()), 60);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center select-none">
      {/* Outer wrapper to allow label overflow on the left */}
      <div ref={railRef} className="relative flex flex-col items-center gap-0">

        {/* ── Vertical rail line ── */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-[var(--gold)]/20 to-transparent" />

        {/* ── Glowing active tracker (moves between dots) ── */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          animate={{ top: glowY }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{ translateY: "-50%" }}
        >
          {/* outer soft glow halo */}
          <div className="w-5 h-5 rounded-full bg-[var(--gold)]/10 blur-sm absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
          {/* inner crisp dot */}
          <div className="w-2 h-2 rounded-full bg-[var(--gold)] shadow-[0_0_6px_2px_rgba(212,175,55,0.5)] relative z-10" />
        </motion.div>

        {/* ── Section dots ── */}
        {SECTIONS.map(({ id, label }, index) => {
          const isActive = index === activeIndex;
          const isHovered = index === hoveredIndex;

          return (
            <button
              key={id}
              ref={(el) => { dotRefs.current[index] = el; }}
              onClick={() => scrollToSection(id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              aria-label={`Scroll to ${label}`}
              className="relative flex items-center justify-center w-6 h-7 group"
            >
              {/* Inactive dot */}
              <motion.span
                animate={{
                  scale: isActive ? 0 : 1,
                  opacity: isActive ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="block w-1 h-1 rounded-full bg-[var(--gold)]/30"
              />

              {/* Label tooltip — appears on hover, slides in from right */}
              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-[calc(100%+10px)] whitespace-nowrap text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--gold)]/70 pointer-events-none"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}
