import { Timestamp } from "firebase/firestore";

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
  role: 'pending' | 'student' | 'lecturer' | 'class_admin' | 'super_admin';
  approvalStatus: 'pending' | 'approved' | 'rejected';
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
  badges: string[];

  // Meta
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'audio';
  fileSizeKb: number;
  thumbnailUrl?: string;

  // Taxonomy
  contentType: 'notes' | 'past_questions' | 'research' | 'assignment' | 'seminar' | 'textbook' | 'handout' | 'project';
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
