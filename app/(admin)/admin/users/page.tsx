"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAdminUsers, assignClassAdmin, suspendUser } from "@/lib/admin";
import { DEPARTMENTS } from "@/constants/departments";
import type { User } from "@/types";
import {
  Search, ChevronDown, Users, Shield, Eye, Star,
  Ban, X, Check, Loader2, Crown,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const LEVELS = ["100L", "200L", "300L", "400L", "500L", "600L", "PG"];
const ROLES = [
  { value: "", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "lecturer", label: "Lecturer" },
  { value: "class_admin", label: "Class Admin" },
  { value: "pending", label: "Pending" },
];
const STATUSES = [
  { value: "", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const ROLE_STYLES: Record<string, string> = {
  student: "bg-brand/[0.12] text-brand-light border border-brand/25",
  lecturer: "bg-cyan/[0.12] text-cyan border border-cyan/25",
  class_admin: "bg-warning/[0.12] text-warning border border-warning/25",
  super_admin: "bg-pink-500/[0.12] text-pink-400 border border-pink-500/25",
  pending: "bg-white/[0.06] text-text-muted border border-white/10",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "text-success bg-success/10 border border-success/20",
  pending: "text-warning bg-warning/10 border border-warning/20",
  rejected: "text-error bg-error/10 border border-error/20",
};

export default function UsersPage() {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignModal, setAssignModal] = useState<User | null>(null);
  const [assignDept, setAssignDept] = useState("");
  const [assignLevel, setAssignLevel] = useState("");
  const [assigning, setAssigning] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await getAdminUsers({
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      dept: deptFilter || undefined,
    });
    setUsers(res.users);
    setLoading(false);
  }, [roleFilter, statusFilter, deptFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = search
    ? users.filter(u =>
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.matricNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const toggleSelect = (uid: string) => {
    const s = new Set(selected);
    s.has(uid) ? s.delete(uid) : s.add(uid);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(u => u.uid)));
  };

  const handleAssignClassAdmin = async () => {
    if (!assignModal || !assignDept || !assignLevel || !admin) return;
    setAssigning(true);
    try {
      await assignClassAdmin(assignModal.uid, assignDept, assignLevel, admin.uid, admin.displayName);
      toast.success(`${assignModal.displayName} is now Class Admin for ${assignDept} · ${assignLevel}`);
      setAssignModal(null);
      loadUsers();
    } catch (e) {
      toast.error("Failed to assign class admin");
    } finally {
      setAssigning(false);
    }
  };

  const handleSuspend = async (u: User) => {
    if (!admin) return;
    const reason = prompt(`Reason for suspending ${u.displayName}:`);
    if (!reason) return;
    try {
      await suspendUser(u.uid, reason, admin.uid, admin.displayName);
      toast.success(`${u.displayName} has been suspended`);
      loadUsers();
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const formatDate = (ts: { seconds?: number }) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <p className="text-[13px] text-text-disabled flex items-center gap-2 mb-2">
            Admin <span className="text-[12px]">›</span> <span className="text-text-primary">Users</span>
          </p>
          <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
            User Management
          </h1>
          <p className="text-[14px] text-text-muted">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-2.5 flex-wrap mb-5 p-3.5"
        style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px" }}
      >
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-disabled" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username, email, matric..."
            className="w-full h-[38px] pl-9 pr-3 rounded-[9px] bg-white/[0.05] border border-white/10 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10 outline-hidden transition-all"
          />
        </div>
        {[
          { val: roleFilter, set: setRoleFilter, opts: ROLES },
          { val: statusFilter, set: setStatusFilter, opts: STATUSES },
        ].map((f, i) => (
          <select
            key={i}
            value={f.val}
            onChange={(e) => f.set(e.target.value)}
            className="h-[38px] px-3 pr-8 rounded-[9px] bg-white/[0.05] border border-white/10 text-[13px] text-text-secondary appearance-none cursor-pointer focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10 outline-hidden transition-all"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
            }}
          >
            {f.opts.map(o => (
              <option key={o.value} value={o.value} className="bg-bg-surface-3">{o.label}</option>
            ))}
          </select>
        ))}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-[38px] px-3 pr-8 rounded-[9px] bg-white/[0.05] border border-white/10 text-[13px] text-text-secondary appearance-none cursor-pointer focus:border-brand/50 outline-hidden transition-all hidden lg:block"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
          }}
        >
          <option value="" className="bg-bg-surface-3">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d.name} value={d.name} className="bg-bg-surface-3">{d.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-brand animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-text-disabled mb-3" />
            <p className="text-[15px] font-medium text-text-muted">No users found</p>
            <p className="text-[12px] text-text-disabled mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="w-11 text-center p-3 pl-4">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-brand cursor-pointer"
                    />
                  </th>
                  {["User", "Role", "Department", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="p-3 text-left text-[11px] font-bold text-text-disabled uppercase tracking-[0.7px] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.uid}
                    className={`transition-colors hover:bg-white/[0.02] ${selected.has(u.uid) ? "bg-brand/[0.06]" : ""}`}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="p-3 pl-4 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(u.uid)}
                        onChange={() => toggleSelect(u.uid)}
                        className="w-4 h-4 rounded accent-brand cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || u.uid}`}
                          alt={u.displayName}
                          className="w-[34px] h-[34px] rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-text-primary truncate">{u.displayName}</p>
                          <p className="text-[11px] text-text-disabled truncate">@{u.username} · {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full inline-flex items-center gap-1 ${ROLE_STYLES[u.role] || ROLE_STYLES.pending}`}>
                        {u.role === "class_admin" ? "Class Admin" : u.role === "super_admin" ? "Super Admin" : u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="text-[13px] text-text-secondary truncate max-w-[160px]">{u.department}</p>
                      <p className="text-[11px] text-text-disabled">{u.currentLevel}</p>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-[3px] rounded-full inline-flex items-center gap-1.5 ${STATUS_STYLES[u.approvalStatus] || STATUS_STYLES.pending}`}>
                        <span className="w-[5px] h-[5px] rounded-full bg-current" />
                        {u.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3 text-[13px] text-text-muted whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                        <Link
                          href={`/profile/${u.username}`}
                          className="h-7 px-2.5 rounded-[7px] text-[11px] font-semibold flex items-center gap-1 transition-all bg-white/[0.05] border border-white/[0.08] text-text-muted hover:bg-white/10 hover:text-text-primary"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                        {u.role === "student" && u.approvalStatus === "approved" && (
                          <button
                            onClick={() => { setAssignModal(u); setAssignDept(u.department); setAssignLevel(u.currentLevel); }}
                            className="h-7 px-2.5 rounded-[7px] text-[11px] font-semibold flex items-center gap-1 transition-all bg-warning/10 border border-warning/20 text-warning hover:bg-warning/[0.18]"
                          >
                            <Crown className="w-3 h-3" /> Promote
                          </button>
                        )}
                        {u.role !== "super_admin" && u.approvalStatus === "approved" && (
                          <button
                            onClick={() => handleSuspend(u)}
                            className="h-7 px-2.5 rounded-[7px] text-[11px] font-semibold flex items-center gap-1 transition-all bg-error/[0.08] border border-error/20 text-error hover:bg-error/[0.16]"
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-[14px]"
          style={{
            background: "rgba(22,22,42,0.97)",
            border: "1px solid rgba(124,58,237,0.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            animation: "card-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <span className="text-[14px] font-bold text-brand-light bg-brand/15 rounded-full px-3 py-1">
            {selected.size} selected
          </span>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[13px] text-text-disabled hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Assign Class Admin Modal */}
      {assignModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setAssignModal(null)}
        >
          <div
            className="w-full max-w-[460px] p-8 rounded-[20px]"
            style={{
              background: "#1E1E35",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              animation: "card-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[18px] font-bold text-text-primary mb-1.5">Assign as Class Admin</h2>
            <p className="text-[13px] text-text-muted mb-5">This user will be able to approve students in the assigned department and level.</p>

            {/* User Row */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl mb-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <img
                src={assignModal.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignModal.username}`}
                alt={assignModal.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[14px] font-semibold text-text-primary">{assignModal.displayName}</p>
                <p className="text-[12px] text-text-muted">@{assignModal.username} · {assignModal.department}</p>
              </div>
            </div>

            {/* Dept Select */}
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Department</label>
            <select
              value={assignDept}
              onChange={(e) => setAssignDept(e.target.value)}
              className="w-full h-11 px-3.5 mb-4 rounded-[10px] bg-white/[0.04] border border-white/10 text-[14px] text-text-primary focus:border-brand/50 outline-hidden transition-all"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>

            {/* Level Select */}
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Level</label>
            <select
              value={assignLevel}
              onChange={(e) => setAssignLevel(e.target.value)}
              className="w-full h-11 px-3.5 mb-6 rounded-[10px] bg-white/[0.04] border border-white/10 text-[14px] text-text-primary focus:border-brand/50 outline-hidden transition-all"
            >
              <option value="">Select level</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 h-11 rounded-[10px] text-[14px] font-semibold text-text-muted bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignClassAdmin}
                disabled={!assignDept || !assignLevel || assigning}
                className="flex-1 h-11 rounded-[10px] text-[14px] font-bold text-bg-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
              >
                {assigning ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Assign Class Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
