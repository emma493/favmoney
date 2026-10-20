# HLS.js — mobile playbook for shortxx.live

Library: `/video-dev/hls.js` — 15574 stars, HLS via MediaSource Extensions.

## What we use
- `Hls.isSupported()` → use hls.js, else `video.canPlayType('application/vnd.apple.mpegurl')` native (Safari iOS), else direct `.mp4`.
- Config for shorts: `new Hls({ maxBufferLength: 15, startLevel: -1 })` — low memory, auto quality.
- MUST destroy before re-attach: `activeHls.destroy(); activeHls = null` — else worker + MSE leak on every swipe.

## Error handling (improved over current script.js)
Current code destroys on any fatal and falls back to mp4. Better:
```js
hls.on(Hls.Events.ERROR, (evt, data) => {
  if (!data.fatal) return;
  if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
  else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { /* retry with backoff, don't loop */ }
  else { hls.destroy(); video.src = directUrl; }
});
video.addEventListener('error', () => {
  if (video.error?.code === MediaError.MEDIA_ERR_DECODE) hls.recoverMediaError();
});
```

## Native fallback snippet
```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
<script>
if (video.canPlayType('application/vnd.apple.mpegurl') && 'ManagedMediaSource' in window) {
  video.src = hlsUrl;
} else if (Hls.isSupported()) {
  const hls = new Hls(); hls.loadSource(hlsUrl); hls.attachMedia(video);
}
</script>
```

Source: Context7 `/video-dev/hls.js` — API.md + README, fetched 2026-09-25.
