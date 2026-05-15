"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAdminDocuments, getAdminPosts, removeContent, toggleFeatured } from "@/lib/admin";
import {
  FileText, BookOpen, Search, Star, Trash2, Eye, Pin,
  Loader2, Download, Heart, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

type Tab = "documents" | "posts";

const CONTENT_TYPE_COLORS: Record<string, string> = {
  notes: "#7C3AED", past_questions: "#F59E0B", research: "#06B6D4",
  assignment: "#10B981", seminar: "#EC4899", textbook: "#F97316",
  project: "#8B5CF6", handout: "#94A3B8",
};

export default function ContentPage() {
  const { user: admin } = useAuth();
  const [tab, setTab] = useState<Tab>("documents");
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removeModal, setRemoveModal] = useState<{ id: string; type: "document" | "post"; title: string } | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);
    const [d, p] = await Promise.all([getAdminDocuments(), getAdminPosts()]);
    setDocs(d);
    setPosts(p);
    setLoading(false);
  }

  const items = tab === "documents" ? docs : posts;
  const filtered = search
    ? items.filter((i: Record<string, unknown>) => (i.title as string)?.toLowerCase().includes(search.toLowerCase()))
    : items;

  const handleRemove = async () => {
    if (!removeModal || !admin || confirmText !== "DELETE") return;
    try {
      await removeContent(removeModal.id, removeModal.type, admin.uid, admin.displayName, removeReason);
      toast.success("Content removed");
      setRemoveModal(null);
      setRemoveReason("");
      setConfirmText("");
      loadContent();
    } catch { toast.error("Failed to remove content"); }
  };

  const handleToggleFeatured = async (id: string, type: "document" | "post", current: boolean) => {
    if (!admin) return;
    try {
      await toggleFeatured(id, type, !current, admin.uid, admin.displayName);
      toast.success(current ? "Unfeatured" : "Featured!");
      loadContent();
    } catch { toast.error("Failed to update"); }
  };

  const formatDate = (ts: { seconds?: number }) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      <div className="mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13px] text-text-disabled flex items-center gap-2 mb-2">
          Admin <span className="text-[12px]">›</span> <span className="text-text-primary">Content</span>
        </p>
        <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight">Content Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 bg-white/[0.03] border border-white/[0.07] rounded-[11px] p-1 w-fit">
        {(["documents", "posts"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all ${
              tab === t ? "bg-brand/[0.18] text-brand-light" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t === "documents" ? <FileText className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            {t === "documents" ? `Documents (${docs.length})` : `Blog Posts (${posts.length})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-[360px] mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="w-full h-[38px] pl-9 pr-3 rounded-[9px] bg-white/[0.05] border border-white/10 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-brand/50 outline-hidden transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-brand animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-text-disabled mb-3" />
            <p className="text-[15px] font-medium text-text-muted">No content found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Title", tab === "documents" ? "Type" : "Category", "Author", tab === "documents" ? "Downloads" : "Views", "Date", "Actions"].map(h => (
                    <th key={h} className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const id = item.id as string;
                  const title = (item.title as string) || "Untitled";
                  const type = tab === "documents" ? (item.contentType as string) : (item.category as string);
                  const author = (item.uploaderName || item.authorName) as string;
                  const count = tab === "documents" ? (item.downloadCount as number || 0) : (item.viewCount as number || 0);
                  const featured = item.isFeatured as boolean;

                  return (
                    <tr key={id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {tab === "documents" && (
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CONTENT_TYPE_COLORS[type] || "#94A3B8" }} />
                          )}
                          <span className="text-[13px] font-semibold text-text-primary truncate max-w-[250px]">{title}</span>
                          {featured && <Star className="w-3 h-3 text-warning fill-warning shrink-0" />}
                        </div>
                      </td>
                      <td className="p-3 text-[13px] text-text-muted capitalize">{type?.replace(/_/g, " ") || "—"}</td>
                      <td className="p-3 text-[13px] text-text-secondary">{author}</td>
                      <td className="p-3 text-[13px] text-text-muted">
                        <span className="flex items-center gap-1">
                          {tab === "documents" ? <Download className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {count.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-[13px] text-text-muted whitespace-nowrap">{formatDate(item.createdAt as { seconds?: number })}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleFeatured(id, tab === "documents" ? "document" : "post", !!featured)}
                            className={`h-7 px-2.5 rounded-[7px] text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              featured
                                ? "bg-warning/20 border border-warning/30 text-warning"
                                : "bg-warning/10 border border-warning/20 text-warning hover:bg-warning/[0.18]"
                            }`}
                          >
                            <Star className="w-3 h-3" /> {featured ? "Unfeature" : "Feature"}
                          </button>
                          <button
                            onClick={() => setRemoveModal({ id, type: tab === "documents" ? "document" : "post", title })}
                            className="h-7 px-2.5 rounded-[7px] text-[11px] font-semibold flex items-center gap-1 transition-all bg-error/[0.08] border border-error/20 text-error hover:bg-error/[0.16]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {removeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setRemoveModal(null)}
        >
          <div
            className="w-full max-w-[420px] p-8 rounded-[20px]"
            style={{ background: "#1E1E35", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "card-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-error/[0.12] border-2 border-error/30 flex items-center justify-center text-2xl mb-4 mx-auto">
              🗑
            </div>
            <h2 className="text-[18px] font-bold text-text-primary text-center mb-2">Remove Content</h2>
            <p className="text-[14px] text-text-muted text-center leading-[22px] mb-4">
              This will hide <strong className="text-text-primary">&quot;{removeModal.title}&quot;</strong> from all users.
            </p>

            <textarea
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Reason for removal..."
              className="w-full h-20 px-3.5 py-2.5 mb-4 rounded-[10px] bg-white/[0.04] border border-white/10 text-[14px] text-text-primary resize-none focus:border-error/50 outline-hidden transition-all"
            />

            <div className="p-3 rounded-[10px] mb-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-[12px] text-text-muted mb-1.5">Type <code className="text-error font-bold bg-error/[0.12] rounded px-1.5 py-0.5">DELETE</code> to confirm</p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-[14px] text-text-primary focus:border-error/50 outline-hidden"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRemoveModal(null)}
                className="flex-1 h-11 rounded-[10px] text-[14px] font-semibold text-text-muted bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={confirmText !== "DELETE"}
                className="flex-1 h-11 rounded-[10px] text-[14px] font-bold text-white bg-error disabled:bg-error/30 disabled:cursor-not-allowed hover:bg-red-600 transition-all"
              >
                Remove Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
