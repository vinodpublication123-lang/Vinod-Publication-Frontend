"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { processSteps } from "@/lib/data/process";

function generateZigZagPath(
  stepCount: number,
  containerWidth: number,
  stepHeight: number,
  dotTop: number
): string {
  const centerX = containerWidth / 2;
  const leftBendX = centerX - containerWidth * 0.22;
  const rightBendX = centerX + containerWidth * 0.22;

  let path = `M ${centerX} ${dotTop}`;

  for (let i = 0; i < stepCount - 1; i++) {
    const currentDotY = dotTop + i * stepHeight;
    const nextDotY = dotTop + (i + 1) * stepHeight;
    const bendX = i % 2 === 0 ? rightBendX : leftBendX;
    const cp1Y = currentDotY + stepHeight * 0.28;
    const cp2Y = nextDotY - stepHeight * 0.28;

    path += ` C ${bendX} ${cp1Y}, ${bendX} ${cp2Y}, ${centerX} ${nextDotY}`;
  }

  return path;
}

export function PublishingProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.75"],
  });

  // Map scroll progress to path drawing (0 = hidden, 1 = fully drawn)
  const pathProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const STEP_HEIGHT = 280;
  const DOT_CENTER_Y = 40;
  const SVG_WIDTH = 600;
  const SVG_HEIGHT = STEP_HEIGHT * processSteps.length;

  const svgPath = generateZigZagPath(
    processSteps.length,
    SVG_WIDTH,
    STEP_HEIGHT,
    DOT_CENTER_Y
  );

  return (
    <section id="process" className="relative py-32 overflow-hidden section-fade-out">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold mb-6 block"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl tracking-tight"
          >
            The Publishing Process
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4"
          >
            A meticulous, transparent journey from manuscript to masterpiece.
          </motion.p>
        </div>

        {/* Timeline container */}
        <div ref={sectionRef} className="max-w-5xl mx-auto relative">
          {/* SVG zig-zag path — hidden on mobile, visible on sm+ */}
          <div className="hidden sm:block absolute inset-0 pointer-events-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              fill="none"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Background path (dim) */}
              <path
                d={svgPath}
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.1"
              />
              {/* Animated foreground path */}
              <motion.path
                d={svgPath}
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                style={{
                  pathLength: pathProgress,
                }}
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Steps */}
          <div className="relative z-10">
            {processSteps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={step.id}
                  className="relative"
                  style={{ height: `${STEP_HEIGHT}px` }}
                >
                  {/* Dot */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    className="absolute left-1/2 -translate-x-1/2 z-20 hidden sm:block"
                    style={{ top: `${DOT_CENTER_Y - 8}px` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-[var(--gold)] ring-4 ring-[var(--gold)]/20 ring-offset-2 ring-offset-background shadow-lg shadow-[var(--gold)]/20" />
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, y: 0, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.15,
                    }}
                    className={`absolute top-0 w-full sm:w-[45%] ${
                      isEven
                        ? "left-0 sm:left-[55%]"
                        : "left-0 sm:right-0 sm:left-auto sm:mr-[55%]"
                    } ${
                      isEven ? "sm:pl-10" : "sm:pr-10 sm:text-right"
                    }`}
                  >
                    <div className="relative rounded-xl border border-border bg-background/60 backdrop-blur-sm p-6 md:p-8 transition-all duration-500 hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-[var(--gold)]/5 group">
                      {/* Step number watermark */}
                      <span className="font-serif text-7xl font-bold text-[var(--gold)]/[0.07] absolute top-2 right-4 select-none group-hover:text-[var(--gold)]/[0.15] transition-colors duration-700">
                        0{step.id}
                      </span>

                      {/* Mobile dot indicator */}
                      <div className="sm:hidden w-2.5 h-2.5 rounded-full bg-[var(--gold)] mb-4" />

                      <h3 className="font-serif text-xl md:text-2xl mb-3 relative z-10 group-hover:text-[var(--gold)] transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed relative z-10 text-sm md:text-base">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
