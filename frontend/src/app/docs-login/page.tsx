"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("from") || "/docs";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const identifier = form.get("identifier") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/docs-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Full page navigation to ensure cookie is sent on the next request
      window.location.href = redirectTo;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 400,
        width: "100%",
        padding: "2.5rem",
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>CMS Guide</h1>
        <p style={{ color: "#666", margin: 0, fontSize: "0.9rem" }}>
          Sign in to access the documentation
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="identifier"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#333",
            }}
          >
            Email or Username
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            autoComplete="username"
            autoFocus
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0070f3")}
            onBlur={(e) => (e.target.style.borderColor = "#ddd")}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#333",
            }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0070f3")}
            onBlur={(e) => (e.target.style.borderColor = "#ddd")}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "0.625rem 0.75rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: "0.825rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.625rem",
            backgroundColor: loading ? "#93c5fd" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function DocsLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
