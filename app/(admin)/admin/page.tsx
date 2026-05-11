"use client";
import { Users, FileText, Flag, ShieldCheck } from "lucide-react";

export default function SuperAdminPage() {
  const stats = [
    { label: "Total Users", value: "1,245", icon: Users, color: "text-brand" },
    { label: "Total Documents", value: "842", icon: FileText, color: "text-cyan" },
    { label: "Reported Content", value: "12", icon: Flag, color: "text-danger" },
    { label: "Class Admins", value: "45", icon: ShieldCheck, color: "text-success" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-4xl text-text-primary mb-2">Super Admin Dashboard</h1>
        <p className="text-text-secondary">Overview of platform health, users, and content moderation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#16162A] border border-white/10 rounded-[20px] p-6 flex items-center gap-5 shadow-lg">
            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-text-muted mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#16162A] border border-white/10 rounded-[20px] p-8 shadow-2xl">
          <h2 className="font-display text-2xl text-text-primary mb-6 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-success" />
            Assign Class Admin
          </h2>
          <form className="space-y-5" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Student Username</label>
              <input type="text" placeholder="@johndoe" className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-white outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Department</label>
                <select className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg h-11 px-4 text-white outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10">
                  <option>Computer Science</option>
                  <option>Architecture</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Level</label>
                <select className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg h-11 px-4 text-white outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10">
                  <option>100L</option>
                  <option>200L</option>
                  <option>300L</option>
                  <option>400L</option>
                </select>
              </div>
            </div>
            <button className="w-full h-11 mt-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              Grant Admin Role
            </button>
          </form>
        </div>

        <div className="bg-[#16162A] border border-white/10 rounded-[20px] p-8 shadow-2xl">
          <h2 className="font-display text-2xl text-text-primary mb-6 flex items-center gap-3">
            <Flag className="w-6 h-6 text-warning" /> 
            Moderation Queue
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-danger/5 border border-danger/20 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-text-primary text-lg">"How to hack the school portal"</h3>
                <span className="text-[10px] bg-danger/20 text-danger px-2 py-1 rounded font-bold uppercase tracking-wider">Reported 5x</span>
              </div>
              <p className="text-sm text-text-secondary mb-4 leading-relaxed">Reported for: Violation of academic integrity and dangerous content.</p>
              <div className="flex gap-3">
                <button className="px-5 py-2 bg-danger text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-danger/20">Delete Post</button>
                <button className="px-5 py-2 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors">Dismiss</button>
              </div>
            </div>
            
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center flex flex-col items-center">
              <ShieldCheck className="w-8 h-8 text-success/50 mb-2" />
              <p className="text-text-muted text-sm font-medium">The moderation queue is currently empty.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
