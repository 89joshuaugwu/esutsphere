import { NextResponse } from "next/server";
import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export async function GET() {
  try {
    let app;
    if (!getApps().length) {
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error("FIREBASE_PRIVATE_KEY is missing");
      }
      
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      
      app = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } else {
      app = getApp();
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Try a simple operation to verify permissions
    const listUsersResult = await auth.listUsers(1);
    const usersCount = listUsersResult.users.length;

    // Optional: test firestore
    const testDoc = await db.collection("settings").doc("global").get();
    
    return NextResponse.json({
      success: true,
      message: "Firebase Admin SDK is active and correctly configured.",
      data: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        sampleUserCountFound: usersCount,
        firestoreAccess: testDoc.exists ? "Success" : "Success (Document doesn't exist but read was allowed)"
      }
    });
  } catch (error: any) {
    console.error("Firebase Admin SDK test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error",
      details: error.stack
    }, { status: 500 });
  }
}
