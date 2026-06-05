import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const SECURITY_HEADERS = [
  // HSTS — force HTTPS for 1 year, including subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Clickjacking protection
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer policy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy — lock down sensitive APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content Security Policy
  // - default-src 'self' only same-origin
  // - img-src allows R2 (togthr-images), data URIs, blob
  // - script-src allows 'self' + Next.js inline runtime
  // - connect-src allows Supabase + Cloudflare Workers
  // - frame-ancestors 'none' blocks all iframes
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.r2.dev https://togthr-images.r2.cloudflarestorage.com https://cdn.hailuoai.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://togthr.life https://*.paypal.com https://api.deepseek.com",
      "frame-src https://www.paypal.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.paypal.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone", // OpenNext --skipNextBuild needs .next/standalone/
  images: { unoptimized: true }, // Cloudflare doesn't support Next.js image opt
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
