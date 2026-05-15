"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getClassAdminPending, approveUser, rejectUser } from "@/lib/admin";
import type { User } from "@/types";
import {
  ArrowLeft, Check, X, FileText, Clock, Loader2, Search,
} from "lucide-react";
import toast from "react-hot-toast";

const REJECTION_REASONS = [
  "Document unreadable — please resubmit with a clearer photo",
  "Incorrect document — please upload your ESUT admission letter",
  "Matric number does not match document",
  "Duplicate account detected",
];

export default function ClassAdminApprovalsPage() {
  const { user: admin } = useAuth();
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const dept = admin?.classAdminDept || "";
  const level = admin?.classAdminLevel || "";

  useEffect(() => {
    if (!dept || !level) return;
    loadPending();
  }, [dept, level]);

  async function loadPending() {
    setLoading(true);
    const p = await getClassAdminPending(dept, level);
    setPending(p);
    setLoading(false);
  }

  const filtered = searchQuery
    ? pending.filter(u =>
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.matricNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pending;

  const handleApprove = async (u: User) => {
    if (!admin) return;
    setProcessing(u.uid);
    try {
      await approveUser(u.uid, admin.uid, admin.displayName, "class_admin");
      toast.success(`${u.displayName} approved!`);
      setPending(prev => prev.filter(p => p.uid !== u.uid));
    } catch {
      toast.error("Failed to approve");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !admin) return;
    const reason = rejectReason === "custom" ? customReason : rejectReason;
    if (!reason) { toast.error("Select a reason"); return; }
    setProcessing(rejectModal.uid);
    try {
      await rejectUser(rejectModal.uid, reason, admin.uid, admin.displayName, "class_admin");
      toast.success(`${rejectModal.displayName} rejected`);
      setPending(prev => prev.filter(p => p.uid !== rejectModal.uid));
      setRejectModal(null);
      setRejectReason("");
      setCustomReason("");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (ts: { seconds?: number }) => {
    if (!ts?.seconds) return "—";
    const diff = Date.now() - ts.seconds * 1000;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      <Link
        href="/class-admin"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-5 text-[13px] font-medium text-text-muted transition-all hover:bg-white/[0.08] hover:text-text-primary group"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-[3px]" />
        Back to Class Admin
      </Link>

      <div className="mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
          Pending Approvals
        </h1>
        <p className="text-[14px] text-text-muted">{pending.length} student{pending.length !== 1 ? "s" : ""} awaiting your verification</p>
      </div>

      {/* Scope Banner */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl mb-5"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <span className="text-[18px] shrink-0">📋</span>
        <p className="text-[13px] text-gold-light">
          You are managing approvals for: <strong>{dept}</strong> · <strong>{level}</strong> only
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-[360px] mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or matric..."
          className="w-full h-[38px] pl-9 pr-3 rounded-[9px] bg-white/[0.05] border border-white/10 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-brand/50 outline-hidden transition-all"
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-[20px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-4xl mb-5">✅</div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">All caught up!</h2>
          <p className="text-[14px] text-text-disabled max-w-[300px]">No pending approvals for {dept} · {level}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u, i) => (
            <div
              key={u.uid}
              className="rounded-2xl p-5 transition-all hover:border-white/[0.12]"
              style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.08)", animation: `card-enter 0.35s ${i * 40}ms both` }}
            >
              <div className="flex items-start gap-3.5 mb-4">
                <img
                  src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || u.uid}`}
                  alt={u.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text-primary mb-0.5">{u.displayName}</p>
                  <p className="text-[13px] text-text-muted mb-1.5">@{u.username}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-cyan/10 text-cyan border border-cyan/20">{u.department}</span>
                    <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full bg-brand/10 text-brand-light border border-brand/20">{u.currentLevel}</span>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-[3px] rounded-full bg-white/[0.04] text-text-disabled border border-white/[0.08] shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(u.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-[0.5px] mb-1">Matric</p>
                  <p className="text-[13px] font-semibold text-text-primary font-mono">{u.matricNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-[0.5px] mb-1">Faculty</p>
                  <p className="text-[13px] font-semibold text-text-primary">{u.faculty}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-disabled uppercase tracking-[0.5px] mb-1">Entry</p>
                  <p className="text-[13px] font-semibold text-text-primary">{u.yearOfEntry}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {u.admissionLetterUrl && (
                  <a href={u.admissionLetterUrl} target="_blank" rel="noreferrer" className="h-[34px] px-3.5 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all bg-white/[0.05] border border-white/10 text-text-muted hover:bg-white/[0.09] hover:text-text-primary">
                    <FileText className="w-3.5 h-3.5" /> View Document
                  </a>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => { setRejectModal(u); setRejectReason(""); setCustomReason(""); }}
                  disabled={processing === u.uid}
                  className="flex-1 max-w-[180px] h-10 rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-2 transition-all bg-error/[0.08] border border-error/25 text-error hover:bg-error/[0.16] disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(u)}
                  disabled={processing === u.uid}
                  className="flex-1 max-w-[180px] h-10 rounded-[10px] text-[14px] font-bold flex items-center justify-center gap-2 transition-all bg-success/[0.12] border border-success/30 text-success hover:bg-success/[0.22] hover:-translate-y-[1px] disabled:opacity-50"
                >
                  {processing === u.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Approve</>}
                </button>
              </div>
              <p className="text-[11px] text-text-disabled text-center mt-2">The student will be notified by email</p>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(8px)" }} onClick={() => setRejectModal(null)}>
          <div className="w-full max-w-[440px] p-8 rounded-[20px]" style={{ background: "#1E1E35", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "card-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[18px] font-bold text-text-primary mb-4">Reject Application</h2>
            <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <img src={rejectModal.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rejectModal.username}`} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-[14px] font-semibold text-text-primary">{rejectModal.displayName}</p>
                <p className="text-[12px] text-text-muted">{rejectModal.matricNumber}</p>
              </div>
            </div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Reason</label>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full h-11 px-3.5 mb-3 rounded-[10px] bg-white/[0.04] border border-white/10 text-[14px] text-text-primary focus:border-error/50 outline-hidden transition-all">
              <option value="">Select a reason...</option>
              {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              <option value="custom">Custom reason...</option>
            </select>
            {rejectReason === "custom" && (
              <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Enter reason..." className="w-full h-20 px-3.5 py-2.5 mb-4 rounded-[10px] bg-white/[0.04] border border-white/10 text-[14px] text-text-primary resize-none focus:border-error/50 outline-hidden transition-all" />
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 h-11 rounded-[10px] text-[14px] font-semibold text-text-muted bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">Cancel</button>
              <button onClick={handleReject} disabled={processing === rejectModal.uid || (!rejectReason || (rejectReason === "custom" && !customReason))} className="flex-1 h-11 rounded-[10px] text-[14px] font-bold text-error bg-error/15 border border-error/35 hover:bg-error/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {processing === rejectModal.uid ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
