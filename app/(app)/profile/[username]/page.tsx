"use client";
import { use, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Calendar, MessageCircle, Camera, Upload, PenLine, Heart, Download, Eye, FileText, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const BADGE_DATA: Record<string, { emoji: string; name: string; desc: string; color: string; rgb: string }> = {
  top_contributor: { emoji: "🏆", name: "Top Contributor", desc: "Uploaded 50+ documents", color: "#F59E0B", rgb: "245,158,11" },
  note_legend:     { emoji: "📝", name: "Note Legend", desc: "500+ downloads on notes", color: "#A855F7", rgb: "168,85,247" },
  research_king:   { emoji: "🔬", name: "Research King", desc: "10+ research papers", color: "#06B6D4", rgb: "6,182,212" },
  popular:         { emoji: "⭐", name: "Popular", desc: "1000+ followers", color: "#EC4899", rgb: "236,72,153" },
  viral_content:   { emoji: "🔥", name: "Viral Content", desc: "Post reached 5000+ views", color: "#F97316", rgb: "249,115,22" },
  consistent:      { emoji: "📅", name: "Consistent", desc: "Active 30 days straight", color: "#10B981", rgb: "16,185,129" },
};

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [activeTab, setActiveTab] = useState<"uploads" | "posts" | "badges">("uploads");
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // ── Auth gate: unauthenticated users cannot view profiles ──
  if (!isLoggedIn) {
    return (
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.15)_0%,rgba(6,182,212,0.08)_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand/[0.06] blur-[100px]" />

        <div className="relative z-10 text-center px-6 max-w-md mx-auto" style={{ animation: "card-enter 0.5s both" }}>
          <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-9 h-9 text-brand-light" />
          </div>
          <h2 className="font-display text-[26px] md:text-[32px] text-text-primary mb-3">
            Join ESUTSphere
          </h2>
          <p className="text-sm md:text-[15px] text-text-muted leading-relaxed mb-8">
            Sign in or create an account to view <strong className="text-text-secondary">@{username}</strong>&apos;s profile, follow them, and connect with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="h-11 px-6 rounded-[10px] bg-brand text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.5)] transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
            <Link
              href="/signup"
              className="h-11 px-6 rounded-[10px] bg-white/[0.06] border border-white/[0.1] text-text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-all"
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mock Profile
  const profile = {
    displayName: "Joshua Ugwu",
    username,
    bio: "Computer Science student passionate about AI, compilers, and web development. Building ESUTSphere. 🚀",
    department: "Computer Science",
    faculty: "Physical Sciences",
    level: "400L",
    joined: "Oct 2023",
    isVerified: true,
    isOnline: true,
    followers: 245,
    following: 120,
    uploads: 15,
    downloads: 2340,
    points: 1850,
    badges: ["top_contributor", "note_legend", "research_king", "consistent"] as string[],
  };

  const isOwner = user?.username === username;

  const tabs = [
    { key: "uploads" as const, label: "Uploads", count: profile.uploads },
    { key: "posts" as const, label: "Blog Posts", count: 8 },
    { key: "badges" as const, label: "Badges", count: profile.badges.length },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      {/* ── Cover Photo ──────────────────────────────────── */}
      <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden">
        <div className="w-full h-full bg-[linear-gradient(135deg,rgba(124,58,237,0.6)_0%,rgba(91,33,182,0.4)_40%,rgba(6,182,212,0.3)_100%)]" />
        {isOwner && (
          <button className="absolute bottom-3 right-3 bg-black/60 border border-white/15 text-text-primary text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-colors" style={{ backdropFilter: "blur(8px)" }}>
            <Camera className="w-3.5 h-3.5" /> Edit Cover
          </button>
        )}
      </div>

      {/* ── Profile Header ──────────────────────────────── */}
      <div className="px-6 md:px-10 pb-6 relative">
        {/* Avatar */}
        <div className="relative w-fit -mt-[52px] mb-3.5">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
            alt={profile.displayName}
            className={`w-[104px] h-[104px] rounded-full object-cover border-4 border-bg-base shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${profile.isVerified ? "outline-3 outline-brand outline-offset-[3px]" : ""}`}
          />
          {profile.isOnline && (
            <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-success border-[3px] border-bg-base" />
          )}
        </div>

        {/* Action buttons — absolute right */}
        <div className="absolute top-4 right-6 md:right-10 flex gap-2.5">
          {isOwner ? (
            <button className="h-[38px] px-[18px] rounded-full bg-transparent text-text-muted border border-white/[0.14] text-sm font-medium hover:bg-white/[0.06] hover:text-text-primary transition-all">
              Edit Profile
            </button>
          ) : (
            <>
              <button className="h-[38px] px-5 rounded-full bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold border-none shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:scale-[1.04] hover:shadow-[0_8px_24px_rgba(124,58,237,0.55)] transition-all">
                Follow
              </button>
              <button className="w-[38px] h-[38px] rounded-full bg-transparent border border-white/[0.14] text-text-muted flex items-center justify-center hover:bg-cyan/10 hover:text-cyan hover:border-cyan/30 transition-all">
                <MessageCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Name + Username */}
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2.5 mb-1">
          {profile.displayName}
          {profile.isVerified && <span className="text-brand-light text-base">✓</span>}
        </h1>
        <p className="text-sm font-medium text-text-muted mb-2.5">@{profile.username}</p>

        {/* Bio */}
        <p className="text-[15px] text-text-secondary leading-6 max-w-[540px] mb-3">
          {profile.bio}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <MapPin className="w-3.5 h-3.5" /> {profile.department} · {profile.level}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <Calendar className="w-3.5 h-3.5" /> Joined {profile.joined}
          </span>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────── */}
      <div className="flex items-center border-t border-b border-white/[0.06] bg-[rgba(15,15,26,0.4)]">
        {[
          { label: "Followers", value: profile.followers },
          { label: "Following", value: profile.following },
          { label: "Uploads", value: profile.uploads },
          { label: "Downloads", value: profile.downloads.toLocaleString() },
          { label: "Points", value: profile.points.toLocaleString(), isPoints: true },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className={`flex-1 text-center py-5 px-4 cursor-pointer hover:bg-white/[0.03] rounded-[10px] transition-colors ${i < arr.length - 1 ? "border-r border-white/[0.06]" : ""}`}
          >
            <span className={`font-display text-[22px] md:text-[26px] block mb-1 ${s.isPoints ? "bg-[linear-gradient(135deg,#A855F7,#06B6D4)] bg-clip-text text-transparent" : "text-text-primary"}`}>
              {s.value}
            </span>
            <span className="text-[11px] font-semibold text-text-disabled uppercase tracking-[0.5px]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Badges Row ──────────────────────────────────── */}
      <div className="px-6 md:px-10 py-4 border-b border-white/[0.06] flex items-center gap-2.5 flex-wrap">
        {profile.badges.map(b => {
          const badge = BADGE_DATA[b];
          if (!badge) return null;
          return (
            <span
              key={b}
              className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-default"
              style={{
                backgroundColor: `rgba(${badge.rgb}, 0.12)`,
                color: badge.color,
                border: `1px solid rgba(${badge.rgb}, 0.25)`,
              }}
            >
              <span>{badge.emoji}</span>
              {badge.name}
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 mb-1 bg-bg-surface-3 border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-[11px] font-normal text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                {badge.desc}
              </span>
            </span>
          );
        })}
      </div>

      {/* ── Profile Tabs ──────────────────────────────────── */}
      <div className="px-6 md:px-10 flex border-b border-white/[0.06]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px transition-all ${
              activeTab === t.key
                ? "text-brand-light border-brand"
                : "text-text-muted border-transparent hover:text-text-secondary"
            }`}
          >
            {t.label}
            <span className={`text-[11px] font-semibold rounded-full px-[7px] py-[2px] ${
              activeTab === t.key ? "bg-brand/15 text-brand-light" : "bg-white/[0.06] text-text-disabled"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      <div className="px-6 md:px-10 py-8">
        {activeTab === "uploads" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="w-14 h-14 text-white/[0.08] mb-3" />
            <p className="text-text-muted mb-4">No documents uploaded yet.</p>
            {isOwner && (
              <Link href="/library" className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-brand-light transition-colors">
                <Upload className="w-4 h-4" /> Upload your first document
              </Link>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PenLine className="w-14 h-14 text-white/[0.08] mb-3" />
            <p className="text-text-muted mb-4">No blog posts yet.</p>
            {isOwner && (
              <Link href="/blog/write" className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-brand-light transition-colors">
                <PenLine className="w-4 h-4" /> Write your first post
              </Link>
            )}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.badges.map((b, i) => {
              const badge = BADGE_DATA[b];
              if (!badge) return null;
              return (
                <div
                  key={b}
                  className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl p-5 text-center relative overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all"
                  style={{ animation: `card-enter 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both` }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: badge.color }} />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3"
                    style={{
                      backgroundColor: `rgba(${badge.rgb}, 0.12)`,
                      border: `1px solid rgba(${badge.rgb}, 0.25)`,
                    }}
                  >
                    {badge.emoji}
                  </div>
                  <p className="text-sm font-bold text-text-primary mb-1.5">{badge.name}</p>
                  <p className="text-xs text-text-muted leading-[18px] mb-2.5">{badge.desc}</p>
                  <p className="text-[11px] text-text-disabled">Earned Oct 2024</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
