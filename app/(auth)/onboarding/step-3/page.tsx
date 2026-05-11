"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

function calculateLevel(yearOfEntry: string): string {
  const entryYear = parseInt(yearOfEntry.split('/')[0]);
  const currentYear = new Date().getFullYear();
  const yearsIn = currentYear - entryYear;
  const level = (yearsIn + 1) * 100;
  if (level >= 600) return "600L";
  if (level >= 500) return "500L";
  if (level >= 400) return "400L";
  if (level >= 300) return "300L";
  if (level >= 200) return "200L";
  return "100L";
}

export default function Step3Page() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !data.admissionLetterUrl) {
      toast.error("Please upload your admission letter.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      toast.error("Authentication lost. Please sign in again.");
      router.push("/login");
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = data.admissionLetterUrl;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "esutsphere"); 
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dls1uradw";
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Upload failed");
        
        finalUrl = uploadData.secure_url;
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: data.displayName,
        username: data.username,
        profilePicture: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        bio: data.bio || "",
        matricNumber: data.matricNumber,
        department: data.department,
        faculty: data.faculty,
        yearOfEntry: data.yearOfEntry,
        currentLevel: calculateLevel(data.yearOfEntry),
        role: "pending",
        approvalStatus: "pending",
        admissionLetterUrl: finalUrl,
        followersCount: 0,
        followingCount: 0,
        uploadsCount: 0,
        totalLikesReceived: 0,
        totalDownloads: 0,
        points: 0,
        badges: [],
        isVerified: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastActiveAt: Timestamp.now(),
      });

      toast.success("Onboarding complete!");
      router.push("/onboarding/pending");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    }
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10 px-4">
      <div className="w-full max-w-md bg-bg-surface-2 border border-white/10 rounded-2xl p-8 backdrop-blur-[12px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-3xl text-text-primary">Step 3: Verification</h2>
          <span className="text-brand font-bold">3 / 3</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-sm text-text-secondary leading-relaxed">
            Upload a clear image or PDF of your ESUT Admission Letter or School ID. This is required to verify you are a student.
          </div>

          <div 
            className="bg-brand/5 border-2 border-dashed border-brand/30 rounded-xl p-8 text-center cursor-pointer hover:bg-brand/10 hover:border-brand/60 transition-all group"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input 
              id="file-upload"
              type="file" 
              accept=".pdf,image/png,image/jpeg"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <p className="text-brand-light font-medium">{file.name}</p>
            ) : (
              <p className="text-text-muted group-hover:text-text-primary transition-colors">Click to select file (Max 10MB)</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" disabled={isUploading} onClick={() => router.back()} className="w-1/3 h-11 bg-white/5 text-text-secondary font-semibold rounded-lg hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50">
              Back
            </button>
            <button disabled={isUploading} type="submit" className="w-2/3 h-11 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light transition-all shadow-[0_0_20px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-70 flex items-center justify-center">
              {isUploading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
