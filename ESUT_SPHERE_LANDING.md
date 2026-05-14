# ESUTSphere — Landing Page Design Spec + All Pages Guide

> This file contains: (1) Full landing page design spec for AI to build, (2) All platform pages with access levels.
> Reference: DESIGN.md + CONTEXT.md for tokens, components, and data schemas.
> Goal: A landing page so compelling that any ESUT student who sees it immediately wants to sign up.
> Updated: May 2026

---

## PART 1: LANDING PAGE — COMPLETE DESIGN SPEC

### Vision Statement

The ESUTSphere landing page is **the front door of the entire ESUT academic community**. It must communicate three things in under 5 seconds: what it is, why it matters to ESUT students specifically, and that it's premium enough to trust. It should feel like walking into the future of Nigerian university education — dark, electric, alive. Not a generic SaaS landing page. Not a corporate edu-tech template. Something that a 200L CS student at Agbani opens and says *"this is actually for us."*

**Design Direction:** Deep space dark + electric purple + cyan neon. Floating UI previews of the actual app. Glassmorphism. Orbital energy. Animated everything. Nigerian campus authenticity. Feels like Linear meets Twitter meets Academia.edu but built in Enugu.

---

### URL & Access

- Route: `/` (root, public, no auth required)
- Accessible to: Everyone — ESUT students, lecturers, non-ESUT visitors, Google
- After sign in → redirect to `/feed` (if approved) or `/onboarding/step-1` (if new)

---

### Navigation Bar (Sticky, Glassmorphism)

**Desktop Layout:**
```
[Logo + ESUTSphere wordmark]  [nav links]  [Search icon] [Bell icon] [Sign In button]
```

**Specs:**
```css
/* Navbar wrapper */
position: sticky; top: 0; z-index: 100;
background: rgba(8, 8, 16, 0.7);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
height: 64px; padding: 0 40px;
transition: background 0.3s ease;

/* On scroll — darkens */
background: rgba(8, 8, 16, 0.92);
border-bottom-color: rgba(255, 255, 255, 0.10);
```

**Nav links (desktop):** Home · Library · Community · Blog · About
Each link: `Geist 14px weight 500, color: #94A3B8, hover: #F8FAFC, transition: 0.15s`

**Sign In button:**
```css
background: #7C3AED; color: #FFFFFF;
padding: 8px 20px; border-radius: 9999px;
font: Geist 14px weight 600;
border: 1px solid rgba(168, 85, 247, 0.4);
transition: all 0.2s ease;
hover: box-shadow: 0 0 20px rgba(124, 58, 237, 0.5); transform: translateY(-1px);
```

**Mobile Nav (≤639px):**
- Logo + wordmark left
- Bell icon + hamburger right
- Hamburger opens full-screen overlay menu (slides down from top)
- Menu background: `rgba(8, 8, 16, 0.97)` with blur
- Links stacked vertically, large (18px), with icon prefix
- Sign In button at bottom, full-width, purple

**Scroll behavior:**
- At top: slightly transparent navbar
- After 80px scroll: `background: rgba(8, 8, 16, 0.95)` — more opaque, crisper border
- Smooth transition with CSS

---

### Section 1: Hero

**The most important section. Must hit instantly.**

**Layout (Desktop):**
```
Left (55%):                          Right (45%):
[Announcement pill badge]            [Floating App Preview Cards]
[Display headline — 3 lines]         [Stacked at angles, animated float]
[Subheadline — 2 lines]
[Two CTA buttons side by side]
[Social proof strip — avatars + count]
```

**Layout (Mobile):** Full-width stacked, hero text first, floating cards below (scale down to 85%)

**Background:**
```css
/* Layered radial gradients — creates depth field */
background: #080810;
background-image:
  radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124, 58, 237, 0.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6, 182, 212, 0.10) 0%, transparent 55%),
  radial-gradient(ellipse 40% 40% at 60% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 50%);

/* Subtle noise texture overlay for depth */
&::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
  opacity: 0.03;
  pointer-events: none;
}

/* Floating orb decorations */
.hero-orb-1 {
  position: absolute; width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%);
  top: -100px; left: -100px;
  animation: orb-drift 12s ease-in-out infinite;
  filter: blur(40px);
}
.hero-orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
  bottom: 0; right: 10%;
  animation: orb-drift 15s ease-in-out infinite reverse;
  filter: blur(40px);
}

@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -25px) scale(1.05); }
  66%  { transform: translate(-20px, 20px) scale(0.97); }
}
```

**Announcement Pill (animated entry):**
```
✨  Welcome to the Future of Academic Collaboration  →
```
```css
display: inline-flex; align-items: center; gap: 8px;
background: rgba(124, 58, 237, 0.10);
border: 1px solid rgba(124, 58, 237, 0.30);
border-radius: 9999px;
padding: 6px 14px 6px 8px;
font: Geist 13px weight 500; color: #CBD5E1;
margin-bottom: 28px;
cursor: pointer;
animation: pill-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
animation-delay: 0.1s;

/* Left icon badge */
.pill-icon {
  background: rgba(124, 58, 237, 0.25);
  border-radius: 9999px;
  padding: 3px 8px;
  font-size: 12px;
}

/* Hover */
background: rgba(124, 58, 237, 0.18);
border-color: rgba(168, 85, 247, 0.50);

/* Right arrow */
color: #A855F7; transition: transform 0.2s;
hover: transform: translateX(3px);
```

**Hero Headline:**
```
The Academic Hub
Built for ESUT Students.
```

```css
font-family: 'Instrument Serif';
font-size: clamp(40px, 6vw, 72px);
font-weight: 400;
line-height: 1.1;
letter-spacing: -1px;
color: #F8FAFC;
margin-bottom: 20px;

/* "ESUT Students." gets gradient treatment */
.headline-gradient {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 40%, #06B6D4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* Animated shimmer */
  background-size: 200% auto;
  animation: text-shimmer 4s linear infinite;
}

@keyframes text-shimmer {
  0%   { background-position: 0% center; }
  100% { background-position: 200% center; }
}

/* Staggered line entry */
.headline-line-1 { animation: hero-text-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.2s; }
.headline-line-2 { animation: hero-text-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.35s; }
.headline-line-3 { animation: hero-text-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.5s; }

@keyframes hero-text-enter {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Hero Subheadline:**
```
Share notes, discover past questions, connect with classmates,
and build your academic profile — all in one place.
```
```css
font: Geist 18px weight 400; line-height: 28px;
color: #94A3B8; max-width: 520px;
margin-bottom: 36px;
animation: hero-text-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
animation-delay: 0.6s;
```

**CTA Buttons:**
```
[→ Get Started — Free]    [▶ See How It Works]
```
```css
/* Primary CTA */
background: linear-gradient(135deg, #7C3AED, #A855F7);
color: #FFFFFF; font: Geist 15px weight 700;
padding: 14px 28px; border-radius: 12px;
border: none;
box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
animation: hero-text-enter 0.7s both; animation-delay: 0.75s;

hover:
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 16px 48px rgba(124, 58, 237, 0.55);

/* Secondary CTA */
background: rgba(255, 255, 255, 0.06);
color: #CBD5E1; font: Geist 15px weight 600;
padding: 14px 28px; border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.12);
backdrop-filter: blur(8px);
transition: all 0.2s ease;
animation: hero-text-enter 0.7s both; animation-delay: 0.85s;

hover:
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.22);
  transform: translateY(-2px);
```

**Social Proof Strip (below CTAs):**
```
[5 overlapping avatars] Trusted by 5,000+ ESUT students
```
```css
display: flex; align-items: center; gap: 12px;
margin-top: 32px;
animation: hero-text-enter 0.7s both; animation-delay: 1s;

/* Overlapping avatars */
.avatar-stack { display: flex; }
.avatar-stack img {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid #080810;
  margin-left: -8px;
}
.avatar-stack img:first-child { margin-left: 0; }

/* Text */
font: Geist 14px weight 500; color: #94A3B8;
strong { color: #F8FAFC; font-weight: 600; }
```

**Hero Right Side — Floating App Preview:**

Three floating cards showing real app UI, stacked at slight angles, continuously floating:

```css
/* Preview container */
.hero-preview-container {
  position: relative;
  width: 100%; max-width: 500px;
  height: 480px;
  animation: hero-text-enter 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.4s;
}

/* Card 1 — Feed Post preview (back, tilted) */
.preview-card-1 {
  position: absolute; top: 0; right: 0;
  width: 340px;
  background: rgba(22, 22, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px; padding: 16px;
  backdrop-filter: blur(12px);
  transform: rotate(3deg) translateY(0);
  animation: card-float-1 6s ease-in-out infinite;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* Card 2 — Document card (middle) */
.preview-card-2 {
  position: absolute; top: 80px; left: 20px;
  width: 320px;
  background: rgba(30, 30, 53, 0.85);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 14px; padding: 14px;
  border-top: 3px solid #7C3AED;
  backdrop-filter: blur(12px);
  transform: rotate(-2deg);
  animation: card-float-2 7s ease-in-out infinite;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* Card 3 — Stats card (front, slight tilt) */
.preview-card-3 {
  position: absolute; bottom: 20px; right: 20px;
  width: 280px;
  background: rgba(15, 15, 26, 0.95);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 14px; padding: 16px;
  backdrop-filter: blur(16px);
  transform: rotate(1deg);
  animation: card-float-3 8s ease-in-out infinite;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

@keyframes card-float-1 {
  0%, 100% { transform: rotate(3deg) translateY(0px); }
  50%       { transform: rotate(3deg) translateY(-12px); }
}
@keyframes card-float-2 {
  0%, 100% { transform: rotate(-2deg) translateY(0px); }
  50%       { transform: rotate(-2deg) translateY(-16px); }
}
@keyframes card-float-3 {
  0%, 100% { transform: rotate(1deg) translateY(0px); }
  50%       { transform: rotate(1deg) translateY(-10px); }
}
```

**Content of floating cards:**

Card 1 (Feed Post):
```
[Avatar] @johndoe · 2h ago
Just uploaded CSC 466 Notes 🔥
"Finally compiled all the compiler construction notes 
from Dr. Asogwa's class. Includes practice questions..."
[❤️ 142]  [💬 24]  [↗ Share]
```

Card 2 (Document):
```
[Purple top border]  NOTES  ·  CSC 466
CSC466 Compiler Construction Notes
Complete lecture notes — Dr. T. Asogwa
[Avatar] @joshuazaza  ↓ 450  ♥ 89
```

Card 3 (Stats mini):
```
📈 Trending this week
↗ 1,240 new downloads
🔥 CSC 201 Past Questions
👥 23 new members today
```

---

### Section 2: Departments Marquee Strip

A continuous scrolling horizontal strip showing all ESUT departments — creates instant recognition for ESUT students.

```css
/* Marquee container */
.marquee-section {
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 15, 26, 0.5);
  overflow: hidden;
  position: relative;
}

/* Fade edges */
.marquee-section::before,
.marquee-section::after {
  content: '';
  position: absolute; top: 0; bottom: 0; width: 120px;
  z-index: 2; pointer-events: none;
}
.marquee-section::before { left: 0; background: linear-gradient(to right, #0F0F1A, transparent); }
.marquee-section::after  { right: 0; background: linear-gradient(to left, #0F0F1A, transparent); }

/* Scrolling track */
.marquee-track {
  display: flex; gap: 32px; align-items: center;
  animation: marquee-scroll 30s linear infinite;
  width: max-content;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* Each department chip */
.dept-chip {
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
  font: Geist 14px weight 500; color: #94A3B8;
  padding: 6px 16px; border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
```

Department chips (duplicate the list to create infinite scroll):
`💻 Computer Science` · `⚡ Electrical Engineering` · `🏗️ Civil Engineering` · `⚙️ Mechanical Engineering` · `💊 Pharmacy` · `⚖️ Law` · `💼 Business Admin` · `📢 Mass Communication` · `🏛️ Architecture` · `💰 Accounting` · `📊 Economics` · `🖥️ Information Technology` — then repeat

---

### Section 3: Stats Counter

Animated number counters that roll up when the section scrolls into view (Intersection Observer).

```
[5,000+]          [2,000+]         [50+]           [15+]
Active Students   Documents        Course Codes     Departments
```

```css
.stats-section {
  padding: 80px 40px;
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 24px; max-width: 1100px; margin: 0 auto;
}

.stat-card {
  background: rgba(22, 22, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px; padding: 32px 28px;
  text-align: center; position: relative; overflow: hidden;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.stat-card::before {
  content: '';
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 60%; height: 1px;
  background: linear-gradient(to right, transparent, rgba(124,58,237,0.6), transparent);
}

.stat-card:hover {
  border-color: rgba(124, 58, 237, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
}

/* Icon */
.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.25);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; font-size: 22px;
}

/* Number */
.stat-number {
  font: 'Instrument Serif' 48px; color: #F8FAFC;
  background: linear-gradient(135deg, #A855F7, #06B6D4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  display: block; margin-bottom: 8px;
  /* Counter animates from 0 using JS IntersectionObserver */
}

.stat-label { font: Geist 15px weight 500; color: #94A3B8; }
```

**Mobile:** 2×2 grid

---

### Section 4: Feature Showcase

Tabbed section showing the three core features with live UI previews on the right.

**Tabs:** 📚 Resource Library · 📰 Campus Feed · 👤 Academic Profile

```css
.features-section {
  padding: 100px 40px;
  max-width: 1200px; margin: 0 auto;
}

.features-header {
  text-align: center; margin-bottom: 64px;
}

.features-eyebrow {
  font: Geist 13px weight 700; color: #7C3AED;
  letter-spacing: 1.5px; text-transform: uppercase;
  margin-bottom: 16px;
}

.features-title {
  font: 'Instrument Serif' clamp(32px, 4vw, 52px);
  color: #F8FAFC; line-height: 1.15; margin-bottom: 16px;
}

.features-subtitle {
  font: Geist 17px; color: #94A3B8; max-width: 520px; margin: 0 auto;
}

/* Tab selector */
.feature-tabs {
  display: flex; gap: 4px; justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 4px;
  width: fit-content; margin: 0 auto 56px;
}

.feature-tab {
  padding: 10px 20px; border-radius: 8px;
  font: Geist 14px weight 500; color: #94A3B8;
  cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; gap: 8px;
}
.feature-tab.active {
  background: #7C3AED; color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(124,58,237,0.4);
}

/* Content area */
.feature-content {
  display: grid; grid-template-columns: 1fr 1.2fr;
  gap: 64px; align-items: center;
}

/* Left: description */
.feature-desc-list { display: flex; flex-direction: column; gap: 28px; }
.feature-desc-item { display: flex; gap: 16px; }
.feature-desc-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 18px;
}
.feature-desc-title { font: Geist 16px weight 600; color: #F8FAFC; margin-bottom: 6px; }
.feature-desc-text  { font: Geist 14px; color: #94A3B8; line-height: 22px; }

/* Right: app preview mockup */
.feature-preview {
  background: rgba(15, 15, 26, 0.8);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  animation: feature-preview-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes feature-preview-enter {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Tab 1 — Resource Library:**
Left side points: Search by course code · Filter by level and department · In-browser PDF preview · Download with one click · See who uploaded and trust their reputation
Right side: Renders a visual mockup of the Library page (document cards, filter bar, upload button)

**Tab 2 — Campus Feed:**
Left side: See what your classmates are sharing · React with 5 emoji types · Comment and start conversations · Follow students whose notes you trust · Share to WhatsApp instantly
Right side: Feed post mockup with reaction bar

**Tab 3 — Academic Profile:**
Left side: Build your academic reputation · Earn badges for contributions · Track your downloads and likes · Follow top contributors · Your profile is your academic CV
Right side: Profile card mockup with stats and badges

---

### Section 5: How It Works

Three steps, large numbers, animated connection line between them.

```
Step 1           →            Step 2           →           Step 3
Sign Up                   Build Your Profile            Share & Discover
[Icon]                        [Icon]                        [Icon]

Create your ESUTSphere    Upload your matric,         Upload documents, write
account with Google       department, and submit      posts, follow classmates,
in under 2 minutes.       your admission letter       earn points and badges.
                          for verification.
```

```css
.how-section {
  padding: 100px 40px; text-align: center;
  background: rgba(15, 15, 26, 0.5);
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.steps-grid {
  display: grid; grid-template-columns: 1fr 40px 1fr 40px 1fr;
  gap: 0; align-items: start; max-width: 900px; margin: 0 auto;
}

.step-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; padding: 32px 28px;
  position: relative;
  transition: all 0.3s ease;
}
.step-card:hover {
  border-color: rgba(124,58,237,0.35);
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.step-number {
  position: absolute; top: -16px; left: 24px;
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 14px weight 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(124,58,237,0.5);
}

.step-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.25);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px; font-size: 28px;
}

/* Arrow connector */
.step-arrow {
  display: flex; align-items: center; justify-content: center;
  padding-top: 80px; color: rgba(124,58,237,0.5); font-size: 24px;
}

/* Mobile: vertical stack, arrows point down */
```

---

### Section 6: Social Proof / Testimonials

Three student testimonials in a horizontal card row.

```
"I found 5 years of CSC past          "The profile system is fire. I got    "As a lecturer, sharing notes with
questions in one afternoon.            recognized for uploading notes and     my class is now so much easier.
ESUTSphere changed how I prepare       my followers grew from 0 to 200        Students actually engage with
for exams completely."                 in 2 weeks."                           the material."

— @chika_cs, CSC 300L                 — @temi_400, CSC 400L                 — Dr. A. Nwachukwu, Dept. of CS
```

```css
.testimonials-section {
  padding: 100px 40px; max-width: 1200px; margin: 0 auto;
}

.testimonial-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.testimonial-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; padding: 28px;
  position: relative; overflow: hidden;
  transition: all 0.3s ease;
}
.testimonial-card::before {
  content: '"'; position: absolute; top: -10px; left: 20px;
  font: 'Instrument Serif' 120px; color: rgba(124,58,237,0.12);
  line-height: 1; pointer-events: none;
}
.testimonial-card:hover {
  border-color: rgba(124,58,237,0.25);
  transform: translateY(-4px);
}

.testimonial-text {
  font: Geist 15px; color: #CBD5E1; line-height: 26px;
  margin-bottom: 24px; position: relative; z-index: 1;
}

.testimonial-author {
  display: flex; align-items: center; gap: 12px;
}
.testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.testimonial-name { font: Geist 14px weight 600; color: #F8FAFC; }
.testimonial-handle { font: Geist 12px; color: #475569; }

/* Stars */
.stars { display: flex; gap: 3px; margin-bottom: 16px; }
.star { color: #F59E0B; font-size: 14px; }
```

---

### Section 7: CTA Banner

Full-width call-to-action section before footer. Glassmorphism card on gradient background.

```
🚀  Ready to Join the ESUTSphere Community?

Be part of the largest academic social network at ESUT.
Connect with classmates, access resources, and take your
academic journey to the next level.

[→ Create Your Free Account]        [Learn More]

Free for all ESUT students. No credit card required.
```

```css
.cta-section {
  padding: 80px 40px; position: relative; overflow: hidden;
}

.cta-card {
  max-width: 800px; margin: 0 auto;
  background: rgba(22,22,42,0.7);
  border: 1px solid rgba(124,58,237,0.25);
  border-radius: 28px; padding: 64px 56px;
  text-align: center; position: relative; overflow: hidden;
  backdrop-filter: blur(16px);
}

/* Background glow */
.cta-card::before {
  content: ''; position: absolute; inset: 0; border-radius: 28px;
  background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%);
  pointer-events: none;
}

/* Top border glow */
.cta-card::after {
  content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
  background: linear-gradient(to right, transparent, rgba(168,85,247,0.8), transparent);
}

.cta-rocket {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.3);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px; font-size: 28px;
  animation: cta-pulse 2s ease-in-out infinite;
}

@keyframes cta-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
  50%       { box-shadow: 0 0 0 20px rgba(124,58,237,0); }
}

.cta-title {
  font: 'Instrument Serif' clamp(28px, 4vw, 44px);
  color: #F8FAFC; margin-bottom: 16px; line-height: 1.2;
}

.cta-subtitle { font: Geist 16px; color: #94A3B8; max-width: 480px; margin: 0 auto 36px; line-height: 26px; }

.cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }

.cta-fine { font: Geist 13px; color: #475569; }
```

---

### Section 8: Footer

```
[Logo + ESUTSphere]                    [Platform]    [Resources]    [Company]
The premier academic social            Home          Study Materials About Us
platform for Enugu State               Library       Past Questions  Contact
University of Science and             Community     Tutorials       Privacy Policy
Technology students.                  Blog          Help Center     Terms of Service

[Twitter] [GitHub] [LinkedIn] [Email]

─────────────────────────────────────────────────────────────────
© 2026 ESUTSphere. All rights reserved.  ·  Made with love for ESUT students
```

```css
.footer {
  background: #0F0F1A;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 64px 40px 32px;
}

.footer-grid {
  display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr;
  gap: 48px; max-width: 1200px; margin: 0 auto 48px;
}

.footer-brand p { font: Geist 14px; color: #475569; line-height: 22px; max-width: 280px; margin: 16px 0 24px; }

.footer-socials { display: flex; gap: 10px; }
.footer-social-btn {
  width: 36px; height: 36px; border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  color: #94A3B8; font-size: 16px;
  transition: all 0.15s ease;
}
.footer-social-btn:hover { background: rgba(124,58,237,0.15); color: #A855F7; border-color: rgba(124,58,237,0.3); }

.footer-col h4 { font: Geist 13px weight 700; color: #F8FAFC; letter-spacing: 0.5px; margin-bottom: 16px; text-transform: uppercase; }
.footer-col a  { display: block; font: Geist 14px; color: #475569; margin-bottom: 10px; text-decoration: none; transition: color 0.15s; }
.footer-col a:hover { color: #CBD5E1; }

.footer-bottom {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font: Geist 13px; color: #475569;
}
.footer-bottom .love { color: #7C3AED; }
```

---

### Full Page Animations — Entry Sequence

```css
/* Staggered section reveals using Intersection Observer */
.reveal-section {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-section.in-view {
  opacity: 1; transform: translateY(0);
}

/* Stagger children */
.reveal-section.in-view .reveal-child:nth-child(1) { transition-delay: 0ms; }
.reveal-section.in-view .reveal-child:nth-child(2) { transition-delay: 80ms; }
.reveal-section.in-view .reveal-child:nth-child(3) { transition-delay: 160ms; }
.reveal-section.in-view .reveal-child:nth-child(4) { transition-delay: 240ms; }
```

---

### Mobile Landing Page Rules

- Navbar: Logo + bell + hamburger (3 items max)
- Hero: Full-width text, CTA buttons stacked, floating cards below at 80% scale, stacked vertically (not angled)
- Stats: 2×2 grid
- Features: Tab selector above, full-width preview image below
- How it works: Vertical steps, arrow points down
- Testimonials: Horizontal scroll (snap scroll)
- CTA: Full-width, buttons stacked
- Footer: 2×2 grid for links, then brand info

---

### Navigation Links

**Public (Guest):**
- `/` — Landing page
- `/library` — Browse documents (read-only, no download)
- `/blog` — Read blog posts
- `/blog/[slug]` — Single blog post
- `/login` — Sign in / Sign up
- `/onboarding/*` — Multi-step onboarding

**Authenticated + Approved:**
- `/feed` — Campus feed
- `/explore` — Trending + discover users
- `/library` — Full access with download
- `/library/[docId]` — Document viewer
- `/blog/write` — Write blog post
- `/profile/[username]` — User profiles
- `/dashboard` — Personal dashboard
- `/dashboard/uploads` — My uploads
- `/dashboard/bookmarks` — Saved items
- `/dashboard/settings` — Account settings
- `/notifications` — All notifications
- `/upload` — Upload document

**Class Admin (+ all above):**
- `/class-admin` — Class admin dashboard
- `/class-admin/approvals` — Pending approvals for their class
- `/class-admin/class` — Class members list

**Super Admin (+ all above):**
- `/admin` — Super admin overview
- `/admin/users` — All users table
- `/admin/approvals` — All pending approvals
- `/admin/content` — Content moderation
- `/admin/reports` — Reported content queue
- `/admin/settings` — Site settings

---

## PART 2: ALL PAGES — COMPLETE LIST WITH ACCESS AUDIT

| # | Route | Page Name | Access Level | Auth Required | Notes |
|---|-------|-----------|-------------|---------------|-------|
| 1 | `/` | Landing Page | Public | No | SEO-optimized, guest browsable |
| 2 | `/login` | Sign In / Sign Up | Public | No | Redirect to /feed if already auth'd |
| 3 | `/onboarding/step-1` | Academic Info | New User | Yes (Google Auth) | Redirect here if no user doc in Firestore |
| 4 | `/onboarding/step-2` | Profile Setup | New User | Yes | Username, display name, photo |
| 5 | `/onboarding/step-3` | Admission Upload | New User | Yes | Cloudinary upload, drag+drop |
| 6 | `/onboarding/pending` | Awaiting Approval | Pending User | Yes | Locked — amber banner, pulsing clock |
| 7 | `/feed` | Campus Feed | Approved Users | Yes + Approved | For You / Following / Department tabs |
| 8 | `/explore` | Explore | Approved Users | Yes + Approved | Trending tags, suggested users, leaderboard |
| 9 | `/library` | Resource Library | Approved Users | Yes + Approved | Full filters, search, download access |
| 10 | `/library/[docId]` | Document Viewer | Approved Users | Yes + Approved | PDF preview, reactions, comments |
| 11 | `/upload` | Upload Document | Approved Students+ | Yes + Approved | 3-step modal or page |
| 12 | `/blog` | Blog Listing | Public (read) | No for reading | Write = requires auth |
| 13 | `/blog/[slug]` | Single Blog Post | Public (read) | No for reading | Reactions/comments = requires auth |
| 14 | `/blog/write` | Write Blog Post | Approved Users | Yes + Approved | TipTap editor, cover image, publish |
| 15 | `/profile/[username]` | User Profile | Public | No | Shows uploads, posts, badges tabs |
| 16 | `/dashboard` | Student Dashboard | Approved Users | Yes + Approved | Welcome, stats, quick actions |
| 17 | `/dashboard/uploads` | My Uploads | Approved Users | Yes + Approved | List of user's documents |
| 18 | `/dashboard/bookmarks` | Bookmarks | Approved Users | Yes + Approved | Saved docs + posts |
| 19 | `/dashboard/settings` | Settings | Approved Users | Yes + Approved | Edit profile, notifications, password |
| 20 | `/notifications` | Notifications | Approved Users | Yes + Approved | Full page on mobile |
| 21 | `/class-admin` | Class Admin Dashboard | Class Admin | Yes + class_admin role | Overview for course rep |
| 22 | `/class-admin/approvals` | Class Approvals | Class Admin | Yes + class_admin role | Verify + approve/reject students |
| 23 | `/class-admin/class` | Class Members | Class Admin | Yes + class_admin role | All verified members of their class |
| 24 | `/admin` | Super Admin Overview | Super Admin | Yes + super_admin role | Stats, alerts, quick actions |
| 25 | `/admin/users` | User Management | Super Admin | Yes + super_admin role | Search, filter, assign roles, ban |
| 26 | `/admin/approvals` | All Approvals | Super Admin | Yes + super_admin role | All pending across all classes |
| 27 | `/admin/content` | Content Moderation | Super Admin | Yes + super_admin role | Flag/remove documents, posts |
| 28 | `/admin/reports` | Reports Queue | Super Admin | Yes + super_admin role | User-reported content |
| 29 | `/admin/settings` | Site Settings | Super Admin | Yes + super_admin role | Registration toggle, file limits |
| 30 | `/404` | Not Found | Public | No | Error page with ESUTSphere branding |
| 31 | `/403` | Forbidden | Public | No | Role-restricted access error |
| 32 | `/500` | Server Error | Public | No | Internal error page |

---

## PART 3: CURRENT BUILD AUDIT (esutsphere.vercel.app)

### Ratings

| Page | Score | Status |
|------|-------|--------|
| Campus Feed | 7/10 | ✅ Deployed — needs tabs, right sidebar, 5-type reactions |
| Draft New Post | 6/10 | ✅ Deployed — toolbar incomplete, no cover/tags |
| Resource Library | 7.5/10 | ✅ Deployed — needs 3-col grid, left filter sidebar |
| Document Viewer | 7/10 | ✅ Deployed — PDF white bg jarring, needs comments below |
| Blog Post | 7.5/10 | ✅ Deployed — Instrument Serif title looks great |
| Blog Body | 6/10 | ✅ Deployed — TipTap styles not applied in render |
| Profile Page | 7/10 | ✅ Deployed — Follow button wrong color, no cover photo |
| Mobile Feed | 7.5/10 | ✅ Deployed — "Alerts" label, FAB needs gradient |

### Priority Fixes for Current Build

1. **Feed tabs missing** — Add "For You / Following / My Department" tabs below "Campus Feed" heading
2. **PDF white background** — Wrap `react-pdf` output in dark canvas: `background: #1a1a2e; padding: 16px`
3. **Follow button** — Change from white fill to `background: transparent; border: 1px solid #7C3AED; color: #A855F7`
4. **Blog body styles** — Apply `prose` class or equivalent TipTap CSS to rendered blog content
5. **Mobile FAB** — Add `background: linear-gradient(135deg, #7C3AED, #06B6D4)` (not flat purple)
6. **Mobile tab label** — Change "Alerts" → "Notifications"
7. **Library grid** — Change from 2-col to 3-col on desktop: `grid-template-columns: repeat(3, 1fr)`
8. **Upload modal** — Add 3-step progress indicator (not currently visible)

---

## PART 4: LANDING PAGE → APP NAVIGATION FLOW

When a guest clicks any CTA on the landing page:

```
[Get Started — Free] → /login → Google Auth popup
                         ↓
                    New user? → /onboarding/step-1 → step-2 → step-3 → /onboarding/pending
                    Existing + approved? → /feed
                    Existing + pending? → /onboarding/pending
                    Existing + rejected? → /login (with rejection message)

[See How It Works] → Smooth scroll to #features section on landing page

[Library nav link] → /library (guest view — browse only, no download)

[Blog nav link] → /blog (guest view — read only, no comments)

[Sign In button top nav] → /login
```

All landing page CTAs must link to the live app: `https://esutsphere.vercel.app`

---

*ESUTSphere Landing Page + Pages Guide — v1.0*
*Build the landing page to make every ESUT student feel: "This was made for me."*
