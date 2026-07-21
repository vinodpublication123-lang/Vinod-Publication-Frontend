"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { booksApi, ApiBook } from "@/lib/services";
import { BookModal } from "@/components/ui/BookModal";

/* ─── Config ─────────────────────────────────────────────────────────────── */
const SCROLL_SPEED = 0.6;        // px per frame (~36px/s at 60 fps)
const RESUME_DELAY = 3000;       // ms idle before auto-scroll resumes

/* ─── Map ApiBook → shape expected by BookModal ──────────────────────────── */
function toModalBook(book: ApiBook & { author: { name: string; avatarUrl?: string | null } | null }) {
  return {
    id: book.id,
    title: book.title,
    author: book.author?.name ?? "Unknown Author",
    authorImage: book.author?.avatarUrl ?? null,
    cover: book.coverUrl ?? "/placeholder-book.jpg",
    description: book.shortDescription ?? "",
    fullDescription: book.fullDescription ?? book.shortDescription ?? "",
    genre: book.genre ?? "Fiction",
    publicationDate: book.publicationDate ?? "",
    buyLink: `/books/${book.slug}`,
    hasSong: book.qrEnabled && !!book.qrSongUrl,
    songTitle: book.qrSongTitle ?? undefined,
    songUrl: book.qrSongUrl ?? undefined,
  };
}

type ModalBook = ReturnType<typeof toModalBook>;

export function Books() {
  const [books, setBooks] = useState<(ApiBook & { author: { name: string; avatarUrl?: string | null } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<ModalBook | null>(null);

  useEffect(() => {
    booksApi.list({ limit: 50 })
      .then((res) => setBooks(res.items as never))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── Refs ──────────────────────────────────────────────────────────────── */
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isManual = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  /* ── rAF auto-scroll loop ──────────────────────────────────────────────── */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || books.length === 0) return;

    function tick() {
      if (!el || !blockRef.current) return;
      const blockWidth = blockRef.current.offsetWidth;
      if (!isManual.current) el.scrollLeft += SCROLL_SPEED;
      if (blockWidth > 0) {
        if (el.scrollLeft >= 2 * blockWidth) el.scrollLeft -= blockWidth;
        else if (el.scrollLeft < blockWidth) el.scrollLeft += blockWidth;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [books]);

  const takeManualControl = useCallback(() => {
    isManual.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { isManual.current = false; }, RESUME_DELAY);
  }, []);

  const scrollLeft = useCallback(() => {
    takeManualControl();
    if (wrapRef.current) wrapRef.current.scrollBy({ left: -350, behavior: "smooth" });
  }, [takeManualControl]);

  const scrollRight = useCallback(() => {
    takeManualControl();
    if (wrapRef.current) wrapRef.current.scrollBy({ left: 350, behavior: "smooth" });
  }, [takeManualControl]);

  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    takeManualControl();
    const el = wrapRef.current;
    if (!el) return;
    let lastX = e.pageX - el.offsetLeft;
    el.style.cursor = "grabbing";
    const onMove = (ev: MouseEvent) => {
      const x = ev.pageX - el.offsetLeft;
      el.scrollLeft -= x - lastX;
      lastX = x;
    };
    const onUp = () => {
      el.style.cursor = "grab";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [takeManualControl]);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) takeManualControl();
  }, [takeManualControl]);

  const onTouchStart = useCallback(() => takeManualControl(), [takeManualControl]);

  if (loading || books.length === 0) return null;

  /* ── Repeated lists ──────────────────────────────────────────────────── */
  const block = [...books, ...books, ...books, ...books];
  const blocks = [0, 1, 2, 3];

  return (
    <section id="books" className="relative py-28 overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Section header ───────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 mb-14">
        <div className="flex items-end justify-between">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold mb-3 block"
            >
              Our Catalogue
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl tracking-tight"
            >
              Our Published Books
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-base mt-3 max-w-md"
            >
              Dive into the universe of VINVERSE Publication.
            </motion.p>
          </div>
        </div>
      </div>

      {/* ── Scrollable track ─────────────────────────────────────────────── */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(90deg, var(--background) 0%, transparent 100%)" }}
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: "linear-gradient(270deg, var(--background) 0%, transparent 100%)" }}
        />

        <div
          ref={wrapRef}
          className="overflow-x-auto flex"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", cursor: "grab" }}
          onMouseDown={onMouseDown}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
        >
          {blocks.map((bIndex) => (
            <div
              key={bIndex}
              ref={bIndex === 0 ? blockRef : null}
              className="flex shrink-0 items-start gap-7 pr-7 py-10"
            >
              {block.map((book, index) => {
                const modal = toModalBook(book as never);
                const isAlt = index % 2 === 1;
                return (
                  <BookCard
                    key={`${bIndex}-${book.id}-${index}`}
                    book={modal}
                    isAlt={isAlt}
                    onClick={() => setSelectedBook(modal)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="container mx-auto px-6 mt-8 hidden md:flex justify-between items-center relative z-20">
        <button
          onClick={scrollLeft}
          className="h-12 w-12 rounded-full border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-105 group"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </button>
        <button
          onClick={scrollRight}
          className="h-12 w-12 rounded-full border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-all duration-300 hover:scale-105 group"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="h-px w-20" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35))" }} />
        <svg className="h-3 w-3 text-[var(--gold)]/40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41Z" />
        </svg>
        <div className="h-px w-20" style={{ background: "linear-gradient(270deg, transparent, rgba(212,175,55,0.35))" }} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center text-muted-foreground text-[10px] uppercase tracking-widest mt-4 md:hidden"
      >
        ← Drag to explore →
      </motion.p>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── BookCard ────────────────────────────────────────────────────────────── */
function BookCard({
  book,
  isAlt,
  onClick,
}: {
  book: ModalBook;
  isAlt: boolean;
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="group relative shrink-0 cursor-pointer"
      style={{ width: "clamp(170px, 20vw, 220px)" }}
    >
      <div
        className="relative rounded-2xl overflow-hidden border bg-[var(--navy-mid)]"
        style={{
          aspectRatio: "2/3",
          borderColor: "rgba(225,232,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
          transition: "transform 0.5s cubic-bezier(0.25,0.1,0.25,1), border-color 0.4s, box-shadow 0.45s",
        }}
      >
        {/* Stitched inner border */}
        <div
          className="absolute inset-2 rounded-xl pointer-events-none z-10"
          style={{ border: "1px dashed rgba(212,175,55,0.18)" }}
        />

        {/* Cover */}
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="220px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          draggable={false}
        />

        {/* Bottom gradient */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none z-10"
          style={{
            height: "65%",
            background: "linear-gradient(to top, rgba(8,14,26,0.97) 0%, rgba(8,14,26,0.60) 50%, transparent 100%)",
          }}
        />

        {/* Author portrait */}
        {book.authorImage && (
          <div className="absolute bottom-[68px] left-3.5 z-20">
            <div
              className="transition-transform duration-500 group-hover:scale-105"
              style={{
                width: 44,
                height: 44,
                borderRadius: "9999px",
                padding: 2,
                background: "conic-gradient(from 0deg, var(--gold-dark), var(--gold), var(--gold-light), var(--gold), var(--gold-dark))",
                boxShadow: "0 0 14px rgba(212,175,55,0.35), 0 4px 16px rgba(8,14,26,0.90)",
              }}
            >
              <div style={{ width: "100%", height: "100%", borderRadius: "9999px", padding: 2, background: "var(--ink)", overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "9999px", overflow: "hidden" }}>
                  <Image
                    src={book.authorImage}
                    alt={book.author}
                    fill
                    sizes="44px"
                    className="object-cover object-top"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-3.5 pb-3.5">
          <p className="text-[var(--gold)] text-[9px] uppercase tracking-[0.18em] font-semibold mb-0.5">
            {book.author}
          </p>
          <h3 className="font-serif text-[12px] leading-snug text-[var(--ivory)] group-hover:text-white transition-colors duration-300 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-[var(--muted-foreground)] text-[9px] uppercase tracking-widest mt-1 opacity-60">
            {book.genre}
          </p>
        </div>

        {/* Hover CTA */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center z-30 rounded-2xl"
          style={{ background: "rgba(212,175,55,0.06)" }}
        >
          <span
            className="text-[var(--gold)] uppercase tracking-[0.22em] text-[9px] font-bold px-4 py-2 rounded-full border border-[var(--gold)]/40"
            style={{ background: "rgba(8,14,26,0.75)", backdropFilter: "blur(8px)" }}
          >
            View Details
          </span>
        </div>

        {/* Sparkles */}
        <span className="absolute bottom-4 right-4 z-20 text-[var(--gold)]/60 text-xs animate-pulse pointer-events-none">✦</span>
        <span className="absolute top-5 right-4 z-20 text-[var(--gold)]/30 text-[8px] pointer-events-none">✦</span>
      </div>
    </article>
  );
}
