"use client";
/* eslint-disable react-hooks/static-components */

import { ElementType, ReactNode, RefObject, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  as?: ElementType;
  animationNum?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timelineRef?: RefObject<any>;
  customVariants?: Variants;
  className?: string;
  children?: ReactNode;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.15,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

/**
 * Scroll-triggered animation wrapper.
 * Mirrors the behaviour of the original TimelineContent from the pricing-section
 * reference — each child animates in via whileInView with a stagger based on
 * `animationNum`.
 */
export function TimelineContent({
  as: Tag = "div",
  animationNum = 0,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  // motion() wraps any HTML element or component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionTag = useMemo(() => motion(Tag as any), [Tag]);

  return (
    <MotionTag
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={customVariants ?? defaultVariants}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}
