import { NextResponse } from "next/server";
import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
  return initializeApp({ credential: cert(serviceAccount) });
}

function getAdminDb() {
  getAdminApp();
  return getFirestore();
}

type OtpPurpose = "email_verification" | "password_reset" | "two_factor" | "link_password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, purpose } = body as {
      email: string;
      code: string;
      purpose: OtpPurpose;
    };

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: "Missing email, code, or purpose" }, { status: 400 });
    }

    const db = getAdminDb();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const now = new Date();

    // ── Find matching OTP ──
    const snap = await db
      .collection("otp_codes")
      .where("email", "==", email.toLowerCase())
      .where("purpose", "==", purpose)
      .where("used", "==", false)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "No active OTP found. Please request a new code." },
        { status: 404 }
      );
    }

    const otpDoc = snap.docs[0];
    const otpData = otpDoc.data();

    // ── Check expiry ──
    const expiresAt = otpData.expiresAt?.toDate?.() || new Date(otpData.expiresAt);
    if (now > expiresAt) {
      // Mark as expired, will be cleaned up later
      await otpDoc.ref.update({ used: true });
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // ── Check attempts (max 5) ──
    const attempts = otpData.attempts || 0;
    if (attempts >= (otpData.maxAttempts || 5)) {
      await otpDoc.ref.update({ used: true });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      );
    }

    // ── Verify hash ──
    if (otpData.codeHash !== codeHash) {
      await otpDoc.ref.update({ attempts: attempts + 1 });
      const remaining = (otpData.maxAttempts || 5) - attempts - 1;
      return NextResponse.json(
        { error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` },
        { status: 400 }
      );
    }

    // ── OTP is valid — mark as used and delete ──
    await otpDoc.ref.delete();

    // ── Also clean up any other OTPs for this email+purpose ──
    const otherSnap = await db
      .collection("otp_codes")
      .where("email", "==", email.toLowerCase())
      .where("purpose", "==", purpose)
      .get();

    if (!otherSnap.empty) {
      const batch = db.batch();
      otherSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed";
    console.error("OTP verify error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
