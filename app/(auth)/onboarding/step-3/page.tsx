"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { auth } from "@/lib/firebase";
import { createUserDoc } from "@/lib/firestore";
import { Upload, X, CheckCircle, Shield, FileText } from "lucide-react";
import toast from "react-hot-toast";

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

export default function Step3Page() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isStudent = data.role === "student";
  const title = isStudent ? "Upload your ESUT Admission Letter" : "Upload your ESUT Staff ID Card or Appointment Letter";
  const hint = isStudent
    ? "A clear photo or scan of your admission letter for verification."
    : "Upload your staff ID card or official appointment letter.";

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File must be under 10MB.");
      return;
    }
    setFile(selectedFile);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !data.admissionLetterUrl) {
      toast.error("Please upload a document.");
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
        // Simulate progress for UX
        const progressInterval = setInterval(() => {
          setUploadProgress(p => Math.min(p + 15, 85));
        }, 200);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "esutsphere");
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dls1uradw";
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await res.json();
        clearInterval(progressInterval);

        if (!res.ok) throw new Error(uploadData.error?.message || "Upload failed");
        finalUrl = uploadData.secure_url;
        setUploadProgress(100);
        setUploadSuccess(true);
      }

      // Build user doc based on role
      const baseDoc: Record<string, any> = {
        email: user.email || "",
        displayName: data.displayName,
        username: data.username,
        profilePicture: data.profilePicture || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        bio: data.bio || "",
        department: data.department,
        faculty: data.faculty,
        role: "pending",
        approvalStatus: "pending",
      };

      if (isStudent) {
        baseDoc.matricNumber = data.matricNumber;
        baseDoc.yearOfEntry = data.yearOfEntry;
        baseDoc.currentLevel = calculateLevel(data.yearOfEntry);
        baseDoc.admissionLetterUrl = finalUrl;
      } else {
        baseDoc.staffId = data.staffId;
        baseDoc.qualification = data.qualification;
        baseDoc.coursesTaught = data.coursesTaught || [];
        baseDoc.admissionLetterUrl = finalUrl; // reuse field for staff ID upload
      }

      await createUserDoc(user.uid, baseDoc);
      toast.success("Application submitted!");
      router.push("/onboarding/pending");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    }
    setIsUploading(false);
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
          <div className="h-1 w-8 rounded-full bg-success" />
          <div className="h-1 w-12 rounded-full bg-[linear-gradient(90deg,#7C3AED,#A855F7)]" />
          <span className="ml-auto text-xs font-medium text-text-disabled">Step <span className="text-brand-light font-semibold">3</span> of 3</span>
        </div>

        <h2 className="text-[22px] font-bold text-text-primary mb-1.5">Verification Document</h2>
        <p className="text-sm text-text-muted mb-6 leading-[22px]">{title}</p>

        <form onSubmit={handleSubmit}>
          {/* Upload zone */}
          {!uploadSuccess ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all mb-4 ${
                isDragOver
                  ? "bg-brand/10 border-brand shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                  : "bg-brand/[0.04] border-brand/30 hover:bg-brand/10 hover:border-brand/60"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div className="text-4xl mb-3">📄</div>
              <p className="text-base font-semibold text-text-primary mb-1.5">
                {file ? file.name : "Click to upload or drag & drop"}
              </p>
              <p className="text-[13px] text-text-muted mb-2">{hint}</p>
              <p className="text-xs text-text-disabled">Max 10MB</p>
              {/* Format chips */}
              <div className="flex gap-1.5 justify-center mt-3">
                {["PDF", "PNG", "JPG"].map(f => (
                  <span key={f} className="bg-white/[0.06] border border-white/[0.08] rounded-md px-2.5 py-1 text-[11px] font-semibold text-text-muted tracking-[0.3px]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* File info + progress */}
          {file && !uploadSuccess && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-[10px] p-3.5 flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-brand-light shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-xs text-text-disabled">{(file.size / 1024).toFixed(0)} KB</p>
                {isUploading && uploadProgress > 0 && (
                  <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden mt-1.5">
                    <div className="h-full bg-[linear-gradient(90deg,#7C3AED,#06B6D4)] rounded-full transition-[width] duration-400" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
              <button type="button" onClick={() => { setFile(null); setUploadProgress(0); }} className="text-text-disabled hover:text-error transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success state */}
          {uploadSuccess && (
            <div className="bg-success/[0.08] border border-success/25 rounded-[10px] p-3.5 flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <span className="text-[13px] font-semibold text-success">Document uploaded successfully</span>
            </div>
          )}

          {/* Privacy note */}
          <div className="bg-cyan/[0.06] border border-cyan/15 rounded-[10px] p-3.5 flex items-start gap-2.5 mb-6">
            <Shield className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-[18px]">
              Your document is private. Only verified admins can view it for account verification. It will not be shared or made public.
            </p>
          </div>

          {/* Nav */}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => router.back()}
              className="h-12 px-5 rounded-[10px] bg-transparent text-text-muted border border-white/10 text-sm font-medium hover:bg-white/[0.06] hover:text-text-primary transition-all disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isUploading || (!file && !data.admissionLetterUrl)}
              className="flex-1 h-12 bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-[15px] font-bold rounded-[10px] shadow-[0_6px_20px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(124,58,237,0.5)] transition-all disabled:opacity-40 disabled:hover:translate-y-0 flex items-center justify-center"
            >
              {isUploading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
