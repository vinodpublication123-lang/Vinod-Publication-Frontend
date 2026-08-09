import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollSectionIndicator } from "@/components/layout/ScrollSectionIndicator";
import { Hero } from "@/components/sections/Hero";

// ── Lazy-loaded sections (below the fold) ────────────────────────────────────
// Each section becomes its own JS chunk, downloaded only when needed.
// The inline `loading` skeleton prevents layout shift while the chunk arrives.

const SectionSkeleton = () => (
  <div className="w-full py-28 flex items-center justify-center">
    <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[var(--gold)] animate-spin" />
  </div>
);

const About = dynamic(
  () => import("@/components/sections/About").then((m) => m.About),
  { loading: SectionSkeleton }
);
const Services = dynamic(
  () => import("@/components/sections/Services").then((m) => m.Services),
  { loading: SectionSkeleton }
);
const PublishingProcess = dynamic(
  () => import("@/components/sections/PublishingProcess").then((m) => m.PublishingProcess),
  { loading: SectionSkeleton }
);
const Books = dynamic(
  () => import("@/components/sections/Books").then((m) => m.Books),
  { loading: SectionSkeleton }
);
const Authors = dynamic(
  () => import("@/components/sections/Authors").then((m) => m.Authors),
  { loading: SectionSkeleton }
);
const Store = dynamic(
  () => import("@/components/sections/Store").then((m) => m.Store),
  { loading: SectionSkeleton }
);
const PublishWithUs = dynamic(
  () => import("@/components/sections/PublishWithUs").then((m) => m.PublishWithUs),
  { loading: SectionSkeleton }
);
const Contact = dynamic(
  () => import("@/components/sections/Contact").then((m) => m.Contact),
  { loading: SectionSkeleton }
);
const Footer = dynamic(
  () => import("@/components/layout/Footer").then((m) => m.Footer),
  { loading: () => null }
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <ScrollSectionIndicator />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <PublishingProcess />
      <Books />
      <Authors />
      <Store />
      <PublishWithUs />
      <Contact />
      <Footer />
    </main>
  );
}
