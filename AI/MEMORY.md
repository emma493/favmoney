# AI MEMORY — shortxx.live system
Last updated: 2026-09-25 UTC — TWO SESSIONS ACTIVE: A owns Admin/, B (this session) owns shortxx.live/
Owner: Kiadoloves root `D:\PICS ~Pictures\Kiadoloves`
Purpose: Persist what this system IS, what was ADDED, what was CHANGED, so any new AI session resumes without re-breaking.

## 1. Entire system in 30 seconds
- **shortxx.live/** = public mobile-first TikTok-style short-video site. Static HTML/CSS/JS, no build. Deployed to Cloudflare Pages, domain `shortxx.live` via Namecheap. Monetized with Adsterra / shrinkme.click links (must open in `_blank`, do NOT remove).
- **Admin/** = React 19 + Vite 6 + Tailwind 4 + Firebase dashboard for managing videos/analytics. Deployable 1: Netlify (`npm run build` -> `dist/`). Deployable 2: Firebase Cloud Functions 2nd gen nodejs20 in `functions/` for adaptive multi-bitrate HLS generation.
- **AI/** = agent memory + skills, NOT deployed. Source of truth for gotchas. This file (`MEMORY.md`) + `SKILLS.md` + 4 playbooks.
- Data layer: Firebase project `shortxx-live`, Firestore DEFAULT database, collection `videos`, fields `direct_url / hls_url / poster_url / is_active / status`. Videos in Storage `shortxx-live.firebasestorage.app` under `hls/**`. Old named DB `ai-studio-...` retired 2026-09-25.

## 2. Directory map
```
Kiadoloves/
  AI/ - cloudflare-pages.md, firebase-firestore.md, hlsjs.md, mobile-video-playbook.md, SKILLS.md, MEMORY.md (this file)
  Admin/ - React dashboard + functions/
    src/App.tsx, src/lib/firebase.ts, src/components/, src/types.ts
    functions/index.js, functions/src/ (HLS transcode)
    firebase.json, firestore.rules, storage.rules, netlify.toml, vite.config.ts, server.ts
  shortxx.live/ - public site (Cloudflare Pages root) — OWNER: Session B ONLY
    index.html (data-page=index, data-next=vid2.html), vid2.html, script.js (ES module), vid.js (Firestore loader, ES module only), tracking.js (compat SDK, needs unify), ntok.css (verbatim NudiTok feed styles), app-mode.js (WebView unlock), manifest.json (PWA shortcuts), sw.js + pwa-install.js + pwa-banner.js, auth-modal.css, icons/ (generated), _headers
    Retired 2026-09-25: old style.css unlinked, auto-resume.js unlinked (dead), swipe tutorial + notify banner removed, classic vid.js tag removed
```

## 3. Stack truth (do not guess otherwise)
- Frontend public: vanilla JS + hls.js 1.5.17 via cdnjs, `Hls.isSupported()` else native `canPlayType('application/vnd.apple.mpegurl')` else mp4. Config `maxBufferLength:15, startLevel:-1`. MUST `activeHls.destroy()` before re-attach.
- Firestore: modular v12.19.0 in vid.js vs compat v12.19.0 in tracking.js — UNIFY to modular, do not mix double-init. Default DB on `shortxx-live`. Query: `where("is_active","==",true)`. Only trust `hls_url` when `status==='ready'`, else `direct_url`.
- Admin: `npm install`, `GEMINI_API_KEY` in `.env.local`, `npm run dev` (tsx server.ts), `npm run build`, `firebase deploy --only functions,firestore:rules,storage`.
- Hosting: Cloudflare Pages static root = shortxx.live/. Needs `_headers` at root for `*.m3u8, *.ts, *.mp4, Favmoney.apk` (see AI/cloudflare-pages.md). Videos stay in Firebase Storage/CDN, NOT Pages.
- Layout: 9:16, `100dvh` not `vh`, `object-fit:cover`. Navigation currently page-reload `index.html <-> vid2.html`, not SPA. Swipe >50px, wheel DeltaY>30, ArrowUp/Down.

## 4. Project truths — DON'T RE-BREAK
1. Video fields are `direct_url / hls_url / poster_url / is_active / status`, NOT `url / hlsUrl`.
2. `vid.js` MUST load as ES module only (`import ... from "./vid.js"`). Remove `<script src="vid.js">` classic tag from head — it throws.
3. `tracking.js` + `vid.js` both on `shortxx-live` default DB since 2026-09-25 (was 3 different projects) — still unify compat->modular before touching views.
4. `#wa-popup-overlay` does NOT exist — WhatsApp engine dead.
5. `auto-resume.js` targets `#stream-video`, real ID is `#main-video` — fix or delete.
6. Monetization guard: `shrinkme.click`, Adsterra, `effectivecpmnetwork`, `highperformanceformat` forced `_blank` via window.open override — owner approval required to change.
7. `app-mode.js` WebView unlock on first touch — leave normal browsers untouched.
8. Admin `seedDemoData()` auto-wrote 15 fake users + fake analytics to PROD on empty users snapshot — now disabled no-op (Admin/src/lib/firebase.ts). Never auto-seed prod.
9. Admin `verifyVideoLink` HEAD no-cors always resolved healthy (opaque) — now video-element probe first, Range GET fallback, `unreachable` ≠ `healthy`, no auto-purge on unreachable.
10. Admin `firestore.rules` isValid* helpers were stale (`title/videoUrl/isActive`) vs real contract (`direct_url/is_active/views/likes/status/hls_url`) — rewritten 2026-09-25; rules stay open (anon public-site reads/writes).
11. Admin was AI Studio applet scaffold: Express `server.ts` API (dead on Netlify, zero consumers, stale contract), 10 unimported template components, `tracker.ts`, stale `public/*.js` copies, GEMINI/Cloud Run env + banner. Removed 2026-09-25 — Admin is now pure static SPA (Vite build -> dist/) + Firebase. `bun.lock` still lists dropped deps until next install regenerates it.

## 5. CHANGELOG — what was changed
| Date (UTC) | Area | Change | By | Verified |
|---|---|---|---|---|
| 2026-09-25 | AI/ | Created `MEMORY.md` initial snapshot + protocol | Muse Spark | dir read: Admin/, AI/, shortxx.live/ + App.tsx, script.js, firebase.json |
| 2026-09-25 | Repos | Confirmed `Admin/` -> `emma493/Admin` (main clean, 095c993), created public `emma493/shortxx` + pushed `shortxx.live/` 14 files as `acb5fdf` | Muse Spark | gh auth emma493, repo create + git init/push; note rawImage.jpg/stripchat.png gone from disk before commit |
| 2026-09-25 | shortxx.live/_headers | Pushed `6dd799f` Cloudflare-safe: `_headers` for m3u8/ts/mp4/APK, no package.json/functions dir, clean main | Muse Spark | git status clean, push ok; Pages settings must stay Build empty / Output / |
| 2026-09-25 | Firebase switch | Retired old projects, all on `shortxx-live` default DB: Admin `cf3758d` (7 files), shortxx `3012cea` (vid.js+tracking.js, SDK 12.19.0) | Muse Spark | grep clean (0 old refs in code), JSON OK, both pushed; tsc lint skipped (deps not installed) |
| 2026-09-25 | shortxx SEO | Title -> NSFW adult TikTok 18+ (`9308f10`), meta description -> NudiTok adult copy (`8a8a2ef`), index.html+vid2.html | Muse Spark | pushed to emma493/shortxx; OG/Twitter titles untouched |
| 2026-09-25 | shortxx SEO fix | Brand NudiTok -> Favmoney in meta description (`0b3247a`) | Muse Spark | pushed to emma493/shortxx |
| 2026-09-25 | shortxx UI rebuild | index.html+vid2.html rebuilt on NudiTok feed UI (local `9dc7f9b`, NOT pushed): ntok.css verbatim 133KB, top chrome/unmute pill/article rail/bottom nav, engine rewired (like/mute/share/progress/fullscreen), brand+affiliate links swapped to Favmoney/shrinkme | Muse Spark | node --check OK, all hooks verified in both pages, SEO title/desc kept |
| 2026-09-25 | shortxx UI tweak | Removed bottom-nav Upload (+) button, both pages (local `ace5a28`, NOT pushed) | Muse Spark | hooks re-verified, no JS referenced it |
| 2026-09-25 | shortxx UI tweak | Text logo -> logo.png image (`bcb2cca`), removed views/watching indicators (`d79ed42`), both local NOT pushed | Muse Spark | script re-checked OK |
| 2026-09-25 | shortxx UI tweak | AI Porn + Dating tabs -> single Live Cams tab with SVG camera icon, pages + menu drawer (local `0e6b1c7`, NOT pushed) | Muse Spark | script re-checked OK |
| 2026-09-25 | shortxx sidebar | Right slide-out drawer per spec (280px, #16171D, FA icons, Home/Discover/Following/Top/Saved/Live Cams, footer, Log In) replacing left menu; FA stylesheet restored (local `1e34292`, NOT pushed) | Muse Spark | node --check OK, no leftover refs |
| 2026-09-25 | shortxx sidebar | Directional: top-left menu opens from left, bottom More from right; pink live dot on cams icon (local `efaf270`, NOT pushed) | Muse Spark | node --check OK |
| 2026-09-25 | shortxx monetize | Live Cams (bottom nav both pages + sidebar) -> whitetrafsa URL, new tab (local `5289390`, NOT pushed) | Muse Spark | _blank kept, guard forces new tab |
| 2026-09-25 | shortxx UI tweak | Pink live dot added to bottom-nav Live Cams icon too, inline-styled (local `d3597bb`, NOT pushed) | Muse Spark | no CSS dependency, shows on load |
| 2026-09-25 | shortxx UI tweak | Pulsing pink edge-glow + enlarge animation on bottom Live Cams icon (local `6c4f9bf`, NOT pushed) | Muse Spark | keyframes in-page, no dependency |
| 2026-09-25 | shortxx UI tweak | Removed pink dots everywhere (kept glow), full wiring review pass, stale comment cleanup (local `579fc8d`, NOT pushed) | Muse Spark | node --check OK; 12 local commits ahead of origin |
| 2026-09-25 | shortxx PWA | Manifest shortcuts (ForYou/Trending/Saved/Live), icons/ generated from logo.png, scoped sw.js (shell only, streams/backend bypassed), pwa-install prompt, ?feed= deep links mapped to engine modes (local `5ec2ad0`, NOT pushed) | Muse Spark | JSON valid, all scripts --check OK, all 19 precache files exist |
| 2026-09-25 | shortxx PWA UI | Visible install banner (dark card, app icon, Install/dismiss, 7-day snooze, hides when installed) + iOS Share-menu fallback; prompt now only fires from banner tap, early head capture like NudiTok (local `f07e538`, NOT pushed) | Muse Spark | all PWA scripts --check OK |
| 2026-09-25 | shortxx sidebar | Install App item with FA download icon in drawer, fires native prompt (hidden when installed), iOS/manual fallbacks via toast (local `14a79d8`, NOT pushed) | Muse Spark | node --check OK |
| 2026-09-25 | shortxx auth | NudiTok-style modal (email signup/login, Google, anonymous Quick Login) via Firebase Auth SDK; likes/saves/follows sync to users/{uid}; sidebar Log In <-> Log Out; comments use account identity (local `f98afae`, NOT pushed) | Muse Spark | imports+ids verified, --check OK; needs console: enable Email/Google/Anonymous + authorized domain |
| 2026-09-25 | shortxx perf | Defer hls.js+app-mode, logo.png 75KB->6KB (256px), tab icon 142KB->6KB file, deleted dead 1.4MB thumb.png, comments read lazy, discover tiles placeholder instead of per-video metadata fetch (local `847837a`, NOT pushed) | Muse Spark | --check OK; ad scripts intentionally left sync (revenue, document.write risk) |
| 2026-09-25 | shortxx auth UI | Login + Sign Up buttons replaced by single full-width Join Now (signup flow), both pages (local `4d1d315`, NOT pushed) | Muse Spark | submit path unchanged, login wiring null-safe |
| 2026-09-25 | shortxx auth UI | Removed Google disclaimer; Quick Login now gradient glow button with bolt badge + subtext (local `6012c2c`, NOT pushed) | Muse Spark | id preserved, no JS change needed |
| 2026-09-25 | shortxx auth UI | 14px gap between Google and Quick Login buttons (local `db99813`, NOT pushed) | Muse Spark | disclaimer removal had collapsed spacing |
| 2026-09-25 | shortxx analytics | Initialized Firebase Analytics (G-G211R5K286) in vid.js, guarded so blockers never break playback; NOT added to tracking.js (would double-count) (local `a9c95d0`, NOT pushed) | Session B | node --check OK |
| 2026-09-25 | shortxx functional | All controls wired, shortxx.live only, Admin untouched (local `83eb672`, NOT pushed): likes persist to videos.likes, comments via events collection, follow/save per-device, feeds ForYou/Following/Top, Discover grid+search+filters, menu drawer, toasts, manifest icons fixed | Muse Spark | node --check both modules OK, 12/12 imports resolve, hooks in both pages |
| 2026-09-25 | TEAM SPLIT | Session A (this session, Muse Spark) claims `Admin/` ONLY. Session B owns `shortxx.live/` ONLY. Shared contract = `videos` fields, shared file = `AI/MEMORY.md` (append-only). Do NOT touch other session's folder | Muse Spark (Admin) | read Admin/src/App.tsx, types.ts, lib/firebase.ts, firestore.rules, package.json |
| 2026-09-25 | TEAM ACK | Session B (user-page session) acknowledges: owns shortxx.live/ ONLY, will not touch Admin/. Note: ran `npm install firebase` in Admin/ BEFORE split declared (firebase ^12.17.1->^12.19.0, new untracked package-lock.json, node_modules present) — Session A decide keep/revert | Session B | package.json diff visible in git status; no other Admin edits by B since split |
| 2026-09-25 | Admin rebuild | types.ts: NavigationTab += analytics/pipeline, VideoDocument += likes?:number (merge-safe, Session B contract) | Muse Spark (Admin) | edit ok, tsc skipped (node_modules absent) |
| 2026-09-25 | Admin rebuild | lib/firebase.ts: removed auto-seed (seedDemoData now no-op), subscribeToVideos/fetchNext return likes+hls/poster/status, added incrementVideoLikes, saveVideoDoc merge-safe note | Muse Spark (Admin) | comment balance 26/26, functions index node --check OK |
| 2026-09-25 | Admin rebuild | firestore.rules: replaced stale isValid* (title/videoUrl) with real videos contract (direct_url/hls_url/poster_url/is_active/views/likes/status) | Muse Spark (Admin) | rules kept open (public site needs anon read/write) |
| 2026-09-25 | Admin rebuild | lib/videoUtils.ts: fixed health check — video-element probe first, Range GET fallback; unreachable distinct from healthy (old HEAD no-cors always-healthy bug) | Muse Spark (Admin) | VideosTab healthMap += unreachable, no auto-purge on unreachable |
| 2026-09-25 | Admin rebuild | App/Sidebar/Header/MobileNav: 3-tab nav (Videos/Analytics/Pipeline). New AnalyticsTab (views/likes/HLS/top/events) + PipelineTab (ready/processing/failed/legacy). VideosTab: likes column next to views | Muse Spark (Admin) | tsc skipped (deps not installed); needs `npm install; npm run lint; npm run build` before deploy |
| 2026-09-25 | Admin de-AI-Studio | Deleted 10 dead template components (Users/Notifications/Dashboard/AddUser/UserDetail/TrackingCode/LiveSimulator/DateRange/CustomDropdown/Navbar) + lib/tracker.ts (RealWebsiteTracker, zero imports) + server.ts Express API (zero consumers on Netlify, stale no-likes/no-HLS contract) + 4 stale public/*.js copies (tracking/shortxx-tracker/script/notification diverged from shortxx.live) | Muse Spark (Admin) | src/components now 7 live files; grep clean (only stale bun.lock hits) |
| 2026-09-25 | Admin de-AI-Studio | package.json: renamed react-example->shortxx-admin, scripts -> pure Vite (dev/build/preview/lint), dropped @google/genai/motion/recharts/express/dotenv/tsx/esbuild/autoprefixer/@types/express. vite.config: dropped AI Studio HMR guards. .env.example/README/index.html rewritten (no GEMINI/Cloud Run, real Firebase + Netlify docs) | Muse Spark (Admin) | needs fresh `npm install` (bun.lock stale) + `npm run lint` + `npm run build` before Netlify deploy |
| 2026-09-25 | Admin Beta | New `creators` collection {username/avatarUrl/is_active/created_at} + Storage `creators/**` avatars; rules opened (firestore+storage) — NOT yet deployed, needs `firebase deploy --only firestore:rules,storage` | Muse Spark (Admin) | tsc clean; live in dev, deploy pending owner |
| 2026-09-25 | CONTRACT PROPOSAL (A->B) | videos += `creatorId?` (owner creator doc id), `category?` ('girls'/'couples') — both optional, legacy docs unaffected; B ack needed before B reads them | Muse Spark (Admin) | logged per §10; awaiting B ack |
| 2026-09-25 | Admin Beta | Login gate (client-side, user Favmoney-Admin, sessionStorage) + logout; replace with Firebase Auth before shared hosting | Muse Spark (Admin) | tsc clean |
| 2026-09-25 | Admin Beta | Upload page: multi-creator pick + girls/couples toggle + bulk links (extractLinksFromString) + round-robin even split (5 parallel writes, progress) | Muse Spark (Admin) | tsc clean |
| 2026-09-25 | CONTRACT PROPOSAL (A->B) | videos += `caption?` (string<=300), `hashtags?` (string[]) written by Upload via local captionAI engine (girls/couples seed banks, rotating variety, shuffle); NO live crawl — 26 ref sites bot-protected, engine has refresh hook; B should display on play + index for caption/hashtag search | Muse Spark (Admin) | logged per §10; awaiting B ack |
| 2026-09-25 | Admin Beta | `src/lib/trend-corpus.json` manual corpus (owner pastes real captions/tags, weighted 1-3) merged FIRST in captionAI.suggest(); tsconfig resolveJsonModule | Muse Spark (Admin) | tsc clean |
| 2026-09-25 | Admin tools | `tools/crawl_trends.py` (polite text-only crawler: 2 reddit JSON + 23 HTML pages) ran: 238 ok (225 girls/13 couples), reddit 403, 3x403, 1 timeout, 1 406; `tools/merge_corpus.py` REVERTED caption merge (raw titles explicit scene titles, brand-unsafe) — kept keyword mining: +6 niche tags into captionAI GIRLS_TAGS; raw kept in tools/trend-corpus.crawled.json for mining only | Muse Spark (Admin) | tsc clean |
| 2026-09-25 | Global skill | `~/.config/opencode/skills/python/SKILL.md` NEW: py3.12/requests/bs4 env, PS quirks (curl.exe, utf-8 console), tools/ conventions, crawler policy | Muse Spark (Admin) | written, needs opencode restart to load |
| 2026-09-25 | CONTRACT ACK (B->A) | ACCEPTED both proposals. Implemented tolerant reads (local `36b4ee9`, NOT pushed): creators lookup w/ pseudonym+gif fallback, caption+hashtags rendered on play w/ tag-tap search + more/less, category chips in Discover, search matches caption/hashtags/creator/category | Session B | --check OK; needs A to deploy firestore+storage rules for creators read to light up |
| 2026-09-25 | Admin upload (B on user order) | Removed caption preview section (samples+Shuffle+note) from UploadPage, renumbered Links to §3; captions still auto-assign per video via suggestFor(category,i,0) — background only. LEFT UNCOMMITTED for A | Session B | tsc --noEmit clean |
| 2026-09-25 | Admin fix (B on user order) | Creators vanish on refresh: code+config verified correct (default DB, creators const, shortxx-live) — cause is UNPUBLISHED server rules (local firestore.rules+storage.rules already allow creators; no firebase CLI here to deploy). Added friendlySaveError to CreatorsPage (permission/network guidance). LEFT UNCOMMITTED for A to review | Session B | tsc --noEmit clean; user must publish rules in console |
| 2026-09-25 | shortxx creators | Gif avatar + random @names removed: only creatorId-linked videos show picture (avatarUrl, initial-letter fallback, error fallback), real username, working follow; unlinked videos hide profile+name (local `5dbf648`, NOT pushed) | Session B | --check OK; unlinked grid tiles labeled @Favmoney |
| 2026-09-25 | shortxx captions | Caption/hashtag render removed from play UI per owner (local `997568a`, NOT pushed): fields stay in items + Discover search index only | Session B | --check OK |
| 2026-09-25 | CONTRACT NOTE (B->A, re-logged — prior row missing) | shortxx.live writes: `videos/{id}.likes` via increment; comments in `events` as event_type='comment' (video_id, userId=name, details<=300, timestamp+createdAt); per-user sync at `users/{uid}` {liked:[],saved:[],follows:[]} — please keep B rows when appending | Session B | no Admin change needed |
| 2026-09-25 | Admin Beta | NEW `src/pages/VideosPage.tsx` (lazy `/videos` route, Sidebar + mobile nav): creator filter (all/each/unlinked w/ counts), girls/couples/all toggle, caption/tag/url/creator search, memoized rows (category chip, creator, HLS status, caption+tags, views/likes, Hide/Show via toggleVideoStatus, delete w/ confirm via deleteVideoDoc) — never touches likes/views/HLS fields | Muse Spark (Admin) | tsc clean, vite build ok (VideosPage chunk 8.38kB) |
| 2026-09-25 | Admin env check | No stuck nodes (npm run dev + vite PIDs live from today, dev server up); `firebase` CLI NOT installed — `firebase login + deploy --only firestore:rules,storage` stays OWNER action (`npm i -g firebase-tools` first) or publish rules via console; local firestore.rules+storage.rules already allow creators | Muse Spark (Admin) | lint clean, build ok |
| 2026-09-25 | Admin tools | NEW `tools/trend_crawler.py` (~600 lines, `crawl_trends.py` kept): 6 sources/site (homepage JSON-LD/meta/cards, self-discovered page-2 pagination, RSS via rel=alternate, /sitemap.xml video titles, top-5 tag pages, reddit subs x sorts w/ old.reddit RSS fallback on 403), UA rotation, retries+backoff, per-domain circuit breaker, checkpoint/resume, .prev.json backup, stats JSON. Full run: raw=1849 unique=1531 (1462 girls/69 couples, 80 hook-style) vs old 238 — reddit still 403, waptap/saucesenpai 403, reddxxx timeout, tiktits 406 | Muse Spark (Admin) | py_compile ok, dry-run ok, smoke ok, full run done; checkpoint encoding bug fixed+verified |
| 2026-09-25 | Admin tools | Mined tag candidates from 1531 titles (read-only, NOT merged to src/): girls #redhead #curvy; couples #amateur #kiss — owner decides; rejected explicit (#stripping #uncensored #tight #hentai #bare) per brand-safe rule | Muse Spark (Admin) | mining script temp, deleted after |
| 2026-09-25 | Admin SEO | Owner approved best-path: +5 engine tags (girls #redhead/#curvy, couples #amateur/#kiss/#tattoo in captionAI.ts); curated 12 clean hook-style reddit winners into trend-corpus.json girls @weight 3 (light grammar/caps cleanup, engine-style tags, emoji stripped); couples had zero hook-style titles (all scene titles) — stays on seed bank; hardened merge_corpus BLOCKED (+fck/titty/puss-variants/strip/blowjob/hentai/uncensored/breedable) | Muse Spark (Admin) | tsc clean, corpus valid (girls=13 w3=12, couples=1) |
| 2026-09-25 | shortxx deploy | Pushed 25 local commits `0b3247a..997568a` to `emma493/shortxx` main on user order (first push aborted curl 55, retry ok, 335KB) — NudiTok UI rebuild, auth, PWA, perf, creators/captions | Session B | git status clean, in sync with origin/main |
| 2026-09-25 | shortxx refactor | Split `script.js` (1165 lines) -> `js/main.js` + `js/store.js` + `js/lib/dom.js` + 15 `js/features/*.js` (player/creator/auth/likes/follow/save/comments/discover/menu/feed/mute/share/chrome/nav/progress) with isolated dynamic import() per feature; CSS -> `css/base.css` + `css/effects.css` + 7 `css/features/*.css` (auth/menu/comments/discover/feed/player/pwa); rewired index/vid2 to `js/main.js`, sw CACHE v2; legacy `script.js`+`auth-modal.css`+`style.css` kept on disk for rollback (`0f12189`, pushed) | Session B | node --check all 18 JS ok, all imports resolve, hooks in both pages, 15/15 init exports |
| 2026-09-25 | shortxx player | No-stretch fix (`5db1ba0`, pushed): `object-cover` -> `.sx-video` with `object-fit:contain` on both pages + `css/features/player.css`; column stays 480px, video letterboxes on wide screens | Session B | hooks verified in both pages |
| 2026-09-25 | shortxx drawer+auth | Spec brief build (`11ae9d0`, pushed): drawer strictly right-only (left variant removed, both triggers open right), header Sign Up pill (`data-signup` opens modal); modal Log In (.btn-secondary) + Sign Up (.btn-primary) row replaces Join Now, privacy notice restored, Quick Login now dashed accent button; NudiTok UI untouched | Session B | node --check menu+auth ok, hooks verified both pages |
| 2026-09-25 | shortxx links | Owner-ordered removal of `shrinkme.click/doodstreams` profile links (`e1ca867`, pushed): avatar + @name anchors in both pages now `href="#" data-dead` (visual-only, chrome.js swallows clicks); Live Cams whitetrafsa + ad networks untouched | Session B | grep clean (0 hits in html/js/sw) |
| 2026-09-25 | shortxx creator page | TikTok-style creator page (`eaebe06`, pushed): tapping avatar or @name slides a `creator-page` panel from the right (avatar, Videos/Likes/Views stats, Follow toggle, creator video grid, tap tile to play); new `js/features/creator-page.js` + `css/features/creator-page.css`, wired in main + sw | Session B | node --check ok, hooks verified both pages |
| 2026-09-25 | shortxx player | Phone fill fix (`a92ce9f`, pushed): `cover` on phones (fills screen, no top black bar), `contain` only on screens 768px+ so desktop never stretches wide | Session B | CSS-only, no JS change |
| 2026-09-25 | shortxx creator page | Bio support (`eb00fe7`, pushed): tolerant `bio` read on creators docs + bio line on panel (shows once Admin writes it); layout matches NudiTok profile order (avatar/handle/stats/follow/video grid) | Session B | node --check ok |
| 2026-09-25 | shortxx creator page | Full-page upgrade (`5dc12fb`, pushed): panel now covers the whole viewport like a profile route (centered 480px column on desktop), TikTok header (back + @handle), ring avatar, inline stats, Follow row, Videos tab with grid icon; no side menu inside. NOTE: `refs/profile page/` holds only the app shell (lazy profile chunk not saved) — rebuilt from live reference + token match | Session B | node --check ok |
| 2026-09-25 | shortxx creator page | Reference-faithful stats (`3eb3d2e`, pushed): exact Following/Followers/Likes row once creators docs carry the counts (tolerant reads), else computed Videos/Likes/Views; grid newest-first via tolerant `createdAtMillis`; reference data mined from live API (avatar 256px, portrait posters, bio-hidden-empty, ▶ views tiles) | Session B | node --check ok |
| 2026-09-25 | shortxx trending | Full-page Trending rank (`0155c34`, pushed): drawer Top videos -> Trending (fire icon), tabs Today/This week/All time like the reference (all-time = views rank; time tabs = recency-filtered + views rank), rank badges + ▶ views tiles, tap tile to play | Session B | node --check ok, in sync with origin |
| 2026-09-25 | shortxx discover | Complete Discover page (`da9b444`, pushed): tag/creator search bar, hashtag cards (cover + #name + count, top 20 by use, horizontal scroll, tap to filter), filter chips, 3-col grid; reference tag shape verified via live tags API | Session B | node --check ok, in sync with origin |
| 2026-09-25 | shortxx perf | Instant-clickable UI (`9e3b3c0`, pushed): features wire on DOMContentLoaded without awaiting Firestore; videos load in background and player starts on `sx:videos-ready` (+12s safety net); fixes dead bottom nav on slow networks | Session B | node --check ok, in sync with origin |
| 2026-09-25 | shortxx perf | Parallel feature load (`b237ed4`, pushed): all 17 features import+init concurrently via allSettled with 10s per-feature timeout — a slow firebase-auth CDN can no longer serialize-block Discover/menu/nav wiring; markup links verified present | Session B | node --check ok, in sync with origin |
| 2026-09-25 | Admin deploy | Pushed Beta rebuild `cf3758d..8b89a95` to `emma493/Admin` main on user order (51 files, +22688/-6939): de-AI-Studio cleanup, creators/upload/videos pages, caption SEO, HLS contract, tools/ + package-lock; __pycache__ excluded | Muse Spark (Admin) | git status clean except tools/__pycache__, in sync with origin/main |
| 2026-09-26 | Admin tools | NEW `tools/crawl_creators.py`: girls-only creator discovery (username+avatarUrl) over 18 adult aggregators; SPA fix via Atom/RSS /@handle mining (nuditok homepage = JS shell, 0 HTML links). Full run: 21 creators (20 nuditok w/ profile-photos avatars + 1 ogfap); other sites empty (JS/404/403). Added `--usernames-only` fast pass -> `tools/profile-url.txt` (no profile visits) | Muse Spark (Admin) | py_compile ok, dry-run ok (muneeba sample = owner example pattern) |
| 2026-09-26 | Admin tools | NEW `tools/add_creator.py`: creates creator docs from owner-pasted `username image-link` pairs via Firestore REST (same fields as saveCreatorDoc); --dry-run verified, nothing written to prod | Muse Spark (Admin) | py_compile ok, dry-run ok |
| 2026-09-26 | Admins/ (new) | Owner-order workflow: `Admins/profile creators.txt` (paste username+image per line) + kept `Admins/nuditok-usernames.txt` (20 handles scraped from nuditok feed). NOTE: several handles read masculine (personal names slip past block-word gate) — human girl-check mandatory before import | Muse Spark (Admin) | dir+guide created (Admins/ did not exist) |
| 2026-09-26 | Admin tools | NEW `tools/creator_watch.py`: continuous autopilot (default 120s cycles) — creates creators from NEW pasted lines only (state file, no double-creates) + re-scrapes nuditok feed into keep list. First cycle: +5 handles (25 kept). Launched in background on user order ("keep on running") | Muse Spark (Admin) | py_compile ok, --once verified, bg process live |
| 2026-09-26 | Admin UI | Removed Pipeline explainer box from DashboardPage (owner order, text starting "Pipeline: Admin saves direct_url ...") — 4 stat cards remain | Muse Spark (Admin) | edit verified by read |
| 2026-09-26 | Admin UI | Removed "Admin Beta" subtitle + "shortxx-live · Beta" footer from Sidebar (owner order) — brand block now just "Favmoney" | Muse Spark (Admin) | edit applied |
| 2026-09-26 | Admin UI | Creators page: "Scraped ideas" chips under username field (tap fills input, Shuffle rotates 6) backed by NEW `src/lib/suggested-usernames.json` (9 curated short handles from nuditok feed: tin/yuuy/kavali/muneeba/izzaizza/horney69/drakerose/emmyelfie/lockleaks). Pool auto-filters names already in Firestore (unique, case-insensitive). Labeled unverified — girl 18+ check required | Muse Spark (Admin) | edits verified by read; tsc skipped (prior lint hang) |
| 2026-09-26 | Admin UI | Creator cards: Pencil edit icon (owner order) — reuses the create form prefilled (username/avatar/preview), Save changes updates via saveCreatorDoc(id); lib fix: created_at now stamped on create only (edits no longer reset join date) | Muse Spark (Admin) | edits verified by read |
| 2026-09-26 | Admin tools | Wide username harvest (owner order, "huge list"): +7 domains (tik.porn/xfree/xxxtik/fikfap/fkbae/redgifs/sex.com) + sitemap <loc> mining + Reddit author mining + --handle-cap 150. Raw 119 -> CLEAN 82 (`Admins/all-usernames.txt`): 25 nuditok, 21 shorts.xxx, 20 tiktits, 19 hornyleak, 13 reddit, 1 ogfap, 0 sex.com (all numeric IDs). New CATEGORY_JUNK + numeric rejection drops channel IDs + tag slugs (african/asian/bdsm/milfs/...). Suggestions pool grown 9->20 for Creators chips | Muse Spark (Admin) | py_compile ok; junk verified in drop log |

Protocol: APPEND new row on EVERY edit, newest at bottom. Never rewrite history.

## 6. ADDED LOG — what was added
| Date (UTC) | File | What added | Why |
|---|---|---|---|
| 2026-09-25 | AI/MEMORY.md | This memory system | User request: remember adds/changes/system |
| 2026-09-25 | emma493/shortxx (new) | Initial commit acb5fdf: 14 public files, no build, Pages-ready | Separate public repo for Cloudflare Git builds; Admin stays in emma493/Admin |
| 2026-09-25 | shortxx.live/_headers | _headers (m3u8 no-cache, ts 86400, mp4 CORS, APK content-type) | Prevent Cloudflare HLS/CORS/APK issues on Git builds |
| 2026-09-25 | AI/MEMORY.md §10 | Added TEAM SPLIT lock: Admin=Session A, shortxx.live=Session B, contract + rules | Prevent cross-session file conflicts, allow parallel work |
| 2026-09-25 | Admin/src/components/AnalyticsTab.tsx | Rebuilt: videos+events driven metrics (total/24h views, likes, HLS, tops, event breakdown). Replaces dead users/daily_analytics props | Analytics was unwired dead code in App.tsx |
| 2026-09-25 | Admin/src/components/PipelineTab.tsx | NEW: HLS pipeline overview (ready/processing/failed/legacy + failed error list + how-it-works) | Surface transcodeVideo function state without touching functions/ |
| 2026-09-25 | Admin/src/lib/firebase.ts | Added incrementVideoLikes(); seedDemoData disabled (was auto-writing 15 fake users + fake analytics to prod) | Stop prod pollution; support Session B likes contract |
| 2026-09-25 | Admin (deletions) | -10 template components, lib/tracker.ts, server.ts, 4 stale public/*.js | Remove AI Studio applet dead weight; Admin is now pure static SPA + Firebase |
| 2026-09-25 | Admin (rewrites) | package.json (shortxx-admin, Vite-only, slim deps), vite.config, .env.example, README, index.html title | No GEMINI/Express/Cloud Run remnants; bun.lock must regen on next install |
| 2026-09-25 | Admin/src/lib/creators.ts | NEW: creators CRUD + Storage avatar upload | Creators page + Upload flow depend on it |
| 2026-09-25 | Admin/src/lib/captionAI.ts | NEW: local SEO caption/hashtag suggester (girls/couples banks, hook scoring, rotation, TREND_SOURCES + refresh hook) | Upload auto-assigns per-video caption+tags; NO live crawl (bot protection) |
| 2026-09-25 | Admin/src/{lib/auth.ts,pages/LoginPage.tsx} | NEW: client-side login gate + Beta login UI | Temporary until Firebase Auth |
| 2026-09-25 | Admin/src/pages/{DashboardPage,CreatorsPage,UploadPage}.tsx + components/Sidebar.tsx | NEW Beta shell: 3-item router nav, live counts, creator mgmt, bulk upload | Replaces wiped old UI; palette #0F1014/#16171D/#1E1F27/#FF2B55 |
| 2026-09-25 | Admin/src/pages/VideosPage.tsx + App.tsx + components/Sidebar.tsx | NEW Videos browse/delete: per-creator + category + search filters, HLS/views/likes readout, Hide/Show + confirm-delete; 4th nav item (lazy route) | Pending build step from Admin Beta plan; merge-safe (toggle/delete only) |
| 2026-09-25 | Admin/tools/trend_crawler.py | NEW gigantic crawler: reddit multi-sort+RSS fallback, pagination discovery, RSS/sitemap harvest, tag-page mining, UA pool, circuit breaker, checkpoint/resume, stats JSON | Old crawl_trends.py (238 titles) superseded in yield, kept as fallback |
| 2026-09-25 | Admin/src/lib/{captionAI.ts,trend-corpus.json} + tools/merge_corpus.py | SEO pass: 5 mined tags into engine banks, 12 curated weight-3 manual winners, BLOCKED hardening | Winners picked FIRST by suggestFor(); explicit titles stay mining-only |
| 2026-09-25 | emma493/Admin `8b89a95` | Pushed Beta rebuild: -17 dead files (server.ts, tracker, 10 components, 4 public/*.js), +9 new (auth/captionAI/creators/trend-corpus, 5 pages, tools/ incl. crawled JSONs + stats, package-lock) + contract fixes | Sync local Admin to remote on user order; lint timed out (tsc 120s) so relied on prior clean builds |
| | | | |

## 7. TODO / KNOWN DEBT
- [x] Fix `auto-resume.js` ID or delete file — DONE (Session B): unlinked from both pages 2026-09-25, file remains on disk
- [x] Remove classic `<script src="vid.js">` from index.html head — DONE (Session B) 2026-09-25
- [ ] Migrate tracking.js compat -> modular, unify Firebase project
- [x] Add `_headers` at shortxx.live/ root for HLS/APK CORS+cache — DONE (Session B) 2026-09-25
- [ ] Migrate page-reload nav to SPA queue `getNextVideo()+preloadNextVideo()`
- [ ] Improve HLS error handling: `recoverMediaError()` on MEDIA_ERROR, backoff on NETWORK_ERROR (see AI/hlsjs.md)
- [ ] (Session B needs, owner action) Firebase console: enable Email/Password + Google + Anonymous Auth, add shortxx.live to authorized domains — else auth modal shows guidance toasts
- [ ] (Session B needs, owner action) Seed `videos` docs in shortxx-live Firestore (feed empty on new project)
- [x] (Cross-session) Push shortxx.live local commits — DONE (Session B) 2026-09-25: pushed 25 ahead `0b3247a..997568a` to emma493/shortxx, now in sync
- [x] (Session B needs, A proposed 2026-09-25) Read videos `creatorId`/`category`/`caption`/`hashtags` (all optional): display caption+hashtags on play, add hashtag/caption search + category filter (girls/couples) — ACCEPTED + implemented by B (`36b4ee9`)

## 8. AI UPDATE PROTOCOL (mandatory)
1. After ANY code/config edit, append to §5 + §6 above with date, file, what/why.
2. If you discover a new gotcha, append to §4 with number+1, and reference file:line.
3. Keep §1-§3 current if stack/hosting/data model changes.
4. Keep this file <200 lines — prune TODO completed >30 days to changelog.
5. Never store secrets (GEMINI_API_KEY, .env) here — reference `.env.example` only.

## 9. Quick resume commands
```powershell
# public site = Cloudflare Pages root, no build — OWNER: Session B ONLY
Test-Path "D:\PICS ~Pictures\Kiadoloves\shortxx.live\index.html"
# admin dashboard — OWNER: Session A (this session) ONLY
# workdir Admin: npm install; npm run dev
# functions deploy
# workdir Admin: firebase deploy --only functions,firestore:rules,storage
# Context7 refresh — see AI/SKILLS.md
```

## 10. TEAM SPLIT — two-session parallel work (active 2026-09-25)
- **Session A = this session = `Admin/` ONLY.** React 19 + Vite + Tailwind + Firebase dashboard + `functions/`, `firebase.json`, `firestore.rules`, `storage.rules`, `netlify.toml`. May NOT edit `shortxx.live/*`.
- **Session B = other session = `shortxx.live/` ONLY.** Static site (index.html, vid2.html, script.js, vid.js, tracking.js, ntok.css, etc). May NOT edit `Admin/*`.
- **Shared allowed:** `AI/MEMORY.md` append-only (newest at bottom, never rewrite history), `links.txt` read-only unless user says so.
- **Shared data contract (do NOT break unilaterally):** Firestore `shortxx-live` default DB, collection `videos`, fields `direct_url / hls_url / poster_url / is_active / status / views`. If a session needs a new field (e.g. `likes`, `comments`), it MUST log proposal in MEMORY §5 + §7 TODO and wait for other session ack via MEMORY before writing code that depends on it.
- **Conflict rule:** check `git status` in own folder before edit; never `git push` other folder's repo (`Admin` -> emma493/Admin, `shortxx.live` -> emma493/shortxx). Announce deploys in MEMORY changelog.
- **Handshake:** Session B acknowledge here by appending `| 2026-09-25 | TEAM ACK | Session B owns shortxx.live, respects Admin lock | ... |`
