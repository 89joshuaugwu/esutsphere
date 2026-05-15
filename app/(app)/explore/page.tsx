"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, Trophy, FileText, Hash, Download, Eye, Heart, ArrowUp } from "lucide-react";

const TRENDING_DOCS = [
  { id: "d1", title: "CSC 201 Past Questions 2024", type: "Past Questions", dept: "Computer Science", downloads: 1240, views: 3800, likes: 342, trending: "+18%", rank: 1 },
  { id: "d2", title: "MTH 101 Lecture Notes", type: "Notes", dept: "Mathematics", downloads: 890, views: 2600, likes: 210, trending: "+12%", rank: 2 },
  { id: "d3", title: "PHY 201 Lab Manual", type: "Handout", dept: "Physics", downloads: 650, views: 1900, likes: 178, trending: "+9%", rank: 3 },
  { id: "d4", title: "ENG 111 Communication Skills", type: "Notes", dept: "English", downloads: 580, views: 1700, likes: 145, trending: "+7%", rank: 4 },
  { id: "d5", title: "CSC 341 Compiler Design", type: "Notes", dept: "Computer Science", downloads: 520, views: 1500, likes: 134, trending: "+5%", rank: 5 },
  { id: "d6", title: "CHM 201 Organic Chemistry", type: "Past Questions", dept: "Chemistry", downloads: 480, views: 1400, likes: 120, trending: "+4%", rank: 6 },
];

const TOP_CONTRIBUTORS = [
  { rank: 1, name: "Dr. Okafor", username: "dr_okafor", dept: "Computer Science", points: 12400, uploads: 45, medal: "🥇" },
  { rank: 2, name: "Ada Nwosu", username: "ada_nwosu", dept: "Computer Science", points: 9800, uploads: 38, medal: "🥈" },
  { rank: 3, name: "Chukwuemeka", username: "emeka_tech", dept: "Electrical Eng.", points: 8200, uploads: 32, medal: "🥉" },
  { rank: 4, name: "Jane Smith", username: "janesmith", dept: "Civil Engineering", points: 7100, uploads: 28 },
  { rank: 5, name: "John Doe", username: "johndoe", dept: "Mathematics", points: 6500, uploads: 24 },
  { rank: 6, name: "Chioma Eze", username: "chioma_eze", dept: "Electrical Eng.", points: 5900, uploads: 21 },
  { rank: 7, name: "Tunde Lagos", username: "tunde_l", dept: "Civil Engineering", points: 5200, uploads: 18 },
  { rank: 8, name: "Mary Johnson", username: "mary_j", dept: "Chemistry", points: 4800, uploads: 15 },
];

const TRENDING_TAGS = [
  { icon: "📝", name: "#PastQuestions", count: 2400, color: "#F59E0B" },
  { icon: "💻", name: "#CSC201", count: 1800, color: "#7C3AED" },
  { icon: "📊", name: "#ExamPrep", count: 1200, color: "#06B6D4" },
  { icon: "🔬", name: "#LabReports", count: 890, color: "#10B981" },
  { icon: "📚", name: "#StudyGroup", count: 720, color: "#EC4899" },
  { icon: "🎓", name: "#ProjectTopics", count: 650, color: "#F97316" },
  { icon: "⚡", name: "#ESUT2025", count: 580, color: "#A855F7" },
  { icon: "🏗️", name: "#CivilEng", count: 440, color: "#94A3B8" },
];

type ExploreTab = "trending" | "contributors" | "popular" | "tags";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { id: ExploreTab; label: string; icon: React.ElementType }[] = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "contributors", label: "Top Contributors", icon: Trophy },
    { id: "popular", label: "Popular Posts", icon: FileText },
    { id: "tags", label: "Tags", icon: Hash },
  ];

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-[linear-gradient(135deg,#F59E0B,#FCD34D)] text-[#0F0F1A]";
    if (rank === 2) return "bg-[linear-gradient(135deg,#94A3B8,#CBD5E1)] text-[#0F0F1A]";
    if (rank === 3) return "bg-[linear-gradient(135deg,#F97316,#FDBA74)] text-[#0F0F1A]";
    return "bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white";
  };

  return (
    <div className="max-w-[900px] mx-auto pb-10">
      {/* Header */}
      <div className="pt-7 pb-6 flex flex-col gap-[18px]">
        <h1 className="font-display text-[32px] text-text-primary">Explore ESUTSphere</h1>
        <div className="relative max-w-[560px]">
          <Search className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search documents, users, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-[46px] bg-white/[0.05] border border-white/[0.08] rounded-[10px] pl-10 pr-4 text-text-primary text-sm outline-hidden focus:border-brand/50 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all placeholder:text-text-disabled"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap pb-5 border-b border-white/[0.07]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-[7px] px-[18px] py-2 rounded-full text-[13px] font-semibold border transition-all duration-[180ms] ${
              activeTab === tab.id
                ? "bg-brand/[0.14] border-brand/40 text-brand-light"
                : "bg-transparent border-white/[0.08] text-text-muted hover:bg-white/[0.05] hover:text-text-secondary"
            }`}
          >
            <tab.icon className="w-[15px] h-[15px]" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Trending Documents Tab ──────────────────────── */}
      {activeTab === "trending" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6" style={{ animation: "card-enter 0.4s both" }}>
          {TRENDING_DOCS.map(doc => (
            <Link
              key={doc.id}
              href={`/library/${doc.id}`}
              className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden hover:border-brand/25 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all group"
            >
              {/* Rank badge */}
              <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shadow-[0_2px_8px_rgba(124,58,237,0.4)] ${getRankBadgeClass(doc.rank)}`}>
                {doc.rank}
              </div>

              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-brand-light">{doc.type}</span>
              <h3 className="text-[15px] font-bold text-text-primary mt-2 mb-1.5 leading-snug group-hover:text-brand-light transition-colors pr-8">{doc.title}</h3>
              <p className="text-xs text-text-disabled mb-3">{doc.dept}</p>

              {/* Stats */}
              <div className="flex gap-3 pt-2.5 border-t border-white/[0.05]">
                <span className="flex items-center gap-1.5 text-xs text-text-muted"><Download className="w-3 h-3" /> {doc.downloads.toLocaleString()}</span>
                <span className="flex items-center gap-1.5 text-xs text-text-muted"><Eye className="w-3 h-3" /> {doc.views.toLocaleString()}</span>
                <span className="flex items-center gap-1.5 text-xs text-success font-semibold text-[11px] ml-auto"><ArrowUp className="w-3 h-3" /> {doc.trending}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Top Contributors Tab ───────────────────────── */}
      {activeTab === "contributors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6" style={{ animation: "card-enter 0.4s both" }}>
          {/* Leaderboard */}
          <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[15px] font-bold text-text-primary flex items-center gap-2">🏆 Leaderboard</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">This Month</span>
            </div>
            {TOP_CONTRIBUTORS.map(u => (
              <Link
                key={u.username}
                href={`/profile/${u.username}`}
                className={`flex items-center gap-3.5 px-5 py-3.5 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-[background] ${
                  u.rank <= 3 ? `bg-${u.rank === 1 ? "gold" : u.rank === 2 ? "white" : "orange"}/[0.04]` : ""
                }`}
              >
                <span className={`text-sm font-extrabold w-6 text-center ${
                  u.rank === 1 ? "text-gold" : u.rank === 2 ? "text-text-muted" : u.rank === 3 ? "text-orange-400" : "text-text-disabled"
                }`}>{u.rank}</span>
                {u.medal && <span className="text-lg shrink-0">{u.medal}</span>}
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{u.name}</p>
                  <p className="text-[11px] text-text-disabled truncate">{u.dept}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display text-xl bg-[linear-gradient(135deg,#A855F7,#06B6D4)] bg-clip-text text-transparent block leading-none">{u.points.toLocaleString()}</span>
                  <span className="text-[10px] text-text-disabled">points</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats overview */}
          <div className="flex flex-col gap-4">
            <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-text-primary mb-4">How Points Work</h3>
              {[
                { action: "Upload a document", pts: "+10 pts", emoji: "📤" },
                { action: "Write a blog post", pts: "+5 pts", emoji: "✍️" },
                { action: "Someone downloads your doc", pts: "+3 pts", emoji: "⬇️" },
                { action: "Get a reaction", pts: "+1 pt", emoji: "❤️" },
                { action: "Reach 100 downloads", pts: "+50 pts", emoji: "🎉" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-b-0">
                  <span className="text-[13px] text-text-secondary flex items-center gap-2"><span className="text-base">{item.emoji}</span> {item.action}</span>
                  <span className="text-[13px] font-bold text-brand-light">{item.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Popular Posts Tab ───────────────────────────── */}
      {activeTab === "popular" && (
        <div className="pt-6 max-w-[680px] space-y-3" style={{ animation: "card-enter 0.4s both" }}>
          {[
            { title: "How to survive CSC 201 Project Defense", author: "John Doe", views: 890, likes: 142, time: "2h ago" },
            { title: "Best study spots on campus ranked", author: "Chukwuemeka", views: 1200, likes: 234, time: "5h ago" },
            { title: "ESUT exam timetable update for 2025", author: "Ada Nwosu", views: 2100, likes: 310, time: "12h ago" },
            { title: "My experience with SIWES placement", author: "Chioma Eze", views: 780, likes: 98, time: "1d ago" },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-4 bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-2xl p-4 hover:border-white/[0.11] transition-[border-color] cursor-pointer">
              <span className={`text-lg font-extrabold w-8 text-center ${
                i === 0 ? "text-gold" : i === 1 ? "text-text-muted" : i === 2 ? "text-orange-400" : "text-text-disabled"
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-text-primary mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-text-disabled">by {p.author} · {p.time}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tags Tab ───────────────────────────────────── */}
      {activeTab === "tags" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-6" style={{ animation: "card-enter 0.4s both" }}>
          {TRENDING_TAGS.map(tag => (
            <div
              key={tag.name}
              className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] p-4 cursor-pointer hover:border-brand/30 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: tag.color }} />
              <span className="text-[28px] block mb-2.5">{tag.icon}</span>
              <p className="text-[15px] font-bold text-text-primary mb-1">{tag.name}</p>
              <p className="text-xs text-text-muted">{tag.count.toLocaleString()} posts</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
