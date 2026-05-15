"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, Clock, FileText, BookOpen, Flag,
  Settings, ArrowLeft, Shield, ChevronRight, Loader2,
} from "lucide-react";

const SUPER_ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { section: "USERS" },
  { label: "All Users", href: "/admin/users", icon: Users },
  { label: "Pending Approvals", href: "/admin/approvals", icon: Clock, badge: "amber" as const },
  { section: "CONTENT" },
  { label: "Documents", href: "/admin/content", icon: FileText },
  { label: "Blog Posts", href: "/admin/content?tab=posts", icon: BookOpen },
  { label: "Reports", href: "/admin/reports", icon: Flag, badge: "red" as const },
  { section: "PLATFORM" },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);

  const isSuperAdmin = user?.role === "super_admin";
  const isClassAdmin = user?.role === "class_admin";
  const isAdminRoute = pathname.startsWith("/admin");
  const isClassAdminRoute = pathname.startsWith("/class-admin");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (!["super_admin", "class_admin"].includes(user.role || "")) {
      router.push("/forbidden");
      return;
    }
    // Super admin routes require super_admin role
    if (isAdminRoute && user.role !== "super_admin") {
      router.push("/forbidden");
      return;
    }
    // Class admin routes allow both class_admin and super_admin
  }, [user, loading, isAdminRoute, router]);

  // Fetch counts for badges
  useEffect(() => {
    if (!user || !isSuperAdmin) return;
    import("@/lib/admin").then(({ getAdminStats }) => {
      getAdminStats().then((stats) => {
        setPendingCount(stats.pendingApprovals);
        setReportCount(stats.pendingReports);
      });
    });
  }, [user, isSuperAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-sm text-text-muted">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isSuperAdmin && !isClassAdmin)) return null;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Admin Top Bar */}
      <header
        className="sticky top-0 z-[100] h-16 w-full px-4 md:px-6 flex items-center gap-4"
        style={{
          background: "rgba(8,8,16,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Link href="/feed" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="ESUTSphere" className="w-[30px] h-[30px] rounded-full object-cover" />
          <span className="text-[15px] font-bold text-text-primary hidden sm:block">ESUTSphere</span>
        </Link>

        <div className="flex items-center gap-1.5 ml-2">
          <ChevronRight className="w-3.5 h-3.5 text-text-disabled" />
          <span
            className="text-[13px] font-bold px-2.5 py-1 rounded-md"
            style={{
              background: "rgba(124,58,237,0.10)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "#A855F7",
            }}
          >
            {isAdminRoute ? "⚡ Super Admin" : "📋 Class Admin"}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/feed"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-muted hover:bg-white/[0.05] hover:text-text-secondary transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Feed
          </Link>
          <img
            src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || "admin"}`}
            alt={user.displayName || "Admin"}
            className="w-8 h-8 rounded-full border-2 border-brand/30 object-cover"
          />
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside
          className="hidden md:flex flex-col w-[240px] shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto py-4 px-3"
          style={{
            background: "#080C14",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Brand Strip */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] mb-4"
            style={{
              background: "rgba(124,58,237,0.10)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
              style={{ background: "rgba(124,58,237,0.2)" }}
            >
              <Shield className="w-4 h-4 text-brand-light" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-brand-light">Admin Panel</p>
              <p className="text-[10px] text-text-disabled">ESUTSphere v2.0</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {SUPER_ADMIN_NAV.map((item, i) => {
              if ("section" in item) {
                return (
                  <span
                    key={`section-${i}`}
                    className="block text-[10px] font-bold text-text-disabled uppercase tracking-[1px] px-3 pt-4 pb-1.5"
                  >
                    {item.section}
                  </span>
                );
              }

              const Icon = item.icon!;
              const isActive = item.href!.includes("?")
                ? pathname + (typeof window !== "undefined" ? window.location.search : "") === item.href
                : pathname === item.href;
              const badgeValue = item.badge === "amber" ? pendingCount : item.badge === "red" ? reportCount : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`flex items-center gap-[11px] px-3 py-[10px] rounded-[9px] text-[13px] font-medium transition-all duration-150 relative ${
                    isActive
                      ? "bg-brand/[0.14] text-brand-light font-semibold"
                      : item.badge === "red"
                      ? "text-text-muted hover:bg-error/[0.08] hover:text-error"
                      : "text-text-muted hover:bg-white/[0.05] hover:text-text-secondary"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px] bg-brand" />
                  )}
                  <Icon className="w-[16px] h-[16px] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && badgeValue > 0 && (
                    <span
                      className={`min-w-[20px] h-5 rounded-full text-[11px] font-bold flex items-center justify-center px-1.5 ${
                        item.badge === "amber"
                          ? "bg-warning/20 text-warning"
                          : "bg-error/20 text-error"
                      }`}
                    >
                      {badgeValue}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: Back to Feed */}
          <div className="mt-auto pt-3 border-t border-white/[0.06]">
            <Link
              href="/feed"
              className="flex items-center gap-2 px-3 py-2.5 rounded-[9px] text-[13px] font-medium text-text-disabled hover:bg-white/[0.04] hover:text-text-muted transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ← Back to My Feed
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-9 py-7 max-w-[1400px] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
