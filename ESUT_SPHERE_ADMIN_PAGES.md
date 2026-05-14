# ESUTSphere — Super Admin & Class Admin Pages
## Combined Design + Context Specification

> Covers: /admin · /admin/users · /admin/approvals · /admin/content · /admin/reports · /admin/settings
> Class Admin: Integrated into student dashboard — /class-admin · /class-admin/approvals · /class-admin/class
> Both admin types use the same dark ESUTSphere design language — authority + clarity.
> Reference DESIGN.md for tokens. Reference CONTEXT.md for schemas.
> Updated: May 2026

---

## DESIGN PHILOSOPHY — ADMIN PAGES

Admin interfaces serve **power users making high-stakes decisions** — approving students, removing content, managing the platform. The design must communicate:

1. **Authority** — Admins are in control. Colors shift slightly — more amber/red accent where destructive, more green where approving.
2. **Clarity** — Data tables, stats, and queues must be scannable in seconds. No decorative clutter.
3. **Safety** — Destructive actions (ban, delete, reject) require confirmation. Always double-prompt before anything irreversible.
4. **Speed** — Approve 10 students at once. Bulk actions everywhere.

Both admin types share the same dark theme (`#080810` background, `#7C3AED` brand). The difference is **scope** — Super Admin sees everything, Class Admin sees only their assigned department/level.

---

## CLASS ADMIN INTEGRATION PATTERN

> This is the most important architectural decision in this file.

Class Admins are regular students who have been promoted. They do NOT get a separate account, login, or dashboard. Instead:

**When `role === 'class_admin'`:**

1. A new **"Class Admin" section** appears at the bottom of the sidebar, separated by a divider
2. A **Class Admin badge** appears on their avatar in the top nav
3. An **alert badge** on the Class Admin sidebar link shows pending approval count
4. Clicking "Class Admin" opens `/class-admin` — their admin panel
5. Inside class admin pages, a **"← Back to My Dashboard"** button is always visible

```
STUDENT SIDEBAR (normal user)        CLASS ADMIN SIDEBAR (same user, promoted)
─────────────────────────            ──────────────────────────────────────────
MAIN                                 MAIN
  Home                                 Home
  Explore                              Explore
  Notifications                        Notifications
  Library                              Library

CONTENT                              CONTENT
  Write Post                           Write Post
  Upload Document                      Upload Document

MY ACCOUNT                           MY ACCOUNT
  My Profile                           My Profile
  Dashboard                            Dashboard
  Settings                             Settings
                                                         ← divider appears
                                     ─────────────────
                                     CLASS ADMIN          ← new section
                                       Overview [3]      ← badge = pending count
                                       Approvals [3]
                                       My Class
```

---

## SHARED ADMIN LAYOUT WRAPPER

Both admin types use this wrapper, but with different sidebars.

```css
/* Admin shell — extends the main authenticated layout */
.admin-shell {
  display: flex; min-height: calc(100vh - 64px);
}

/* Admin content area */
.admin-content {
  flex: 1; padding: 28px 36px;
  max-width: 1400px;
  overflow-x: hidden;
}

/* Admin page header */
.admin-page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 28px; padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.admin-page-title {
  font-family: 'Instrument Serif'; font-size: clamp(24px, 2.5vw, 32px);
  color: #F8FAFC; line-height: 1.1; margin-bottom: 6px;
}
.admin-page-subtitle { font: Geist 14px; color: #94A3B8; }
.admin-page-actions { display: flex; gap: 10px; align-items: center; }

/* Admin breadcrumb */
.admin-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font: Geist 13px; color: #475569; margin-bottom: 8px;
}
.admin-breadcrumb a { color: #94A3B8; text-decoration: none; transition: color 0.12s; }
.admin-breadcrumb a:hover { color: #A855F7; }
.breadcrumb-sep { font-size: 12px; color: #475569; }
.breadcrumb-current { color: #F8FAFC; }
```

### Admin Sidebar (Super Admin — distinct from student sidebar)

```css
.admin-sidebar {
  width: 240px; flex-shrink: 0;
  background: #080C14; /* slightly bluer-black than main sidebar */
  border-right: 1px solid rgba(255,255,255,0.06);
  position: sticky; top: 64px;
  height: calc(100vh - 64px);
  padding: 16px 12px;
  overflow-y: auto;
  display: flex; flex-direction: column;
}

/* Admin branding strip */
.admin-brand-strip {
  background: rgba(124,58,237,0.10);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 10px; padding: 10px 14px;
  margin-bottom: 16px;
  display: flex; align-items: center; gap: 10px;
}
.admin-brand-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(124,58,237,0.2);
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.admin-brand-label { font: Geist 13px weight 700; color: #A855F7; }
.admin-brand-sub   { font: Geist 10px; color: #475569; }

/* Back to site link */
.admin-back-link {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border-radius: 9px; margin-bottom: 8px;
  font: Geist 13px weight 500; color: #475569;
  text-decoration: none; cursor: pointer; transition: all 0.15s;
}
.admin-back-link:hover { background: rgba(255,255,255,0.04); color: #94A3B8; }

/* Admin nav items — same base as sidebar-item */
.admin-nav-item {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 12px; border-radius: 9px;
  font: Geist 13px weight 500; color: #94A3B8;
  text-decoration: none; cursor: pointer; margin-bottom: 2px;
  transition: all 0.15s ease; position: relative;
}
.admin-nav-item:hover { background: rgba(255,255,255,0.05); color: #CBD5E1; }
.admin-nav-item.active {
  background: rgba(124,58,237,0.14); color: #A855F7; font-weight: 600;
}
.admin-nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0; background: #7C3AED;
}

/* Destructive nav item */
.admin-nav-item.danger:hover { background: rgba(239,68,68,0.08); color: #EF4444; }
.admin-nav-item.danger.active { background: rgba(239,68,68,0.12); color: #EF4444; }
.admin-nav-item.danger.active::before { background: #EF4444; }

.admin-nav-badge {
  margin-left: auto; min-width: 20px; height: 20px;
  border-radius: 9999px; font: Geist 11px weight 700;
  display: flex; align-items: center; justify-content: center; padding: 0 5px;
}
.admin-nav-badge.purple { background: rgba(124,58,237,0.25); color: #A855F7; }
.admin-nav-badge.amber  { background: rgba(245,158,11,0.20);  color: #F59E0B; }
.admin-nav-badge.red    { background: rgba(239,68,68,0.20);   color: #EF4444; }
```

**Super Admin sidebar sections:**

```
Overview (/)
─────────────
USERS
  All Users
  Pending Approvals [count]  ← amber badge
CONTENT
  Documents
  Blog Posts
  Reports [count]            ← red badge if > 0
PLATFORM
  Site Settings
─────────────
← Back to My Feed
```

---

## PART 1: SUPER ADMIN OVERVIEW — /admin

### Page Identity
The Super Admin overview is the **control room**. At a glance, Joshua sees everything: active users, pending approvals, reported content, upload activity. Stats animate on load. Quick-action buttons for the most common tasks.

### Admin Overview Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Admin Overview                                                    │
│ "Platform Command Center" · Last updated: just now              │
│                                                                   │
│ [STATS ROW — 5 cards]                                            │
│ Total Users · Active Today · Pending Approvals · Total Docs ·   │
│ Reported Content                                                 │
│                                                                   │
│ ┌────────────────────────┐  ┌──────────────────────────────┐    │
│ │ PENDING APPROVALS       │  │ RECENT ACTIVITY LOG          │    │
│ │ (quick triage table)    │  │                              │    │
│ │                         │  │                              │    │
│ └────────────────────────┘  └──────────────────────────────┘    │
│                                                                   │
│ ┌────────────────────────┐  ┌──────────────────────────────┐    │
│ │ UPLOAD ACTIVITY CHART   │  │ DEPARTMENT BREAKDOWN          │    │
│ │ (last 30 days line)     │  │ (bar chart by dept)           │    │
│ └────────────────────────┘  └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Admin Stats Row (5 Cards)

```css
.admin-stats-row {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px;
  margin-bottom: 28px;
}
@media (max-width: 1279px) { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 767px)  { grid-template-columns: repeat(2, 1fr); }

.admin-stat-card {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 18px 16px;
  position: relative; overflow: hidden;
  transition: all 0.2s ease;
}
.admin-stat-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }

/* Colored top accent */
.admin-stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--stat-color);
}

.admin-stat-icon {
  width: 36px; height: 36px; border-radius: 9px;
  background: rgba(var(--stat-rgb), 0.12);
  border: 1px solid rgba(var(--stat-rgb), 0.2);
  display: flex; align-items: center; justify-content: center; font-size: 17px;
  margin-bottom: 12px;
}

.admin-stat-value {
  font: 'Instrument Serif' 28px; color: #F8FAFC;
  display: block; margin-bottom: 4px; line-height: 1;
}
.admin-stat-label { font: Geist 12px weight 500; color: #94A3B8; }
.admin-stat-delta {
  font: Geist 11px weight 600; margin-top: 6px;
  display: flex; align-items: center; gap: 4px;
}
.delta-up   { color: #10B981; }
.delta-down { color: #EF4444; }
.delta-same { color: #475569; }
```

**Stat cards:**
| Card | Color | Icon | Accent RGB |
|------|-------|------|------------|
| Total Users | `#7C3AED` | 👥 | `124,58,237` |
| Active Today | `#10B981` | ⚡ | `16,185,129` |
| Pending Approvals | `#F59E0B` | ⏳ | `245,158,11` |
| Total Documents | `#06B6D4` | 📄 | `6,182,212` |
| Reported Content | `#EF4444` | 🚨 | `239,68,68` |

### Quick Pending Approvals Widget

```css
.admin-pending-widget {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden;
}

.admin-widget-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: space-between;
}
.admin-widget-title {
  font: Geist 14px weight 700; color: #F8FAFC;
  display: flex; align-items: center; gap: 8px;
}
.admin-widget-count {
  font: Geist 11px weight 700; padding: 2px 8px; border-radius: 9999px;
  background: rgba(245,158,11,0.15); color: #F59E0B;
  border: 1px solid rgba(245,158,11,0.25);
}
.admin-widget-see-all {
  font: Geist 12px weight 600; color: #7C3AED; text-decoration: none; transition: color 0.12s;
}
.admin-widget-see-all:hover { color: #A855F7; }

/* Pending row in widget */
.pending-widget-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.12s;
}
.pending-widget-row:last-child { border-bottom: none; }
.pending-widget-row:hover { background: rgba(255,255,255,0.02); }

.pending-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }

.pending-info { flex: 1; }
.pending-name { font: Geist 13px weight 600; color: #F8FAFC; }
.pending-meta { font: Geist 11px; color: #94A3B8; }
.pending-type-badge {
  font: Geist 10px weight 700; text-transform: uppercase; letter-spacing: 0.4px;
  padding: 2px 7px; border-radius: 9999px;
}
.pending-type-student  { background: rgba(124,58,237,0.12); color: #A855F7; border: 1px solid rgba(124,58,237,0.25); }
.pending-type-lecturer { background: rgba(6,182,212,0.12);  color: #06B6D4; border: 1px solid rgba(6,182,212,0.25); }

.pending-quick-approve {
  height: 28px; padding: 0 12px; border-radius: 7px;
  background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
  color: #10B981; font: Geist 12px weight 600; cursor: pointer;
  transition: all 0.15s;
}
.pending-quick-approve:hover { background: rgba(16,185,129,0.22); }
.pending-quick-view {
  height: 28px; padding: 0 10px; border-radius: 7px;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 12px weight 500; cursor: pointer; transition: all 0.15s;
}
.pending-quick-view:hover { background: rgba(255,255,255,0.06); color: #F8FAFC; }
```

### Activity Log Widget

```css
.activity-log-widget {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden;
}

.activity-log-row {
  display: flex; align-items: flex-start; gap: 12px; padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.activity-log-row:last-child { border-bottom: none; }

.activity-log-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
}
.log-approve  { background: rgba(16,185,129,0.12);  color: #10B981; }
.log-reject   { background: rgba(239,68,68,0.10);   color: #EF4444; }
.log-report   { background: rgba(245,158,11,0.10);  color: #F59E0B; }
.log-delete   { background: rgba(239,68,68,0.10);   color: #EF4444; }
.log-promote  { background: rgba(124,58,237,0.12);  color: #A855F7; }
.log-upload   { background: rgba(6,182,212,0.10);   color: #06B6D4; }

.activity-log-text {
  flex: 1; font: Geist 13px; color: #CBD5E1; line-height: 20px;
}
.activity-log-text strong { color: #F8FAFC; font-weight: 600; }
.activity-log-text .log-target { color: #A855F7; }
.activity-log-time { font: Geist 11px; color: #475569; flex-shrink: 0; }
```

---

## PART 2: USER MANAGEMENT — /admin/users

### Page Identity
The most-used admin page. Joshua sees every registered user, filters by role/status/department, takes actions (approve, ban, promote, assign class admin).

### Users Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ User Management  [Total: 5,243 users]       [+ Invite User]     │
│                                                                   │
│ [SEARCH]  [Role ▾] [Status ▾] [Department ▾] [Level ▾]         │
│                                                                   │
│ [SELECT ALL □] [Bulk Actions ▾] when rows selected              │
│                                                                   │
│ USER TABLE                                                        │
│ □ | Avatar+Name | Username | Role | Dept+Level | Status | Date  │
│   | Actions: View · Promote · Suspend · Delete                  │
│                                                                   │
│ [Pagination]                                                     │
└──────────────────────────────────────────────────────────────────┘
```

### Users Filter Bar

```css
.users-filter-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 20px; padding: 14px 16px;
  background: rgba(15,15,26,0.6);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
}

.users-search {
  position: relative; flex: 1; min-width: 200px; max-width: 320px;
}
/* Reuses .library-search-input styles */

.filter-select {
  height: 38px; padding: 0 32px 0 12px; border-radius: 9px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
  color: #CBD5E1; font: Geist 13px weight 500;
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  transition: all 0.15s;
}
.filter-select:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); outline: none; }
.filter-select option { background: #1E1E35; }

/* Results count */
.users-results-count { font: Geist 13px; color: #475569; margin-left: auto; }
.users-results-count span { color: #F8FAFC; font-weight: 600; }
```

### Users Data Table

```css
.admin-table-wrap {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden;
}

.admin-table {
  width: 100%; border-collapse: collapse;
}

/* Table header */
.admin-table thead tr {
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.admin-table th {
  padding: 12px 16px;
  font: Geist 11px weight 700; color: #475569;
  letter-spacing: 0.7px; text-transform: uppercase;
  text-align: left; white-space: nowrap;
  cursor: pointer; user-select: none;
  transition: color 0.12s;
}
.admin-table th:hover { color: #94A3B8; }
.admin-table th.sorted { color: #A855F7; }
.sort-icon { font-size: 10px; margin-left: 4px; color: #475569; }

/* Checkbox column */
.admin-table th.col-check,
.admin-table td.col-check {
  width: 44px; text-align: center; padding: 12px 0 12px 16px;
}
.admin-checkbox {
  width: 16px; height: 16px; border-radius: 4px;
  border: 2px solid rgba(255,255,255,0.20);
  background: transparent; cursor: pointer; accent-color: #7C3AED;
}

/* Table rows */
.admin-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.12s;
}
.admin-table tbody tr:last-child { border-bottom: none; }
.admin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.admin-table tbody tr.selected { background: rgba(124,58,237,0.06); }

.admin-table td {
  padding: 12px 16px; font: Geist 13px; color: #CBD5E1;
  vertical-align: middle;
}

/* User cell */
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-cell-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.user-cell-name { font: Geist 13px weight 600; color: #F8FAFC; }
.user-cell-email { font: Geist 11px; color: #475569; }

/* Role badge in table */
.role-badge-table {
  font: Geist 10px weight 700; letter-spacing: 0.5px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;
}
.role-student  { background:rgba(124,58,237,0.12); color:#A855F7; border:1px solid rgba(124,58,237,0.25); }
.role-lecturer { background:rgba(6,182,212,0.12);  color:#06B6D4; border:1px solid rgba(6,182,212,0.25); }
.role-class-admin { background:rgba(245,158,11,0.12); color:#F59E0B; border:1px solid rgba(245,158,11,0.25); }
.role-super-admin { background:rgba(236,72,153,0.12); color:#EC4899; border:1px solid rgba(236,72,153,0.25); }
.role-pending { background:rgba(255,255,255,0.06); color:#94A3B8; border:1px solid rgba(255,255,255,0.10); }

/* Status badge in table */
.status-badge-table {
  font: Geist 10px weight 700; padding: 3px 8px; border-radius: 9999px;
  display: inline-flex; align-items: center; gap: 5px;
}
.status-badge-table::before {
  content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor;
}
.status-approved { color: #10B981; background: rgba(16,185,129,0.10); border: 1px solid rgba(16,185,129,0.2); }
.status-pending  { color: #F59E0B; background: rgba(245,158,11,0.10);  border: 1px solid rgba(245,158,11,0.2); }
.status-rejected { color: #EF4444; background: rgba(239,68,68,0.10);   border: 1px solid rgba(239,68,68,0.2); }
.status-banned   { color: #94A3B8; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); }

/* Row actions */
.row-actions {
  display: flex; align-items: center; gap: 6px; opacity: 0; transition: opacity 0.12s;
}
.admin-table tbody tr:hover .row-actions { opacity: 1; }

.row-action-btn {
  height: 28px; padding: 0 10px; border-radius: 7px;
  font: Geist 11px weight 600; cursor: pointer; transition: all 0.12s;
  display: flex; align-items: center; gap: 5px;
}
.action-view    { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #94A3B8; }
.action-approve { background: rgba(16,185,129,0.10);  border: 1px solid rgba(16,185,129,0.2);  color: #10B981; }
.action-promote { background: rgba(245,158,11,0.10);  border: 1px solid rgba(245,158,11,0.2);  color: #F59E0B; }
.action-suspend { background: rgba(239,68,68,0.08);   border: 1px solid rgba(239,68,68,0.2);  color: #EF4444; }
.action-view:hover    { background: rgba(255,255,255,0.10); color: #F8FAFC; }
.action-approve:hover { background: rgba(16,185,129,0.20); }
.action-promote:hover { background: rgba(245,158,11,0.18); }
.action-suspend:hover { background: rgba(239,68,68,0.16); }
```

### Bulk Actions Bar (appears when rows selected)

```css
.bulk-actions-bar {
  position: sticky; bottom: 16px; left: 0; right: 0; z-index: 50;
  background: rgba(22,22,42,0.97);
  border: 1px solid rgba(124,58,237,0.3);
  border-radius: 14px; padding: 12px 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  backdrop-filter: blur(12px);
  animation: bulk-bar-enter 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes bulk-bar-enter {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.bulk-count {
  font: Geist 14px weight 700; color: #A855F7;
  background: rgba(124,58,237,0.15); border-radius: 9999px; padding: 4px 12px;
}
.bulk-action-btns { display: flex; gap: 8px; }
.bulk-btn {
  height: 36px; padding: 0 16px; border-radius: 9px;
  font: Geist 13px weight 600; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; gap: 6px;
}
.bulk-approve  { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #10B981; }
.bulk-reject   { background: rgba(239,68,68,0.10);  border: 1px solid rgba(239,68,68,0.25); color: #EF4444; }
.bulk-suspend  { background: rgba(239,68,68,0.10);  border: 1px solid rgba(239,68,68,0.25); color: #EF4444; }
.bulk-export   { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10); color: #94A3B8; }
.bulk-cancel   { background: transparent; border: none; color: #475569; margin-left: auto; }
```

### Assign Class Admin Modal

```css
.assign-modal {
  /* Standard modal styles */
  max-width: 460px;
}
.assign-modal-title { font: Geist 18px weight 700; color: #F8FAFC; margin-bottom: 6px; }
.assign-modal-user-row {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; margin-bottom: 20px;
}

.assign-dept-select { /* same as .filter-select but full width, height 44px */ }
.assign-level-select { /* same */ }

.assign-confirm-btn {
  /* Primary button full width */
  background: linear-gradient(135deg, #F59E0B, #FCD34D); color: #0F0F1A;
  /* Amber for Class Admin assignment — different from standard purple */
}
```

### Pagination

```css
.admin-pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.pagination-info { font: Geist 13px; color: #475569; }
.pagination-info span { color: #F8FAFC; font-weight: 600; }

.pagination-controls { display: flex; gap: 4px; align-items: center; }
.page-btn {
  width: 32px; height: 32px; border-radius: 7px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 13px weight 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
}
.page-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #F8FAFC; }
.page-btn.active { background: rgba(124,58,237,0.18); border-color: rgba(124,58,237,0.4); color: #A855F7; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-ellipsis { width: 32px; text-align: center; color: #475569; font: Geist 13px; }
```

---

## PART 3: PENDING APPROVALS — /admin/approvals

### Page Identity
The approval queue is the **gatekeeping hub**. Students and lecturers wait here. Super Admin handles lecturers; Class Admins handle their class students. This page separates the two queues via tabs.

### Approvals Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Pending Approvals  [12 pending]                                   │
│                                                                   │
│ TABS: [Students (9)] [Lecturers (3)]                              │
│                                                                   │
│ FILTER: [All Departments ▾] [All Levels ▾] [Sort: Oldest First ▾]│
│                                                                   │
│ [SELECT ALL □]  [Bulk Approve ✓] [Bulk Reject ✗]                 │
│                                                                   │
│ APPROVAL CARDS (vertical list)                                    │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ [Avatar] Name · @username · Dept · Level · "7 days ago"     │  │
│ │ Matric: 2022/249671/CS                                       │  │
│ │ [View Admission Letter]              [✓ Approve] [✗ Reject]  │  │
│ └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Approval Tabs

```css
.approval-tabs {
  display: flex; gap: 6px; margin-bottom: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 11px; padding: 4px; width: fit-content;
}
.approval-tab {
  padding: 9px 20px; border-radius: 8px;
  font: Geist 13px weight 600; color: #94A3B8; cursor: pointer;
  transition: all 0.15s; display: flex; align-items: center; gap: 8px;
}
.approval-tab.active { background: rgba(124,58,237,0.18); color: #A855F7; }
.approval-tab-badge {
  font: Geist 11px weight 700; padding: 2px 7px; border-radius: 9999px;
  background: rgba(245,158,11,0.15); color: #F59E0B;
}
```

### Approval Card

```css
.approval-card {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 20px;
  margin-bottom: 12px; position: relative;
  transition: border-color 0.2s;
  animation: card-enter 0.35s cubic-bezier(0.16,1,0.3,1) both;
}
.approval-card:hover { border-color: rgba(255,255,255,0.12); }
.approval-card.selected { border-color: rgba(124,58,237,0.35); background: rgba(124,58,237,0.04); }

/* Top row */
.approval-card-header {
  display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;
}
.approval-card-checkbox {
  margin-top: 2px;
  /* .admin-checkbox styles */
}
.approval-user-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.10);
}
.approval-user-info { flex: 1; }
.approval-user-name { font: Geist 15px weight 700; color: #F8FAFC; margin-bottom: 3px; }
.approval-user-handle { font: Geist 13px; color: #94A3B8; margin-bottom: 6px; }
.approval-user-tags { display: flex; gap: 6px; flex-wrap: wrap; }
/* Tags: department pill, level pill, type pill (student/lecturer) */
.approval-dept-tag {
  font: Geist 11px weight 600; padding: 3px 8px; border-radius: 9999px;
  background: rgba(6,182,212,0.10); color: #06B6D4; border: 1px solid rgba(6,182,212,0.2);
}
.approval-level-tag {
  font: Geist 11px weight 600; padding: 3px 8px; border-radius: 9999px;
  background: rgba(124,58,237,0.10); color: #A855F7; border: 1px solid rgba(124,58,237,0.2);
}
.approval-waiting-tag {
  font: Geist 11px weight 500; padding: 3px 8px; border-radius: 9999px;
  background: rgba(255,255,255,0.04); color: #475569; border: 1px solid rgba(255,255,255,0.08);
  margin-left: auto;
}

/* Info grid */
.approval-info-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  padding: 14px; margin-bottom: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}
.approval-info-item {}
.approval-info-label { font: Geist 10px weight 700; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px; }
.approval-info-value { font: Geist 13px weight 600; color: #F8FAFC; }

/* For lecturer: courses taught */
.approval-courses-list { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.approval-course-tag {
  font: Geist 11px weight 600; padding: 2px 8px; border-radius: 6px;
  background: rgba(6,182,212,0.08); color: #06B6D4; border: 1px solid rgba(6,182,212,0.15);
}

/* Document preview button */
.view-doc-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 34px; padding: 0 14px; border-radius: 8px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer;
  text-decoration: none; transition: all 0.15s;
}
.view-doc-btn:hover { background: rgba(255,255,255,0.09); color: #F8FAFC; }

/* Action buttons row */
.approval-actions {
  display: flex; align-items: center; gap: 10px;
  padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05);
}
.approve-btn {
  flex: 1; height: 40px; border-radius: 10px;
  background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3);
  color: #10B981; font: Geist 14px weight 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.approve-btn:hover { background: rgba(16,185,129,0.22); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,0.2); }

.reject-btn {
  flex: 1; height: 40px; border-radius: 10px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
  color: #EF4444; font: Geist 14px weight 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.2s;
}
.reject-btn:hover { background: rgba(239,68,68,0.16); }
```

### Rejection Modal

```css
.rejection-modal { max-width: 440px; }
.rejection-modal-title { font: Geist 18px weight 700; color: #F8FAFC; margin-bottom: 16px; }

/* Rejection reason select */
.rejection-reason-select {
  /* filter-select styles, full width, height 44px, margin-bottom: 12px */
}

/* Custom reason textarea */
.rejection-custom-reason {
  /* settings-textarea styles, height: 80px */
  margin-bottom: 16px;
}

.rejection-preview-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px;
  background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
  border-radius: 12px; margin-bottom: 20px;
}
.rejection-preview-name { font: Geist 14px weight 600; color: #F8FAFC; }
.rejection-preview-meta { font: Geist 12px; color: #94A3B8; }

.rejection-confirm-btn {
  width: 100%; height: 44px; border-radius: 10px;
  background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35);
  color: #EF4444; font: Geist 14px weight 700; cursor: pointer;
  transition: all 0.15s;
}
.rejection-confirm-btn:hover { background: rgba(239,68,68,0.25); }
```

**Preset rejection reasons:**
- "Document unreadable — please resubmit with a clearer photo"
- "Incorrect document — please upload your ESUT admission letter"
- "Matric number does not match document"
- "Duplicate account detected"
- "Custom reason..." → opens textarea

---

## PART 4: CONTENT MODERATION — /admin/content

### Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Content Management                                                │
│                                                                   │
│ TABS: [Documents (2,140)] [Blog Posts (89)]                      │
│                                                                   │
│ FILTERS: [Search] [Type ▾] [Department ▾] [Flagged Only □]       │
│                                                                   │
│ CONTENT TABLE                                                     │
│ □ | Title | Uploader | Type | Dept | Downloads | Date | Actions  │
└──────────────────────────────────────────────────────────────────┘
```

```css
/* Content table — extends admin-table */
.content-title-cell {
  display: flex; align-items: center; gap: 10px;
}
.content-type-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--type-color); flex-shrink: 0; }
.content-title { font: Geist 13px weight 600; color: #F8FAFC; max-width: 300px; }
.content-title-truncate {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;
}
.content-flagged-badge {
  font: Geist 10px weight 700; padding: 2px 7px; border-radius: 9999px;
  background: rgba(239,68,68,0.12); color: #EF4444; border: 1px solid rgba(239,68,68,0.2);
  margin-left: 6px; white-space: nowrap;
}

/* Content row actions */
.action-feature  { background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.2); color: #F59E0B; }
.action-pin      { background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.2); color: #A855F7; }
.action-remove   { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.2);  color: #EF4444; }
```

### Content Remove Confirmation Modal

```css
.remove-confirm-modal { max-width: 420px; }
.remove-confirm-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(239,68,68,0.12); border: 2px solid rgba(239,68,68,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; margin-bottom: 16px;
}
.remove-confirm-title { font: Geist 18px weight 700; color: #F8FAFC; margin-bottom: 8px; }
.remove-confirm-text  { font: Geist 14px; color: #94A3B8; line-height: 22px; margin-bottom: 16px; }

/* Type DELETE confirmation */
.remove-type-confirm {
  background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15);
  border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
}
.remove-type-label { font: Geist 12px; color: #94A3B8; margin-bottom: 6px; }
.remove-type-label code { color: #EF4444; font-weight: 700; background: rgba(239,68,68,0.12); border-radius: 4px; padding: 1px 5px; }
.remove-type-input { /* settings-input with error state base */ }

.remove-confirm-final-btn {
  width: 100%; height: 44px; border-radius: 10px;
  background: #EF4444; color: #FFFFFF; border: none;
  font: Geist 14px weight 700; cursor: pointer; transition: all 0.15s;
}
.remove-confirm-final-btn:disabled { background: rgba(239,68,68,0.3); cursor: not-allowed; }
.remove-confirm-final-btn:not(:disabled):hover { background: #DC2626; }
```

---

## PART 5: REPORTS QUEUE — /admin/reports

### Page Identity
Reported content from users. Each report must be investigated and resolved (content removed) or dismissed (false report).

### Reports Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Reports Queue  [Pending: 7]                                       │
│                                                                   │
│ FILTER: [All Types ▾] [Status: Pending ▾] [Sort: Oldest First ▾] │
│                                                                   │
│ REPORT CARDS (vertical list)                                     │
└──────────────────────────────────────────────────────────────────┘
```

```css
.report-card {
  background: rgba(15,15,26,0.8);
  border: 1px solid rgba(239,68,68,0.15); /* red-tinted border for severity */
  border-radius: 14px; padding: 18px;
  margin-bottom: 12px; position: relative;
}
.report-card.dismissed { border-color: rgba(255,255,255,0.06); opacity: 0.6; }
.report-card.resolved  { border-color: rgba(16,185,129,0.15); }

/* Severity indicator */
.report-severity {
  position: absolute; top: 0; right: 20px;
  height: 100%; width: 3px;
  border-radius: 9999px;
}
.severity-high   { background: #EF4444; }
.severity-medium { background: #F59E0B; }
.severity-low    { background: #94A3B8; }

.report-card-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;
}
.report-type-badge {
  font: Geist 11px weight 700; text-transform: uppercase; letter-spacing: 0.5px;
  padding: 4px 10px; border-radius: 9999px;
}
.report-type-spam        { background:rgba(245,158,11,0.12); color:#F59E0B; border:1px solid rgba(245,158,11,0.25); }
.report-type-wrong-info  { background:rgba(6,182,212,0.12);  color:#06B6D4; border:1px solid rgba(6,182,212,0.25); }
.report-type-inappropriate{ background:rgba(239,68,68,0.12); color:#EF4444; border:1px solid rgba(239,68,68,0.25); }
.report-type-copyright   { background:rgba(124,58,237,0.12); color:#A855F7; border:1px solid rgba(124,58,237,0.25); }

.report-time { font: Geist 12px; color: #475569; }

/* Reported content preview */
.report-content-preview {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 12px 14px; margin-bottom: 14px;
  display: flex; gap: 12px; align-items: flex-start;
  cursor: pointer; text-decoration: none; transition: border-color 0.12s;
}
.report-content-preview:hover { border-color: rgba(255,255,255,0.12); }
.report-content-icon { font-size: 20px; flex-shrink: 0; }
.report-content-title { font: Geist 13px weight 600; color: #F8FAFC; margin-bottom: 4px; }
.report-content-meta  { font: Geist 12px; color: #94A3B8; }

/* Reporter info */
.report-reporter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.report-reporter-label { font: Geist 12px weight 500; color: #475569; }
.report-reporter-name  { font: Geist 13px weight 600; color: #CBD5E1; }

/* Report details */
.report-details-text {
  font: Geist 13px; color: #94A3B8; line-height: 20px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 14px;
}

/* Actions */
.report-actions { display: flex; gap: 10px; align-items: center; }
.report-view-btn { /* .view-doc-btn styles */ }
.report-remove-btn {
  flex: 1; height: 38px; border-radius: 9px;
  background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
  color: #EF4444; font: Geist 13px weight 700; cursor: pointer; transition: all 0.15s;
}
.report-remove-btn:hover { background: rgba(239,68,68,0.22); }
.report-dismiss-btn {
  height: 38px; padding: 0 16px; border-radius: 9px;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer; transition: all 0.15s;
}
.report-dismiss-btn:hover { background: rgba(255,255,255,0.05); color: #F8FAFC; }
```

---

## PART 6: SITE SETTINGS — /admin/settings

### Settings Sections

```
1. Platform Status
   - Site maintenance mode toggle
   - Registration open/closed toggle
   - Announcement banner (optional, site-wide)

2. Content Rules
   - Allowed file types checkboxes
   - Max file size slider
   - Auto-approval toggle (off by default)

3. Gamification
   - Edit points per action (number inputs)
   - Toggle badges on/off

4. Email Configuration
   - SMTP status indicator
   - Test email button
```

```css
/* Platform status toggles */
.settings-status-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;
}
.status-toggle-card {
  background: rgba(15,15,26,0.8); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 18px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.status-toggle-info {}
.status-toggle-label { font: Geist 15px weight 700; color: #F8FAFC; margin-bottom: 4px; }
.status-toggle-desc  { font: Geist 12px; color: #94A3B8; line-height: 18px; }

/* Maintenance mode — danger variant */
.status-toggle-card.danger {
  border-color: rgba(239,68,68,0.2);
  background: rgba(239,68,68,0.04);
}
.status-toggle-card.danger .status-toggle-label { color: #EF4444; }

/* Toggle switch — reuses settings toggle-switch */

/* Announcement banner editor */
.announcement-editor {
  background: rgba(15,15,26,0.8); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 20px; margin-bottom: 20px;
}
.announcement-preview {
  background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.25);
  border-radius: 10px; padding: 12px 16px; margin-top: 12px;
  font: Geist 14px; color: #CBD5E1;
}

/* Points editor table */
.points-table { width: 100%; }
.points-table td { padding: 10px 0; }
.points-action-label { font: Geist 14px; color: #CBD5E1; }
.points-input-wrap { display: flex; align-items: center; gap: 8px; }
.points-input {
  width: 70px; height: 36px; text-align: center;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10);
  border-radius: 8px; color: #F8FAFC; font: Geist 14px weight 600;
  outline: none; transition: all 0.15s;
}
.points-input:focus { border-color: #7C3AED; }
.points-label-pts { font: Geist 12px; color: #475569; }

/* SMTP status */
.smtp-status-row {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
}
.smtp-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.smtp-dot.connected { background: #10B981; box-shadow: 0 0 8px rgba(16,185,129,0.4); }
.smtp-dot.error     { background: #EF4444; }
.smtp-label { font: Geist 14px weight 600; color: #F8FAFC; flex: 1; }
.smtp-email { font: Geist 12px; color: #94A3B8; }
.smtp-test-btn {
  height: 32px; padding: 0 12px; border-radius: 8px;
  background: rgba(6,182,212,0.10); border: 1px solid rgba(6,182,212,0.2);
  color: #06B6D4; font: Geist 12px weight 600; cursor: pointer; transition: all 0.15s;
}
```

---

## PART 7: CLASS ADMIN — INTEGRATION INTO STUDENT SIDEBAR

### The Navigation Addition

When `userDoc.role === 'class_admin'`, the following are injected into the standard sidebar:

```css
/* Injected divider */
.sidebar-class-admin-divider {
  height: 1px; background: rgba(255,255,255,0.07);
  margin: 12px 0;
}

/* Class admin label row */
.sidebar-class-admin-label {
  padding: 8px 10px 4px;
  font: Geist 10px weight 700; color: #F59E0B;
  letter-spacing: 1px; text-transform: uppercase;
  display: flex; align-items: center; gap: 6px;
}
.class-admin-label-icon { font-size: 12px; }

/* Class admin nav items */
/* Uses standard .sidebar-item styles but with amber active state */
.sidebar-item.class-admin.active {
  background: rgba(245,158,11,0.12); color: #F59E0B;
}
.sidebar-item.class-admin.active::before { background: #F59E0B; }
```

**Class admin nav items added to sidebar:**
- 📋 Overview `[badge: pending count]`
- ✅ Approvals `[badge: pending count]`  
- 👥 My Class

### Top Nav Badge (Class Admin)

```css
/* When role === 'class_admin' — small badge on avatar */
.topnav-avatar-wrap { position: relative; }
.class-admin-avatar-badge {
  position: absolute; bottom: -2px; right: -2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #F59E0B; border: 2px solid #080810;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: #0F0F1A;
}
```

---

## PART 8: CLASS ADMIN OVERVIEW — /class-admin

### Page Identity
The Course Rep's admin panel. Focused, simple. Shows pending approvals for their specific class, a member list, and basic class stats. Always has a clear **"Back to My Dashboard"** path.

### Class Admin Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [← Back to My Dashboard]                                         │
│                                                                   │
│ "Class Admin Panel"                                              │
│ "CSC Department · 400L · Managing 3 pending approvals"          │
│                                                                   │
│ STATS ROW (3 cards)                                               │
│ [My Class Members] [Pending Approvals] [Approved This Month]    │
│                                                                   │
│ ┌──────────────────────────┐  ┌──────────────────────────────┐  │
│ │ RECENT APPROVALS          │  │ CLASS OVERVIEW               │  │
│ │ (last 5 approved)         │  │ Level distribution           │  │
│ │                           │  │ Gender split (opt)           │  │
│ └──────────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Back to Dashboard Button

```css
.back-to-dashboard {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px; border-radius: 9999px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 13px weight 500;
  text-decoration: none; margin-bottom: 20px; cursor: pointer;
  transition: all 0.15s;
}
.back-to-dashboard:hover { background: rgba(255,255,255,0.08); color: #F8FAFC; }
.back-arrow { transition: transform 0.15s; }
.back-to-dashboard:hover .back-arrow { transform: translateX(-3px); }
```

### Class Admin Stats (3 Cards — simpler than super admin)

```css
.class-admin-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  margin-bottom: 24px;
}
@media (max-width: 639px) { grid-template-columns: 1fr; }

/* Uses .admin-stat-card styles */
/* Card 1: Members — cyan accent */
/* Card 2: Pending — amber accent */
/* Card 3: Approved this month — green accent */
```

### Class Overview Card (Right Panel)

```css
.class-overview-card {
  background: rgba(15,15,26,0.8); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 20px;
}
.class-overview-title { font: Geist 14px weight 700; color: #F8FAFC; margin-bottom: 16px; }

/* Class identity */
.class-identity-row {
  display: flex; gap: 10px; margin-bottom: 16px;
}
.class-identity-item {
  flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 12px; text-align: center;
}
.class-identity-value { font: Geist 18px weight 700; color: #F8FAFC; display: block; }
.class-identity-label { font: Geist 11px; color: #475569; }
```

---

## PART 9: CLASS ADMIN APPROVALS — /class-admin/approvals

### Page Identity
The Class Admin sees ONLY students pending for their assigned `classAdminDept + classAdminLevel`. Interface is identical to super admin approvals but scoped.

### Key Differences from Super Admin Approvals

```css
/* Class admin banner — reminds them of their scope */
.class-admin-scope-banner {
  background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
  border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;
  display: flex; align-items: center; gap: 12px;
  font: Geist 13px; color: #FCD34D;
}
.class-admin-scope-icon { font-size: 18px; flex-shrink: 0; }
.class-admin-scope-text strong { font-weight: 700; }
```

Banner text: `📋 You are managing approvals for: Computer Science · 400 Level only`

**NO lecturer tab** — class admins never see lecturers. Only the Students tab.

**No Assign Class Admin action** — class admins cannot promote other users.

**No suspend/ban** — class admins can only approve or reject.

### Class Admin Approval Card Differences

```css
/* Class admin approve button — same styles but amber confirm theme */
.class-admin-approve-btn {
  /* .approve-btn base — green is fine, approval is universal */
}

/* The reject button shows a note explaining the student will be notified */
.class-reject-note {
  font: Geist 11px; color: #94A3B8; text-align: center; margin-top: 6px;
}
```

### Firebase Query — Class Admin Approvals

```typescript
// Class Admin sees ONLY their dept + level
export async function getClassAdminPending(dept: string, level: string) {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'pending'),
    where('approvalStatus', '==', 'pending'),
    where('department', '==', dept),
    where('currentLevel', '==', level),
    orderBy('createdAt', 'asc'), // oldest first — fairness
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

// Class Admin approves student
export async function classAdminApproveStudent(studentId: string, classAdminId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', studentId), {
    role: 'student',
    approvalStatus: 'approved',
    approvedBy: classAdminId,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    points: increment(20), // First-approval bonus points
  });
  // Write to notification
  batch.set(doc(collection(db, 'notifications')), {
    recipientId: studentId,
    type: 'approval',
    message: "Your ESUTSphere account has been approved! Welcome 🎉",
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  // Send email via API
  await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ template: 'account_approved', recipientId: studentId }) });
}

// Class Admin rejects student
export async function classAdminRejectStudent(studentId: string, reason: string, classAdminId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', studentId), {
    approvalStatus: 'rejected',
    rejectionReason: reason,
    rejectedBy: classAdminId,
    rejectedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, 'notifications')), {
    recipientId: studentId,
    type: 'rejection',
    message: `Your account was not approved. Reason: ${reason}`,
    isRead: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ template: 'account_rejected', recipientId: studentId, reason }) });
}
```

---

## PART 10: CLASS MEMBERS — /class-admin/class

### Page Identity
The Course Rep sees all verified students in their class. Upload the class list CSV to auto-verify against it. Export class list.

### Class Members Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ My Class  [CSC · 400L · 127 members]       [📤 Upload Class List]│
│                                                                   │
│ [SEARCH by name or matric]          [Export CSV ↓]               │
│                                                                   │
│ MEMBERS TABLE                                                     │
│ # | Avatar+Name | Matric | Status | Joined | Points             │
└──────────────────────────────────────────────────────────────────┘
```

```css
/* Upload class list CTA */
.upload-classlist-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 16px; border-radius: 9999px;
  background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.25);
  color: #F59E0B; font: Geist 13px weight 600; cursor: pointer;
  transition: all 0.15s;
}
.upload-classlist-btn:hover { background: rgba(245,158,11,0.18); }

/* Export button */
.export-csv-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 14px; border-radius: 9999px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer;
  transition: all 0.15s;
}
.export-csv-btn:hover { background: rgba(255,255,255,0.09); color: #F8FAFC; }

/* Members table — extends admin-table */
.member-matric { font: 'JetBrains Mono', monospace 12px; color: #94A3B8; letter-spacing: 0.3px; }

/* Class list upload modal */
.classlist-upload-modal { max-width: 460px; }
.classlist-dropzone {
  /* doc-upload-zone styles but height 160px */
}
.classlist-format-hint {
  background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.15);
  border-radius: 10px; padding: 12px 14px;
  font: Geist 12px; color: #94A3B8; margin-top: 12px; line-height: 20px;
}
.classlist-format-hint code {
  background: rgba(6,182,212,0.10); color: #06B6D4;
  border-radius: 4px; padding: 1px 5px; font-family: monospace;
}
```

Format hint text: *"CSV format: `matric_number,full_name` — one student per row. First row can be headers (skipped)."*

---

## PART 11: SUPER ADMIN FIREBASE QUERIES

```typescript
// Admin overview stats
export async function getAdminStats() {
  const [usersSnap, docsSnap, postsSnap, reportsSnap] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(query(collection(db, 'documents'), where('isApproved', '==', true))),
    getCountFromServer(query(collection(db, 'posts'), where('isPublished', '==', true))),
    getCountFromServer(query(collection(db, 'reports'), where('status', '==', 'pending'))),
  ]);
  const pendingSnap = await getCountFromServer(
    query(collection(db, 'users'), where('approvalStatus', '==', 'pending'))
  );
  return {
    totalUsers:     usersSnap.data().count,
    totalDocuments: docsSnap.data().count,
    totalPosts:     postsSnap.data().count,
    pendingReports: reportsSnap.data().count,
    pendingApprovals: pendingSnap.data().count,
  };
}

// Get all pending users (super admin — all roles, all depts)
export async function getAllPendingUsers(type: 'student' | 'lecturer' | 'all' = 'all', lastDoc?) {
  let constraints: QueryConstraint[] = [
    where('approvalStatus', '==', 'pending'),
    orderBy('createdAt', 'asc'),
    limit(20),
  ];
  if (type === 'lecturer') constraints.push(where('qualification', '!=', null)); // lecturers have qualification field
  if (lastDoc) constraints.push(startAfter(lastDoc));
  const snap = await getDocs(query(collection(db, 'users'), ...constraints));
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

// Get all users with filters
export async function getAdminUsers(filters: {
  role?: string; status?: string; dept?: string; search?: string;
  sortBy?: string; lastDoc?: DocumentSnapshot;
}) {
  let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(25)];
  if (filters.role)   constraints.push(where('role', '==', filters.role));
  if (filters.status) constraints.push(where('approvalStatus', '==', filters.status));
  if (filters.dept)   constraints.push(where('department', '==', filters.dept));
  if (filters.lastDoc) constraints.push(startAfter(filters.lastDoc));
  const snap = await getDocs(query(collection(db, 'users'), ...constraints));
  return { users: snap.docs.map(d => ({id: d.id, ...d.data()})), lastDoc: snap.docs.at(-1) };
}

// Assign class admin role
export async function assignClassAdmin(userId: string, dept: string, level: string, superAdminId: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'class_admin',
    classAdminDept: dept,
    classAdminLevel: level,
    classAdminAssignedBy: superAdminId,
    classAdminAssignedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Notify the user
  await addDoc(collection(db, 'notifications'), {
    recipientId: userId,
    type: 'approval',
    message: `You've been assigned as Class Admin for ${dept} · ${level}. Check your Class Panel.`,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

// Remove class admin role
export async function removeClassAdmin(userId: string) {
  await updateDoc(doc(db, 'users', userId), {
    role: 'student',
    classAdminDept: deleteField(),
    classAdminLevel: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

// Suspend user
export async function suspendUser(userId: string, reason: string, adminId: string) {
  await updateDoc(doc(db, 'users', userId), {
    approvalStatus: 'rejected',
    role: 'pending', // effectively locks them out
    rejectionReason: `Account suspended: ${reason}`,
    suspendedBy: adminId,
    suspendedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Remove content
export async function removeContent(targetId: string, targetType: 'document' | 'post', adminId: string, reason: string) {
  const collectionName = targetType === 'document' ? 'documents' : 'posts';
  await updateDoc(doc(db, collectionName, targetId), {
    isApproved: false,
    isPublished: false,
    removedBy: adminId,
    removalReason: reason,
    removedAt: serverTimestamp(),
  });
}

// Resolve report
export async function resolveReport(reportId: string, resolution: 'resolved' | 'dismissed', adminId: string) {
  await updateDoc(doc(db, 'reports', reportId), {
    status: resolution,
    resolvedBy: adminId,
    resolvedAt: serverTimestamp(),
  });
}

// Feature/unfeature document
export async function toggleFeatured(targetId: string, targetType: 'document' | 'post', featured: boolean) {
  const col = targetType === 'document' ? 'documents' : 'posts';
  await updateDoc(doc(db, col, targetId), { isFeatured: featured, updatedAt: serverTimestamp() });
}
```

---

## PART 12: ADMIN ROUTE PROTECTION

```typescript
// In app/(admin)/layout.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!['super_admin', 'class_admin'].includes(userDoc?.role || '')) {
      router.push('/403');
    }
  }, [user, userDoc, loading]);

  if (loading) return <AdminLoadingSkeleton />;

  return (
    <div className="admin-shell">
      <AdminSidebar role={userDoc?.role} />
      <main className="admin-content">{children}</main>
    </div>
  );
}

// In app/(admin)/admin/layout.tsx — Super Admin only
export default function SuperAdminLayout({ children }) {
  const { userDoc } = useAuth();
  if (userDoc?.role !== 'super_admin') return <Forbidden403 />;
  return <>{children}</>;
}

// In app/(admin)/class-admin/layout.tsx — Class Admin only
export default function ClassAdminLayout({ children }) {
  const { userDoc } = useAuth();
  if (userDoc?.role !== 'class_admin' && userDoc?.role !== 'super_admin') return <Forbidden403 />;
  return <>{children}</>;
}
```

---

## PART 13: ADMIN ACTIVITY LOGGING

Every admin action must be logged for accountability.

```typescript
// Collection: admin_logs
interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: 'super_admin' | 'class_admin';
  action: 'approve_user' | 'reject_user' | 'assign_class_admin' | 'remove_class_admin' |
          'suspend_user' | 'remove_content' | 'resolve_report' | 'feature_content' |
          'update_settings';
  targetId: string;
  targetType: 'user' | 'document' | 'post' | 'report' | 'setting';
  details: Record<string, unknown>; // e.g., { rejectionReason, dept, level }
  timestamp: Timestamp;
}

// Log every admin action
export async function logAdminAction(log: Omit<AdminLog, 'id' | 'timestamp'>) {
  await addDoc(collection(db, 'admin_logs'), {
    ...log, timestamp: serverTimestamp(),
  });
}
```

---

## PART 14: WHAT NOT TO DO — ADMIN PAGES

| Page | Rule | Reason |
|------|------|--------|
| All admin | Never skip `logAdminAction()` on any mutation | Accountability + audit trail |
| Approvals | Never approve a user without viewing their document first | Verification integrity |
| Users | Never delete a user doc — only suspend (set to rejected+pending) | Data integrity, Firestore references break |
| Content | Never hard-delete documents — set `isApproved: false` | Other users may have bookmarks/reactions |
| Reports | Never show reporter's identity to the reported user | Privacy protection |
| Class Admin | Never let class admin see users from other departments or levels | Strict scope enforcement in Firestore queries |
| Class Admin | Never let class admin approve lecturers under any circumstances | Super Admin only for lecturers |
| Settings | Never toggle maintenance mode without a confirmation modal | Accidental site shutdown |
| All admin | Never expose the admin panel URL to unverified users | Security — always role-check in layout |
| Users | Never allow super admin to demote another super admin | Single point of truth: the SUPER_ADMIN_EMAIL env var |
| Class Admin sidebar | Never show the class admin section if `classAdminDept` or `classAdminLevel` is not set | Incomplete assignment protection |

---

*ESUTSphere SUPER_AND_CLASS_ADMINS_PAGES.md — v1.0*
*Super Admin: /admin · Users · Approvals · Content · Reports · Settings*
*Class Admin: Integrated into student sidebar — /class-admin · Approvals · Class*
*Admin pages protect the community. Build them with the same care as the user-facing ones.*
