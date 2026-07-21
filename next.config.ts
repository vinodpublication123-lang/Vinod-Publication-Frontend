import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── No source maps in production — smaller bundles, faster parse ──────────
  productionBrowserSourceMaps: false,

  // ── Compress responses on the edge (gzip) ────────────────────────────────
  compress: true,

  // ── Trailing slash normalisation ──────────────────────────────────────────
  trailingSlash: false,

  // ── Image optimisation ────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year in seconds
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },

  // ── Aggressive HTTP cache headers for immutable static assets ────────────
  async headers() {
    const IMMUTABLE = "public, max-age=31536000, immutable";
    const REVALIDATE = "public, max-age=0, must-revalidate";
    return [
      {
        // Next.js hashed chunks — safe to cache for 1 year
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        // Next.js image-optimisation cache
        source: "/_next/image/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        // Hero video in /public
        source: "/Publication-Hero.mp4",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        // Images in /public
        source: "/:path*.png",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.jpg",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.jpeg",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.webp",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.avif",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.svg",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.ico",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        // Web fonts
        source: "/:path*.woff",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        source: "/:path*.woff2",
        headers: [{ key: "Cache-Control", value: IMMUTABLE }],
      },
      {
        // HTML pages — always revalidate so fresh deploys take effect
        source: "/(.*)",
        headers: [{ key: "Cache-Control", value: REVALIDATE }],
      },
    ];
  },
};

export default nextConfig;
