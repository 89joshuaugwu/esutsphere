"use client";
import { useState } from "react";
import { Check, X, ShieldAlert, User, FileText } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_PENDING = [
  { id: "u1", name: "John Smith", matric: "2022/249671/CS", dept: "Computer Science", level: "400L", admissionLetter: "#" },
  { id: "u2", name: "Sarah Connor", matric: "2023/250111/CS", dept: "Computer Science", level: "300L", admissionLetter: "#" }
];

export default function ClassAdminPage() {
  const [pendingUsers, setPendingUsers] = useState(MOCK_PENDING);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setPendingUsers(prev => prev.filter(u => u.id !== id));
    toast.success(`Student ${action}d successfully`);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
          <ShieldAlert className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-text-primary">Pending Approvals</h1>
          <p className="text-text-secondary mt-1">Verify and approve students in your department.</p>
        </div>
      </div>

      <div className="bg-[#16162A] border border-white/10 rounded-[20px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-sm font-semibold text-text-secondary uppercase tracking-wider">
                <th className="p-5">Student</th>
                <th className="p-5">Matric No</th>
                <th className="p-5">Level</th>
                <th className="p-5">Admission Letter</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-text-muted">No pending approvals at the moment.</td></tr>
              ) : pendingUsers.map(user => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bg-surface-3 flex items-center justify-center border border-white/10">
                        <User className="w-5 h-5 text-text-muted" />
                      </div>
                      <span className="font-medium text-text-primary">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-5 font-mono text-sm text-text-secondary">{user.matric}</td>
                  <td className="p-5">
                    <span className="px-2.5 py-1 rounded-md bg-brand/10 text-brand-light text-xs font-bold border border-brand/20">
                      {user.level}
                    </span>
                  </td>
                  <td className="p-5">
                    <a href={user.admissionLetter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan hover:text-cyan/80 transition-colors text-sm font-medium">
                      <FileText className="w-4 h-4" /> View File
                    </a>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handleAction(user.id, 'reject')} className="w-9 h-9 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger flex items-center justify-center transition-colors" title="Reject">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleAction(user.id, 'approve')} className="w-9 h-9 rounded-lg bg-success/10 hover:bg-success/20 text-success flex items-center justify-center transition-colors" title="Approve">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
