"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getClassMembers } from "@/lib/admin";
import type { User } from "@/types";
import {
  ArrowLeft, Users, Search, Download, Upload, Loader2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ClassMembersPage() {
  const { user: admin } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const dept = admin?.classAdminDept || "";
  const level = admin?.classAdminLevel || "";

  useEffect(() => {
    if (!dept || !level) return;
    async function load() {
      setLoading(true);
      const m = await getClassMembers(dept, level);
      setMembers(m);
      setLoading(false);
    }
    load();
  }, [dept, level]);

  const filtered = search
    ? members.filter(m =>
        m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        m.matricNumber?.toLowerCase().includes(search.toLowerCase()) ||
        m.username?.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  const handleExportCSV = () => {
    const csv = [
      "Name,Username,Matric Number,Level,Points,Joined",
      ...members.map(m => {
        const date = m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleDateString() : "—";
        return `"${m.displayName}","@${m.username}","${m.matricNumber}","${m.currentLevel}","${m.points}","${date}"`;
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dept.replace(/\s+/g, "_")}_${level}_members.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Class list exported!");
  };

  const formatDate = (ts: { seconds?: number }) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
            My Class
          </h1>
          <p className="text-[14px] text-text-muted">
            {dept} · {level} · {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2.5 mt-3 sm:mt-0">
          <button
            onClick={handleExportCSV}
            className="h-[38px] px-3.5 rounded-full text-[13px] font-medium flex items-center gap-2 transition-all hover:bg-white/[0.09] hover:text-text-primary"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#94A3B8" }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-[360px] mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or matric..."
          className="w-full h-[38px] pl-9 pr-3 rounded-[9px] bg-white/[0.05] border border-white/10 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-brand/50 outline-hidden transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-brand animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-text-disabled mb-3" />
            <p className="text-[15px] font-medium text-text-muted">{search ? "No matching members" : "No members yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="p-3 pl-5 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px] w-12">#</th>
                  <th className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px]">Student</th>
                  <th className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px]">Matric</th>
                  <th className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px]">Status</th>
                  <th className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px]">Joined</th>
                  <th className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px]">Points</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr
                    key={m.uid}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="p-3 pl-5 text-[13px] text-text-disabled">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username || m.uid}`}
                          alt={m.displayName}
                          className="w-[34px] h-[34px] rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <Link href={`/profile/${m.username}`} className="text-[13px] font-semibold text-text-primary truncate hover:text-brand-light transition-colors">
                            {m.displayName}
                          </Link>
                          <p className="text-[11px] text-text-disabled truncate">@{m.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[12px] font-mono text-text-muted tracking-[0.3px]">{m.matricNumber}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-[3px] rounded-full inline-flex items-center gap-1.5 text-success bg-success/10 border border-success/20">
                        <span className="w-[5px] h-[5px] rounded-full bg-current" />
                        Approved
                      </span>
                    </td>
                    <td className="p-3 text-[13px] text-text-muted whitespace-nowrap">{formatDate(m.createdAt)}</td>
                    <td className="p-3">
                      <span className="text-[13px] font-semibold text-brand-light flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {m.points?.toLocaleString() || "0"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
