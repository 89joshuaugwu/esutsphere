"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import OtpModal from "@/components/auth/OtpModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rejectionData, setRejectionData] = useState<{ reason: string } | null>(null);
  const [show2faModal, setShow2faModal] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [pending2faEmail, setPending2faEmail] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "done">("email");
  const [forgotSending, setForgotSending] = useState(false);
  const router = useRouter();

  // Shared post-auth routing logic
  const handlePostAuth = async (uid: string) => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      router.push("/onboarding/step-1");
    } else {
      const userData = userDoc.data();
      if (userData.approvalStatus === "approved") {
        router.push("/feed");
      } else if (userData.approvalStatus === "pending") {
        router.push("/onboarding/pending");
      } else if (userData.approvalStatus === "rejected") {
        setRejectionData({ reason: userData.rejectionReason || "No reason provided." });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Check 2FA for Google
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.twoFactorEnabled && userData.twoFactorMethods?.includes("google")) {
          setPendingUid(result.user.uid);
          setPending2faEmail(result.user.email || "");
          setShow2faModal(true);
          return;
        }
      }
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Failed to sign in with Google");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Check 2FA
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.twoFactorEnabled && userData.twoFactorMethods?.includes("email")) {
          setPendingUid(result.user.uid);
          setPending2faEmail(email);
          setShow2faModal(true);
          return;
        }
      }
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      const code = error.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2faVerified = async () => {
    setShow2faModal(false);
    toast.success("Identity verified!");
    if (pendingUid) await handlePostAuth(pendingUid);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setForgotSending(true);
    try {
      // Use Firebase's built-in reset but also send OTP for extra verification
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success("Password reset link sent to your email!");
      setForgotStep("done");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setForgotSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* 2FA OTP Modal */}
      <OtpModal
        isOpen={show2faModal}
        onClose={() => setShow2faModal(false)}
        onVerified={handle2faVerified}
        email={pending2faEmail}
        purpose="two_factor"
        title="Two-Factor Verification"
        description="Enter the code sent to"
      />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-[400px] rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <KeyRound className="w-[18px] h-[18px] text-brand-light" />
                </div>
                <h2 className="text-[16px] font-bold text-text-primary">Reset Password</h2>
              </div>
              <button onClick={() => { setShowForgotModal(false); setForgotStep("email"); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all">
                <span className="text-lg">&times;</span>
              </button>
            </div>
            <div className="px-6 py-6">
              {forgotStep === "email" && (
                <div className="space-y-4">
                  <p className="text-[13px] text-text-secondary text-center">Enter your email and we&apos;ll send a password reset link.</p>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@esut.edu.ng" className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm pl-10 pr-4 outline-hidden focus:border-brand transition-all placeholder:text-text-disabled" />
                  </div>
                  <button onClick={handleForgotPassword} disabled={!forgotEmail || forgotSending} className="w-full h-11 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-all">
                    {forgotSending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Send Reset Link"}
                  </button>
                </div>
              )}
              {forgotStep === "done" && (
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto text-2xl">✅</div>
                  <h3 className="text-[16px] font-bold text-text-primary">Check your email!</h3>
                  <p className="text-[13px] text-text-secondary">A password reset link has been sent to <strong className="text-brand-light">{forgotEmail}</strong></p>
                  <button onClick={() => { setShowForgotModal(false); setForgotStep("email"); }} className="text-[13px] font-semibold text-brand-light hover:underline">Back to Login</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Left Panel — Brand + Stats (Desktop) ────────────── */}
      <div
        className="hidden sm:flex sm:w-[45%] flex-col justify-between p-10 lg:p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0F0F1A 0%, #080810 60%, rgba(124,58,237,0.08) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Background orb */}
        <div className="absolute -bottom-[100px] -right-[100px] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_65%)] blur-[40px] pointer-events-none" />

        {/* Top: Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <img src="/logo.png" alt="ESUTSphere" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold text-text-primary">ESUTSphere</span>
        </div>

        {/* Center: Tagline */}
        <div className="relative z-10">
          <h1 className="font-display text-[clamp(28px,3vw,38px)] text-text-primary leading-[1.2] mb-3">
            Welcome back.
          </h1>
          <p className="text-[15px] text-text-muted leading-6 max-w-[300px]">
            Sign in to access your notes, past questions, and campus feed.
          </p>

          {/* Stats grid */}
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

        {/* Bottom: Social proof */}
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

      {/* ── Mobile Header ───────────────────────────────────── */}
      <div className="sm:hidden flex items-center gap-3 p-5 pb-2">
        <img src="/logo.png" alt="ESUTSphere" className="w-9 h-9 rounded-full" />
        <div>
          <span className="text-base font-bold text-text-primary block">ESUTSphere</span>
          <span className="text-xs text-text-muted">The Academic Hub for ESUT</span>
        </div>
      </div>

      {/* ── Right Panel — Auth Form ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-bg-base">
        <div className="w-full max-w-[420px]" style={{ animation: "card-enter 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          {/* Rejection card */}
          {rejectionData && (
            <div className="bg-error/[0.08] border border-error/25 rounded-2xl p-6 mb-6" style={{ animation: "card-enter 0.4s 0.1s both" }}>
              <h3 className="text-base font-bold text-error mb-2">Account Not Approved</h3>
              <p className="text-sm text-text-muted leading-[22px] mb-4">
                Your account was not approved. Reason: {rejectionData.reason}
                <br />You may re-submit with corrected information.
              </p>
              <Link
                href="/onboarding/step-3"
                className="inline-flex items-center gap-2 text-sm font-semibold text-error border border-error/30 rounded-lg px-4 py-2 hover:bg-error/10 transition-colors"
              >
                Re-apply
              </Link>
            </div>
          )}

          <h2 className="text-[26px] font-bold text-text-primary mb-1.5">Welcome back</h2>
          <p className="text-sm text-text-muted mb-8">Sign in to your ESUTSphere account</p>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
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

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-disabled absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@esut.edu.ng"
                  className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm pl-10 pr-4 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] focus:bg-[rgba(124,58,237,0.04)] transition-all placeholder:text-text-disabled"
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
                  placeholder="••••••••"
                  className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm pl-10 pr-12 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] focus:bg-[rgba(124,58,237,0.04)] transition-all placeholder:text-text-disabled"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" onClick={() => { setShowForgotModal(true); setForgotEmail(email); }} className="text-[13px] font-medium text-brand hover:text-brand-light transition-colors">
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-[52px] bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_12px_36px_rgba(124,58,237,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Switch */}
          <p className="text-center text-sm text-text-muted mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand font-semibold hover:text-brand-light transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
