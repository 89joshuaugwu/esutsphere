"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { DEPARTMENTS, getFacultyForDepartment } from "@/constants/departments";
import toast from "react-hot-toast";

const MATRIC_REGEX = /^\d{4}\/\d{6}\/[A-Z]{2,6}$/;

export default function Step1Page() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [matric, setMatric] = useState(data.matricNumber);
  const [dept, setDept] = useState(data.department);
  const [faculty, setFaculty] = useState(data.faculty);
  const [year, setYear] = useState(data.yearOfEntry);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!MATRIC_REGEX.test(matric.toUpperCase())) {
      toast.error("Invalid Matric Number format (e.g. 2022/249671/CS)");
      return;
    }
    updateData({
      matricNumber: matric.toUpperCase(),
      department: dept,
      faculty: faculty,
      yearOfEntry: year,
    });
    router.push("/onboarding/step-2");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 px-4">
      <div className="w-full max-w-md bg-bg-surface-2 border border-white/10 rounded-2xl p-8 backdrop-blur-[12px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-3xl text-text-primary">Step 1: Academic</h2>
          <span className="text-brand font-bold">1 / 3</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Matric Number</label>
            <input 
              required
              type="text" 
              placeholder="2022/249671/CS"
              className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-text-primary outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10 uppercase"
              value={matric}
              onChange={e => setMatric(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Department</label>
            <select 
              required
              className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg h-11 px-4 text-text-primary outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10"
              value={dept}
              onChange={e => {
                const selected = e.target.value;
                setDept(selected);
                setFaculty(getFacultyForDepartment(selected));
              }}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.emoji} {d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Faculty</label>
            <input 
              readOnly
              type="text" 
              placeholder="Auto-filled from department"
              className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-text-primary outline-hidden cursor-not-allowed opacity-70"
              value={faculty}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Year of Entry</label>
            <input 
              required
              type="text" 
              placeholder="2022/2023"
              pattern="\d{4}/\d{4}"
              className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-text-primary outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10"
              value={year}
              onChange={e => setYear(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full h-11 mt-4 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            Continue to Profile
          </button>
        </form>
      </div>
    </div>
  );
}
