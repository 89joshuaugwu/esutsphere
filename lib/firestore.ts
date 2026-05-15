import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  writeBatch,
  DocumentSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import type {
  User,
  Document,
  Post,
  Comment,
  Reaction,
  ReactionType,
  Follow,
  Bookmark,
  Notification,
  Report,
  DocumentFilters,
  SearchRecord,
} from '@/types';

// ─── USERS ───────────────────────────────────────────────────────

export async function getUserByUid(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as User) : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as User);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return user === null;
}

export async function createUserDoc(uid: string, data: Partial<User>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      uid,
      followersCount: 0,
      followingCount: 0,
      uploadsCount: 0,
      totalLikesReceived: 0,
      totalDownloads: 0,
      points: 0,
      badges: [],
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user doc:', error);
    throw error;
  }
}

export async function updateUserDoc(uid: string, data: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// ─── DOCUMENTS ───────────────────────────────────────────────────

export async function getDocuments(
  filters: DocumentFilters,
  lastDoc?: DocumentSnapshot,
  pageSize = 18
): Promise<{ docs: Document[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('isApproved', '==', true),
      orderBy(filters.sortBy, 'desc'),
      limit(pageSize),
    ];

    if (filters.contentType) constraints.push(where('contentType', '==', filters.contentType));
    if (filters.department) constraints.push(where('department', '==', filters.department));
    if (filters.level) constraints.push(where('level', '==', filters.level));
    if (filters.isLecturerUpload) constraints.push(where('isLecturerUpload', '==', true));
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, 'documents'), ...constraints);
    const snap = await getDocs(q);

    return {
      docs: snap.docs.map(d => ({ id: d.id, ...d.data() } as Document)),
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { docs: [], lastDoc: null };
  }
}

export async function getDocumentById(docId: string): Promise<Document | null> {
  try {
    const snap = await getDoc(doc(db, 'documents', docId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Document) : null;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

export async function createDocument(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...data,
      viewCount: 0,
      downloadCount: 0,
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      isPinned: false,
      isApproved: true,
      isFeatured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Update uploader's upload count
    await updateDoc(doc(db, 'users', data.uploaderId), {
      uploadsCount: increment(1),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function incrementDocView(docId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'documents', docId), { viewCount: increment(1) });
  } catch (error) {
    console.error('Error incrementing view:', error);
  }
}

export async function incrementDocDownload(docId: string, uploaderId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'documents', docId), { downloadCount: increment(1) });
    batch.update(doc(db, 'users', uploaderId), { totalDownloads: increment(1) });
    await batch.commit();
  } catch (error) {
    console.error('Error incrementing download:', error);
  }
}

// ─── POSTS (Blog) ────────────────────────────────────────────────

export async function getPosts(
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(pageSize),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, 'posts'), ...constraints);
    const snap = await getDocs(q);
    return {
      posts: snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)),
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], lastDoc: null };
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...data,
      likesCount: 0,
      commentsCount: 0,
      viewCount: 0,
      bookmarksCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: data.isPublished ? serverTimestamp() : null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// ─── REACTIONS ───────────────────────────────────────────────────

export async function toggleReaction(
  userId: string,
  targetId: string,
  targetType: 'document' | 'post',
  reactionType: ReactionType
): Promise<boolean> {
  try {
    const reactionId = `${userId}_${targetId}_${reactionType}`;
    const reactionRef = doc(db, 'reactions', reactionId);
    const existing = await getDoc(reactionRef);
    const targetRef = doc(db, targetType === 'document' ? 'documents' : 'posts', targetId);

    if (existing.exists()) {
      await deleteDoc(reactionRef);
      await updateDoc(targetRef, { likesCount: increment(-1) });
      return false;
    } else {
      await setDoc(reactionRef, {
        id: reactionId,
        userId,
        targetId,
        targetType,
        reactionType,
        createdAt: serverTimestamp(),
      });
      await updateDoc(targetRef, { likesCount: increment(1) });
      return true;
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw error;
  }
}

export async function getUserReactions(
  userId: string,
  targetIds: string[]
): Promise<Record<string, ReactionType>> {
  try {
    if (targetIds.length === 0) return {};
    const chunks = chunkArray(targetIds, 30);
    const results: Record<string, ReactionType> = {};

    for (const chunk of chunks) {
      const q = query(
        collection(db, 'reactions'),
        where('userId', '==', userId),
        where('targetId', 'in', chunk)
      );
      const snap = await getDocs(q);
      snap.docs.forEach(d => {
        const data = d.data() as Reaction;
        results[data.targetId] = data.reactionType;
      });
    }
    return results;
  } catch (error) {
    console.error('Error fetching user reactions:', error);
    return {};
  }
}

// ─── COMMENTS ────────────────────────────────────────────────────

export async function getComments(
  targetId: string,
  targetType: 'document' | 'post'
): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, 'comments'),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function addComment(data: Omit<Comment, 'id' | 'createdAt' | 'likesCount' | 'isDeleted'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      ...data,
      likesCount: 0,
      isDeleted: false,
      createdAt: serverTimestamp(),
    });
    // Increment comment count on target
    const targetCollection = data.targetType === 'document' ? 'documents' : 'posts';
    await updateDoc(doc(db, targetCollection, data.targetId), {
      commentsCount: increment(1),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// ─── FOLLOWS ─────────────────────────────────────────────────────

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  try {
    const followId = `${followerId}_${followingId}`;
    const followRef = doc(db, 'follows', followId);
    const existing = await getDoc(followRef);
    const batch = writeBatch(db);

    if (existing.exists()) {
      batch.delete(followRef);
      batch.update(doc(db, 'users', followerId), { followingCount: increment(-1) });
      batch.update(doc(db, 'users', followingId), { followersCount: increment(-1) });
      await batch.commit();
      return false;
    } else {
      batch.set(followRef, {
        id: followId,
        followerId,
        followingId,
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, 'users', followerId), { followingCount: increment(1) });
      batch.update(doc(db, 'users', followingId), { followersCount: increment(1) });
      await batch.commit();
      return true;
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const followId = `${followerId}_${followingId}`;
    const snap = await getDoc(doc(db, 'follows', followId));
    return snap.exists();
  } catch (error) {
    console.error('Error checking follow:', error);
    return false;
  }
}

// ─── BOOKMARKS ───────────────────────────────────────────────────

export async function toggleBookmark(
  userId: string,
  targetId: string,
  targetType: 'document' | 'post'
): Promise<boolean> {
  try {
    const bookmarkId = `${userId}_${targetId}`;
    const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
    const existing = await getDoc(bookmarkRef);
    const targetCollection = targetType === 'document' ? 'documents' : 'posts';

    if (existing.exists()) {
      await deleteDoc(bookmarkRef);
      await updateDoc(doc(db, targetCollection, targetId), { bookmarksCount: increment(-1) });
      return false;
    } else {
      await setDoc(bookmarkRef, {
        id: bookmarkId,
        userId,
        targetId,
        targetType,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, targetCollection, targetId), { bookmarksCount: increment(1) });
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

export async function getUserBookmarks(
  userId: string,
  targetType?: 'document' | 'post'
): Promise<Bookmark[]> {
  try {
    const constraints: QueryConstraint[] = [where('userId', '==', userId), orderBy('createdAt', 'desc')];
    if (targetType) constraints.push(where('targetType', '==', targetType));

    const q = query(collection(db, 'bookmarks'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Bookmark));
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────

export async function getNotifications(
  recipientId: string,
  pageSize = 30,
  lastDoc?: DocumentSnapshot
): Promise<{ notifications: Notification[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('recipientId', '==', recipientId),
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, 'notifications'), ...constraints);
    const snap = await getDocs(q);
    return {
      notifications: snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)),
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], lastDoc: null };
  }
}

export async function markNotificationRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
  }
}

export async function markAllNotificationsRead(recipientId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications read:', error);
  }
}

// ─── REPORTS ─────────────────────────────────────────────────────

export async function createReport(data: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

// ─── ADMIN ───────────────────────────────────────────────────────

export async function getPendingUsers(
  filters?: { department?: string; level?: string },
  pageSize = 20
): Promise<User[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('approvalStatus', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(pageSize),
    ];
    if (filters?.department) constraints.push(where('department', '==', filters.department));
    if (filters?.level) constraints.push(where('currentLevel', '==', filters.level));

    const q = query(collection(db, 'users'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as User);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return [];
  }
}

export async function approveUser(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role: 'student',
      approvalStatus: 'approved',
      isVerified: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
}

export async function rejectUser(uid: string, reason: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      approvalStatus: 'rejected',
      rejectionReason: reason,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
}

// ─── SEARCH ──────────────────────────────────────────────────────

export async function searchIndex(
  searchQuery: string,
  type?: 'document' | 'post' | 'user'
): Promise<SearchRecord[]> {
  try {
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    const constraints: QueryConstraint[] = [
      where('titleTokens', 'array-contains', tokens[0]),
      limit(20),
    ];
    if (type) constraints.push(where('type', '==', type));

    const q = query(collection(db, 'search_index'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SearchRecord));
  } catch (error) {
    console.error('Error searching:', error);
    return [];
  }
}

// ─── FEED QUERIES ────────────────────────────────────────────────

export async function getDeptFeed(
  dept: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  try {
    const constraints: QueryConstraint[] = [
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(pageSize),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, 'posts'), ...constraints);
    const snap = await getDocs(q);
    return {
      posts: snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)),
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
  } catch (error) {
    console.error('Error fetching dept feed:', error);
    return { posts: [], lastDoc: null };
  }
}

export async function getFollowingFeed(
  uid: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<Post[]> {
  try {
    const followsSnap = await getDocs(
      query(collection(db, 'follows'), where('followerId', '==', uid), limit(50))
    );
    const followedIds = followsSnap.docs.map(d => d.data().followingId as string);
    if (followedIds.length === 0) return [];

    const chunks = chunkArray(followedIds, 30);
    const results: Post[] = [];

    for (const chunk of chunks) {
      const q = query(
        collection(db, 'posts'),
        where('authorId', 'in', chunk),
        where('isPublished', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
      );
      const snap = await getDocs(q);
      results.push(...snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    }

    return results.sort((a, b) => (b.publishedAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? 0));
  } catch (error) {
    console.error('Error fetching following feed:', error);
    return [];
  }
}

// ─── UTILITY ─────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
