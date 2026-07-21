"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { authorsApi, ApiAuthor } from "@/lib/services";

type AuthorWithBooks = ApiAuthor & { books: { id: string; title: string; slug: string }[] };

export function Authors() {
  const [authors, setAuthors] = useState<AuthorWithBooks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authorsApi.list({ limit: 20 })
      .then((res) => setAuthors(res.items))
      .catch(() => setAuthors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || authors.length === 0) return null;

  return (
    <section id="authors" className="relative py-32 overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold mb-6 block"
          >
            The Voices
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl tracking-tight"
          >
            Our Authors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4"
          >
            The brilliant minds behind every story we publish.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {authors.map((author, index) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 md:p-8 transition-all duration-500 hover:border-[var(--gold)]/20 group"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative rounded-full overflow-hidden ring-2 ring-border group-hover:ring-[var(--gold)]/30 transition-all duration-500">
                <Image
                  src={author.avatarUrl || "/placeholder-author.jpg"}
                  alt={author.name}
                  fill
                  sizes="160px"
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              <div className="text-center sm:text-left">
                <h3 className="font-serif text-2xl md:text-3xl mb-1">
                  {author.name}
                </h3>
                <p className="text-[var(--gold)] uppercase tracking-[0.15em] text-xs font-semibold mb-4">
                  Featured: {author.books?.[0]?.title ?? "—"}
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {author.shortBio || author.fullBio || ""}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
