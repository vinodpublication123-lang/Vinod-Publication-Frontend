"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";

interface Book {
  id: string;
  title: string;
  author: string;
  authorImage?: string | null;
  cover: string;
  description: string;
  fullDescription: string;
  genre: string;
  publicationDate: string;
  buyLink: string;
  hasSong: boolean;
  songTitle?: string;
  songUrl?: string;
}

export function BookModal({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-y-auto shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur rounded-full border border-border"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Cover */}
          <div className="w-full md:w-2/5 relative min-h-[350px] md:min-h-[550px] bg-secondary rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col">
            <span className="text-[var(--gold)] uppercase tracking-[0.2em] text-xs font-semibold mb-2">
              {book.genre}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl mb-2 leading-tight">
              {book.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 italic">
              by {book.author}
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8 text-sm md:text-base">
              {book.fullDescription}
            </p>

            <div className="mt-auto space-y-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {book.publicationDate
                  ? `Published: ${new Date(book.publicationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                  : ""}
              </p>

              {book.hasSong && book.songUrl && (
                <div className="bg-secondary/50 rounded-xl p-5 flex items-start gap-5 border border-border">
                  <div className="bg-background rounded-lg p-2 shrink-0">
                    <QRCodeSVG
                      value={book.songUrl}
                      size={72}
                      level="L"
                      bgColor="transparent"
                      fgColor="var(--foreground)"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-1 text-sm">
                      <Music size={14} className="text-[var(--gold)]" />
                      Original Soundtrack
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {book.songTitle}
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={book.songUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Listen to Song
                      </a>
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
