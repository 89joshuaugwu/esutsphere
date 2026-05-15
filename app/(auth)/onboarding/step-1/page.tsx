"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, OnboardingRole } from "@/components/onboarding/OnboardingContext";
import { DEPARTMENTS, getFacultyForDepartment, LEVELS, QUALIFICATIONS, generateAcademicSessions } from "@/constants/departments";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const MATRIC_REGEX = /^\d{4}\/\d{6}\/[A-Z]{2,6}$/;
const SESSIONS = generateAcademicSessions();

function calculateLevel(yearOfEntry: string): string {
  const entryYear = parseInt(yearOfEntry.split("/")[0]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const academicYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const yearsInSchool = academicYear - entryYear + 1;
  if (yearsInSchool <= 0) return "100L";
  if (yearsInSchool >= 6) return "600L";
  return `${yearsInSchool * 100}L`;
}

export default function Step1Page() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();

  // Role
  const [role, setRole] = useState<OnboardingRole>(data.role);
  // Student fields
  const [matric, setMatric] = useState(data.matricNumber);
  const [dept, setDept] = useState(data.department);
  const [faculty, setFaculty] = useState(data.faculty);
  const [year, setYear] = useState(data.yearOfEntry);
  // Lecturer fields
  const [staffId, setStaffId] = useState(data.staffId);
  const [qualification, setQualification] = useState(data.qualification);

  const matricValid = matric ? MATRIC_REGEX.test(matric.toUpperCase()) : null;
  const level = year ? calculateLevel(year) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "student") {
      if (!MATRIC_REGEX.test(matric.toUpperCase())) {
        toast.error("Invalid Matric Number format (e.g. 2022/249671/CS)");
        return;
      }
      if (!dept || !year) {
        toast.error("Please fill all required fields.");
        return;
      }
      updateData({
        role,
        matricNumber: matric.toUpperCase(),
        department: dept,
        faculty,
        yearOfEntry: year,
      });
    } else {
      if (!staffId || !dept || !qualification) {
        toast.error("Please fill all required fields.");
        return;
      }
      updateData({
        role,
        staffId,
        department: dept,
        faculty,
        qualification,
      });
    }
    router.push("/onboarding/step-2");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative z-10 px-4 py-10"
      style={{
        background: "#080810",
        backgroundImage: "radial-gradient(ellipse 70% 50% at 15% 15%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(6,182,212,0.08) 0%, transparent 55%)",
      }}
    >
      <div
        className="w-full max-w-[540px] bg-[rgba(22,22,42,0.90)] border border-white/10 rounded-3xl p-8 md:p-10"
        style={{ backdropFilter: "blur(20px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <img src="/logo.png" alt="ESUTSphere" className="w-8 h-8 rounded-full" />
          <span className="text-base font-bold text-text-primary">ESUTSphere</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1.5 mb-8">
          <div className="h-1 w-12 rounded-full bg-[linear-gradient(90deg,#7C3AED,#A855F7)]" />
          <div className="h-1 w-6 rounded-full bg-white/[0.12]" />
          <div className="h-1 w-6 rounded-full bg-white/[0.12]" />
          <span className="ml-auto text-xs font-medium text-text-disabled">Step <span className="text-brand-light font-semibold">1</span> of 3</span>
        </div>

        <h2 className="text-[22px] font-bold text-text-primary mb-1.5">Academic Information</h2>
        <p className="text-sm text-text-muted mb-7 leading-[22px]">Tell us about your role and academic details at ESUT.</p>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {([
            { key: "student" as const, icon: "🎓", label: "Student", desc: "Undergraduate or postgraduate" },
            { key: "lecturer" as const, icon: "📖", label: "Lecturer", desc: "Teaching or research staff" },
          ]).map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-[14px] border-2 text-center cursor-pointer transition-all duration-200 ${
                role === r.key
                  ? "border-brand bg-brand/[0.12] shadow-[0_0_0_4px_rgba(124,58,237,0.12),0_4px_20px_rgba(124,58,237,0.2)]"
                  : "border-white/10 bg-white/[0.04] hover:border-brand/40 hover:bg-brand/[0.06] hover:-translate-y-[2px]"
              }`}
            >
              <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl border transition-all ${
                role === r.key ? "bg-brand/25 border-brand/50" : "bg-brand/[0.12] border-brand/20"
              }`}>
                {r.icon}
              </div>
              <span className={`text-[15px] font-semibold ${role === r.key ? "text-brand-light" : "text-text-secondary"}`}>{r.label}</span>
              <span className="text-xs text-text-disabled leading-[18px]">{r.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "student" ? (
            <>
              {/* Matric Number */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Matric Number</label>
                <input
                  required
                  type="text"
                  placeholder="2022/249671/CS"
                  className={`w-full h-12 bg-white/[0.04] border rounded-[10px] text-text-primary text-sm px-4 outline-hidden transition-all uppercase placeholder:text-text-disabled placeholder:normal-case ${
                    matricValid === true ? "border-success shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" :
                    matricValid === false ? "border-error shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" :
                    "border-white/10 focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]"
                  }`}
                  value={matric}
                  onChange={e => setMatric(e.target.value)}
                />
                {matricValid !== null && (
                  <p className={`text-xs flex items-center gap-1 mt-1 ${matricValid ? "text-success" : "text-error"}`}>
                    {matricValid ? <><CheckCircle className="w-3 h-3" /> Valid format</> : <><XCircle className="w-3 h-3" /> Format: 2022/249671/CS</>}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Department</label>
                <select
                  required
                  className="w-full h-12 bg-[#1A1A2E] border border-white/10 rounded-[10px] px-4 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
                  value={dept}
                  onChange={e => { setDept(e.target.value); setFaculty(getFacultyForDepartment(e.target.value)); }}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.emoji} {d.name}</option>)}
                </select>
              </div>

              {/* Faculty (auto) */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Faculty</label>
                <input readOnly type="text" placeholder="Auto-filled from department" className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] px-4 text-text-primary text-sm outline-hidden opacity-70 cursor-not-allowed" value={faculty} />
              </div>

              {/* Year of Entry */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Year of Entry</label>
                <select
                  required
                  className="w-full h-12 bg-[#1A1A2E] border border-white/10 rounded-[10px] px-4 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                >
                  <option value="">Select Session</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Level badge */}
              {level && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-muted">Current Level:</span>
                  <span className="inline-flex items-center gap-1.5 bg-cyan/[0.12] border border-cyan/30 text-cyan text-[13px] font-semibold px-3.5 py-1.5 rounded-full">
                    🎓 {level}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Staff ID */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Staff ID Number</label>
                <input
                  required
                  type="text"
                  placeholder="Enter your staff ID"
                  className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm px-4 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all placeholder:text-text-disabled"
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Department</label>
                <select
                  required
                  className="w-full h-12 bg-[#1A1A2E] border border-white/10 rounded-[10px] px-4 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
                  value={dept}
                  onChange={e => { setDept(e.target.value); setFaculty(getFacultyForDepartment(e.target.value)); }}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.emoji} {d.name}</option>)}
                </select>
              </div>

              {/* Faculty (auto) */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Faculty</label>
                <input readOnly type="text" placeholder="Auto-filled" className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] px-4 text-text-primary text-sm outline-hidden opacity-70 cursor-not-allowed" value={faculty} />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Highest Qualification</label>
                <select
                  required
                  className="w-full h-12 bg-[#1A1A2E] border border-white/10 rounded-[10px] px-4 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all"
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                >
                  <option value="">Select Qualification</option>
                  {QUALIFICATIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Nav */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 h-12 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.5)] transition-all"
            >
              Continue to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
