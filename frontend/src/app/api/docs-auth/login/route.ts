import { NextResponse } from "next/server";

const COOKIE_NAME = "docs_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
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

export async function POST(request: Request) {
  const secret = process.env.DOCS_AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let body: { identifier?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { identifier, password } = body;
  if (!identifier || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  // Authenticate against the Strapi Admin API — reuses admin credentials so
  // there's no separate user store to maintain for docs access.
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

  let strapiRes: Response;
  try {
    strapiRes = await fetch(`${strapiUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, password }),
    });
  } catch (err) {
    console.error("Strapi admin auth request failed:", err);
    return NextResponse.json({ error: "Unable to reach authentication server" }, { status: 502 });
  }

  if (!strapiRes.ok) {
    const data = await strapiRes.json().catch(() => ({}));
    const message = data?.error?.message || "Invalid email or password";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const data = await strapiRes.json();
  const jwt: string = data?.data?.token;

  if (!jwt) {
    return NextResponse.json({ error: "Authentication failed — no token received" }, { status: 500 });
  }

  // Sign the JWT with our HMAC secret and store as cookie
  const signature = await hmacSign(jwt, secret);
  const cookieValue = `${jwt}.${signature}`;

  const response = NextResponse.json({
    ok: true,
    user: {
      firstname: data.data?.user?.firstname,
      email: data.data?.user?.email,
    },
  });

  response.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
