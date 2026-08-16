import type { NextConfig } from "next";
import { applicationSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 78, 80, 82],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: applicationSecurityHeaders(),
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
