/* ═══════════════════════════════════════════════════════
   Terry Sanford Softball — App Page Script
   App-specific interactions: scoring ring animation,
   stat count-ups, store button states.
═══════════════════════════════════════════════════════ */

"use strict";

/* ── PWA install/download flow ── */
(function initPwaInstall() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" }).catch(() => {});
    });
  }

  let deferredPrompt = null;
  const installButtons = document.querySelectorAll(".js-install-app");
  const iosHelpButtons = document.querySelectorAll(".js-ios-help");
  const status = document.getElementById("installStatus");
  const help = document.getElementById("installHelp");
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function showHelp(platform) {
    if (help) help.scrollIntoView({ behavior: "smooth", block: "center" });
    if (platform === "ios") {
      setStatus("On iPhone: Safari Share button, then Add to Home Screen.");
    } else {
      setStatus("On Android: use Chrome's install prompt or browser menu, then Install App.");
    }
  }

  if (isStandalone) {
    setStatus("TS Softball is already installed on this device.");
    installButtons.forEach(btn => { btn.disabled = true; });
    return;
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;
    setStatus("Install is ready. Tap Install App to add TS Softball to your home screen.");
  });

  installButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (isIOS) {
        showHelp("ios");
        return;
      }
      if (!deferredPrompt) {
        showHelp("android");
        return;
      }
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      setStatus(choice?.outcome === "accepted" ? "TS Softball install started." : "Install dismissed. You can try again from your browser menu.");
    });
  });

  iosHelpButtons.forEach(btn => {
    btn.addEventListener("click", () => showHelp("ios"));
  });

  window.addEventListener("appinstalled", () => {
    setStatus("TS Softball was installed successfully.");
    installButtons.forEach(btn => { btn.disabled = true; });
  });
})();

/* ── App hero scoring ring animation ── */
(function initHeroRing() {
  const fill = document.getElementById("heroRingFill");
  if (!fill) return;

  // Circumference = 2π × 80 ≈ 503
  const circumference = 503;
  // Show .312 AVG as 62% ring fill (relative to .500 max)
  const pct = 0.312 / 0.500;
  const targetOffset = circumference * (1 - Math.min(pct, 1));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();

    if (prefersReduced) {
      fill.style.strokeDashoffset = targetOffset;
      return;
    }

    // Animate after brief delay
    setTimeout(() => {
      fill.style.strokeDashoffset = targetOffset;
    }, 400);
  }, { threshold: 0.5 });

  const ring = fill.closest(".aps-ring-wrap");
  if (ring) io.observe(ring);
})();

/* ── App page stat count-ups ── */
(function initAppStats() {
  const els = document.querySelectorAll("[data-app-count]");
  if (!els.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.appCount, 10);
      io.unobserve(el);

      if (prefersReduced) { el.textContent = target; return; }

      let current = 0;
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
})();

/* ── Onboarding step hover enhancement ── */
(function initOnboardingSteps() {
  const steps = document.querySelectorAll(".ob-content");
  if (!steps.length) return;

  steps.forEach((step, i) => {
    const num = step.closest(".ob-step")?.querySelector(".ob-num");
    if (!num) return;

    step.addEventListener("mouseenter", () => {
      num.style.color = "rgba(213, 0, 70, 0.7)";
      num.style.transform = "scale(1.05)";
      num.style.transition = "all 280ms ease";
    });

    step.addEventListener("mouseleave", () => {
      num.style.color = "";
      num.style.transform = "";
    });
  });
})();

/* ── Feature card keyboard navigation ── */
(function initFeatureCards() {
  const cards = document.querySelectorAll(".feature-card, .uvp-pillar");
  cards.forEach(card => {
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        const link = card.querySelector("a");
        if (link) link.click();
      }
    });
  });
})();
