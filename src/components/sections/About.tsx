"use client";

import { motion } from "framer-motion";
import DisplayCards from "@/components/ui/display-cards";

export function About() {
  return (
    <section id="about" className="relative py-32 overflow-hidden section-fade-out">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[var(--gold)] uppercase tracking-[0.3em] text-xs font-semibold mb-6 block">
              Our Beginning
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 leading-[1.1] tracking-tight">
              Where Every Story
              <br />
              <span className="italic text-[var(--gold)]">Finds Its Home</span>
            </h2>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                It all started when stand-up comedian and journalist Vinod Naraen
                decided to sit down one day and write his first book.
              </p>
              <p>
                He comes from a literary background, where both of his parents are
                authors, and his maternal grandparents were scriptwriters for old
                Bollywood movies.
              </p>
              <p>
                After completing his first book, Vinod ventured into the world of
                publishing. During this journey, he realized that the changing
                publishing landscape offered very few opportunities for aspiring
                writers to publish their stories.
              </p>
              <p>
                A few books later, Vinod Naraen decided to start his own
                publishing house to give every storyteller a unique and creative
                opportunity to see their stories transformed into books.
              </p>
            </div>

            {/* Vision quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 pl-6 border-l-2 border-[var(--gold)]/40"
            >
              <p className="font-serif text-xl italic text-foreground/80 leading-relaxed">
                &ldquo;With features like custom music, personalized branding, flexible PR, and creative publishing solutions, VINVERSE Publication offers everyone a wonderful opportunity to publish and share their stories with the world.&rdquo;
              </p>
              <cite className="text-sm text-[var(--gold)] uppercase tracking-widest mt-3 block not-italic">
                — Vinod Naraen, Founder
              </cite>
            </motion.blockquote>

            {/* Shop Now CTA */}
            <motion.a
              href="#store"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("store")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2.5 mt-8 px-7 py-3 rounded-full text-[var(--ink)] font-semibold text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_28px_rgba(212,175,55,0.35)]"
              style={{
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))",
                boxShadow: "0 4px 20px rgba(212,175,55,0.25)",
              }}
            >
              Shop Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Display Cards column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center min-h-[400px]"
          >
            <DisplayCards />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
