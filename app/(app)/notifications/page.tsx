"use client";
import { useState } from "react";
import { CheckCheck, UserPlus, Heart, MessageCircle, Reply, Award, Bell as BellIcon, AtSign } from "lucide-react";

type NotifFilter = "all" | "reactions" | "comments" | "follows" | "system";

interface MockNotif {
  id: string;
  type: NotifFilter;
  icon: string;
  iconClass: string;
  sender: string;
  action: string;
  target?: string;
  time: string;
  isRead: boolean;
}

const MOCK_NOTIFS: MockNotif[] = [
  { id: "n1", type: "follows", icon: "👤", iconClass: "bg-brand/15", sender: "Dr. Okafor", action: "started following you", time: "2m ago", isRead: false },
  { id: "n2", type: "reactions", icon: "🔥", iconClass: "bg-orange-500/12", sender: "Ada Nwosu", action: "reacted to your post", target: "How to survive CSC 201 Defense", time: "15m ago", isRead: false },
  { id: "n3", type: "comments", icon: "💬", iconClass: "bg-cyan/12", sender: "Chukwuemeka", action: "commented on", target: "MTH 201 Past Questions", time: "1h ago", isRead: false },
  { id: "n4", type: "system", icon: "🎉", iconClass: "bg-gold/12", sender: "ESUTSphere", action: "Your document reached 100 downloads!", target: "CSC 201 Past Questions", time: "3h ago", isRead: true },
  { id: "n5", type: "reactions", icon: "❤️", iconClass: "bg-red-500/12", sender: "Jane Smith", action: "loved your document", target: "PHY 201 Lab Manual", time: "5h ago", isRead: true },
  { id: "n6", type: "follows", icon: "👤", iconClass: "bg-brand/15", sender: "Tunde Lagos", action: "started following you", time: "8h ago", isRead: true },
  { id: "n7", type: "comments", icon: "↩️", iconClass: "bg-cyan/10", sender: "Chioma Eze", action: "replied to your comment on", target: "Best study spots on campus", time: "12h ago", isRead: true },
  { id: "n8", type: "system", icon: "⭐", iconClass: "bg-gold/12", sender: "ESUTSphere", action: "You earned the Note Legend badge!", time: "1d ago", isRead: true },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotifFilter>("all");
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);

  const filtered = filter === "all" ? notifs : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const filters: { id: NotifFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "reactions", label: "Reactions" },
    { id: "comments", label: "Comments" },
    { id: "follows", label: "Follows" },
    { id: "system", label: "System" },
  ];

  // Group by "today" / "earlier"
  const todayNotifs = filtered.filter(n => !n.time.includes("d ago"));
  const earlierNotifs = filtered.filter(n => n.time.includes("d ago"));

  return (
    <div className="max-w-[680px] mx-auto pb-20 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-5 md:pt-6 mb-4 md:mb-5 gap-3">
        <h1 className="font-display text-[24px] md:text-[28px] text-text-primary shrink-0">Notifications</h1>
        <div className="flex gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="h-[32px] md:h-[34px] px-2.5 md:px-3.5 rounded-lg bg-brand/10 border border-brand/25 text-brand-light text-[12px] md:text-[13px] font-semibold hover:bg-brand/20 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs — scrollable on mobile */}
      <div className="flex gap-1 mb-4 md:mb-5 bg-white/[0.03] border border-white/[0.07] rounded-[10px] p-1 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 md:px-4 py-[7px] rounded-[7px] text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap shrink-0 ${
              filter === f.id
                ? "bg-brand/[0.18] text-brand-light"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ animation: "card-enter 0.4s both" }}>
          <span className="text-5xl block mb-4">🔔</span>
          <h3 className="text-lg font-bold text-text-primary mb-2">You&apos;re all caught up!</h3>
          <p className="text-sm text-text-muted">When people interact with your content, you&apos;ll see it here.</p>
        </div>
      ) : (
        <div style={{ animation: "card-enter 0.3s both" }}>
          {todayNotifs.length > 0 && (
            <>
              <span className="block text-xs font-bold text-text-disabled uppercase tracking-[0.6px] py-4 pb-2">Today</span>
              {todayNotifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3.5 w-full text-left px-4 py-3.5 rounded-xl mb-0.5 transition-[background] relative cursor-pointer ${
                    n.isRead ? "hover:bg-white/[0.03]" : "bg-brand/[0.06] border border-brand/10 hover:bg-brand/[0.08]"
                  }`}
                >
                  {!n.isRead && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand" />
                  )}
                  <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-base md:text-lg shrink-0 ${n.iconClass}`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary leading-5 mb-1">
                      <strong className="text-text-primary font-bold">{n.sender}</strong>{" "}
                      {n.action}
                      {n.target && <span className="text-brand-light"> {n.target}</span>}
                    </p>
                    <span className="text-xs text-text-disabled">{n.time}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {earlierNotifs.length > 0 && (
            <>
              <span className="block text-xs font-bold text-text-disabled uppercase tracking-[0.6px] py-4 pb-2">Earlier</span>
              {earlierNotifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3.5 w-full text-left px-4 py-3.5 rounded-xl mb-0.5 transition-[background] relative cursor-pointer ${
                    n.isRead ? "hover:bg-white/[0.03]" : "bg-brand/[0.06] border border-brand/10"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 ${n.iconClass}`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary leading-5 mb-1">
                      <strong className="text-text-primary font-bold">{n.sender}</strong>{" "}
                      {n.action}
                      {n.target && <span className="text-brand-light"> {n.target}</span>}
                    </p>
                    <span className="text-xs text-text-disabled">{n.time}</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
