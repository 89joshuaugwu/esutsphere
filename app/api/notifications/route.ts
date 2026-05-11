import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { userId, type, title, message, link } = await req.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, "users", userId, "notifications"), {
      type,
      title,
      message,
      link: link || null,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
