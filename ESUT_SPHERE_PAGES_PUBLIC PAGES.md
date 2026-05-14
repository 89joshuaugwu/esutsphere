# ESUTSphere — Library · Blog · Profile · Error Pages
## Combined Design + Context Specification

> Covers: /library · /library/[docId] · /blog · /blog/[slug] · /profile/[username] · /404 · /403 · /500
> Reference DESIGN.md for global tokens. Reference CONTEXT.md for data schemas.
> Stack: Next.js 16 · Tailwind v4 · Motion · Firebase Firestore · Cloudinary · react-pdf
> Updated: May 2026

---

## PART 1: RESOURCE LIBRARY — /library

### Page Identity

The Library is the **academic heart** of ESUTSphere. This is where the platform proves its value. A student looking for CSC 466 notes should land here and feel like they found exactly what they need in under 10 seconds. Design priority: speed of discovery, visual trust signals, and content density without clutter.

**Access:** Authenticated + Approved users (full access) · Guests (browse only, no download)

---

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│ TOP NAV (global — 64px sticky)                                      │
├──────────────────────────────────────────────────────────────────── ┤
│  LIBRARY HEADER                                                     │
│  "Resource Library"  [subtitle]              [+ Upload Material]   │
├───────────────────────────────────────────────────────────────────  ┤
│  FILTER BAR (sticky, below header on scroll)                       │
│  [🔍 Search by course code or title]  [Type ▾] [Level ▾] [Dept ▾] │
│  [Active filter chips: × Notes  × CSC  × 400L]  [Clear all]       │
├────────────────┬───────────────────────────────────────────────────┤
│ LEFT FILTER    │  DOCUMENT GRID                                    │
│ SIDEBAR        │  [card] [card] [card]                             │
│ 240px fixed    │  [card] [card] [card]                             │
│                │  [card] [card] [card]                             │
│                │  [Load more / infinite scroll]                    │
└────────────────┴───────────────────────────────────────────────────┘
```

**Mobile (≤639px):**
- Filter bar collapses to a single "Filter & Sort" button that opens a bottom sheet
- Grid becomes 1 column
- Left sidebar hidden entirely (moved into bottom sheet)

---

### Library Header

```css
.library-header {
  padding: 32px 32px 24px;
  display: flex; align-items: flex-end; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.library-title {
  font-family: 'Instrument Serif';
  font-size: clamp(28px, 3vw, 40px);
  color: #F8FAFC; line-height: 1.1; margin-bottom: 8px;
}

.library-subtitle {
  font: Geist 14px; color: #94A3B8;
}

.library-meta-strip {
  display: flex; align-items: center; gap: 16px; margin-top: 10px;
}
.library-meta-item {
  display: flex; align-items: center; gap: 6px;
  font: Geist 13px weight 500; color: #94A3B8;
}
.library-meta-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
}

/* Upload button */
.upload-material-btn {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 14px weight 700;
  padding: 10px 20px; border-radius: 10px; border: none;
  box-shadow: 0 6px 20px rgba(124,58,237,0.35);
  cursor: pointer; white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.upload-material-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(124,58,237,0.5);
}
```

---

### Filter Bar (Sticky)

```css
.library-filter-bar {
  position: sticky; top: 64px; z-index: 50;
  background: rgba(8,8,16,0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 14px 32px;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}

/* Search input */
.library-search {
  position: relative; flex: 1; min-width: 240px; max-width: 380px;
}
.library-search-input {
  width: 100%; height: 40px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px; padding: 0 14px 0 40px;
  color: #F8FAFC; font: Geist 14px;
  transition: all 0.2s ease;
}
.library-search-input:focus {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
  background: rgba(124,58,237,0.04);
  outline: none;
}
.library-search-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: #475569; font-size: 15px; pointer-events: none;
}

/* Filter dropdowns */
.filter-dropdown-btn {
  height: 40px; padding: 0 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px; color: #CBD5E1;
  font: Geist 13px weight 500;
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; white-space: nowrap;
  transition: all 0.15s ease;
}
.filter-dropdown-btn:hover { background: rgba(255,255,255,0.08); }
.filter-dropdown-btn.active {
  background: rgba(124,58,237,0.12);
  border-color: rgba(124,58,237,0.4);
  color: #A855F7;
}
.filter-chevron {
  font-size: 12px; color: #94A3B8;
  transition: transform 0.2s ease;
}
.filter-dropdown-btn.open .filter-chevron { transform: rotate(180deg); }

/* Active filter chips */
.filter-chips-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.filter-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.3);
  border-radius: 9999px; padding: 4px 10px;
  font: Geist 12px weight 600; color: #A855F7;
}
.filter-chip-remove {
  cursor: pointer; font-size: 14px; line-height: 1;
  color: rgba(168,85,247,0.6); transition: color 0.12s;
  background: none; border: none; padding: 0;
}
.filter-chip-remove:hover { color: #A855F7; }

.filter-clear-all {
  font: Geist 13px weight 500; color: #EF4444;
  background: none; border: none; cursor: pointer;
  padding: 0; transition: color 0.12s;
}
.filter-clear-all:hover { color: #F87171; }

/* Sort control */
.sort-select {
  height: 40px; padding: 0 32px 0 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px; color: #CBD5E1;
  font: Geist 13px weight 500;
  appearance: none; cursor: pointer;
}
```

Sort options: Most Recent · Most Downloaded · Most Liked · Oldest First

---

### Left Filter Sidebar

```css
.library-sidebar {
  width: 240px; flex-shrink: 0;
  padding: 20px 0 20px 0;
  border-right: 1px solid rgba(255,255,255,0.06);
  position: sticky; top: calc(64px + 57px); /* nav + filter bar */
  height: calc(100vh - 64px - 57px);
  overflow-y: auto;
}

.sidebar-section { padding: 0 20px 20px; }
.sidebar-section:not(:last-child) {
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 20px;
}

.sidebar-section-title {
  font: Geist 11px weight 700; color: #475569;
  letter-spacing: 0.8px; text-transform: uppercase;
  margin-bottom: 10px;
}

/* Filter option row */
.sidebar-filter-option {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 10px; border-radius: 8px; cursor: pointer;
  transition: all 0.12s ease;
}
.sidebar-filter-option:hover { background: rgba(255,255,255,0.04); }
.sidebar-filter-option.active { background: rgba(124,58,237,0.10); }

.sidebar-option-label {
  font: Geist 13px weight 500; color: #94A3B8;
  display: flex; align-items: center; gap: 8px;
}
.sidebar-filter-option.active .sidebar-option-label { color: #A855F7; }

.sidebar-option-count {
  font: Geist 11px weight 600; color: #475569;
  background: rgba(255,255,255,0.06);
  border-radius: 9999px; padding: 1px 7px;
}
.sidebar-filter-option.active .sidebar-option-count {
  background: rgba(124,58,237,0.15); color: #A855F7;
}

/* Content type color dots */
.type-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
```

**Sidebar sections:**
1. **Content Type** — Notes · Past Questions · Research · Assignments · Seminars · Textbooks · Projects · Handouts
2. **Level** — 100L through 600L + PG
3. **Academic Session** — 2024/2025 · 2023/2024 · 2022/2023 · Older
4. **Lecturer Uploads Only** — toggle switch

---

### Document Card (Grid Item)

```css
.doc-card {
  background: #16162A;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  border-top: 3px solid var(--type-color);
  padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  cursor: pointer;
  transition: all 0.22s ease;
  text-decoration: none;
  position: relative; overflow: hidden;
}
.doc-card:hover {
  background: #1E1E35;
  border-color: rgba(255,255,255,0.14);
  border-top-color: var(--type-color);
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.4);
}

/* Shimmer on hover */
.doc-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%);
  opacity: 0; transition: opacity 0.2s;
}
.doc-card:hover::before { opacity: 1; }

/* Top row: type badge + course code */
.doc-card-top {
  display: flex; align-items: center; justify-content: space-between;
}
.doc-type-badge {
  font: Geist 10px weight 700; letter-spacing: 0.6px;
  text-transform: uppercase; padding: 3px 8px;
  border-radius: 6px;
  background: rgba(var(--type-rgb), 0.15);
  color: var(--type-color);
  border: 1px solid rgba(var(--type-rgb), 0.25);
}
.doc-course-code {
  font: Geist 12px weight 600; color: #94A3B8;
  background: rgba(255,255,255,0.06);
  border-radius: 6px; padding: 3px 8px;
}

/* Title */
.doc-card-title {
  font: Geist 15px weight 700; color: #F8FAFC;
  line-height: 22px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Description */
.doc-card-desc {
  font: Geist 13px; color: #94A3B8; line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* Footer: uploader + stats */
.doc-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: auto;
}
.doc-card-uploader {
  display: flex; align-items: center; gap: 7px;
}
.doc-uploader-avatar {
  width: 22px; height: 22px; border-radius: 50%;
  object-fit: cover; border: 1px solid rgba(255,255,255,0.1);
}
.doc-uploader-name {
  font: Geist 12px weight 500; color: #94A3B8;
}
/* Lecturer badge on uploader name */
.lecturer-badge {
  font: Geist 10px weight 700; color: #06B6D4;
  background: rgba(6,182,212,0.10); border-radius: 4px;
  padding: 1px 5px; margin-left: 4px;
}

.doc-card-stats {
  display: flex; align-items: center; gap: 10px;
}
.doc-stat {
  display: flex; align-items: center; gap: 4px;
  font: Geist 12px weight 500; color: #475569;
}
.doc-stat-icon { font-size: 12px; }
```

**Document type color variables:**
```css
.type-notes       { --type-color: #A855F7; --type-rgb: 168,85,247; }
.type-past-q      { --type-color: #F59E0B; --type-rgb: 245,158,11; }
.type-research    { --type-color: #06B6D4; --type-rgb: 6,182,212; }
.type-assignment  { --type-color: #10B981; --type-rgb: 16,185,129; }
.type-seminar     { --type-color: #EC4899; --type-rgb: 236,72,153; }
.type-textbook    { --type-color: #F97316; --type-rgb: 249,115,22; }
.type-project     { --type-color: #8B5CF6; --type-rgb: 139,92,246; }
.type-handout     { --type-color: #94A3B8; --type-rgb: 148,163,184; }
```

---

### Document Grid Layout

```css
.doc-grid {
  padding: 24px 32px;
  flex: 1;
}

.doc-grid-inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Responsive */
@media (max-width: 1279px) { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 639px)  { grid-template-columns: 1fr; }

/* Staggered entry animation */
.doc-card:nth-child(1)  { animation-delay: 0ms; }
.doc-card:nth-child(2)  { animation-delay: 50ms; }
.doc-card:nth-child(3)  { animation-delay: 100ms; }
.doc-card:nth-child(4)  { animation-delay: 150ms; }
.doc-card:nth-child(5)  { animation-delay: 200ms; }
.doc-card:nth-child(6)  { animation-delay: 250ms; }

.doc-card {
  animation: card-enter 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes card-enter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### Empty State — Library

```
[📄 Large icon]
No documents found
Try adjusting your filters or be the first to upload for this course.

[+ Upload First Document]
```

---

### Load More / Infinite Scroll

```css
.load-more-trigger {
  height: 80px; display: flex; align-items: center; justify-content: center;
  /* Intersection Observer triggers next page load when visible */
}
.load-more-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.08);
  border-top-color: #7C3AED;
  animation: spin 0.8s linear infinite;
}
```

---

### Firebase Query Logic

```typescript
// lib/firestore.ts
export async function getDocuments(filters: {
  contentType?: string;
  department?: string;
  level?: string;
  courseCode?: string;
  academicSession?: string;
  isLecturerUpload?: boolean;
  sortBy: 'createdAt' | 'downloadCount' | 'likesCount';
  lastDoc?: DocumentSnapshot;
  limit?: number;
}) {
  let q = query(
    collection(db, 'documents'),
    where('isApproved', '==', true),
    orderBy(filters.sortBy, 'desc'),
    limit(filters.limit || 18)
  );

  if (filters.contentType) q = query(q, where('contentType', '==', filters.contentType));
  if (filters.department)  q = query(q, where('department', '==', filters.department));
  if (filters.level)       q = query(q, where('level', '==', filters.level));
  if (filters.lastDoc)     q = query(q, startAfter(filters.lastDoc));

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
```

---

## PART 2: DOCUMENT VIEWER — /library/[docId]

### Page Identity

This is where the document lives. A student clicks a card and lands here expecting to read, download, react, and discuss. The PDF must be visible immediately, the dark canvas must wrap it properly (no white flash), and the social layer (reactions + comments) must feel natural below the viewer.

---

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV                                                          │
├──────────────────────────────────────────────────────────────── ┤
│  ← Back to Library          [Breadcrumb: Library > CSC 466]    │
├───────────────────────────────────────┬─────────────────────────┤
│  MAIN CONTENT (left, ~65%)            │  SIDEBAR (right, ~35%) │
│                                       │                         │
│  [Document Header Card]               │  [Uploader Profile]     │
│  [PDF Viewer]                         │  [Document Stats]       │
│  [Reaction Bar]                       │  [Related Documents]    │
│  [Comment Section]                    │  [Share Options]        │
│                                       │  [Report Link]          │
└───────────────────────────────────────┴─────────────────────────┘
```

**Mobile:** Single column, sidebar stacks below PDF viewer

---

### Document Header Card

```css
.doc-header-card {
  background: rgba(22,22,42,0.7);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 24px;
  margin-bottom: 20px;
  position: relative; overflow: hidden;
}

/* Type color accent line */
.doc-header-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--type-color);
}

/* Top row */
.doc-header-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
}

/* Title */
.doc-viewer-title {
  font-family: 'Instrument Serif';
  font-size: clamp(22px, 2.5vw, 30px);
  color: #F8FAFC; line-height: 1.2; margin-bottom: 12px;
}

/* Meta row */
.doc-viewer-meta {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  font: Geist 13px; color: #94A3B8;
}
.doc-meta-item { display: flex; align-items: center; gap: 5px; }
.doc-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: #475569; }

/* Download button */
.doc-download-btn {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 14px weight 700;
  padding: 10px 20px; border-radius: 10px; border: none;
  box-shadow: 0 6px 20px rgba(124,58,237,0.35);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.doc-download-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(124,58,237,0.5); }

/* Download counter animation */
.download-count-badge {
  font: Geist 12px weight 600; color: #94A3B8;
  background: rgba(255,255,255,0.06);
  border-radius: 9999px; padding: 3px 10px;
}
```

---

### PDF Viewer (Dark Canvas)

```css
/* Outer wrapper — critical for dark theme */
.pdf-viewer-outer {
  background: #0A0A14;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; overflow: hidden;
  margin-bottom: 24px;
}

/* Toolbar */
.pdf-toolbar {
  background: #0F0F1A;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 10px 16px;
  display: flex; align-items: center; gap: 12px;
  position: sticky; top: calc(64px + 57px); z-index: 20;
}

.pdf-page-nav {
  display: flex; align-items: center; gap: 8px;
}
.pdf-nav-btn {
  width: 32px; height: 32px; border-radius: 7px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s; font-size: 16px;
}
.pdf-nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.10); color: #F8FAFC; }
.pdf-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.pdf-page-indicator {
  font: Geist 13px weight 500; color: #94A3B8;
  min-width: 80px; text-align: center;
}
.pdf-page-indicator span { color: #F8FAFC; font-weight: 600; }

.pdf-zoom-controls {
  display: flex; align-items: center; gap: 8px; margin-left: auto;
}
.pdf-zoom-level {
  font: Geist 13px weight 600; color: #CBD5E1;
  min-width: 48px; text-align: center;
}

.pdf-fullscreen-btn {
  width: 32px; height: 32px; border-radius: 7px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
}

/* PDF canvas area — dark background wrapping white pages */
.pdf-canvas-area {
  background: #111118;
  padding: 24px 20px;
  overflow-y: auto;
  max-height: 70vh;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}

/* Each rendered page — slight shadow to float above dark bg */
.pdf-page-wrapper {
  box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5);
  border-radius: 3px; overflow: hidden;
}

/* Loading state */
.pdf-loading-state {
  height: 500px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
}
.pdf-loading-spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 3px solid rgba(124,58,237,0.2);
  border-top-color: #7C3AED;
  animation: spin 1s linear infinite;
}
.pdf-loading-text { font: Geist 14px; color: #475569; }

/* Non-PDF fallback */
.pdf-unsupported-state {
  padding: 60px 32px; text-align: center;
}
.pdf-unsupported-icon { font-size: 56px; margin-bottom: 20px; opacity: 0.5; }
.pdf-unsupported-title { font: Geist 18px weight 600; color: #F8FAFC; margin-bottom: 8px; }
.pdf-unsupported-text  { font: Geist 14px; color: #94A3B8; margin-bottom: 24px; }
```

**react-pdf implementation note:**
```typescript
// Must invert PDF pages for dark mode — not the viewer background
// The PDF pages themselves will still be white (correct for readability)
// The surrounding canvas is dark — this is the correct approach

// Scroll sync: when user scrolls in the canvas, update currentPage
// using IntersectionObserver on each page wrapper
```

---

### Reaction Bar (Document Viewer)

```css
.doc-reaction-bar {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 14px 18px;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  margin-bottom: 24px;
}

.reaction-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px; border-radius: 9999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 13px weight 500;
  cursor: pointer; transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1);
  user-select: none;
}
.reaction-btn:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.14); color: #CBD5E1;
  transform: scale(1.05);
}
.reaction-btn.active-like        { background:rgba(124,58,237,0.14); border-color:rgba(124,58,237,0.35); color:#A855F7; }
.reaction-btn.active-love        { background:rgba(239,68,68,0.12);  border-color:rgba(239,68,68,0.3);  color:#EF4444; }
.reaction-btn.active-fire        { background:rgba(249,115,22,0.12); border-color:rgba(249,115,22,0.3); color:#F97316; }
.reaction-btn.active-insightful  { background:rgba(245,158,11,0.12); border-color:rgba(245,158,11,0.3); color:#F59E0B; }
.reaction-btn.active-funny       { background:rgba(6,182,212,0.12);  border-color:rgba(6,182,212,0.3);  color:#22D3EE; }

.reaction-emoji { font-size: 17px; }
.reaction-count { font: Geist 13px weight 600; min-width: 18px; }

/* Pop animation on reaction click */
.reaction-btn:active { animation: reaction-pop 0.35s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes reaction-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.3); }
  70%  { transform: scale(0.92); }
  100% { transform: scale(1); }
}

/* Separator */
.reaction-bar-sep {
  width: 1px; height: 24px;
  background: rgba(255,255,255,0.08); margin: 0 2px;
}

/* Bookmark + Share buttons (right side) */
.reaction-bar-actions { margin-left: auto; display: flex; gap: 8px; }
.reaction-action-btn {
  width: 38px; height: 38px; border-radius: 9px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.reaction-action-btn:hover { background:rgba(255,255,255,0.08); color:#F8FAFC; }
.reaction-action-btn.bookmarked { color: #F59E0B; background:rgba(245,158,11,0.10); border-color:rgba(245,158,11,0.25); }
```

---

### Comment Section (Document Viewer)

```css
.comment-section {
  background: rgba(22,22,42,0.5);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 24px;
}

.comment-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.comment-section-title {
  font: Geist 16px weight 700; color: #F8FAFC;
  display: flex; align-items: center; gap: 8px;
}
.comment-count-badge {
  font: Geist 12px weight 600; color: #94A3B8;
  background: rgba(255,255,255,0.06); border-radius: 9999px; padding: 2px 8px;
}

/* New comment input */
.new-comment-row {
  display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px;
}
.new-comment-textarea {
  flex: 1; min-height: 48px; max-height: 120px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 12px; padding: 12px 16px;
  color: #F8FAFC; font: Geist 14px; resize: none; outline: none;
  transition: all 0.2s ease; line-height: 22px;
}
.new-comment-textarea:focus {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  min-height: 72px;
}
.new-comment-textarea::placeholder { color: #475569; }
.comment-submit-btn {
  height: 40px; padding: 0 16px; border-radius: 9px;
  background: #7C3AED; color: #FFFFFF;
  font: Geist 13px weight 600; border: none; cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap; flex-shrink: 0;
}
.comment-submit-btn:hover { background: #A855F7; }
.comment-submit-btn:disabled { background:rgba(124,58,237,0.3); cursor: not-allowed; }

/* Comment list */
.comment-list { display: flex; flex-direction: column; }

.comment-item {
  display: flex; gap: 12px; padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  animation: comment-enter 0.3s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes comment-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.comment-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; object-fit: cover; }
.comment-body  { flex: 1; }

.comment-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comment-author   { font: Geist 13px weight 700; color: #F8FAFC; text-decoration: none; }
.comment-author:hover { color: #A855F7; }
.comment-handle   { font: Geist 12px; color: #475569; }
.comment-time     { font: Geist 11px; color: #475569; margin-left: auto; }

.comment-text { font: Geist 14px; color: #CBD5E1; line-height: 22px; }

/* Mention highlighting */
.comment-mention { color: #7C3AED; font-weight: 600; cursor: pointer; }
.comment-mention:hover { color: #A855F7; }

.comment-actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.comment-action {
  font: Geist 12px weight 500; color: #475569;
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 4px; transition: color 0.12s;
}
.comment-action:hover { color: #94A3B8; }
.comment-action.liked { color: #7C3AED; }

/* Nested reply */
.comment-replies {
  margin-top: 8px; margin-left: 48px;
  border-left: 2px solid rgba(255,255,255,0.06);
  padding-left: 14px;
}

/* Load more comments */
.load-more-comments {
  text-align: center; padding: 16px 0;
  font: Geist 13px weight 500; color: #7C3AED;
  cursor: pointer; background: none; border: none; width: 100%;
  transition: color 0.12s;
}
.load-more-comments:hover { color: #A855F7; }
```

---

### Right Sidebar (Document Viewer)

```css
.doc-viewer-sidebar {
  width: 300px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 16px;
  position: sticky; top: calc(64px + 57px + 16px);
  max-height: calc(100vh - 64px - 57px - 32px);
  overflow-y: auto;
}

/* Uploader card */
.uploader-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px;
}
.uploader-card-title {
  font: Geist 11px weight 700; color: #475569;
  letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px;
}
.uploader-row { display: flex; align-items: center; gap: 12px; }
.uploader-info { flex: 1; }
.uploader-name { font: Geist 14px weight 600; color: #F8FAFC; }
.uploader-handle { font: Geist 12px; color: #94A3B8; }
.uploader-follow-btn {
  height: 32px; padding: 0 14px; border-radius: 7px;
  background: transparent; border: 1px solid rgba(124,58,237,0.4);
  color: #A855F7; font: Geist 12px weight 600; cursor: pointer;
  transition: all 0.15s;
}
.uploader-follow-btn:hover { background: rgba(124,58,237,0.12); }
.uploader-follow-btn.following {
  background: rgba(124,58,237,0.12); color: #A855F7;
}

/* Stats card */
.doc-stats-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px;
}
.doc-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.doc-stat-item { text-align: center; }
.doc-stat-value { font: 'Instrument Serif' 22px; color: #F8FAFC; display: block; }
.doc-stat-label { font: Geist 11px; color: #475569; }

/* Related documents */
.related-docs-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px;
}
.related-doc-row {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 0; cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  text-decoration: none; transition: background 0.12s;
}
.related-doc-row:last-child { border-bottom: none; padding-bottom: 0; }
.related-doc-type-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--type-color); flex-shrink: 0; margin-top: 6px;
}
.related-doc-title { font: Geist 13px weight 500; color: #CBD5E1; line-height: 19px; }
.related-doc-title:hover { color: #A855F7; }
.related-doc-meta { font: Geist 11px; color: #475569; margin-top: 3px; }

/* Share card */
.share-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px;
}
.share-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.share-btn {
  height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #94A3B8; font: Geist 12px weight 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all 0.15s;
}
.share-btn:hover { background: rgba(255,255,255,0.08); color: #F8FAFC; }
.share-btn.whatsapp:hover { background:rgba(37,211,102,0.12); color:#25D366; border-color:rgba(37,211,102,0.25); }
.share-btn.twitter:hover  { background:rgba(29,155,240,0.12);  color:#1D9BF0; border-color:rgba(29,155,240,0.25); }
.share-btn.copy:hover     { background:rgba(124,58,237,0.12);  color:#A855F7; border-color:rgba(124,58,237,0.25); }
```

---

### generateMetadata — Document Viewer

```typescript
export async function generateMetadata({ params }: { params: { docId: string } }): Promise<Metadata> {
  const doc = await getDocument(params.docId);
  if (!doc) return { title: 'Document Not Found — ESUTSphere' };
  return {
    title: `${doc.title} — ESUTSphere`,
    description: `${doc.contentType.replace('_',' ')} for ${doc.courseCode}: ${doc.description?.slice(0,120)}`,
    openGraph: {
      title: doc.title,
      description: doc.description?.slice(0,160),
      url: `${process.env.NEXT_PUBLIC_APP_URL}/library/${params.docId}`,
      images: [doc.thumbnailUrl || '/og-image.png'],
    },
  };
}
```

---

## PART 3: BLOG LISTING — /blog

### Page Identity

The Blog is the **voice of the ESUT community** — where students write campus news, share experiences, give academic tips, and discuss life at ESUT. The listing page should feel like a premium editorial magazine, not a generic blog feed. Featured post at the top, category filters, clean card grid.

**Access:** Public (read) · Approved users (write + react + comment)

---

### Blog Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV                                                          │
├─────────────────────────────────────────────────────────────────┤
│ BLOG HEADER                                                      │
│ "Campus Blog"  [subtitle]                  [✏ Write Post]       │
├─────────────────────────────────────────────────────────────────┤
│ FEATURED POST (full-width hero card)                            │
├─────────────────────────────────────────────────────────────────┤
│ CATEGORY FILTER TABS                                            │
│ [All] [Campus News] [Academic] [Tech] [Career] [Opinions]       │
├─────────────────────────────────────────────────────────────────┤
│ POST GRID (3 columns)                                           │
│ [card] [card] [card]                                           │
│ [card] [card] [card]                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### Featured Post Hero Card

```css
.blog-featured {
  margin: 0 32px 32px;
  border-radius: 20px; overflow: hidden;
  cursor: pointer; position: relative;
  min-height: 380px;
  display: flex; align-items: flex-end;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.blog-featured:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

/* Cover image */
.blog-featured-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}

/* Gradient overlay — readable text over image */
.blog-featured-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    rgba(8,8,16,0.97) 0%,
    rgba(8,8,16,0.7) 40%,
    rgba(8,8,16,0.1) 100%
  );
}

/* Content */
.blog-featured-content {
  position: relative; z-index: 1;
  padding: 32px;
}

.featured-eyebrow {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
}
.featured-badge {
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 11px weight 700;
  letter-spacing: 0.5px; text-transform: uppercase;
  padding: 4px 10px; border-radius: 9999px;
}
.featured-category {
  font: Geist 13px weight 600; color: #CBD5E1;
}
.featured-readtime { font: Geist 12px; color: #94A3B8; }
.featured-dot { color: #475569; }

.blog-featured-title {
  font-family: 'Instrument Serif';
  font-size: clamp(22px, 2.8vw, 34px);
  color: #F8FAFC; line-height: 1.2; margin-bottom: 12px;
}

.blog-featured-excerpt {
  font: Geist 15px; color: #CBD5E1; line-height: 24px;
  max-width: 600px; margin-bottom: 20px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.blog-featured-author {
  display: flex; align-items: center; gap: 10px;
}
.featured-avatar { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.15); }
.featured-author-name { font: Geist 13px weight 600; color: #F8FAFC; }
.featured-date { font: Geist 12px; color: #94A3B8; }
```

---

### Category Filter Tabs

```css
.blog-category-tabs {
  padding: 0 32px 24px;
  display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
}

.category-tab {
  padding: 8px 18px; border-radius: 9999px;
  font: Geist 13px weight 600; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent; color: #94A3B8;
  transition: all 0.18s ease;
  display: flex; align-items: center; gap: 6px;
}
.category-tab:hover { background:rgba(255,255,255,0.06); color:#CBD5E1; }
.category-tab.active {
  background: rgba(124,58,237,0.14);
  border-color: rgba(124,58,237,0.4);
  color: #A855F7;
}

.category-count {
  font: Geist 11px weight 700; color: inherit; opacity: 0.7;
}
```

Category icons:
- All → 📋
- Campus News → 📰
- Academic → 🎓
- Tech → 💻
- Career → 💼
- Opinions → 💬
- Lifestyle → 🌟

---

### Blog Post Card

```css
.blog-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; overflow: hidden;
  cursor: pointer; text-decoration: none;
  display: flex; flex-direction: column;
  transition: all 0.22s ease;
}
.blog-card:hover {
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}

/* Cover image */
.blog-card-cover {
  width: 100%; height: 180px; object-fit: cover;
  transition: transform 0.4s ease;
}
.blog-card:hover .blog-card-cover { transform: scale(1.04); }

/* Cover image wrapper with overflow hidden */
.blog-card-cover-wrap { overflow: hidden; height: 180px; }

/* No cover image fallback */
.blog-card-cover-placeholder {
  height: 180px;
  background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08));
  display: flex; align-items: center; justify-content: center;
  font-size: 48px; opacity: 0.6;
}

/* Content */
.blog-card-content { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 10px; }

/* Category + read time */
.blog-card-meta-top {
  display: flex; align-items: center; gap: 8px;
}
.blog-category-pill {
  font: Geist 11px weight 700; letter-spacing: 0.4px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 9999px;
}
/* Category pill colors */
.cat-campus-news { background:rgba(6,182,212,0.12);  color:#06B6D4; border:1px solid rgba(6,182,212,0.25); }
.cat-academic    { background:rgba(124,58,237,0.12); color:#A855F7; border:1px solid rgba(124,58,237,0.25); }
.cat-tech        { background:rgba(16,185,129,0.12); color:#10B981; border:1px solid rgba(16,185,129,0.25); }
.cat-career      { background:rgba(245,158,11,0.12); color:#F59E0B; border:1px solid rgba(245,158,11,0.25); }
.cat-opinions    { background:rgba(249,115,22,0.12); color:#F97316; border:1px solid rgba(249,115,22,0.25); }
.cat-lifestyle   { background:rgba(236,72,153,0.12); color:#EC4899; border:1px solid rgba(236,72,153,0.25); }

.blog-read-time { font: Geist 12px; color: #475569; }

.blog-card-title {
  font-family: 'Instrument Serif'; font-size: 18px;
  color: #F8FAFC; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.blog-card-excerpt {
  font: Geist 13px; color: #94A3B8; line-height: 20px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  flex: 1;
}

.blog-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: auto;
}
.blog-card-author { display: flex; align-items: center; gap: 7px; }
.blog-author-avatar { width: 24px; height: 24px; border-radius: 50%; }
.blog-author-name { font: Geist 12px weight 500; color: #94A3B8; }

.blog-card-stats { display: flex; align-items: center; gap: 8px; }
.blog-card-stat { display: flex; align-items: center; gap: 4px; font: Geist 12px; color: #475569; }
```

---

## PART 4: BLOG POST PAGE — /blog/[slug]

### Page Identity

This is the **reading experience**. When an ESUT student writes something worth reading, this page must honor that work. Wide margins, beautiful typography, generous whitespace. The Instrument Serif headline + Geist body combination must feel editorial-grade.

---

### Blog Post Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV                                                          │
├─────────────────────────────────────────────────────────────────┤
│                     HERO SECTION                                │
│  [← Back to Blog]  [Category pill]                             │
│                                                                 │
│  "Blog Post Title Goes Here"  (Instrument Serif, large)        │
│                                                                 │
│  [Author avatar] Jane Smith · Oct 12, 2024 · 5 min read       │
│  [📖 432 reads] [❤️ 89 reactions] [💬 24 comments]            │
│                                                                 │
│  [Cover image — full width, 420px height, border-radius 16px] │
├───────────────────────────────────────┬─────────────────────────┤
│  ARTICLE BODY  (max-width 680px)      │  STICKY SIDEBAR         │
│  TipTap rendered content              │  Author card            │
│                                       │  Table of contents      │
│                                       │  Share buttons          │
│                                       │  Related posts          │
├───────────────────────────────────────┴─────────────────────────┤
│  REACTION BAR (same as doc viewer)                              │
│  COMMENT SECTION (same as doc viewer)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Blog Post Hero

```css
.blog-post-hero {
  padding: 32px 40px 40px;
  max-width: 800px; margin: 0 auto;
}

.blog-back-link {
  display: inline-flex; align-items: center; gap: 8px;
  font: Geist 13px weight 500; color: #94A3B8;
  text-decoration: none; margin-bottom: 20px;
  transition: color 0.15s;
}
.blog-back-link:hover { color: #F8FAFC; }
.blog-back-arrow { transition: transform 0.15s; }
.blog-back-link:hover .blog-back-arrow { transform: translateX(-3px); }

/* Category + read time row */
.blog-post-meta-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
}

/* Post title */
.blog-post-title {
  font-family: 'Instrument Serif';
  font-size: clamp(28px, 4vw, 48px);
  color: #F8FAFC; line-height: 1.15; letter-spacing: -0.5px;
  margin-bottom: 20px;
}

/* Author row */
.blog-post-author-row {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 0;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 28px;
}
.blog-post-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.10);
}
.blog-post-author-info { flex: 1; }
.blog-post-author-name {
  font: Geist 15px weight 600; color: #F8FAFC;
  text-decoration: none;
}
.blog-post-author-name:hover { color: #A855F7; }
.blog-post-author-role { font: Geist 12px; color: #94A3B8; }

.blog-post-stats-row { display: flex; align-items: center; gap: 14px; }
.blog-post-stat { display: flex; align-items: center; gap: 5px; font: Geist 13px; color: #94A3B8; }

/* Cover image */
.blog-post-cover-wrap {
  border-radius: 16px; overflow: hidden;
  margin-bottom: 40px; width: 100%;
  max-height: 460px;
}
.blog-post-cover { width: 100%; height: 100%; object-fit: cover; display: block; }
```

---

### Article Body (TipTap Rendered Content)

This is critical — the rendered TipTap HTML must be styled beautifully. NOT just plain browser defaults.

```css
/* Article content wrapper */
.blog-article-body {
  max-width: 680px;
  font: Geist 16px;
  color: #CBD5E1;
  line-height: 28px;
  letter-spacing: 0.01em;
}

.blog-article-body p { margin-bottom: 22px; }

/* Headings */
.blog-article-body h1 {
  font-family: 'Instrument Serif'; font-size: 34px; font-weight: 400;
  color: #F8FAFC; line-height: 1.2; margin: 40px 0 18px;
}
.blog-article-body h2 {
  font-family: 'Instrument Serif'; font-size: 26px; font-weight: 400;
  color: #F8FAFC; line-height: 1.25; margin: 36px 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.blog-article-body h3 {
  font: Geist 20px weight 700;
  color: #F8FAFC; margin: 28px 0 10px; line-height: 1.3;
}
.blog-article-body h4 {
  font: Geist 17px weight 600;
  color: #F8FAFC; margin: 24px 0 8px;
}

/* Links */
.blog-article-body a {
  color: #06B6D4; text-decoration: underline;
  text-decoration-color: rgba(6,182,212,0.4);
  text-underline-offset: 3px; transition: all 0.15s;
}
.blog-article-body a:hover {
  color: #22D3EE;
  text-decoration-color: rgba(34,211,238,0.7);
}

/* Blockquote — premium styling */
.blog-article-body blockquote {
  margin: 32px 0;
  padding: 20px 24px;
  border-left: 3px solid #7C3AED;
  background: rgba(124,58,237,0.06);
  border-radius: 0 12px 12px 0;
  font-style: italic; color: #A8B3C7;
  font-size: 17px; line-height: 28px;
  position: relative;
}
.blog-article-body blockquote::before {
  content: '"';
  position: absolute; top: -10px; left: 16px;
  font-family: 'Instrument Serif'; font-size: 60px;
  color: rgba(124,58,237,0.3); line-height: 1;
}

/* Code inline */
.blog-article-body code {
  background: rgba(124,58,237,0.12);
  color: #A855F7; border-radius: 5px;
  padding: 2px 7px; font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
}

/* Code block */
.blog-article-body pre {
  background: #0A0A14;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 20px;
  overflow-x: auto; margin: 28px 0;
  font-family: 'JetBrains Mono', monospace; font-size: 14px;
  line-height: 22px; color: #A8B3C7;
}

/* Lists */
.blog-article-body ul, .blog-article-body ol {
  padding-left: 26px; margin-bottom: 22px;
}
.blog-article-body li { margin-bottom: 8px; line-height: 26px; }
.blog-article-body ul li::marker { color: #7C3AED; }
.blog-article-body ol li::marker { color: #7C3AED; font-weight: 600; }

/* Images in post */
.blog-article-body img {
  max-width: 100%; border-radius: 12px;
  margin: 28px 0; display: block;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

/* Horizontal rule */
.blog-article-body hr {
  border: none;
  height: 1px; background: rgba(255,255,255,0.08);
  margin: 40px 0;
}

/* Bold and italic */
.blog-article-body strong { color: #F8FAFC; font-weight: 700; }
.blog-article-body em     { color: #CBD5E1; font-style: italic; }

/* Drop cap for first paragraph */
.blog-article-body > p:first-of-type::first-letter {
  font-family: 'Instrument Serif';
  font-size: 68px; float: left;
  line-height: 0.8; margin: 8px 10px 0 0;
  color: #7C3AED; font-weight: 400;
}
```

---

### Blog Post Sidebar (Table of Contents + Author)

```css
.blog-post-sidebar {
  width: 260px; flex-shrink: 0;
  position: sticky; top: calc(64px + 16px);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
  padding-left: 40px;
}

/* Author card */
.blog-author-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px; text-align: center;
}
.blog-author-card-avatar {
  width: 56px; height: 56px; border-radius: 50%;
  margin: 0 auto 12px; border: 2px solid rgba(124,58,237,0.4);
}
.blog-author-card-name { font: Geist 15px weight 700; color: #F8FAFC; margin-bottom: 4px; }
.blog-author-card-dept { font: Geist 12px; color: #94A3B8; margin-bottom: 12px; }
.blog-author-card-stats {
  display: flex; justify-content: center; gap: 20px; margin-bottom: 14px;
  padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06);
}
.author-stat-val { font: Geist 16px weight 700; color: #F8FAFC; display: block; }
.author-stat-lab { font: Geist 10px; color: #475569; }

/* Table of contents */
.toc-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 18px;
}
.toc-title { font: Geist 12px weight 700; color: #475569; letter-spacing:0.8px; text-transform:uppercase; margin-bottom: 12px; }
.toc-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 6px 0; font: Geist 13px; color: #94A3B8;
  text-decoration: none; cursor: pointer; transition: color 0.12s;
  border-left: 2px solid transparent; padding-left: 10px; margin-left: -2px;
}
.toc-item:hover   { color: #CBD5E1; }
.toc-item.active  { color: #A855F7; border-left-color: #7C3AED; }
.toc-item.h3-item { padding-left: 20px; font-size: 12px; }
```

---

### generateMetadata — Blog Post

```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found — ESUTSphere' };
  return {
    title: `${post.title} — ESUTSphere Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toDate().toISOString(),
      authors: [post.authorName],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${params.slug}`,
      images: [post.coverImage || '/og-image.png'],
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

---

## PART 5: USER PROFILE — /profile/[username]

### Page Identity

The profile page is the **academic CV of every student on ESUTSphere**. It tells the story of who someone is at ESUT — their department, their contributions, their reputation. It must communicate credibility and community standing at a glance. Graduate-level ambition meets social media energy.

**Access:** Public (anyone can view) · Owner (can edit) · Authenticated users (can follow/interact)

---

### Profile Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV                                                          │
├─────────────────────────────────────────────────────────────────┤
│ COVER PHOTO (full width, 220px height, gradient fallback)       │
├─────────────────────────────────────────────────────────────────┤
│ PROFILE HEADER CARD                                             │
│ [Avatar — overlaps cover]  [Name] [Username] [Dept + Level]    │
│ [Bio]  [Department · Joined date]                              │
│ [Follow / Edit Profile button]  [Message button]               │
├─────────────────────────────────────────────────────────────────┤
│ STATS ROW                                                       │
│ [Followers] [Following] [Uploads] [Downloads] [Points]         │
├─────────────────────────────────────────────────────────────────┤
│ BADGES ROW                                                      │
├─────────────────────────────────────────────────────────────────┤
│ TAB NAV: [Uploads (15)] [Blog Posts (8)] [Badges (4)]          │
├─────────────────────────────────────────────────────────────────┤
│ TAB CONTENT AREA                                                │
│ (document grid / blog card grid / badges showcase)             │
└─────────────────────────────────────────────────────────────────┘
```

---

### Cover Photo

```css
.profile-cover {
  width: 100%; height: 220px; position: relative; overflow: hidden;
}
.profile-cover-img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
/* Gradient fallback — uses brand colors */
.profile-cover-fallback {
  width: 100%; height: 100%;
  background: linear-gradient(135deg,
    rgba(124,58,237,0.6) 0%,
    rgba(91,33,182,0.4) 40%,
    rgba(6,182,212,0.3) 100%
  );
}
/* Edit cover button (owner only) */
.edit-cover-btn {
  position: absolute; bottom: 12px; right: 12px;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #F8FAFC; font: Geist 12px weight 500;
  padding: 6px 14px; border-radius: 9999px;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: background 0.15s;
}
.edit-cover-btn:hover { background: rgba(0,0,0,0.8); }
```

---

### Profile Header

```css
.profile-header {
  padding: 0 40px 24px;
  position: relative;
}

/* Avatar — overlaps cover photo */
.profile-avatar-wrap {
  margin-top: -52px; margin-bottom: 14px; position: relative; width: fit-content;
}
.profile-avatar {
  width: 104px; height: 104px; border-radius: 50%;
  object-fit: cover;
  border: 4px solid #080810;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
/* Verified ring */
.profile-avatar.verified {
  outline: 3px solid #7C3AED;
  outline-offset: 3px;
}
/* Online indicator */
.profile-online-dot {
  position: absolute; bottom: 6px; right: 6px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #10B981; border: 3px solid #080810;
}

/* Action buttons row */
.profile-actions {
  position: absolute; top: 16px; right: 40px;
  display: flex; gap: 10px;
}

/* Follow button */
.follow-btn {
  height: 38px; padding: 0 20px; border-radius: 9999px;
  font: Geist 14px weight 700; cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.follow-btn.not-following {
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; border: none;
  box-shadow: 0 4px 16px rgba(124,58,237,0.4);
}
.follow-btn.not-following:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 24px rgba(124,58,237,0.55);
}
.follow-btn.following {
  background: transparent; color: #A855F7;
  border: 1px solid rgba(124,58,237,0.4);
}
.follow-btn.following:hover {
  background: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.35); color: #EF4444;
}
/* Hover text changes to "Unfollow" */

/* Edit profile (owner only) */
.edit-profile-btn {
  height: 38px; padding: 0 18px; border-radius: 9999px;
  background: transparent; color: #94A3B8;
  border: 1px solid rgba(255,255,255,0.14);
  font: Geist 14px weight 500; cursor: pointer;
  transition: all 0.15s;
}
.edit-profile-btn:hover { background: rgba(255,255,255,0.06); color: #F8FAFC; }

/* Message button */
.message-btn {
  width: 38px; height: 38px; border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
  color: #94A3B8; cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.message-btn:hover { background: rgba(6,182,212,0.10); color: #06B6D4; border-color: rgba(6,182,212,0.3); }

/* Name + username */
.profile-name {
  font: Geist 24px weight 800; color: #F8FAFC; margin-bottom: 4px;
  display: flex; align-items: center; gap: 10px;
}
.profile-username { font: Geist 14px weight 500; color: #94A3B8; margin-bottom: 10px; }

/* Bio */
.profile-bio { font: Geist 15px; color: #CBD5E1; line-height: 24px; max-width: 540px; margin-bottom: 12px; }

/* Profile meta */
.profile-meta-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.profile-meta-item { display: flex; align-items: center; gap: 6px; font: Geist 13px; color: #94A3B8; }
.profile-meta-icon { font-size: 14px; }
```

---

### Stats Row

```css
.profile-stats-row {
  display: flex; align-items: center; gap: 0;
  padding: 20px 40px;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(15,15,26,0.4);
}

.profile-stat {
  flex: 1; text-align: center; padding: 0 16px;
  cursor: pointer; transition: background 0.15s; border-radius: 10px;
}
.profile-stat:not(:last-child) {
  border-right: 1px solid rgba(255,255,255,0.06);
}
.profile-stat:hover { background: rgba(255,255,255,0.03); }

.profile-stat-value {
  font: 'Instrument Serif' 26px; color: #F8FAFC;
  display: block; margin-bottom: 4px;
}
/* Points stat — highlight in cyan */
.profile-stat.points .profile-stat-value {
  background: linear-gradient(135deg, #A855F7, #06B6D4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.profile-stat-label { font: Geist 11px weight 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
```

Stats: **Followers** · **Following** · **Uploads** · **Downloads** · **Points**

---

### Badges Row

```css
.profile-badges-row {
  padding: 16px 40px;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.profile-badge-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 9999px;
  font: Geist 12px weight 700;
  cursor: default; position: relative;
}
/* Tooltip on hover */
.profile-badge-chip:hover .badge-tooltip {
  opacity: 1; transform: translateY(0);
}
.badge-tooltip {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(4px);
  background: #1E1E35; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 6px 10px;
  font: Geist 11px weight 400; color: #CBD5E1;
  white-space: nowrap;
  opacity: 0; transition: all 0.15s ease; pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
```

---

### Profile Tabs

```css
.profile-tabs {
  padding: 0 40px;
  display: flex; gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.profile-tab {
  padding: 14px 20px; font: Geist 14px weight 600; color: #94A3B8;
  cursor: pointer; border-bottom: 2px solid transparent;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.15s; margin-bottom: -1px;
}
.profile-tab:hover { color: #CBD5E1; }
.profile-tab.active { color: #A855F7; border-bottom-color: #7C3AED; }

.profile-tab-count {
  font: Geist 11px weight 600; color: #475569;
  background: rgba(255,255,255,0.06);
  border-radius: 9999px; padding: 2px 7px;
}
.profile-tab.active .profile-tab-count {
  background: rgba(124,58,237,0.15); color: #A855F7;
}
```

**Tab panels:**
- **Uploads** — same document card grid as /library
- **Blog Posts** — same blog card grid as /blog
- **Badges** — larger badge cards with name, description, and earned date

---

### Badges Tab Content

```css
.badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px 40px; }

.badge-showcase-card {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 20px;
  text-align: center; position: relative; overflow: hidden;
  transition: all 0.2s ease;
}
.badge-showcase-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.4);
}
.badge-showcase-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--badge-color);
}

.badge-icon-large {
  font-size: 36px; margin-bottom: 12px;
  width: 64px; height: 64px; border-radius: 16px;
  background: rgba(var(--badge-rgb), 0.12);
  border: 1px solid rgba(var(--badge-rgb), 0.25);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.badge-name { font: Geist 14px weight 700; color: #F8FAFC; margin-bottom: 6px; }
.badge-desc { font: Geist 12px; color: #94A3B8; line-height: 18px; margin-bottom: 10px; }
.badge-earned { font: Geist 11px; color: #475569; }
```

---

### Empty States — Profile

```css
/* No uploads */
.profile-empty-uploads {
  text-align: center; padding: 64px 40px;
}
/* Text: "No documents uploaded yet." + CTA if owner: "Upload your first document" */

/* No posts */
/* Text: "No blog posts yet." + CTA if owner: "Write your first post" */
```

---

### generateMetadata — Profile

```typescript
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const user = await getUserByUsername(params.username);
  if (!user) return { title: 'User Not Found — ESUTSphere' };
  return {
    title: `${user.displayName} (@${user.username}) — ESUTSphere`,
    description: user.bio || `${user.department} student at ESUT. ${user.uploadsCount} uploads, ${user.followersCount} followers.`,
    openGraph: {
      title: `${user.displayName} on ESUTSphere`,
      description: user.bio || `${user.department} · ${user.currentLevel}`,
      images: [user.profilePicture || '/og-image.png'],
      url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${params.username}`,
    },
  };
}
```

---

## PART 6: ERROR PAGES — /404 · /403 · /500

### Philosophy

Error pages are a **brand moment**. Most apps waste them with "Oops, something went wrong." ESUTSphere's error pages must feel intentional — dark, editorial, lightly humorous but on-brand. Each error has its own personality, its own illustration, and a clear path back.

---

### Shared Error Layout

```css
.error-page {
  min-height: 100vh;
  background: #080810;
  background-image:
    radial-gradient(ellipse 60% 50% at 30% 20%, rgba(124,58,237,0.10) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 70% 80%, rgba(6,182,212,0.06) 0%, transparent 50%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 40px 24px;
  position: relative; overflow: hidden;
}

/* Floating decorative orb */
.error-bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(60px); pointer-events: none; opacity: 0.6;
  animation: orb-drift 10s ease-in-out infinite;
}
.error-bg-orb-1 {
  width: 400px; height: 400px;
  background: rgba(124,58,237,0.12);
  top: -100px; left: -100px;
}
.error-bg-orb-2 {
  width: 300px; height: 300px;
  background: rgba(6,182,212,0.08);
  bottom: -80px; right: -80px;
  animation-delay: -4s;
}

/* Error code — huge gradient text */
.error-code {
  font-family: 'Instrument Serif';
  font-size: clamp(100px, 18vw, 180px);
  font-weight: 400; line-height: 0.9;
  color: transparent;
  background: linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(168,85,247,0.6) 50%, rgba(6,182,212,0.4) 100%);
  -webkit-background-clip: text; background-clip: text;
  margin-bottom: 0; letter-spacing: -4px;
  animation: error-code-enter 0.8s cubic-bezier(0.16,1,0.3,1) both;
  position: relative;
}
@keyframes error-code-enter {
  from { opacity: 0; transform: scale(0.8); filter: blur(10px); }
  to   { opacity: 1; transform: scale(1); filter: blur(0); }
}

/* Illustration / emoji */
.error-illustration {
  font-size: 72px; margin: 8px 0 24px;
  animation: illustration-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
  animation-delay: 0.2s;
  display: block;
}
@keyframes illustration-enter {
  from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
  to   { opacity: 1; transform: scale(1) rotate(0deg); }
}

/* Title */
.error-title {
  font: Geist clamp(22px, 3vw, 32px) weight 800;
  color: #F8FAFC; margin-bottom: 12px;
  animation: error-text-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
  animation-delay: 0.35s;
}
@keyframes error-text-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Subtitle */
.error-subtitle {
  font: Geist 16px; color: #94A3B8; max-width: 460px;
  line-height: 26px; margin-bottom: 36px;
  animation: error-text-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
  animation-delay: 0.45s;
}

/* Action buttons */
.error-actions {
  display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
  animation: error-text-enter 0.5s both; animation-delay: 0.55s;
}
.error-primary-btn {
  height: 48px; padding: 0 24px; border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 15px weight 700; border: none;
  box-shadow: 0 6px 20px rgba(124,58,237,0.4);
  cursor: pointer; text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.error-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,0.55); }

.error-secondary-btn {
  height: 48px; padding: 0 24px; border-radius: 12px;
  background: transparent; color: #94A3B8;
  border: 1px solid rgba(255,255,255,0.12);
  font: Geist 15px weight 500; cursor: pointer;
  text-decoration: none;
  display: inline-flex; align-items: center; gap: 8px;
  transition: all 0.15s;
}
.error-secondary-btn:hover { background: rgba(255,255,255,0.06); color: #F8FAFC; }

/* Quick nav links */
.error-quick-links {
  display: flex; gap: 20px; margin-top: 40px; flex-wrap: wrap; justify-content: center;
  animation: error-text-enter 0.5s both; animation-delay: 0.65s;
}
.error-quick-link {
  font: Geist 13px weight 500; color: #475569;
  text-decoration: none; transition: color 0.15s;
  display: flex; align-items: center; gap: 5px;
}
.error-quick-link:hover { color: #A855F7; }
```

---

### 404 — Not Found

```
Error code: 404
Illustration: 🔍
Title: "This page went missing"
Subtitle: "Looks like this page packed its bags and left campus.
           Maybe it transferred to another university?"

Primary button: "→ Back to Home"
Secondary button: "Browse Library"

Quick links: Home · Feed · Library · Blog
```

**Extra 404 touch — subtle glitch animation on the code:**
```css
/* 404 specific — glitch effect */
.error-code.glitch {
  animation: error-code-enter 0.8s both, glitch 5s 2s infinite;
}
@keyframes glitch {
  0%, 92%, 100% { clip-path: none; transform: none; }
  93%  { clip-path: rect(0, 9999px, 30px, 0); transform: translateX(-4px); }
  94%  { clip-path: rect(0, 9999px, 80px, 30px); transform: translateX(4px); }
  95%  { clip-path: rect(0, 9999px, 9999px, 80px); transform: translateX(-2px); }
  96%  { clip-path: none; transform: none; }
}
```

---

### 403 — Forbidden

```
Error code: 403
Illustration: 🔒
Title: "Access Denied"
Subtitle: "You don't have permission to view this page.
           Are you supposed to be here? 👀
           This area requires special clearance."

Primary button: "→ Back to Feed"
Secondary button: "Sign In" (if not authenticated)
                  "Contact Support" (if authenticated but wrong role)

Quick links: Home · My Dashboard · Settings
```

```css
/* 403 specific — lock icon bounces */
.error-illustration.lock-bounce {
  animation: illustration-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.2s,
             lock-shake 0.5s ease 1.2s;
}
@keyframes lock-shake {
  0%, 100% { transform: rotate(0); }
  20%  { transform: rotate(-8deg); }
  40%  { transform: rotate(8deg); }
  60%  { transform: rotate(-5deg); }
  80%  { transform: rotate(5deg); }
}

/* 403 error code — red tint */
.error-page.forbidden .error-code {
  background: linear-gradient(135deg, rgba(239,68,68,0.7) 0%, rgba(248,113,113,0.5) 50%, rgba(124,58,237,0.3) 100%);
  -webkit-background-clip: text; background-clip: text;
}
```

---

### 500 — Server Error

```
Error code: 500
Illustration: ⚡
Title: "Something went wrong on our end"
Subtitle: "Our servers are having a moment.
           The ESUTSphere team has been notified
           and is working on it — just like exam prep, but faster."

Primary button: "⟳ Try Again" (reloads page)
Secondary button: "→ Back to Home"

Auto-retry indicator:
"Automatically retrying in {countdown}s..."
```

```css
/* 500 specific — electric lightning flicker */
.error-illustration.electric {
  animation: illustration-enter 0.6s both 0.2s, electric-flicker 4s 1.5s infinite;
}
@keyframes electric-flicker {
  0%, 85%, 100% { opacity: 1; filter: brightness(1); }
  86%  { opacity: 0.3; filter: brightness(2); }
  87%  { opacity: 1; filter: brightness(1); }
  88%  { opacity: 0.5; filter: brightness(1.5); }
  89%  { opacity: 1; filter: brightness(1); }
}

/* 500 error code — warning amber tint */
.error-page.server-error .error-code {
  background: linear-gradient(135deg, rgba(245,158,11,0.7) 0%, rgba(124,58,237,0.6) 50%, rgba(6,182,212,0.3) 100%);
  -webkit-background-clip: text; background-clip: text;
}

/* Auto-retry countdown */
.retry-countdown {
  font: Geist 13px; color: #475569; margin-top: 16px;
  animation: error-text-enter 0.5s both; animation-delay: 0.75s;
}
.retry-countdown span { color: #F59E0B; font-weight: 600; }
```

---

## PART 7: CONTEXT — Firestore Queries & Data

### Library Queries

```typescript
// Paginated document listing with filters
export async function getDocuments(filters, lastDoc?) {
  let constraints: QueryConstraint[] = [
    where('isApproved', '==', true),
    orderBy(filters.sortBy || 'createdAt', 'desc'),
    limit(18),
  ];
  if (filters.contentType) constraints.push(where('contentType', '==', filters.contentType));
  if (filters.department)  constraints.push(where('department', '==', filters.department));
  if (filters.level)       constraints.push(where('level', '==', filters.level));
  if (filters.isLecturerUpload) constraints.push(where('isLecturerUpload', '==', true));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap = await getDocs(query(collection(db, 'documents'), ...constraints));
  return { docs: snap.docs.map(d => ({id: d.id, ...d.data()})), lastDoc: snap.docs[snap.docs.length - 1] };
}

// Single document + increment view count
export async function getDocumentAndIncrementView(docId: string) {
  const docRef = doc(db, 'documents', docId);
  await updateDoc(docRef, { viewCount: increment(1) });
  const snap = await getDoc(docRef);
  return { id: snap.id, ...snap.data() } as Document;
}

// Related documents (same course code, different ID)
export async function getRelatedDocuments(courseCode: string, excludeId: string) {
  const q = query(
    collection(db, 'documents'),
    where('courseCode', '==', courseCode),
    where('isApproved', '==', true),
    orderBy('downloadCount', 'desc'),
    limit(5)
  );
  const snap = await getDocs(q);
  return snap.docs
    .filter(d => d.id !== excludeId)
    .map(d => ({id: d.id, ...d.data()}));
}
```

---

### Blog Queries

```typescript
// Blog listing — public, paginated
export async function getPosts(category?: string, lastDoc?) {
  let constraints: QueryConstraint[] = [
    where('isPublished', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(12),
  ];
  if (category && category !== 'all') constraints.push(where('category', '==', category));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap = await getDocs(query(collection(db, 'posts'), ...constraints));
  return { posts: snap.docs.map(d => ({id: d.id, ...d.data()})), lastDoc: snap.docs[snap.docs.length - 1] };
}

// Single post by slug
export async function getPostBySlug(slug: string) {
  const q = query(collection(db, 'posts'), where('slug', '==', slug), where('isPublished', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Post;
}

// Featured post (isFeatured = true, most recent)
export async function getFeaturedPost() {
  const q = query(collection(db, 'posts'), where('isFeatured', '==', true), where('isPublished', '==', true), orderBy('publishedAt', 'desc'), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as Post;
}
```

---

### Profile Queries

```typescript
// Get user by username
export async function getUserByUsername(username: string) {
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as User;
}

// Get user's documents
export async function getUserDocuments(uid: string, lastDoc?) {
  const q = query(
    collection(db, 'documents'),
    where('uploaderId', '==', uid),
    where('isApproved', '==', true),
    orderBy('createdAt', 'desc'),
    limit(12),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );
  const snap = await getDocs(q);
  return { docs: snap.docs.map(d => ({id: d.id, ...d.data()})), lastDoc: snap.docs[snap.docs.length - 1] };
}

// Get user's blog posts
export async function getUserPosts(uid: string) {
  const q = query(collection(db, 'posts'), where('authorId', '==', uid), where('isPublished', '==', true), orderBy('publishedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

// Check if current user follows a profile
export async function checkFollowStatus(followerId: string, followingId: string) {
  const docRef = doc(db, 'follows', `${followerId}_${followingId}`);
  const snap = await getDoc(docRef);
  return snap.exists();
}

// Toggle follow
export async function toggleFollow(followerId: string, followingId: string, currentlyFollowing: boolean) {
  const followDocRef = doc(db, 'follows', `${followerId}_${followingId}`);
  const batch = writeBatch(db);
  if (currentlyFollowing) {
    batch.delete(followDocRef);
    batch.update(doc(db, 'users', followerId), { followingCount: increment(-1) });
    batch.update(doc(db, 'users', followingId), { followersCount: increment(-1) });
  } else {
    batch.set(followDocRef, { followerId, followingId, createdAt: serverTimestamp() });
    batch.update(doc(db, 'users', followerId), { followingCount: increment(1) });
    batch.update(doc(db, 'users', followingId), { followersCount: increment(1) });
  }
  await batch.commit();
}
```

---

## PART 8: WHAT NOT TO DO — PAGE-SPECIFIC RULES

| Page | Rule | Reason |
|------|------|--------|
| Library | Never show documents where `isApproved === false` | Moderation safety |
| Library | Never call download without `approvalStatus === 'approved'` | Guest lock |
| Document Viewer | Never render PDF on white background | Dark theme jarring |
| Document Viewer | Never show comments input to guests | Unauthenticated interactions |
| Blog post | Never render raw TipTap HTML without `.blog-article-body` wrapper | Typography breaks |
| Blog post | Never drop cap on posts under 200 words | Looks wrong on short posts |
| Profile | Never show banned user profiles (handle 404) | Don't expose banned accounts |
| Profile | Never show `Follow` button on own profile | Use `Edit Profile` instead |
| All errors | Never show a generic "Error" with no context | Every error needs title + subtitle + path back |
| 500 page | Never auto-retry without countdown — surprises user | UX confusion |
| 404 | Never remove the quick nav links | User must have a clear exit |

---

*ESUTSphere PAGES.md — v1.0*
*Library · Document Viewer · Blog · Blog Post · Profile · Error Pages*
*Every page should feel like it was designed with intention.*
