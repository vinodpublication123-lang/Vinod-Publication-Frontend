"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WordsPullUp } from "@/components/ui/words-pull-up";
import { siteConfig } from "@/lib/config";

const VIDEO_SRC = "/Publication-Hero.mp4";

/*
  Pure cinema dissolve — two identical videos take turns.
  When the foreground nears its end, the background starts playing from 0
  and we do a gentle opacity dissolve between them. Both videos stay LIVE
  and playing throughout — no freezes, no canvas, no overlays. Just a
  smooth, classy cross-dissolve like in film.
*/
const CROSSFADE_START_BEFORE_END = 1.0; // seconds — mid-point between too early and too late
const CROSSFADE_DURATION = 2500;         // ms — long, gentle dissolve

export function Hero() {
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const foreground = useRef<"A" | "B">("A");
  const fading = useRef(false);
  const rafId = useRef<number | null>(null);
  const fadeStart = useRef<number | null>(null);

  useEffect(() => {
    const a = vidA.current;
    const b = vidB.current;
    if (!a || !b) return;

    // A is foreground, B is behind and invisible
    a.style.opacity = "1";
    a.style.zIndex = "2";
    b.style.opacity = "0";
    b.style.zIndex = "1";

    const runDissolve = (outgoing: HTMLVideoElement, incoming: HTMLVideoElement) => {
      fading.current = true;

      // Start the incoming video from the beginning
      incoming.currentTime = 0;
      incoming.play().catch(() => { });

      fadeStart.current = null;

      const step = (now: number) => {
        if (fadeStart.current === null) fadeStart.current = now;
        const raw = Math.min((now - fadeStart.current) / CROSSFADE_DURATION, 1);
        // Smoothstep for natural feel: 3t² - 2t³
        const t = raw * raw * (3 - 2 * raw);

        // Incoming fades up, outgoing fades down — both are LIVE video
        incoming.style.opacity = String(t);
        outgoing.style.opacity = String(1 - t);

        if (t < 1) {
          rafId.current = requestAnimationFrame(step);
        } else {
          // Dissolve complete — swap roles
          outgoing.pause();
          outgoing.currentTime = 0;
          outgoing.style.opacity = "0";
          incoming.style.opacity = "1";

          // Swap z-index so new foreground is on top
          incoming.style.zIndex = "2";
          outgoing.style.zIndex = "1";

          foreground.current = foreground.current === "A" ? "B" : "A";
          fading.current = false;
        }
      };

      rafId.current = requestAnimationFrame(step);
    };

    const onTimeUpdate = (ev: Event) => {
      if (fading.current) return;
      const el = ev.currentTarget as HTMLVideoElement;
      const { duration, currentTime } = el;
      if (!duration || isNaN(duration)) return;

      // Only trigger from whichever video is currently foreground
      const isForeground =
        (foreground.current === "A" && el === a) ||
        (foreground.current === "B" && el === b);
      if (!isForeground) return;

      if (duration - currentTime <= CROSSFADE_START_BEFORE_END) {
        const outgoing = foreground.current === "A" ? a : b;
        const incoming = foreground.current === "A" ? b : a;
        runDissolve(outgoing, incoming);
      }
    };

    a.addEventListener("timeupdate", onTimeUpdate);
    b.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      a.removeEventListener("timeupdate", onTimeUpdate);
      b.removeEventListener("timeupdate", onTimeUpdate);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section id="home" className="h-[100dvh] w-full section-fade-out">
      <div className="relative h-full w-full overflow-hidden">

        {/* Video A — starts as foreground */}
        <video
          ref={vidA}
          autoPlay
          muted
          playsInline
          preload="auto"
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ zIndex: 2, opacity: 1 }}
        />

        {/* Video B — starts hidden, takes over during dissolve */}
        <video
          ref={vidB}
          muted
          playsInline
          preload="auto"
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ zIndex: 1, opacity: 0 }}
        />

        {/* Noise overlay */}
        <div
          className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay"
          style={{ zIndex: 3 }}
        />

        {/* Gradient overlay — darker at top and bottom, fades to navy */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080e1a]/50 via-transparent to-[#080e1a]/90"
          style={{ zIndex: 4 }}
        />

        {/* Hero content — pb-24 keeps buttons above the 80 px section-fade strip */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-24 sm:px-8 md:px-12 lg:px-16"
          style={{ zIndex: 5 }}
        >
          {/* Mobile: stacked layout */}
          <div className="flex flex-col lg:hidden gap-7 pb-4">
            <h1
              className="font-serif font-medium leading-[0.85] tracking-[-0.04em] text-[18vw] sm:text-[16vw]"
              style={{ color: "#E1E0CC" }}
            >
              <WordsPullUp text={siteConfig.name} />
            </h1>

            <motion.span
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold"
            >
              {siteConfig.tagline}
            </motion.span>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm text-primary/70 leading-relaxed max-w-md"
            >
              {siteConfig.description}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-3"
            >
              <a
                href="#books"
                className="group inline-flex items-center gap-2 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-primary-foreground transition-all hover:gap-3"
              >
                Explore Our Publications
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] transition-transform group-hover:scale-110">
                  <ArrowRight className="h-4 w-4" style={{ color: "#E1E0CC" }} />
                </span>
              </a>
              <a
                href="#publish"
                className="inline-flex items-center rounded-full border border-primary/30 py-2.5 px-5 text-sm font-medium text-primary/80 transition-all hover:border-primary/60 hover:text-primary"
              >
                Dare to Publish?
              </a>
            </motion.div>
          </div>

          {/* Desktop: grid layout — wider gap, more padding between wordmark & text */}
          <div className="hidden lg:grid grid-cols-12 items-end gap-10 xl:gap-14">
            <div className="col-span-7 xl:col-span-7 min-w-0">
              <h1
                className="max-w-full font-serif font-medium leading-[0.85] tracking-[-0.04em] text-[clamp(5.5rem,9vw,8rem)] xl:text-[clamp(7rem,10vw,11.5rem)] 2xl:text-[clamp(8rem,10.5vw,13rem)]"
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp text={siteConfig.name} />
              </h1>
            </div>

            <div className="col-span-5 lg:col-start-9 lg:col-span-4 min-w-0 flex flex-col gap-6 pb-0">
              <motion.span
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold"
              >
                {siteConfig.tagline}
              </motion.span>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm xl:text-base text-primary/70 leading-relaxed max-w-lg"
              >
                {siteConfig.description}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <a
                  href="#books"
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-primary py-1.5 pl-6 pr-1.5 text-sm font-medium text-primary-foreground transition-all hover:gap-3"
                >
                  Explore Our Publications
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] transition-transform group-hover:scale-110">
                    <ArrowRight className="h-4 w-4" style={{ color: "#E1E0CC" }} />
                  </span>
                </a>
                <a
                  href="#publish"
                  className="inline-flex items-center self-start rounded-full border border-primary/30 py-2.5 px-6 text-sm font-medium text-primary/80 transition-all hover:border-primary/60 hover:text-primary"
                >
                  Dare to Publish?
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
