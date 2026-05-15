import Link from "next/link";
import { ArrowRight, Home, Settings, LayoutDashboard } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-10 relative overflow-hidden"
      style={{
        background: "#080810",
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(124,58,237,0.10) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)",
      }}
    >
      {/* Floating orbs */}
      <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] rounded-full bg-[rgba(124,58,237,0.12)] blur-[60px] opacity-60 animate-[orb-drift_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute -bottom-[80px] -right-[80px] w-[300px] h-[300px] rounded-full bg-[rgba(6,182,212,0.08)] blur-[60px] opacity-60 animate-[orb-drift_10s_ease-in-out_infinite_-4s] pointer-events-none" />

      {/* Error code — red tint */}
      <h1
        className="font-display text-[clamp(100px,18vw,180px)] font-normal leading-[0.9] tracking-[-4px] bg-clip-text text-transparent mb-0 relative"
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.7) 0%, rgba(248,113,113,0.5) 50%, rgba(124,58,237,0.3) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          animation: "error-code-enter 0.8s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        403
      </h1>

      {/* Lock illustration with shake */}
      <span
        className="text-7xl block my-2"
        style={{ animation: "card-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both, lock-shake 0.5s ease 1.2s" }}
      >
        🔒
      </span>

      {/* Title */}
      <h2
        className="text-[clamp(22px,3vw,32px)] font-extrabold text-text-primary mb-3"
        style={{ animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}
      >
        Access Denied
      </h2>

      {/* Subtitle */}
      <p
        className="text-base text-text-muted max-w-[460px] leading-[26px] mb-9"
        style={{ animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s both" }}
      >
        You don&apos;t have permission to view this page. 👀
        <br />This area requires special clearance.
      </p>

      {/* Action buttons */}
      <div
        className="flex gap-3 justify-center flex-wrap"
        style={{ animation: "card-enter 0.5s both 0.55s" }}
      >
        <Link
          href="/feed"
          className="h-12 px-6 rounded-xl bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold inline-flex items-center gap-2 shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.55)] transition-all"
        >
          <ArrowRight className="w-4 h-4" /> Back to Feed
        </Link>
        <Link
          href="/login"
          className="h-12 px-6 rounded-xl bg-transparent text-text-muted border border-white/[0.12] text-[15px] font-medium inline-flex items-center gap-2 hover:bg-white/[0.06] hover:text-text-primary transition-all"
        >
          Sign In
        </Link>
      </div>

      {/* Quick nav links */}
      <div
        className="flex gap-5 mt-10 flex-wrap justify-center"
        style={{ animation: "card-enter 0.5s both 0.65s" }}
      >
        {[
          { label: "Home", href: "/", icon: Home },
          { label: "My Dashboard", href: "/feed", icon: LayoutDashboard },
          { label: "Settings", href: "/settings", icon: Settings },
        ].map(l => (
          <Link
            key={l.label}
            href={l.href}
            className="text-[13px] font-medium text-text-disabled flex items-center gap-1.5 hover:text-brand-light transition-colors"
          >
            <l.icon className="w-3.5 h-3.5" /> {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
