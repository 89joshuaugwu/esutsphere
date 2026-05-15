"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getClassAdminPending, getClassMembers } from "@/lib/admin";
import type { User } from "@/types";
import {
  ArrowLeft, Users, Clock, CheckCircle, Loader2,
  ChevronRight, Eye,
} from "lucide-react";

export default function ClassAdminOverview() {
  const { user } = useAuth();
  const [pending, setPending] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const dept = user?.classAdminDept || "";
  const level = user?.classAdminLevel || "";

  useEffect(() => {
    if (!dept || !level) return;
    async function load() {
      setLoading(true);
      const [p, m] = await Promise.all([
        getClassAdminPending(dept, level),
        getClassMembers(dept, level),
      ]);
      setPending(p);
      setMembers(m);
      setLoading(false);
    }
    load();
  }, [dept, level]);

  if (!dept || !level) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-[20px] bg-warning/10 border border-warning/20 flex items-center justify-center text-4xl mb-5">⚠️</div>
        <h2 className="text-[18px] font-semibold text-text-primary mb-2">Class Admin Not Configured</h2>
        <p className="text-[14px] text-text-disabled max-w-[320px]">Your class admin assignment is incomplete. Contact the super admin.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-5 text-[13px] font-medium text-text-muted transition-all hover:bg-white/[0.08] hover:text-text-primary group"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-[3px]" />
        Back to My Dashboard
      </Link>

      {/* Header */}
      <div className="mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
          Class Admin Panel
        </h1>
        <p className="text-[14px] text-text-muted">
          {dept} · {level} · Managing {pending.length} pending approval{pending.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Scope Banner */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl mb-6"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <span className="text-[18px] shrink-0">📋</span>
        <p className="text-[13px] text-gold-light">
          You are managing approvals for: <strong>{dept}</strong> · <strong>{level}</strong> only
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
        {[
          { label: "Class Members", value: members.length, color: "#06B6D4", rgb: "6,182,212", icon: Users },
          { label: "Pending Approvals", value: pending.length, color: "#F59E0B", rgb: "245,158,11", icon: Clock },
          { label: "Approved This Month", value: members.filter(m => {
            const ts = m.createdAt as { seconds?: number };
            if (!ts?.seconds) return false;
            const d = new Date(ts.seconds * 1000);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length, color: "#10B981", rgb: "16,185,129", icon: CheckCircle },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-[14px] p-[18px_16px] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "rgba(15,15,26,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                animation: `card-enter 0.4s ${i * 60}ms both`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: stat.color }} />
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center mb-3"
                style={{ background: `rgba(${stat.rgb},0.12)`, border: `1px solid rgba(${stat.rgb},0.2)` }}
              >
                <Icon className="w-[17px] h-[17px]" style={{ color: stat.color }} />
              </div>
              <span className="font-display text-[28px] text-text-primary block mb-1 leading-none">{stat.value}</span>
              <span className="text-[12px] font-medium text-text-muted">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Two-Column: Recent Pending + Class Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Queue Preview */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-text-primary">Pending Approvals</span>
              {pending.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}>
                  {pending.length}
                </span>
              )}
            </div>
            <Link href="/class-admin/approvals" className="text-[12px] font-semibold text-brand hover:text-brand-light transition-colors">
              See All →
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-4">✅</div>
              <p className="text-[14px] font-medium text-text-muted">No pending approvals</p>
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
                    <p className="text-[11px] text-text-muted truncate">{u.matricNumber}</p>
                  </div>
                  <Link
                    href="/class-admin/approvals"
                    className="h-7 px-2.5 rounded-[7px] text-[12px] font-medium text-text-muted flex items-center gap-1 transition-all hover:bg-white/[0.06] hover:text-text-primary shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Eye className="w-3 h-3" /> Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Class Overview Card */}
        <div className="rounded-[14px] p-5" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-[14px] font-bold text-text-primary mb-4">Class Overview</h3>
          <div className="flex gap-2.5 mb-5">
            <div className="flex-1 text-center p-3 rounded-[10px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[18px] font-bold text-text-primary block">{dept.split(" ").map(w => w[0]).join("")}</span>
              <span className="text-[11px] text-text-disabled">Department</span>
            </div>
            <div className="flex-1 text-center p-3 rounded-[10px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[18px] font-bold text-text-primary block">{level}</span>
              <span className="text-[11px] text-text-disabled">Level</span>
            </div>
            <div className="flex-1 text-center p-3 rounded-[10px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[18px] font-bold text-text-primary block">{members.length}</span>
              <span className="text-[11px] text-text-disabled">Members</span>
            </div>
          </div>

          <Link
            href="/class-admin/class"
            className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/[0.04]"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-text-muted" />
              <span className="text-[13px] font-medium text-text-secondary">View All Class Members</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-disabled" />
          </Link>
        </div>
      </div>
    </div>
  );
}
