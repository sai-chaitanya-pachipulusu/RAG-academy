/**
 * Global Error Boundary
 * Catches errors during rendering of the root layout.
 * Must be in the app root directory (not in a route group).
 */

"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          <div style={{
            maxWidth: "28rem",
            width: "100%",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            padding: "1.5rem",
            textAlign: "center",
          }}>
            <div style={{
              width: "4rem",
              height: "4rem",
              margin: "0 auto 1rem",
              borderRadius: "9999px",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg
                style={{ width: "2rem", height: "2rem", color: "#dc2626" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96L12.07 4.04a2 2 0 00-3.5 0L.82 16.04A2 2 0 002.57 19z"
                />
              </svg>
            </div>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#18181b", marginBottom: "0.5rem" }}>
              Application Error
            </h2>

            <p style={{ color: "#71717a", marginBottom: "1.5rem" }}>
              A critical error occurred. Please try refreshing the page.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={reset}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#18181b",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Try again
              </button>

              <a
                href="/"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.5rem 1rem",
                  border: "1px solid #d4d4d8",
                  color: "#3f3f46",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              >
                Go to homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
