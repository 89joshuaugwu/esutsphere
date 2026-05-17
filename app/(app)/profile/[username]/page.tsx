"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Calendar, MessageCircle, Camera, Upload, PenLine, Heart, Download, Eye, FileText, LogIn, UserPlus, Loader2, UserX } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserByUsername } from "@/lib/firestore";
import type { User } from "@/types";

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
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);
      try {
        const fetched = await getUserByUsername(username);
        if (!fetched) {
          setNotFound(true);
        } else {
          setProfile(fetched);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (username) fetchProfile();
  }, [username]);

  // ── Auth gate: unauthenticated users cannot view profiles ──
  if (!isLoggedIn) {
    return (
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.15)_0%,rgba(6,182,212,0.08)_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand/[0.06] blur-[100px]" />
        <div className="relative z-10 text-center px-6 max-w-md mx-auto" style={{ animation: "card-enter 0.5s both" }}>
          <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-9 h-9 text-brand-light" />
          </div>
          <h2 className="font-display text-[26px] md:text-[32px] text-text-primary mb-3">Join ESUTSphere</h2>
          <p className="text-sm md:text-[15px] text-text-muted leading-relaxed mb-8">
            Sign in or create an account to view <strong className="text-text-secondary">@{username}</strong>&apos;s profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="h-11 px-6 rounded-[10px] bg-brand text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] transition-all">
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
            <Link href="/signup" className="h-11 px-6 rounded-[10px] bg-white/[0.06] border border-white/[0.1] text-text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-all">
              <UserPlus className="w-4 h-4" /> Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 text-brand-light animate-spin" />
      </div>
    );
  }

  // ── Profile not found ──
  if (notFound || !profile) {
    return (
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 min-h-[70vh] flex items-center justify-center">
        <div className="text-center px-6" style={{ animation: "card-enter 0.4s both" }}>
          <div className="w-20 h-20 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-5">
            <UserX className="w-9 h-9 text-error" />
          </div>
          <h2 className="text-[22px] font-bold text-text-primary mb-2">Profile Not Found</h2>
          <p className="text-[14px] text-text-muted mb-6 max-w-[300px] mx-auto">
            The user <strong className="text-text-secondary">@{username}</strong> doesn&apos;t exist or has been removed.
          </p>
          <Link href="/explore" className="h-10 px-5 rounded-lg bg-brand/[0.14] border border-brand/30 text-brand-light text-[13px] font-semibold hover:bg-brand/[0.24] transition-all inline-flex items-center gap-2">
            Explore Users
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.username === username;
  const avatarUrl = profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  const joinDate = profile.createdAt
    ? new Date((profile.createdAt as any)?.seconds ? (profile.createdAt as any).seconds * 1000 : (profile.createdAt as any)).toLocaleDateString("en-NG", { month: "short", year: "numeric" })
    : "Unknown";

  const tabs = [
    { key: "uploads" as const, label: "Uploads", count: profile.uploadsCount || 0 },
    { key: "posts" as const, label: "Blog Posts", count: 0 },
    { key: "badges" as const, label: "Badges", count: profile.badges?.length || 0 },
  ];

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      {/* ── Cover Photo ──────────────────────────────────── */}
      <div className="relative w-full h-[180px] md:h-[220px] overflow-hidden">
        {profile.coverPhoto ? (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[linear-gradient(135deg,rgba(124,58,237,0.6)_0%,rgba(91,33,182,0.4)_40%,rgba(6,182,212,0.3)_100%)]" />
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
            src={avatarUrl}
            alt={profile.displayName}
            className={`w-[104px] h-[104px] rounded-full object-cover border-4 border-bg-base shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${profile.isVerified ? "outline-3 outline-brand outline-offset-[3px]" : ""}`}
          />
          {/* Online indicator - no edit buttons on avatar */}
        </div>

        {/* Action buttons — absolute right */}
        <div className="absolute top-4 right-6 md:right-10 flex gap-2.5">
          {isOwner ? (
            <Link href="/dashboard?tab=settings" className="h-[38px] px-[18px] rounded-full bg-transparent text-text-muted border border-white/[0.14] text-sm font-medium hover:bg-white/[0.06] hover:text-text-primary transition-all inline-flex items-center">
              Edit Profile
            </Link>
          ) : (
            <>
              <button className="h-[38px] px-5 rounded-full bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold border-none shadow-[0_4px_16px_rgba(124,58,237,0.4)] hover:scale-[1.04] hover:shadow-[0_8px_24px_rgba(124,58,237,0.55)] transition-all">
                Follow
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
        {profile.bio && (
          <p className="text-[15px] text-text-secondary leading-6 max-w-[540px] mb-3">
            {profile.bio}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <MapPin className="w-3.5 h-3.5" /> {profile.department} · {profile.currentLevel}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <Calendar className="w-3.5 h-3.5" /> Joined {joinDate}
          </span>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────── */}
      <div className="flex items-center border-t border-b border-white/[0.06] bg-[rgba(15,15,26,0.4)]">
        {[
          { label: "Followers", value: profile.followersCount || 0 },
          { label: "Following", value: profile.followingCount || 0 },
          { label: "Uploads", value: profile.uploadsCount || 0 },
          { label: "Downloads", value: (profile.totalDownloads || 0).toLocaleString() },
          { label: "Points", value: (profile.points || 0).toLocaleString(), isPoints: true },
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
      {profile.badges && profile.badges.length > 0 && (
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
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 mb-1 bg-bg-surface-3 border border-white/[0.12] rounded-lg px-2.5 py-1.5 text-[11px] font-normal text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                  {badge.desc}
                </span>
              </span>
            );
          })}
        </div>
      )}

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
            {(profile.badges || []).map((b, i) => {
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
                  <p className="text-xs text-text-muted leading-[18px]">{badge.desc}</p>
                </div>
              );
            })}
            {(!profile.badges || profile.badges.length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-text-muted">No badges earned yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
