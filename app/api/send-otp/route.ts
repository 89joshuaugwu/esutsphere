import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { otpEmailTemplate } from "@/lib/email-templates";

// Firebase Admin SDK for server-side Firestore access
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
  return initializeApp({ credential: cert(serviceAccount) });
}

function getAdminDb() {
  getAdminApp();
  return getFirestore();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

type OtpPurpose = "email_verification" | "password_reset" | "two_factor" | "link_password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, purpose, displayName } = body as {
      email: string;
      purpose: OtpPurpose;
      displayName?: string;
    };

    if (!email || !purpose) {
      return NextResponse.json({ error: "Missing email or purpose" }, { status: 400 });
    }

    const db = getAdminDb();

    // ── Rate limiting: max 3 active OTPs per email per purpose ──
    const existingSnap = await db
      .collection("otp_codes")
      .where("email", "==", email.toLowerCase())
      .where("purpose", "==", purpose)
      .where("used", "==", false)
      .where("expiresAt", ">", FieldValue.serverTimestamp())
      .get();

    if (existingSnap.size >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    // ── Generate 6-digit code ──
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    // ── Store hashed OTP in Firestore ──
    // OTP lifecycle: 10 min active → expires → 5 min grace → auto-delete (15 min total)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 min
    const deleteAt = new Date(now.getTime() + 15 * 60 * 1000);  // 15 min

    await db.collection("otp_codes").add({
      email: email.toLowerCase(),
      codeHash,
      purpose,
      used: false,
      attempts: 0,
      maxAttempts: 5,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
      deleteAt,
    });

    // ── Clean up old expired/used OTPs for this email ──
    const staleSnap = await db
      .collection("otp_codes")
      .where("email", "==", email.toLowerCase())
      .where("deleteAt", "<", now)
      .get();

    if (!staleSnap.empty) {
      const batch = db.batch();
      staleSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Also clean up used OTPs
    const usedSnap = await db
      .collection("otp_codes")
      .where("email", "==", email.toLowerCase())
      .where("used", "==", true)
      .get();

    if (!usedSnap.empty) {
      const batch = db.batch();
      usedSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // ── Send email ──
    const { subject, html } = otpEmailTemplate({ code, purpose, displayName, expiresInMin: 10 });

    await transporter.sendMail({
      from: `"ESUTSphere" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    console.error("OTP send error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
