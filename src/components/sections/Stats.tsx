"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "@/lib/data/stats";

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, inView]);

  return (
    <span ref={ref} className="font-serif text-5xl md:text-6xl lg:text-7xl text-[var(--gold)] block tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative py-24 overflow-hidden section-fade-out">
      {/* Subtle divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center gap-3"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="text-muted-foreground text-xs sm:text-sm uppercase tracking-[0.2em]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
