import { Timestamp } from "firebase/firestore";

// ─── USER ────────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  profilePicture: string;
  coverPhoto?: string;
  bio?: string;

  // Academic
  matricNumber: string;
  department: string;
  faculty: string;
  yearOfEntry: string;
  currentLevel: string;

  // Auth
  role: UserRole;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  admissionLetterUrl: string;

  // Class Admin
  classAdminDept?: string;
  classAdminLevel?: string;

  // Social
  followersCount: number;
  followingCount: number;
  uploadsCount: number;
  totalLikesReceived: number;
  totalDownloads: number;

  // Gamification
  points: number;
  badges: BadgeId[];

  // Meta
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
}

export type UserRole = 'pending' | 'student' | 'lecturer' | 'class_admin' | 'super_admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ─── DOCUMENT ────────────────────────────────────────────────────
export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: FileType;
  fileSizeKb: number;
  thumbnailUrl?: string;

  // Taxonomy
  contentType: ContentType;
  department: string;
  faculty: string;
  courseCode: string;
  courseName: string;
  level: string;
  academicSession: string;

  // Uploader
  uploaderId: string;
  uploaderName: string;
  uploaderUsername: string;
  uploaderAvatar: string;
  isLecturerUpload: boolean;

  // Engagement
  viewCount: number;
  downloadCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;

  // Meta
  isPinned: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type FileType = 'pdf' | 'docx' | 'pptx' | 'image' | 'audio';
export type ContentType = 'notes' | 'past_questions' | 'research' | 'assignment' | 'seminar' | 'textbook' | 'handout' | 'project';

// ─── POST (Blog) ────────────────────────────────────────────────
export interface Post {
  id: string;
  slug: string;
  title: string;
  coverImage?: string;
  excerpt: string;
  content: string;
  readingTimeMinutes: number;
  category: PostCategory;
  tags: string[];
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  bookmarksCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp;
}

export type PostCategory = 'campus_news' | 'academic' | 'tech' | 'career' | 'opinions' | 'lifestyle';

// ─── REACTION ────────────────────────────────────────────────────
export interface Reaction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'post';
  reactionType: ReactionType;
  createdAt: Timestamp;
}

export type ReactionType = 'like' | 'love' | 'fire' | 'insightful' | 'funny';

// ─── COMMENT ─────────────────────────────────────────────────────
export interface Comment {
  id: string;
  targetId: string;
  targetType: 'document' | 'post';
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  parentCommentId?: string;
  likesCount: number;
  createdAt: Timestamp;
  isDeleted: boolean;
}

// ─── FOLLOW ──────────────────────────────────────────────────────
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Timestamp;
}

// ─── BOOKMARK ────────────────────────────────────────────────────
export interface Bookmark {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'post';
  createdAt: Timestamp;
}

// ─── NOTIFICATION ────────────────────────────────────────────────
export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  message: string;
  targetId?: string;
  targetType?: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Timestamp;
}

export type NotificationType =
  | 'new_login'
  | 'new_device'
  | 'account_approved'
  | 'account_rejected'
  | 'new_follower'
  | 'new_subscriber'
  | 'reaction'
  | 'comment'
  | 'reply'
  | 'mention'
  | 'comment_like'
  | 'subscribed_upload'
  | 'subscribed_post'
  | 'download_milestone'
  | 'like_milestone'
  | 'points_milestone'
  | 'featured_content'
  | 'admin_announcement';

// ─── REPORT ──────────────────────────────────────────────────────
export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'document' | 'post' | 'comment' | 'user';
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Timestamp;
}

export type ReportReason = 'spam' | 'wrong_info' | 'inappropriate' | 'copyright' | 'other';

// ─── SEARCH INDEX ────────────────────────────────────────────────
export interface SearchRecord {
  id: string;
  type: 'document' | 'post' | 'user';
  title: string;
  titleTokens: string[];
  snippet: string;
  courseCode?: string;
  department?: string;
  level?: string;
  authorName: string;
  thumbnailUrl?: string;
  createdAt: Timestamp;
}

// ─── SUBSCRIPTION ────────────────────────────────────────────────
export interface Subscription {
  id: string;
  subscriberId: string;
  targetId: string;
  notifyOn: {
    uploads: boolean;
    blogPosts: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── FCM DEVICE ──────────────────────────────────────────────────
export interface UserDevice {
  deviceId: string;
  fcmToken: string;
  deviceName: string;
  deviceType: 'web' | 'android' | 'ios';
  browser?: string;
  os?: string;
  isActive: boolean;
  pushEnabled: boolean;
  lastActiveAt: Timestamp;
  createdAt: Timestamp;
  loggedOutAt?: Timestamp;
  ipAddress?: string;
  loginLocation?: string;
}

// ─── NOTIFICATION PREFERENCES ────────────────────────────────────
export interface NotifChannelConfig {
  inApp: true;
  push: boolean;
  email: boolean;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  types: Record<NotificationType, NotifChannelConfig>;
  updatedAt: Timestamp;
}

// ─── GAMIFICATION ────────────────────────────────────────────────
export type BadgeId =
  | 'note_legend'
  | 'top_contributor'
  | 'research_king'
  | 'popular'
  | 'viral_content'
  | 'consistent';

// ─── DOCUMENT FILTER STATE ───────────────────────────────────────
export interface DocumentFilters {
  contentType?: ContentType;
  department?: string;
  level?: string;
  courseCode?: string;
  academicSession?: string;
  isLecturerUpload?: boolean;
  sortBy: 'createdAt' | 'downloadCount' | 'likesCount';
  searchQuery?: string;
}

// ─── FEED POST DISPLAY ──────────────────────────────────────────
export interface FeedPostData {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  title?: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category?: PostCategory;
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  bookmarksCount: number;
  createdAt: Timestamp;
  publishedAt: Timestamp;
  // Attached document reference (optional)
  attachedDocId?: string;
  attachedDocTitle?: string;
  attachedDocType?: ContentType;
  attachedDocCourseCode?: string;
}

// ─── ADMIN LOG ──────────────────────────────────────────────────
export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: 'super_admin' | 'class_admin';
  action: AdminAction;
  targetId: string;
  targetType: 'user' | 'document' | 'post' | 'report' | 'setting';
  details: Record<string, unknown>;
  timestamp: Timestamp;
}

export type AdminAction =
  | 'approve_user'
  | 'reject_user'
  | 'assign_class_admin'
  | 'remove_class_admin'
  | 'suspend_user'
  | 'remove_content'
  | 'resolve_report'
  | 'feature_content'
  | 'update_settings';
