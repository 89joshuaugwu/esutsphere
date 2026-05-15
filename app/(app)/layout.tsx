"use client";
import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import BottomTabBar from "@/components/layout/BottomTabBar";
import LandingNav from "@/components/landing/LandingNav";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const isPending = user && user.approvalStatus !== "approved";

  // While auth is loading, show a minimal shell to avoid flicker
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Non-authenticated: show landing nav, no sidebar/bottom bar ───
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <LandingNav />
        <main className="flex-1 pt-[68px]">
          <div className="px-4 md:px-7 lg:px-8 py-0">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // ─── Authenticated: full shell with TopNav + Sidebar + BottomTabBar ───
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-[var(--sidebar-width)] pb-[calc(var(--nav-height)+env(safe-area-inset-bottom))] md:pb-0 relative min-h-[calc(100vh-var(--nav-height))]">
          {/* Pending user FOMO banner */}
          {isPending && (
            <div className="mx-4 md:mx-7 lg:mx-8 mt-3 px-4 py-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#FCD34D]">Account verification pending</p>
                <p className="text-[11px] text-text-muted mt-0.5">You can browse everything, but some actions are locked until your account is approved.</p>
              </div>
            </div>
          )}
          <div className="px-4 md:px-7 lg:px-8 py-0">
            {children}
          </div>
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
