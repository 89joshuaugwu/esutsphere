'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Heart,
  Flame,
  Lightbulb,
  Laugh,
  Sparkles,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import type { FeedPostData, ReactionType } from '@/types';

interface FeedPostProps {
  post: FeedPostData;
}

const REACTION_CONFIG: {
  type: ReactionType;
  emoji: string;
  icon: React.ElementType;
  activeClass: string;
}[] = [
  { type: 'like', emoji: '👍', icon: Heart, activeClass: 'bg-brand/12 border-brand/30 text-brand-light' },
  { type: 'love', emoji: '❤️', icon: Heart, activeClass: 'bg-red-500/10 border-red-500/25 text-red-400' },
  { type: 'fire', emoji: '🔥', icon: Flame, activeClass: 'bg-orange-500/10 border-orange-500/25 text-orange-400' },
  { type: 'insightful', emoji: '💡', icon: Lightbulb, activeClass: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400' },
  { type: 'funny', emoji: '😂', icon: Laugh, activeClass: 'bg-cyan/10 border-cyan/25 text-cyan-light' },
];

export default function FeedPost({ post }: FeedPostProps) {
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const displayContent = post.excerpt || post.content;
  const isTruncatable = displayContent.length > 280;

  const handleReaction = (type: ReactionType) => {
    setActiveReaction(prev => (prev === type ? null : type));
  };

  const formatTime = (timestamp: FeedPostData['createdAt']) => {
    if (!timestamp) return 'just now';
    const seconds = timestamp?.seconds;
    if (!seconds) return 'just now';
    const diff = Math.floor((Date.now() / 1000) - seconds);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[rgba(20,20,38,0.7)] border border-white/[0.07] rounded-2xl p-[14px_14px] md:p-[18px_20px] mb-3 transition-[border-color] duration-200 hover:border-white/[0.11] overflow-hidden"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/profile/${post.authorUsername}`}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-full bg-bg-surface-3 border-2 border-white/[0.08] overflow-hidden flex-shrink-0">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-semibold">
                {post.authorName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <span className="text-sm font-bold text-text-primary group-hover:text-brand-light transition-colors flex items-center gap-1.5">
              {post.authorName}
            </span>
            <span className="text-xs text-text-disabled">
              <span className="text-text-muted font-medium">@{post.authorUsername}</span>
              {' · '}
              {formatTime(post.createdAt)}
            </span>
          </div>
        </Link>
        <button className="w-8 h-8 rounded-[7px] flex items-center justify-center text-text-disabled hover:bg-white/[0.06] hover:text-text-muted transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Department Badge */}
      {post.category && (
        <div className="mb-3">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
            {post.category.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      )}

      {/* Post Title */}
      {post.title && (
        <h3 className="text-base font-bold text-text-primary mb-2 leading-snug hover:text-brand-light transition-colors cursor-pointer">
          {post.title}
        </h3>
      )}

      {/* Post Body */}
      <div className="mb-3">
        <p className={`text-sm text-text-secondary leading-[22px] ${!showFullContent && isTruncatable ? 'line-clamp-4' : ''}`}>
          {displayContent}
        </p>
        {isTruncatable && !showFullContent && (
          <button
            onClick={() => setShowFullContent(true)}
            className="text-[13px] font-semibold text-brand mt-1 hover:text-brand-light transition-colors"
          >
            Read more
          </button>
        )}
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-3 rounded-xl overflow-hidden border border-white/[0.08]">
          <img src={post.coverImage} alt="Post cover" className="w-full max-h-[400px] object-cover" />
        </div>
      )}

      {/* Attached Doc Preview */}
      {post.attachedDocId && (
        <Link
          href={`/library/${post.attachedDocId}`}
          className="flex items-center gap-3 bg-[#111120] border border-white/[0.08] rounded-xl p-3 mb-3 hover:border-brand/30 transition-[border-color]"
        >
          <div className="w-2 h-2 rounded-full bg-brand-light flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{post.attachedDocTitle}</p>
            <p className="text-[11px] text-text-muted">{post.attachedDocCourseCode}</p>
          </div>
          <span className="text-text-disabled text-sm">→</span>
        </Link>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="text-xs font-medium text-text-muted bg-white/[0.04] rounded-full px-2.5 py-0.5 hover:bg-brand/10 hover:text-brand-light transition-all cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reactions + Actions Bar */}
      <div className="flex items-center gap-0.5 md:gap-1 pt-3 border-t border-white/[0.05] overflow-x-auto no-scrollbar -mx-1 px-1">
        {/* Reaction buttons */}
        {REACTION_CONFIG.map(({ type, emoji }) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-150 select-none shrink-0
              ${activeReaction === type
                ? REACTION_CONFIG.find(r => r.type === type)?.activeClass
                : 'text-text-muted hover:bg-white/[0.05] hover:text-text-secondary'
              }
              border border-transparent ${activeReaction === type ? '' : 'hover:border-white/[0.08]'}
              active:scale-[1.3] active:transition-transform
            `}
          >
            <span className="text-[14px] md:text-base">{emoji}</span>
            <span>{type === 'like' ? post.likesCount : ''}</span>
          </button>
        ))}

        {/* Separator */}
        <div className="w-px h-4 md:h-5 bg-white/[0.06] mx-0.5 shrink-0" />

        {/* Comment */}
        <button className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-text-muted text-[12px] md:text-[13px] font-medium hover:bg-white/[0.05] hover:text-text-secondary transition-all shrink-0">
          <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>{post.commentsCount}</span>
        </button>

        {/* Share */}
        <button className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-text-muted text-[12px] md:text-[13px] font-medium hover:bg-white/[0.05] hover:text-text-secondary transition-all shrink-0">
          <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        {/* Bookmark */}
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`ml-auto flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[12px] md:text-[13px] font-medium transition-all shrink-0
            ${isBookmarked ? 'text-gold' : 'text-text-muted hover:bg-white/[0.05] hover:text-text-secondary'}
          `}
        >
          <Bookmark className="w-3.5 h-3.5 md:w-4 md:h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.article>
  );
}
