/* js/features/guide.js — first-visit swipe tutorial. Faithful port of the
 * Tutorial Initializer from refs/shortieshub_app_fix/index.html: same
 * #swipe-tutorial-overlay markup contract (index.html), same 3.5 s
 * auto-dismiss, same dismiss gestures, and the SAME localStorage key
 * (hasSeenSwipeTutorial) so returning visitors who saw the original are
 * never re-prompted. Storage access is guarded: sandboxed WebViews that
 * throw on localStorage simply show the overlay per visit.
 *
 * First-visit sequence: tutorial -> straight into the girls-only For You
 * feed (the default). The tutorial shows once the feed has content on a
 * first visit. */

const FLAG = "hasSeenSwipeTutorial";
const SHOW_DELAY_MS = 400;
const AUTO_DISMISS_MS = 3500;

function seen() {
  try {
    return localStorage.getItem(FLAG);
  } catch (e) {
    return null;
  }
}

function markSeen() {
  try {
    localStorage.setItem(FLAG, "true");
  } catch (e) {}
}

function prefsChosen() {
  try {
    const p = localStorage.getItem("shortxx_pref");
    return p === "girls" || p === "couples" || p === "all";
  } catch (e) {
    return false;
  }
}

export async function init() {
  const overlay = document.getElementById("swipe-tutorial-overlay");
  if (!overlay) return;
  if (seen()) return;

  let timer = 0;
  let shown = false;

  const dismiss = () => {
    if (!overlay.classList.contains("active")) return;
    overlay.classList.remove("active");
    clearTimeout(timer);
    markSeen();
    // Feed already defaults to For You — no forced menu; the user can
    // switch via the feed button whenever they want.
  };

  const show = () => {
    if (shown || seen()) return;
    shown = true;
    setTimeout(() => {
      overlay.classList.add("active");
    }, SHOW_DELAY_MS);
    timer = setTimeout(dismiss, SHOW_DELAY_MS + AUTO_DISMISS_MS);
  };

  const handleAction = () => {
    dismiss();
  };

  overlay.addEventListener("touchstart", handleAction, { passive: true });
  overlay.addEventListener("click", handleAction);
  window.addEventListener("wheel", handleAction, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") handleAction();
  });

  // No preferences popup anymore: show the swipe tutorial once the feed has
  // content on first visit.
  window.addEventListener("sx:videos-ready", () => {
    try {
      if (seen()) return;
      show();
    } catch (e) {}
  });
}
