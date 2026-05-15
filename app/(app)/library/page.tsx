"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import DocumentCard from "@/components/library/DocumentCard";
import UploadModal from "@/components/library/UploadModal";
import { Search, Plus, ChevronDown, X, SlidersHorizontal, FileText } from "lucide-react";
import { Document, ContentType } from "@/types";
import { CONTENT_TYPES, LEVELS, DEPARTMENTS } from "@/constants/departments";

// ── Mock Data ─────────────────────────────────────────────────────
const MOCK_DOCS: Document[] = [
  {
    id: "1", title: "MTH101 General Mathematics I Notes", description: "Complete notes for first semester general mathematics including calculus, algebra, and trigonometry fundamentals.", fileUrl: "#", fileType: "pdf", fileSizeKb: 2500, contentType: "notes", department: "Computer Science", faculty: "Physical Sciences", courseCode: "MTH 101", courseName: "General Mathematics I", level: "100L", academicSession: "2024/2025", uploaderId: "u1", uploaderName: "John Doe", uploaderUsername: "johndoe", uploaderAvatar: "", isLecturerUpload: false, viewCount: 1205, downloadCount: 450, likesCount: 89, commentsCount: 12, bookmarksCount: 30, isPinned: true, isApproved: true, isFeatured: false, tags: ["math", "calculus"], createdAt: null as any, updatedAt: null as any
  },
  {
    id: "2", title: "CSC201 Introduction to Programming (Java)", description: "Past questions and detailed solutions from 2018-2024 exam sessions.", fileUrl: "#", fileType: "pdf", fileSizeKb: 1200, contentType: "past_questions", department: "Computer Science", faculty: "Physical Sciences", courseCode: "CSC 201", courseName: "Introduction to Programming", level: "200L", academicSession: "2024/2025", uploaderId: "u2", uploaderName: "Jane Smith", uploaderUsername: "janesmith", uploaderAvatar: "", isLecturerUpload: false, viewCount: 890, downloadCount: 320, likesCount: 45, commentsCount: 5, bookmarksCount: 15, isPinned: false, isApproved: true, isFeatured: true, tags: ["java", "programming"], createdAt: null as any, updatedAt: null as any
  },
  {
    id: "3", title: "PHY101 Classical Mechanics Research Paper", description: "Comprehensive research paper on Newtonian mechanics and its applications in modern engineering.", fileUrl: "#", fileType: "pdf", fileSizeKb: 3200, contentType: "research", department: "Industrial Physics", faculty: "Physical Sciences", courseCode: "PHY 101", courseName: "Classical Mechanics", level: "100L", academicSession: "2023/2024", uploaderId: "u3", uploaderName: "Dr. Okafor", uploaderUsername: "dr_okafor", uploaderAvatar: "", isLecturerUpload: true, viewCount: 560, downloadCount: 180, likesCount: 67, commentsCount: 8, bookmarksCount: 22, isPinned: false, isApproved: true, isFeatured: false, tags: ["physics", "mechanics"], createdAt: null as any, updatedAt: null as any
  },
  {
    id: "4", title: "CSC466 Compiler Construction Notes", description: "Complete lecture notes from Dr. T. Asogwa's class. Covers lexical analysis, parsing, and code generation.", fileUrl: "#", fileType: "pdf", fileSizeKb: 4100, contentType: "notes", department: "Computer Science", faculty: "Physical Sciences", courseCode: "CSC 466", courseName: "Compiler Construction", level: "400L", academicSession: "2024/2025", uploaderId: "u4", uploaderName: "Joshua Ugwu", uploaderUsername: "joshuazaza", uploaderAvatar: "", isLecturerUpload: false, viewCount: 1540, downloadCount: 680, likesCount: 124, commentsCount: 19, bookmarksCount: 45, isPinned: true, isApproved: true, isFeatured: true, tags: ["compiler", "cs"], createdAt: null as any, updatedAt: null as any
  },
  {
    id: "5", title: "BUS301 Principles of Marketing Seminar", description: "Seminar presentation slides on digital marketing strategies for Nigerian businesses.", fileUrl: "#", fileType: "pptx", fileSizeKb: 5200, contentType: "seminar", department: "Business Administration", faculty: "Management Sciences", courseCode: "BUS 301", courseName: "Principles of Marketing", level: "300L", academicSession: "2024/2025", uploaderId: "u5", uploaderName: "Temi Adewale", uploaderUsername: "temilade", uploaderAvatar: "", isLecturerUpload: false, viewCount: 320, downloadCount: 95, likesCount: 28, commentsCount: 3, bookmarksCount: 10, isPinned: false, isApproved: true, isFeatured: false, tags: ["marketing", "business"], createdAt: null as any, updatedAt: null as any
  },
  {
    id: "6", title: "CHM201 Organic Chemistry Textbook Summary", description: "Condensed textbook notes covering all major organic chemistry reactions and mechanisms.", fileUrl: "#", fileType: "pdf", fileSizeKb: 2800, contentType: "textbook", department: "Industrial Chemistry", faculty: "Physical Sciences", courseCode: "CHM 201", courseName: "Organic Chemistry", level: "200L", academicSession: "2023/2024", uploaderId: "u6", uploaderName: "Chika Nwankwo", uploaderUsername: "chikankwo", uploaderAvatar: "", isLecturerUpload: false, viewCount: 740, downloadCount: 290, likesCount: 56, commentsCount: 7, bookmarksCount: 18, isPinned: false, isApproved: true, isFeatured: false, tags: ["chemistry", "organic"], createdAt: null as any, updatedAt: null as any
  },
];

// ── Filter helpers ────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "createdAt", label: "Most Recent" },
  { value: "downloadCount", label: "Most Downloaded" },
  { value: "likesCount", label: "Most Liked" },
] as const;

export default function LibraryPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType | "">("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [lecturerOnly, setLecturerOnly] = useState(false);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (selectedType) chips.push({ key: "type", label: CONTENT_TYPES.find(t => t.value === selectedType)?.label || selectedType });
    if (selectedLevel) chips.push({ key: "level", label: `${selectedLevel}L` });
    if (selectedDept) chips.push({ key: "dept", label: selectedDept });
    if (lecturerOnly) chips.push({ key: "lecturer", label: "Lecturer Uploads" });
    return chips;
  }, [selectedType, selectedLevel, selectedDept, lecturerOnly]);

  const clearFilter = (key: string) => {
    if (key === "type") setSelectedType("");
    if (key === "level") setSelectedLevel("");
    if (key === "dept") setSelectedDept("");
    if (key === "lecturer") setLecturerOnly(false);
  };

  const clearAll = () => {
    setSelectedType("");
    setSelectedLevel("");
    setSelectedDept("");
    setLecturerOnly(false);
    setSearchQuery("");
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let docs = [...MOCK_DOCS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q) || d.courseCode.toLowerCase().includes(q));
    }
    if (selectedType) docs = docs.filter(d => d.contentType === selectedType);
    if (selectedLevel) docs = docs.filter(d => d.level === `${selectedLevel}L`);
    if (selectedDept) docs = docs.filter(d => d.department === selectedDept);
    if (lecturerOnly) docs = docs.filter(d => d.isLecturerUpload);
    // Sort
    docs.sort((a, b) => {
      if (sortBy === "downloadCount") return b.downloadCount - a.downloadCount;
      if (sortBy === "likesCount") return b.likesCount - a.likesCount;
      return 0; // createdAt — keep original order for mock
    });
    return docs;
  }, [searchQuery, selectedType, selectedLevel, selectedDept, lecturerOnly, sortBy]);

  return (
    <>
      <div className="space-y-0 -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
        {/* ── Library Header ──────────────────────────────────── */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(28px,3vw,40px)] text-text-primary leading-[1.1] mb-2">
                Resource Library
              </h1>
              <p className="text-sm text-text-muted">
                Discover notes, past questions, and research materials shared by ESUT students.
              </p>
              {/* Meta strip */}
              <div className="flex items-center gap-4 mt-2.5">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted">
                  <FileText className="w-3.5 h-3.5" /> {MOCK_DOCS.length} documents
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[13px] font-medium text-text-muted">
                  {CONTENT_TYPES.length} categories
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.5)] transition-all duration-200 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </button>
          </div>
        </div>

        {/* ── Filter Bar (Sticky) ──────────────────────────────── */}
        <div className="sticky top-[64px] z-50 bg-[rgba(8,8,16,0.92)] border-b border-white/[0.06] px-6 md:px-8 py-3.5" style={{ backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[380px]">
              <Search className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by course code or title..."
                className="w-full h-10 bg-white/[0.05] border border-white/10 rounded-[10px] pl-10 pr-4 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] focus:bg-[rgba(124,58,237,0.04)] transition-all"
              />
            </div>

            {/* Desktop Filter Dropdowns */}
            <div className="hidden sm:flex items-center gap-2">
              <FilterDropdown
                label="Type"
                value={selectedType}
                options={CONTENT_TYPES.map(t => ({ value: t.value, label: t.label }))}
                onChange={v => setSelectedType(v as ContentType | "")}
              />
              <FilterDropdown
                label="Level"
                value={selectedLevel}
                options={LEVELS.map(l => ({ value: l, label: `${l}L` }))}
                onChange={setSelectedLevel}
              />
              <FilterDropdown
                label="Department"
                value={selectedDept}
                options={DEPARTMENTS.slice(0, 15).map(d => ({ value: d.name, label: d.name }))}
                onChange={setSelectedDept}
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden flex items-center gap-2 h-10 px-4 bg-white/[0.05] border border-white/10 rounded-[10px] text-sm text-text-secondary hover:bg-white/[0.08] transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
            </button>

            {/* Sort */}
            <div className="hidden sm:block ml-auto">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-10 px-3.5 pr-8 bg-white/[0.05] border border-white/10 rounded-[10px] text-sm text-text-secondary cursor-pointer outline-hidden appearance-none"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-2.5">
              {activeFilters.map(f => (
                <span key={f.key} className="inline-flex items-center gap-1.5 bg-brand/[0.12] border border-brand/30 rounded-full px-2.5 py-1 text-xs font-semibold text-brand-light">
                  {f.label}
                  <button onClick={() => clearFilter(f.key)} className="text-brand-light/60 hover:text-brand-light transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-[13px] font-medium text-error hover:text-red-400 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Content: Sidebar + Grid ──────────────────────────── */}
        <div className="flex">
          {/* Left Sidebar — Desktop only */}
          <aside className="hidden lg:block w-[240px] shrink-0 border-r border-white/[0.06] sticky top-[calc(64px+57px)] h-[calc(100vh-64px-57px)] overflow-y-auto">
            <SidebarSection title="Content Type">
              {CONTENT_TYPES.map(t => (
                <SidebarOption
                  key={t.value}
                  label={t.label}
                  emoji={t.emoji}
                  active={selectedType === t.value}
                  count={MOCK_DOCS.filter(d => d.contentType === t.value).length}
                  onClick={() => setSelectedType(selectedType === t.value ? "" : t.value as ContentType)}
                />
              ))}
            </SidebarSection>
            <SidebarSection title="Level">
              {LEVELS.map(l => (
                <SidebarOption
                  key={l}
                  label={`${l} Level`}
                  active={selectedLevel === l}
                  count={MOCK_DOCS.filter(d => d.level === `${l}L`).length}
                  onClick={() => setSelectedLevel(selectedLevel === l ? "" : l)}
                />
              ))}
            </SidebarSection>
            <SidebarSection title="Lecturer Uploads">
              <label className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors">
                <span className="text-[13px] font-medium text-text-muted">Show only lecturer uploads</span>
                <input
                  type="checkbox"
                  checked={lecturerOnly}
                  onChange={e => setLecturerOnly(e.target.checked)}
                  className="accent-brand w-4 h-4"
                />
              </label>
            </SidebarSection>
          </aside>

          {/* Document Grid */}
          <div className="flex-1 p-6 md:p-8">
            {filteredDocs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocs.map((doc, i) => (
                  <div key={doc.id} style={{ animation: `card-enter 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }}>
                    <DocumentCard doc={doc} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="w-16 h-16 text-white/[0.08] mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No documents found</h3>
                <p className="text-sm text-text-muted mb-6 max-w-sm">
                  Try adjusting your filters or be the first to upload for this course.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold px-5 py-2.5 rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] transition-all"
                >
                  <Plus className="w-4 h-4" /> Upload First Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet ────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[200] sm:hidden" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(4px)" }} />
          <div
            className="absolute bottom-0 left-0 right-0 bg-bg-surface-1 border-t border-white/10 rounded-t-2xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-text-primary">Filter & Sort</h3>
              <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Sort */}
              <div>
                <label className="text-[11px] font-bold text-text-disabled uppercase tracking-wider mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setSortBy(o.value)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                        sortBy === o.value
                          ? "bg-brand/[0.14] border-brand/40 text-brand-light"
                          : "bg-transparent border-white/[0.08] text-text-muted hover:bg-white/[0.06]"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Content Type */}
              <div>
                <label className="text-[11px] font-bold text-text-disabled uppercase tracking-wider mb-2 block">Content Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(selectedType === t.value ? "" : t.value as ContentType)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedType === t.value
                          ? "bg-brand/[0.14] border-brand/40 text-brand-light"
                          : "bg-transparent border-white/[0.08] text-text-muted hover:bg-white/[0.06]"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Level */}
              <div>
                <label className="text-[11px] font-bold text-text-disabled uppercase tracking-wider mb-2 block">Level</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setSelectedLevel(selectedLevel === l ? "" : l)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedLevel === l
                          ? "bg-brand/[0.14] border-brand/40 text-brand-light"
                          : "bg-transparent border-white/[0.08] text-text-muted hover:bg-white/[0.06]"
                      }`}
                    >
                      {l}L
                    </button>
                  ))}
                </div>
              </div>
              {/* Lecturer Toggle */}
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm font-medium text-text-secondary">Lecturer uploads only</span>
                <input type="checkbox" checked={lecturerOnly} onChange={e => setLecturerOnly(e.target.checked)} className="accent-brand w-5 h-5" />
              </label>
              {/* Apply */}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-brand text-white font-semibold py-3 rounded-xl hover:bg-brand-light transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </>
  );
}

// ── Sidebar Components ────────────────────────────────────────────
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-white/[0.06]">
      <h4 className="text-[11px] font-bold text-text-disabled uppercase tracking-[0.8px] mb-2.5">{title}</h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarOption({ label, emoji, active, count, onClick }: {
  label: string; emoji?: string; active: boolean; count: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2.5 py-[7px] rounded-lg cursor-pointer transition-all duration-150 ${
        active ? "bg-brand/10" : "hover:bg-white/[0.04]"
      }`}
    >
      <span className={`flex items-center gap-2 text-[13px] font-medium ${active ? "text-brand-light" : "text-text-muted"}`}>
        {emoji && <span className="text-sm">{emoji}</span>}
        {label}
      </span>
      {count > 0 && (
        <span className={`text-[11px] font-semibold px-[7px] py-[1px] rounded-full ${
          active ? "bg-brand/15 text-brand-light" : "bg-white/[0.06] text-text-disabled"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Filter Dropdown ───────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeLabel = options.find(o => o.value === value)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`h-10 px-3.5 flex items-center gap-2 rounded-[10px] text-[13px] font-medium border transition-all whitespace-nowrap ${
          value
            ? "bg-brand/[0.12] border-brand/40 text-brand-light"
            : "bg-white/[0.05] border-white/10 text-text-secondary hover:bg-white/[0.08]"
        }`}
      >
        {label}: {activeLabel || "All"}
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 z-50 w-52 bg-bg-surface-2 border border-white/10 rounded-xl p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                !value ? "bg-brand/10 text-brand-light" : "text-text-secondary hover:bg-white/[0.06]"
              }`}
            >
              All
            </button>
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  value === o.value ? "bg-brand/10 text-brand-light" : "text-text-secondary hover:bg-white/[0.06]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
