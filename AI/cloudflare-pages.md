# Cloudflare Pages + Namecheap — shortxx.live hosting

Library: `/websites/developers_cloudflare_pages`

## Current setup
- Static output = project root (`index.html`, `vid2.html`, `style.css`, `script.js`, `vid.js`, images). No build step.
- Deploy: `wrangler pages deploy . --project-name=shortxx` or Git-connected Pages project.
- Custom domain from Namecheap: Pages → Custom domains → add `shortxx.live` → Cloudflare gives CNAME → add CNAME `@` / `www` in Namecheap DNS. Use proxied (orange cloud) if DNS moved to Cloudflare, else DNS-only still works but branch alias defaults to production.

## Headers you need (for HLS + APK + video)
Add `_headers` file at root (do NOT put in AI/):
```
/*.m3u8
  Access-Control-Allow-Origin: *
  Cache-Control: no-cache
/*.ts
  Access-Control-Allow-Origin: *
  Cache-Control: max-age=86400
/*.mp4
  Access-Control-Allow-Origin: *
/Shortxx.apk
  Content-Type: application/vnd.android.package-archive
```

## Notes
- Videos stay in Firebase Storage / CDN, not Pages — Pages is HTML/CSS/JS only.
- Adsterra scripts require `https://` — already satisfied by Pages.

Source: Context7 Cloudflare Pages docs, fetched 2026-09-25.
