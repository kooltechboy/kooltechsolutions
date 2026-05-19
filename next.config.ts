import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: [
          // ── Prevent MIME-type sniffing ───────────────────────────────────
          { key: "X-Content-Type-Options", value: "nosniff" },

          // ── Block clickjacking ──────────────────────────────────────────
          { key: "X-Frame-Options", value: "DENY" },

          // ── Control referrer information ────────────────────────────────
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // ── Force HTTPS (1 year, include subdomains) ────────────────────
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          // ── Disable browser features not needed by the app ──────────────
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=(self)",   // AI widget uses mic for voice input
              "geolocation=()",
              "payment=()",
              "usb=()",
              "bluetooth=()",
              "accelerometer=()",
              "gyroscope=()",
            ].join(", "),
          },

          // ── DNS prefetch control ────────────────────────────────────────
          { key: "X-DNS-Prefetch-Control", value: "on" },

          // ── Content Security Policy ─────────────────────────────────────
          // Reviewed against actual third-party scripts in use:
          //   - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
          //   - Google AdSense (pagead2.googlesyndication.com)
          //   - Supabase (*.supabase.co)
          //   - Google Generative AI API (generativelanguage.googleapis.com)
          //   - Resend (api.resend.com)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Google AdSense + Next.js inline scripts
              "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com",
              // Styles: self + Google Fonts + inline (needed for framer-motion & CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: self + data URIs + Supabase storage + Google AdSense
              "img-src 'self' data: blob: https://*.supabase.co https://pagead2.googlesyndication.com https://www.google.com",
              // API connections: self + Supabase + Google AI + Resend + AdSense
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.resend.com https://pagead2.googlesyndication.com",
              // Media: self only (voice recognition uses device mic, no external media)
              "media-src 'self'",
              // Workers: self + blob (Next.js service worker)
              "worker-src 'self' blob:",
              // Frames: none
              "frame-src 'none'",
              // Form submissions: self only
              "form-action 'self'",
              // Upgrade insecure requests in production
              ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
