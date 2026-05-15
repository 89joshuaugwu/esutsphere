"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Camera, Upload, Heart, Download, Users, TrendingUp, Bell, BookOpen, MessageCircle, Home, User, Settings, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userDept, setUserDept] = useState("");

  // Real-time listener for approval status
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.displayName || "");
        setUserAvatar(data.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`);
        setUserDept(data.department || "");

        if (data.approvalStatus === "approved") {
          toast.success(`🎉 Welcome to ESUTSphere, ${data.displayName}! Your account is now active.`, { duration: 5000 });
          router.push("/feed");
        }
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* ── Sidebar (Desktop) ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[240px] border-r border-white/[0.06] bg-[rgba(15,15,26,0.6)] p-4 gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-4">
          <img src="/logo.png" alt="ESUTSphere" className="w-8 h-8 rounded-full" />
          <span className="text-sm font-bold text-text-primary">ESUTSphere</span>
        </div>

        {/* Nav items — all locked */}
        {[
          { icon: Home, label: "Feed" },
          { icon: BookOpen, label: "Library" },
          { icon: MessageCircle, label: "Messages" },
          { icon: Bell, label: "Notifications" },
          { icon: User, label: "Profile", unlocked: true },
          { icon: Settings, label: "Settings" },
        ].map(item => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
              item.unlocked
                ? "text-text-primary hover:bg-white/[0.06] cursor-pointer"
                : "text-text-disabled cursor-not-allowed"
            }`}
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
            {!item.unlocked && <span className="ml-auto text-[11px]">🔒</span>}
          </div>
        ))}

        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          {/* User mini card */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
            <img src={userAvatar || "/logo.png"} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{userName || "Loading..."}</p>
              <p className="text-[10px] text-text-disabled truncate">{userDept}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Pending Banner */}
        <div
          className="sticky top-0 z-50 flex items-center justify-between gap-4 px-5 py-3"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))",
            borderBottom: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-[rgba(245,158,11,0.15)] flex items-center justify-center text-sm"
              style={{ animation: "pending-pulse-sm 2s ease-in-out infinite" }}
            >
              ⏳
            </div>
            <div>
              <p className="text-sm font-medium text-[#FCD34D]">Account under review</p>
              <p className="text-xs text-[rgba(252,211,77,0.7)]">Typically approved within 24–48 hours</p>
            </div>
          </div>
          <span
            className="bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] rounded-full px-3 py-1 text-xs font-semibold text-gold whitespace-nowrap hidden sm:block"
            style={{ animation: "badge-blink 3s ease-in-out infinite" }}
          >
            ● PENDING
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 py-6">
            {/* Stats Cards — All show "--" */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Upload, label: "Uploads", color: "brand" },
                { icon: Users, label: "Followers", color: "cyan" },
                { icon: Download, label: "Downloads", color: "success" },
                { icon: Heart, label: "Likes", color: "gold" },
              ].map(s => (
                <div key={s.label} className="locked-section bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl p-4 text-center relative">
                  <s.icon className="w-5 h-5 mx-auto mb-2 text-text-disabled" />
                  <span className="font-display text-2xl text-text-disabled block">--</span>
                  <span className="text-[11px] font-medium text-text-disabled">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Upload Button — Locked */}
            <div className="locked-section bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3 mb-6 relative">
              <Upload className="w-5 h-5 text-text-disabled" />
              <span className="text-sm font-semibold text-text-disabled">Upload Document</span>
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                <span className="bg-[rgba(22,22,42,0.95)] border border-white/[0.12] rounded-[10px] px-3.5 py-2 flex items-center gap-2 text-[13px] font-semibold text-text-muted shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  🔒 Available after approval
                </span>
              </div>
            </div>

            {/* Ghost Posts — Blurred */}
            <div className="space-y-3 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[rgba(22,22,42,0.8)] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden">
                  <div className="filter blur-[4px] pointer-events-none select-none">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-brand/20" />
                      <div>
                        <div className="h-3 w-24 bg-white/10 rounded" />
                        <div className="h-2 w-16 bg-white/[0.06] rounded mt-1.5" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-white/[0.08] rounded mb-2" />
                    <div className="h-3 w-3/4 bg-white/[0.06] rounded mb-2" />
                    <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(8,8,16,0.5)]">
                    <span className="bg-brand/15 border border-brand/30 rounded-full px-4 py-1.5 text-[13px] font-semibold text-brand-light">
                      🔒 Join the community to read this
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Section — UNLOCKED */}
            <div className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                👤 Your Profile
                <span className="bg-success/10 border border-success/25 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-success">
                  ✓ Ready
                </span>
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={userAvatar || "/logo.png"}
                    alt={userName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-brand/40"
                  />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand flex items-center justify-center border-2 border-bg-base hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-base font-bold text-text-primary">{userName}</p>
                  <p className="text-xs text-text-muted">{userDept}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 bg-success/10 border border-success/25 rounded-full px-3 py-1 text-xs font-semibold text-success">
                  ✓ Profile ready — your account is being reviewed
                </span>
              </div>
            </div>

            {/* Approval Steps Tracker */}
            <div className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl p-5 md:p-6 mb-6">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-5">
                📋 Approval Progress
              </h3>
              <div className="space-y-0">
                {[
                  { icon: "✅", label: "Account created", desc: "Your account has been set up", status: "done" },
                  { icon: "✅", label: "Documents submitted", desc: "Verification document received", status: "done" },
                  { icon: "⏳", label: "Under review", desc: "Being verified by your class admin", status: "active" },
                  { icon: "⬜", label: "Access granted", desc: "You'll get notified by email", status: "waiting" },
                ].map((step, i) => (
                  <div key={i} className={`flex items-center gap-3.5 py-3 ${i < 3 ? "border-b border-white/[0.04]" : ""}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        step.status === "done" ? "bg-success/15 border border-success/30" :
                        step.status === "active" ? "bg-gold/15 border border-gold/30" :
                        "bg-white/[0.04] border border-white/[0.08]"
                      }`}
                      style={step.status === "active" ? { animation: "pending-pulse-sm 2s ease-in-out infinite" } : undefined}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        step.status === "done" ? "text-success" :
                        step.status === "active" ? "text-gold" :
                        "text-text-disabled"
                      }`}>{step.label}</p>
                      <p className="text-xs text-text-disabled">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending (FOMO element) */}
            <div className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" /> Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {["#PastQuestions", "#100Level", "#CSC101", "#ExamPrep", "#ESUT2025", "#StudyGroup", "#ProjectTopics"].map(tag => (
                  <span key={tag} className="bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1.5 text-xs font-medium text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden flex items-center justify-around border-t border-white/[0.06] bg-bg-base p-2">
          {[Home, BookOpen, Bell, User].map((Icon, i) => (
            <div key={i} className="flex flex-col items-center gap-1 p-2 text-text-disabled">
              <Icon className="w-5 h-5" />
              {i !== 3 && <span className="text-[9px]">🔒</span>}
            </div>
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-text-muted">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
