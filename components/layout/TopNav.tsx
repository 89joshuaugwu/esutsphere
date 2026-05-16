"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, Settings, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/ui/Logo";

export default function TopNav() {
  const { user, firebaseUser, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const avatarUrl = user?.profilePicture || firebaseUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "anon"}`;
  const displayName = user?.displayName || firebaseUser?.displayName || "User";

  return (
    <header
      className="sticky top-0 z-[100] h-[var(--nav-height)] w-full px-4 md:px-6 flex items-center gap-4"
      style={{
        background: "rgba(8,8,16,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <Link href="/feed" className="flex items-center shrink-0">
        <span className="hidden sm:block"><Logo variant="compact" size="sm" /></span>
        <span className="sm:hidden"><Logo variant="icon-only" size="sm" /></span>
      </Link>

      {/* Center Search */}
      <div className="flex-1 max-w-[440px] mx-auto relative hidden md:block">
        <Search className="w-[15px] h-[15px] text-text-disabled absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search documents, posts, users..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full h-[38px] bg-white/[0.05] border border-white/[0.08] rounded-[10px] pl-[38px] pr-3.5 text-text-primary text-[13px] outline-hidden transition-all duration-200 placeholder:text-text-disabled ${
            searchFocused
              ? "border-brand/50 shadow-[0_0_0_3px_rgba(124,58,237,0.12)] bg-brand/[0.04]"
              : ""
          }`}
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Mobile search button */}
        <button className="md:hidden w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-all">
          <Search className="w-[18px] h-[18px]" />
        </button>

        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-all border border-transparent hover:border-white/[0.08]"
        >
          <Bell className="w-[18px] h-[18px]" />
          {/* Unread dot */}
          <span
            className="absolute top-[5px] right-[5px] w-2 h-2 rounded-full bg-brand border-2 border-[#080810]"
            style={{ animation: "dot-pulse 2s ease-in-out infinite" }}
          />
        </Link>

        {/* User avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full border-2 border-brand/40 overflow-hidden cursor-pointer hover:border-brand-light transition-[border-color] focus:outline-none"
          >
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-bg-surface-3 border border-white/[0.12] rounded-[14px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50"
              style={{ animation: "card-enter 0.15s ease both" }}
            >
              {/* User info header */}
              <div className="px-4 py-3.5 border-b border-white/[0.06]">
                <p className="text-sm font-bold text-text-primary truncate">{displayName}</p>
                <p className="text-xs text-text-disabled truncate">@{user?.username || "user"}</p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {[
                  { label: "My Profile", icon: User, href: `/profile/${user?.username || "me"}` },
                  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
                  { label: "Settings", icon: Settings, href: "/dashboard?tab=settings" },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-text-muted hover:bg-white/[0.05] hover:text-text-primary transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div className="border-t border-white/[0.06] py-1.5">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-error hover:bg-error/[0.08] transition-all w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
