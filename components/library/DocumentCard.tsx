import Link from "next/link";
import { Download, Heart, Eye } from "lucide-react";
import { Document } from "@/types";

const TYPE_COLORS: Record<string, { color: string; rgb: string }> = {
  notes:          { color: "#A855F7", rgb: "168,85,247" },
  past_questions: { color: "#F59E0B", rgb: "245,158,11" },
  research:       { color: "#06B6D4", rgb: "6,182,212" },
  assignment:     { color: "#10B981", rgb: "16,185,129" },
  seminar:        { color: "#EC4899", rgb: "236,72,153" },
  textbook:       { color: "#F97316", rgb: "249,115,22" },
  project:        { color: "#8B5CF6", rgb: "139,92,246" },
  handout:        { color: "#94A3B8", rgb: "148,163,184" },
};

const TYPE_LABELS: Record<string, string> = {
  notes: "Notes",
  past_questions: "Past Questions",
  research: "Research",
  assignment: "Assignment",
  seminar: "Seminar",
  textbook: "Textbook",
  project: "Project",
  handout: "Handout",
};

export default function DocumentCard({ doc }: { doc: Document }) {
  const tc = TYPE_COLORS[doc.contentType] || { color: "#94A3B8", rgb: "148,163,184" };

  return (
    <Link
      href={`/library/${doc.id}`}
      className="group block bg-[#16162A] border border-white/[0.08] rounded-[14px] p-[18px] transition-all duration-[220ms] ease-out hover:bg-[#1E1E35] hover:border-white/[0.14] hover:-translate-y-[3px] hover:shadow-[0_12px_36px_rgba(0,0,0,0.4)] relative overflow-hidden"
      style={{
        borderTopColor: tc.color,
        borderTopWidth: "3px",
        // @ts-expect-error CSS custom properties
        "--type-color": tc.color,
        "--type-rgb": tc.rgb,
      }}
    >
      {/* Shimmer hover overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Top: Type badge + Course code */}
      <div className="flex items-center justify-between mb-3 relative z-[1]">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.6px] px-2 py-[3px] rounded-[6px] border"
          style={{
            backgroundColor: `rgba(${tc.rgb}, 0.15)`,
            color: tc.color,
            borderColor: `rgba(${tc.rgb}, 0.25)`,
          }}
        >
          {TYPE_LABELS[doc.contentType]}
        </span>
        <span className="text-xs font-semibold text-text-muted bg-white/[0.06] rounded-[6px] px-2 py-[3px]">
          {doc.courseCode}
        </span>
      </div>

      {/* Title */}
      <h3 className="relative z-[1] text-[15px] font-bold text-text-primary leading-[22px] line-clamp-2 mb-1.5 group-hover:text-brand-light transition-colors">
        {doc.title}
      </h3>

      {/* Description */}
      <p className="relative z-[1] text-[13px] text-text-muted leading-5 line-clamp-2 mb-3 flex-1">
        {doc.description}
      </p>

      {/* Footer: uploader + stats */}
      <div className="relative z-[1] flex items-center justify-between pt-2.5 border-t border-white/[0.06] mt-auto">
        <div className="flex items-center gap-[7px]">
          <img
            src={doc.uploaderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.uploaderUsername}`}
            alt={doc.uploaderUsername}
            className="w-[22px] h-[22px] rounded-full border border-white/10 object-cover"
          />
          <span className="text-xs font-medium text-text-muted">
            @{doc.uploaderUsername}
            {doc.isLecturerUpload && (
              <span className="ml-1 text-[10px] font-bold text-cyan bg-cyan/10 rounded px-1 py-[1px]">
                Lecturer
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-medium text-text-disabled">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {doc.viewCount.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloadCount.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {doc.likesCount.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
