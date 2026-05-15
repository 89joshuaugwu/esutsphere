"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getReports, resolveReport, removeContent } from "@/lib/admin";
import {
  AlertTriangle, Check, X, Eye, Trash2, Loader2,
  MessageSquare, FileText, User, Flag,
} from "lucide-react";
import toast from "react-hot-toast";

const REPORT_TYPE_STYLES: Record<string, string> = {
  spam: "bg-warning/[0.12] text-warning border border-warning/25",
  wrong_info: "bg-cyan/[0.12] text-cyan border border-cyan/25",
  inappropriate: "bg-error/[0.12] text-error border border-error/25",
  copyright: "bg-brand/[0.12] text-brand-light border border-brand/25",
  other: "bg-white/[0.06] text-text-muted border border-white/10",
};

const TARGET_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="w-5 h-5" />,
  post: <MessageSquare className="w-5 h-5" />,
  comment: <MessageSquare className="w-4 h-4" />,
  user: <User className="w-5 h-5" />,
};

type StatusFilter = "pending" | "resolved" | "dismissed";

export default function ReportsPage() {
  const { user: admin } = useAuth();
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  async function loadReports() {
    setLoading(true);
    const r = await getReports(statusFilter);
    setReports(r);
    setLoading(false);
  }

  const handleResolve = async (reportId: string, targetId: string, targetType: string) => {
    if (!admin) return;
    setProcessing(reportId);
    try {
      // Remove the content
      if (targetType === "document" || targetType === "post") {
        await removeContent(targetId, targetType as "document" | "post", admin.uid, admin.displayName, "Removed due to report");
      }
      await resolveReport(reportId, "resolved", admin.uid, admin.displayName);
      toast.success("Report resolved — content removed");
      loadReports();
    } catch {
      toast.error("Failed to resolve report");
    } finally {
      setProcessing(null);
    }
  };

  const handleDismiss = async (reportId: string) => {
    if (!admin) return;
    setProcessing(reportId);
    try {
      await resolveReport(reportId, "dismissed", admin.uid, admin.displayName);
      toast.success("Report dismissed");
      loadReports();
    } catch {
      toast.error("Failed to dismiss report");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (ts: { seconds?: number }) => {
    if (!ts?.seconds) return "—";
    const d = new Date(ts.seconds * 1000);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      {/* Header */}
      <div className="mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13px] text-text-disabled flex items-center gap-2 mb-2">
          Admin <span className="text-[12px]">›</span> <span className="text-text-primary">Reports</span>
        </p>
        <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
          Reports Queue
        </h1>
        <p className="text-[14px] text-text-muted">
          {statusFilter === "pending" ? `${reports.length} pending report${reports.length !== 1 ? "s" : ""}` : `${reports.length} ${statusFilter} report${reports.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-[11px] p-1 w-fit">
        {(["pending", "resolved", "dismissed"] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold capitalize transition-all ${
              statusFilter === s ? "bg-brand/[0.18] text-brand-light" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Reports */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-[20px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-4xl mb-5">
            {statusFilter === "pending" ? "🛡️" : "📋"}
          </div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            {statusFilter === "pending" ? "No pending reports" : `No ${statusFilter} reports`}
          </h2>
          <p className="text-[14px] text-text-disabled max-w-[300px]">
            {statusFilter === "pending" ? "The community is in good shape!" : "Check the pending tab for new reports."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, i) => {
            const id = report.id as string;
            const reason = (report.reason as string) || "other";
            const targetType = (report.targetType as string) || "document";
            const targetId = (report.targetId as string) || "";
            const details = (report.details as string) || "";
            const status = (report.status as string) || "pending";

            return (
              <div
                key={id}
                className={`relative rounded-[14px] p-[18px] transition-all ${
                  status === "dismissed" ? "opacity-60" : ""
                }`}
                style={{
                  background: "rgba(15,15,26,0.8)",
                  border: `1px solid ${status === "resolved" ? "rgba(16,185,129,0.15)" : status === "dismissed" ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.15)"}`,
                  animation: `card-enter 0.35s ${i * 40}ms both`,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-bold uppercase tracking-[0.5px] px-2.5 py-1 rounded-full ${REPORT_TYPE_STYLES[reason] || REPORT_TYPE_STYLES.other}`}>
                      {reason.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-medium text-text-disabled capitalize px-2 py-0.5 rounded bg-white/[0.04]">
                      {targetType}
                    </span>
                  </div>
                  <span className="text-[12px] text-text-disabled">{formatDate(report.createdAt as { seconds?: number })}</span>
                </div>

                {/* Content Preview */}
                <div
                  className="flex gap-3 items-start p-3 rounded-[10px] mb-3.5 cursor-pointer transition-colors hover:border-white/[0.12]"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-text-muted shrink-0 mt-0.5">
                    {TARGET_ICONS[targetType] || <Flag className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary mb-1">Reported {targetType}</p>
                    <p className="text-[12px] text-text-muted">ID: {targetId?.slice(0, 20)}...</p>
                  </div>
                </div>

                {/* Details */}
                {details && (
                  <div className="text-[13px] text-text-muted leading-5 p-2.5 rounded-lg bg-white/[0.02] mb-3.5">
                    &quot;{details}&quot;
                  </div>
                )}

                {/* Actions */}
                {status === "pending" && (
                  <div className="flex gap-2.5 items-center">
                    <button
                      onClick={() => handleResolve(id, targetId, targetType)}
                      disabled={processing === id}
                      className="flex-1 h-[38px] rounded-[9px] text-[13px] font-bold flex items-center justify-center gap-2 transition-all bg-error/[0.12] border border-error/25 text-error hover:bg-error/[0.22]"
                    >
                      {processing === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5" /> Remove Content</>}
                    </button>
                    <button
                      onClick={() => handleDismiss(id)}
                      disabled={processing === id}
                      className="h-[38px] px-4 rounded-[9px] text-[13px] font-medium flex items-center gap-2 transition-all bg-transparent border border-white/[0.08] text-text-muted hover:bg-white/[0.05] hover:text-text-primary"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
