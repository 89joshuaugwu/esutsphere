"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection, doc, query, where, orderBy, limit,
  onSnapshot, updateDoc, writeBatch,
} from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────

export type NotificationType =
  | "new_login" | "new_device"
  | "account_approved" | "account_rejected"
  | "new_follower" | "new_subscriber"
  | "reaction" | "comment" | "reply" | "mention" | "comment_like"
  | "subscribed_upload" | "subscribed_post"
  | "download_milestone" | "like_milestone" | "points_milestone" | "featured_content"
  | "admin_announcement"
  | "otp_sent" | "two_factor_enabled";

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  message: string;
  targetId?: string;
  targetType?: "document" | "post" | "user" | "comment";
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: { seconds: number; nanoseconds: number } | Date;
}

// ─── Notification Grouping ───────────────────────────────────────

interface NotificationGroup {
  label: string;
  notifications: AppNotification[];
}

function groupByDate(notifications: AppNotification[]): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, AppNotification[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  notifications.forEach((n) => {
    const ts = n.createdAt;
    const date = "seconds" in ts ? new Date(ts.seconds * 1000) : new Date(ts);
    if (date >= today) groups.Today.push(n);
    else if (date >= yesterday) groups.Yesterday.push(n);
    else if (date >= weekAgo) groups["This Week"].push(n);
    else groups.Earlier.push(n);
  });

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, notifications]) => ({ label, notifications }));
}

// ─── Icon/Color Mapping ─────────────────────────────────────────

export function getNotificationMeta(type: NotificationType): {
  emoji: string;
  color: string;
  bgColor: string;
  category: string;
} {
  const map: Record<string, { emoji: string; color: string; bgColor: string; category: string }> = {
    new_login:          { emoji: "🔵", color: "#06B6D4", bgColor: "rgba(6,182,212,0.12)", category: "Security" },
    new_device:         { emoji: "🔴", color: "#EF4444", bgColor: "rgba(239,68,68,0.12)", category: "Security" },
    account_approved:   { emoji: "🎉", color: "#10B981", bgColor: "rgba(16,185,129,0.12)", category: "Security" },
    account_rejected:   { emoji: "❌", color: "#EF4444", bgColor: "rgba(239,68,68,0.12)", category: "Security" },
    new_follower:       { emoji: "👤", color: "#7C3AED", bgColor: "rgba(124,58,237,0.12)", category: "Social" },
    new_subscriber:     { emoji: "🔔", color: "#F59E0B", bgColor: "rgba(245,158,11,0.12)", category: "Social" },
    reaction:           { emoji: "❤️", color: "#EC4899", bgColor: "rgba(236,72,153,0.12)", category: "Social" },
    comment:            { emoji: "💬", color: "#06B6D4", bgColor: "rgba(6,182,212,0.12)", category: "Social" },
    reply:              { emoji: "↩️", color: "#8B5CF6", bgColor: "rgba(139,92,246,0.12)", category: "Social" },
    mention:            { emoji: "@",  color: "#F59E0B", bgColor: "rgba(245,158,11,0.12)", category: "Social" },
    comment_like:       { emoji: "👍", color: "#10B981", bgColor: "rgba(16,185,129,0.12)", category: "Social" },
    subscribed_upload:  { emoji: "📄", color: "#A855F7", bgColor: "rgba(168,85,247,0.12)", category: "Subscriptions" },
    subscribed_post:    { emoji: "📝", color: "#06B6D4", bgColor: "rgba(6,182,212,0.12)", category: "Subscriptions" },
    download_milestone: { emoji: "🏆", color: "#F59E0B", bgColor: "rgba(245,158,11,0.12)", category: "Milestones" },
    like_milestone:     { emoji: "🔥", color: "#EF4444", bgColor: "rgba(239,68,68,0.12)", category: "Milestones" },
    points_milestone:   { emoji: "⭐", color: "#F59E0B", bgColor: "rgba(245,158,11,0.12)", category: "Milestones" },
    featured_content:   { emoji: "✨", color: "#7C3AED", bgColor: "rgba(124,58,237,0.12)", category: "Milestones" },
    admin_announcement: { emoji: "📢", color: "#06B6D4", bgColor: "rgba(6,182,212,0.12)", category: "System" },
  };
  return map[type] || { emoji: "🔔", color: "#94A3B8", bgColor: "rgba(148,163,184,0.12)", category: "Other" };
}

// ─── Build Navigation Link ──────────────────────────────────────

export function getNotificationLink(notif: AppNotification): string {
  switch (notif.type) {
    case "new_login":
    case "new_device":
      return "/dashboard?tab=settings";
    case "account_approved":
      return "/feed";
    case "account_rejected":
      return "/onboarding/pending";
    case "new_follower":
    case "new_subscriber":
      return notif.senderId ? `/profile/${notif.senderId}` : "/dashboard";
    case "reaction":
    case "comment":
    case "reply":
    case "featured_content":
      if (notif.targetType === "document") return `/library/${notif.targetId}`;
      if (notif.targetType === "post") return `/blog/${notif.targetId}`;
      return "/dashboard";
    case "subscribed_upload":
      return `/library/${notif.targetId}`;
    case "subscribed_post":
      return `/blog/${notif.targetId}`;
    case "download_milestone":
    case "like_milestone":
      return `/library/${notif.targetId}`;
    default:
      return "/notifications";
  }
}

// ─── Main Hook ──────────────────────────────────────────────────

export function useNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AppNotification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
      setLoading(false);
    }, (err) => {
      console.error("Notifications listener error:", err);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  const markAsRead = useCallback(async (notifId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { isRead: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!uid) return;
    try {
      const unread = notifications.filter((n) => !n.isRead);
      if (unread.length === 0) return;
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, "notifications", n.id), { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [uid, notifications]);

  const deleteNotification = useCallback(async (notifId: string) => {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "notifications", notifId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, []);

  const groupedByDate = useMemo(() => groupByDate(notifications), [notifications]);

  return {
    notifications,
    groupedByDate,
    unreadCount,
    loading,
    markAsRead,
    markAllRead,
    deleteNotification,
  };
}
