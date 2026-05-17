"use client";
import { useState } from "react";
import { X, UploadCloud, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

type Step = 1 | 2 | 3;

export default function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("notes");
  const [courseCode, setCourseCode] = useState("");

  const { user } = useAuth();

  if (!isOpen) return null;

  const handleNext = () => setStep(2);

  const handleUpload = async () => {
    if (!file || !user) return;
    setIsUploading(true);
    setProgress(30);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      setProgress(60);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const { collection, addDoc, Timestamp } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      await addDoc(collection(db, "documents"), {
        title,
        description,
        fileUrl: data.url,
        fileType: file.type.includes("pdf") ? "pdf" : file.type.includes("image") ? "image" : file.type.includes("word") ? "docx" : file.type.includes("presentation") ? "pptx" : "audio",
        fileSizeKb: Math.round(file.size / 1024),
        contentType,
        courseCode: courseCode.toUpperCase(),
        department: user.department || "General",
        faculty: user.faculty || "General",
        level: user.currentLevel || "100L",
        academicSession: "2023/2024",
        uploaderId: user.uid,
        uploaderName: user.displayName,
        uploaderUsername: user.username,
        uploaderAvatar: user.profilePicture,
        isLecturerUpload: user.role === "lecturer",
        viewCount: 0,
        downloadCount: 0,
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        isPinned: false,
        isApproved: true,
        isFeatured: false,
        tags: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setProgress(100);
      setStep(3);
      toast.success("Document uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#080810]/90 backdrop-blur-[10px] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#16162A] border border-white/10 rounded-[20px] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.7)] relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <h2 className="font-display text-2xl text-text-primary mb-6">Upload Document</h2>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-linear-to-r from-brand to-brand-light' : 'bg-white/10'}`} 
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div 
              className="bg-brand/5 border-2 border-dashed border-brand/30 rounded-[14px] p-10 text-center cursor-pointer hover:bg-brand/10 hover:border-brand/60 transition-all group"
              onClick={() => document.getElementById("doc-upload")?.click()}
            >
              <input 
                id="doc-upload" type="file" className="hidden"
                accept=".pdf,.docx,.pptx,.jpg,.png"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <UploadCloud className="w-12 h-12 text-brand/60 group-hover:text-brand mx-auto mb-4 transition-colors" />
              {file ? (
                <p className="text-brand-light font-medium">{file.name}</p>
              ) : (
                <p className="text-text-muted group-hover:text-text-primary transition-colors">Click to select PDF, DOCX, PPTX or Image</p>
              )}
            </div>
            
            <button 
              onClick={handleNext} disabled={!file}
              className="w-full h-11 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light disabled:opacity-50 disabled:hover:bg-brand transition-all"
            >
              Continue to Details
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-text-primary outline-hidden focus:border-brand/50 focus:ring-2 focus:ring-brand/20" placeholder="e.g., MTH101 Complete Notes" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Type</label>
                <select value={contentType} onChange={e => setContentType(e.target.value)} className="w-full bg-[#1A1A2E] border border-white/10 rounded-lg h-10 px-3 text-text-primary outline-hidden">
                  <option value="notes">Notes</option>
                  <option value="past_questions">Past Questions</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Course Code</label>
                <input value={courseCode} onChange={e => setCourseCode(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-text-primary outline-hidden uppercase" placeholder="MTH 101" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-text-primary outline-hidden resize-none" placeholder="Brief description of the content..." />
            </div>

            {isUploading && (
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-linear-to-r from-brand to-cyan transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button disabled={isUploading} onClick={() => setStep(1)} className="w-1/3 h-11 bg-white/5 text-text-secondary font-semibold rounded-lg hover:bg-white/10 transition-all border border-white/10">Back</button>
              <button disabled={isUploading || !title || !courseCode} onClick={handleUpload} className="w-2/3 h-11 bg-brand text-white font-semibold rounded-lg hover:bg-brand-light flex justify-center items-center">
                {isUploading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Upload Document"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success/40 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Upload Successful!</h3>
            <p className="text-text-secondary mb-8">Your document has been added to the library.</p>
            <button onClick={onClose} className="w-full h-11 bg-white/5 text-text-primary font-semibold rounded-lg hover:bg-white/10 border border-white/10">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
