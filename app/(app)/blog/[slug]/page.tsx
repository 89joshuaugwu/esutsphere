"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { POST_CATEGORIES } from "@/constants/departments";

const CATEGORY_COLORS: Record<string, string> = {
  campus_news: "bg-cyan/[0.12] text-cyan border-cyan/25",
  academic: "bg-brand/[0.12] text-brand-light border-brand/25",
  tech: "bg-success/[0.12] text-success border-success/25",
  career: "bg-gold/[0.12] text-gold border-gold/25",
  opinions: "bg-[rgba(249,115,22,0.12)] text-[#F97316] border-[rgba(249,115,22,0.25)]",
  lifestyle: "bg-[rgba(236,72,153,0.12)] text-[#EC4899] border-[rgba(236,72,153,0.25)]",
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // Mock post data
  const post = {
    title: "Everything You Missed at the ESUT Tech Fest 2025",
    category: "campus_news" as const,
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    readingTimeMinutes: 5,
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    authorAvatar: "",
    authorDept: "Computer Science · 400L",
    publishedDate: "Oct 12, 2025",
    viewCount: 432,
    likesCount: 89,
    commentsCount: 24,
    bookmarksCount: 15,
  };

  const catLabel = POST_CATEGORIES.find(c => c.value === post.category)?.label || post.category;
  const catColor = CATEGORY_COLORS[post.category] || "bg-white/10 text-text-muted border-white/10";

  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      {/* ── Hero Section ──────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-5 md:px-10 pt-8 pb-0">
        {/* Back link */}
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-[13px] font-medium text-text-muted hover:text-text-primary transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-[3px] transition-transform" /> Back to Blog
        </Link>

        {/* Category + read time */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className={`text-[11px] font-bold uppercase tracking-[0.4px] px-2.5 py-1 rounded-full border ${catColor}`}>
            {catLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Clock className="w-3 h-3" /> {post.readingTimeMinutes} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-[clamp(28px,4vw,48px)] text-text-primary leading-[1.15] tracking-[-0.5px] mb-5">
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center gap-3 py-4 border-t border-b border-white/[0.06] mb-7">
          <img
            src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUsername}`}
            alt={post.authorName}
            className="w-11 h-11 rounded-full border-2 border-white/10 object-cover"
          />
          <div className="flex-1">
            <Link href={`/profile/${post.authorUsername}`} className="text-[15px] font-semibold text-text-primary hover:text-brand-light transition-colors">
              {post.authorName}
            </Link>
            <p className="text-xs text-text-muted">{post.authorDept}</p>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5 text-[13px] text-text-muted"><Eye className="w-3.5 h-3.5" /> {post.viewCount}</span>
            <span className="flex items-center gap-1.5 text-[13px] text-text-muted"><Heart className="w-3.5 h-3.5" /> {post.likesCount}</span>
            <span className="flex items-center gap-1.5 text-[13px] text-text-muted"><MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount}</span>
          </div>
        </div>

        {/* Cover image */}
        <div className="rounded-2xl overflow-hidden mb-10 w-full max-h-[460px]">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover block" />
        </div>
      </div>

      {/* ── Article Body + Sidebar ─────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-5 md:px-10 flex gap-10 lg:gap-16">
        {/* Article Body */}
        <article className="blog-article-body flex-1 min-w-0 pb-12">
          <p>
            The atmosphere was electric as students from across various faculties gathered at the main auditorium.
            This year&apos;s Tech Fest was not just about coding; it was a celebration of innovation and student-led
            solutions to real-world problems facing the Nigerian tech ecosystem.
          </p>

          <h2>The Hackathon Highlights</h2>
          <p>
            Over 20 teams participated in the 24-hour hackathon. The winning project, an <strong>AI-driven
            agricultural mapping tool</strong>, was developed by a group of 300L Computer Science students. It highlighted
            the sheer talent hidden within our campus.
          </p>

          <blockquote>
            &quot;We wanted to build something that actually solves a local problem. Tech isn&apos;t just about flashy apps;
            it&apos;s about impact.&quot; — Lead Developer, Winning Team
          </blockquote>

          <h2>Industry Panel Sessions</h2>
          <p>
            Beyond the hackathon, we had engaging panel sessions with industry leaders who shared insights on
            navigating the tech landscape post-graduation. Speakers from <strong>Flutterwave</strong>, <strong>Paystack</strong>,
            and <strong>Andela</strong> discussed the future of fintech, developer career paths, and the growing demand
            for Nigerian tech talent globally.
          </p>

          <h3>Key Takeaways from the Panels</h3>
          <ul>
            <li>Start building projects early — your portfolio matters more than your CGPA for tech roles</li>
            <li>Open source contributions can land you international opportunities</li>
            <li>Remote work is not just a trend — it&apos;s the future of Nigerian tech employment</li>
            <li>Soft skills matter: communication, teamwork, and problem-solving are non-negotiable</li>
          </ul>

          <h2>The Robotics Exhibition</h2>
          <p>
            The Electrical Engineering department stunned everyone with their autonomous drone prototype. While still
            in development, the team demonstrated basic obstacle avoidance and GPS-guided navigation — all built with
            components sourced locally from Computer Village, Lagos.
          </p>

          <p>
            For those who missed it, mark your calendars for next year. The organizing committee has already announced
            that Tech Fest 2026 will be even bigger, with plans for inter-university hackathons and a startup pitch
            competition with real investment prizes.
          </p>

          <hr />

          <p>
            <em>Were you at the Tech Fest? Share your experience in the comments below. Let&apos;s keep the conversation going!</em>
          </p>
        </article>

        {/* Sidebar — Desktop only */}
        <aside className="hidden lg:flex flex-col gap-4 w-[260px] shrink-0 sticky top-[80px] max-h-[calc(100vh-96px)] overflow-y-auto">
          {/* Author Card */}
          <div className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[14px] p-[18px] text-center">
            <img
              src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUsername}`}
              alt={post.authorName}
              className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-brand/40"
            />
            <p className="text-[15px] font-bold text-text-primary mb-1">{post.authorName}</p>
            <p className="text-xs text-text-muted mb-3">{post.authorDept}</p>
            <div className="flex justify-center gap-5 pt-3 border-t border-white/[0.06] mb-3.5">
              <div className="text-center">
                <span className="font-display text-base text-text-primary block">12</span>
                <span className="text-[10px] text-text-disabled">Posts</span>
              </div>
              <div className="text-center">
                <span className="font-display text-base text-text-primary block">245</span>
                <span className="text-[10px] text-text-disabled">Followers</span>
              </div>
            </div>
            <Link
              href={`/profile/${post.authorUsername}`}
              className="block w-full text-center text-xs font-semibold text-brand-light border border-brand/40 rounded-lg py-2 hover:bg-brand/[0.12] transition-colors"
            >
              View Profile
            </Link>
          </div>

          {/* Share */}
          <div className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[14px] p-[18px]">
            <h4 className="text-[11px] font-bold text-text-disabled uppercase tracking-[0.8px] mb-3">Share</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-text-muted flex items-center justify-center gap-1.5 hover:bg-[rgba(37,211,102,0.12)] hover:text-[#25D366] hover:border-[rgba(37,211,102,0.25)] transition-all">
                WhatsApp
              </button>
              <button className="h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-text-muted flex items-center justify-center gap-1.5 hover:bg-[rgba(29,155,240,0.12)] hover:text-[#1D9BF0] hover:border-[rgba(29,155,240,0.25)] transition-all">
                Twitter/X
              </button>
              <button className="col-span-2 h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-text-muted flex items-center justify-center gap-1.5 hover:bg-brand/[0.12] hover:text-brand-light hover:border-brand/25 transition-all">
                <Share2 className="w-3 h-3" /> Copy Link
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Reaction Bar ──────────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-5 md:px-10 pb-6">
        <div className="bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[14px] p-3.5 flex items-center gap-1.5 flex-wrap">
          {[
            { emoji: "👍", label: "Like", count: 89 },
            { emoji: "❤️", label: "Love", count: 34 },
            { emoji: "🔥", label: "Fire", count: 22 },
            { emoji: "💡", label: "Insightful", count: 15 },
            { emoji: "😂", label: "Funny", count: 8 },
          ].map(r => (
            <button
              key={r.label}
              className="flex items-center gap-[7px] px-3.5 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-text-muted text-[13px] font-medium hover:bg-white/[0.08] hover:border-white/[0.14] hover:scale-105 active:scale-95 transition-all select-none"
            >
              <span className="text-[17px]">{r.emoji}</span>
              <span className="font-semibold min-w-[18px]">{r.count}</span>
            </button>
          ))}
          <div className="w-px h-6 bg-white/[0.08] mx-0.5" />
          <div className="ml-auto flex gap-2">
            <button className="w-[38px] h-[38px] rounded-[9px] bg-white/[0.04] border border-white/[0.08] text-text-muted flex items-center justify-center hover:bg-white/[0.08] hover:text-text-primary transition-all">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="w-[38px] h-[38px] rounded-[9px] bg-white/[0.04] border border-white/[0.08] text-text-muted flex items-center justify-center hover:bg-white/[0.08] hover:text-text-primary transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Comment Section ──────────────────────────────── */}
      <div className="max-w-[800px] mx-auto px-5 md:px-10 pb-16">
        <div className="bg-[rgba(22,22,42,0.5)] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Comments
              <span className="text-xs font-semibold text-text-muted bg-white/[0.06] rounded-full px-2 py-[2px]">{post.commentsCount}</span>
            </h3>
          </div>

          {/* New comment */}
          <div className="flex gap-3 items-start mb-6">
            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center text-xs font-bold text-brand-light shrink-0">Y</div>
            <div className="flex-1 flex gap-2">
              <textarea
                placeholder="Add a comment..."
                className="flex-1 min-h-[48px] max-h-[120px] bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] focus:min-h-[72px] transition-all resize-none placeholder:text-text-disabled leading-[22px]"
              />
              <button className="h-10 px-4 rounded-[9px] bg-brand text-white text-[13px] font-semibold shrink-0 hover:bg-brand-light transition-colors self-end">
                Post
              </button>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-0">
            {[
              { name: "Emeka Obi", handle: "@emekaobi", text: "This was such an incredible event! The robotics demo was mind-blowing.", time: "2h ago", likes: 12 },
              { name: "Chika Nwankwo", handle: "@chikankwo", text: "I was part of the hackathon team that built the agriculture tool. Thank you for the coverage! 🙏", time: "5h ago", likes: 28 },
              { name: "Temi Adewale", handle: "@temilade", text: "The panel discussion with the Flutterwave engineer was my favorite part. So insightful.", time: "1d ago", likes: 8 },
            ].map((c, i) => (
              <div key={i} className="flex gap-3 py-4 border-b border-white/[0.04] last:border-b-0" style={{ animation: `card-enter 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both` }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.handle}`}
                  alt={c.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[13px] font-bold text-text-primary">{c.name}</span>
                    <span className="text-xs text-text-disabled">{c.handle}</span>
                    <span className="text-[11px] text-text-disabled ml-auto">{c.time}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-[22px]">{c.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="text-xs font-medium text-text-disabled flex items-center gap-1 hover:text-text-muted transition-colors">
                      <Heart className="w-3 h-3" /> {c.likes}
                    </button>
                    <button className="text-xs font-medium text-text-disabled hover:text-text-muted transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
