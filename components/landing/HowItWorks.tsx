"use client";

import { UserPlus, ClipboardCheck, Rocket, ArrowRight } from "lucide-react";

const STEPS = [
  { num: 1, icon: <UserPlus className="w-7 h-7" />, title: "Sign Up", desc: "Create your ESUTSphere account with Google in under 2 minutes.", emoji: "🔐" },
  { num: 2, icon: <ClipboardCheck className="w-7 h-7" />, title: "Build Your Profile", desc: "Upload your matric, select your department, and submit your admission letter for verification.", emoji: "📋" },
  { num: 3, icon: <Rocket className="w-7 h-7" />, title: "Share & Discover", desc: "Upload documents, write posts, follow classmates, earn points and badges.", emoji: "🚀" },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-5 md:px-10 bg-[rgba(15,15,26,0.5)] border-y border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto text-center">
        <p className="text-[13px] font-bold text-brand tracking-[1.5px] uppercase mb-4">HOW IT WORKS</p>
        <h2 className="font-display text-[clamp(32px,4vw,52px)] text-text-primary leading-[1.15] mb-4">
          Three steps to <span className="text-cyan-light">get started</span>
        </h2>
        <p className="text-[17px] text-text-muted max-w-[480px] mx-auto mb-16">
          From signup to sharing notes — it takes less than 5 minutes.
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_40px_1fr_40px_1fr] gap-6 md:gap-0 max-w-[900px] mx-auto items-start">
          {STEPS.map((step, i) => (
            <div key={step.num} className="contents">
              <div className="relative bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[20px] p-8 transition-all duration-300 hover:border-brand/[0.35] hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group">
                {/* Step number */}
                <div className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-extrabold flex items-center justify-center shadow-[0_4px_16px_rgba(124,58,237,0.5)]">
                  {step.num}
                </div>
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-brand/12 border border-brand/25 flex items-center justify-center mx-auto mb-5 text-3xl group-hover:scale-110 transition-transform">
                  {step.emoji}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
              </div>

              {/* Arrow connector (hidden on mobile) */}
              {i < 2 && (
                <div className="hidden md:flex items-center justify-center pt-20 text-brand/50">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
