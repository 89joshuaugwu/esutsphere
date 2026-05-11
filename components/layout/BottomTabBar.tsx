"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Library", href: "/library", icon: Library },
  { label: "Upload", href: "/upload", icon: Plus, isFab: true },
  { label: "Alerts", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile/me", icon: User },
];

export default function BottomTabBar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-[100] h-[var(--nav-height)] bg-[#0f0f1a]/95 backdrop-blur-[20px] border-t border-white/10 flex md:hidden items-center justify-around pb-[env(safe-area-inset-bottom)] px-2", className)}>
      {TABS.map((tab) => {
        const isActive = !tab.isFab && pathname.startsWith(tab.href);
        const Icon = tab.icon;

        if (tab.isFab) {
          return (
            <Link 
              key={tab.href}
              href={tab.href}
              className="relative -top-5 w-14 h-14 rounded-full bg-linear-to-br from-brand to-cyan text-white shadow-[0_8px_32px_rgba(124,58,237,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-bg-base"
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        }

        return (
          <Link 
            key={tab.href} 
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors",
              isActive ? "text-brand-light" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
