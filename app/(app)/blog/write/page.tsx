"use client";
import { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function WriteBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your campus story...' })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-brand max-w-none focus:outline-hidden min-h-[400px] px-8 py-6',
      },
    },
  });

  const handlePublish = async () => {
    if (!title) return toast.error("Please add a title.");
    if (!editor || editor.isEmpty) return toast.error("Content cannot be empty.");

    setIsPublishing(true);
    setTimeout(() => {
      toast.success("Blog published successfully!");
      router.push("/blog");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-text-primary">Draft New Post</h1>
        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className="h-10 px-6 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-70 transition-all"
        >
          {isPublishing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          Publish
        </button>
      </div>

      <div className="bg-[#16162A] border border-white/10 rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <input 
          type="text" 
          placeholder="Enter a captivating title..."
          className="w-full bg-transparent border-b border-white/10 text-3xl font-display text-text-primary px-8 py-6 outline-hidden placeholder:text-text-muted"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border-b border-white/10">
          <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('bold') ? 'text-brand-light bg-white/10' : 'text-text-secondary'}`}>
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('italic') ? 'text-brand-light bg-white/10' : 'text-text-secondary'}`}>
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('bulletList') ? 'text-brand-light bg-white/10' : 'text-text-secondary'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-white/10 transition-colors ${editor?.isActive('orderedList') ? 'text-brand-light bg-white/10' : 'text-text-secondary'}`}>
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button className="p-2 rounded hover:bg-white/10 text-text-secondary transition-colors">
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="text-text-primary">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
