"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Download, Eye, Heart, MessageCircle, Share2, Users, Award, Star, BookOpen, FileText, Upload } from "lucide-react";

const TABS = [
  { id: "library", label: "📚 Resource Library" },
  { id: "feed", label: "📰 Campus Feed" },
  { id: "profile", label: "👤 Academic Profile" },
];

const FEATURES: Record<string, { points: { icon: React.ReactNode; title: string; desc: string }[]; preview: React.ReactNode }> = {
  library: {
    points: [
      { icon: <Search className="w-[18px] h-[18px]" />, title: "Search by course code", desc: "Find exactly what you need — type CSC 201 and get every note, past question, and assignment." },
      { icon: <Filter className="w-[18px] h-[18px]" />, title: "Filter by level & department", desc: "Narrow down to your exact department and level. No more scrolling through irrelevant files." },
      { icon: <Eye className="w-[18px] h-[18px]" />, title: "In-browser PDF preview", desc: "View documents directly in the app. No downloads required until you're ready." },
      { icon: <Download className="w-[18px] h-[18px]" />, title: "Download with one click", desc: "When you're ready, one tap downloads instantly. Track what you've downloaded." },
    ],
    preview: <LibraryPreview />,
  },
  feed: {
    points: [
      { icon: <MessageCircle className="w-[18px] h-[18px]" />, title: "See what classmates are sharing", desc: "Stay updated with the latest notes, tips, and campus discussions from your peers." },
      { icon: <Heart className="w-[18px] h-[18px]" />, title: "React with 5 emoji types", desc: "Express yourself with 👍 ❤️ 🔥 💡 😂 — way more fun than a simple like button." },
      { icon: <Users className="w-[18px] h-[18px]" />, title: "Follow students you trust", desc: "Build your academic network. Follow top contributors whose notes you rely on." },
      { icon: <Share2 className="w-[18px] h-[18px]" />, title: "Share to WhatsApp instantly", desc: "Found something useful? Share directly to your class WhatsApp group." },
    ],
    preview: <FeedPreview />,
  },
  profile: {
    points: [
      { icon: <Star className="w-[18px] h-[18px]" />, title: "Build your academic reputation", desc: "Every upload, post, and contribution earns you points and visibility." },
      { icon: <Award className="w-[18px] h-[18px]" />, title: "Earn badges for contributions", desc: "Unlock 'Note Legend', 'Top Contributor', and 'Research King' badges." },
      { icon: <BookOpen className="w-[18px] h-[18px]" />, title: "Track your impact", desc: "See total downloads, likes, and followers. Your profile is your academic CV." },
      { icon: <Users className="w-[18px] h-[18px]" />, title: "Follow top contributors", desc: "Discover and follow the students who share the best materials." },
    ],
    preview: <ProfilePreview />,
  },
};

function LibraryPreview() {
  return (
    <div className="bg-bg-surface-1 rounded-[14px] overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-bg-surface-2">
        <div className="flex items-center gap-2 flex-1 bg-white/[0.05] rounded-lg px-3 py-2 text-xs text-text-disabled">
          <Search className="w-3.5 h-3.5" /> Search documents, course codes...
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand/10 border border-brand/25 text-brand-light text-[11px] font-semibold">
          <Upload className="w-3 h-3" /> Upload
        </div>
      </div>
      <div className="p-3 space-y-2">
        {[
          { type: "NOTES", code: "CSC 466", title: "Compiler Construction Notes", dl: 450, color: "#7C3AED" },
          { type: "PAST Q", code: "MTH 201", title: "General Math II 2018-2022", dl: 890, color: "#F59E0B" },
          { type: "RESEARCH", code: "CSC 499", title: "AI in Healthcare — Final Year", dl: 120, color: "#06B6D4" },
        ].map((doc) => (
          <div key={doc.code} className="bg-bg-surface-2 border border-white/[0.08] rounded-xl p-3 hover:border-brand/20 transition-colors" style={{ borderTopColor: doc.color, borderTopWidth: 2 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${doc.color}20`, color: doc.color, border: `1px solid ${doc.color}40` }}>{doc.type}</span>
              <span className="text-[10px] text-text-disabled">{doc.code}</span>
            </div>
            <p className="text-xs font-semibold text-text-primary mb-1">{doc.title}</p>
            <div className="flex items-center gap-2 text-[10px] text-text-disabled">
              <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" /> {doc.dl}</span>
              <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {Math.floor(doc.dl * 0.2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedPreview() {
  return (
    <div className="bg-bg-surface-1 rounded-[14px] overflow-hidden border border-white/10">
      <div className="flex gap-0 border-b border-white/[0.06]">
        {["For You", "Following", "CSC"].map((t, i) => (
          <button key={t} className={`flex-1 py-2.5 text-xs font-semibold border-b-2 ${i === 0 ? "text-brand-light border-brand" : "text-text-disabled border-transparent"}`}>{t}</button>
        ))}
      </div>
      <div className="p-3 space-y-2">
        {[
          { name: "Ada Nwosu", handle: "ada_nwosu", text: "Just finished Dr. Asogwa's compiler construction notes 🔥 Highly recommend for 400L CS students!", likes: 67, comments: 8 },
          { name: "John Doe", handle: "johndoe", text: "Uploaded MTH 201 Past Questions (2018-2022). Go grab them before the CA next week!", likes: 142, comments: 24 },
        ].map((post) => (
          <div key={post.handle} className="bg-bg-surface-2 border border-white/[0.08] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-[9px] font-bold text-brand-light">{post.name[0]}</div>
              <span className="text-[11px] font-semibold text-text-primary">{post.name}</span>
              <span className="text-[10px] text-text-disabled">@{post.handle}</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-2">{post.text}</p>
            <div className="flex items-center gap-3 text-[10px] text-text-disabled">
              <span>👍 {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>↗️ Share</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePreview() {
  return (
    <div className="bg-bg-surface-1 rounded-[14px] overflow-hidden border border-white/10">
      <div className="h-16 bg-[linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.2))]" />
      <div className="px-4 pb-4 -mt-6">
        <div className="w-14 h-14 rounded-full bg-bg-surface-3 border-[3px] border-bg-surface-1 flex items-center justify-center text-lg font-bold text-brand-light mb-2">J</div>
        <p className="text-sm font-bold text-text-primary">Joshua Ugwu</p>
        <p className="text-[11px] text-text-muted mb-3">@joshuazaza · Computer Science · 400L</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { n: "1,240", l: "Downloads" },
            { n: "89", l: "Uploads" },
            { n: "456", l: "Followers" },
          ].map((s) => (
            <div key={s.l} className="text-center bg-bg-surface-2 rounded-lg py-2">
              <span className="block text-sm font-bold text-text-primary">{s.n}</span>
              <span className="text-[10px] text-text-disabled">{s.l}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["🏆 Note Legend", "⭐ Top Contributor", "🔥 Popular"].map((b) => (
            <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/25">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const [active, setActive] = useState("library");
  const data = FEATURES[active];

  return (
    <section id="features" className="py-24 px-5 md:px-10">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[13px] font-bold text-brand tracking-[1.5px] uppercase mb-4">PLATFORM FEATURES</p>
          <h2 className="font-display text-[clamp(32px,4vw,52px)] text-text-primary leading-[1.15] mb-4">
            Everything you need to <span className="text-brand-light">excel</span>
          </h2>
          <p className="text-[17px] text-text-muted max-w-[520px] mx-auto">
            Built specifically for ESUT students. Not a generic tool — a platform designed around your campus life.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 w-fit mx-auto mb-14">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                active === tab.id
                  ? "bg-brand text-white shadow-[0_4px_16px_rgba(124,58,237,0.4)]"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Left — Points */}
            <div className="flex flex-col gap-7 order-2 lg:order-1">
              {data.points.map((p, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-brand/15 border border-brand/25 flex items-center justify-center text-brand-light shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary mb-1">{p.title}</p>
                    <p className="text-sm text-text-muted leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — Preview */}
            <div className="order-1 lg:order-2 bg-[rgba(15,15,26,0.8)] border border-white/10 rounded-[20px] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
              {data.preview}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
