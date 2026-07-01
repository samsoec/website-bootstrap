import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { i18n } from "../i18n-config";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

// ─── Docs Auth Helpers ───────────────────────────────────────────────
// Gates the built-in /docs site behind a Strapi-admin-authenticated,
// HMAC-signed cookie. See src/app/api/docs-auth and src/app/docs-login.

const COOKIE_NAME = "docs_token";
const encoder = new TextEncoder();

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  return expected === signature;
}

/** Parse a cookie value that is `base64(jwt).base64(hmac)` and verify it */
async function verifyDocsCookie(cookieValue: string, secret: string): Promise<boolean> {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const jwt = cookieValue.slice(0, dotIndex);
  const sig = cookieValue.slice(dotIndex + 1);

  if (!jwt || !sig) return false;

  const valid = await hmacVerify(jwt, sig, secret);
  if (!valid) return false;

  // Check JWT exp claim (base64url decode the payload)
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // token expired
    }
  } catch {
    return false;
  }

  return true;
}

// ─── Locale Helpers ──────────────────────────────────────────────────

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales;
  try {
    return matchLocale(languages, locales, i18n.defaultLocale);
  } catch {
    // Invalid accept-language header
    return i18n.defaultLocale;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Docs auth gate ─────────────────────────────────────────────────
  // Allow the docs login page through (lives outside /docs to avoid the Nextra layout)
  if (pathname === "/docs-login" || pathname === "/docs-login/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/docs")) {
    const secret = process.env.DOCS_AUTH_SECRET;
    if (!secret) {
      console.error("DOCS_AUTH_SECRET is not set");
      return NextResponse.redirect(new URL("/docs-login", request.url));
    }

    const cookie = request.cookies.get(COOKIE_NAME);
    if (!cookie?.value) {
      return NextResponse.redirect(new URL(`/docs-login?from=${encodeURIComponent(pathname)}`, request.url));
    }

    const valid = await verifyDocsCookie(cookie.value, secret);
    if (!valid) {
      const response = NextResponse.redirect(
        new URL(`/docs-login?from=${encodeURIComponent(pathname)}`, request.url)
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.next();
  }

  // ── Locale redirect ────────────────────────────────────────────────
  // `/_next/`, `/api/` and `/uploads/` are ignored by the matcher below, but we
  // need to ignore other static files in `public` manually.
  if (
    [
      "/manifest.json",
      "/favicon.ico",
      "/sitemap.xml",
      "/robots.txt",
      // Your other files in `public`
    ].includes(pathname)
  )
    return;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const search = request.nextUrl.search;

    // e.g. incoming request is /products?foo=bar
    // The new URL is now /en/products?foo=bar
    return NextResponse.redirect(new URL(`/${locale}${pathname}${search}`, request.url));
  }
}

export const config = {
  // Match all paths except _next, api, uploads, admin, and the pagefind search index
  matcher: ["/((?!_next|api|_pagefind|uploads|admin).*)"],
};
