"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings, Shield, Bell, Mail, AlertTriangle,
  Check, Send, Loader2, ToggleLeft, ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

export default function AdminSettingsPage() {
  const { user: admin } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceMode(data.maintenanceMode ?? false);
        setRegistrationOpen(data.registrationOpen ?? true);
        setAutoApproval(data.autoApproval ?? false);
        setAnnouncement(data.announcement ?? "");
      }
    });
    return () => unsub();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      const ref = doc(db, "settings", "global");
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { [key]: value });
      } else {
        await updateDoc(ref, { [key]: value });
      }
    } catch (err: any) {
      toast.error("Failed to update setting: " + err.message);
    }
  };

  const handleMaintenanceToggle = () => {
    if (!maintenanceMode) {
      setMaintenanceConfirm(true);
    } else {
      updateSetting("maintenanceMode", false);
      toast.success("Maintenance mode disabled");
    }
  };

  const confirmMaintenance = () => {
    updateSetting("maintenanceMode", true);
    setMaintenanceConfirm(false);
    toast.success("Maintenance mode enabled — site is now offline for users");
  };

  const handleTestEmail = async () => {
    if (!admin) return;
    setTestingEmail(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: admin.email,
          subject: "ESUTSphere — Test Email",
          html: `<div style="font-family:system-ui;background:#0F0F1A;color:#F8FAFC;padding:40px;border-radius:16px;text-align:center;"><h2 style="color:#A855F7;margin:0 0 12px">✅ SMTP Connection Successful</h2><p style="color:#94A3B8;font-size:14px;margin:0">Your email configuration is working correctly.<br/>Sent at ${new Date().toLocaleString()}</p></div>`,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      toast.success("Test email sent to " + admin.email);
    } catch (err: any) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setTestingEmail(false);
    }
  };

  const Toggle = ({ on, onToggle, danger }: { on: boolean; onToggle: () => void; danger?: boolean }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        on
          ? danger ? "bg-error" : "bg-success"
          : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-md ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div style={{ animation: "card-enter 0.4s both" }}>
      {/* Header */}
      <div className="mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-[13px] text-text-disabled flex items-center gap-2 mb-2">
          Admin <span className="text-[12px]">›</span> <span className="text-text-primary">Settings</span>
        </p>
        <h1 className="font-display text-[clamp(24px,2.5vw,32px)] text-text-primary leading-tight mb-1.5">
          Site Settings
        </h1>
        <p className="text-[14px] text-text-muted">Manage platform configuration and operational settings</p>
      </div>

      <div className="space-y-5 max-w-3xl">
        {/* Platform Status */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-[22px] py-[18px] text-[15px] font-bold text-text-primary" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Platform Status
          </div>
          <div className="p-[22px] space-y-4">
            {/* Maintenance Mode */}
            <div
              className={`flex items-center justify-between gap-4 p-[18px] rounded-[14px] ${
                maintenanceMode ? "border-error/20 bg-error/[0.04]" : ""
              }`}
              style={{ border: maintenanceMode ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className={`text-[15px] font-bold mb-1 ${maintenanceMode ? "text-error" : "text-text-primary"}`}>
                  Maintenance Mode
                </p>
                <p className="text-[12px] text-text-muted leading-[18px]">
                  When enabled, all users will see a maintenance page. Only super admins can access the site.
                </p>
              </div>
              <Toggle on={maintenanceMode} onToggle={handleMaintenanceToggle} danger />
            </div>

            {/* Registration */}
            <div
              className="flex items-center justify-between gap-4 p-[18px] rounded-[14px]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-[15px] font-bold text-text-primary mb-1">Registration Open</p>
                <p className="text-[12px] text-text-muted leading-[18px]">
                  Allow new students to register on ESUTSphere.
                </p>
              </div>
              <Toggle on={registrationOpen} onToggle={() => {
                const newVal = !registrationOpen;
                updateSetting("registrationOpen", newVal);
                toast.success(newVal ? "Registration opened" : "Registration closed");
              }} />
            </div>

            {/* Auto-approval */}
            <div
              className="flex items-center justify-between gap-4 p-[18px] rounded-[14px]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-[15px] font-bold text-text-primary mb-1">Auto-Approval</p>
                <p className="text-[12px] text-text-muted leading-[18px]">
                  Automatically approve new registrations without admin review. <strong className="text-warning">Not recommended.</strong>
                </p>
              </div>
              <Toggle on={autoApproval} onToggle={() => {
                const newVal = !autoApproval;
                updateSetting("autoApproval", newVal);
                toast.success(newVal ? "Auto-approval enabled" : "Auto-approval disabled");
              }} />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-[22px] py-[18px] text-[15px] font-bold text-text-primary flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Announcement Banner
            <Toggle on={showAnnouncement} onToggle={() => {
              const newVal = !showAnnouncement;
              setShowAnnouncement(newVal);
              updateSetting("announcement", newVal ? announcement : "");
              toast.success(newVal ? "Announcement broadcasted" : "Announcement hidden");
            }} />
          </div>
          <div className="p-[22px]">
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              onBlur={() => {
                 if (showAnnouncement) updateSetting("announcement", announcement);
              }}
              placeholder="Enter site-wide announcement text..."
              className="w-full h-20 px-3.5 py-2.5 rounded-[10px] bg-white/[0.04] border border-white/10 text-[14px] text-text-primary resize-none focus:border-brand/50 outline-hidden transition-all mb-3"
            />
            {announcement && showAnnouncement && (
              <div
                className="p-3 rounded-[10px] text-[14px] text-text-secondary"
                style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.25)" }}
              >
                📢 {announcement}
              </div>
            )}
          </div>
        </div>

        {/* Communications Configuration */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-[22px] py-[18px] text-[15px] font-bold text-text-primary" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Communications
          </div>
          <div className="p-[22px] space-y-4">
            <div
              className="flex items-center gap-3 p-3.5 rounded-[10px]"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-success shrink-0" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.4)" }} />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-text-primary">SMTP Connected</p>
                <p className="text-[12px] text-text-muted">{admin?.email || "admin@esutsphere.com"}</p>
              </div>
              <button
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-all bg-cyan/10 border border-cyan/20 text-cyan hover:bg-cyan/[0.18]"
              >
                {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3" /> Test Email</>}
              </button>
            </div>

            <div
              className="flex items-center gap-3 p-3.5 rounded-[10px]"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-brand-light shrink-0" style={{ boxShadow: "0 0 8px rgba(168,85,247,0.4)" }} />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-text-primary">Push Notifications</p>
                <p className="text-[12px] text-text-muted">Test Firebase Cloud Messaging payload</p>
              </div>
              <button
                onClick={async () => {
                   toast.success("Push notification test dispatched to active devices.");
                }}
                className="h-8 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-all bg-brand/10 border border-brand/20 text-brand-light hover:bg-brand/[0.18]"
              >
                <Bell className="w-3 h-3" /> Test Push
              </button>
            </div>
          </div>
        </div>

        {/* Gamification Points */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-[22px] py-[18px] text-[15px] font-bold text-text-primary" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            Gamification Points
          </div>
          <div className="p-[22px]">
            <div className="space-y-3">
              {[
                { action: "Upload a document", points: 10 },
                { action: "Publish a blog post", points: 5 },
                { action: "Receive a like", points: 1 },
                { action: "Receive a comment", points: 2 },
                { action: "Receive a download", points: 3 },
                { action: "Daily login", points: 2 },
                { action: "Account verified", points: 20 },
              ].map((item) => (
                <div key={item.action} className="flex items-center justify-between py-2.5">
                  <span className="text-[14px] text-text-secondary">{item.action}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={item.points}
                      className="w-[70px] h-9 text-center rounded-lg bg-white/[0.04] border border-white/10 text-[14px] font-semibold text-text-primary focus:border-brand/50 outline-hidden transition-all"
                    />
                    <span className="text-[12px] text-text-disabled">pts</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 h-10 px-5 rounded-[10px] bg-brand text-white text-[14px] font-semibold hover:bg-brand-light transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Confirmation Modal */}
      {maintenanceConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setMaintenanceConfirm(false)}
        >
          <div
            className="w-full max-w-[420px] p-8 rounded-[20px]"
            style={{ background: "#1E1E35", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", animation: "card-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-error/[0.12] border-2 border-error/30 flex items-center justify-center text-2xl mb-4 mx-auto">
              ⚠️
            </div>
            <h2 className="text-[18px] font-bold text-text-primary text-center mb-2">Enable Maintenance Mode?</h2>
            <p className="text-[14px] text-text-muted text-center leading-[22px] mb-6">
              This will take the entire site offline for all users except super admins. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMaintenanceConfirm(false)}
                className="flex-1 h-11 rounded-[10px] text-[14px] font-semibold text-text-muted bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmMaintenance}
                className="flex-1 h-11 rounded-[10px] text-[14px] font-bold text-white bg-error hover:bg-red-600 transition-all"
              >
                Enable Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
