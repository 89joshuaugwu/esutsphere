"use client";
import { useState } from "react";
import FeedPost from "@/components/feed/FeedPost";
import { PenSquare, Sparkles, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Timestamp } from "firebase/firestore";
import type { FeedPostData } from "@/types";

const now = Timestamp.now();

const MOCK_POSTS: FeedPostData[] = [
  {
    id: "p1",
    authorId: "u1",
    authorName: "John Doe",
    authorUsername: "johndoe",
    authorAvatar: "",
    title: "How to survive CSC 201 Project Defense",
    content: "",
    excerpt:
      "I just finished my CSC 201 defense and here are some quick tips. The lecturers usually look out for how well you can explain your code, not just if it runs. Make sure you understand every single function you wrote.",
    tags: ["CSC201", "defense", "tips"],
    category: "academic",
    likesCount: 142,
    commentsCount: 24,
    viewCount: 890,
    bookmarksCount: 32,
    createdAt: now,
    publishedAt: now,
  },
  {
    id: "p2",
    authorId: "u2",
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    authorAvatar: "",
    title: "Just uploaded MTH 201 Past Questions",
    content: "",
    excerpt:
      "Hey guys, I've compiled the past questions for General Mathematics II from 2018 to 2022. It's now available in the library section. Go check it out before the CA next week!",
    tags: ["MTH201", "pastquestions"],
    category: "academic",
    likesCount: 89,
    commentsCount: 12,
    viewCount: 450,
    bookmarksCount: 18,
    attachedDocId: "doc1",
    attachedDocTitle: "MTH201 Past Questions 2018-2022",
    attachedDocType: "past_questions",
    attachedDocCourseCode: "MTH 201",
    createdAt: now,
    publishedAt: now,
  },
  {
    id: "p3",
    authorId: "u3",
    authorName: "Ada Nwosu",
    authorUsername: "ada_nwosu",
    authorAvatar: "",
    title: "",
    content: "",
    excerpt:
      "Just finished reading through Dr. Asogwa's compiler construction notes and wow, this man really simplified everything. If you're in 400L CS, go download them from the library ASAP 🔥",
    tags: ["CSC466", "compilers"],
    category: "campus_news",
    likesCount: 67,
    commentsCount: 8,
    viewCount: 210,
    bookmarksCount: 5,
    createdAt: now,
    publishedAt: now,
  },
];

type FeedTab = "for-you" | "following" | "department";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPosts([
        ...posts,
        ...MOCK_POSTS.map((p) => ({ ...p, id: p.id + Math.random() })),
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const tabs: { id: FeedTab; label: string; icon: React.ElementType }[] = [
    { id: "for-you", label: "For You", icon: Sparkles },
    { id: "following", label: "Following", icon: Users },
    { id: "department", label: "My Department", icon: Building2 },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Feed Header */}
      <div className="flex items-center justify-between pt-6 pb-0">
        <h1 className="font-display text-[28px] text-text-primary leading-none">
          Campus Feed
        </h1>
        <Link
          href="/blog/write"
          className="flex items-center gap-[7px] bg-brand/12 border border-brand/30 text-brand-light text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-brand/20 transition-all"
        >
          <PenSquare className="w-3.5 h-3.5" /> Write Post
        </Link>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0 mt-4 border-b border-white/[0.07]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-[7px] px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
              activeTab === tab.id
                ? "text-brand-light border-brand"
                : "text-text-disabled border-transparent hover:text-text-muted"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === "department" && (
              <span className="text-[10px] font-bold px-[7px] py-0.5 rounded-full bg-cyan/12 text-cyan border border-cyan/20">
                CSC
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quick Composer */}
      <Link
        href="/blog/write"
        className="flex gap-3 items-center bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[14px] p-[14px_16px] my-4 hover:border-brand/30 transition-[border-color] cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-bg-surface-3 border border-white/10 flex-shrink-0" />
        <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-[18px] py-[9px] text-sm text-text-disabled pointer-events-none">
          What&apos;s on your mind?
        </div>
      </Link>

      {/* Posts */}
      <div className="space-y-0">
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
