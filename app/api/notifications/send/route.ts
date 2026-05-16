import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { notificationEmailTemplate, securityAlertTemplate, accountApprovedTemplate, accountRejectedTemplate } from "@/lib/email-templates";
import nodemailer from "nodemailer";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
  return initializeApp({ credential: cert(sa) });
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

type NotificationType =
  | "new_login" | "new_device" | "account_approved" | "account_rejected"
  | "new_follower" | "new_subscriber" | "reaction" | "comment" | "reply"
  | "mention" | "comment_like" | "subscribed_upload" | "subscribed_post"
  | "download_milestone" | "like_milestone" | "points_milestone"
  | "featured_content" | "admin_announcement";

// Default notification preferences for types missing from user prefs
const TYPE_DEFAULTS: Record<string, { push: boolean; email: boolean }> = {
  new_login: { push: true, email: true },
  new_device: { push: true, email: true },
  account_approved: { push: true, email: true },
  account_rejected: { push: true, email: true },
  new_follower: { push: true, email: false },
  new_subscriber: { push: true, email: false },
  reaction: { push: false, email: false },
  comment: { push: true, email: false },
  reply: { push: true, email: false },
  mention: { push: true, email: false },
  comment_like: { push: false, email: false },
  subscribed_upload: { push: true, email: false },
  subscribed_post: { push: true, email: false },
  download_milestone: { push: true, email: true },
  like_milestone: { push: true, email: false },
  points_milestone: { push: true, email: false },
  featured_content: { push: true, email: true },
  admin_announcement: { push: true, email: false },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type, recipientId, senderId, senderName, senderAvatar,
      targetId, targetType, message, data,
    } = body as {
      type: NotificationType;
      recipientId: string | string[];
      senderId?: string;
      senderName?: string;
      senderAvatar?: string;
      targetId?: string;
      targetType?: string;
      message: string;
      data?: Record<string, string>;
    };

    if (!type || !recipientId || !message) {
      return NextResponse.json({ error: "Missing type, recipientId, or message" }, { status: 400 });
    }

    const recipients = Array.isArray(recipientId) ? recipientId : [recipientId];

    await Promise.all(
      recipients.map((uid) =>
        deliverNotification({
          type, uid, senderId, senderName, senderAvatar,
          targetId, targetType, message, data,
        })
      )
    );

    return NextResponse.json({ success: true, delivered: recipients.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Notification delivery failed";
    console.error("Notification send error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function deliverNotification(opts: {
  type: NotificationType;
  uid: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  targetId?: string;
  targetType?: string;
  message: string;
  data?: Record<string, string>;
}) {
  const { type, uid, senderId, senderName, senderAvatar, targetId, targetType, message, data } = opts;
  const app = getAdminApp();
  const db = getFirestore(app);

  // 1. ALWAYS write in-app notification
  await db.collection("notifications").add({
    recipientId: uid,
    senderId: senderId || null,
    senderName: senderName || null,
    senderAvatar: senderAvatar || null,
    type,
    message,
    targetId: targetId || null,
    targetType: targetType || null,
    data: data || {},
    isRead: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  // 2. Fetch user preferences
  const prefDoc = await db.doc(`users/${uid}/preferences/notifications`).get();
  const prefs = prefDoc.exists ? prefDoc.data() : null;
  const globalPush = prefs?.pushEnabled !== false;
  const globalEmail = prefs?.emailEnabled !== false;
  const typePrefs = prefs?.types?.[type] || TYPE_DEFAULTS[type] || { push: false, email: false };

  // 3. Push notification
  if (globalPush && typePrefs.push) {
    await sendPushNotification(app, uid, type, message, data, targetId, targetType);
  }

  // 4. Email notification
  if (globalEmail && typePrefs.email) {
    await sendEmailNotification(uid, type, message, data, senderName, db);
  }
}

async function sendPushNotification(
  app: ReturnType<typeof getAdminApp>,
  uid: string, type: string, message: string,
  data?: Record<string, string>, targetId?: string, targetType?: string
) {
  try {
    const db = getFirestore(app);
    const messaging = getMessaging(app);

    const devicesSnap = await db
      .collection(`users/${uid}/devices`)
      .where("isActive", "==", true)
      .where("pushEnabled", "==", true)
      .get();

    if (devicesSnap.empty) return;

    const tokens = devicesSnap.docs.map((d) => d.data().fcmToken).filter(Boolean);
    if (tokens.length === 0) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://esutsphere.vercel.app";

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title: "ESUTSphere", body: message },
      data: { type, targetId: targetId || "", targetType: targetType || "", ...(data || {}) },
      webpush: {
        notification: {
          icon: "/logo.png",
          badge: "/favicon.png",
          vibrate: [100, 50, 100],
        },
        fcmOptions: { link: `${appUrl}/notifications` },
      },
    });

    // Clean up invalid tokens
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      const batch = db.batch();
      devicesSnap.docs.forEach((d) => {
        if (invalidTokens.includes(d.data().fcmToken)) {
          batch.update(d.ref, { isActive: false, fcmToken: "" });
        }
      });
      await batch.commit();
    }
  } catch (err) {
    console.error("Push notification failed:", err);
  }
}

async function sendEmailNotification(
  uid: string, type: string, message: string,
  data?: Record<string, string>, senderName?: string,
  db?: FirebaseFirestore.Firestore
) {
  try {
    if (!db) return;
    const userDoc = await db.doc(`users/${uid}`).get();
    if (!userDoc.exists) return;
    const userData = userDoc.data();
    const email = userData?.email;
    const displayName = userData?.displayName || "there";
    if (!email) return;

    // Determine which emails to send to
    let toEmails: string[] = [email];

    // Admin users can have multiple notification emails
    if (userData?.role === "super_admin" && userData?.notificationEmails?.length > 0) {
      toEmails = [...new Set([email, ...userData.notificationEmails])];
    }

    let emailContent;

    switch (type) {
      case "account_approved":
        emailContent = accountApprovedTemplate(displayName);
        break;
      case "account_rejected":
        emailContent = accountRejectedTemplate(displayName, data?.reason || "No reason provided");
        break;
      case "new_login":
      case "new_device":
        emailContent = securityAlertTemplate({
          displayName,
          deviceName: data?.deviceName || "Unknown device",
          isNewDevice: type === "new_device",
          loginTime: new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
        });
        break;
      default:
        emailContent = notificationEmailTemplate({
          title: message.split(".")[0],
          message,
          actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://esutsphere.vercel.app"}/notifications`,
          actionLabel: "View on ESUTSphere",
          displayName,
        });
    }

    for (const to of toEmails) {
      await transporter.sendMail({
        from: `"ESUTSphere" <${process.env.EMAIL_USER}>`,
        to,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  } catch (err) {
    console.error("Email notification failed:", err);
  }
}
