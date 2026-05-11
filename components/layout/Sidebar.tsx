"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlusCircle, Bell, User, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Explore", href: "/explore", icon: Hash },
  { label: "Library", href: "/library", icon: Library },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile/me", icon: User },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("fixed left-0 top-[var(--nav-height)] z-40 hidden md:flex flex-col w-[var(--sidebar-width)] h-[calc(100vh-var(--nav-height))] bg-bg-surface-1 border-r border-white/5 py-5 px-4 overflow-y-auto", className)}>
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 font-medium",
                isActive 
                  ? "bg-brand/15 text-brand-light border-l-[3px] border-brand"
                  : "text-text-muted hover:bg-white/5 hover:text-text-secondary border-l-[3px] border-transparent"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button className="w-full bg-brand hover:bg-brand-light text-white font-semibold py-2.5 rounded-lg border border-brand/50 transition-all shadow-[0_0_20px_rgba(124,58,237,0)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Upload Document
        </button>
      </div>
    </aside>
  );
}
