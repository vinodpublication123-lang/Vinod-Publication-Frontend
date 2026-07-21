"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

export function Preloader() {
  const [show, setShow] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Small delay to trigger entry animations
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Start elegant fade out at 2.0s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Remove from DOM completely
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 2800);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080e1a] transition-all duration-700 ease-in-out ${isFadingOut ? "opacity-0 invisible blur-sm translate-y-4" : "opacity-100 visible blur-0 translate-y-0"
        }`}
    >
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-1000 ease-out ${isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        <div className="w-16 h-16 mb-8 rounded-full border border-[var(--gold)]/20 flex items-center justify-center bg-gradient-to-tr from-[var(--gold)]/10 to-transparent shadow-[0_0_60px_rgba(212,175,55,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--gold)]/20 animate-pulse" style={{ animationDuration: '3s' }} />
          <BookOpen className="w-6 h-6 text-[var(--gold)] relative z-10" />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-[var(--ivory)] tracking-[0.3em] uppercase mb-4 opacity-90">
          Vinverse
        </h1>

        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent mb-5" />

        <p className="text-xs tracking-[0.4em] text-[var(--gold)] uppercase font-medium opacity-70">
          Publication
        </p>
      </div>

      {/* Elegant Cinematic Loading Bar */}
      <div
        className={`absolute bottom-20 w-64 h-[1px] bg-white/5 overflow-hidden transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"
          }`}
      >
        <div
          className="h-full bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent w-full origin-left translate-x-[-100%]"
          style={{ animation: "loading-bar-smooth 2s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
        />
      </div>
    </div>
  );
}
