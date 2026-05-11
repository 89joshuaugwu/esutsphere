"use client";
import { useState } from "react";
import DocumentCard from "@/components/library/DocumentCard";
import UploadModal from "@/components/library/UploadModal";
import { Search, Filter, Plus } from "lucide-react";
import { Document } from "@/types";

const MOCK_DOCS: Document[] = [
  {
    id: "1", title: "MTH101 General Mathematics I Notes", description: "Complete notes for first semester general mathematics including calculus and algebra.", fileUrl: "#", fileType: "pdf", fileSizeKb: 2500, contentType: "notes", department: "Computer Science", faculty: "Natural Sciences", courseCode: "MTH 101", courseName: "General Mathematics I", level: "100L", academicSession: "2023/2024", uploaderId: "u1", uploaderName: "John Doe", uploaderUsername: "johndoe", uploaderAvatar: "", isLecturerUpload: false, viewCount: 1205, downloadCount: 450, likesCount: 89, commentsCount: 12, bookmarksCount: 30, isPinned: true, isApproved: true, isFeatured: false, tags: ["math", "calculus"], createdAt: null as any, updatedAt: null as any
  },
  {
    id: "2", title: "CSC201 Introduction to Programming (Java)", description: "Past questions and detailed solutions from 2018-2022.", fileUrl: "#", fileType: "pdf", fileSizeKb: 1200, contentType: "past_questions", department: "Computer Science", faculty: "Natural Sciences", courseCode: "CSC 201", courseName: "Introduction to Programming", level: "200L", academicSession: "2023/2024", uploaderId: "u2", uploaderName: "Jane Smith", uploaderUsername: "janesmith", uploaderAvatar: "", isLecturerUpload: false, viewCount: 890, downloadCount: 320, likesCount: 45, commentsCount: 5, bookmarksCount: 15, isPinned: false, isApproved: true, isFeatured: true, tags: ["java", "programming"], createdAt: null as any, updatedAt: null as any
  }
];

export default function LibraryPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-text-primary mb-2">Resource Library</h1>
          <p className="text-text-secondary">Discover notes, past questions, and research materials.</p>
        </div>
        
        <button onClick={() => setIsUploadOpen(true)} className="h-11 px-5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all">
          <Plus className="w-5 h-5" /> Upload Material
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by course code or title..." className="w-full bg-bg-surface-2 border border-white/10 rounded-lg h-10 pl-10 pr-4 text-text-primary text-sm outline-hidden focus:border-brand/50 focus:ring-2 focus:ring-brand/20" />
        </div>
        
        <button className="h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-text-secondary hover:bg-white/10 hover:text-text-primary flex items-center gap-2 whitespace-nowrap transition-colors">
          <Filter className="w-4 h-4" /> Type: All
        </button>
        <button className="h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-sm text-text-secondary hover:bg-white/10 hover:text-text-primary flex items-center gap-2 whitespace-nowrap transition-colors">
          Level: All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DOCS.map(doc => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
