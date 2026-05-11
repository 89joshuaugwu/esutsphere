import Link from "next/link";
import { Search, Bell } from "lucide-react";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-[100] h-[var(--nav-height)] w-full px-4 md:px-6 bg-[#080810]/85 backdrop-blur-[20px] border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="flex items-center gap-2">
          <img src="/logo.png" alt="ESUTSphere Logo" className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.3)] object-cover bg-bg-surface-3" />
          <span className="font-display text-xl hidden sm:block text-text-primary mt-1">ESUTSphere</span>
        </Link>
      </div>

      <div className="hidden md:flex items-center relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3" />
        <input 
          type="text" 
          placeholder="Search documents, posts..." 
          className="bg-white/5 border border-white/10 rounded-lg h-10 pl-10 pr-3.5 w-[280px] text-text-primary text-sm transition-all duration-200 focus:w-[360px] focus:border-brand/50 focus:ring-[3px] focus:ring-brand/10 focus:bg-brand/5 outline-hidden"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:bg-white/5 hover:text-text-primary transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand border-2 border-[#080810] animate-pulse"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-bg-surface-3 border border-white/10 overflow-hidden cursor-pointer">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=esut" alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
