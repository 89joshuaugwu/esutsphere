"use client";
import { useState, useEffect } from "react";
import FeedPost from "@/components/feed/FeedPost";
import FeedComposer from "@/components/feed/FeedComposer";
import { PenSquare, Sparkles, Users, Building2, TrendingUp, UserPlus, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Timestamp } from "firebase/firestore";
import type { FeedPostData } from "@/types";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

const now = Timestamp.now();

const MOCK_POSTS: FeedPostData[] = [
  {
    id: "p1", authorId: "u1", authorName: "John Doe", authorUsername: "johndoe", authorAvatar: "",
    title: "How to survive CSC 201 Project Defense",
    content: "", excerpt: "I just finished my CSC 201 defense and here are some quick tips. The lecturers usually look out for how well you can explain your code, not just if it runs. Make sure you understand every single function you wrote.",
    tags: ["CSC201", "defense", "tips"], category: "academic",
    likesCount: 142, commentsCount: 24, viewCount: 890, bookmarksCount: 32, createdAt: now, publishedAt: now,
  },
  {
    id: "p2", authorId: "u2", authorName: "Jane Smith", authorUsername: "janesmith", authorAvatar: "",
    title: "Just uploaded MTH 201 Past Questions",
    content: "", excerpt: "Hey guys, I've compiled the past questions for General Mathematics II from 2018 to 2022. It's now available in the library section. Go check it out before the CA next week!",
    tags: ["MTH201", "pastquestions"], category: "academic",
    likesCount: 89, commentsCount: 12, viewCount: 450, bookmarksCount: 18,
    attachedDocId: "doc1", attachedDocTitle: "MTH201 Past Questions 2018-2022", attachedDocType: "past_questions", attachedDocCourseCode: "MTH 201",
    createdAt: now, publishedAt: now,
  },
  {
    id: "p3", authorId: "u3", authorName: "Ada Nwosu", authorUsername: "ada_nwosu", authorAvatar: "",
    title: "", content: "",
    excerpt: "Just finished reading through Dr. Asogwa's compiler construction notes and wow, this man really simplified everything. If you're in 400L CS, go download them from the library ASAP 🔥",
    tags: ["CSC466", "compilers"], category: "campus_news",
    likesCount: 67, commentsCount: 8, viewCount: 210, bookmarksCount: 5, createdAt: now, publishedAt: now,
  },
  {
    id: "p4", authorId: "u4", authorName: "Chukwuemeka", authorUsername: "emeka_tech", authorAvatar: "",
    title: "Best study spots on campus ranked",
    content: "", excerpt: "Okay, I've tried every corner of ESUT and here's my honest ranking of the best places to read. Number 1 is the new Computer Science building - aircon, good lighting, and barely anyone knows about the 3rd floor reading room.",
    tags: ["StudySpots", "ESUTLife"], category: "lifestyle",
    likesCount: 234, commentsCount: 41, viewCount: 1200, bookmarksCount: 78, createdAt: now, publishedAt: now,
  },
];

type FeedTab = "for-you" | "following" | "department";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [posts, setPosts] = useState<FeedPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    import("firebase/firestore").then(({ collection, query, orderBy, limit, onSnapshot }) => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
      const unsubscribe = onSnapshot(q, (snap) => {
        const livePosts = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FeedPostData[];
        setPosts(livePosts);
        setIsLoading(false);
      });
      return () => unsubscribe();
    });
  }, []);

  const handleCreatePost = async (postData: { title?: string; content: string; category: string; tags: string[]; imageUrl?: string }) => {
    if (!user) return;
    try {
      const { collection, addDoc, Timestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: user.displayName,
        authorUsername: user.username,
        authorAvatar: user.profilePicture,
        title: postData.title || "",
        content: postData.content,
        excerpt: postData.content.substring(0, 150) + (postData.content.length > 150 ? "..." : ""),
        coverImage: postData.imageUrl || "",
        tags: postData.tags,
        category: postData.category,
        likesCount: 0,
        commentsCount: 0,
        viewCount: 0,
        bookmarksCount: 0,
        createdAt: Timestamp.now(),
        publishedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error("Error creating post:", err);
      toast.error("Failed to post: " + err.message);
      throw err;
    }
  };

  const loadMore = () => {
    // Implement pagination with Firestore later
  };

  const tabs: { id: FeedTab; label: string; icon: React.ElementType }[] = [
    { id: "for-you", label: "For You", icon: Sparkles },
    { id: "following", label: "Following", icon: Users },
    { id: "department", label: "My Department", icon: Building2 },
  ];

  const avatarUrl = user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "anon"}`;

  return (
    <>
      <div className="flex gap-0 max-w-[1080px] mx-auto overflow-x-hidden">
        {/* ── Feed Column ───────────────────────────────────── */}
        <div className="flex-1 min-w-0 max-w-[680px] pb-20 md:pb-10">
          {/* Feed Header */}
          <div className="flex items-center justify-between pt-5 md:pt-6 pb-0 gap-3">
            <h1 className="font-display text-[22px] md:text-[28px] text-text-primary leading-none shrink-0">
              Campus Feed
            </h1>
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-[6px] bg-brand/[0.12] border border-brand/30 text-brand-light text-[12px] md:text-[13px] font-semibold px-3 md:px-4 py-[7px] md:py-2 rounded-full hover:bg-brand/20 transition-all shrink-0"
            >
              <PenSquare className="w-3.5 h-3.5" /> Write Post
            </button>
          </div>

          {/* Tab Bar — scrollable on mobile */}
          <div className="flex gap-0 mt-3 md:mt-4 border-b border-white/[0.07] overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-[6px] md:gap-[7px] px-3 md:px-5 py-2.5 md:py-3 text-[12px] md:text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "text-brand-light border-brand"
                    : "text-text-disabled border-transparent hover:text-text-muted"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {tab.label}
                {tab.id === "department" && user?.department && (
                  <span className="text-[10px] font-bold px-[7px] py-0.5 rounded-full bg-cyan/[0.12] text-cyan border border-cyan/20">
                    {user.department.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Composer — opens Feed modal, NOT blog */}
          <button
            onClick={() => setShowComposer(true)}
            className="flex gap-3 items-center w-full bg-[rgba(22,22,42,0.6)] border border-white/[0.08] rounded-[14px] p-[12px_14px] md:p-[14px_16px] my-4 hover:border-brand/30 transition-[border-color] cursor-pointer text-left"
          >
            <img src={avatarUrl} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 object-cover shrink-0" />
            <div className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-full px-[14px] md:px-[18px] py-[8px] md:py-[9px] text-[13px] md:text-sm text-text-disabled">
              What&apos;s on your mind?
            </div>
          </button>

          {/* Posts */}
          <div className="space-y-0">
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center pt-4 pb-2">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-2.5 bg-white/[0.05] border border-white/[0.10] rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-all text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        </div>

        {/* ── Right Sidebar ─────────────────────────────────── */}
        <div className="hidden lg:flex flex-col gap-4 w-[300px] shrink-0 sticky top-[calc(var(--nav-height)+16px)] max-h-[calc(100vh-80px)] overflow-y-auto pl-7 pt-6">
          {/* Trending Tags Widget */}
          <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] p-[18px]">
            <div className="flex items-center justify-between text-[13px] font-bold text-text-primary mb-3.5">
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Trending</span>
              <Link href="/explore" className="text-brand text-xs font-medium hover:text-brand-light transition-colors">See all</Link>
            </div>
            {[
              { rank: 1, tag: "#CSC201", count: "2.4k posts" },
              { rank: 2, tag: "#PastQuestions", count: "1.8k posts" },
              { rank: 3, tag: "#ExamPrep", count: "1.2k posts" },
              { rank: 4, tag: "#ProjectTopics", count: "890 posts" },
              { rank: 5, tag: "#ESUT2025", count: "720 posts" },
            ].map(t => (
              <div key={t.rank} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-b-0 last:pb-0 cursor-pointer hover:pl-1 transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-disabled w-4">{t.rank}</span>
                  <span className="text-[13px] font-semibold text-text-secondary">{t.tag}</span>
                </div>
                <span className="text-[11px] text-text-disabled">{t.count}</span>
              </div>
            ))}
          </div>

          {/* Suggested Users Widget */}
          <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] p-[18px]">
            <div className="flex items-center justify-between text-[13px] font-bold text-text-primary mb-3.5">
              <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Suggested</span>
            </div>
            {[
              { name: "Dr. Okafor", username: "dr_okafor", dept: "Computer Science", isLecturer: true },
              { name: "Chioma Eze", username: "chioma_eze", dept: "Electrical Eng." },
              { name: "Tunde Lagos", username: "tunde_l", dept: "Civil Engineering" },
            ].map(u => (
              <div key={u.username} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-b-0 last:pb-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${u.username}`} className="text-[13px] font-semibold text-text-primary hover:text-brand-light transition-colors truncate block">
                    {u.name}
                  </Link>
                  <span className="text-[11px] text-text-disabled truncate block">{u.dept}</span>
                </div>
                <button className="h-7 px-3 rounded-full bg-brand/[0.12] border border-brand/30 text-brand-light text-xs font-semibold hover:bg-brand/[0.22] transition-all shrink-0">
                  Follow
                </button>
              </div>
            ))}
          </div>

          {/* Top Documents Widget */}
          <div className="bg-[rgba(18,18,32,0.7)] border border-white/[0.07] rounded-[14px] p-[18px]">
            <div className="flex items-center justify-between text-[13px] font-bold text-text-primary mb-3.5">
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Top Documents</span>
              <Link href="/library" className="text-brand text-xs font-medium hover:text-brand-light transition-colors">Browse</Link>
            </div>
            {[
              { title: "CSC 201 Past Questions 2024", downloads: "1.2k", type: "past_questions" },
              { title: "MTH 101 Lecture Notes", downloads: "890", type: "notes" },
              { title: "PHY 201 Lab Manual", downloads: "650", type: "handout" },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-b-0 last:pb-0 cursor-pointer hover:bg-white/[0.02] rounded transition-all">
                <span className="text-lg">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text-primary truncate">{d.title}</p>
                  <p className="text-[11px] text-text-disabled">{d.downloads} downloads</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Composer Modal */}
      <FeedComposer
        isOpen={showComposer}
        onClose={() => setShowComposer(false)}
        onPost={handleCreatePost}
      />
    </>
  );
}
