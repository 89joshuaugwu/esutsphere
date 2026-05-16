"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, ShieldCheck, RefreshCw, Loader2, AlertTriangle } from "lucide-react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
  purpose: "email_verification" | "password_reset" | "two_factor" | "link_password";
  displayName?: string;
  title?: string;
  description?: string;
}

const PURPOSE_DEFAULTS = {
  email_verification: { title: "Verify Your Email", description: "We sent a 6-digit code to" },
  password_reset: { title: "Enter Reset Code", description: "We sent a password reset code to" },
  two_factor: { title: "Two-Factor Verification", description: "Enter the 6-digit code sent to" },
  link_password: { title: "Verify Email Address", description: "Enter the code we sent to" },
};

export default function OtpModal({
  isOpen, onClose, onVerified, email, purpose, displayName,
  title: customTitle, description: customDesc,
}: OtpModalProps) {
  const defaults = PURPOSE_DEFAULTS[purpose];
  const title = customTitle || defaults.title;
  const description = customDesc || defaults.description;

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(600); // 10 min in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const MAX_RESENDS = 3;

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Expiry timer
  useEffect(() => {
    if (!isOpen || expiresIn <= 0) return;
    const t = setInterval(() => setExpiresIn((e) => Math.max(0, e - 1)), 1000);
    return () => clearInterval(t);
  }, [isOpen, expiresIn]);

  // Auto-send OTP on open
  useEffect(() => {
    if (isOpen && resendCount === 0) {
      handleSendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSendOtp = useCallback(async () => {
    if (resendCount >= MAX_RESENDS) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setResendCount((c) => c + 1);
      setCooldown(60);
      setExpiresIn(600);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setSending(false);
    }
  }, [email, purpose, displayName, resendCount]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError("");

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newDigits.every((d) => d) && newDigits.join("").length === 6) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code: string) => {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      onVerified();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const isExpired = expiresIn <= 0;
  const canResend = resendCount < MAX_RESENDS && cooldown <= 0 && !sending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(8px)" }}>
      <div
        className="w-full max-w-[420px] rounded-2xl overflow-hidden"
        style={{
          background: "rgba(15,15,26,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
            >
              <ShieldCheck className="w-[18px] h-[18px] text-brand-light" />
            </div>
            <h2 className="text-[16px] font-bold text-text-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-[13px] text-text-secondary text-center mb-1">{description}</p>
          <p className="text-[14px] font-semibold text-brand-light text-center mb-6">{email}</p>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 md:gap-3 mb-5" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={verifying || isExpired}
                className="w-[46px] h-[56px] text-center text-[24px] font-bold rounded-xl border-2 outline-none transition-all disabled:opacity-40"
                style={{
                  background: digit ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
                  borderColor: digit ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)",
                  color: "var(--color-text-primary, #F8FAFC)",
                  caretColor: "#7C3AED",
                }}
              />
            ))}
          </div>

          {/* Expiry Timer */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {isExpired ? (
              <span className="text-[12px] font-semibold text-error flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Code expired
              </span>
            ) : (
              <span className="text-[12px] text-text-muted">
                Code expires in <span className="font-semibold text-warning">{formatTime(expiresIn)}</span>
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg mb-4 text-[13px] font-medium"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Verifying State */}
          {verifying && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-brand-light animate-spin" />
              <span className="text-[13px] text-text-secondary">Verifying...</span>
            </div>
          )}

          {/* Resend Button */}
          <div className="flex flex-col items-center gap-2 pt-2">
            {resendCount < MAX_RESENDS ? (
              <button
                onClick={handleSendOtp}
                disabled={!canResend}
                className="flex items-center gap-2 text-[13px] font-semibold transition-all disabled:opacity-40"
                style={{ color: canResend ? "#06B6D4" : "var(--color-text-disabled, #475569)" }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : sending ? "Sending..." : "Resend Code"}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-[12px] text-error font-medium mb-2">Maximum resend attempts reached</p>
                <button
                  onClick={onClose}
                  className="text-[13px] font-semibold text-brand-light hover:underline"
                >
                  Start over
                </button>
              </div>
            )}
            <p className="text-[11px] text-text-disabled">
              {resendCount}/{MAX_RESENDS} resends used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
