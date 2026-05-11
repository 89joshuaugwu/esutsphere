"use client";
import { useState } from "react";
import FeedPost from "@/components/feed/FeedPost";
import { PenSquare } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const MOCK_POSTS = [
  {
    id: "p1",
    authorName: "John Doe",
    authorUsername: "johndoe",
    timeAgo: "2h ago",
    title: "How to survive CSC 201 Project Defense",
    excerpt: "I just finished my CSC 201 defense and here are some quick tips. The lecturers usually look out for how well you can explain your code, not just if it runs. Make sure you understand every single function you wrote.",
    likesCount: 142,
    commentsCount: 24,
  },
  {
    id: "p2",
    authorName: "Jane Smith",
    authorUsername: "janesmith",
    timeAgo: "5h ago",
    title: "Just uploaded MTH 201 Past Questions",
    excerpt: "Hey guys, I've compiled the past questions for General Mathematics II from 2018 to 2022. It's now available in the library section. Go check it out before the CA next week!",
    likesCount: 89,
    commentsCount: 12,
  }
];

export default function FeedPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPosts([...posts, ...MOCK_POSTS.map(p => ({ ...p, id: p.id + Math.random() }))]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-text-primary">Campus Feed</h1>
        <Link 
          href="/blog/write" 
          className="h-10 px-4 bg-brand/10 text-brand-light font-medium rounded-lg hover:bg-brand/20 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(124,58,237,0.15)]"
        >
          <PenSquare className="w-4 h-4" /> Write Post
        </Link>
      </div>

      <div className="space-y-0">
        {posts.map(post => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>

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
