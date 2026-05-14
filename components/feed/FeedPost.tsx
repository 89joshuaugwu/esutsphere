"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";

export default function FeedPost({ post }: { post: any }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev: number) => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#16162A] border border-white/10 rounded-[16px] p-5 mb-6 transition-all duration-200 hover:border-white/20 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <Link href={`/profile/${post.authorUsername}`}>
            <img 
              src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUsername}`} 
              alt={post.authorUsername}
              className="w-10 h-10 rounded-full bg-bg-surface-3 border border-white/10"
            />
          </Link>
          <div>
            <Link href={`/profile/${post.authorUsername}`} className="font-ui text-[15px] font-semibold text-text-primary hover:text-brand-light transition-colors">
              {post.authorName}
            </Link>
            <p className="text-xs text-text-muted">@{post.authorUsername} • {post.timeAgo}</p>
          </div>
        </div>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-ui text-lg font-semibold text-text-primary mb-2">{post.title}</h3>
        <p className="text-text-secondary text-[15px] leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>
      </div>

      {/* Interaction Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-brand-light' : 'text-text-muted hover:text-brand-light'}`}
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-text-muted hover:text-cyan transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentsCount || 0}</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        <button 
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`text-sm transition-colors ${isBookmarked ? 'text-gold' : 'text-text-muted hover:text-gold'}`}
        >
          <motion.div whileTap={{ scale: 0.8 }}>
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </motion.div>
        </button>
      </div>
    </motion.div>
  );
}
