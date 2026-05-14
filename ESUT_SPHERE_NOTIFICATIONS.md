# ESUTSphere — Notification System
## Complete Design + Context Specification

> Covers: FCM token management · Push notifications · Email notifications · In-app notifications
> Subscription system · Device management · Notification preferences UI
> All notification types · Delivery logic · Settings page design
> Updated: May 2026

---

## 1. SYSTEM OVERVIEW

ESUTSphere uses a **three-channel notification system**:

| Channel | Technology | When Used |
|---------|-----------|-----------|
| **In-app** | Firestore `onSnapshot` (real-time) | Always — every notification appears here regardless of other preferences |
| **Push** | Firebase Cloud Messaging (FCM) | When app is in background/closed, user has granted permission, device is registered |
| **Email** | Nodemailer + Gmail SMTP | High-importance events only (security, approvals, milestones) — user-configurable |

**Core principle:** In-app notifications are **always delivered** regardless of user preferences. Push and email are **opt-in** and **configurable per notification type**.

### Architecture Flow

```
Event occurs on ESUTSphere
        ↓
/api/notifications/send  (server-side API route)
        ↓
┌───────────────────────────────────────────────────────┐
│  1. Write to Firestore notifications/{id}             │  ← always (in-app)
│  2. Fetch recipient's notificationPreferences         │
│  3. If push enabled for this type:                    │
│       → Fetch active FCM tokens from devices sub-col  │
│       → Send FCM to all active tokens in parallel     │
│  4. If email enabled for this type:                   │
│       → Queue email via /api/send-email               │
└───────────────────────────────────────────────────────┘
        ↓
Recipient sees:
  • Bell icon badge increments (real-time via onSnapshot)
  • Push notification on all active devices
  • Email in inbox (for enabled types)
```

---

## 2. FCM TOKEN MANAGEMENT

### Storage Architecture

FCM tokens are stored in a **subcollection** under each user — NOT as an array field on the user document.

**Why subcollection over array:**
- Firestore documents have a 1MB size limit — arrays can grow large
- Easier to query, update, and delete individual device records
- Supports compound queries on device properties
- Atomic updates per device without overwriting the whole array

```
Firestore structure:
users/{uid}/devices/{deviceId}
```

### Device Document Schema

```typescript
interface UserDevice {
  deviceId: string;          // Auto-generated Firestore doc ID
  fcmToken: string;          // Firebase Cloud Messaging token
  
  // Device identity
  deviceName: string;        // e.g., "Chrome on Windows 11"
  deviceType: 'web' | 'android' | 'ios';
  browser?: string;          // e.g., "Chrome 124"
  os?: string;               // e.g., "Windows 11", "Android 14"
  
  // Status
  isActive: boolean;         // true = logged in, false = logged out
  pushEnabled: boolean;      // user toggled per device
  
  // Tracking
  lastActiveAt: Timestamp;   // update on each app open
  createdAt: Timestamp;      // first login on this device
  loggedOutAt?: Timestamp;   // when user logged out
  
  // Security
  ipAddress?: string;        // optional — for security display (last 3 of IP only)
  loginLocation?: string;    // optional — city/country from IP geolocation
}
```

### Token Lifecycle

#### On Login / App Open

```typescript
// lib/fcm.ts
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function registerDeviceToken(uid: string) {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
    });
    if (!token) return null;

    // Generate stable device ID (stored in localStorage)
    let deviceId = localStorage.getItem('esut_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('esut_device_id', deviceId);
    }

    // Parse device info
    const deviceInfo = parseUserAgent(navigator.userAgent);

    // Upsert device record in Firestore
    await setDoc(
      doc(db, 'users', uid, 'devices', deviceId),
      {
        deviceId,
        fcmToken: token,
        deviceName: `${deviceInfo.browser} on ${deviceInfo.os}`,
        deviceType: 'web',
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        isActive: true,
        pushEnabled: true,
        lastActiveAt: serverTimestamp(),
        createdAt: serverTimestamp(), // only sets on first write (use merge)
      },
      { merge: true }   // merge so createdAt isn't overwritten on return visits
    );

    return { token, deviceId };
  } catch (error) {
    console.error('FCM token registration failed:', error);
    return null;
  }
}
```

#### On Logout

```typescript
export async function deregisterDeviceToken(uid: string) {
  const deviceId = localStorage.getItem('esut_device_id');
  if (!deviceId) return;

  // Mark device as inactive — do NOT delete (user can see it in device history)
  await updateDoc(doc(db, 'users', uid, 'devices', deviceId), {
    isActive: false,
    pushEnabled: false,
    loggedOutAt: serverTimestamp(),
    fcmToken: '', // clear the token so it can't receive pushes
  });

  // Remove device ID from localStorage
  localStorage.removeItem('esut_device_id');
}
```

#### On Token Refresh (FCM auto-rotates tokens)

```typescript
// In your Firebase messaging setup
import { onTokenRefresh } from 'firebase/messaging';

onTokenRefresh(messaging, async () => {
  const newToken = await getToken(messaging, { vapidKey: VAPID_KEY });
  const deviceId = localStorage.getItem('esut_device_id');
  const uid = auth.currentUser?.uid;
  if (!deviceId || !uid) return;

  await updateDoc(doc(db, 'users', uid, 'devices', deviceId), {
    fcmToken: newToken,
    lastActiveAt: serverTimestamp(),
  });
});
```

#### Cleanup: Remove Stale Tokens

```typescript
// Run on admin settings page or scheduled Cloud Function (future)
// Removes devices that have been inactive for > 90 days
export async function cleanStaleDevices(uid: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const q = query(
    collection(db, 'users', uid, 'devices'),
    where('lastActiveAt', '<', Timestamp.fromDate(cutoff)),
    where('isActive', '==', false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}
```

---

## 3. NOTIFICATION PREFERENCES SCHEMA

Stored as a subcollection document — separate from the user document for clean separation.

```
users/{uid}/preferences/notifications
```

```typescript
interface NotificationPreferences {
  // Global channel toggles
  pushEnabled: boolean;    // master push toggle
  emailEnabled: boolean;   // master email toggle
  // in-app is always true — cannot be disabled

  // Per-type settings
  // Each type has: inApp (always true), push, email
  types: {
    // ── SECURITY ──────────────────────────────────────────
    new_login:          NotifChannelConfig;  // New device login
    new_device:         NotifChannelConfig;  // First time on new device
    account_approved:   NotifChannelConfig;  // Account approved
    account_rejected:   NotifChannelConfig;  // Account rejected

    // ── SOCIAL ────────────────────────────────────────────
    new_follower:       NotifChannelConfig;  // Someone followed you
    new_subscriber:     NotifChannelConfig;  // Someone subscribed to your notifications
    reaction:           NotifChannelConfig;  // Reaction on your content
    comment:            NotifChannelConfig;  // Comment on your content
    reply:              NotifChannelConfig;  // Reply to your comment
    mention:            NotifChannelConfig;  // @mention in comment
    comment_like:       NotifChannelConfig;  // Like on your comment

    // ── SUBSCRIPTIONS ─────────────────────────────────────
    subscribed_upload:  NotifChannelConfig;  // Subscribed user uploaded a doc
    subscribed_post:    NotifChannelConfig;  // Subscribed user published a post

    // ── MILESTONES ────────────────────────────────────────
    download_milestone: NotifChannelConfig;  // Doc hits 100/500/1000 downloads
    like_milestone:     NotifChannelConfig;  // Content hits 50/100 likes
    points_milestone:   NotifChannelConfig;  // Earned a new badge/milestone
    featured_content:   NotifChannelConfig;  // Admin featured your content

    // ── SYSTEM ────────────────────────────────────────────
    admin_announcement: NotifChannelConfig;  // Site-wide admin announcement
  };

  updatedAt: Timestamp;
}

interface NotifChannelConfig {
  inApp: true;       // always true — read-only
  push: boolean;
  email: boolean;
}
```

### Default Preferences (on first account approval)

```typescript
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, 'updatedAt'> = {
  pushEnabled: true,
  emailEnabled: true,
  types: {
    // Security — always push + email (safety)
    new_login:          { inApp: true, push: true,  email: true  },
    new_device:         { inApp: true, push: true,  email: true  },
    account_approved:   { inApp: true, push: true,  email: true  },
    account_rejected:   { inApp: true, push: true,  email: true  },

    // Social — push on, email off (social = real-time, not email-worthy)
    new_follower:       { inApp: true, push: true,  email: false },
    new_subscriber:     { inApp: true, push: true,  email: false },
    reaction:           { inApp: true, push: false, email: false }, // too noisy for push
    comment:            { inApp: true, push: true,  email: false },
    reply:              { inApp: true, push: true,  email: false },
    mention:            { inApp: true, push: true,  email: false },
    comment_like:       { inApp: true, push: false, email: false },

    // Subscriptions — push on (that's the whole point)
    subscribed_upload:  { inApp: true, push: true,  email: false },
    subscribed_post:    { inApp: true, push: true,  email: false },

    // Milestones — push + email (celebratory)
    download_milestone: { inApp: true, push: true,  email: true  },
    like_milestone:     { inApp: true, push: true,  email: false },
    points_milestone:   { inApp: true, push: true,  email: false },
    featured_content:   { inApp: true, push: true,  email: true  },

    // System — always all channels
    admin_announcement: { inApp: true, push: true,  email: false },
  },
};
```

---

## 4. SUBSCRIPTION SYSTEM (Advanced Following)

### Two Levels of Following

| Level | What it means | Stored in |
|-------|--------------|-----------|
| **Follow** | See their content in feed · Counted in followers/following stats | `follows` collection |
| **Subscribe** 🔔 | Receive push/in-app notifications for their new uploads and blog posts | `subscriptions` collection |

> **Key distinction:** You can follow someone without subscribing. You can subscribe without following (though subscribing auto-follows). Unsubscribing does NOT unfollow.

### Subscription Schema

```
subscriptions/{followerId}_{followedId}
```

```typescript
interface Subscription {
  id: string;              // `${followerId}_${followedId}`
  subscriberId: string;    // who subscribed
  targetId: string;        // who they subscribed to
  
  // What to notify about
  notifyOn: {
    uploads: boolean;      // new document uploads
    blogPosts: boolean;    // new blog posts
    // Note: reactions/comments from this user NOT included (too noisy)
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Profile Page — Follow + Subscribe UI

```
Current states:

State 1: Not following, not subscribed
  [Follow]  (no bell)

State 2: Following, not subscribed
  [Following ▾]   [🔔 Subscribe]

State 3: Following, subscribed (uploads + posts)
  [Following ▾]   [🔔 Subscribed ▾]
                    ├── ✓ New Uploads
                    ├── ✓ New Blog Posts
                    └── Unsubscribe
```

```css
/* Subscribe button */
.subscribe-btn {
  height: 38px; padding: 0 16px; border-radius: 9999px;
  font: Geist 13px weight 700; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}

/* Not subscribed */
.subscribe-btn.inactive {
  background: rgba(245,158,11,0.10);
  border: 1px solid rgba(245,158,11,0.3);
  color: #F59E0B;
}
.subscribe-btn.inactive:hover {
  background: rgba(245,158,11,0.18);
  transform: scale(1.04);
}

/* Subscribed */
.subscribe-btn.active {
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.4);
  color: #F59E0B;
}
/* Bell icon animates on subscribe */
.bell-ring {
  animation: bell-ring 0.5s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes bell-ring {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-15deg); }
  40% { transform: rotate(15deg); }
  60% { transform: rotate(-10deg); }
  80% { transform: rotate(10deg); }
}

/* Subscribe dropdown (when subscribed, shows options) */
.subscribe-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: #1E1E35;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 8px;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  z-index: 50;
  animation: search-drop 0.15s ease both;
}
.sub-option-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px; cursor: pointer;
  transition: background 0.12s;
}
.sub-option-row:hover { background: rgba(255,255,255,0.04); }
.sub-option-label { flex: 1; font: Geist 13px weight 500; color: #CBD5E1; }
/* Uses .toggle-switch from settings */

.sub-unsubscribe-btn {
  width: 100%; height: 34px; border-radius: 8px; margin-top: 4px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  color: #EF4444; font: Geist 12px weight 600; cursor: pointer;
  transition: all 0.12s;
}
.sub-unsubscribe-btn:hover { background: rgba(239,68,68,0.15); }
```

### Subscription Logic

```typescript
// Toggle subscription
export async function toggleSubscription(
  subscriberId: string,
  targetId: string,
  currentlySub: boolean,
  notifyOn?: { uploads: boolean; blogPosts: boolean }
) {
  const subId = `${subscriberId}_${targetId}`;
  const subRef = doc(db, 'subscriptions', subId);
  const batch = writeBatch(db);

  if (currentlySub) {
    // Unsubscribe
    batch.delete(subRef);
  } else {
    // Subscribe (also auto-follow if not already following)
    batch.set(subRef, {
      id: subId,
      subscriberId,
      targetId,
      notifyOn: notifyOn || { uploads: true, blogPosts: true },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Ensure they also follow this user
    const followId = `${subscriberId}_${targetId}`;
    const followRef = doc(db, 'follows', followId);
    const followSnap = await getDoc(followRef);
    if (!followSnap.exists()) {
      batch.set(followRef, { followerId: subscriberId, followingId: targetId, createdAt: serverTimestamp() });
      batch.update(doc(db, 'users', subscriberId), { followingCount: increment(1) });
      batch.update(doc(db, 'users', targetId), { followersCount: increment(1) });
    }
  }

  await batch.commit();
}

// Update subscription preferences
export async function updateSubscriptionPrefs(
  subscriberId: string,
  targetId: string,
  notifyOn: { uploads: boolean; blogPosts: boolean }
) {
  await updateDoc(doc(db, 'subscriptions', `${subscriberId}_${targetId}`), {
    notifyOn, updatedAt: serverTimestamp(),
  });
}

// Get all subscribers of a user (for notification dispatch)
export async function getSubscribers(targetId: string, contentType: 'uploads' | 'blogPosts') {
  const q = query(
    collection(db, 'subscriptions'),
    where('targetId', '==', targetId),
    where(`notifyOn.${contentType}`, '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().subscriberId as string);
}
```

---

## 5. COMPLETE NOTIFICATION TYPES

### Type Definitions

```typescript
type NotificationType =
  // Security
  | 'new_login'
  | 'new_device'
  | 'account_approved'
  | 'account_rejected'
  // Social
  | 'new_follower'
  | 'new_subscriber'
  | 'reaction'
  | 'comment'
  | 'reply'
  | 'mention'
  | 'comment_like'
  // Subscriptions
  | 'subscribed_upload'
  | 'subscribed_post'
  // Milestones
  | 'download_milestone'
  | 'like_milestone'
  | 'points_milestone'
  | 'featured_content'
  // System
  | 'admin_announcement';
```

### Full Notification Trigger Table

| Type | Trigger Event | Message Template | Default Push | Default Email |
|------|--------------|-----------------|-------------|--------------|
| `new_login` | User logs in from any device | `New login on {deviceName}. Not you? Secure your account.` | ✅ | ✅ |
| `new_device` | First login on a new device | `New device added: {deviceName}` | ✅ | ✅ |
| `account_approved` | Class/Super Admin approves | `Your ESUTSphere account is approved! Welcome 🎉` | ✅ | ✅ |
| `account_rejected` | Admin rejects with reason | `Account not approved. Reason: {reason}` | ✅ | ✅ |
| `new_follower` | Someone follows you | `{name} started following you` | ✅ | ❌ |
| `new_subscriber` | Someone subscribes to you | `{name} subscribed to your updates 🔔` | ✅ | ❌ |
| `reaction` | Someone reacts to your content | `{name} reacted {emoji} to "{title}"` | ❌ | ❌ |
| `comment` | Someone comments on your content | `{name} commented on "{title}"` | ✅ | ❌ |
| `reply` | Someone replies to your comment | `{name} replied to your comment` | ✅ | ❌ |
| `mention` | @mention in comment | `{name} mentioned you: "{snippet}"` | ✅ | ❌ |
| `comment_like` | Someone likes your comment | `{name} liked your comment` | ❌ | ❌ |
| `subscribed_upload` | Subscribed user uploads a doc | `{name} just uploaded: "{title}"` | ✅ | ❌ |
| `subscribed_post` | Subscribed user publishes a post | `{name} published: "{title}"` | ✅ | ❌ |
| `download_milestone` | Doc hits 100/500/1000 downloads | `🎉 "{title}" just hit {count} downloads!` | ✅ | ✅ |
| `like_milestone` | Content hits 50/100 likes | `🔥 "{title}" reached {count} likes!` | ✅ | ❌ |
| `points_milestone` | Earned new badge | `You earned the {badge} badge! 🏆` | ✅ | ❌ |
| `featured_content` | Admin features your content | `Your {type} "{title}" was featured by admin ⭐` | ✅ | ✅ |
| `admin_announcement` | Super admin broadcasts | `{announcement_text}` | ✅ | ❌ |

### Milestone Thresholds

```typescript
export const DOWNLOAD_MILESTONES = [100, 500, 1000, 5000];
export const LIKE_MILESTONES = [50, 100, 500];
export const POINTS_MILESTONES = [100, 250, 500, 1000, 2500];
```

---

## 6. NOTIFICATION DELIVERY — SERVER-SIDE API

### API Route: /api/notifications/send

```typescript
// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    type,           // NotificationType
    recipientId,    // single recipient OR array of recipients
    senderId,
    senderName,
    senderAvatar,
    targetId,
    targetType,
    message,        // pre-formatted message string
    data,           // extra metadata (title, emoji, count, etc.)
  } = body;

  const recipients = Array.isArray(recipientId) ? recipientId : [recipientId];

  // Process each recipient
  await Promise.all(recipients.map(uid => deliverNotification({
    type, uid, senderId, senderName, senderAvatar,
    targetId, targetType, message, data,
  })));

  return NextResponse.json({ success: true });
}

async function deliverNotification({
  type, uid, senderId, senderName, senderAvatar,
  targetId, targetType, message, data,
}) {
  const db = getFirestore();

  // 1. ALWAYS write to in-app notifications
  await addDoc(collection(db, 'notifications'), {
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
    createdAt: serverTimestamp(),
  });

  // 2. Fetch user preferences
  const prefDoc = await db.doc(`users/${uid}/preferences/notifications`).get();
  const prefs = prefDoc.exists
    ? prefDoc.data() as NotificationPreferences
    : DEFAULT_NOTIFICATION_PREFERENCES;

  const typePrefs = prefs.types[type];
  if (!typePrefs) return; // unknown type — in-app only

  // 3. Push notification (if enabled globally + per type)
  if (prefs.pushEnabled && typePrefs.push) {
    await sendPushNotification(uid, type, message, data, targetId, targetType);
  }

  // 4. Email notification (if enabled globally + per type)
  if (prefs.emailEnabled && typePrefs.email) {
    await sendNotificationEmail({ uid, type, message, data });
  }
}

async function sendPushNotification(uid, type, message, data, targetId?, targetType?) {
  const db = getFirestore();
  const messaging = getMessaging();

  // Get all active device tokens for this user
  const devicesSnap = await db
    .collection(`users/${uid}/devices`)
    .where('isActive', '==', true)
    .where('pushEnabled', '==', true)
    .get();

  if (devicesSnap.empty) return;

  const tokens = devicesSnap.docs
    .map(d => d.data().fcmToken)
    .filter(Boolean);

  if (tokens.length === 0) return;

  // Build FCM payload
  const notification = {
    title: 'ESUTSphere',
    body: message,
  };
  const fcmData = {
    type,
    targetId: targetId || '',
    targetType: targetType || '',
    ...data,
  };

  // Send to all tokens (multicast)
  const response = await messaging.sendEachForMulticast({
    tokens,
    notification,
    data: fcmData,
    webpush: {
      notification: {
        icon: '/logo.png',
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        requireInteraction: ['new_login', 'new_device', 'account_approved'].includes(type),
      },
      fcmOptions: {
        link: buildNotificationLink(type, targetId, targetType),
      },
    },
    android: {
      notification: { icon: 'notification_icon', color: '#7C3AED' },
    },
  });

  // Remove invalid/stale tokens
  const invalidTokens: string[] = [];
  response.responses.forEach((resp, idx) => {
    if (!resp.success) {
      const errorCode = resp.error?.code;
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered'
      ) {
        invalidTokens.push(tokens[idx]);
      }
    }
  });

  // Clean up stale tokens
  if (invalidTokens.length > 0) {
    const batch = db.batch();
    devicesSnap.docs.forEach(d => {
      if (invalidTokens.includes(d.data().fcmToken)) {
        batch.update(d.ref, { isActive: false, fcmToken: '' });
      }
    });
    await batch.commit();
  }
}

function buildNotificationLink(type: string, targetId?: string, targetType?: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  switch (type) {
    case 'new_login':
    case 'new_device':    return `${base}/dashboard/settings?tab=devices`;
    case 'account_approved':
    case 'account_rejected': return `${base}/feed`;
    case 'new_follower':
    case 'new_subscriber':   return `${base}/dashboard`;
    case 'reaction':
    case 'comment':
    case 'reply':
    case 'featured_content':
      if (targetType === 'document') return `${base}/library/${targetId}`;
      if (targetType === 'post') return `${base}/blog/${targetId}`;
      return `${base}/dashboard`;
    case 'subscribed_upload': return `${base}/library/${targetId}`;
    case 'subscribed_post':   return `${base}/blog/${targetId}`;
    case 'download_milestone':
    case 'like_milestone':    return `${base}/library/${targetId}`;
    default: return `${base}/notifications`;
  }
}
```

### Bulk Subscriber Notifications

```typescript
// Called when a user uploads a document
export async function notifySubscribersOfUpload(uploaderId: string, uploaderName: string, uploaderAvatar: string, docId: string, docTitle: string) {
  const subscribers = await getSubscribers(uploaderId, 'uploads');
  if (subscribers.length === 0) return;

  await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'subscribed_upload',
      recipientId: subscribers, // array → batch delivery
      senderId: uploaderId,
      senderName: uploaderName,
      senderAvatar: uploaderAvatar,
      targetId: docId,
      targetType: 'document',
      message: `${uploaderName} just uploaded: "${docTitle}"`,
      data: { docTitle },
    }),
  });
}
```

---

## 7. UPDATED FIRESTORE SCHEMA

### notifications collection (updated)

```typescript
interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  message: string;
  targetId?: string;
  targetType?: 'document' | 'post' | 'user' | 'comment';
  data?: Record<string, string>; // e.g., { emoji, count, deviceName }
  isRead: boolean;
  createdAt: Timestamp;
}
```

### subscriptions collection (new)

```typescript
// As defined in Section 4
```

### users/{uid}/devices subcollection (new)

```typescript
// As defined in Section 2
```

### users/{uid}/preferences/notifications (new)

```typescript
// As defined in Section 3
```

### Firestore Rules Update

```
// Devices subcollection
match /users/{uid}/devices/{deviceId} {
  allow read: if request.auth.uid == uid;
  allow create, update: if request.auth.uid == uid;
  allow delete: if request.auth.uid == uid;
}

// Notification preferences
match /users/{uid}/preferences/{doc} {
  allow read, write: if request.auth.uid == uid;
}

// Subscriptions
match /subscriptions/{subId} {
  allow read: if request.auth != null;
  allow create, delete: if request.auth != null
    && request.auth.uid == resource.data.subscriberId;
}
```

---

## 8. NOTIFICATION SETTINGS PAGE DESIGN

### Route

```
/dashboard/settings?tab=notifications
```

Add a new tab: **Notifications** (alongside Profile, Account) — and split into sub-sections.

---

### Settings Layout — Notifications Tab

```
┌────────────────────────────────────────────────────────────────────┐
│ NOTIFICATION SETTINGS                                               │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │  GLOBAL CHANNELS                                             │   │
│ │  Push Notifications  [toggle]                                │   │
│ │  Email Notifications [toggle]                               │   │
│ │  In-App Notifications  Always on ✓ (locked)                 │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │  NOTIFICATION TYPES                                          │   │
│ │  SECURITY                                                    │   │
│ │  New Login          [in-app ✓] [push ⬭] [email ⬭]          │   │
│ │  New Device         [in-app ✓] [push ⬭] [email ⬭]          │   │
│ │                                                              │   │
│ │  SOCIAL                                                      │   │
│ │  New Follower       [in-app ✓] [push ⬭] [email ○]          │   │
│ │  Reactions          [in-app ✓] [push ○] [email ○]          │   │
│ │  Comments           [in-app ✓] [push ⬭] [email ○]          │   │
│ │  Replies            [in-app ✓] [push ⬭] [email ○]          │   │
│ │  Mentions           [in-app ✓] [push ⬭] [email ○]          │   │
│ │  ...                                                         │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │  MY DEVICES                                                  │   │
│ │  [Device list — see below]                                   │   │
│ └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

### Global Channels Section

```css
.notif-global-channels {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; overflow: hidden; margin-bottom: 20px;
}
.global-channel-header {
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
  font: Geist 14px weight 700; color: #F8FAFC;
}
.global-channel-row {
  display: flex; align-items: center; padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.global-channel-row:last-child { border-bottom: none; }
.channel-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; font-size: 17px;
  flex-shrink: 0; margin-right: 14px;
}
.channel-icon.push  { background: rgba(124,58,237,0.12); }
.channel-icon.email { background: rgba(6,182,212,0.12); }
.channel-icon.inapp { background: rgba(16,185,129,0.12); }

.channel-info { flex: 1; }
.channel-label { font: Geist 14px weight 600; color: #F8FAFC; margin-bottom: 3px; }
.channel-desc  { font: Geist 12px; color: #94A3B8; line-height: 18px; }

/* In-app is locked */
.channel-locked {
  display: flex; align-items: center; gap: 6px;
  font: Geist 12px weight 600; color: #10B981;
  background: rgba(16,185,129,0.10); border: 1px solid rgba(16,185,129,0.2);
  border-radius: 9999px; padding: 4px 10px;
}
```

---

### Notification Types Section

```css
.notif-types-section {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; overflow: hidden; margin-bottom: 20px;
}

/* Category header within types section */
.notif-category-header {
  padding: 12px 20px 8px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font: Geist 11px weight 700; color: #475569;
  letter-spacing: 0.8px; text-transform: uppercase;
  display: flex; align-items: center; gap: 7px;
}
.notif-category-icon { font-size: 13px; }

/* Type row */
.notif-type-row {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.notif-type-row:last-child { border-bottom: none; }

.notif-type-label { flex: 1; font: Geist 14px weight 500; color: #CBD5E1; }
.notif-type-desc  { font: Geist 11px; color: #475569; margin-top: 2px; }

/* Channel toggles per row */
.notif-channel-toggles { display: flex; gap: 8px; align-items: center; }
.notif-channel-toggle {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.notif-channel-toggle-label {
  font: Geist 9px weight 700; color: #475569; text-transform: uppercase; letter-spacing: 0.4px;
}

/* In-app always-on indicator */
.notif-always-on {
  width: 32px; height: 18px; border-radius: 9999px;
  background: rgba(16,185,129,0.3); border: 1px solid rgba(16,185,129,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: #10B981;
}

/* Mini toggle (smaller than settings toggle) */
.mini-toggle { width: 36px; height: 20px; }
.mini-toggle .toggle-track::before { width: 15px; height: 15px; top: 2px; left: 2px; }
.mini-toggle input:checked + .toggle-track::before { transform: translateX(16px); }
```

---

### Device Management Section

```css
.devices-section {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; overflow: hidden;
}

.devices-header {
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: space-between;
  font: Geist 14px weight 700; color: #F8FAFC;
}
.logout-all-btn {
  height: 30px; padding: 0 12px; border-radius: 7px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  color: #EF4444; font: Geist 12px weight 600; cursor: pointer; transition: all 0.15s;
}
.logout-all-btn:hover { background: rgba(239,68,68,0.15); }

/* Device row */
.device-row {
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.12s;
}
.device-row:last-child { border-bottom: none; }
.device-row:hover { background: rgba(255,255,255,0.02); }

/* Device icon */
.device-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.15);
  display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
}
/* 💻 web  |  📱 android  |  🍎 ios */

.device-info { flex: 1; }
.device-name { font: Geist 14px weight 600; color: #F8FAFC; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }

/* Current device badge */
.current-device-badge {
  font: Geist 10px weight 700; padding: 2px 7px; border-radius: 9999px;
  background: rgba(16,185,129,0.12); color: #10B981; border: 1px solid rgba(16,185,129,0.25);
}

.device-meta {
  font: Geist 12px; color: #475569;
  display: flex; align-items: center; gap: 10px;
}
.device-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #475569; }
.device-status-active   { color: #10B981; font-weight: 600; }
.device-status-inactive { color: #475569; }

/* Device actions */
.device-actions { display: flex; align-items: center; gap: 10px; }

/* Push toggle per device */
.device-push-toggle {
  display: flex; align-items: center; gap: 7px;
}
.device-push-label { font: Geist 12px weight 500; color: #94A3B8; }
/* Uses mini-toggle */

/* Logout button */
.device-logout-btn {
  height: 30px; padding: 0 12px; border-radius: 7px;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 12px weight 500; cursor: pointer; transition: all 0.15s;
}
.device-logout-btn:hover { border-color: rgba(239,68,68,0.3); color: #EF4444; background: rgba(239,68,68,0.06); }

/* Inactive device row */
.device-row.inactive {
  opacity: 0.5;
}
.device-row.inactive:hover { opacity: 0.7; }
```

---

### Firestore Queries — Device Management

```typescript
// Get all user devices
export function useUserDevices(uid: string) {
  const [devices, setDevices] = useState<UserDevice[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'users', uid, 'devices'),
      orderBy('lastActiveAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setDevices(snap.docs.map(d => ({ id: d.id, ...d.data() })) as UserDevice[]);
    });
    return unsub;
  }, [uid]);

  return devices;
}

// Toggle push for a specific device
export async function toggleDevicePush(uid: string, deviceId: string, enabled: boolean) {
  await updateDoc(doc(db, 'users', uid, 'devices', deviceId), {
    pushEnabled: enabled,
    lastActiveAt: serverTimestamp(),
  });
}

// Logout a specific device remotely
export async function logoutDevice(uid: string, deviceId: string) {
  await updateDoc(doc(db, 'users', uid, 'devices', deviceId), {
    isActive: false,
    pushEnabled: false,
    fcmToken: '',
    loggedOutAt: serverTimestamp(),
  });
}

// Logout all other devices
export async function logoutAllOtherDevices(uid: string, currentDeviceId: string) {
  const q = query(
    collection(db, 'users', uid, 'devices'),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => {
    if (d.id !== currentDeviceId) {
      batch.update(d.ref, { isActive: false, pushEnabled: false, fcmToken: '', loggedOutAt: serverTimestamp() });
    }
  });
  await batch.commit();
}

// Save notification preferences
export async function saveNotificationPreferences(uid: string, prefs: NotificationPreferences) {
  await setDoc(
    doc(db, 'users', uid, 'preferences', 'notifications'),
    { ...prefs, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
```

---

## 9. LOGIN SECURITY NOTIFICATION

When a user logs in, fire a security notification:

```typescript
// Called in the auth flow after successful Google Sign In
export async function sendLoginNotification(uid: string, deviceInfo: { name: string; type: string }) {
  const currentDeviceId = localStorage.getItem('esut_device_id');
  
  // Check if this is a new device (not seen before)
  const devicesSnap = await getDocs(
    query(collection(db, 'users', uid, 'devices'), where('isActive', '==', true))
  );
  const isNewDevice = !devicesSnap.docs.some(d => d.id === currentDeviceId);
  const notifType = isNewDevice ? 'new_device' : 'new_login';
  
  await fetch('/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify({
      type: notifType,
      recipientId: uid,
      message: isNewDevice
        ? `New device added: ${deviceInfo.name}`
        : `New login on ${deviceInfo.name}. Not you? Go to Settings → Devices.`,
      data: { deviceName: deviceInfo.name, deviceType: deviceInfo.type },
    }),
  });
}
```

---

## 10. IN-APP NOTIFICATION BELL HOOK

```typescript
// hooks/useNotifications.ts
export function useNotifications(uid: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const markAsRead = async (notifId: string) => {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  };

  const markAllRead = async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  const groupedByDate = useMemo(() => groupNotificationsByDate(notifications), [notifications]);

  return { notifications, groupedByDate, unreadCount, loading, markAsRead, markAllRead };
}
```

---

## 11. ENVIRONMENT VARIABLES ADDITIONS

```env
# Firebase Admin SDK (server-side — for push notifications)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=       # store with escaped \n characters

# FCM Web Push
NEXT_PUBLIC_FCM_VAPID_KEY=        # from Firebase Console → Project Settings → Cloud Messaging
```

---

## 12. WHAT NOT TO DO

| Rule | Reason |
|------|--------|
| ❌ Never store FCM tokens as a flat array on the user document | Firestore 1MB doc limit, harder to manage per-device |
| ❌ Never send push to inactive/logged-out devices | Waste of FCM quota + confusing UX |
| ❌ Never delete logged-out device records immediately | User should see device history for security awareness |
| ❌ Never fire reaction notifications for every single reaction | Too noisy — default push is OFF for reactions |
| ❌ Never skip cleanup of stale/invalid FCM tokens | They accumulate and slow down FCM multicast |
| ❌ Never send email for real-time social events (reactions, follows) | Email is for high-importance/permanent events only |
| ❌ Never allow in-app notifications to be disabled | They are the ground truth — push and email are extras |
| ❌ Never confuse Subscribe with Follow | They are separate relationships — unsubscribing must NOT unfollow |
| ❌ Never send subscriber notifications for feed posts (regular posts) | Only for uploads and blog posts — feed posts are too frequent |
| ❌ Never send login security notification if user is already on an active session on that same device | Avoid false alarms by checking deviceId first |
| ❌ Never fire milestone notifications on every increment | Only at exact thresholds (100, 500, 1000) — check exact count match |
| ❌ Never store `FIREBASE_ADMIN_PRIVATE_KEY` in a NEXT_PUBLIC_ env var | Server-side only — exposing this is catastrophic |

---

*ESUTSphere NOTIFICATIONS.md — v1.0*
*Three channels: In-app (always) · Push (FCM, per device) · Email (high-importance only)*
*Two follow levels: Follow (feed) · Subscribe (notifications)*
*Every notification the user receives, regardless of channel, also appears in the bell.*
