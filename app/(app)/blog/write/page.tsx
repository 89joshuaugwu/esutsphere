"use client";
import { useState, useRef, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TLink from "@tiptap/extension-link";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus,
  Link2, Image as ImageIcon, Undo2, Redo2, Upload, X, Save, Send, ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "campus_news", label: "Campus News", emoji: "📢" },
  { id: "academic", label: "Academic", emoji: "📚" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "career", label: "Career", emoji: "💼" },
  { id: "opinions", label: "Opinions", emoji: "🗣️" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🌟" },
];

export default function WriteBlogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryDrop, setShowCategoryDrop] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const coverRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Start writing your campus story..." }),
      Underline,
      TLink.configure({ openOnClick: false }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-hidden min-h-[400px] px-0 py-6 text-text-secondary text-[15px] leading-[26px]",
      },
    },
  });

  const wordCount = useMemo(() => {
    if (!editor) return 0;
    return editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;
  }, [editor?.state.doc.textContent]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Cover image must be under 5MB.");
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "");
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  };

  const handleTitleResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleSetLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkForm(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("Draft saved.");
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!title.trim()) return toast.error("Please add a title.");
    if (!editor || editor.isEmpty) return toast.error("Content cannot be empty.");
    if (!category) return toast.error("Please select a category.");
    if (!user) return toast.error("You must be logged in.");

    setIsPublishing(true);
    let uploadedCoverUrl = "";

    try {
      if (coverFile) {
        toast.loading("Uploading cover image...", { id: "blog-publish" });
        const fd = new FormData();
        fd.append("file", coverFile);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        uploadedCoverUrl = data.url;
      }

      toast.loading("Publishing post...", { id: "blog-publish" });
      const { collection, addDoc, Timestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const excerptText = editor.state.doc.textContent.substring(0, 160) + "...";

      await addDoc(collection(db, "posts"), {
        slug,
        title: title.trim(),
        coverImage: uploadedCoverUrl,
        excerpt: excerptText,
        content: editor.getHTML(),
        readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
        category,
        tags,
        authorId: user.uid,
        authorName: user.displayName,
        authorUsername: user.username,
        authorAvatar: user.profilePicture,
        likesCount: 0,
        commentsCount: 0,
        viewCount: 0,
        bookmarksCount: 0,
        isPublished: true,
        isFeatured: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: Timestamp.now(),
      });

      toast.success("Blog published successfully!", { id: "blog-publish" });
      router.push("/blog");
    } catch (err: any) {
      toast.error("Failed to publish: " + err.message, { id: "blog-publish" });
    } finally {
      setIsPublishing(false);
    }
  };

  const toolbarBtn = (active: boolean) =>
    `w-[34px] h-[34px] rounded-[7px] flex items-center justify-center text-sm transition-all ${
      active
        ? "bg-brand/30 text-white ring-1 ring-brand/50 shadow-[0_0_8px_rgba(124,58,237,0.3)]"
        : "text-text-muted hover:bg-white/[0.07] hover:text-text-primary"
    }`;

  return (
    <div className="max-w-[780px] mx-auto pb-20 md:pb-12">
      {/* Write mode top bar */}
      <div className="flex items-center justify-between py-4 -mx-4 md:-mx-7 px-4 md:px-7 border-b border-white/[0.06] mb-6">
        <Link href="/feed" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-2 text-xs text-text-disabled">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          {isSaving ? "Saving..." : "Saved"}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="h-9 px-4 rounded-lg bg-transparent border border-white/[0.12] text-text-muted text-[13px] font-medium hover:bg-white/[0.06] hover:text-text-primary transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-9 px-[18px] rounded-lg bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold shadow-[0_4px_14px_rgba(124,58,237,0.4)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.55)] transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-[7px]"
          >
            {isPublishing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      {/* Cover Image Upload */}
      <div
        onClick={() => !coverImage && coverRef.current?.click()}
        className={`w-full h-[220px] rounded-[14px] mb-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all relative overflow-hidden ${
          coverImage
            ? "border-0"
            : "bg-brand/[0.04] border-2 border-dashed border-white/[0.08] hover:border-brand/30 hover:bg-brand/[0.06]"
        }`}
      >
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        {coverImage ? (
          <>
            <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); coverRef.current?.click(); }} className="h-9 px-4 rounded-lg bg-white/15 text-text-primary text-[13px] font-semibold transition-all hover:bg-white/25">
                Change
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCoverImage(""); setCoverFile(null); }} className="h-9 px-4 rounded-lg bg-error/15 border border-error/30 text-error text-[13px] font-semibold hover:bg-error/25 transition-all">
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-text-disabled" />
            <p className="text-sm text-text-disabled">Click to add <span className="text-brand-light font-semibold">cover image</span></p>
          </>
        )}
      </div>

      {/* Post Meta Row: Category + Tags */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Category */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDrop(!showCategoryDrop)}
            className={`h-9 px-3.5 rounded-lg text-[13px] font-medium flex items-center gap-2 border transition-all ${
              category
                ? "bg-brand/[0.08] border-brand/35 text-brand-light"
                : "bg-white/[0.04] border-white/10 text-text-muted hover:bg-white/[0.07]"
            }`}
          >
            {category ? CATEGORIES.find(c => c.id === category)?.emoji : "📁"} {category ? CATEGORIES.find(c => c.id === category)?.label : "Category"}
          </button>
          {showCategoryDrop && (
            <div className="absolute top-[calc(100%+4px)] left-0 bg-bg-surface-3 border border-white/[0.12] rounded-xl p-1.5 z-50 shadow-[0_8px_24px_rgba(0,0,0,0.5)] min-w-[180px]" style={{ animation: "card-enter 0.15s ease both" }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); setShowCategoryDrop(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all ${
                    category === c.id ? "bg-brand/[0.14] text-brand-light" : "text-text-muted hover:bg-white/[0.05]"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex-1 min-w-[200px] flex items-center gap-1.5 flex-wrap bg-white/[0.04] border border-white/10 rounded-lg px-3 min-h-[36px] focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-brand/[0.12] border border-brand/25 rounded-full px-2 py-0.5 text-xs font-semibold text-brand-light">
              #{tag}
              <button onClick={() => setTags(tags.filter(t => t !== tag))} className="text-brand/60 hover:text-brand-light transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            className="flex-1 min-w-[80px] bg-transparent border-none outline-hidden text-[13px] text-text-secondary placeholder:text-text-disabled py-1"
          />
        </div>
      </div>

      {/* Title */}
      <textarea
        ref={titleRef}
        rows={1}
        placeholder="Your title..."
        value={title}
        onChange={handleTitleResize}
        className="w-full bg-transparent border-none outline-hidden font-display text-[clamp(28px,4vw,44px)] text-text-primary leading-[1.2] tracking-[-0.5px] mb-4 resize-none overflow-hidden placeholder:text-text-primary/20"
        style={{ height: "auto" }}
      />

      <div className="h-px bg-white/[0.07] mb-0" />

      {/* TipTap Toolbar — Sticky */}
      <div
        className="sticky top-[var(--nav-height)] z-30 py-2 mb-0 -mx-4 md:-mx-7 px-4 md:px-7"
        style={{
          background: "rgba(8,8,16,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-0.5 flex-wrap">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={toolbarBtn(editor?.isActive("bold") ?? false)}><Bold className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={toolbarBtn(editor?.isActive("italic") ?? false)}><Italic className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={toolbarBtn(editor?.isActive("underline") ?? false)}><UnderlineIcon className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} className={toolbarBtn(editor?.isActive("strike") ?? false)}><Strikethrough className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleCode().run()} className={toolbarBtn(editor?.isActive("code") ?? false)}><Code className="w-[14px] h-[14px]" /></button>

          <div className="w-px h-[22px] bg-white/[0.08] mx-1 shrink-0" />

          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={toolbarBtn(editor?.isActive("heading", { level: 1 }) ?? false)}><Heading1 className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor?.isActive("heading", { level: 2 }) ?? false)}><Heading2 className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtn(editor?.isActive("heading", { level: 3 }) ?? false)}><Heading3 className="w-[14px] h-[14px]" /></button>

          <div className="w-px h-[22px] bg-white/[0.08] mx-1 shrink-0" />

          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor?.isActive("bulletList") ?? false)}><List className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor?.isActive("orderedList") ?? false)}><ListOrdered className="w-[14px] h-[14px]" /></button>

          <div className="w-px h-[22px] bg-white/[0.08] mx-1 shrink-0" />

          <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={toolbarBtn(editor?.isActive("blockquote") ?? false)}><Quote className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={toolbarBtn(false)}><Minus className="w-[14px] h-[14px]" /></button>

          <div className="w-px h-[22px] bg-white/[0.08] mx-1 shrink-0" />

          {/* Link */}
          <div className="relative">
            <button onClick={() => setShowLinkForm(!showLinkForm)} className={toolbarBtn(editor?.isActive("link") ?? false)}><Link2 className="w-[14px] h-[14px]" /></button>
            {showLinkForm && (
              <div className="absolute top-[calc(100%+4px)] left-0 flex items-center gap-2 p-1.5 bg-bg-surface-3 border border-white/[0.12] rounded-[10px] z-50 shadow-[0_8px_24px_rgba(0,0,0,0.4)]" style={{ animation: "card-enter 0.15s ease both" }}>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSetLink()}
                  className="w-[240px] h-8 bg-white/[0.06] border border-white/10 rounded-[7px] px-2.5 text-text-primary text-[13px] outline-hidden"
                  autoFocus
                />
                <button onClick={handleSetLink} className="h-8 px-3 rounded-[7px] bg-brand text-white text-xs font-semibold">Add</button>
              </div>
            )}
          </div>

          <div className="w-px h-[22px] bg-white/[0.08] mx-1 shrink-0" />

          <button onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} className={`${toolbarBtn(false)} disabled:opacity-30 disabled:cursor-not-allowed`}><Undo2 className="w-[14px] h-[14px]" /></button>
          <button onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} className={`${toolbarBtn(false)} disabled:opacity-30 disabled:cursor-not-allowed`}><Redo2 className="w-[14px] h-[14px]" /></button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="text-text-primary">
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 py-2.5 mt-4 border-t border-white/[0.06] text-xs text-text-disabled">
        <span>Word count: <span className="text-text-muted font-medium">{wordCount}</span></span>
        <span>Reading time: <span className="text-text-muted font-medium">~{readingTime} min</span></span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Auto-saved
        </span>
      </div>
    </div>
  );
}
