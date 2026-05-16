"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications, getNotificationMeta, getNotificationLink } from "@/hooks/useNotifications";
import type { AppNotification } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { CheckCheck, Bell as BellIcon, Loader2, Trash2, Filter } from "lucide-react";

type NotifCategory = "all" | "social" | "security" | "milestones" | "system";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, groupedByDate, unreadCount, loading, markAsRead, markAllRead, deleteNotification } = useNotifications(user?.uid);
  const [category, setCategory] = useState<NotifCategory>("all");
  const router = useRouter();

  const categories: { id: NotifCategory; label: string; emoji: string }[] = [
    { id: "all", label: "All", emoji: "📬" },
    { id: "social", label: "Social", emoji: "👥" },
    { id: "security", label: "Security", emoji: "🔒" },
    { id: "milestones", label: "Milestones", emoji: "🏆" },
    { id: "system", label: "System", emoji: "📢" },
  ];

  const filteredGroups = useMemo(() => {
    if (category === "all") return groupedByDate;
    return groupedByDate
      .map((g) => ({
        ...g,
        notifications: g.notifications.filter((n) => {
          const meta = getNotificationMeta(n.type);
          return meta.category.toLowerCase() === category;
        }),
      }))
      .filter((g) => g.notifications.length > 0);
  }, [groupedByDate, category]);

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.isRead) await markAsRead(notif.id);
    const link = getNotificationLink(notif);
    router.push(link);
  };

  const formatTime = (ts: { seconds: number } | Date) => {
    const date = "seconds" in ts ? new Date(ts.seconds * 1000) : new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-w-0 max-w-[680px] mx-auto px-3 sm:px-0 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <BellIcon className="w-5 h-5 text-brand-light" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-text-primary">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[12px] text-brand-light font-medium">{unreadCount} unread</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold text-brand-light hover:bg-brand/10 transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all shrink-0 ${
              category === cat.id
                ? "bg-brand/[0.18] text-brand-light border border-brand/30"
                : "bg-white/[0.04] text-text-muted border border-white/[0.06] hover:bg-white/[0.08]"
            }`}
          >
            <span className="text-[13px]">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 text-brand-light animate-spin" />
          <p className="text-[13px] text-text-muted">Loading notifications...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
          >
            🔔
          </div>
          <h3 className="text-[16px] font-bold text-text-primary">No notifications yet</h3>
          <p className="text-[13px] text-text-muted text-center max-w-[260px]">
            When someone follows you, reacts to your content, or you hit a milestone, you&apos;ll see it here.
          </p>
        </div>
      )}

      {/* Filtered Empty */}
      {!loading && notifications.length > 0 && filteredGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Filter className="w-5 h-5 text-text-disabled" />
          <p className="text-[13px] text-text-muted">No {category} notifications</p>
        </div>
      )}

      {/* Notification Groups */}
      {!loading &&
        filteredGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <h3 className="text-[11px] font-bold text-text-disabled uppercase tracking-[0.8px] px-1 mb-2">
              {group.label}
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(18,18,32,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {group.notifications.map((notif, i) => {
                const meta = getNotificationMeta(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all hover:bg-white/[0.03] ${
                      i < group.notifications.length - 1 ? "border-b border-white/[0.05]" : ""
                    } ${!notif.isRead ? "bg-brand/[0.04]" : ""}`}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0 mt-0.5"
                      style={{ background: meta.bgColor, border: `1px solid ${meta.color}25` }}
                    >
                      {notif.senderAvatar ? (
                        <img src={notif.senderAvatar} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        meta.emoji
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-[19px] ${!notif.isRead ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                        {notif.senderName && (
                          <span className="font-semibold text-text-primary">{notif.senderName} </span>
                        )}
                        {notif.message.replace(notif.senderName || "", "").trim()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-text-disabled">
                          {notif.createdAt ? formatTime(notif.createdAt) : ""}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-light shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-text-disabled hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
