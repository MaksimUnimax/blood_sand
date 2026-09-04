import type { NextConfig } from "next";

const productionHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    if (process.env.NODE_ENV === "production")
      return [{ source: "/:path*", headers: productionHeaders }];
    // HSTS is deliberately production-only: local P2 acceptance uses HTTP.
    // Next development HMR requires eval; production never receives this source.
    const headers = productionHeaders
      .filter((header) => header.key !== "Strict-Transport-Security")
      .map((header) =>
        header.key === "Content-Security-Policy"
          ? {
              ...header,
              value: header.value.replace(
                "script-src 'self' 'unsafe-inline'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              ),
            }
          : header,
      );
    return [{ source: "/:path*", headers }];
  },
};

export default config;
