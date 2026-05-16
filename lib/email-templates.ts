/**
 * ESUTSphere — Email Templates
 * Branded HTML email templates for OTP, notifications, and account alerts.
 * Uses inline styles for maximum email client compatibility.
 */

const BRAND = {
  purple: "#7C3AED",
  purpleLight: "#A855F7",
  cyan: "#06B6D4",
  bg: "#080810",
  surface: "#0F0F1A",
  surface2: "#16162A",
  textPrimary: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textDisabled: "#475569",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  border: "rgba(255,255,255,0.08)",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://esutsphere.vercel.app",
  logoUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://esutsphere.vercel.app"}/logo.png`,
};

function baseLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ESUTSphere</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#080810;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" style="max-width:560px;background-color:${BRAND.surface};border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <!-- Header with logo -->
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${BRAND.logoUrl}" width="36" height="36" alt="ESUTSphere" style="display:block;border-radius:50%;">
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:20px;line-height:1;letter-spacing:-0.5px;">
                      <strong style="font-weight:800;color:${BRAND.textPrimary};">ESUT</strong><span style="font-weight:400;color:${BRAND.purpleLight};">Sphere</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 32px 28px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.textDisabled};line-height:18px;">
                © ${new Date().getFullYear()} ESUTSphere · The Academic Hub for ESUT Students
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:${BRAND.textDisabled};">
                <a href="${BRAND.appUrl}" style="color:${BRAND.cyan};text-decoration:none;">esutsphere.vercel.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── OTP VERIFICATION EMAIL ─────────────────────────────────────

export function otpEmailTemplate(opts: {
  code: string;
  purpose: "email_verification" | "password_reset" | "two_factor" | "link_password";
  displayName?: string;
  expiresInMin?: number;
}): { subject: string; html: string } {
  const { code, purpose, displayName, expiresInMin = 10 } = opts;
  const digits = code.split("");

  const purposeText: Record<string, { title: string; desc: string; subject: string; emoji: string }> = {
    email_verification: {
      title: "Verify Your Email",
      desc: "Enter this code to verify your email address and complete your ESUTSphere registration.",
      subject: "🔐 Verify Your Email — ESUTSphere",
      emoji: "📧",
    },
    password_reset: {
      title: "Reset Your Password",
      desc: "You requested a password reset. Enter this code to set a new password.",
      subject: "🔑 Password Reset Code — ESUTSphere",
      emoji: "🔑",
    },
    two_factor: {
      title: "Two-Factor Authentication",
      desc: "Enter this code to complete your login. This adds an extra layer of security to your account.",
      subject: "🛡️ Login Verification Code — ESUTSphere",
      emoji: "🛡️",
    },
    link_password: {
      title: "Add Password Login",
      desc: "Enter this code to verify your email and add password-based login to your account.",
      subject: "🔗 Email Verification — ESUTSphere",
      emoji: "🔗",
    },
  };

  const pt = purposeText[purpose];

  const digitCells = digits
    .map(
      (d) =>
        `<td style="width:46px;height:56px;text-align:center;vertical-align:middle;font-size:28px;font-weight:800;color:${BRAND.textPrimary};background:${BRAND.surface2};border:1px solid rgba(124,58,237,0.3);border-radius:10px;font-family:'Courier New',monospace;letter-spacing:2px;">${d}</td>`
    )
    .join(`<td style="width:6px;"></td>`);

  const content = `
    <div style="text-align:center;">
      <div style="width:56px;height:56px;border-radius:14px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:56px;margin-bottom:20px;">
        ${pt.emoji}
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND.textPrimary};line-height:1.3;">
        ${pt.title}
      </h1>
      ${displayName ? `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.textMuted};">Hi ${displayName},</p>` : ""}
      <p style="margin:0 0 28px;font-size:14px;color:${BRAND.textSecondary};line-height:22px;">
        ${pt.desc}
      </p>
      
      <!-- OTP Code -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
        <tr>
          ${digitCells}
        </tr>
      </table>
      
      <!-- Expiry Warning -->
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:12px 16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:${BRAND.warning};font-weight:600;">
          ⏱️ This code expires in ${expiresInMin} minutes
        </p>
      </div>
      
      <!-- Security Note -->
      <p style="margin:0;font-size:12px;color:${BRAND.textDisabled};line-height:18px;">
        If you didn't request this code, you can safely ignore this email.<br>
        Never share this code with anyone — ESUTSphere will never ask for it.
      </p>
    </div>
  `;

  return {
    subject: pt.subject,
    html: baseLayout(content, `Your ESUTSphere verification code is ${code}`),
  };
}

// ─── NOTIFICATION EMAIL TEMPLATE ────────────────────────────────

export function notificationEmailTemplate(opts: {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  emoji?: string;
  displayName?: string;
}): { subject: string; html: string } {
  const { title, message, actionUrl, actionLabel, emoji = "🔔", displayName } = opts;

  const content = `
    <div style="text-align:center;">
      <div style="width:48px;height:48px;border-radius:12px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:24px;line-height:48px;margin-bottom:16px;">
        ${emoji}
      </div>
      ${displayName ? `<p style="margin:0 0 4px;font-size:13px;color:${BRAND.textMuted};">Hi ${displayName},</p>` : ""}
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:${BRAND.textPrimary};line-height:1.3;">
        ${title}
      </h2>
      <p style="margin:0 0 24px;font-size:14px;color:${BRAND.textSecondary};line-height:22px;">
        ${message}
      </p>
      ${actionUrl ? `
      <a href="${actionUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,${BRAND.purple},${BRAND.purpleLight});color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
        ${actionLabel || "View on ESUTSphere"}
      </a>
      ` : ""}
    </div>
  `;

  return {
    subject: `${emoji} ${title} — ESUTSphere`,
    html: baseLayout(content, message.slice(0, 100)),
  };
}

// ─── ACCOUNT APPROVED EMAIL ─────────────────────────────────────

export function accountApprovedTemplate(displayName: string): { subject: string; html: string } {
  return notificationEmailTemplate({
    title: "Your Account is Approved! 🎉",
    message: `Welcome to ESUTSphere, ${displayName}! Your account has been verified and approved. You can now upload documents, publish blog posts, follow other students, and build your academic profile.`,
    actionUrl: `${BRAND.appUrl}/feed`,
    actionLabel: "Go to Feed",
    emoji: "🎉",
    displayName,
  });
}

// ─── ACCOUNT REJECTED EMAIL ─────────────────────────────────────

export function accountRejectedTemplate(displayName: string, reason: string): { subject: string; html: string } {
  const content = `
    <div style="text-align:center;">
      <div style="width:48px;height:48px;border-radius:12px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:24px;line-height:48px;margin-bottom:16px;">
        ❌
      </div>
      <p style="margin:0 0 4px;font-size:13px;color:${BRAND.textMuted};">Hi ${displayName},</p>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:${BRAND.textPrimary};line-height:1.3;">
        Account Not Approved
      </h2>
      <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textSecondary};line-height:22px;">
        We were unable to verify your ESUTSphere account at this time.
      </p>
      <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:14px 18px;text-align:left;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${BRAND.error};text-transform:uppercase;letter-spacing:0.5px;">Reason</p>
        <p style="margin:0;font-size:14px;color:${BRAND.textSecondary};line-height:20px;">${reason}</p>
      </div>
      <p style="margin:0 0 20px;font-size:13px;color:${BRAND.textMuted};line-height:20px;">
        If you believe this was a mistake, you can re-submit your admission letter or contact your class admin.
      </p>
      <a href="${BRAND.appUrl}/login" style="display:inline-block;padding:12px 28px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:${BRAND.textPrimary};font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
        Try Again
      </a>
    </div>
  `;

  return {
    subject: "❌ Account Not Approved — ESUTSphere",
    html: baseLayout(content, `Reason: ${reason}`),
  };
}

// ─── SECURITY ALERT EMAIL ───────────────────────────────────────

export function securityAlertTemplate(opts: {
  displayName: string;
  deviceName: string;
  isNewDevice: boolean;
  loginTime: string;
}): { subject: string; html: string } {
  const { displayName, deviceName, isNewDevice, loginTime } = opts;

  return notificationEmailTemplate({
    title: isNewDevice ? "New Device Login Detected" : "New Login Activity",
    message: `A ${isNewDevice ? "new device" : "login"} was detected on your account.\n\n📱 Device: ${deviceName}\n🕐 Time: ${loginTime}\n\nIf this wasn't you, secure your account immediately by changing your password.`,
    actionUrl: `${BRAND.appUrl}/dashboard?tab=settings`,
    actionLabel: "Review Security Settings",
    emoji: isNewDevice ? "🔴" : "🔵",
    displayName,
  });
}
