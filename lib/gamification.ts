import { db } from "@/lib/firebase";
import { doc, increment, updateDoc, getDoc, arrayUnion } from "firebase/firestore";

export const POINTS = {
  UPLOAD_DOCUMENT: 10,
  PUBLISH_POST: 5,
  RECEIVE_LIKE: 1,
  RECEIVE_COMMENT: 2,
  RECEIVE_DOWNLOAD: 3,
  COMMENT_ON_CONTENT: 1,
  DAILY_LOGIN: 2,
  ACCOUNT_VERIFIED: 20,
};

export const BADGES = {
  NOTE_LEGEND: 'note_legend',
  TOP_CONTRIBUTOR: 'top_contributor',
  RESEARCH_KING: 'research_king',
  POPULAR: 'popular',
  VIRAL_CONTENT: 'viral_content',
  CONSISTENT: 'consistent',
};

export async function awardPoints(userId: string, points: number, reason: string) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      points: increment(points)
    });
    await checkAndAwardBadges(userId);
  } catch (error) {
    console.error("Error awarding points:", error);
  }
}

async function checkAndAwardBadges(userId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  const data = userSnap.data();
  
  const newBadges: string[] = [];
  const currentBadges = data.badges || [];

  if (data.uploadsCount >= 10 && !currentBadges.includes(BADGES.NOTE_LEGEND)) {
    newBadges.push(BADGES.NOTE_LEGEND);
  }
  
  if (data.points >= 500 && !currentBadges.includes(BADGES.TOP_CONTRIBUTOR)) {
    newBadges.push(BADGES.TOP_CONTRIBUTOR);
  }
  
  if (data.followersCount >= 100 && !currentBadges.includes(BADGES.POPULAR)) {
    newBadges.push(BADGES.POPULAR);
  }

  if (newBadges.length > 0) {
    await updateDoc(userRef, {
      badges: arrayUnion(...newBadges)
    });
  }
}
