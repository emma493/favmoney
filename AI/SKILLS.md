# AI Skills Index — shortxx.live (mobile-first short video)

This folder holds agent memory + skills. Source code stays at project root for Cloudflare Pages.

## Core stack
- `hlsjs.md` — HLS.js v1 lifecycle: destroy, recoverMediaError, native fallback, mobile buffering. LibraryID `/video-dev/hls.js`
- `firebase-firestore.md` — Firestore modular v10: collection, where(is_active), getDocs, named database. LibraryID `/firebase/firebase-js-sdk`
- `cloudflare-pages.md` — Pages deploy + Namecheap custom domain + headers for HLS/APK. LibraryID `/websites/developers_cloudflare_pages`
- `mobile-video-playbook.md` — 9:16, 100dvh, muted autoplay, gesture navigation, WebView quirks specific to this project

## Context7 refresh
```sh
curl.exe -s "https://context7.com/api/v2/context?libraryId=/video-dev/hls.js&query=YOUR_TOPIC&type=txt"
curl.exe -s "https://context7.com/api/v2/context?libraryId=/firebase/firebase-js-sdk&query=YOUR_TOPIC&type=txt"
curl.exe -s "https://context7.com/api/v2/context?libraryId=/websites/developers_cloudflare_pages&query=YOUR_TOPIC&type=txt"
```

## Project truths (don't re-break)
- Video fields are `direct_url / hls_url / poster_url / is_active / status`, NOT `url / hlsUrl` from brief.
- `vid.js` must load as ES module only. Classic `<script src="vid.js">` throws.
- `tracking.js` + `vid.js` both on `shortxx-live` default DB since 2026-09-25 — still unify compat->modular before touching views.
- `#wa-popup-overlay` does not exist in DOM — WhatsApp engine is dead.
- `auto-resume.js` targets `#stream-video`, real ID is `#main-video`.
- Navigation is page-reload `index.html <-> vid2.html`, not SPA queue.
