"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCircle, Heart, MessageCircle, AlertCircle } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, "users", auth.currentUser.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      let unread = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        notifs.push({ id: doc.id, ...data });
        if (!data.isRead) unread++;
      });
      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, "users", auth.currentUser.uid, "notifications", id), {
      isRead: true
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-brand-light" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-cyan" />;
      case 'approval': return <CheckCircle className="w-4 h-4 text-success" />;
      default: return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full ring-2 ring-bg-surface" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-bg-surface-2 border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-[12px] overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs text-brand-light font-medium">{unreadCount} New</span>}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-sm">
                  You're all caught up!
                </div>
              ) : (
                notifications.map(n => (
                  <Link 
                    key={n.id}
                    href={n.link || "#"}
                    onClick={() => markAsRead(n.id)}
                    className={`flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-brand/5' : ''}`}
                  >
                    <div className="mt-1 bg-white/5 p-2 rounded-full">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{n.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
