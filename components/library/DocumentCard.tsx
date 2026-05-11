import Link from "next/link";
import { Download, Heart, Eye } from "lucide-react";
import { Document } from "@/types";

const TYPE_COLORS: Record<string, string> = {
  notes: "#7C3AED",
  past_questions: "#F59E0B",
  research: "#06B6D4",
  assignment: "#10B981",
  seminar: "#EC4899",
  textbook: "#F97316",
  project: "#8B5CF6",
  handout: "#94A3B8"
};

const TYPE_LABELS: Record<string, string> = {
  notes: "Notes",
  past_questions: "Past Questions",
  research: "Research",
  assignment: "Assignment",
  seminar: "Seminar",
  textbook: "Textbook",
  project: "Project",
  handout: "Handout"
};

export default function DocumentCard({ doc }: { doc: Document }) {
  const color = TYPE_COLORS[doc.contentType] || "#94A3B8";

  return (
    <Link 
      href={`/library/${doc.id}`}
      className="block bg-[#16162A] border border-white/10 rounded-[14px] p-4 transition-all duration-200 hover:bg-[#1E1E35] hover:border-brand/30 group relative overflow-hidden"
      style={{ borderTopColor: color, borderTopWidth: '3px' }}
    >
      <div className="flex justify-between items-start mb-3">
        <span 
          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {TYPE_LABELS[doc.contentType]}
        </span>
        <span className="text-xs text-text-muted">{doc.courseCode}</span>
      </div>

      <h3 className="font-ui text-base font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-brand-light transition-colors">
        {doc.title}
      </h3>
      <p className="text-sm text-text-secondary line-clamp-2 mb-4">
        {doc.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <img 
            src={doc.uploaderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.uploaderUsername}`} 
            alt={doc.uploaderUsername} 
            className="w-6 h-6 rounded-full bg-bg-surface-3"
          />
          <span className="text-xs font-medium text-text-secondary">@{doc.uploaderUsername}</span>
        </div>

        <div className="flex items-center gap-3 text-text-muted text-xs">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {doc.viewCount}</span>
          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {doc.downloadCount}</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {doc.likesCount}</span>
        </div>
      </div>
    </Link>
  );
}
