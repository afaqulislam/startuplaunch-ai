import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// The browser reaches the API directly; allow it in connect-src.
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Config-based CSP (no nonces) — safe here because every page in this app is
// statically rendered; nonce-based CSP would force dynamic rendering on all
// routes. `unsafe-inline` is required for Next.js's injected styles.
// `upgrade-insecure-requests` is intentionally omitted: the API may run over
// plain http:// locally and that directive would force it to https.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self' data:;
  connect-src 'self' ${apiBase};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
