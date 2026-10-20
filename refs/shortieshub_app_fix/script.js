import { loadVideosFromFirestore, getNextVideo } from "./vid.js";

// Tracks the hls.js instance currently attached to the player, if any, so
// it can be torn down before the next video attaches - without this, each
// video switch would leak another MediaSource/worker and this page (which
// loops through many videos per session) would slowly eat memory.
let activeHls = null;

// The original, always-directly-playable source for whatever video is
// currently loaded (i.e. direct_url, never the HLS manifest). Buttons like
// "download" and "open in new tab" must use this instead of
// `videoElement.src` - under hls.js, `.src` becomes a `blob:` MediaSource
// object URL that isn't a fetchable/downloadable file.
let currentVideoDirectUrl = "";

/**
 * Plays the next available video stream fetched from Admin. Prefers the
 * HLS manifest (adaptive bitrate via hls.js) when the admin dashboard's
 * transcode pipeline has finished processing this video; otherwise falls
 * back to the original direct_url exactly as before - nothing changes for
 * videos that haven't been through the pipeline yet.
 */
function playNextVideo(videoElement) {
  const videoData = getNextVideo();
  if (!videoData || !videoElement) return;

  const isLegacyString = typeof videoData === "string";
  currentVideoDirectUrl = isLegacyString ? videoData : videoData.url;

  // Track the currently playing video in sessionStorage so ads.html or other components can read it
  if (!isLegacyString && videoData.id) {
    sessionStorage.setItem("lastPlayedVideoId", videoData.id);
  }
  sessionStorage.setItem("lastPlayedVideoUrl", currentVideoDirectUrl);

  // Disable native remote playback (AirPlay, Cast) programmatically
  videoElement.disableRemotePlayback = true;
  videoElement.setAttribute("disableremoteplayback", "true");
  videoElement.setAttribute("x-webkit-airplay", "deny");
  if ("webkitAllowsAirPlay" in videoElement)
    videoElement.webkitAllowsAirPlay = false;
  if (videoElement.remote) videoElement.remote.disableRemotePlayback = true;

  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }

  const hlsUrl = !isLegacyString ? videoData.hlsUrl : null;
  const posterUrl = !isLegacyString ? videoData.posterUrl : null;
  videoElement.poster = posterUrl || "";

  const canUseHlsJs = hlsUrl && window.Hls && window.Hls.isSupported();
  const canUseNativeHls =
    hlsUrl && videoElement.canPlayType("application/vnd.apple.mpegurl");

  const attemptPlay = () => {
    const playPromise = videoElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn(
          "Autoplay fallback triggered due to browser policy:",
          error,
        );
        videoElement.muted = true;
        videoElement.play().catch(() => {});
      });
    }
  };

  if (canUseHlsJs) {
    activeHls = new window.Hls({
      maxBufferLength: 15, // short clips don't need a deep buffer
      startLevel: -1, // let ABR pick the first rendition
    });
    activeHls.loadSource(hlsUrl);
    activeHls.attachMedia(videoElement);
    activeHls.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
    activeHls.on(window.Hls.Events.ERROR, (_evt, data) => {
      if (!data.fatal) return;
      console.warn("hls.js fatal error, falling back to direct_url:", data);
      if (activeHls) {
        activeHls.destroy();
        activeHls = null;
      }
      videoElement.src = currentVideoDirectUrl;
      videoElement.load();
      attemptPlay();
    });
  } else if (canUseNativeHls) {
    videoElement.src = hlsUrl;
    videoElement.load();
    attemptPlay();
  } else {
    videoElement.src = currentVideoDirectUrl;
    videoElement.load();
    attemptPlay();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // --- 1. Firestore Video Fetching & Preload ---
  await loadVideosFromFirestore();

  const video = document.querySelector("video");
  const videoContainer = document.querySelector(".video-container");

  if (video) {
    playNextVideo(video);
  }

  // --- 2. Element Selectors ---
  const likeBtn = document.querySelector(".like-btn");
  const muteBtn = document.querySelector(".mute-btn");
  const downloadBtn = document.querySelector(".download-btn");
  const loader = document.querySelector(".loader");

  // --- 3. Display Random Usernames ---
  const usernames = [
    "LilyGrace",
    "AvaRose",
    "EmmaBelle",
    "SophiaMae",
    "IsabellaJoy",
    "MiaHope",
    "CharlotteSky",
    "AmeliaDawn",
    "HarperLee",
    "EvelynRose",
    "AbigailStar",
    "EmilyBloom",
    "EllaJune",
    "ScarlettRay",
    "GraceLynn",
    "ChloeKate",
    "PenelopeSue",
    "LaylaJo",
    "RileyQuinn",
    "ZoeyAnn",
    "NoraJane",
    "LilyPearl",
  ];
  const userNameElement = document.querySelector(".dynamic-username");
  if (userNameElement) {
    const randomName = usernames[Math.floor(Math.random() * usernames.length)];
    userNameElement.textContent = randomName;
  }

  // --- 4. Display Random Likes Count ---
  const likeCountElement = document.querySelector(".like-count");
  if (likeCountElement) {
    const randomLikes = (Math.random() * 98 + 1).toFixed(1) + "K";
    likeCountElement.textContent = randomLikes;
  }

  // --- 5. Video Loader Handling ---
  if (video && loader) {
    video.addEventListener("waiting", () => (loader.style.display = "block"));
    video.addEventListener("playing", () => (loader.style.display = "none"));
    video.addEventListener("canplay", () => (loader.style.display = "none"));
    if (video.readyState >= 3) loader.style.display = "none";
  }

  // --- 6. Double Tap & Like Logic ---
  let lastTap = 0;
  const bigHeart = document.createElement("i");
  bigHeart.className = "fas fa-heart big-heart";
  if (videoContainer) videoContainer.appendChild(bigHeart);

  const toggleLike = () => {
    if (!likeBtn) return;
    likeBtn.classList.toggle("liked");
    const icon = likeBtn.querySelector("i");
    if (icon) {
      icon.classList.remove("animate-pop");
      void icon.offsetWidth;
      icon.classList.add("animate-pop");
    }
  };

  const showBigHeart = (x, y) => {
    bigHeart.style.left = `${x}px`;
    bigHeart.style.top = `${y}px`;
    bigHeart.classList.remove("active");
    void bigHeart.offsetWidth;
    bigHeart.classList.add("active");
    if (likeBtn && !likeBtn.classList.contains("liked")) {
      toggleLike();
    }
  };

  if (likeBtn) {
    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLike();
    });
  }

  // --- 7. Mute / Unmute Logic ---
  function updateMuteUI(muted) {
    if (!video) return;
    video.muted = muted;
    if (muteBtn) {
      const icon = muteBtn.querySelector("i");
      if (muted) {
        if (icon) icon.className = "fas fa-volume-mute animate-pop";
        muteBtn.style.opacity = "0.5";
      } else {
        if (icon) icon.className = "fas fa-volume-up animate-pop";
        muteBtn.style.opacity = "1";
      }
    }
  }

  function toggleAudio() {
    if (!video) return;
    const nextState = !video.muted;
    localStorage.setItem("videoMuted", nextState.toString());
    updateMuteUI(nextState);
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }

  const savedAudioPreference = localStorage.getItem("videoMuted");
  if (savedAudioPreference === null) {
    localStorage.setItem("videoMuted", "true");
    updateMuteUI(true);
  } else {
    updateMuteUI(savedAudioPreference === "true");
  }

  // --- 8. Click Video Interaction ---
  if (videoContainer && video) {
    videoContainer.addEventListener("click", (e) => {
      if (
        e.target.closest(".side-bar") ||
        e.target.closest(".video-player-controls") ||
        e.target.closest(".top-nav") ||
        e.target.closest(".bottom-info") ||
        e.target.closest(".wa-overlay") ||
        e.target.closest(".tg-overlay")
      ) {
        return;
      }

      let currentTime = new Date().getTime();
      let tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        showBigHeart(e.clientX, e.clientY);
        lastTap = currentTime;
        return;
      }
      lastTap = currentTime;

      if (video.paused) {
        video.play();
        spawnFeedbackIcon("fa-play");
      }
    });
  }

  function spawnFeedbackIcon(iconClass) {
    if (!videoContainer) return;
    const icon = document.createElement("div");
    icon.className = "feedback-icon";
    icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    videoContainer.appendChild(icon);
    setTimeout(() => icon.remove(), 600);
  }

  // --- 9. Pure Video Download Feature ---
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const icon = downloadBtn.querySelector("i");
      if (icon) {
        icon.classList.add("animate-pop");
        setTimeout(() => icon.classList.remove("animate-pop"), 400);
      }

      const downloadSource = currentVideoDirectUrl || video.src;

      try {
        const response = await fetch(downloadSource);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `video_${new Date().getTime()}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
        window.open(downloadSource, "_blank");
      }
    });
  }

  // --- 10. Navigation, Swipe & Ad Trigger Handling ---
  // --- 10. Navigation, Swipe & Ad Trigger Handling ---
  const nextPage = document.body.dataset.next;
  const prevPage = document.body.dataset.prev;

  const navigateToNext = () => {
    if (!nextPage) return;
    window.location.href = nextPage;
  };

  const navigateToPrev = () => {
    if (prevPage) window.location.href = prevPage;
  };

  // Generates a random integer target between 3 and 5 (inclusive)
  const getRandomAdScrollTarget = () => Math.floor(Math.random() * 3) + 3;

  // Persistent tracking of scroll counts across page transitions via sessionStorage
  let scrollCount = parseInt(sessionStorage.getItem("scrollCount") || "0", 10);
  let targetScrolls = parseInt(
    sessionStorage.getItem("targetScrolls") || getRandomAdScrollTarget(),
    10,
  );
  sessionStorage.setItem("targetScrolls", targetScrolls.toString());

  // Evaluates scroll thresholds on every forward navigation action
  const checkAndTriggerAd = () => {
    scrollCount++;
    sessionStorage.setItem("scrollCount", scrollCount.toString());

    if (scrollCount >= targetScrolls) {
      // Reset scroll counter and set a new random target threshold (3-5) for the next cycle
      sessionStorage.setItem("scrollCount", "0");
      sessionStorage.setItem(
        "targetScrolls",
        getRandomAdScrollTarget().toString(),
      );

      // Redirect user directly to ads.html page
      window.location.href = "ads.html";
      return true;
    }
    return false;
  };

  const handleScrollAction = (isNext) => {
    if (isNext) {
      if (checkAndTriggerAd()) return;
      navigateToNext();
    } else {
      navigateToPrev();
    }
  };

  // Mobile Touch Swipe Handling
  let touchstartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchstartY = e.changedTouches[0].screenY;
  });

  window.addEventListener("touchend", (e) => {
    let touchendY = e.changedTouches[0].screenY;
    if (touchstartY - touchendY > 50) handleScrollAction(true);
    if (touchendY - touchstartY > 50) navigateToPrev();
  });

  // Desktop Mouse Wheel Navigation
  let isScrolling = false;
  window.addEventListener("wheel", (e) => {
    if (isScrolling) return;
    if (e.deltaY > 30) {
      isScrolling = true;
      handleScrollAction(true);
    } else if (e.deltaY < -30) {
      isScrolling = true;
      navigateToPrev();
    }
  });

  // Keyboard Arrow Key Navigation (Desktop)
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      handleScrollAction(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateToPrev();
    }
  });

  // --- 11. Video Progress Bar Controls ---
  const progressBar = document.querySelector(".video-progress-bar");
  const progressFill = document.querySelector(".progress-fill");

  if (video && progressBar && progressFill) {
    video.addEventListener("loadedmetadata", () => {
      progressBar.max = video.duration;
    });

    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const percent = (video.currentTime / video.duration) * 100;
      progressBar.value = video.currentTime;
      progressFill.style.width = percent + "%";
    });

    progressBar.addEventListener("input", () => {
      video.currentTime = progressBar.value;
      const percent = (progressBar.value / progressBar.max) * 100;
      progressFill.style.width = percent + "%";
    });
  }

  // --- 13. Preload ads.html Video in Background ---
  const preloadAdVideo = async () => {
    let adUrl = sessionStorage.getItem("currentAdVideoUrl");

    if (!adUrl) {
      try {
        const response = await fetch("/api/videos/next");
        const data = await response.json();
        if (data && data.video && data.video.direct_url) {
          adUrl = data.video.direct_url;
          sessionStorage.setItem("currentAdVideoUrl", adUrl);
        }
      } catch (err) {
        console.warn("Could not pre-fetch ad URL for preloading:", err);
        return;
      }
    }

    if (adUrl && !window.adPreloadElement) {
      const videoPreloader = document.createElement("video");
      videoPreloader.preload = "auto";
      videoPreloader.src = adUrl;
      videoPreloader.style.display = "none";

      videoPreloader.disableRemotePlayback = true;
      videoPreloader.setAttribute("disableremoteplayback", "true");
      videoPreloader.setAttribute("x-webkit-airplay", "deny");

      document.body.appendChild(videoPreloader);

      window.adPreloadElement = videoPreloader;
      console.log("Ad video preloaded in background:", adUrl);
    }
  };

  preloadAdVideo();

  // --- 14. WhatsApp / Telegram Overlay Tracker ---
  const markWhatsAppJoined = () => {
    localStorage.setItem("whatsappJoined", "true");
  };

  const sidebarWhatsAppBtn =
    document.querySelector(".whatsapp-btn") ||
    document.querySelector(".telegram-btn");
  if (sidebarWhatsAppBtn) {
    sidebarWhatsAppBtn.addEventListener("click", markWhatsAppJoined);
  }

  const hasJoined =
    localStorage.getItem("whatsappJoined") === "true" ||
    localStorage.getItem("telegramJoined") === "true";

  if (!hasJoined) {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("waLastDate");
    if (lastDate !== today) {
      localStorage.setItem("waLastDate", today);
      localStorage.setItem("waDailyIgnores", "0");
    }

    let dailyIgnores = parseInt(
      localStorage.getItem("waDailyIgnores") || "0",
      10,
    );
    let maxDailyLimit = parseInt(
      sessionStorage.getItem("waMaxLimit") || "0",
      10,
    );

    if (!maxDailyLimit) {
      maxDailyLimit = Math.floor(Math.random() * 4) + 3;
      sessionStorage.setItem("waMaxLimit", maxDailyLimit.toString());
    }

    let waPageViews =
      parseInt(sessionStorage.getItem("waPageViews") || "0", 10) + 1;
    sessionStorage.setItem("waPageViews", waPageViews.toString());

    let waTargetViews = parseInt(
      sessionStorage.getItem("waTargetViews") || "0",
      10,
    );
    if (!waTargetViews) {
      waTargetViews = Math.floor(Math.random() * 3) + 3;
      sessionStorage.setItem("waTargetViews", waTargetViews.toString());
    }

    if (dailyIgnores < maxDailyLimit && waPageViews >= waTargetViews) {
      const overlay = id("wa-popup-overlay") || id("tg-popup-overlay");
      const modalBtn = id("wa-modal-join-btn") || id("tg-modal-join-btn");
      const progressFill =
        id("wa-progress-bar-fill") || id("tg-progress-bar-fill");

      function id(e) {
        return document.getElementById(e);
      }

      if (overlay && modalBtn && progressFill) {
        const durationSec = Math.floor(Math.random() * 8) + 5;
        const durationMs = durationSec * 1000;

        overlay.classList.add("active");

        let startTime = null;
        let animationFrame = null;

        const updateProgress = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const remainingPercent = Math.max(
            0,
            100 - (elapsed / durationMs) * 100,
          );

          progressFill.style.width = remainingPercent + "%";

          if (elapsed < durationMs) {
            animationFrame = requestAnimationFrame(updateProgress);
          } else {
            overlay.classList.remove("active");
            dailyIgnores++;
            localStorage.setItem("waDailyIgnores", dailyIgnores.toString());
            sessionStorage.setItem("waPageViews", "0");
            sessionStorage.setItem(
              "waTargetViews",
              (Math.floor(Math.random() * 3) + 3).toString(),
            );
          }
        };

        animationFrame = requestAnimationFrame(updateProgress);

        modalBtn.addEventListener("click", () => {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          markWhatsAppJoined();
          overlay.classList.remove("active");
        });
      }
    }
  }
});
