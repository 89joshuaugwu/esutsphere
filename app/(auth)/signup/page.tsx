"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import OtpModal from "@/components/auth/OtpModal";

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<"student" | "lecturer">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const router = useRouter();

  const handlePostAuth = async (uid: string) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      // Store selected role in sessionStorage for step-1
      sessionStorage.setItem("esutsphere_signup_role", selectedRole);
      router.push("/onboarding/step-1");
    } else {
      const userData = userDoc.data();
      if (userData.approvalStatus === "approved") router.push("/feed");
      else if (userData.approvalStatus === "pending") router.push("/onboarding/pending");
      else router.push("/login");
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Failed to sign up with Google");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem("esutsphere_signup_role", selectedRole);
      sessionStorage.setItem("esutsphere_signup_name", fullName);
      // Show OTP verification modal instead of immediately redirecting
      setPendingUid(result.user.uid);
      setShowOtpModal(true);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists. Try signing in.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    toast.success("Email verified successfully! 🎉");
    if (pendingUid) {
      await handlePostAuth(pendingUid);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Email Verification OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
        email={email}
        purpose="email_verification"
        displayName={fullName}
        title="Verify Your Email"
        description="We sent a 6-digit code to"
      />
      {/* ── Left Panel ─────────────────────────────────────── */}
      <div
        className="hidden sm:flex sm:w-[45%] flex-col justify-between p-10 lg:p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0F0F1A 0%, #080810 60%, rgba(124,58,237,0.08) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="absolute -bottom-[100px] -right-[100px] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_65%)] blur-[40px] pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <img src="/logo.png" alt="ESUTSphere" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold text-text-primary">ESUTSphere</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-[clamp(28px,3vw,38px)] text-text-primary leading-[1.2] mb-3">
            Join{" "}
            <span className="bg-[linear-gradient(135deg,#A855F7,#06B6D4)] bg-clip-text text-transparent">
              ESUTSphere.
            </span>
          </h1>
          <p className="text-[15px] text-text-muted leading-6 max-w-[300px]">
            The premier academic hub for ESUT students and lecturers.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-10">
            {[
              { value: "5,000+", label: "Active Students" },
              { value: "200+", label: "Lecturers" },
              { value: "50+", label: "Departments" },
              { value: "1,000+", label: "Resources Shared" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-[14px] p-3.5 lg:p-4">
                <span className="font-display text-[28px] bg-[linear-gradient(135deg,#A855F7,#06B6D4)] bg-clip-text text-transparent block mb-1">
                  {s.value}
                </span>
                <span className="text-xs font-medium text-text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-8 border-t border-white/[0.06] relative z-10">
          <div className="flex -space-x-1.5">
            {["alice", "bob", "carol", "dave"].map(s => (
              <img key={s} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`} alt="" className="w-7 h-7 rounded-full border-2 border-bg-base object-cover" />
            ))}
          </div>
          <p className="text-[13px] text-text-muted">
            <strong className="text-text-primary font-semibold">2,400+</strong> students already onboard
          </p>
        </div>
      </div>

      {/* ── Mobile Header ──────────────────────────────────── */}
      <div className="sm:hidden flex items-center gap-3 p-5 pb-2">
        <img src="/logo.png" alt="ESUTSphere" className="w-9 h-9 rounded-full" />
        <div>
          <span className="text-base font-bold text-text-primary block">ESUTSphere</span>
          <span className="text-xs text-text-muted">The Academic Hub for ESUT</span>
        </div>
      </div>

      {/* ── Right Panel — Signup Form ──────────────────────── */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-6 sm:p-10 lg:p-12 bg-bg-base overflow-y-auto">
        <div className="w-full max-w-[420px]" style={{ animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h2 className="text-[26px] font-bold text-text-primary mb-1.5">Create an account</h2>
          <p className="text-sm text-text-muted mb-7">Join the ESUTSphere community</p>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full h-[52px] bg-white text-[#0F0F1A] font-semibold rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all disabled:opacity-70 disabled:hover:translate-y-0 mb-5"
          >
            {isGoogleLoading ? (
              <span className="w-5 h-5 border-2 border-[#0F0F1A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs font-medium text-text-disabled uppercase tracking-[0.5px]">or continue with email</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Role Selector — Preview only */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { key: "student" as const, icon: "🎓", label: "Student", desc: "ESUT undergraduate or postgraduate" },
              { key: "lecturer" as const, icon: "📖", label: "Lecturer", desc: "ESUT teaching or research staff" },
            ]).map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelectedRole(r.key)}
                className={`flex flex-col items-center gap-2.5 p-4 lg:p-5 rounded-[14px] border-2 text-center cursor-pointer transition-all duration-200 ${
                  selectedRole === r.key
                    ? "border-brand bg-brand/[0.12] shadow-[0_0_0_4px_rgba(124,58,237,0.12),0_4px_20px_rgba(124,58,237,0.2)]"
                    : "border-white/10 bg-white/[0.04] hover:border-brand/40 hover:bg-brand/[0.06] hover:-translate-y-[2px]"
                }`}
              >
                <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl border transition-all ${
                  selectedRole === r.key
                    ? "bg-brand/25 border-brand/50"
                    : "bg-brand/[0.12] border-brand/20"
                }`}>
                  {r.icon}
                </div>
                <span className={`text-[15px] font-semibold ${selectedRole === r.key ? "text-brand-light" : "text-text-secondary"}`}>
                  {r.label}
                </span>
                <span className="text-xs text-text-disabled leading-[18px]">{r.desc}</span>
              </button>
            ))}
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-3.5">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm pl-10 pr-4 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all placeholder:text-text-disabled"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@esut.edu.ng"
                  required
                  className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm pl-10 pr-4 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all placeholder:text-text-disabled"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm pl-10 pr-12 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all placeholder:text-text-disabled"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted transition-colors">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className={`w-full h-12 bg-white/[0.04] border rounded-[10px] text-text-primary text-sm pl-10 pr-12 outline-hidden focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all placeholder:text-text-disabled ${
                    confirmPassword && confirmPassword !== password
                      ? "border-error focus:border-error"
                      : "border-white/10 focus:border-brand"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted transition-colors">
                  {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password || !fullName || password !== confirmPassword}
              className="w-full h-[52px] bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_12px_36px_rgba(124,58,237,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ArrowRight className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-text-disabled leading-[18px] mt-4">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-brand">Terms of Service</a> and{" "}
            <a href="#" className="text-brand">Privacy Policy</a>.
          </p>

          {/* Switch */}
          <p className="text-center text-sm text-text-muted mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-semibold hover:text-brand-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
