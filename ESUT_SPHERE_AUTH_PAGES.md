# ESUTSphere — Authenticated User Pages
## Combined Design + Context Specification

> Covers: /feed · /explore · /notifications · /dashboard (all tabs) · /blog/write · /library (auth enhanced)
> All pages require: Firebase Auth + approvalStatus === 'approved'
> Reference DESIGN.md for global tokens. Reference CONTEXT.md for schemas.
> Stack: Next.js 16 · Tailwind v4 · Motion · Firebase Firestore
> Updated: May 2026

---

## SHARED AUTHENTICATED LAYOUT

All authenticated pages share the same shell layout. Define once, used everywhere.

```
┌──────────────────────────────────────────────────────────────────┐
│ TOP NAV (64px, sticky, blur)                                      │
├───────────────────┬──────────────────────────────────────────────┤
│ LEFT SIDEBAR      │  MAIN CONTENT AREA                           │
│ 256px fixed       │  flex-1, max-width depends on page           │
│ (hidden ≤1023px)  │  padding: 28px 32px                          │
└───────────────────┴──────────────────────────────────────────────┘
│ MOBILE BOTTOM TAB BAR (64px, fixed, ≤639px only)                 │
└──────────────────────────────────────────────────────────────────┘
```

### Top Navigation Bar (Authenticated)

```css
.topnav {
  height: 64px; position: sticky; top: 0; z-index: 100;
  background: rgba(8,8,16,0.88);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 0 24px;
  display: flex; align-items: center; gap: 16px;
}

/* Logo */
.topnav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.topnav-logo-img { width: 30px; height: 30px; }
.topnav-wordmark { font: Geist 17px weight 800; color: #F8FAFC; letter-spacing: -0.3px; }

/* Center search */
.topnav-search-wrap { flex: 1; max-width: 440px; margin: 0 auto; position: relative; }
.topnav-search {
  width: 100%; height: 38px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 0 14px 0 38px;
  color: #F8FAFC; font: Geist 13px;
  transition: all 0.2s ease;
}
.topnav-search:focus {
  border-color: rgba(124,58,237,0.5);
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  background: rgba(124,58,237,0.04); outline: none;
}
.topnav-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #475569; }

/* Right side */
.topnav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

/* Notification bell */
.notif-bell-btn {
  width: 38px; height: 38px; border-radius: 9px;
  background: transparent; border: 1px solid transparent;
  color: #94A3B8; cursor: pointer; position: relative;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: all 0.15s;
}
.notif-bell-btn:hover { background: rgba(255,255,255,0.06); color: #F8FAFC; border-color: rgba(255,255,255,0.08); }
.notif-bell-btn.has-unread { color: #A855F7; }

.notif-unread-dot {
  position: absolute; top: 5px; right: 5px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #7C3AED; border: 2px solid #080810;
  animation: dot-pulse 2s ease-in-out infinite;
}
@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
}

/* User avatar button */
.topnav-avatar-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid rgba(124,58,237,0.4);
  overflow: hidden; cursor: pointer;
  transition: border-color 0.15s;
}
.topnav-avatar-btn:hover { border-color: #A855F7; }
.topnav-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
```

### Left Sidebar

```css
.sidebar {
  width: 256px; flex-shrink: 0;
  background: #0F0F1A;
  border-right: 1px solid rgba(255,255,255,0.06);
  position: fixed; left: 0; top: 64px;
  height: calc(100vh - 64px);
  padding: 16px 12px;
  overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column;
  z-index: 40;
}

/* Section label */
.sidebar-group-label {
  font: Geist 10px weight 700; color: #475569;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 10px 10px 6px; margin-bottom: 2px;
}

/* Nav item */
.sidebar-item {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 12px; border-radius: 10px;
  font: Geist 14px weight 500; color: #94A3B8;
  text-decoration: none; cursor: pointer;
  transition: all 0.15s ease; margin-bottom: 2px;
  position: relative;
}
.sidebar-item:hover { background: rgba(255,255,255,0.05); color: #CBD5E1; }
.sidebar-item.active {
  background: rgba(124,58,237,0.14);
  color: #A855F7; font-weight: 600;
}
.sidebar-item.active::before {
  content: ''; position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: #7C3AED;
}
.sidebar-item-icon { font-size: 17px; flex-shrink: 0; }
.sidebar-item-badge {
  margin-left: auto; min-width: 20px; height: 20px;
  background: #7C3AED; color: #FFFFFF;
  border-radius: 9999px; font: Geist 11px weight 700;
  display: flex; align-items: center; justify-content: center; padding: 0 5px;
}

/* Bottom: Upload + Profile */
.sidebar-bottom {
  margin-top: auto; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.sidebar-upload-btn {
  width: 100%; height: 44px; border-radius: 10px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 14px weight 700;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 16px rgba(124,58,237,0.35);
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  margin-bottom: 10px;
}
.sidebar-upload-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.5); }

/* Mini profile row */
.sidebar-profile-row {
  display: flex; align-items: center; gap: 10px; padding: 10px 10px;
  border-radius: 10px; cursor: pointer; text-decoration: none;
  transition: background 0.15s;
}
.sidebar-profile-row:hover { background: rgba(255,255,255,0.04); }
.sidebar-profile-avatar { width: 34px; height: 34px; border-radius: 50%; border: 2px solid rgba(124,58,237,0.3); }
.sidebar-profile-name   { font: Geist 13px weight 600; color: #F8FAFC; }
.sidebar-profile-handle { font: Geist 11px; color: #475569; }
.sidebar-profile-pts    { margin-left: auto; font: Geist 11px weight 700; color: #A855F7; }
```

**Sidebar navigation groups:**

Main: Home (Feed) · Explore · Notifications · Library
Content: Write Post · Upload Document
Profile: My Profile · Dashboard · Settings

### Mobile Bottom Tab Bar

```css
.mobile-tab-bar {
  display: none; /* shown only ≤639px */
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  height: 64px;
  background: rgba(12,12,22,0.97);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-bottom: env(safe-area-inset-bottom);
}
@media (max-width: 639px) { .mobile-tab-bar { display: flex; } }

.tab-bar-inner {
  display: flex; align-items: center; justify-content: space-around;
  width: 100%; height: 100%;
}

.tab-item {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  flex: 1; height: 100%; cursor: pointer;
  color: #475569; font: Geist 10px weight 600;
  text-transform: uppercase; letter-spacing: 0.3px;
  transition: color 0.15s; text-decoration: none;
  justify-content: center;
}
.tab-item.active { color: #A855F7; }
.tab-item-icon { font-size: 20px; }

/* Center FAB tab */
.tab-item-fab {
  width: 50px; height: 50px; border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #06B6D4);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: #FFFFFF;
  box-shadow: 0 6px 20px rgba(124,58,237,0.5);
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  margin-bottom: 8px;
}
.tab-item:active .tab-item-fab { transform: scale(0.92); }
```

Tab items (5): **Home** · **Library** · **[FAB +]** · **Alerts** · **Profile**

---

## PART 1: CAMPUS FEED — /feed

### Page Identity
The Feed is the **social heartbeat** of ESUTSphere. Students check it multiple times daily. It must feel alive — fresh posts loading smoothly, reactions popping, conversations visible. Three tabs: For You · Following · My Department.

### Feed Layout

```
┌───────────────────────────────────────────────────┬─────────────┐
│  FEED COLUMN (max-width 680px, centered)          │  RIGHT      │
│                                                   │  SIDEBAR    │
│  [Feed Header + Tab bar]                          │  300px      │
│  [New Post quick composer]                        │             │
│  [Post card]                                      │ [Trending]  │
│  [Post card]                                      │ [Suggested] │
│  [Post card]                                      │ [Top Docs]  │
│  [infinite scroll...]                             │             │
└───────────────────────────────────────────────────┴─────────────┘
```

### Feed Header + Tabs

```css
.feed-header {
  padding: 24px 0 0;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0;
}
.feed-title {
  font-family: 'Instrument Serif'; font-size: 28px;
  color: #F8FAFC; line-height: 1.1;
}
.feed-write-btn {
  display: flex; align-items: center; gap: 7px;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.3);
  color: #A855F7; font: Geist 13px weight 600;
  padding: 8px 16px; border-radius: 9999px;
  cursor: pointer; text-decoration: none;
  transition: all 0.15s;
}
.feed-write-btn:hover { background: rgba(124,58,237,0.2); }

/* Tab bar */
.feed-tabs {
  display: flex; gap: 0; margin-top: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.feed-tab {
  padding: 12px 20px; font: Geist 14px weight 600;
  color: #475569; cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s; margin-bottom: -1px;
  display: flex; align-items: center; gap: 7px;
}
.feed-tab:hover { color: #94A3B8; }
.feed-tab.active { color: #A855F7; border-bottom-color: #7C3AED; }

/* Department tag on dept tab */
.feed-dept-tag {
  font: Geist 10px weight 700; padding: 2px 7px; border-radius: 9999px;
  background: rgba(6,182,212,0.12); color: #06B6D4;
  border: 1px solid rgba(6,182,212,0.2);
}
```

### Quick Post Composer

```css
.quick-composer {
  background: rgba(22,22,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 14px 16px;
  margin: 16px 0;
  display: flex; gap: 12px; align-items: center;
  cursor: pointer; transition: border-color 0.2s;
}
.quick-composer:hover { border-color: rgba(124,58,237,0.3); }

.quick-composer-input {
  flex: 1; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 9999px; padding: 9px 18px;
  color: #475569; font: Geist 14px; cursor: pointer;
  pointer-events: none; /* clicking anywhere opens the write page */
}
.quick-composer-btns { display: flex; gap: 8px; }
.composer-quick-btn {
  width: 34px; height: 34px; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.composer-quick-btn:hover { background: rgba(255,255,255,0.08); color: #F8FAFC; }
```

### Feed Post Card

```css
.feed-post {
  background: rgba(20,20,38,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; padding: 18px 20px;
  margin-bottom: 12px;
  transition: border-color 0.2s ease;
  animation: card-enter 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
.feed-post:hover { border-color: rgba(255,255,255,0.11); }

/* Post header */
.post-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 12px;
}
.post-author-row { display: flex; align-items: center; gap: 10px; }
.post-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.08); }
.post-author-name {
  font: Geist 14px weight 700; color: #F8FAFC;
  text-decoration: none; display: flex; align-items: center; gap: 6px;
}
.post-author-name:hover { color: #A855F7; }
.post-handle-time { font: Geist 12px; color: #475569; }
.post-handle-time .handle { color: #94A3B8; font-weight: 500; }

/* Three-dot menu */
.post-menu-btn {
  width: 32px; height: 32px; border-radius: 7px;
  background: transparent; border: none;
  color: #475569; cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
}
.post-menu-btn:hover { background: rgba(255,255,255,0.06); color: #94A3B8; }

/* Post title (for blog-style posts) */
.post-title {
  font: Geist 16px weight 700; color: #F8FAFC; margin-bottom: 8px;
  line-height: 1.3; text-decoration: none; display: block;
}
.post-title:hover { color: #A855F7; }

/* Post body */
.post-body {
  font: Geist 14px; color: #CBD5E1; line-height: 22px;
  margin-bottom: 12px;
}
.post-body.truncated {
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.post-read-more {
  font: Geist 13px weight 600; color: #7C3AED;
  background: none; border: none; cursor: pointer;
  padding: 0; margin-top: 4px; transition: color 0.12s;
}
.post-read-more:hover { color: #A855F7; }

/* Attached document preview card */
.post-doc-preview {
  background: #111120; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px; cursor: pointer; text-decoration: none;
  transition: border-color 0.15s;
}
.post-doc-preview:hover { border-color: rgba(124,58,237,0.3); }
.post-doc-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.post-doc-info { flex: 1; }
.post-doc-title { font: Geist 13px weight 600; color: #F8FAFC; }
.post-doc-meta  { font: Geist 11px; color: #94A3B8; }
.post-doc-arrow { color: #475569; font-size: 14px; }

/* Tags */
.post-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.post-tag {
  font: Geist 12px weight 500; color: #94A3B8;
  background: rgba(255,255,255,0.04);
  border-radius: 9999px; padding: 3px 10px;
  cursor: pointer; transition: all 0.12s;
}
.post-tag:hover { background: rgba(124,58,237,0.10); color: #A855F7; }

/* Reaction bar */
.post-reactions {
  display: flex; align-items: center; gap: 4px;
  padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);
}
.post-reaction-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 9999px;
  background: transparent; border: 1px solid transparent;
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer;
  transition: all 0.15s cubic-bezier(0.34,1.56,0.64,1);
  user-select: none;
}
.post-reaction-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.08); color: #CBD5E1; transform: scale(1.05); }
.post-reaction-btn:active { animation: reaction-pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }

/* Active reaction states */
.reaction-like.active        { background:rgba(124,58,237,0.12); border-color:rgba(124,58,237,0.3); color:#A855F7; }
.reaction-love.active        { background:rgba(239,68,68,0.10);  border-color:rgba(239,68,68,0.25); color:#EF4444; }
.reaction-fire.active        { background:rgba(249,115,22,0.10); border-color:rgba(249,115,22,0.25); color:#F97316; }
.reaction-insightful.active  { background:rgba(245,158,11,0.10); border-color:rgba(245,158,11,0.25); color:#F59E0B; }
.reaction-funny.active       { background:rgba(6,182,212,0.10);  border-color:rgba(6,182,212,0.25);  color:#22D3EE; }

@keyframes reaction-pop {
  0%  { transform: scale(1); }
  40% { transform: scale(1.35); }
  70% { transform: scale(0.9); }
  100%{ transform: scale(1); }
}

.reaction-emoji { font-size: 16px; }
.reaction-count { font: Geist 13px weight 600; }

.post-action-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.06); margin: 0 2px; }

/* Comment + share + bookmark */
.post-action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 9999px;
  background: transparent; border: 1px solid transparent;
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer;
  transition: all 0.15s;
}
.post-action-btn:hover { background: rgba(255,255,255,0.05); color: #CBD5E1; }
.post-action-btn.bookmarked { color: #F59E0B; }

/* Post meta */
.post-meta-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.post-dept-badge {
  font: Geist 11px weight 600; padding: 3px 8px; border-radius: 9999px;
  background: rgba(6,182,212,0.10); color: #06B6D4;
  border: 1px solid rgba(6,182,212,0.2);
}
```

### Feed Right Sidebar

```css
.feed-right-sidebar {
  width: 300px; flex-shrink: 0;
  position: sticky; top: calc(64px + 16px);
  max-height: calc(100vh - 80px); overflow-y: auto;
  display: flex; flex-direction: column; gap: 16px;
  padding-left: 28px;
}

/* Widget card base */
.sidebar-widget {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 18px;
}
.widget-title {
  font: Geist 13px weight 700; color: #F8FAFC;
  margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;
}
.widget-see-all {
  font: Geist 12px weight 500; color: #7C3AED; text-decoration: none;
}
.widget-see-all:hover { color: #A855F7; }

/* Trending tags widget */
.trending-tag-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: all 0.12s;
}
.trending-tag-row:last-child { border-bottom: none; padding-bottom: 0; }
.trending-tag-row:hover { padding-left: 4px; }
.trending-tag-num { font: Geist 10px weight 700; color: #475569; width: 16px; }
.trending-tag-name { font: Geist 13px weight 600; color: #CBD5E1; flex: 1; padding-left: 8px; }
.trending-tag-count { font: Geist 11px; color: #475569; }

/* Suggested users widget */
.suggested-user-row {
  display: flex; align-items: center; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.suggested-user-row:last-child { border-bottom: none; padding-bottom: 0; }
.suggested-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.suggested-info { flex: 1; }
.suggested-name { font: Geist 13px weight 600; color: #F8FAFC; text-decoration: none; }
.suggested-name:hover { color: #A855F7; }
.suggested-dept { font: Geist 11px; color: #475569; }
.follow-mini-btn {
  height: 28px; padding: 0 12px; border-radius: 9999px;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.3);
  color: #A855F7; font: Geist 12px weight 600; cursor: pointer;
  transition: all 0.15s;
}
.follow-mini-btn:hover { background: rgba(124,58,237,0.22); }

/* Department leaderboard widget */
.leaderboard-row {
  display: flex; align-items: center; gap: 10px; padding: 8px 0;
}
.leaderboard-rank { font: Geist 12px weight 800; color: #475569; width: 18px; text-align: center; }
.leaderboard-rank.top3 { color: #F59E0B; }
.leaderboard-pts { margin-left: auto; font: Geist 12px weight 700; color: #A855F7; }
```

### Feed Firebase Queries

```typescript
// For You tab — content from user's department + followed users (merge)
export async function getFeedForYou(uid: string, dept: string, lastDoc?) {
  // 1. Get posts from department
  // 2. Get posts from followed users (via follows collection)
  // 3. Merge and sort by publishedAt desc
  // Use parallel queries and merge client-side (Firestore limitation)
  const [deptPosts, followedPosts] = await Promise.all([
    getDeptFeed(dept, lastDoc),
    getFollowingFeed(uid, lastDoc),
  ]);
  const merged = [...deptPosts, ...followedPosts]
    .sort((a, b) => b.publishedAt?.seconds - a.publishedAt?.seconds)
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i) // dedupe
    .slice(0, 20);
  return merged;
}

// Following tab
export async function getFollowingFeed(uid: string, lastDoc?) {
  // Get followed user IDs from follows collection
  const followsSnap = await getDocs(query(
    collection(db, 'follows'),
    where('followerId', '==', uid),
    limit(50)
  ));
  const followedIds = followsSnap.docs.map(d => d.data().followingId);
  if (followedIds.length === 0) return [];
  // Firestore in-array max 30 items
  const chunks = chunkArray(followedIds, 30);
  const results = await Promise.all(chunks.map(chunk =>
    getDocs(query(collection(db, 'posts'),
      where('authorId', 'in', chunk),
      where('isPublished', '==', true),
      orderBy('publishedAt', 'desc'), limit(20)))
  ));
  return results.flatMap(s => s.docs.map(d => ({id: d.id, ...d.data()})));
}

// Department tab
export async function getDeptFeed(dept: string, lastDoc?) {
  const q = query(
    collection(db, 'posts'),
    where('isPublished', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(20),
    ...(lastDoc ? [startAfter(lastDoc)] : [])
  );
  // Note: filter by dept happens via tags or a deptTags field on posts
  const snap = await getDocs(q);
  return snap.docs.map(d => ({id: d.id, ...d.data()}));
}
```

---

## PART 2: EXPLORE — /explore

### Page Identity
Explore is the **discovery engine**. Students find the most valuable content, top contributors, and trending course material. Three sections: Trending Documents · Top Contributors Leaderboard · Trending Blog Posts.

### Explore Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ EXPLORE HEADER                                                    │
│ "Explore ESUTSphere"  [search bar]                               │
├───────────────────────────────────────────────────────────────── ┤
│ TAB NAV: [Trending] [Top Contributors] [Popular Posts] [Tags]    │
├──────────────────────────────────────────────────────────────────┤
│ TAB CONTENT (changes per tab)                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Explore Header

```css
.explore-header {
  padding: 28px 0 24px;
  display: flex; flex-direction: column; gap: 18px;
}
.explore-title {
  font-family: 'Instrument Serif'; font-size: 32px; color: #F8FAFC;
}
.explore-search-wide {
  max-width: 560px;
  /* Reuses .library-search-input styles with larger height: 46px */
}

.explore-tabs {
  display: flex; gap: 6px; flex-wrap: wrap; padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.explore-tab {
  padding: 8px 18px; border-radius: 9999px;
  font: Geist 13px weight 600; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent; color: #94A3B8;
  display: flex; align-items: center; gap: 7px;
  transition: all 0.18s ease;
}
.explore-tab:hover { background: rgba(255,255,255,0.05); color: #CBD5E1; }
.explore-tab.active { background: rgba(124,58,237,0.14); border-color: rgba(124,58,237,0.4); color: #A855F7; }
```

### Trending Documents Tab

```css
.trending-docs-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-top: 24px;
}
@media (max-width: 1023px) { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 639px)  { grid-template-columns: 1fr; }

/* Trend rank badge on card */
.trend-rank-badge {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 11px weight 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(124,58,237,0.4);
}
.trend-rank-badge.gold   { background: linear-gradient(135deg, #F59E0B, #FCD34D); color: #0F0F1A; }
.trend-rank-badge.silver { background: linear-gradient(135deg, #94A3B8, #CBD5E1); color: #0F0F1A; }
.trend-rank-badge.bronze { background: linear-gradient(135deg, #F97316, #FDBA74); color: #0F0F1A; }

/* Trending stats overlay */
.trending-stats-bar {
  display: flex; gap: 12px; margin-top: 10px;
  padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05);
}
.trending-stat-item { display: flex; align-items: center; gap: 5px; font: Geist 12px; color: #94A3B8; }
.trending-stat-up   { color: #10B981; font-weight: 600; font-size: 11px; }
```

### Top Contributors Tab

```css
.contributors-layout {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-top: 24px;
}
@media (max-width: 639px) { grid-template-columns: 1fr; }

/* Leaderboard (left) */
.leaderboard-full {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden;
}
.leaderboard-header {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: space-between;
}
.leaderboard-title { font: Geist 15px weight 700; color: #F8FAFC; display: flex; align-items: center; gap: 8px; }
.leaderboard-period {
  font: Geist 11px weight 600; padding: 3px 8px; border-radius: 9999px;
  background: rgba(245,158,11,0.10); color: #F59E0B;
  border: 1px solid rgba(245,158,11,0.2);
}

.leaderboard-row-full {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.12s; cursor: pointer;
  text-decoration: none;
}
.leaderboard-row-full:last-child { border-bottom: none; }
.leaderboard-row-full:hover { background: rgba(255,255,255,0.03); }

/* Top 3 get special treatment */
.leaderboard-row-full.rank-1 { background: rgba(245,158,11,0.06); }
.leaderboard-row-full.rank-2 { background: rgba(148,163,184,0.04); }
.leaderboard-row-full.rank-3 { background: rgba(249,115,22,0.04); }

.rank-num { font: Geist 14px weight 800; color: #475569; width: 24px; text-align: center; flex-shrink: 0; }
.rank-1 .rank-num { color: #F59E0B; }
.rank-2 .rank-num { color: #94A3B8; }
.rank-3 .rank-num { color: #F97316; }

.rank-medal { font-size: 18px; flex-shrink: 0; }

.rank-user-info { flex: 1; }
.rank-user-name { font: Geist 14px weight 600; color: #F8FAFC; }
.rank-user-dept { font: Geist 11px; color: #475569; }

.rank-points {
  font: 'Instrument Serif' 20px;
  background: linear-gradient(135deg, #A855F7, #06B6D4);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.rank-points-label { font: Geist 10px; color: #475569; }

/* Department filter for leaderboard */
.leaderboard-dept-filter {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; gap: 6px; overflow-x: auto;
}
.dept-filter-btn {
  white-space: nowrap; height: 28px; padding: 0 12px;
  border-radius: 9999px; font: Geist 11px weight 600;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; cursor: pointer; transition: all 0.12s;
}
.dept-filter-btn.active { background:rgba(124,58,237,0.12); border-color:rgba(124,58,237,0.3); color:#A855F7; }
```

### Tags Exploration Tab

```css
.tags-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding-top: 24px;
}
@media (max-width: 1023px) { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 639px)  { grid-template-columns: repeat(2, 1fr); }

.tag-card {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 16px;
  cursor: pointer; text-decoration: none;
  transition: all 0.2s ease; position: relative; overflow: hidden;
}
.tag-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.tag-card::before {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--tag-color, linear-gradient(90deg, #7C3AED, #06B6D4));
}
.tag-icon { font-size: 28px; margin-bottom: 10px; }
.tag-name { font: Geist 15px weight 700; color: #F8FAFC; margin-bottom: 4px; }
.tag-count { font: Geist 12px; color: #94A3B8; }
```

---

## PART 3: NOTIFICATIONS — /notifications

### Page Identity
Notifications is a **real-time activity tracker**. On desktop it appears as a dropdown panel from the bell icon. On mobile it becomes a dedicated full page. Every interaction someone has with your content shows here.

### Notification Page Layout (Mobile Full Page / Desktop Sub-route)

```css
.notifications-page { max-width: 680px; margin: 0 auto; padding: 24px 0; }

.notifs-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.notifs-title { font-family: 'Instrument Serif'; font-size: 28px; color: #F8FAFC; }
.notifs-actions { display: flex; gap: 10px; }
.notifs-mark-all {
  height: 34px; padding: 0 14px; border-radius: 8px;
  background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.25);
  color: #A855F7; font: Geist 13px weight 600; cursor: pointer;
  transition: all 0.15s;
}
.notifs-mark-all:hover { background: rgba(124,58,237,0.20); }

/* Filter tabs */
.notifs-filter-tabs {
  display: flex; gap: 4px; margin-bottom: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 4px;
  width: fit-content;
}
.notifs-filter-tab {
  padding: 7px 16px; border-radius: 7px;
  font: Geist 13px weight 600; color: #94A3B8; cursor: pointer;
  transition: all 0.15s;
}
.notifs-filter-tab.active { background: rgba(124,58,237,0.18); color: #A855F7; }

/* Notification group date header */
.notif-group-header {
  font: Geist 12px weight 700; color: #475569;
  letter-spacing: 0.6px; text-transform: uppercase;
  padding: 16px 0 8px;
}

/* Notification item */
.notif-item {
  display: flex; gap: 14px; padding: 14px 16px;
  border-radius: 12px; cursor: pointer; transition: background 0.12s;
  position: relative; text-decoration: none;
  margin-bottom: 2px;
}
.notif-item:hover { background: rgba(255,255,255,0.03); }
.notif-item.unread {
  background: rgba(124,58,237,0.06);
  border: 1px solid rgba(124,58,237,0.10);
}
.notif-item.unread::before {
  content: ''; position: absolute;
  left: 6px; top: 50%; transform: translateY(-50%);
  width: 6px; height: 6px; border-radius: 50%;
  background: #7C3AED;
}

/* Type icon */
.notif-icon-wrap {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.notif-icon-follow    { background: rgba(124,58,237,0.15); }
.notif-icon-reaction  { background: rgba(239,68,68,0.12);  }
.notif-icon-comment   { background: rgba(6,182,212,0.12);  }
.notif-icon-reply     { background: rgba(6,182,212,0.10);  }
.notif-icon-approval  { background: rgba(16,185,129,0.12); }
.notif-icon-rejection { background: rgba(239,68,68,0.12);  }
.notif-icon-milestone { background: rgba(245,158,11,0.12); }
.notif-icon-mention   { background: rgba(168,85,247,0.12); }

/* Content */
.notif-body { flex: 1; }
.notif-text {
  font: Geist 14px; color: #CBD5E1; line-height: 20px; margin-bottom: 4px;
}
.notif-text strong { color: #F8FAFC; font-weight: 700; }
.notif-text .notif-target { color: #A855F7; }
.notif-time { font: Geist 12px; color: #475569; }

/* Thumbnail (for doc/post notifications) */
.notif-thumbnail {
  width: 44px; height: 44px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0;
  background: rgba(124,58,237,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
```

Notification filter tabs: **All** · **Reactions** · **Comments** · **Follows** · **System**

### Empty Notifications State

```css
.notifs-empty {
  text-align: center; padding: 80px 24px;
}
/* Icon: 🔔 · Title: "You're all caught up!" · Sub: "When people interact with your content, you'll see it here." */
```

### Real-time Notifications (Firestore onSnapshot)

```typescript
// useNotifications hook
export function useNotifications(uid: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      const notifs = snap.docs.map(d => ({id: d.id, ...d.data()})) as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    });
    return unsub;
  }, [uid]);

  const markAllRead = async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.isRead).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  return { notifications, unreadCount, markAllRead };
}
```

---

## PART 4: BLOG WRITE — /blog/write

### Page Identity
The blog editor is where students and lecturers **give back to the community** — writing tips, news, reflections, academic guides. The experience must feel premium and focused. Distraction-free writing with a powerful toolbar.

### Blog Write Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ TOP NAV — Write mode (simplified: just logo + [Save Draft] [Publish])│
├──────────────────────────────────────────────────────────────────┤
│ WRITE PAGE                                                        │
│                                                                   │
│  [Cover image upload strip — click to add cover]                 │
│  [Category selector]  [Tags input]                               │
│  [Title input — Instrument Serif, large]                         │
│  ──────────────────────────── (divider)                          │
│  [TipTap Toolbar — sticky]                                        │
│  [TipTap Editor Body]                                            │
│                                                                   │
│  Word count: 0 words · Reading time: ~0 min                     │
└──────────────────────────────────────────────────────────────────┘
```

### Write Mode Top Nav

```css
.write-topnav {
  /* Same base as main topnav */
  display: flex; align-items: center; padding: 0 32px;
}
.write-topnav-logo { flex: 1; }
.write-topnav-status {
  font: Geist 12px; color: #475569;
  display: flex; align-items: center; gap: 6px;
}
.write-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; }
.write-topnav-actions { display: flex; gap: 10px; }

.save-draft-btn {
  height: 36px; padding: 0 16px; border-radius: 8px;
  background: transparent; border: 1px solid rgba(255,255,255,0.12);
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer;
  transition: all 0.15s;
}
.save-draft-btn:hover { background: rgba(255,255,255,0.06); color: #F8FAFC; }

.publish-btn {
  height: 36px; padding: 0 18px; border-radius: 8px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 14px weight 700; border: none; cursor: pointer;
  box-shadow: 0 4px 14px rgba(124,58,237,0.4);
  display: flex; align-items: center; gap: 7px;
  transition: all 0.2s;
}
.publish-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.55); }
.publish-btn:disabled { background: rgba(124,58,237,0.3); transform: none; box-shadow: none; cursor: not-allowed; }
```

### Cover Image Upload Strip

```css
.cover-upload-strip {
  width: 100%; height: 220px; border-radius: 14px;
  background: rgba(124,58,237,0.04);
  border: 2px dashed rgba(255,255,255,0.08);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  cursor: pointer; margin-bottom: 24px;
  transition: all 0.2s ease; position: relative; overflow: hidden;
}
.cover-upload-strip:hover {
  border-color: rgba(124,58,237,0.3);
  background: rgba(124,58,237,0.06);
}
.cover-upload-strip .upload-hint { font: Geist 14px; color: #475569; }
.cover-upload-strip .upload-hint span { color: #A855F7; font-weight: 600; }

/* When cover uploaded — show image + edit overlay */
.cover-uploaded {
  border: none;
}
.cover-uploaded img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.cover-uploaded-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; gap: 12px;
  opacity: 0; transition: opacity 0.2s;
}
.cover-upload-strip:hover .cover-uploaded-overlay { opacity: 1; }
.cover-edit-btn, .cover-remove-btn {
  height: 36px; padding: 0 16px; border-radius: 8px;
  font: Geist 13px weight 600; cursor: pointer; transition: all 0.15s;
}
.cover-edit-btn   { background: rgba(255,255,255,0.15); color: #F8FAFC; border: none; }
.cover-remove-btn { background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); }
```

### Post Meta Row (Category + Tags)

```css
.post-meta-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
}

/* Category select */
.category-select-btn {
  height: 36px; padding: 0 14px; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  color: #94A3B8; font: Geist 13px weight 500; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.15s;
}
.category-select-btn.selected { color: #A855F7; border-color: rgba(124,58,237,0.35); background: rgba(124,58,237,0.08); }
.category-select-btn:hover { background: rgba(255,255,255,0.07); }

/* Tags input */
.tags-input-wrap {
  flex: 1; min-width: 200px;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 8px; padding: 6px 12px; min-height: 36px;
}
.tags-input-wrap:focus-within { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }

.tag-chip-input {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25);
  border-radius: 9999px; padding: 2px 8px;
  font: Geist 12px weight 600; color: #A855F7;
}
.tag-chip-remove { cursor: pointer; font-size: 13px; color: rgba(168,85,247,0.6); background: none; border: none; }

.tags-text-input {
  flex: 1; min-width: 80px; background: transparent;
  border: none; outline: none;
  font: Geist 13px; color: #CBD5E1;
}
.tags-text-input::placeholder { color: #475569; }
```

### Title Input

```css
.post-title-input {
  width: 100%;
  background: transparent; border: none; outline: none;
  font-family: 'Instrument Serif'; font-size: clamp(28px, 4vw, 44px);
  font-weight: 400; color: #F8FAFC; line-height: 1.2;
  letter-spacing: -0.5px; margin-bottom: 16px;
  resize: none; overflow: hidden;
  /* auto-grows via JS onInput: target.style.height = target.scrollHeight + 'px' */
}
.post-title-input::placeholder {
  color: rgba(248,250,252,0.2);
}
```

### TipTap Editor

```css
/* Sticky toolbar */
.tiptap-toolbar-sticky {
  position: sticky; top: 64px; z-index: 30;
  background: rgba(8,8,16,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 8px 0; margin-bottom: 24px;
}

.toolbar-inner {
  display: flex; align-items: center; gap: 2px; flex-wrap: wrap;
}

.tb-btn {
  width: 34px; height: 34px; border-radius: 7px;
  background: transparent; border: none;
  color: #94A3B8; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.12s; position: relative;
}
.tb-btn:hover  { background: rgba(255,255,255,0.07); color: #F8FAFC; }
.tb-btn.active { background: rgba(124,58,237,0.16); color: #A855F7; }
.tb-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.tb-sep { width: 1px; height: 22px; background: rgba(255,255,255,0.08); margin: 0 4px; flex-shrink: 0; }

/* Heading dropdown */
.tb-heading-select {
  height: 34px; padding: 0 10px; border-radius: 7px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94A3B8; font: Geist 12px weight 600; cursor: pointer;
}
.tb-heading-select:hover { background: rgba(255,255,255,0.07); }

/* Link insert form (shows inline when link button clicked) */
.tb-link-form {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px;
  background: rgba(22,22,42,0.95);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  position: absolute; top: calc(100% + 4px); left: 0; z-index: 50;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  animation: search-drop 0.15s ease both;
}
.tb-link-input {
  width: 240px; height: 32px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10); border-radius: 7px;
  padding: 0 10px; color: #F8FAFC; font: Geist 13px; outline: none;
}
```

**Full toolbar buttons:**
B · *I* · U · ~~S~~ · `Code` | H1 · H2 · H3 | • List · 1. List | ❝ Quote | — Divider | 🔗 Link · 🖼 Image | Undo · Redo

### Word Count + Auto-save Bar

```css
.editor-status-bar {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 0; margin-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  font: Geist 12px; color: #475569;
}
.editor-word-count span { color: #94A3B8; font-weight: 500; }
.editor-read-time  span { color: #94A3B8; font-weight: 500; }
.editor-autosave   { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.autosave-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; }
```

### Publish Modal (Confirmation Before Publishing)

```css
/* Opens when clicking Publish */
.publish-modal-overlay {
  /* Standard modal overlay */
}
.publish-modal {
  background: #1E1E35;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px; padding: 32px; max-width: 440px;
}
.publish-modal-title { font: Geist 20px weight 700; color: #F8FAFC; margin-bottom: 6px; }
.publish-modal-sub   { font: Geist 14px; color: #94A3B8; margin-bottom: 24px; }

/* Preview strip */
.publish-preview-strip {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 14px;
  margin-bottom: 24px;
}
.preview-title { font: Geist 14px weight 600; color: #F8FAFC; margin-bottom: 4px; }
.preview-meta  { font: Geist 12px; color: #94A3B8; }

.publish-confirm-btn {
  /* Primary button styles — full width */
  width: 100%; height: 48px; justify-content: center;
}
```

### Blog Write Firestore Logic

```typescript
// Auto-save draft (debounced 2000ms)
export async function saveDraft(uid: string, postData: Partial<Post>) {
  const draftId = postData.id || `draft_${uid}_${Date.now()}`;
  await setDoc(doc(db, 'posts', draftId), {
    ...postData,
    authorId: uid,
    isPublished: false,
    updatedAt: serverTimestamp(),
    createdAt: postData.createdAt || serverTimestamp(),
  }, { merge: true });
  return draftId;
}

// Publish post
export async function publishPost(uid: string, postData: Partial<Post>) {
  const slug = generateSlug(postData.title!);
  const postId = postData.id || doc(collection(db, 'posts')).id;
  await setDoc(doc(db, 'posts', postId), {
    ...postData, id: postId, slug,
    authorId: uid, isPublished: true,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likesCount: 0, commentsCount: 0, viewCount: 0, bookmarksCount: 0,
  });
  // Add to search_index
  await setDoc(doc(db, 'search_index', postId), {
    id: postId, type: 'post', title: postData.title,
    titleTokens: tokenize(postData.title!),
    snippet: postData.excerpt?.slice(0, 120),
    authorName: postData.authorName,
    createdAt: serverTimestamp(),
  });
  // Update user's uploadsCount
  await updateDoc(doc(db, 'users', uid), { uploadsCount: increment(1), points: increment(5) });
  return { postId, slug };
}
```

---

## PART 5: PERSONAL DASHBOARD — /dashboard

### Page Identity
The Dashboard is the student's **command center** — a personalized overview of their entire ESUTSphere activity. Stats, recent uploads, bookmarks, account settings. Four sub-routes via tab navigation.

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ DASHBOARD HEADER                                                  │
│ "Good morning, Joshua 👋"                                        │
│ "Here's what's happening in your academic world today."          │
├──────────────────────────────────────────────────────────────────┤
│ STATS ROW (4 cards)                                               │
│ [Uploads] [Followers] [Downloads] [Points]                       │
├──────────────────────────────────────────────────────────────────┤
│ TAB NAV: [Overview] [My Uploads] [Bookmarks] [Settings]          │
├──────────────────────────────────────────────────────────────────┤
│ TAB CONTENT                                                       │
└──────────────────────────────────────────────────────────────────┘
```

### Dashboard Header

```css
.dashboard-header {
  padding: 28px 0 24px;
}
.dashboard-greeting {
  font-family: 'Instrument Serif'; font-size: clamp(24px, 3vw, 34px);
  color: #F8FAFC; margin-bottom: 6px;
}
.dashboard-greeting .name { color: #A855F7; }
.dashboard-subtitle { font: Geist 15px; color: #94A3B8; }

/* Quick action row */
.dashboard-quick-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.quick-action-btn {
  height: 38px; padding: 0 16px; border-radius: 9999px;
  font: Geist 13px weight 600; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  text-decoration: none; transition: all 0.15s;
}
.qa-upload { background: rgba(124,58,237,0.14); color: #A855F7; border: 1px solid rgba(124,58,237,0.3); }
.qa-write  { background: rgba(6,182,212,0.10);  color: #06B6D4; border: 1px solid rgba(6,182,212,0.25); }
.qa-profile{ background: rgba(255,255,255,0.04); color: #94A3B8; border: 1px solid rgba(255,255,255,0.08); }
.qa-upload:hover { background: rgba(124,58,237,0.24); }
.qa-write:hover  { background: rgba(6,182,212,0.18); }
.qa-profile:hover{ background: rgba(255,255,255,0.08); color: #F8FAFC; }
```

### Stats Row (4 Cards)

```css
.dashboard-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  margin-bottom: 28px;
}
@media (max-width: 1023px) { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 479px)  { grid-template-columns: 1fr 1fr; }

.stat-card {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 20px;
  position: relative; overflow: hidden;
  transition: all 0.2s ease;
}
.stat-card:hover { border-color: rgba(124,58,237,0.25); transform: translateY(-2px); }
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--stat-accent, linear-gradient(90deg, #7C3AED, #A855F7));
}

.stat-icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--stat-icon-bg, rgba(124,58,237,0.12));
  border: 1px solid var(--stat-icon-border, rgba(124,58,237,0.2));
  display: flex; align-items: center; justify-content: center;
  font-size: 19px; margin-bottom: 12px;
}

.stat-value {
  font: 'Instrument Serif' 32px; color: #F8FAFC; display: block; margin-bottom: 4px;
  line-height: 1.1;
}
.stat-label { font: Geist 13px weight 500; color: #94A3B8; }
.stat-change {
  font: Geist 11px weight 600; margin-top: 6px;
  display: flex; align-items: center; gap: 4px;
}
.stat-change.up   { color: #10B981; }
.stat-change.same { color: #475569; }
```

Stat cards: **Uploads** (icon: 📤, purple accent) · **Followers** (icon: 👥, cyan accent) · **Downloads** (icon: ⬇️, gold accent) · **Points** (icon: ⚡, purple→cyan gradient)

### Dashboard Tabs

```css
.dashboard-tabs {
  display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 28px;
}
.dashboard-tab {
  padding: 12px 22px; font: Geist 14px weight 600;
  color: #475569; cursor: pointer; text-decoration: none;
  border-bottom: 2px solid transparent; transition: all 0.15s;
  display: flex; align-items: center; gap: 8px; margin-bottom: -1px;
}
.dashboard-tab:hover { color: #94A3B8; }
.dashboard-tab.active { color: #A855F7; border-bottom-color: #7C3AED; }
```

### Overview Tab Content

```css
.overview-grid {
  display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px;
}
@media (max-width: 1023px) { grid-template-columns: 1fr; }

/* Recent activity feed */
.activity-feed-card {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; overflow: hidden;
}
.activity-header {
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
  font: Geist 14px weight 700; color: #F8FAFC;
  display: flex; align-items: center; justify-content: space-between;
}
.activity-item {
  display: flex; gap: 12px; padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: flex-start;
}
.activity-item:last-child { border-bottom: none; }
.activity-icon { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.activity-text { font: Geist 13px; color: #CBD5E1; line-height: 20px; }
.activity-text .highlight { color: #A855F7; font-weight: 600; }
.activity-time { font: Geist 11px; color: #475569; margin-top: 3px; }

/* Badges earned */
.badges-earned-card {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 18px;
}
.badges-earned-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.badge-earned-item {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 12px; text-align: center;
  transition: all 0.15s;
}
.badge-earned-item:hover { border-color: rgba(124,58,237,0.25); transform: translateY(-2px); }
.badge-earned-icon { font-size: 28px; margin-bottom: 8px; }
.badge-earned-name { font: Geist 12px weight 600; color: #F8FAFC; }

/* Upcoming section - course progress or deadlines */
.upcoming-card {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 18px;
}
```

### Uploads Tab Content

```css
/* Uploads tab shows user's own documents */
/* Reuses document card grid from library */
/* Extra: edit/delete actions on each card (owner only) */

.uploads-toolbar {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.uploads-count { font: Geist 14px; color: #94A3B8; }
.uploads-count span { color: #F8FAFC; font-weight: 600; }

/* Owner action buttons on document cards */
.doc-card-owner-actions {
  position: absolute; top: 12px; right: 12px;
  display: flex; gap: 6px; opacity: 0; transition: opacity 0.15s;
}
.doc-card:hover .doc-card-owner-actions { opacity: 1; }
.doc-owner-btn {
  width: 30px; height: 30px; border-radius: 7px;
  background: rgba(8,8,16,0.8); backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.12);
  color: #94A3B8; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
}
.doc-owner-btn:hover { color: #F8FAFC; }
.doc-owner-delete:hover { background: rgba(239,68,68,0.15); color: #EF4444; border-color: rgba(239,68,68,0.3); }
```

### Bookmarks Tab Content

```css
/* Two sections: Bookmarked Documents + Bookmarked Blog Posts */
.bookmarks-section { margin-bottom: 32px; }
.bookmarks-section-title {
  font: Geist 15px weight 700; color: #F8FAFC; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.bookmarks-count {
  font: Geist 12px weight 600; color: #475569;
  background: rgba(255,255,255,0.06); border-radius: 9999px; padding: 2px 8px;
}

/* Bookmarked doc row (compact list view) */
.bookmarked-doc-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  text-decoration: none; cursor: pointer; transition: background 0.12s;
  border-radius: 10px; padding: 12px;
}
.bookmarked-doc-row:hover { background: rgba(255,255,255,0.03); }
.bookmarked-type-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--type-color); flex-shrink: 0; }
.bookmarked-doc-title { font: Geist 14px weight 600; color: #F8FAFC; flex: 1; }
.bookmarked-doc-meta  { font: Geist 12px; color: #475569; }
.bookmarked-remove {
  width: 28px; height: 28px; border-radius: 7px;
  background: transparent; border: none; color: #475569;
  cursor: pointer; font-size: 15px;
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
}
.bookmarked-remove:hover { background: rgba(239,68,68,0.10); color: #EF4444; }
```

---

## PART 6: SETTINGS — /dashboard/settings

### Settings Layout

```
┌────────────────────────────────────────────────────────────────┐
│ SETTINGS HEADER                                                 │
│ "Account Settings"                                             │
├──────────────────────────────────────────────────────────────  ┤
│ SETTINGS TABS: [Profile] [Account] [Notifications]            │
├────────────────────────────────────────────────────────────────┤
│ SETTINGS CONTENT (max-width 640px)                             │
└────────────────────────────────────────────────────────────────┘
```

```css
.settings-page { max-width: 680px; }

.settings-header { padding: 28px 0 24px; }
.settings-title { font-family: 'Instrument Serif'; font-size: 28px; color: #F8FAFC; }

.settings-tabs {
  display: flex; gap: 4px; margin-bottom: 32px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 4px; width: fit-content;
}
.settings-tab {
  padding: 9px 20px; border-radius: 8px;
  font: Geist 13px weight 600; color: #94A3B8; cursor: pointer;
  display: flex; align-items: center; gap: 7px; transition: all 0.15s;
}
.settings-tab.active { background: rgba(124,58,237,0.18); color: #A855F7; }
.settings-tab:hover:not(.active) { color: #CBD5E1; }

/* Settings form section */
.settings-section {
  background: rgba(18,18,32,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden; margin-bottom: 20px;
}
.settings-section-header {
  padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.06);
  font: Geist 15px weight 700; color: #F8FAFC;
}
.settings-section-body { padding: 22px; display: flex; flex-direction: column; gap: 20px; }

/* Settings field */
.settings-field { display: flex; flex-direction: column; gap: 6px; }
.settings-field label { font: Geist 13px weight 500; color: #CBD5E1; }
.settings-field-hint  { font: Geist 12px; color: #475569; margin-top: 4px; }

/* Settings input — same as auth-input base */
.settings-input {
  height: 44px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px; color: #F8FAFC; font: Geist 14px;
  padding: 0 14px; transition: all 0.2s; width: 100%;
}
.settings-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); outline: none; }

/* Textarea */
.settings-textarea {
  /* Same as settings-input */
  height: auto; min-height: 90px; padding: 12px 14px; resize: vertical; line-height: 22px;
}

/* Save button */
.settings-save-btn {
  height: 42px; padding: 0 22px; border-radius: 10px;
  background: linear-gradient(135deg, #7C3AED, #A855F7);
  color: #FFFFFF; font: Geist 14px weight 700; border: none; cursor: pointer;
  box-shadow: 0 4px 14px rgba(124,58,237,0.35); transition: all 0.2s;
}
.settings-save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.5); }
.settings-save-btn:disabled { background: rgba(124,58,237,0.3); transform: none; cursor: not-allowed; }
```

### Settings — Profile Tab

```
Fields:
- Profile photo (circle uploader with change/remove)
- Cover photo (banner uploader with change/remove)
- Display Name
- Username (@joshuazaza) — with availability check
- Bio (textarea, 160 char limit with counter)
- Department (read-only — shows from onboarding data)
- Level (read-only — auto-calculated)
```

```css
/* Profile photo editor */
.profile-photo-editor {
  display: flex; align-items: center; gap: 20px; padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.photo-preview {
  width: 80px; height: 80px; border-radius: 50%;
  object-fit: cover; border: 3px solid rgba(124,58,237,0.3);
}
.photo-actions { display: flex; flex-direction: column; gap: 8px; }
.photo-change-btn {
  height: 34px; padding: 0 14px; border-radius: 8px;
  background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.3);
  color: #A855F7; font: Geist 13px weight 600; cursor: pointer;
}
.photo-remove-btn {
  height: 34px; padding: 0 14px; border-radius: 8px;
  background: transparent; border: 1px solid rgba(239,68,68,0.25);
  color: #EF4444; font: Geist 13px weight 500; cursor: pointer;
}

/* Char counter for bio */
.bio-counter {
  text-align: right; font: Geist 11px; margin-top: 4px;
}
.bio-counter.ok      { color: #475569; }
.bio-counter.warning { color: #F59E0B; }
.bio-counter.over    { color: #EF4444; }

/* Read-only info fields */
.settings-read-only {
  height: 44px; background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 0 14px;
  display: flex; align-items: center;
  font: Geist 14px; color: #475569;
}
.settings-read-only .lock-icon { margin-left: auto; font-size: 14px; color: #475569; }
```

### Settings — Account Tab

```
Fields:
- Email address (read-only, shows Google account email)
- Change password section (only for email/password auth users)
- Danger zone: Delete account (requires typing "DELETE" to confirm)
```

```css
/* Danger zone */
.settings-danger-zone {
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.20);
  border-radius: 14px; padding: 20px;
}
.danger-zone-title { font: Geist 15px weight 700; color: #EF4444; margin-bottom: 8px; }
.danger-zone-text  { font: Geist 13px; color: #94A3B8; margin-bottom: 16px; line-height: 20px; }
.danger-delete-btn {
  height: 40px; padding: 0 18px; border-radius: 9px;
  background: transparent; border: 1px solid rgba(239,68,68,0.4);
  color: #EF4444; font: Geist 13px weight 600; cursor: pointer;
  transition: all 0.15s;
}
.danger-delete-btn:hover { background: rgba(239,68,68,0.10); }

/* Delete confirmation modal */
.delete-confirm-input {
  /* Settings input styled with error state */
  margin: 16px 0;
}
.delete-confirm-input:not(:placeholder-shown):valid { border-color: #EF4444; }
```

### Settings — Notifications Tab

```css
/* Toggle rows */
.notif-setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.notif-setting-row:last-child { border-bottom: none; }
.notif-setting-info { flex: 1; margin-right: 16px; }
.notif-setting-label { font: Geist 14px weight 600; color: #F8FAFC; margin-bottom: 3px; }
.notif-setting-desc  { font: Geist 12px; color: #94A3B8; }

/* Toggle switch */
.toggle-switch { position: relative; width: 48px; height: 26px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-track {
  position: absolute; inset: 0; cursor: pointer; border-radius: 9999px;
  background: rgba(255,255,255,0.10); transition: background 0.2s;
}
.toggle-switch input:checked + .toggle-track { background: #7C3AED; }
.toggle-track::before {
  content: ''; position: absolute;
  width: 20px; height: 20px; border-radius: 50%; background: #FFFFFF;
  left: 3px; top: 3px; transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
.toggle-switch input:checked + .toggle-track::before { transform: translateX(22px); }
```

Notification toggles:
- New followers · Reactions on my uploads · Comments on my uploads · Replies to my comments · @Mentions · New document uploaded by followed users · Account status updates (always on, locked) · Weekly activity digest · Email notifications

---

## PART 7: LIBRARY — AUTHENTICATED ENHANCED VIEW

### What Changes vs Guest View

| Feature | Guest | Authenticated |
|---------|-------|---------------|
| Download button | Hidden | Active |
| Bookmark | Hidden | Active |
| React to documents | Hidden | Active |
| Upload button | Hidden | Active |
| Comment on documents | Hidden | Active |
| View own uploads | No | Yes (Dashboard tab) |
| Filtering | Basic | Full (incl. bookmarked filter) |

### Authenticated Library Additions

```css
/* "My Uploads" tab in filter sidebar */
.sidebar-my-uploads-btn {
  width: 100%; height: 36px; border-radius: 9px;
  background: rgba(124,58,237,0.10);
  border: 1px solid rgba(124,58,237,0.25);
  color: #A855F7; font: Geist 13px weight 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.15s; margin-bottom: 12px;
}
.sidebar-my-uploads-btn:hover { background: rgba(124,58,237,0.18); }

/* Bookmarked filter toggle */
.sidebar-bookmarked-toggle {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 10px;
}
.sidebar-bookmarked-label { font: Geist 13px weight 500; color: #94A3B8; display: flex; align-items: center; gap: 8px; }
/* Uses .toggle-switch from settings */

/* Download button on document card (authenticated) */
.doc-card-download-btn {
  width: 30px; height: 30px; border-radius: 7px;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.25);
  color: #A855F7; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.doc-card-download-btn:hover { background: rgba(124,58,237,0.24); }

/* After click — download starts */
.doc-card-download-btn.downloading {
  animation: spin 1s linear infinite; pointer-events: none;
}

/* Bookmark button on card */
.doc-card-bookmark-btn {
  width: 30px; height: 30px; border-radius: 7px;
  background: transparent; border: 1px solid transparent;
  color: #475569; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.doc-card-bookmark-btn:hover { color: #F59E0B; }
.doc-card-bookmark-btn.bookmarked { color: #F59E0B; }
```

---

## PART 8: SHARED FIREBASE QUERIES — AUTHENTICATED

```typescript
// Dashboard stats
export async function getDashboardStats(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  const userData = userDoc.data();
  return {
    uploadsCount:        userData?.uploadsCount || 0,
    followersCount:      userData?.followersCount || 0,
    totalDownloads:      userData?.totalDownloads || 0,
    points:              userData?.points || 0,
    badges:              userData?.badges || [],
    totalLikesReceived:  userData?.totalLikesReceived || 0,
  };
}

// Bookmark a document/post
export async function toggleBookmark(uid: string, targetId: string, targetType: 'document' | 'post', currentlyBookmarked: boolean) {
  const bookmarkId = `${uid}_${targetId}`;
  const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
  const targetRef = doc(db, targetType === 'document' ? 'documents' : 'posts', targetId);
  const batch = writeBatch(db);
  if (currentlyBookmarked) {
    batch.delete(bookmarkRef);
    batch.update(targetRef, { bookmarksCount: increment(-1) });
  } else {
    batch.set(bookmarkRef, { userId: uid, targetId, targetType, createdAt: serverTimestamp() });
    batch.update(targetRef, { bookmarksCount: increment(1) });
  }
  await batch.commit();
}

// Add reaction
export async function addReaction(uid: string, targetId: string, targetType: 'document' | 'post', reactionType: string) {
  const reactionId = `${uid}_${targetId}`;
  const reactionRef = doc(db, 'reactions', reactionId);
  const targetRef = doc(db, targetType === 'document' ? 'documents' : 'posts', targetId);
  const existing = await getDoc(reactionRef);
  const batch = writeBatch(db);
  if (existing.exists() && existing.data().reactionType === reactionType) {
    // Toggle off
    batch.delete(reactionRef);
    batch.update(targetRef, { likesCount: increment(-1) });
  } else {
    batch.set(reactionRef, { userId: uid, targetId, targetType, reactionType, createdAt: serverTimestamp() });
    if (!existing.exists()) batch.update(targetRef, { likesCount: increment(1) });
  }
  await batch.commit();
  // Create notification for target owner (server-side via API route)
  await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ type: 'reaction', targetId, reactionType, senderId: uid }) });
}

// Update user settings
export async function updateUserProfile(uid: string, updates: Partial<User>) {
  const allowedFields = ['displayName', 'username', 'bio', 'profilePicture', 'coverPhoto'];
  const sanitized = Object.fromEntries(Object.entries(updates).filter(([k]) => allowedFields.includes(k)));
  await updateDoc(doc(db, 'users', uid), { ...sanitized, updatedAt: serverTimestamp() });
}

// Get user bookmarks
export async function getUserBookmarks(uid: string, type?: 'document' | 'post') {
  let q = query(collection(db, 'bookmarks'), where('userId', '==', uid), orderBy('createdAt', 'desc'), limit(30));
  if (type) q = query(q, where('targetType', '==', type));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Bookmark);
}

// Download document (increment count)
export async function downloadDocument(docId: string, uploaderId: string, currentUserId: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'documents', docId), { downloadCount: increment(1) });
  batch.update(doc(db, 'users', uploaderId), { totalDownloads: increment(1), points: increment(3) });
  await batch.commit();
  // Check for milestone (100 downloads)
  const docSnap = await getDoc(doc(db, 'documents', docId));
  if (docSnap.data()?.downloadCount === 100) {
    await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ type: 'download_milestone', targetId: docId, recipientId: uploaderId }) });
  }
}
```

---

## PART 9: AUTHENTICATED PAGE ANIMATIONS

```typescript
// Standard page transition (wrap every page's main content)
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.2 } },
};

// Feed posts stagger
const feedContainerVariants = {
  animate: { transition: { staggerChildren: 0.05 } }
};
const feedItemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
};

// Dashboard stats counter (number rolls from 0 to value on mount)
export function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

// Sidebar drawer animation (mobile)
const drawerVariants = {
  hidden:  { x: '-100%', transition: { duration: 0.3 } },
  visible: { x: 0,       transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};
```

---

## PART 10: WHAT NOT TO DO — AUTHENTICATED PAGES

| Page | Rule | Reason |
|------|------|--------|
| Feed | Never show unapproved users' posts | Privacy + moderation |
| Feed | Never mutate Firestore directly in render | Use debounced writes |
| Blog Write | Never auto-publish on route leave | Always warn: "You have unsaved changes" |
| Blog Write | Never skip the slug generation | Slug must be unique across all posts |
| Dashboard | Never show other users' bookmarks | Private data |
| Dashboard | Never show delete button unless `uploaderId === currentUser.uid` | Security |
| Settings | Never allow username change to existing username without checking uniqueness | Data integrity |
| Settings | Never allow changing department/level (read-only) | Academic integrity |
| Notifications | Never mark unread on hover — only on click/open | Respect the unread indicator |
| Library (auth) | Never send download URL before logging the download in Firestore | Count accuracy |
| All pages | Never call `window.location.reload()` — use router.refresh() | Next.js 16 way |
| Settings | Never auto-save unsaved settings — require explicit save button click | Accidental changes |

---

*ESUTSphere AUTH-PAGES.md — v1.0*
*Feed · Explore · Notifications · Dashboard (Overview/Uploads/Bookmarks/Settings) · Blog Write · Library Enhanced*
*Build the authenticated experience to make students want to stay.*
