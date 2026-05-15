"use client";
import Link from "next/link";
import { ArrowRight, RefreshCw, Home } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (countdown <= 0) {
      reset();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, reset]);

  return (
    <html>
      <body>
        <div
          className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-10 relative overflow-hidden"
          style={{
            background: "#080810",
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(124,58,237,0.10) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            color: "#F8FAFC",
          }}
        >
          {/* Orbs */}
          <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(124,58,237,0.12)", filter: "blur(60px)", opacity: 0.6, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(6,182,212,0.08)", filter: "blur(60px)", opacity: 0.6, pointerEvents: "none" }} />

          {/* Error code */}
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(100px, 18vw, 180px)",
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: -4,
              background: "linear-gradient(135deg, rgba(245,158,11,0.7) 0%, rgba(124,58,237,0.6) 50%, rgba(6,182,212,0.3) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 0,
              animation: "error-code-enter 0.8s cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            500
          </h1>

          <span style={{ fontSize: 72, display: "block", margin: "8px 0 24px", animation: "card-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}>
            ⚡
          </span>

          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#F8FAFC", marginBottom: 12, animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}>
            Something went wrong on our end
          </h2>

          <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 460, lineHeight: "26px", marginBottom: 36, animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s both" }}>
            Our servers are having a moment. The ESUTSphere team has been notified and is working on it — just like exam prep, but faster.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "card-enter 0.5s both 0.55s" }}>
            <button
              onClick={() => reset()}
              style={{
                height: 48,
                padding: "0 24px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                boxShadow: "0 6px 20px rgba(124,58,237,0.4)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <a
              href="/"
              style={{
                height: 48,
                padding: "0 24px",
                borderRadius: 12,
                background: "transparent",
                color: "#94A3B8",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowRight size={16} /> Back to Home
            </a>
          </div>

          <p style={{ fontSize: 13, color: "#475569", marginTop: 16, animation: "card-enter 0.5s both 0.75s" }}>
            Automatically retrying in <span style={{ color: "#F59E0B", fontWeight: 600 }}>{countdown}s</span>...
          </p>
        </div>

        <style>{`
          @keyframes error-code-enter {
            from { opacity: 0; transform: scale(0.8); filter: blur(10px); }
            to   { opacity: 1; transform: scale(1); filter: blur(0); }
          }
          @keyframes card-enter {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </body>
    </html>
  );
}
