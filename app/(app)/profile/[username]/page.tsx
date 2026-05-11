"use client";
import { use } from "react";
import { MapPin, Calendar, Upload } from "lucide-react";
import { motion } from "motion/react";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  // Mock Profile Data
  const profile = {
    displayName: "John Doe",
    username: username,
    bio: "Computer Science student passionate about AI and web development. Trying to survive ESUT.",
    department: "Computer Science",
    level: "400L",
    joined: "Oct 2023",
    followers: 245,
    following: 120,
    points: 850,
    badges: ["top_contributor", "note_legend"],
    uploadsCount: 15
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative rounded-[20px] bg-linear-to-br from-[#1E1E35]/90 to-[#16162A]/90 border border-white/10 p-6 md:p-8 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
      >
        {/* Top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-brand to-cyan" />
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
            alt={username}
            className="w-24 h-24 rounded-full bg-bg-surface-3 border-4 border-bg-base shadow-xl"
          />
          
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="font-display text-3xl text-text-primary">{profile.displayName}</h1>
                <p className="text-text-muted text-sm font-medium">@{profile.username}</p>
              </div>
              <button className="h-10 px-6 bg-white text-[#0F0F1A] font-semibold rounded-lg hover:bg-gray-200 transition-colors shadow-lg active:scale-95">
                Follow
              </button>
            </div>
            
            <p className="text-text-secondary text-[15px] leading-relaxed mb-4 max-w-xl">
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.department}, {profile.level}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {profile.joined}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text-primary">{profile.followers}</span>
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text-primary">{profile.following}</span>
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Following</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-cyan">{profile.points}</span>
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Points</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-6 mt-8 border-b border-white/10 px-4">
        <button className="pb-3 border-b-2 border-brand text-brand-light font-medium text-sm transition-colors">
          Uploads ({profile.uploadsCount})
        </button>
        <button className="pb-3 border-b-2 border-transparent text-text-muted hover:text-text-primary font-medium text-sm transition-colors">
          Posts
        </button>
        <button className="pb-3 border-b-2 border-transparent text-text-muted hover:text-text-primary font-medium text-sm transition-colors">
          Badges
        </button>
      </div>

      {/* Content Area */}
      <div className="py-12 text-center text-text-muted">
        <Upload className="w-12 h-12 text-white/10 mx-auto mb-3" />
        <p>No documents uploaded yet.</p>
      </div>
    </div>
  );
}
