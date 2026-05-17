"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, type Theme } from "@/hooks/useTheme";
import {
  Upload, Users, Download, Sparkles, PenSquare, User, BarChart3,
  Bookmark, Settings, Eye, Heart, Clock, Trash2, Edit, FileText,
  Camera, Lock, Bell as BellIcon, Sun, Moon, Monitor, ShieldCheck,
  KeyRound, Link2, Plus, X, Mail,
} from "lucide-react";
import OtpModal from "@/components/auth/OtpModal";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EmailAuthProvider, linkWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

type DashTab = "overview" | "uploads" | "bookmarks" | "settings";
type SettingsTab = "profile" | "account" | "notifications";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as DashTab) || "overview";
  const [activeTab, setActiveTab] = useState<DashTab>(initialTab);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  // 2FA state
  const [twoFaEmail, setTwoFaEmail] = useState(false);
  const [twoFaGoogle, setTwoFaGoogle] = useState(false);
  const [showLinkPasswordOtp, setShowLinkPasswordOtp] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [linkingPassword, setLinkingPassword] = useState(false);
  // Admin notification emails
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  
  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (user) {
      setTwoFaEmail(!!(user as any).twoFactorEnabled && (user as any).twoFactorMethods?.includes("email"));
      setTwoFaGoogle(!!(user as any).twoFactorEnabled && (user as any).twoFactorMethods?.includes("google"));
      setAdminEmails((user as any).notificationEmails || []);
    }
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { icon: Upload, label: "Uploads", value: user?.uploadsCount || 0, gradient: "linear-gradient(90deg, #7C3AED, #A855F7)", iconBg: "rgba(124,58,237,0.12)", iconBorder: "rgba(124,58,237,0.2)" },
    { icon: Users, label: "Followers", value: user?.followersCount || 0, gradient: "linear-gradient(90deg, #06B6D4, #22D3EE)", iconBg: "rgba(6,182,212,0.12)", iconBorder: "rgba(6,182,212,0.2)" },
    { icon: Download, label: "Downloads", value: user?.totalDownloads || 0, gradient: "linear-gradient(90deg, #F59E0B, #FCD34D)", iconBg: "rgba(245,158,11,0.12)", iconBorder: "rgba(245,158,11,0.2)" },
    { icon: Sparkles, label: "Points", value: user?.points || 0, gradient: "linear-gradient(90deg, #7C3AED, #06B6D4)", iconBg: "rgba(124,58,237,0.12)", iconBorder: "rgba(124,58,237,0.2)" },
  ];

  const dashTabs: { id: DashTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "uploads", label: "My Uploads", icon: Upload },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const avatarUrl = user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "anon"}`;

  return (
    <div className="max-w-[900px] mx-auto pb-20 md:pb-10">
      {/* Header */}
      <div className="pt-5 md:pt-7 pb-5 md:pb-6">
        <h1 className="font-display text-[clamp(22px,5vw,34px)] text-text-primary mb-1.5">
          {greeting()}, <span className="text-brand-light">{user?.displayName?.split(" ")[0] || "User"}</span> 👋
        </h1>
        <p className="text-sm md:text-[15px] text-text-muted">Here&apos;s what&apos;s happening in your academic world today.</p>

        {/* Quick actions */}
        <div className="flex gap-2 md:gap-2.5 mt-4 md:mt-5 flex-wrap">
          <Link href="/library" className="h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-semibold flex items-center gap-[6px] bg-brand/[0.14] text-brand-light border border-brand/30 hover:bg-brand/[0.24] transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload
          </Link>
          <Link href="/blog/write" className="h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-semibold flex items-center gap-[6px] bg-cyan/10 text-cyan border border-cyan/25 hover:bg-cyan/[0.18] transition-all">
            <PenSquare className="w-3.5 h-3.5" /> Write
          </Link>
          <Link href={`/profile/${user?.username || "me"}`} className="h-[34px] md:h-[38px] px-3.5 md:px-4 rounded-full text-[12px] md:text-[13px] font-semibold flex items-center gap-[6px] bg-white/[0.04] text-text-muted border border-white/[0.08] hover:bg-white/[0.08] hover:text-text-primary transition-all">
            <User className="w-3.5 h-3.5" /> Profile
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3.5 mb-6 md:mb-7">
        {stats.map(s => {
          const StatIcon = s.icon;
          const animatedValue = useCountUp(s.value);
          return (
            <div
              key={s.label}
              className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] p-4 md:p-5 relative overflow-hidden hover:border-brand/25 hover:-translate-y-[2px] transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: s.gradient }} />
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-[10px] flex items-center justify-center mb-2.5 md:mb-3" style={{ background: s.iconBg, border: `1px solid ${s.iconBorder}` }}>
                <StatIcon className="w-[17px] h-[17px] md:w-[19px] md:h-[19px] text-text-muted" />
              </div>
              <span className="font-display text-[26px] md:text-[32px] text-text-primary block mb-1 leading-none">{animatedValue.toLocaleString()}</span>
              <span className="text-[12px] md:text-[13px] font-medium text-text-muted">{s.label}</span>
            </div>
          );
        })}
      </div>


      {/* Tab Nav — scrollable on mobile */}
      <div className="flex gap-0 border-b border-white/[0.07] mb-5 md:mb-7 overflow-x-auto no-scrollbar">
        {dashTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 md:gap-2 px-3.5 md:px-[22px] py-2.5 md:py-3 text-[13px] md:text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? "text-brand-light border-brand"
                : "text-text-disabled border-transparent hover:text-text-muted"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5" style={{ animation: "card-enter 0.4s both" }}>
          {/* Recent Activity */}
          <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Recent Activity</span>
              <Link href="/notifications" className="text-xs text-brand font-medium hover:text-brand-light transition-colors">View all</Link>
            </div>
            {[
              { icon: "📤", bg: "bg-brand/15", text: 'You uploaded "CSC 201 Past Questions"', time: "2h ago" },
              { icon: "❤️", bg: "bg-red-500/12", text: 'Ada Nwosu reacted to your post', time: "5h ago" },
              { icon: "💬", bg: "bg-cyan/12", text: 'New comment on "MTH 201 Notes"', time: "8h ago" },
              { icon: "👤", bg: "bg-brand/15", text: "Dr. Okafor started following you", time: "12h ago" },
              { icon: "⬇️", bg: "bg-gold/12", text: 'Your document was downloaded 50 times', time: "1d ago" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 px-5 py-3 border-b border-white/[0.04] last:border-b-0 items-start">
                <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm shrink-0 ${a.bg}`}>{a.icon}</div>
                <div>
                  <p className="text-[13px] text-text-secondary leading-5">{a.text}</p>
                  <span className="text-[11px] text-text-disabled mt-0.5 block">{a.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] p-[18px]">
            <span className="text-sm font-bold text-text-primary block mb-3.5">Badges Earned</span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: "📝", name: "Note Legend", earned: true },
                { icon: "🏆", name: "Top Contributor", earned: true },
                { icon: "🔬", name: "Research King", earned: false },
                { icon: "⭐", name: "Popular", earned: false },
              ].map((b, i) => (
                <div key={i} className={`bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 text-center hover:border-brand/25 hover:-translate-y-[2px] transition-all ${!b.earned ? "opacity-40" : ""}`}>
                  <span className="text-[28px] block mb-2">{b.icon}</span>
                  <span className="text-xs font-semibold text-text-primary">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MY UPLOADS ───────────────────────────────────── */}
      {activeTab === "uploads" && (
        <div style={{ animation: "card-enter 0.4s both" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-text-muted">You have <span className="text-text-primary font-semibold">{user?.uploadsCount || 0}</span> uploads</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "CSC 201 Past Questions 2024", type: "Past Questions", downloads: 1240, likes: 342, date: "2 days ago" },
              { title: "MTH 101 Lecture Notes", type: "Notes", downloads: 890, likes: 210, date: "1 week ago" },
              { title: "PHY 201 Lab Manual", type: "Handout", downloads: 650, likes: 178, date: "2 weeks ago" },
            ].map((doc, i) => (
              <div key={i} className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl p-5 relative group hover:border-white/[0.11] transition-all">
                {/* Owner actions */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button className="w-[30px] h-[30px] rounded-[7px] bg-[rgba(8,8,16,0.8)] border border-white/[0.12] text-text-muted flex items-center justify-center hover:text-text-primary transition-all" style={{ backdropFilter: "blur(4px)" }}>
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-[30px] h-[30px] rounded-[7px] bg-[rgba(8,8,16,0.8)] border border-white/[0.12] text-text-muted flex items-center justify-center hover:bg-error/15 hover:text-error hover:border-error/30 transition-all" style={{ backdropFilter: "blur(4px)" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-light">{doc.type}</span>
                <h3 className="text-[15px] font-bold text-text-primary mt-2 mb-3 leading-snug pr-16">{doc.title}</h3>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloads.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {doc.likes}</span>
                  <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BOOKMARKS ────────────────────────────────────── */}
      {activeTab === "bookmarks" && (
        <div style={{ animation: "card-enter 0.4s both" }}>
          {/* Bookmarked Documents */}
          <div className="mb-8">
            <h3 className="text-[15px] font-bold text-text-primary flex items-center gap-2 mb-4">
              📄 Bookmarked Documents <span className="text-xs font-semibold text-text-disabled bg-white/[0.06] rounded-full px-2 py-0.5">3</span>
            </h3>
            {[
              { title: "CSC 341 Compiler Design Notes", type: "notes", meta: "Dr. Okafor · 890 downloads" },
              { title: "MTH 201 Past Questions 2023", type: "past_questions", meta: "Jane Smith · 1.2k downloads" },
              { title: "ENG 111 Communication Skills", type: "notes", meta: "Ada Nwosu · 580 downloads" },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-3 rounded-[10px] border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-[background] cursor-pointer">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.type === "notes" ? "bg-brand-light" : "bg-gold"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{d.title}</p>
                  <p className="text-xs text-text-disabled">{d.meta}</p>
                </div>
                <button className="w-7 h-7 rounded-[7px] flex items-center justify-center text-text-disabled hover:bg-error/10 hover:text-error transition-all shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Bookmarked Blog Posts */}
          <div>
            <h3 className="text-[15px] font-bold text-text-primary flex items-center gap-2 mb-4">
              ✍️ Bookmarked Posts <span className="text-xs font-semibold text-text-disabled bg-white/[0.06] rounded-full px-2 py-0.5">2</span>
            </h3>
            {[
              { title: "How to survive CSC 201 Project Defense", author: "John Doe", time: "2 days ago" },
              { title: "Best study spots on campus ranked", author: "Chukwuemeka", time: "1 week ago" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-3 rounded-[10px] border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-[background] cursor-pointer">
                <span className="text-lg shrink-0">📝</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{p.title}</p>
                  <p className="text-xs text-text-disabled">by {p.author} · {p.time}</p>
                </div>
                <button className="w-7 h-7 rounded-[7px] flex items-center justify-center text-text-disabled hover:bg-error/10 hover:text-error transition-all shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETTINGS ─────────────────────────────────────── */}
      {activeTab === "settings" && (
        <div style={{ animation: "card-enter 0.4s both" }}>
          {/* Settings sub-tabs */}
          <div className="flex gap-1 mb-8 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit">
            {([
              { id: "profile" as SettingsTab, label: "Profile", icon: User },
              { id: "account" as SettingsTab, label: "Account", icon: Lock },
              { id: "notifications" as SettingsTab, label: "Notifications", icon: BellIcon },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setSettingsTab(t.id)}
                className={`flex items-center gap-[7px] px-5 py-[9px] rounded-lg text-[13px] font-semibold transition-all ${
                  settingsTab === t.id ? "bg-brand/[0.18] text-brand-light" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>

          <div className="max-w-[640px]">
            {/* Profile Settings */}
            {settingsTab === "profile" && (
              <div className="space-y-5">
                <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-[22px] py-[18px] border-b border-white/[0.06] text-[15px] font-bold text-text-primary">Profile Information</div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user) return;
                    try {
                      const fd = new FormData(e.currentTarget);
                      const displayName = fd.get("displayName") as string;
                      const bio = fd.get("bio") as string;
                      await updateDoc(doc(db, "users", user.uid), { displayName, bio });
                      toast.success("Profile updated");
                      refreshUser();
                    } catch (err: any) {
                      toast.error("Failed to save: " + err.message);
                    }
                  }} className="p-[22px] space-y-5">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-4 md:gap-5 pb-5 border-b border-white/[0.06]">
                      <img src={avatarUrl} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-[3px] border-brand/30 shrink-0" />
                      <div className="flex flex-col gap-2">
                        <input type="file" id="avatar-photo-input" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !user) return;
                          try {
                            toast.loading("Uploading avatar...", { id: "avatar-upload" });
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);
                            await updateDoc(doc(db, "users", user.uid), { profilePicture: data.url });
                            toast.success("Avatar updated", { id: "avatar-upload" });
                            refreshUser();
                          } catch (err: any) {
                            toast.error("Upload failed: " + err.message, { id: "avatar-upload" });
                          }
                        }} />
                        <button type="button" onClick={() => document.getElementById("avatar-photo-input")?.click()} className="h-[34px] px-3.5 rounded-lg bg-brand/[0.12] border border-brand/30 text-brand-light text-[13px] font-semibold hover:bg-brand/[0.22] transition-all flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" /> Change Photo
                        </button>
                        <button type="button" onClick={async () => {
                          if (!user) return;
                          await updateDoc(doc(db, "users", user.uid), { profilePicture: "" });
                          refreshUser();
                        }} className="h-[34px] px-3.5 rounded-lg bg-transparent border border-error/25 text-error text-[13px] font-medium hover:bg-error/10 transition-all text-left">
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Cover Photo */}
                    <div className="pb-5 border-b border-white/[0.06]">
                      <label className="text-[13px] font-medium text-text-secondary block mb-2.5">Cover Photo</label>
                      <input type="file" id="cover-photo-input" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !user) return;
                          try {
                            toast.loading("Uploading cover...", { id: "cover-upload" });
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);
                            await updateDoc(doc(db, "users", user.uid), { coverPhoto: data.url });
                            toast.success("Cover updated", { id: "cover-upload" });
                            refreshUser();
                          } catch (err: any) {
                            toast.error("Upload failed: " + err.message, { id: "cover-upload" });
                          }
                        }} />
                      <div
                        className="w-full h-[120px] md:h-[180px] rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] relative overflow-hidden group cursor-pointer hover:border-brand/30 transition-all"
                        onClick={() => document.getElementById("cover-photo-input")?.click()}
                      >
                        {user?.coverPhoto ? (
                          <>
                            <img src={user.coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={(e) => { e.stopPropagation(); document.getElementById("cover-photo-input")?.click(); }} className="h-8 px-3.5 rounded-lg bg-white/15 text-text-primary text-[12px] font-semibold hover:bg-white/25 transition-all">Change</button>
                              <button type="button" onClick={async (e) => { 
                                e.stopPropagation(); 
                                if (!user) return;
                                await updateDoc(doc(db, "users", user.uid), { coverPhoto: "" });
                                refreshUser();
                              }} className="h-8 px-3.5 rounded-lg bg-error/15 border border-error/30 text-error text-[12px] font-semibold hover:bg-error/25 transition-all">Remove</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col items-center justify-center h-full gap-1.5 relative z-10 group-hover:opacity-0 transition-opacity">
                              <Camera className="w-5 h-5 text-text-disabled" />
                              <span className="text-[12px] text-text-disabled">Click to upload cover photo</span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              <button type="button" onClick={(e) => { e.stopPropagation(); document.getElementById("cover-photo-input")?.click(); }} className="h-8 px-3.5 rounded-lg bg-white/15 text-text-primary text-[12px] font-semibold hover:bg-white/25 transition-all">Upload Cover</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-text-secondary">Display Name</label>
                      <input type="text" name="displayName" defaultValue={user?.displayName || ""} className="h-11 bg-white/[0.04] border border-white/10 rounded-[10px] px-3.5 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all" />
                    </div>
                    {/* Read-only: Username */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-text-secondary">Username</label>
                      <div className="h-11 bg-white/[0.02] border border-white/[0.06] rounded-[10px] px-3.5 flex items-center text-sm text-text-disabled">
                        @{user?.username || ""}
                        <Lock className="w-3.5 h-3.5 ml-auto" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-text-secondary">Bio</label>
                      <textarea name="bio" defaultValue={user?.bio || ""} maxLength={160} rows={3} className="bg-white/[0.04] border border-white/10 rounded-[10px] p-3.5 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all resize-none" />
                    </div>
                    {/* Read-only fields */}
                    {[
                      { label: "Department", value: user?.department || "N/A" },
                      { label: "Level", value: user?.currentLevel || "N/A" },
                    ].map((f, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-text-secondary">{f.label}</label>
                        <div className="h-11 bg-white/[0.02] border border-white/[0.06] rounded-[10px] px-3.5 flex items-center text-sm text-text-disabled">
                          {f.value}
                          <Lock className="w-3.5 h-3.5 ml-auto text-text-disabled" />
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={savingProfile} className="h-[42px] px-[22px] rounded-[10px] bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {settingsTab === "account" && (
              <div className="space-y-5">
                {/* Theme Toggle */}
                <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-[22px] py-[18px] border-b border-white/[0.06] text-[15px] font-bold text-text-primary">Appearance</div>
                  <div className="p-[22px]">
                    <label className="text-[13px] font-medium text-text-secondary block mb-3">Theme</label>
                    <div className="flex gap-2">
                      {([
                        { id: 'dark' as Theme, label: 'Dark', icon: Moon, desc: 'Dark background' },
                        { id: 'light' as Theme, label: 'Light', icon: Sun, desc: 'Light background' },
                        { id: 'system' as Theme, label: 'System', icon: Monitor, desc: 'Match device' },
                      ]).map(opt => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id)}
                            className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                              isActive
                                ? 'bg-brand/[0.14] border-brand/40 text-brand-light shadow-[0_0_16px_rgba(124,58,237,0.15)]'
                                : 'bg-white/[0.02] border-white/[0.07] text-text-muted hover:bg-white/[0.05] hover:text-text-secondary'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-light' : ''}`} />
                            <span className="text-[13px] font-semibold">{opt.label}</span>
                            <span className="text-[10px] text-text-disabled">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-[22px] py-[18px] border-b border-white/[0.06] text-[15px] font-bold text-text-primary">Account</div>
                  <div className="p-[22px] space-y-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-text-secondary">Email Address</label>
                      <div className="h-11 bg-white/[0.02] border border-white/[0.06] rounded-[10px] px-3.5 flex items-center text-sm text-text-disabled">
                        {user?.email || "Not set"}
                        <Lock className="w-3.5 h-3.5 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Danger zone */}
                <div className="bg-error/[0.06] border border-error/20 rounded-[14px] p-5">
                  <h3 className="text-[15px] font-bold text-error mb-2">Danger Zone</h3>
                  <p className="text-[13px] text-text-muted leading-5 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button className="h-10 px-[18px] rounded-[9px] bg-transparent border border-error/40 text-error text-[13px] font-semibold hover:bg-error/10 transition-all">
                    Delete Account
                  </button>
                </div>

                {/* ── TWO-FACTOR AUTHENTICATION ── */}
                <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-[22px] py-[18px] border-b border-white/[0.06] flex items-center gap-2.5">
                    <ShieldCheck className="w-[18px] h-[18px] text-brand-light" />
                    <span className="text-[15px] font-bold text-text-primary">Two-Factor Authentication</span>
                  </div>
                  <div className="p-[22px] space-y-4">
                    <p className="text-[13px] text-text-muted leading-5">Add an extra layer of security by requiring a one-time code sent to your email each time you log in.</p>
                    
                    {/* 2FA for email/password login */}
                    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.04]">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-semibold text-text-primary mb-0.5 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-brand-light" /> Email & Password Login
                        </p>
                        <p className="text-xs text-text-muted">Require OTP verification on every email/password login</p>
                      </div>
                      <label className="relative w-12 h-[26px] shrink-0">
                        <input
                          type="checkbox"
                          checked={twoFaEmail}
                          onChange={async (e) => {
                            const enabled = e.target.checked;
                            setTwoFaEmail(enabled);
                            if (!user) return;
                            try {
                              const methods = enabled
                                ? [...new Set([...(twoFaGoogle ? ["google"] : []), "email"])]
                                : (twoFaGoogle ? ["google"] : []);
                              await updateDoc(doc(db, "users", user.uid), {
                                twoFactorEnabled: methods.length > 0,
                                twoFactorMethods: methods,
                              });
                              toast.success(enabled ? "2FA enabled for email login" : "2FA disabled for email login");
                            } catch { toast.error("Failed to update 2FA"); }
                          }}
                          className="sr-only peer"
                        />
                        <span className="absolute inset-0 cursor-pointer rounded-full bg-white/10 peer-checked:bg-brand transition-[background] duration-200" />
                        <span className="absolute w-5 h-5 rounded-full bg-white left-[3px] top-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform duration-200 peer-checked:translate-x-[22px]" style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }} />
                      </label>
                    </div>

                    {/* 2FA for Google login */}
                    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.04]">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-semibold text-text-primary mb-0.5 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          Google Login
                        </p>
                        <p className="text-xs text-text-muted">Require OTP verification on Google sign-in</p>
                      </div>
                      <label className="relative w-12 h-[26px] shrink-0">
                        <input
                          type="checkbox"
                          checked={twoFaGoogle}
                          onChange={async (e) => {
                            const enabled = e.target.checked;
                            setTwoFaGoogle(enabled);
                            if (!user) return;
                            try {
                              const methods = enabled
                                ? [...new Set([...(twoFaEmail ? ["email"] : []), "google"])]
                                : (twoFaEmail ? ["email"] : []);
                              await updateDoc(doc(db, "users", user.uid), {
                                twoFactorEnabled: methods.length > 0,
                                twoFactorMethods: methods,
                              });
                              toast.success(enabled ? "2FA enabled for Google login" : "2FA disabled for Google login");
                            } catch { toast.error("Failed to update 2FA"); }
                          }}
                          className="sr-only peer"
                        />
                        <span className="absolute inset-0 cursor-pointer rounded-full bg-white/10 peer-checked:bg-brand transition-[background] duration-200" />
                        <span className="absolute w-5 h-5 rounded-full bg-white left-[3px] top-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform duration-200 peer-checked:translate-x-[22px]" style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }} />
                      </label>
                    </div>

                    {/* Add Password (Google-only users) */}
                    {auth.currentUser?.providerData?.every(p => p.providerId === "google.com") && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-3.5 h-3.5 text-cyan" />
                          <span className="text-sm font-semibold text-text-primary">Add Password Login</span>
                        </div>
                        <p className="text-xs text-text-muted mb-3">You signed up with Google. Add a password so you can also log in with email & password.</p>
                        <button
                          onClick={() => setShowLinkPasswordOtp(true)}
                          className="h-9 px-4 rounded-lg bg-cyan/10 border border-cyan/25 text-cyan text-[13px] font-semibold hover:bg-cyan/[0.18] transition-all flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Add Password
                        </button>
                        <OtpModal
                          isOpen={showLinkPasswordOtp}
                          onClose={() => setShowLinkPasswordOtp(false)}
                          onVerified={async () => {
                            setShowLinkPasswordOtp(false);
                            // Show password input
                            const pw = prompt("Enter your new password (min 6 characters):");
                            if (pw && pw.length >= 6 && auth.currentUser?.email) {
                              try {
                                const credential = EmailAuthProvider.credential(auth.currentUser.email, pw);
                                await linkWithCredential(auth.currentUser, credential);
                                toast.success("Password login added successfully!");
                              } catch (err: any) {
                                toast.error(err.message || "Failed to add password");
                              }
                            }
                          }}
                          email={user?.email || ""}
                          purpose="link_password"
                          title="Verify Your Email"
                          description="Enter the code sent to"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── ADMIN NOTIFICATION EMAILS ── */}
                {user?.role === "super_admin" && (
                  <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="px-[22px] py-[18px] border-b border-white/[0.06] flex items-center gap-2.5">
                      <Mail className="w-[18px] h-[18px] text-brand-light" />
                      <span className="text-[15px] font-bold text-text-primary">Admin Notification Emails</span>
                    </div>
                    <div className="p-[22px] space-y-3">
                      <p className="text-[13px] text-text-muted leading-5">Add extra email addresses to receive admin notifications (approvals, reports, etc.)</p>
                      
                      {/* Existing emails */}
                      <div className="space-y-2">
                        {/* Primary email — always included, can't remove */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand/[0.06] border border-brand/20">
                          <Mail className="w-3.5 h-3.5 text-brand-light shrink-0" />
                          <span className="text-[13px] text-text-primary flex-1 truncate">{user.email}</span>
                          <span className="text-[10px] font-bold text-brand-light bg-brand/10 px-2 py-0.5 rounded-full">PRIMARY</span>
                        </div>
                        {adminEmails.map((em, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span className="text-[13px] text-text-secondary flex-1 truncate">{em}</span>
                            <button
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, "users", user.uid), { notificationEmails: arrayRemove(em) });
                                  setAdminEmails(prev => prev.filter(e => e !== em));
                                  toast.success("Email removed");
                                } catch { toast.error("Failed to remove email"); }
                              }}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-text-disabled hover:text-error hover:bg-error/10 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new email */}
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="admin@email.com"
                          className="flex-1 h-10 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm px-3.5 outline-hidden focus:border-brand transition-all placeholder:text-text-disabled"
                        />
                        <button
                          onClick={async () => {
                            if (!newAdminEmail || !newAdminEmail.includes("@")) return;
                            try {
                              await updateDoc(doc(db, "users", user.uid), { notificationEmails: arrayUnion(newAdminEmail) });
                              setAdminEmails(prev => [...prev, newAdminEmail]);
                              setNewAdminEmail("");
                              toast.success("Email added");
                            } catch { toast.error("Failed to add email"); }
                          }}
                          disabled={!newAdminEmail || !newAdminEmail.includes("@")}
                          className="h-10 px-4 rounded-[10px] bg-brand/[0.14] border border-brand/30 text-brand-light text-[13px] font-semibold hover:bg-brand/[0.24] transition-all disabled:opacity-40 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings */}
            {settingsTab === "notifications" && (
              <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-[22px] py-[18px] border-b border-white/[0.06] text-[15px] font-bold text-text-primary">Notification Preferences</div>
                <div className="p-[22px]">
                  {[
                    { label: "New followers", desc: "When someone follows your profile", default: true },
                    { label: "Reactions on uploads", desc: "When someone reacts to your documents", default: true },
                    { label: "Comments on uploads", desc: "When someone comments on your content", default: true },
                    { label: "Replies to comments", desc: "When someone replies to your comment", default: true },
                    { label: "@Mentions", desc: "When someone mentions you in a post", default: true },
                    { label: "New uploads by followed", desc: "When users you follow upload new documents", default: false },
                    { label: "Account status updates", desc: "Important account notifications", default: true, locked: true },
                    { label: "Weekly digest", desc: "Summary of your weekly activity", default: false },
                    { label: "Email notifications", desc: "Receive notifications via email", default: false },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-b-0">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-semibold text-text-primary mb-0.5">{n.label}</p>
                        <p className="text-xs text-text-muted">{n.desc}</p>
                      </div>
                      <label className="relative w-12 h-[26px] shrink-0">
                        <input type="checkbox" defaultChecked={n.default} disabled={n.locked} className="sr-only peer" />
                        <span className="absolute inset-0 cursor-pointer rounded-full bg-white/10 peer-checked:bg-brand transition-[background] duration-200" />
                        <span className="absolute w-5 h-5 rounded-full bg-white left-[3px] top-[3px] shadow-[0_2px_6px_rgba(0,0,0,0.3)] transition-transform duration-200 peer-checked:translate-x-[22px]" style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
