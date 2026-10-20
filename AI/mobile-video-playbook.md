# Mobile video playbook — shortxx.live

## Layout
- 9:16 full-screen: `.video-container { width:100vw; height:100dvh }` — use `dvh` not `vh` for mobile URL bar. Desktop: `aspect-ratio:9/16; height:100vh` centered.
- `object-fit:cover`, `overflow:hidden`, `user-select:none` on body.

## Autoplay (biggest mobile pain)
- Chrome/Safari allow muted autoplay with zero gesture. Android WebView blocks even muted `play()` until first touch unless native `setMediaPlaybackRequiresUserGesture(false)`.
- Current fix `app-mode.js`: detect WebView (`; wv)`, stripped Chrome UA, `?app=1`) → unlock on first `touchstart/pointerdown/click` (capture, once). Leave normal browsers untouched.
- `auto-resume.js` is dead — targets `#stream-video`, real is `#main-video`. Fix ID or delete file before it confuses next agent.

## Gestures
- Swipe >50px vertical, wheel DeltaY>30, ArrowUp/Down → `data-next / data-prev` page change. Current = full reload (slow). Better version = single-page queue with `getNextVideo()` + `preloadNextVideo()` + swipe transform, no reload.
- Double-tap <300ms → big heart at `clientX/clientY` + like toggle. Single tap → play if paused + `fa-play` flash.

## Persistence keys
- `videoMuted`, `whatsappJoined`, `waDailyIgnores`, `waLastDate`, `hasSeenSwipeTutorial`, `currentVideoIndex` (localStorage) + `waPageViews`, `waTargetViews`, `waMaxLimit`, `lastPlayedVideoId/Url` (sessionStorage).

## Monetization guard
- All `shrinkme.click`, Adsterra, `effectivecpmnetwork`, `highperformanceformat` links intentionally open in `_blank` via window.open override. Don't remove without owner approval — it's revenue.
