type RuntimeEnvironment = "development" | "production" | "test" | undefined;

export function contentSecurityPolicy(environment: RuntimeEnvironment = process.env.NODE_ENV) {
  const development = environment === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function applicationSecurityHeaders(environment: RuntimeEnvironment = process.env.NODE_ENV) {
  const headers = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(environment) },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), publickey-credentials-create=(self), publickey-credentials-get=(self)" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    { key: "X-XSS-Protection", value: "0" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Origin-Agent-Cluster", value: "?1" },
  ];
  if (environment === "production") headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
  return headers;
}
