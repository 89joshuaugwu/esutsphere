import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
  return initializeApp({ credential: cert(sa) });
}

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Missing email or newPassword" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const app = getAdminApp();
    const adminAuth = getAuth(app);

    // Find user by email
    const userRecord = await adminAuth.getUserByEmail(email);
    if (!userRecord) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    // Update password using Admin SDK
    await adminAuth.updateUser(userRecord.uid, { password: newPassword });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    console.error("Password reset error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
