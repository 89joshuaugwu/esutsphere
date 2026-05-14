# ESUTSphere — Authentication Flow: Design + Context

> Combined DESIGN.md + CONTEXT.md for all authentication and onboarding pages.
> Covers: /login · /signup · /onboarding/step-1 through step-3 · /onboarding/pending (locked dashboard)
> Reference DESIGN.md for global tokens (colors, typography, spacing, animations).
> Updated: May 2026

---

## 1. Pages Covered by This File

| Route | Page | Who Sees It |
|-------|------|-------------|
| `/login` | Sign In | Anyone not logged in |
| `/signup` | Create Account | Anyone not logged in |
| `/onboarding/step-1` | Role + Academic Info | New user after Google auth |
| `/onboarding/step-2` | Profile Setup | New user after step 1 |
| `/onboarding/step-3` | Document Upload | New user after step 2 |
| `/onboarding/pending` | Locked Dashboard Preview | Users pending approval |

---

## 2. Auth Flow Logic (Complete Decision Tree)

```
User visits /login or /signup
         ↓
User clicks "Continue with Google" or fills email form
         ↓
Firebase Auth resolves
         ↓
Check Firestore: does user doc exist for this uid?
         ↓
┌─── NO (new user) ──────────────────────────────────────────────────────┐
│   → Redirect to /onboarding/step-1                                     │
│   → They complete steps 1, 2, 3                                        │
│   → Firestore user doc created: role='pending', approvalStatus='pending'│
│   → Email sent to relevant class admin (student) or super admin         │
│     (lecturer)                                                          │
│   → Redirect to /onboarding/pending (locked dashboard preview)         │
└────────────────────────────────────────────────────────────────────────┘
         ↓
┌─── YES (existing user) ────────────────────────────────────────────────┐
│   approvalStatus === 'approved'  → Redirect to /feed                   │
│   approvalStatus === 'pending'   → Redirect to /onboarding/pending     │
│   approvalStatus === 'rejected'  → Stay on /login + show rejection msg │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Student vs Lecturer Paths (Diverge at Step 1)

### Student Path
```
Step 1: Select "Student" role
  → Matric number (validated: /^\d{4}\/\d{6}\/[A-Z]{2,6}$/)
  → Department (dropdown from DEPARTMENTS constant)
  → Faculty (auto-populated from department)
  → Year of Entry (e.g. "2022/2023")
  → Current Level (auto-calculated)

Step 2: Profile setup (same for both)

Step 3: Upload admission letter (PDF or image, max 10MB)

Pending: Class Admin for that dept+level sees them in approval queue
         Super Admin also sees all pending students
```

### Lecturer Path
```
Step 1: Select "Lecturer" role
  → Staff ID number (text field, no strict regex — varies)
  → Department (dropdown)
  → Faculty (auto-populated)
  → Course(s) taught (multi-select from course codes)
  → Highest qualification (B.Sc / M.Sc / Ph.D / Prof)

Step 2: Profile setup (same for both)

Step 3: Upload staff ID card OR official appointment letter (PDF or image, max 10MB)
        Note text: "Upload your ESUT staff ID card or appointment letter"

Pending: Goes ONLY to Super Admin queue under "Lecturer Approvals" tab
         Class Admins CANNOT see or approve lecturers
         Super Admin manually verifies — no shortcut
```

### Role Selector Component
```css
.role-selector {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-bottom: 28px;
}

.role-card {
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px; padding: 20px 16px;
  text-align: center; cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}

.role-card:hover {
  border-color: rgba(124, 58, 237, 0.4);
  background: rgba(124, 58, 237, 0.06);
  transform: translateY(-2px);
}

.role-card.selected {
  border-color: #7C3AED;
  background: rgba(124, 58, 237, 0.12);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12), 0 4px 20px rgba(124, 58, 237, 0.2);
}

.role-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.2);
  transition: all 0.2s ease;
}
.role-card.selected .role-icon {
  background: rgba(124, 58, 237, 0.25);
  border-color: rgba(124, 58, 237, 0.5);
}

.role-label {
  font: Geist 15px weight 600; color: #CBD5E1;
}
.role-card.selected .role-label { color: #A855F7; }

.role-desc {
  font: Geist 12px; color: #475569; line-height: 18px;
}
```

Student icon: 🎓 · Lecturer icon: 📖

---

## 4. Login & Signup Page Design

### Layout — Split Screen (Desktop)

```
┌────────────────────────┬─────────────────────────┐
│                        │                         │
│   LEFT PANEL (45%)     │   RIGHT PANEL (55%)     │
│   Brand + Stats        │   Auth Form             │
│   Dark gradient bg     │   Dark surface card     │
│                        │                         │
└────────────────────────┴─────────────────────────┘
```

### Layout — Mobile (≤639px)

```
┌─────────────────────┐
│  Logo + Tagline     │  (compact, 100px height)
├─────────────────────┤
│                     │
│   Auth Form         │  (full width, scrollable)
│                     │
└─────────────────────┘
```

---

### Left Panel (Desktop)

```css
.auth-left {
  width: 45%;
  background: linear-gradient(160deg, #0F0F1A 0%, #080810 60%, rgba(124,58,237,0.08) 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 48px 40px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
}

/* Background orb */
.auth-left::before {
  content: ''; position: absolute;
  width: 350px; height: 350px; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%);
  bottom: -100px; right: -100px;
  filter: blur(40px); pointer-events: none;
}

/* Top: Logo + wordmark */
.auth-logo-row {
  display: flex; align-items: center; gap: 12px;
}
.auth-logo { width: 40px; height: 40px; }
.auth-wordmark { font: Geist 20px weight 700; color: #F8FAFC; }

/* Center: Tagline */
.auth-tagline {
  font: 'Instrument Serif' clamp(28px, 3vw, 38px);
  color: #F8FAFC; line-height: 1.2;
  margin-bottom: 12px;
}
.auth-tagline-gradient {
  background: linear-gradient(135deg, #A855F7, #06B6D4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.auth-sub {
  font: Geist 15px; color: #94A3B8; line-height: 24px; max-width: 300px;
}

/* Stats grid */
.auth-stats {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; margin-top: 40px;
}
.auth-stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px; padding: 16px 14px;
}
.auth-stat-num {
  font: 'Instrument Serif' 28px;
  background: linear-gradient(135deg, #A855F7, #06B6D4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  display: block; margin-bottom: 4px;
}
.auth-stat-label { font: Geist 12px weight 500; color: #94A3B8; }

/* Bottom: Social proof */
.auth-social-proof {
  display: flex; align-items: center; gap: 10px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.auth-avatars { display: flex; }
.auth-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid #080810;
  margin-left: -6px; object-fit: cover;
}
.auth-avatars .auth-avatar:first-child { margin-left: 0; }
.auth-proof-text { font: Geist 13px; color: #94A3B8; }
.auth-proof-text strong { color: #F8FAFC; font-weight: 600; }
```

**Stats to show:**
- `5,000+` Active Students
- `200+` Lecturers
- `50+` Departments
- `1,000+` Resources Shared

---

### Right Panel — Auth Form Container

```css
.auth-right {
  width: 55%; min-height: 100vh;
  background: #080810;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 40px;
}

.auth-form-card {
  width: 100%; max-width: 420px;
}

/* Form header */
.auth-form-title {
  font: Geist 26px weight 700; color: #F8FAFC; margin-bottom: 6px;
}
.auth-form-subtitle {
  font: Geist 14px; color: #94A3B8; margin-bottom: 32px;
}

/* Google button — PRIMARY, shown first */
.google-btn {
  width: 100%; height: 52px;
  background: #FFFFFF; color: #0F0F1A;
  font: Geist 15px weight 600;
  border-radius: 12px; border: none;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 20px;
}
.google-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
.google-btn:active { transform: translateY(0); }

/* Google logo */
.google-btn img { width: 20px; height: 20px; }

/* Divider */
.auth-divider {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px;
}
.auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
.auth-divider-text { font: Geist 12px weight 500; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; }

/* Form fields */
.auth-field { margin-bottom: 16px; }
.auth-field label {
  display: block; font: Geist 13px weight 500; color: #CBD5E1;
  margin-bottom: 6px;
}
.auth-input-wrap { position: relative; }
.auth-input-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #475569; font-size: 16px; pointer-events: none;
}
.auth-input {
  width: 100%; height: 48px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px; color: #F8FAFC;
  font: Geist 14px; padding: 0 14px 0 42px;
  transition: all 0.2s ease;
}
.auth-input::placeholder { color: #475569; }
.auth-input:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
  background: rgba(124, 58, 237, 0.04);
}
.auth-input.error { border-color: #EF4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }

/* Password visibility toggle */
.auth-eye-btn {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #475569; cursor: pointer;
  font-size: 18px; padding: 0; transition: color 0.15s;
}
.auth-eye-btn:hover { color: #94A3B8; }

/* Forgot password */
.auth-forgot {
  display: block; text-align: right;
  font: Geist 13px weight 500; color: #7C3AED;
  text-decoration: none; margin-top: -10px; margin-bottom: 20px;
  transition: color 0.15s;
}
.auth-forgot:hover { color: #A855F7; }

/* Submit button */
.auth-submit-btn {
  width: 100%; height: 52px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 15px weight 700;
  border: none; border-radius: 12px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 20px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.auth-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(124, 58, 237, 0.5);
}
.auth-submit-btn:disabled {
  background: rgba(124,58,237,0.3); cursor: not-allowed;
  transform: none; box-shadow: none;
}

/* Loading state on button */
.auth-submit-btn.loading .btn-text { opacity: 0; }
.auth-submit-btn.loading::after {
  content: '';
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #FFFFFF;
  animation: spin 0.8s linear infinite;
  position: absolute;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Switch link */
.auth-switch {
  text-align: center; font: Geist 14px; color: #94A3B8;
}
.auth-switch a { color: #7C3AED; font-weight: 600; text-decoration: none; }
.auth-switch a:hover { color: #A855F7; }

/* Terms */
.auth-terms {
  text-align: center; font: Geist 12px; color: #475569;
  line-height: 18px; margin-top: 16px;
}
.auth-terms a { color: #7C3AED; text-decoration: none; }
```

---

### Sign In Page Content

```
LEFT PANEL:
Logo + "Welcome back."
"Sign in to access your notes,         
past questions, and campus feed."

Stats: 5,000+ Students · 200+ Lecturers · 50+ Departments · 1,000+ Resources

RIGHT PANEL:
Title: "Welcome back"
Subtitle: "Sign in to your ESUTSphere account"

[G Continue with Google]   ← PRIMARY — shown first, most prominent

─── OR CONTINUE WITH EMAIL ───

Email [🔒 you@esut.edu.ng]
Password [🔒 ••••••••] [👁]         Forgot password? →

[→ Sign In]

Don't have an account? Sign up
```

---

### Sign Up Page Content

```
LEFT PANEL:
Logo + "Join ESUTSphere."
"The premier academic hub for         
ESUT students and lecturers."

Stats same as login

RIGHT PANEL:
Title: "Create an account"
Subtitle: "Join the ESUTSphere community"

[G Continue with Google]   ← PRIMARY — Google is the recommended path

─── OR CONTINUE WITH EMAIL ───

I am a:
[🎓 Student]  [📖 Lecturer]   ← Role selector (same as onboarding step 1 preview)

Full Name [👤 John Doe]
Email [✉️ you@esut.edu.ng]
Password [🔒 Create a password] [👁]
Confirm Password [🔒 Confirm your password] [👁]

[→ Create Account]

By creating an account, you agree to our Terms of Service and Privacy Policy.

Already have an account? Sign in
```

> ⚠️ **Important:** The role selector on the signup page is just a preview — it carries forward to `/onboarding/step-1` where the actual academic data is collected. Do NOT collect matric/staff ID on the signup page itself — keep it clean.

---

## 5. Onboarding Pages Design

### Shared Onboarding Layout

```css
/* Full-page wrapper */
.onboarding-page {
  min-height: 100vh;
  background: #080810;
  background-image:
    radial-gradient(ellipse 70% 50% at 15% 15%, rgba(124,58,237,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 85%, rgba(6,182,212,0.08) 0%, transparent 55%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 24px;
}

/* Card */
.onboarding-card {
  background: rgba(22, 22, 42, 0.90);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 24px; padding: 40px;
  width: 100%; max-width: 540px;
  backdrop-filter: blur(20px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  animation: card-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-rise {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Top: Logo row */
.onboarding-logo-row {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 28px;
}
.onboarding-logo { width: 32px; height: 32px; }
.onboarding-brand { font: Geist 16px weight 700; color: #F8FAFC; }

/* Step progress */
.step-progress {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 32px;
}
.step-dot {
  height: 4px; border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-dot.done    { width: 32px; background: #10B981; }
.step-dot.active  { width: 48px; background: linear-gradient(90deg, #7C3AED, #A855F7); }
.step-dot.waiting { width: 24px; background: rgba(255,255,255,0.12); }

/* Step label */
.step-label {
  font: Geist 12px weight 500; color: #475569;
  margin-left: auto;
}
.step-label span { color: #A855F7; font-weight: 600; }

/* Form heading */
.onboarding-title {
  font: Geist 22px weight 700; color: #F8FAFC; margin-bottom: 6px;
}
.onboarding-subtitle {
  font: Geist 14px; color: #94A3B8; margin-bottom: 28px; line-height: 22px;
}

/* Navigation buttons */
.onboarding-nav {
  display: flex; gap: 12px; margin-top: 28px;
}
.onboarding-back {
  height: 48px; padding: 0 20px; border-radius: 10px;
  background: transparent; color: #94A3B8;
  border: 1px solid rgba(255,255,255,0.10);
  font: Geist 14px weight 500; cursor: pointer;
  transition: all 0.2s ease;
}
.onboarding-back:hover { background: rgba(255,255,255,0.06); color: #F8FAFC; }

.onboarding-next {
  flex: 1; height: 48px; border-radius: 10px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 15px weight 700;
  border: none; cursor: pointer;
  box-shadow: 0 6px 20px rgba(124,58,237,0.35);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.onboarding-next:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,0.5); }
.onboarding-next:disabled { background: rgba(124,58,237,0.3); transform: none; box-shadow: none; }
```

---

### Step 1 — Academic / Staff Info

**Student fields:**
- Role (pre-selected from signup, but changeable)
- Matric Number (text input, real-time validation with regex)
- Department (searchable select)
- Faculty (auto-filled from department selection)
- Year of Entry (year picker: 2018/2019 → 2025/2026)
- Current Level (auto-calculated, shown as a read-only badge)

**Lecturer fields (when role = Lecturer):**
- Staff ID Number (text input)
- Department (searchable select)
- Faculty (auto-filled)
- Course(s) Taught (multi-select, max 10, from course codes list)
- Highest Qualification (select: B.Sc / M.Sc / Ph.D / Professor)

```css
/* Searchable select */
.select-wrapper { position: relative; }
.select-search {
  /* Same as auth-input */
  padding-left: 42px; cursor: pointer;
}
.select-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0;
  background: #1E1E35;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; overflow: hidden; z-index: 50;
  max-height: 220px; overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.select-option {
  padding: 10px 16px; font: Geist 14px; color: #CBD5E1;
  cursor: pointer; transition: background 0.12s;
}
.select-option:hover { background: rgba(124,58,237,0.12); color: #A855F7; }
.select-option.selected { background: rgba(124,58,237,0.18); color: #A855F7; }

/* Auto-calculated level badge */
.level-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(6,182,212,0.12);
  border: 1px solid rgba(6,182,212,0.3);
  color: #06B6D4; font: Geist 13px weight 600;
  padding: 6px 14px; border-radius: 9999px;
}

/* Multi-select tags (for courses) */
.course-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.course-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.25);
  color: #A855F7; font: Geist 12px weight 600;
  padding: 4px 10px; border-radius: 9999px;
}
.course-tag .remove {
  cursor: pointer; color: rgba(168,85,247,0.6);
  transition: color 0.12s; font-size: 14px; line-height: 1;
}
.course-tag .remove:hover { color: #A855F7; }

/* Matric validation feedback */
.matric-valid   { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
.matric-invalid { border-color: #EF4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
.matric-hint {
  font: Geist 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px;
}
.matric-hint.valid   { color: #10B981; }
.matric-hint.invalid { color: #EF4444; }
```

---

### Step 2 — Profile Setup

Fields: Display Name · Username · Bio (optional) · Profile Picture

```css
/* Photo upload — circular drag+drop */
.photo-upload-circle {
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(124,58,237,0.08);
  border: 2px dashed rgba(124,58,237,0.35);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; margin: 0 auto 24px;
  transition: all 0.2s ease; position: relative;
  overflow: hidden;
}
.photo-upload-circle:hover {
  border-color: #7C3AED;
  background: rgba(124,58,237,0.14);
}
.photo-upload-circle img {
  width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
}
.photo-upload-overlay {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
}
.photo-upload-circle:hover .photo-upload-overlay { opacity: 1; }

/* Username availability check */
.username-check {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 16px;
}
.username-available { color: #10B981; }  /* ✓ */
.username-taken     { color: #EF4444; }  /* ✗ */
.username-checking  { color: #F59E0B; }  /* ⟳ spinner */

/* Username preview */
.username-preview {
  font: Geist 13px; color: #475569; margin-top: 6px;
}
.username-preview span { color: #A855F7; font-weight: 600; }
```

---

### Step 3 — Document Upload

**Student copy:** "Upload your ESUT Admission Letter"
**Lecturer copy:** "Upload your ESUT Staff ID Card or Appointment Letter"

```css
/* Upload zone — large, prominent */
.doc-upload-zone {
  background: rgba(124,58,237,0.04);
  border: 2px dashed rgba(124,58,237,0.30);
  border-radius: 16px; padding: 40px 24px;
  text-align: center; cursor: pointer;
  transition: all 0.25s ease; margin-bottom: 16px;
}
.doc-upload-zone:hover, .doc-upload-zone.drag-over {
  background: rgba(124,58,237,0.10);
  border-color: #7C3AED;
  box-shadow: 0 0 30px rgba(124,58,237,0.15);
}

.upload-icon { font-size: 40px; margin-bottom: 12px; }
.upload-title { font: Geist 16px weight 600; color: #F8FAFC; margin-bottom: 6px; }
.upload-hint  { font: Geist 13px; color: #94A3B8; }
.upload-types { font: Geist 12px; color: #475569; margin-top: 8px; }

/* Accepted formats chips */
.format-chips { display: flex; gap: 6px; justify-content: center; margin-top: 12px; }
.format-chip {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px; padding: 3px 10px;
  font: Geist 11px weight 600; color: #94A3B8; letter-spacing: 0.3px;
}

/* Upload progress */
.upload-progress-wrap { margin-top: 16px; }
.upload-file-row {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 12px 14px; margin-bottom: 8px;
}
.upload-file-icon { font-size: 24px; flex-shrink: 0; }
.upload-file-name { font: Geist 13px weight 500; color: #F8FAFC; flex: 1; }
.upload-file-size { font: Geist 12px; color: #475569; }
.upload-remove {
  background: none; border: none; color: #475569;
  cursor: pointer; font-size: 16px; transition: color 0.12s;
}
.upload-remove:hover { color: #EF4444; }

/* Progress bar */
.upload-bar {
  height: 3px; border-radius: 9999px;
  background: rgba(255,255,255,0.06); overflow: hidden; margin-top: 6px;
}
.upload-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7C3AED, #06B6D4);
  border-radius: 9999px;
  transition: width 0.4s ease;
}

/* Success state */
.upload-success-row {
  display: flex; align-items: center; gap: 12px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: 10px; padding: 12px 14px;
}
.upload-success-icon { color: #10B981; font-size: 20px; }
.upload-success-text { font: Geist 13px weight 600; color: #10B981; }

/* Privacy note */
.upload-privacy {
  display: flex; align-items: flex-start; gap: 8px;
  background: rgba(6,182,212,0.06);
  border: 1px solid rgba(6,182,212,0.15);
  border-radius: 10px; padding: 12px 14px; margin-top: 12px;
}
.upload-privacy-icon { color: #06B6D4; font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.upload-privacy-text { font: Geist 12px; color: #94A3B8; line-height: 18px; }
```

Privacy note text: *"Your document is private. Only verified admins can view it for account verification. It will not be shared or made public."*

---

## 6. Pending State — Locked Dashboard (The FOMO Screen)

This is the most important screen for retention. NOT a blank waiting page. The full dashboard loads but everything is locked.

### Architecture

```
/onboarding/pending → renders the FULL /dashboard layout
                      but wraps it in a PendingOverlayProvider
                      which locks all interactive elements
```

### Pending Banner (Sticky, Always Visible)

```css
.pending-banner-sticky {
  position: sticky; top: 64px; z-index: 80; /* below navbar */
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06));
  border-bottom: 1px solid rgba(245,158,11,0.25);
  padding: 12px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}

.pending-banner-left {
  display: flex; align-items: center; gap: 12px;
}

.pending-banner-icon {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(245,158,11,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  animation: pending-pulse-sm 2s ease-in-out infinite;
}

@keyframes pending-pulse-sm {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.3); }
  50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
}

.pending-banner-text { font: Geist 14px weight 500; color: #FCD34D; }
.pending-banner-sub  { font: Geist 12px; color: rgba(252,211,77,0.7); }

.pending-banner-badge {
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 9999px; padding: 4px 12px;
  font: Geist 12px weight 600; color: #F59E0B;
  white-space: nowrap;
  animation: badge-blink 3s ease-in-out infinite;
}

@keyframes badge-blink {
  0%, 90%, 100% { opacity: 1; }
  95%           { opacity: 0.5; }
}
```

Banner text: `⏳ Account under review` · `Typically approved within 24–48 hours` · `[● PENDING]`

---

### Dashboard Lock Layer

All interactive elements show a lock tooltip on hover/tap. Nothing can be clicked.

```css
/* Lock overlay wrapper — wraps each section */
.locked-section {
  position: relative; pointer-events: none;
}
.locked-section::after {
  content: '';
  position: absolute; inset: 0; border-radius: inherit;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  background: rgba(8,8,16,0.35);
  z-index: 10;
}

/* Lock icon badge (appears on hover via JS) */
.locked-badge {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: rgba(22,22,42,0.95);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 8px 14px;
  display: flex; align-items: center; gap: 8px;
  font: Geist 13px weight 600; color: #94A3B8;
  z-index: 11; white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.locked-badge-icon { font-size: 16px; }
```

Lock badge text: `🔒 Available after approval`

---

### What's Visible vs Locked

| Dashboard Element | State | Notes |
|-------------------|-------|-------|
| Sidebar navigation | Visible, links show lock tooltip | Logo + their name shown |
| Stats cards | Visible but show `--` | "Uploads", "Followers", "Downloads", "Likes" all `--` |
| "Upload Document" button | Visible but locked with lock icon overlay | On click: tooltip |
| Feed posts | 3 ghost/blurred posts visible | Real posts blurred with overlay |
| Top contributors sidebar | Visible (actual users shown) | Encourages FOMO |
| Trending tags | Visible (real tags) | Encourages FOMO |
| Profile card (their own) | **FULLY UNLOCKED** | They can see their profile |
| Edit profile picture | **FULLY UNLOCKED** | Only action allowed while pending |
| Notification bell | Visible, shows 0 | No real notifications yet |

---

### Profile Section (Unlocked While Pending)

The one thing they CAN do — update their profile picture. Makes them invested in the account.

```css
.pending-profile-section {
  /* Normal profile card — fully interactive */
  /* Add a subtle "This is ready!" callout */
}

.pending-profile-callout {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(16,185,129,0.10);
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: 9999px; padding: 4px 12px;
  font: Geist 12px weight 600; color: #10B981;
  margin-top: 12px;
}
```

Callout text: `✓ Profile ready — your account is being reviewed`

---

### Blurred Feed Ghost Posts

Show 3 realistic-looking fake post cards, blurred:

```css
.ghost-post {
  background: rgba(22,22,42,0.8);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 20px;
  margin-bottom: 12px; overflow: hidden;
  position: relative;
}

.ghost-post-content {
  filter: blur(4px);
  pointer-events: none; user-select: none;
}

.ghost-post-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  background: rgba(8,8,16,0.5);
}

.ghost-post-cta {
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.3);
  border-radius: 9999px; padding: 6px 16px;
  font: Geist 13px weight 600; color: #A855F7;
}
```

Ghost post overlay text: `🔒 Join the community to read this`

---

### Approval Status Steps (Bottom of Pending Screen)

A visual progress tracker showing where they are in the approval process:

```css
.approval-steps {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 20px 24px;
  margin-top: 24px;
}

.approval-steps-title {
  font: Geist 14px weight 700; color: #F8FAFC; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}

.approval-step {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 0;
}
.approval-step:not(:last-child) {
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.approval-step-icon {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.step-done    { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); }
.step-active  { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); animation: pending-pulse-sm 2s infinite; }
.step-waiting { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }

.approval-step-label { font: Geist 14px weight 500; }
.step-done .approval-step-label    { color: #10B981; }
.step-active .approval-step-label  { color: #F59E0B; }
.step-waiting .approval-step-label { color: #475569; }
```

The 4 steps:
1. ✅ **Account created** — "Your account has been set up"
2. ✅ **Documents submitted** — "Admission letter received"
3. ⏳ **Under review** — "Being verified by your class admin" (animated pulse)
4. ⬜ **Access granted** — "You'll get notified by email"

---

## 7. Post-Approval Transition

When a user's account is approved (by class admin or super admin), trigger this:

```typescript
// In Firestore, when approvalStatus changes to 'approved':
// 1. Update user doc: role = 'student' or 'lecturer', approvalStatus = 'approved'
// 2. Send approval email via /api/send-email (template: account_approved)
// 3. Create notification: type = 'approval', message = "Your ESUTSphere account has been approved! Welcome 🎉"
// 4. On next page load, useAuth hook detects approvalStatus === 'approved'
// 5. The locked overlay disappears
// 6. Redirect to /feed with welcome animation
```

**Welcome Animation (first time on /feed after approval):**
```css
.welcome-toast {
  /* Extends the standard toast */
  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05));
  border: 1px solid rgba(16,185,129,0.35);
  border-left: 3px solid #10B981;
  padding: 16px 20px;
  /* Larger than normal toast */
  min-width: 320px;
}
```

Welcome toast text: `🎉 Welcome to ESUTSphere, {name}! Your account is now active.`

---

## 8. Rejection Handling

If account is rejected:

```typescript
// User doc: approvalStatus = 'rejected', rejectionReason = "string from admin"
// Email sent: template account_rejected
// On login: user sees rejection state instead of redirect to feed
```

```css
/* Rejection screen on /login */
.rejection-card {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 16px; padding: 24px;
  margin-bottom: 24px;
}
.rejection-title { font: Geist 16px weight 700; color: #EF4444; margin-bottom: 8px; }
.rejection-reason { font: Geist 14px; color: #94A3B8; line-height: 22px; margin-bottom: 16px; }
.rejection-reapply {
  /* Secondary button style */
  color: #EF4444; border-color: rgba(239,68,68,0.3);
}
```

Rejection message: *"Your account was not approved. Reason: {rejectionReason}. You may re-submit with corrected information."*

Re-apply button sends them back to `/onboarding/step-3` to upload a new document.

---

## 9. Firestore: Auth-Related Writes

```typescript
// On new user after Google Auth — write to Firestore:
const newUserDoc = {
  uid: user.uid,
  email: user.email,
  displayName: '',          // Filled in step 2
  username: '',             // Filled in step 2
  profilePicture: '',       // Filled in step 2
  role: 'pending',
  approvalStatus: 'pending',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  lastActiveAt: serverTimestamp(),
  // All counts start at 0
  followersCount: 0, followingCount: 0,
  uploadsCount: 0, totalLikesReceived: 0,
  totalDownloads: 0, points: 0, badges: [],
  isVerified: false,
};

// After step 3 submit — update with academic data:
// Students: { matricNumber, department, faculty, yearOfEntry, currentLevel, admissionLetterUrl }
// Lecturers: { staffId, department, faculty, coursesTaught, qualification, staffIdUrl }
```

---

## 10. Protected Route Implementation

```typescript
// middleware.ts (Next.js 16)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  const publicRoutes = ['/', '/login', '/signup', '/blog', '/library', '/profile'];
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));
  if (isPublic) return NextResponse.next();

  // Onboarding routes — auth required, approval not required
  // App routes — auth + approval required
  // Admin routes — auth + role required
  // (Full logic implemented in each layout.tsx using useAuth hook)
}

// In each (app)/layout.tsx:
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({ children }) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (userDoc?.approvalStatus === 'rejected') { router.push('/login'); return; }
    if (userDoc?.approvalStatus === 'pending') { router.push('/onboarding/pending'); return; }
  }, [user, userDoc, loading]);

  if (loading || !userDoc) return <FullPageSkeleton />;
  return <>{children}</>;
}
```

---

## 11. What NOT to Do — Auth Specific

| Rule | Reason |
|------|--------|
| ❌ Never show rejection reason to a third party | Privacy — only send to the rejected user's email and their login screen |
| ❌ Never let class admin approve lecturers | Lecturers → Super Admin ONLY |
| ❌ Never let a pending user download, upload, or react | Lock everything except profile photo edit |
| ❌ Never redirect rejected users to /feed | They see the rejection screen on /login |
| ❌ Never skip document upload step | Required for both students and lecturers — no bypass |
| ❌ Never collect matric/staff ID on the signup page | Collect it on onboarding/step-1 only |
| ❌ Never hardcode the email placeholder as `you@esut.edu.ng` permanently | Show it as placeholder only, accept any email |
| ❌ Never auto-verify anyone | All accounts go through the approval flow — no exceptions |
| ❌ Never show a blank "awaiting approval" screen | Always show the locked dashboard preview — FOMO is the strategy |

---

*ESUTSphere AUTH.md — v1.0 — Login · Signup · Onboarding · Pending Dashboard*
*The auth flow is the first impression. Make it count.*
