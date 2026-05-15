import { db } from '@/lib/firebase';
import {
  collection, doc, getDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, limit, startAfter,
  increment, serverTimestamp, writeBatch, deleteField,
  getCountFromServer, DocumentSnapshot, QueryConstraint,
} from 'firebase/firestore';
import type { User, AdminAction } from '@/types';

// ─── ADMIN STATS ─────────────────────────────────────────────────

export async function getAdminStats() {
  try {
    const [usersSnap, pendingSnap, docsSnap, postsSnap, reportsSnap] = await Promise.all([
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(query(collection(db, 'users'), where('approvalStatus', '==', 'pending'))),
      getCountFromServer(query(collection(db, 'documents'), where('isApproved', '==', true))),
      getCountFromServer(query(collection(db, 'posts'), where('isPublished', '==', true))),
      getCountFromServer(query(collection(db, 'reports'), where('status', '==', 'pending'))),
    ]);
    return {
      totalUsers: usersSnap.data().count,
      pendingApprovals: pendingSnap.data().count,
      totalDocuments: docsSnap.data().count,
      totalPosts: postsSnap.data().count,
      pendingReports: reportsSnap.data().count,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return { totalUsers: 0, pendingApprovals: 0, totalDocuments: 0, totalPosts: 0, pendingReports: 0 };
  }
}

// ─── PENDING USERS ───────────────────────────────────────────────

export async function getAllPendingUsers(lastDoc?: DocumentSnapshot) {
  try {
    const constraints: QueryConstraint[] = [
      where('approvalStatus', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(20),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));
    const snap = await getDocs(query(collection(db, 'users'), ...constraints));
    return {
      users: snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)),
      lastDoc: snap.docs.at(-1) || null,
    };
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return { users: [], lastDoc: null };
  }
}

// Class admin scoped
export async function getClassAdminPending(dept: string, level: string) {
  try {
    const q = query(
      collection(db, 'users'),
      where('approvalStatus', '==', 'pending'),
      where('department', '==', dept),
      where('currentLevel', '==', level),
      orderBy('createdAt', 'asc'),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
  } catch (error) {
    console.error('Error fetching class admin pending:', error);
    return [];
  }
}

// ─── ALL USERS (ADMIN TABLE) ────────────────────────────────────

export async function getAdminUsers(filters: {
  role?: string;
  status?: string;
  dept?: string;
  search?: string;
  lastDoc?: DocumentSnapshot;
}) {
  try {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(25)];
    if (filters.role) constraints.push(where('role', '==', filters.role));
    if (filters.status) constraints.push(where('approvalStatus', '==', filters.status));
    if (filters.dept) constraints.push(where('department', '==', filters.dept));
    if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));
    const snap = await getDocs(query(collection(db, 'users'), ...constraints));
    return {
      users: snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)),
      lastDoc: snap.docs.at(-1) || null,
    };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { users: [], lastDoc: null };
  }
}

// ─── CLASS MEMBERS ──────────────────────────────────────────────

export async function getClassMembers(dept: string, level: string) {
  try {
    const q = query(
      collection(db, 'users'),
      where('department', '==', dept),
      where('currentLevel', '==', level),
      where('approvalStatus', '==', 'approved'),
      orderBy('displayName', 'asc'),
      limit(200),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
  } catch (error) {
    console.error('Error fetching class members:', error);
    return [];
  }
}

// ─── APPROVE USER ───────────────────────────────────────────────

export async function approveUser(studentId: string, adminId: string, adminName: string, adminRole: 'super_admin' | 'class_admin') {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', studentId), {
    role: 'student',
    approvalStatus: 'approved',
    approvedBy: adminId,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    points: increment(20),
  });
  batch.set(doc(collection(db, 'notifications')), {
    recipientId: studentId,
    type: 'account_approved',
    message: 'Your ESUTSphere account has been approved! Welcome 🎉',
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  await logAdminAction({ adminId, adminName, adminRole, action: 'approve_user', targetId: studentId, targetType: 'user', details: {} });
  // Send email
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: 'account_approved', recipientId: studentId }),
    });
  } catch (e) { console.error('Email send failed:', e); }
}

// ─── REJECT USER ────────────────────────────────────────────────

export async function rejectUser(studentId: string, reason: string, adminId: string, adminName: string, adminRole: 'super_admin' | 'class_admin') {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', studentId), {
    approvalStatus: 'rejected',
    rejectionReason: reason,
    rejectedBy: adminId,
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, 'notifications')), {
    recipientId: studentId,
    type: 'account_rejected',
    message: `Your account was not approved. Reason: ${reason}`,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  await logAdminAction({ adminId, adminName, adminRole, action: 'reject_user', targetId: studentId, targetType: 'user', details: { reason } });
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: 'account_rejected', recipientId: studentId, reason }),
    });
  } catch (e) { console.error('Email send failed:', e); }
}

// ─── ASSIGN CLASS ADMIN ─────────────────────────────────────────

export async function assignClassAdmin(userId: string, dept: string, level: string, adminId: string, adminName: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'class_admin',
    classAdminDept: dept,
    classAdminLevel: level,
    classAdminAssignedBy: adminId,
    classAdminAssignedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'notifications'), {
    recipientId: userId,
    type: 'account_approved',
    message: `You've been assigned as Class Admin for ${dept} · ${level}. Check your Class Panel.`,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await logAdminAction({ adminId, adminName, adminRole: 'super_admin', action: 'assign_class_admin', targetId: userId, targetType: 'user', details: { dept, level } });
}

// ─── REMOVE CLASS ADMIN ─────────────────────────────────────────

export async function removeClassAdmin(userId: string, adminId: string, adminName: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'student',
    classAdminDept: deleteField(),
    classAdminLevel: deleteField(),
    updatedAt: serverTimestamp(),
  });
  await logAdminAction({ adminId, adminName, adminRole: 'super_admin', action: 'remove_class_admin', targetId: userId, targetType: 'user', details: {} });
}

// ─── SUSPEND USER ───────────────────────────────────────────────

export async function suspendUser(userId: string, reason: string, adminId: string, adminName: string) {
  await updateDoc(doc(db, 'users', userId), {
    approvalStatus: 'rejected',
    role: 'pending',
    rejectionReason: `Account suspended: ${reason}`,
    suspendedBy: adminId,
    suspendedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logAdminAction({ adminId, adminName, adminRole: 'super_admin', action: 'suspend_user', targetId: userId, targetType: 'user', details: { reason } });
}

// ─── CONTENT MODERATION ─────────────────────────────────────────

export async function removeContent(targetId: string, targetType: 'document' | 'post', adminId: string, adminName: string, reason: string) {
  const col = targetType === 'document' ? 'documents' : 'posts';
  await updateDoc(doc(db, col, targetId), {
    isApproved: false,
    isPublished: false,
    removedBy: adminId,
    removalReason: reason,
    removedAt: serverTimestamp(),
  });
  await logAdminAction({ adminId, adminName, adminRole: 'super_admin', action: 'remove_content', targetId, targetType, details: { reason } });
}

export async function toggleFeatured(targetId: string, targetType: 'document' | 'post', featured: boolean, adminId: string, adminName: string) {
  const col = targetType === 'document' ? 'documents' : 'posts';
  await updateDoc(doc(db, col, targetId), { isFeatured: featured, updatedAt: serverTimestamp() });
  await logAdminAction({ adminId, adminName, adminRole: 'super_admin', action: 'feature_content', targetId, targetType, details: { featured } });
}

// ─── REPORTS ────────────────────────────────────────────────────

export async function getReports(status: 'pending' | 'resolved' | 'dismissed' = 'pending') {
  try {
    const q = query(
      collection(db, 'reports'),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function resolveReport(reportId: string, resolution: 'resolved' | 'dismissed', adminId: string, adminName: string) {
  await updateDoc(doc(db, 'reports', reportId), {
    status: resolution,
    resolvedBy: adminId,
    resolvedAt: serverTimestamp(),
  });
  await logAdminAction({ adminId, adminName, adminRole: 'super_admin', action: 'resolve_report', targetId: reportId, targetType: 'report', details: { resolution } });
}

// ─── ACTIVITY LOG ───────────────────────────────────────────────

export async function logAdminAction(log: {
  adminId: string;
  adminName: string;
  adminRole: 'super_admin' | 'class_admin';
  action: AdminAction;
  targetId: string;
  targetType: 'user' | 'document' | 'post' | 'report' | 'setting';
  details: Record<string, unknown>;
}) {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      ...log,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

export async function getRecentAdminLogs(count = 20) {
  try {
    const q = query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
}

// ─── GET CONTENT FOR ADMIN TABLE ────────────────────────────────

export async function getAdminDocuments(filters?: { dept?: string; contentType?: string; flaggedOnly?: boolean }) {
  try {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(50)];
    if (filters?.dept) constraints.push(where('department', '==', filters.dept));
    if (filters?.contentType) constraints.push(where('contentType', '==', filters.contentType));
    const snap = await getDocs(query(collection(db, 'documents'), ...constraints));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching admin documents:', error);
    return [];
  }
}

export async function getAdminPosts() {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return [];
  }
}
