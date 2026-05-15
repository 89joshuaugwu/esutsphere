"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { PenLine, Heart, MessageCircle, Eye, Clock } from "lucide-react";
import { POST_CATEGORIES } from "@/constants/departments";
import type { Post, PostCategory } from "@/types";

// ── Mock Data ─────────────────────────────────────────────────────
const MOCK_POSTS: (Post & { authorDept?: string })[] = [
  {
    id: "1", slug: "tech-fest-2025", title: "Everything You Missed at the ESUT Tech Fest 2025", coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60", excerpt: "From robotics displays to coding hackathons, this year's Tech Fest was nothing short of spectacular. Over 20 teams competed in the 24-hour hackathon.", content: "", readingTimeMinutes: 5, category: "campus_news", tags: ["tech", "events"], authorId: "u1", authorName: "Jane Smith", authorUsername: "janesmith", authorAvatar: "", authorDept: "Computer Science", likesCount: 89, commentsCount: 24, viewCount: 432, bookmarksCount: 15, isPublished: true, isFeatured: true, createdAt: null as any, updatedAt: null as any, publishedAt: null as any,
  },
  {
    id: "2", slug: "exam-prep-guide", title: "The Ultimate Guide to Surviving First Semester Exams", coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60", excerpt: "Late night studying? Here are proven techniques to retain information faster and ace your exams without burning out.", content: "", readingTimeMinutes: 8, category: "academic", tags: ["study", "exams"], authorId: "u2", authorName: "John Doe", authorUsername: "johndoe", authorAvatar: "", authorDept: "Industrial Physics", likesCount: 156, commentsCount: 42, viewCount: 1240, bookmarksCount: 67, isPublished: true, isFeatured: false, createdAt: null as any, updatedAt: null as any, publishedAt: null as any,
  },
  {
    id: "3", slug: "ai-revolution-esut", title: "How AI is Changing Everything for Nigerian CS Students", coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60", excerpt: "From ChatGPT to Gemini — how ESUT students are leveraging AI tools for learning, research, and building projects.", content: "", readingTimeMinutes: 6, category: "tech", tags: ["ai", "cs"], authorId: "u3", authorName: "Joshua Ugwu", authorUsername: "joshuazaza", authorAvatar: "", authorDept: "Computer Science", likesCount: 203, commentsCount: 56, viewCount: 2100, bookmarksCount: 89, isPublished: true, isFeatured: false, createdAt: null as any, updatedAt: null as any, publishedAt: null as any,
  },
  {
    id: "4", slug: "internship-guide-2025", title: "Landing Your First Tech Internship as an ESUT Student", coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60", excerpt: "A practical roadmap to getting noticed by Nigerian tech companies and international remote opportunities.", content: "", readingTimeMinutes: 10, category: "career", tags: ["career", "internship"], authorId: "u4", authorName: "Temi Adewale", authorUsername: "temilade", authorAvatar: "", authorDept: "Business Administration", likesCount: 178, commentsCount: 35, viewCount: 1890, bookmarksCount: 92, isPublished: true, isFeatured: false, createdAt: null as any, updatedAt: null as any, publishedAt: null as any,
  },
  {
    id: "5", slug: "campus-food-guide", title: "The Unofficial ESUT Campus Food Survival Guide", coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60", excerpt: "Where to eat, what to avoid, and the hidden gems around campus that every student should know about.", content: "", readingTimeMinutes: 4, category: "lifestyle", tags: ["food", "campus"], authorId: "u5", authorName: "Chika Nwankwo", authorUsername: "chikankwo", authorAvatar: "", authorDept: "Industrial Chemistry", likesCount: 95, commentsCount: 19, viewCount: 680, bookmarksCount: 28, isPublished: true, isFeatured: false, createdAt: null as any, updatedAt: null as any, publishedAt: null as any,
  },
  {
    id: "6", slug: "student-politics", title: "Why Student Union Politics Matter More Than You Think", coverImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=60", excerpt: "A deep dive into how student government decisions directly affect your academic experience at ESUT.", content: "", readingTimeMinutes: 7, category: "opinions", tags: ["politics", "student"], authorId: "u6", authorName: "Emeka Obi", authorUsername: "emekaobi", authorAvatar: "", authorDept: "Political Science", likesCount: 67, commentsCount: 31, viewCount: 540, bookmarksCount: 12, isPublished: true, isFeatured: false, createdAt: null as any, updatedAt: null as any, publishedAt: null as any,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  campus_news: "bg-cyan/[0.12] text-cyan border-cyan/25",
  academic: "bg-brand/[0.12] text-brand-light border-brand/25",
  tech: "bg-success/[0.12] text-success border-success/25",
  career: "bg-gold/[0.12] text-gold border-gold/25",
  opinions: "bg-[rgba(249,115,22,0.12)] text-[#F97316] border-[rgba(249,115,22,0.25)]",
  lifestyle: "bg-[rgba(236,72,153,0.12)] text-[#EC4899] border-[rgba(236,72,153,0.25)]",
};

const ALL_CATEGORIES = [{ value: "all", label: "All", emoji: "📋" }, ...POST_CATEGORIES];

export default function BlogListingPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const featuredPost = MOCK_POSTS.find(p => p.isFeatured);
  const filteredPosts = useMemo(() => {
    const posts = MOCK_POSTS.filter(p => !p.isFeatured);
    if (activeCategory === "all") return posts;
    return posts.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-0 -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      {/* ── Blog Header ──────────────────────────────────── */}
      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(28px,3vw,40px)] text-text-primary leading-[1.1] mb-2">
              Campus Blog
            </h1>
            <p className="text-sm text-text-muted max-w-lg">
              Stay updated with the latest news, student stories, and academic guides across ESUT.
            </p>
          </div>
          <Link
            href="/blog/write"
            className="flex items-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.5)] transition-all duration-200 whitespace-nowrap"
          >
            <PenLine className="w-4 h-4" /> Write Post
          </Link>
        </div>
      </div>

      {/* ── Featured Post Hero ──────────────────────────── */}
      {featuredPost && (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group block mx-6 md:mx-8 mt-6 rounded-[20px] overflow-hidden relative min-h-[320px] md:min-h-[380px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        >
          <img
            src={featuredPost.coverImage}
            alt={featuredPost.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,16,0.97)_0%,rgba(8,8,16,0.7)_40%,rgba(8,8,16,0.1)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[11px] font-bold uppercase tracking-[0.5px] px-2.5 py-1 rounded-full">
                Featured
              </span>
              <span className="text-[13px] font-semibold text-text-secondary">
                {POST_CATEGORIES.find(c => c.value === featuredPost.category)?.label}
              </span>
              <span className="text-text-disabled">·</span>
              <span className="text-xs text-text-muted">{featuredPost.readingTimeMinutes} min read</span>
            </div>
            <h2 className="font-display text-[clamp(22px,2.8vw,34px)] text-text-primary leading-[1.2] mb-3">
              {featuredPost.title}
            </h2>
            <p className="text-[15px] text-text-secondary leading-6 max-w-[600px] mb-5 line-clamp-2">
              {featuredPost.excerpt}
            </p>
            <div className="flex items-center gap-2.5">
              <img
                src={featuredPost.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${featuredPost.authorUsername}`}
                alt={featuredPost.authorName}
                className="w-[34px] h-[34px] rounded-full border-2 border-white/15 object-cover"
              />
              <div>
                <p className="text-[13px] font-semibold text-text-primary">{featuredPost.authorName}</p>
                <p className="text-xs text-text-muted">Oct 12, 2025</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ── Category Filter Tabs ──────────────────────────── */}
      <div className="px-6 md:px-8 pt-6 pb-5 flex gap-1.5 items-center flex-wrap">
        {ALL_CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border flex items-center gap-1.5 transition-all duration-200 ${
              activeCategory === c.value
                ? "bg-brand/[0.14] border-brand/40 text-brand-light"
                : "bg-transparent border-white/[0.08] text-text-muted hover:bg-white/[0.06] hover:text-text-secondary"
            }`}
          >
            <span className="text-sm">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Post Grid ──────────────────────────────────────── */}
      <div className="px-6 md:px-8 pb-12">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPosts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-[220ms] hover:border-white/[0.14] hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col"
                style={{ animation: `card-enter 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
              >
                {/* Cover */}
                <div className="h-[180px] overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="h-full bg-[linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))] flex items-center justify-center text-5xl opacity-60">
                      📝
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-[18px] flex-1 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-[0.4px] px-2 py-[3px] rounded-full border ${CATEGORY_COLORS[post.category] || "bg-white/10 text-text-muted border-white/10"}`}>
                      {POST_CATEGORIES.find(c => c.value === post.category)?.label}
                    </span>
                    <span className="text-xs text-text-disabled flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readingTimeMinutes} min
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-text-primary leading-[1.3] line-clamp-2 group-hover:text-brand-light transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[13px] text-text-muted leading-5 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
                    <div className="flex items-center gap-[7px]">
                      <img
                        src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUsername}`}
                        alt={post.authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-text-muted">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-disabled">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4 opacity-40">📝</span>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No posts yet</h3>
            <p className="text-sm text-text-muted mb-6">Be the first to share your story with the ESUT community.</p>
            <Link href="/blog/write" className="flex items-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] transition-all">
              <PenLine className="w-4 h-4" /> Write First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
