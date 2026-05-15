"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, Zap, Clock, FileText, AlertTriangle,
  TrendingUp, TrendingDown, Check, Eye, ChevronRight,
  Loader2,
} from "lucide-react";
import { getAdminStats, getAllPendingUsers, getRecentAdminLogs } from "@/lib/admin";
import type { User } from "@/types";

interface Stats {
  totalUsers: number;
  pendingApprovals: number;
  totalDocuments: number;
  totalPosts: number;
  pendingReports: number;
}

const STAT_CARDS = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "#7C3AED", rgb: "124,58,237" },
  { key: "totalDocuments", label: "Total Documents", icon: FileText, color: "#06B6D4", rgb: "6,182,212" },
  { key: "pendingApprovals", label: "Pending Approvals", icon: Clock, color: "#F59E0B", rgb: "245,158,11" },
  { key: "totalPosts", label: "Blog Posts", icon: Zap, color: "#10B981", rgb: "16,185,129" },
  { key: "pendingReports", label: "Reported Content", icon: AlertTriangle, color: "#EF4444", rgb: "239,68,68" },
];

export default function SuperAdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<User[]>([]);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [s, p, l] = await Promise.all([
        getAdminStats(),
        getAllPendingUsers(),
        getRecentAdminLogs(10),
      ]);
      setStats(s);
      setPending(p.users);
      setLogs(l);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      {/* Header */}
      <div className="mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
          Admin Overview
        </h1>
        <p className="text-[14px] text-text-muted">
          Platform Command Center · Welcome back, {user?.displayName?.split(" ")[0] || "Admin"}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-7">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          const value = stats ? stats[card.key as keyof Stats] : 0;
          return (
            <div
              key={card.key}
              className="relative overflow-hidden rounded-[14px] p-[18px_16px] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]"
              style={{
                background: "rgba(15,15,26,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                animation: `card-enter 0.4s ${i * 60}ms both`,
              }}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: card.color }} />
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center mb-3"
                style={{
                  background: `rgba(${card.rgb},0.12)`,
                  border: `1px solid rgba(${card.rgb},0.2)`,
                }}
              >
                <Icon className="w-[17px] h-[17px]" style={{ color: card.color }} />
              </div>
              <span className="font-display text-[28px] text-text-primary block mb-1 leading-none">
                {value.toLocaleString()}
              </span>
              <span className="text-[12px] font-medium text-text-muted">{card.label}</span>
            </div>
          );
        })}
      </div>

      {/* Two-Column: Pending + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Approvals Widget */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-text-primary">Pending Approvals</span>
              {pending.length > 0 && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  {pending.length}
                </span>
              )}
            </div>
            <Link href="/admin/approvals" className="text-[12px] font-semibold text-brand hover:text-brand-light transition-colors">
              See All →
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-4">
                ✅
              </div>
              <p className="text-[14px] font-medium text-text-muted">No pending approvals</p>
              <p className="text-[12px] text-text-disabled mt-1">All caught up!</p>
            </div>
          ) : (
            <div>
              {pending.slice(0, 5).map((u) => (
                <div
                  key={u.uid}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <img
                    src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || u.uid}`}
                    alt={u.displayName}
                    className="w-[34px] h-[34px] rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{u.displayName}</p>
                    <p className="text-[11px] text-text-muted truncate">{u.department} · {u.currentLevel}</p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.4px] px-[7px] py-[2px] rounded-full shrink-0"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#A855F7", border: "1px solid rgba(124,58,237,0.25)" }}
                  >
                    Student
                  </span>
                  <Link
                    href="/admin/approvals"
                    className="h-7 px-2.5 rounded-[7px] text-[12px] font-medium text-text-muted flex items-center gap-1 transition-all hover:bg-white/[0.06] hover:text-text-primary shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Eye className="w-3 h-3" /> View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log Widget */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[14px] font-bold text-text-primary">Recent Activity</span>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-4">
                📋
              </div>
              <p className="text-[14px] font-medium text-text-muted">No recent activity</p>
              <p className="text-[12px] text-text-disabled mt-1">Admin actions will appear here</p>
            </div>
          ) : (
            <div>
              {logs.slice(0, 8).map((log, i) => {
                const action = log.action as string;
                const iconConfig = action.includes("approve") ? { bg: "rgba(16,185,129,0.12)", color: "#10B981", icon: "✓" }
                  : action.includes("reject") ? { bg: "rgba(239,68,68,0.10)", color: "#EF4444", icon: "✗" }
                  : action.includes("assign") ? { bg: "rgba(124,58,237,0.12)", color: "#A855F7", icon: "⚡" }
                  : action.includes("remove") ? { bg: "rgba(239,68,68,0.10)", color: "#EF4444", icon: "🗑" }
                  : { bg: "rgba(6,182,212,0.10)", color: "#06B6D4", icon: "📝" };

                return (
                  <div
                    key={`log-${i}`}
                    className="flex items-start gap-3 px-5 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] shrink-0 mt-0.5"
                      style={{ background: iconConfig.bg, color: iconConfig.color }}
                    >
                      {iconConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-text-secondary leading-5">
                        <strong className="text-text-primary">{(log.adminName as string) || "Admin"}</strong>{" "}
                        {action.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="text-[11px] text-text-disabled shrink-0">
                      {log.timestamp ? "Just now" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Link
          href="/admin/approvals"
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <Clock className="w-5 h-5 text-warning shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-primary">Review Approvals</p>
            <p className="text-[11px] text-text-muted">{stats?.pendingApprovals || 0} students waiting</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-disabled" />
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}
        >
          <Users className="w-5 h-5 text-brand-light shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-primary">Manage Users</p>
            <p className="text-[11px] text-text-muted">{stats?.totalUsers || 0} registered users</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-disabled" />
        </Link>
        <Link
          href="/admin/reports"
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
          style={{ background: stats?.pendingReports ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)", border: stats?.pendingReports ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(255,255,255,0.07)" }}
        >
          <AlertTriangle className={`w-5 h-5 shrink-0 ${stats?.pendingReports ? "text-error" : "text-text-disabled"}`} />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-primary">Reports Queue</p>
            <p className="text-[11px] text-text-muted">{stats?.pendingReports || 0} pending reports</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-disabled" />
        </Link>
      </div>
    </div>
  );
}
