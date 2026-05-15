"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Hash, Library, Bell, User, PenSquare, Upload,
  LayoutDashboard, Settings, Sparkles, BookOpen,
  ClipboardList, CheckCircle, Users, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Feed", href: "/feed", icon: Home },
      { label: "Blog", href: "/blog", icon: BookOpen },
      { label: "Explore", href: "/explore", icon: Hash },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Library", href: "/library", icon: Library },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Write Post", href: "/blog/write", icon: PenSquare },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "My Profile", href: "/profile/me", icon: User },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Settings", href: "/dashboard?tab=settings", icon: Settings },
    ],
  },
];

const CLASS_ADMIN_ITEMS = [
  { label: "Overview", href: "/class-admin", icon: ClipboardList },
  { label: "Approvals", href: "/class-admin/approvals", icon: CheckCircle },
  { label: "My Class", href: "/class-admin/class", icon: Users },
];

const SUPER_ADMIN_ITEMS = [
  { label: "Admin Panel", href: "/admin", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const avatarUrl = user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "anon"}`;
  const profileHref = user?.username ? `/profile/${user.username}` : "/profile/me";

  const isClassAdmin = user?.role === "class_admin" && user?.classAdminDept && user?.classAdminLevel;
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <aside
      className="fixed left-0 top-[var(--nav-height)] z-40 hidden md:flex flex-col w-[var(--sidebar-width)] h-[calc(100vh-var(--nav-height))] overflow-y-auto overflow-x-hidden py-4 px-3"
      style={{
        background: "#0F0F1A",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Nav Groups */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <span className="block text-[10px] font-bold text-text-disabled uppercase tracking-[1px] px-[10px] pt-[10px] pb-[6px] mb-0.5">
              {group.label}
            </span>
            {group.items.map((item) => {
              const isActive = item.href === "/dashboard?tab=settings"
                ? pathname.startsWith("/dashboard") && typeof window !== "undefined" && window.location.search.includes("tab=settings")
                : item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || (item.href !== "/" && !item.href.includes("?") && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] text-sm font-medium transition-all duration-150 mb-0.5 relative ${
                    isActive
                      ? "bg-brand/[0.14] text-brand-light font-semibold"
                      : "text-text-muted hover:bg-white/[0.05] hover:text-text-secondary"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px] bg-brand" />
                  )}
                  <Icon className="w-[17px] h-[17px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Class Admin Section */}
        {isClassAdmin && (
          <>
            <div className="h-px bg-white/[0.07] my-3 mx-2" />
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-warning uppercase tracking-[1px] px-[10px] pb-[6px]">
              <Shield className="w-3 h-3" />
              Class Admin
            </span>
            {CLASS_ADMIN_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] text-sm font-medium transition-all duration-150 mb-0.5 relative ${
                    isActive
                      ? "bg-warning/[0.12] text-warning font-semibold"
                      : "text-text-muted hover:bg-white/[0.05] hover:text-text-secondary"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px] bg-warning" />
                  )}
                  <Icon className="w-[17px] h-[17px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <div className="h-px bg-white/[0.07] my-3 mx-2" />
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-pink-400 uppercase tracking-[1px] px-[10px] pb-[6px]">
              <Shield className="w-3 h-3" />
              Super Admin
            </span>
            {SUPER_ADMIN_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[11px] px-3 py-[10px] rounded-[10px] text-sm font-medium transition-all duration-150 mb-0.5 relative ${
                    isActive
                      ? "bg-pink-500/[0.12] text-pink-400 font-semibold"
                      : "text-text-muted hover:bg-white/[0.05] hover:text-text-secondary"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px] bg-pink-500" />
                  )}
                  <Icon className="w-[17px] h-[17px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom: Upload + Profile */}
      <div className="mt-auto pt-3 border-t border-white/[0.06]">
        <Link
          href="/library"
          className="w-full h-11 rounded-[10px] bg-[linear-gradient(135deg,#7C3AED,#A855F7)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.35)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(124,58,237,0.5)] transition-all mb-2.5"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Link>

        <Link
          href={profileHref}
          className="flex items-center gap-2.5 px-[10px] py-2.5 rounded-[10px] hover:bg-white/[0.04] transition-[background] group"
        >
          <div className="relative">
            <img
              src={avatarUrl}
              alt={user?.displayName || "Profile"}
              className="w-[34px] h-[34px] rounded-full border-2 border-brand/30 object-cover shrink-0"
            />
            {/* Class Admin badge on avatar */}
            {isClassAdmin && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                style={{
                  background: "#F59E0B",
                  border: "2px solid #0F0F1A",
                  color: "#0F0F1A",
                  fontWeight: 700,
                }}
              >
                ⚡
              </span>
            )}
            {isSuperAdmin && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                style={{
                  background: "#EC4899",
                  border: "2px solid #0F0F1A",
                  color: "#0F0F1A",
                  fontWeight: 700,
                }}
              >
                ★
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{user?.displayName || "User"}</p>
            <p className="text-[11px] text-text-disabled truncate">@{user?.username || "user"}</p>
          </div>
          <span className="text-[11px] font-bold text-brand-light shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {user?.points?.toLocaleString() || "0"}
          </span>
        </Link>
      </div>
    </aside>
  );
}
