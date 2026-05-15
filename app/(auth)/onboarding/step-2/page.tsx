"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { auth } from "@/lib/firebase";
import { checkUsernameAvailable } from "@/lib/firestore";
import { Camera, CheckCircle, XCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function Step2Page() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [username, setUsername] = useState(data.username);
  const [displayName, setDisplayName] = useState(data.displayName);
  const [bio, setBio] = useState(data.bio);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-fill display name from Google auth
  useEffect(() => {
    if (auth.currentUser && !displayName) {
      setDisplayName(auth.currentUser.displayName || "");
    }
    if (auth.currentUser?.photoURL && !profilePreview) {
      setProfilePreview(auth.currentUser.photoURL);
    }
  }, [displayName, profilePreview]);

  // Username availability check (debounced)
  const checkUsername = useCallback((uname: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const cleaned = uname.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleaned.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(cleaned);
        setUsernameStatus(available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  }, []);

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleaned);
    checkUsername(cleaned);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setProfileFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3 || username.length > 20) {
      toast.error("Username must be 3-20 characters.");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      toast.error("Username can only contain lowercase letters, numbers, and underscores.");
      return;
    }
    if (usernameStatus === "taken") {
      toast.error("Username is already taken.");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload profile picture if selected
      let profileUrl = profilePreview;
      if (profileFile) {
        const formData = new FormData();
        formData.append("file", profileFile);
        formData.append("upload_preset", "esutsphere");
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dls1uradw";
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await res.json();
        if (!res.ok) throw new Error(uploadData.error?.message || "Photo upload failed");
        profileUrl = uploadData.secure_url;
      }

      updateData({
        username,
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePicture: profileUrl,
      });
      router.push("/onboarding/step-3");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative z-10 px-4 py-10"
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
          <div className="h-1 w-8 rounded-full bg-success" />
          <div className="h-1 w-12 rounded-full bg-[linear-gradient(90deg,#7C3AED,#A855F7)]" />
          <div className="h-1 w-6 rounded-full bg-white/[0.12]" />
          <span className="ml-auto text-xs font-medium text-text-disabled">Step <span className="text-brand-light font-semibold">2</span> of 3</span>
        </div>

        <h2 className="text-[22px] font-bold text-text-primary mb-1.5">Profile Setup</h2>
        <p className="text-sm text-text-muted mb-7 leading-[22px]">This is how you&apos;ll appear to the ESUTSphere community.</p>

        {/* Photo Upload */}
        <div className="flex justify-center mb-7">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-[100px] h-[100px] rounded-full bg-brand/[0.08] border-2 border-dashed border-brand/35 cursor-pointer overflow-hidden group hover:border-brand hover:bg-brand/[0.14] transition-all"
          >
            {profilePreview ? (
              <>
                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <Camera className="w-6 h-6 text-brand/60" />
                <span className="text-[10px] font-medium text-text-disabled">Upload</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled text-sm pointer-events-none">@</span>
              <input
                required
                type="text"
                placeholder="johndoe"
                className={`w-full h-12 bg-white/[0.04] border rounded-[10px] text-text-primary text-sm pl-8 pr-10 outline-hidden transition-all placeholder:text-text-disabled ${
                  usernameStatus === "available" ? "border-success shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" :
                  usernameStatus === "taken" ? "border-error shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" :
                  "border-white/10 focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]"
                }`}
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && <Loader className="w-4 h-4 text-gold animate-spin" />}
                {usernameStatus === "available" && <CheckCircle className="w-4 h-4 text-success" />}
                {usernameStatus === "taken" && <XCircle className="w-4 h-4 text-error" />}
              </div>
            </div>
            <p className="text-xs text-text-disabled mt-1">
              {username ? <>esut.sphere/@<span className="text-brand-light font-semibold">{username}</span></> : "3-20 chars, lowercase, numbers, underscores."}
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Display Name</label>
            <input
              required
              type="text"
              placeholder="John Doe"
              className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-[10px] text-text-primary text-sm px-4 outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all placeholder:text-text-disabled"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Bio <span className="text-text-disabled">(optional)</span></label>
            <textarea
              rows={3}
              placeholder="Passionate about software engineering..."
              maxLength={160}
              className="w-full bg-white/[0.04] border border-white/10 rounded-[10px] py-3 px-4 text-text-primary text-sm outline-hidden focus:border-brand focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all resize-none placeholder:text-text-disabled"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
            <p className="text-xs text-text-disabled text-right mt-0.5">{bio.length}/160</p>
          </div>

          {/* Nav */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="h-12 px-5 rounded-[10px] bg-transparent text-text-muted border border-white/10 text-sm font-medium hover:bg-white/[0.06] hover:text-text-primary transition-all disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || usernameStatus === "taken" || usernameStatus === "checking"}
              className="flex-1 h-12 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.5)] transition-all disabled:opacity-40 disabled:hover:translate-y-0 flex items-center justify-center"
            >
              {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
