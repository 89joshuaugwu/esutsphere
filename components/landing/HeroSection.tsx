"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play, Heart, MessageCircle, Share2, Download, Flame, TrendingUp, Users } from "lucide-react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-10 md:pt-36 md:pb-24 px-5 md:px-10 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_70%)] blur-[40px] animate-[orb-drift_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)] blur-[40px] animate-[orb-drift_15s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_50%)] blur-[40px] animate-[orb-drift_10s_ease-in-out_infinite]" />
      </div>

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.10) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-16">
        {/* Left Content */}
        <div className="flex-[1.2] text-center md:text-left">
          {/* Announcement Pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 rounded-full px-3.5 py-1.5 mb-7 text-[13px] font-medium text-text-secondary hover:bg-brand/[0.18] hover:border-[rgba(168,85,247,0.5)] transition-all group"
            >
              <span className="bg-brand/25 rounded-full px-2 py-0.5 text-xs">✨</span>
              <span className="hidden sm:inline">Welcome to the Future of Academic Collaboration</span>
              <span className="sm:hidden">The Future of Academics</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-light group-hover:translate-x-[3px] transition-transform shrink-0" />
            </Link>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease }}
            className="font-display text-[clamp(36px,6vw,72px)] leading-[1.1] tracking-[-1px] text-text-primary mb-5"
          >
            The Academic Hub{" "}
            <br className="hidden sm:block" />
            <span className="bg-[linear-gradient(135deg,#A855F7_0%,#7C3AED_40%,#06B6D4_100%)] bg-clip-text text-transparent bg-[length:200%_auto] animate-[text-shimmer_4s_linear_infinite]">
              Built for ESUT Students.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease }}
            className="text-base sm:text-lg text-text-muted leading-7 max-w-[520px] mb-8 mx-auto md:mx-0"
          >
            Share notes, discover past questions, connect with classmates, and build your academic profile — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease }}
            className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-7"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold px-7 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(124,58,237,0.4)] hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_16px_48px_rgba(124,58,237,0.55)] transition-all duration-200"
            >
              <ArrowRight className="w-4 h-4" /> Get Started — Free
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-white/[0.06] border border-white/[0.12] text-text-secondary text-[15px] font-semibold px-7 py-3.5 rounded-xl backdrop-blur-[8px] hover:bg-white/10 hover:border-white/[0.22] hover:-translate-y-[2px] transition-all duration-200"
            >
              <Play className="w-4 h-4" /> See How It Works
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7, ease }}
            className="flex items-center gap-3 justify-center md:justify-start"
          >
            <div className="flex -space-x-2">
              {["🟣", "🔵", "🟢", "🟡", "🔴"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-bg-base bg-bg-surface-3 flex items-center justify-center text-xs"
                >
                  {c}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-text-muted">
              Trusted by <strong className="text-text-primary font-semibold">5,000+</strong> ESUT students
            </p>
          </motion.div>
        </div>

        {/* ── Right: Floating Preview Cards ──────────────────── */}

        {/* MOBILE CARDS (below md): simple stacked layout, no absolute mess */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease }}
          className="flex flex-col gap-4 w-full max-w-[340px] mx-auto md:hidden"
        >
          {/* Stats Card */}
          <div className="bg-[rgba(15,15,26,0.95)] border border-cyan/30 rounded-[14px] p-4 backdrop-blur-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <p className="text-xs font-bold text-text-primary flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-cyan" /> Trending this week
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cyan">↗</span>
                <span className="text-text-secondary"><strong className="text-text-primary">1,240</strong> new downloads</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-text-secondary">CSC 201 Past Questions</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-3 h-3 text-brand-light" />
                <span className="text-text-secondary"><strong className="text-text-primary">23</strong> new members today</span>
              </div>
            </div>
          </div>

          {/* Document Card */}
          <div className="bg-[rgba(30,30,53,0.85)] border border-brand/30 rounded-[14px] p-3.5 border-t-[3px] border-t-brand backdrop-blur-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/15 text-brand-light border border-brand/25">NOTES</span>
              <span className="text-[10px] text-text-disabled">· CSC 466</span>
            </div>
            <p className="text-sm font-bold text-text-primary mb-1">CSC466 Compiler Construction Notes</p>
            <p className="text-xs text-text-muted mb-3">Complete lecture notes — Dr. T. Asogwa</p>
            <div className="flex items-center justify-between text-xs text-text-disabled">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center text-[8px] font-bold text-cyan-light">J</div>
                <span className="text-text-muted">@joshuazaza</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Download className="w-3 h-3" /> 450</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 89</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP/TABLET CARDS (md+): floating absolute layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease }}
          className="hidden md:block flex-1 relative w-full max-w-[420px] lg:max-w-[500px] h-[440px] lg:h-[480px] shrink-0"
        >
          {/* Card 1 — Feed Post */}
          <div className="absolute top-0 right-0 w-[340px] bg-[rgba(22,22,42,0.9)] border border-white/10 rounded-2xl p-4 backdrop-blur-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[card-float-1_6s_ease-in-out_infinite]"
            style={{ transform: "rotate(3deg)" }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand-light">J</div>
              <div>
                <p className="text-xs font-semibold text-text-primary">@johndoe <span className="text-text-disabled font-normal">· 2h ago</span></p>
              </div>
            </div>
            <p className="text-sm text-text-primary font-semibold mb-1">Just uploaded CSC 466 Notes 🔥</p>
            <p className="text-xs text-text-muted leading-relaxed mb-3">Finally compiled all the compiler construction notes from Dr. Asogwa&apos;s class. Includes practice questions...</p>
            <div className="flex items-center gap-4 text-xs text-text-disabled">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> 142</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 24</span>
              <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share</span>
            </div>
          </div>

          {/* Card 2 — Document */}
          <div className="absolute top-20 left-0 lg:left-5 w-[300px] lg:w-[320px] bg-[rgba(30,30,53,0.85)] border border-brand/30 rounded-[14px] p-3.5 border-t-[3px] border-t-brand backdrop-blur-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[card-float-2_7s_ease-in-out_infinite]"
            style={{ transform: "rotate(-2deg)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/15 text-brand-light border border-brand/25">NOTES</span>
              <span className="text-[10px] text-text-disabled">· CSC 466</span>
            </div>
            <p className="text-sm font-bold text-text-primary mb-1">CSC466 Compiler Construction Notes</p>
            <p className="text-xs text-text-muted mb-3">Complete lecture notes — Dr. T. Asogwa</p>
            <div className="flex items-center justify-between text-xs text-text-disabled">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-cyan/20 flex items-center justify-center text-[8px] font-bold text-cyan-light">J</div>
                <span className="text-text-muted">@joshuazaza</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Download className="w-3 h-3" /> 450</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 89</span>
              </div>
            </div>
          </div>

          {/* Card 3 — Stats */}
          <div className="absolute bottom-5 right-5 w-[260px] lg:w-[280px] bg-[rgba(15,15,26,0.95)] border border-cyan/30 rounded-[14px] p-4 backdrop-blur-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[card-float-3_8s_ease-in-out_infinite]"
            style={{ transform: "rotate(1deg)" }}
          >
            <p className="text-xs font-bold text-text-primary flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-cyan" /> Trending this week
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cyan">↗</span>
                <span className="text-text-secondary"><strong className="text-text-primary">1,240</strong> new downloads</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-text-secondary">CSC 201 Past Questions</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-3 h-3 text-brand-light" />
                <span className="text-text-secondary"><strong className="text-text-primary">23</strong> new members today</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
