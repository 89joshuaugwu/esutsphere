"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Plus, Bell, User } from "lucide-react";

const TABS = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Library", href: "/library", icon: Library },
  { label: "Upload", href: "/library", icon: Plus, isFab: true },
  { label: "Alerts", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile/me", icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] h-[var(--nav-height)] flex md:hidden items-center justify-around px-2"
      style={{
        background: "rgba(12,12,22,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = !tab.isFab && (pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href)));

        if (tab.isFab) {
          return (
            <Link
              key="fab"
              href={tab.href}
              className="relative -top-[20px] w-[50px] h-[50px] rounded-full bg-[linear-gradient(135deg,#7C3AED,#06B6D4)] text-white shadow-[0_6px_20px_rgba(124,58,237,0.5)] flex items-center justify-center transition-transform active:scale-[0.92] border-4 border-bg-base"
              style={{ marginBottom: "8px" }}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive ? "text-brand-light" : "text-text-disabled"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3px]">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
