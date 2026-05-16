"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  X, Image as ImageIcon, Hash, Send, Loader2, Smile,
  FileText, LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const MAX_CHARS = 500;

const CATEGORIES = [
  { id: "academic", label: "Academic", emoji: "📚" },
  { id: "campus_news", label: "Campus News", emoji: "📢" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🌟" },
  { id: "opinions", label: "Opinions", emoji: "🗣️" },
  { id: "question", label: "Question", emoji: "❓" },
];

interface FeedComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onPost?: (post: { content: string; category: string; tags: string[] }) => void;
}

export default function FeedComposer({ isOpen, onClose, onPost }: FeedComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const avatarUrl = user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "anon"}`;
  const charCount = content.length;
  const canPost = content.trim().length > 0 && content.length <= MAX_CHARS;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "");
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const handlePost = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      // TODO: Firestore integration
      onPost?.({ content, category, tags });
      toast.success("Post published! 🎉");
      setContent("");
      setCategory("");
      setTags([]);
      onClose();
    } catch {
      toast.error("Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(8,8,16,0.80)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[540px] bg-bg-surface-2 rounded-t-[20px] sm:rounded-[20px] max-h-[85vh] overflow-y-auto"
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
          animation: "card-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-white/[0.08] hover:text-text-primary transition-all">
            <X className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-bold text-text-primary">Create Post</span>
          <button
            onClick={handlePost}
            disabled={!canPost || posting}
            className="h-8 px-4 rounded-full text-[13px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canPost ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "rgba(255,255,255,0.08)",
              boxShadow: canPost ? "0 4px 14px rgba(124,58,237,0.4)" : "none",
            }}
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </button>
        </div>

        {/* Compose Area */}
        <div className="px-4 sm:px-5 py-4">
          <div className="flex gap-3">
            <img
              src={avatarUrl}
              alt={user?.displayName || "User"}
              className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary mb-1">{user?.displayName || "You"}</p>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={autoResize}
                placeholder="What's happening on campus? Share updates, tips, or questions..."
                className="w-full bg-transparent text-[15px] text-text-primary placeholder:text-text-disabled resize-none outline-hidden leading-[24px] min-h-[80px]"
                maxLength={MAX_CHARS + 50}
                autoFocus
              />
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 ml-[52px]">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-[12px] font-semibold px-2 py-[3px] rounded-full bg-brand/10 text-brand-light border border-brand/20">
                  #{t}
                  <button onClick={() => removeTag(t)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="flex items-center gap-1.5 mt-2 ml-[52px]">
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
                {CATEGORIES.find(c => c.id === category)?.emoji} {CATEGORIES.find(c => c.id === category)?.label}
              </span>
              <button onClick={() => setCategory("")} className="text-text-disabled hover:text-text-primary">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Tools */}
        <div className="px-4 sm:px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Category Picker */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2.5 -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(category === cat.id ? "" : cat.id)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-[6px] rounded-full text-[11px] font-semibold transition-all ${
                  category === cat.id
                    ? "bg-brand/20 text-brand-light border border-brand/30"
                    : "bg-white/[0.04] text-text-muted border border-white/[0.08] hover:bg-white/[0.08]"
                }`}
              >
                <span className="text-[13px]">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tag Input + Char Count */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 flex-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-[6px]">
              <Hash className="w-3.5 h-3.5 text-text-disabled shrink-0" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length >= 5 ? "Max 5 tags" : "Add tag (press Enter)"}
                disabled={tags.length >= 5}
                className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-disabled outline-hidden"
              />
            </div>
            <span className={`text-[12px] font-semibold shrink-0 ${
              charCount > MAX_CHARS ? "text-error" : charCount > MAX_CHARS * 0.9 ? "text-warning" : "text-text-disabled"
            }`}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
