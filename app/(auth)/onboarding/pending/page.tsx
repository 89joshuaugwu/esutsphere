"use client";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative z-10 px-4">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[30vw] h-[30vw] bg-warning/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 bg-bg-surface-2 border border-white/10 rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-[12px] relative text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-warning/15 flex items-center justify-center border-2 border-warning/40">
          <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="font-display text-3xl mb-4 text-text-primary">Under Review</h1>
        <p className="text-text-secondary mb-6 leading-relaxed">
          Your account is currently pending approval by a Class Admin. We're verifying your admission details. This usually takes 24-48 hours.
        </p>

        <button 
          onClick={handleLogout}
          className="w-full h-11 bg-white/5 text-text-primary font-semibold rounded-lg hover:bg-white/10 transition-all border border-white/10"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
