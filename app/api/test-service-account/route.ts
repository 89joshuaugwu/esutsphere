import { NextResponse } from "next/server";
import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export async function GET() {
  try {
    let app;
    if (!getApps().length) {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
      }
      
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      app = initializeApp({
        credential: cert(serviceAccount),
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
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY).client_email : null,
        hasPrivateKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
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
