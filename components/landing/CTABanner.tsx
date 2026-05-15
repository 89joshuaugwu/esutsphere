"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 px-5 md:px-10 relative overflow-hidden">
      <div className="max-w-[800px] mx-auto relative bg-[rgba(22,22,42,0.7)] border border-brand/25 rounded-[28px] px-8 py-16 md:px-14 text-center overflow-hidden" style={{ backdropFilter: "blur(16px)" }}>
        {/* Background glow */}
        <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.15)_0%,transparent_60%)] pointer-events-none" />
        {/* Top border glow */}
        <div className="absolute top-0 left-[20%] right-[20%] h-px bg-[linear-gradient(to_right,transparent,rgba(168,85,247,0.8),transparent)]" />

        {/* Rocket icon */}
        <div className="w-16 h-16 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto mb-6 text-3xl animate-[cta-pulse_2s_ease-in-out_infinite] relative z-[1]">
          🚀
        </div>

        <h2 className="font-display text-[clamp(28px,4vw,44px)] text-text-primary mb-4 leading-[1.2] relative z-[1]">
          Ready to Join the<br />ESUTSphere Community?
        </h2>

        <p className="text-base text-text-muted max-w-[480px] mx-auto mb-9 leading-[26px] relative z-[1]">
          Be part of the largest academic social network at ESUT. Connect with classmates, access resources, and take your academic journey to the next level.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-5 relative z-[1]">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold px-7 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(124,58,237,0.4)] hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(124,58,237,0.55)] transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4" /> Create Your Free Account
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-text-secondary text-[15px] font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all"
          >
            Learn More
          </a>
        </div>

        <p className="text-[13px] text-text-disabled relative z-[1]">Free for all ESUT students. No credit card required.</p>
      </div>
    </section>
  );
}
