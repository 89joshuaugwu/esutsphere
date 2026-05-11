"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Step2Page() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [username, setUsername] = useState(data.username);
  const [displayName, setDisplayName] = useState(data.displayName);
  const [bio, setBio] = useState(data.bio);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (auth.currentUser && !displayName) {
      setDisplayName(auth.currentUser.displayName || "");
    }
  }, [displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uname = username.toLowerCase();
    
    if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
      toast.error("Username must be 3-20 chars, alphanumeric and underscores only.");
      return;
    }

    setIsChecking(true);
    try {
      const q = query(collection(db, "users"), where("username", "==", uname));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("Username is already taken.");
        setIsChecking(false);
        return;
      }

      updateData({
        username: uname,
        displayName,
        bio,
      });
      router.push("/onboarding/step-3");
    } catch (error) {
      console.error(error);
      toast.error("Error checking username.");
    }
    setIsChecking(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 px-4">
      <div className="w-full max-w-md bg-bg-surface-2 border border-white/10 rounded-2xl p-8 backdrop-blur-[12px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-3xl text-text-primary">Step 2: Profile</h2>
          <span className="text-brand font-bold">2 / 3</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Username</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-text-muted">@</span>
              <input 
                required
                type="text" 
                placeholder="johndoe"
                className="w-full bg-white/5 border border-white/10 rounded-lg h-11 pl-8 pr-4 text-text-primary outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5">3-20 chars, lowercase, numbers, underscores.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
            <input 
              required
              type="text" 
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-lg h-11 px-4 text-text-primary outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio (Optional)</label>
            <textarea 
              rows={3}
              placeholder="Passionate about software engineering..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-text-primary outline-hidden focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10 resize-none"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => router.back()} className="w-1/3 h-11 bg-white/5 text-text-secondary font-semibold rounded-lg hover:bg-white/10 transition-all border border-white/10">
              Back
            </button>
            <button disabled={isChecking} type="submit" className="w-2/3 h-11 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-70">
              {isChecking ? "Checking..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
