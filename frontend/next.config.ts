import type { NextConfig } from "next";
import nextra from "nextra";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const cacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      // Strapi Cloud / CDN-fronted media
      ...(process.env.NEXT_PUBLIC_STRAPI_CDN_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_STRAPI_CDN_URL).hostname,
              pathname: "/**",
            },
          ]
        : []),
      ...(process.env.NEXT_PUBLIC_STRAPI_API_CDN_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_STRAPI_API_CDN_URL).hostname,
              pathname: "/uploads/**",
            },
          ]
        : []),
      // Static / self-hosted uploads
      ...(process.env.NEXT_PUBLIC_STATIC_HOSTING_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_STATIC_HOSTING_URL).hostname,
              pathname: "/uploads/**",
            },
          ]
        : []),
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === "development",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["react-icons", "@heroicons/react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: cacheHeaders,
      },
      {
        source: "/images/:path*",
        headers: cacheHeaders,
      },
      {
        source: "/fonts/:path*",
        headers: cacheHeaders,
      },
      {
        source: "/uploads/:path*",
        headers: cacheHeaders,
      },
    ];
  },
  async rewrites() {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
    return {
      // afterFiles rewrites run AFTER filesystem routes (e.g. Next.js API routes)
      // so app routes take priority, and unmatched /api/* goes to Strapi
      afterFiles: [
        {
          source: "/uploads/:path*",
          destination: `${strapiUrl}/uploads/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${strapiUrl}/api/:path*`,
        },
        {
          source: "/cms",
          destination: `${strapiUrl}/admin`,
        },
        {
          source: "/cms/:path*",
          destination: `${strapiUrl}/admin/:path*`,
        },
      ],
    };
  },
};

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
});

export default withNextra(nextConfig);
