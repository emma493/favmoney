# Firebase Firestore — shortxx.live data layer

Library: `/firebase/firebase-js-sdk` (modular v12.19.0 in vid.js, compat v12.19.0 in tracking.js — unify to modular).

Project: `shortxx-live` (default Firestore database, default Storage bucket `shortxx-live.firebasestorage.app`). Old named DB `ai-studio-...` retired 2026-09-25.

## Current truth
```js
import { getFirestore, collection, getDocs, query, where } from "firebase-firestore.js";
const db = getFirestore(app); // default DB on shortxx-live
const q = query(collection(db, "videos"), where("is_active", "==", true));
const snap = await getDocs(q);
// map: { id: doc.id, url: data.direct_url, hlsUrl: data.status==='ready'?data.hls_url:null, posterUrl: data.poster_url }
```

## Rules
- Only trust `hls_url` when `status === 'ready'`, else use `direct_url`.
- Views: `update({ views: increment(1), last_viewed: serverTimestamp() })` + `events.add({ event_type:'video_view', video_id, device_type, country:'GH' })` — see tracking.js.
- Don't mix compat `firebase.firestore()` and modular `getFirestore()` on same page — causes double init. Migrate tracking.js to modular.
- `vid.js` must NOT be loaded via classic script tag — ES `import` only. Remove `<script src="vid.js">` from head, keep `import ... from "./vid.js"` in script.js.

Source: Context7 `/firebase/firebase-js-sdk`, fetched 2026-09-25.
