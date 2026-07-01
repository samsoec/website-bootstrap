import { NextResponse } from "next/server";

const COOKIE_NAME = "docs_token";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/docs-login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}
