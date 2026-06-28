import { useEffect } from "react";

/**
 * ThreatWatch Scroll Animations — 4 effects, zero deps
 *
 * 1. Slide-in reveal   → .scroll-reveal   (panels, cards, rows)
 * 2. Counter roll      → .scroll-counter  (stat numbers)
 * 3. Scan line reveal  → .scroll-scan     (glass-panel sections)
 * 4. Score bar grow    → .scroll-bar      (score/risk bars)
 *
 * Just add the class to any element — the hook handles the rest.
 * Re-scans every 800ms to catch React re-renders.
 */
export function useScrollAnimations() {
  useEffect(() => {

    // ── 1. SLIDE-IN REVEAL ───────────────────────────────────────
    // Targets: .scroll-reveal
    // Slides up from 24px below + fades in when entering viewport
    const revealCSS = `
      .scroll-reveal {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1),
                    transform 0.55s cubic-bezier(0.22,1,0.36,1);
      }
      .scroll-reveal.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      /* Stagger children inside a reveal container */
      .scroll-reveal-group > * {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.45s cubic-bezier(0.22,1,0.36,1),
                    transform 0.45s cubic-bezier(0.22,1,0.36,1);
      }
      .scroll-reveal-group.is-visible > *:nth-child(1) { opacity:1;transform:translateY(0);transition-delay:0ms; }
      .scroll-reveal-group.is-visible > *:nth-child(2) { opacity:1;transform:translateY(0);transition-delay:80ms; }
      .scroll-reveal-group.is-visible > *:nth-child(3) { opacity:1;transform:translateY(0);transition-delay:160ms; }
      .scroll-reveal-group.is-visible > *:nth-child(4) { opacity:1;transform:translateY(0);transition-delay:240ms; }
      .scroll-reveal-group.is-visible > *:nth-child(5) { opacity:1;transform:translateY(0);transition-delay:300ms; }
      .scroll-reveal-group.is-visible > *:nth-child(n+6) { opacity:1;transform:translateY(0);transition-delay:360ms; }
    `;

    // ── 3. SCAN LINE REVEAL ──────────────────────────────────────
    // Targets: .scroll-scan (auto-applied to .glass-panel)
    // A cyan line sweeps down before content appears
    const scanCSS = `
      .scroll-scan {
        position: relative;
        overflow: hidden;
      }
      .scroll-scan::after {
        content: '';
        position: absolute;
        left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00d1ff, transparent);
        box-shadow: 0 0 12px #00d1ff, 0 0 24px #00d1ff80;
        top: -2px;
        transition: none;
        pointer-events: none;
        z-index: 10;
      }
      .scroll-scan.scan-active::after {
        animation: scanLineReveal 0.7s ease-out forwards;
      }
      @keyframes scanLineReveal {
        0%   { top: -2px;   opacity: 1; }
        80%  { top: 100%;   opacity: 1; }
        100% { top: 100%;   opacity: 0; }
      }
    `;

    // ── 4. SCORE BAR GROW ────────────────────────────────────────
    // Targets: .scroll-bar (auto-applied to score bar fills)
    const barCSS = `
      .scroll-bar-fill {
        width: 0% !important;
        transition: width 1.1s cubic-bezier(0.22,1,0.36,1) !important;
      }
      .scroll-bar-fill.bar-grown {
        width: var(--bar-target) !important;
      }
    `;

    // Inject all CSS
    const styleEl = document.createElement("style");
    styleEl.id = "tw-scroll-anim-css";
    styleEl.textContent = revealCSS + scanCSS + barCSS;
    if (!document.getElementById("tw-scroll-anim-css")) {
      document.head.appendChild(styleEl);
    }

    // ── Observer instances ───────────────────────────────────────
    let revealObs, counterObs, scanObs, barObs;
    let scanInterval;

    // ── Counter roll helper ──────────────────────────────────────
    function animateCounter(el) {
      const raw    = el.getAttribute("data-target") || el.textContent.trim();
      const isFloat = raw.includes(".");
      const target  = parseFloat(raw);
      const suffix  = el.getAttribute("data-suffix") || "";
      if (isNaN(target)) return;

      const duration = 1200;
      const start    = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = isFloat
          ? current.toFixed(1) + suffix
          : Math.round(current) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // ── Setup function — called on interval to catch new elements ─
    function setup() {

      // 1. Slide-in reveal
      revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

      document.querySelectorAll(".scroll-reveal, .scroll-reveal-group").forEach(el => {
        if (!el.classList.contains("is-visible")) {
          revealObs.observe(el);
        }
      });

      // 2. Counter roll
      counterObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = "true";
            animateCounter(entry.target);
            counterObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll(".scroll-counter").forEach(el => {
        if (!el.dataset.counted) counterObs.observe(el);
      });

      // 3. Scan line — auto-apply to all glass-panel elements
      document.querySelectorAll(".glass-panel").forEach(el => {
        if (!el.classList.contains("scroll-scan")) {
          el.classList.add("scroll-scan");
        }
      });

      scanObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.scanned) {
            entry.target.dataset.scanned = "true";
            entry.target.classList.add("scan-active");
            scanObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll(".scroll-scan").forEach(el => {
        if (!el.dataset.scanned) scanObs.observe(el);
      });

      // 4. Score bars — auto-target inner fill divs inside ScoreBar
      // ScoreBar renders a div with inline width% — we mark them
      document.querySelectorAll(".glass-panel [style*='riskRise'], .glass-panel [style*='animation']").forEach(el => {
        // Find elements that look like score bar fills (have a % width and a color glow)
        const style = el.getAttribute("style") || "";
        if (
          style.includes("width:") &&
          (style.includes("box-shadow") || style.includes("boxShadow")) &&
          style.includes("height:") &&
          !el.dataset.barSetup
        ) {
          el.dataset.barSetup = "true";
          // Extract current width
          const match = style.match(/width:\s*([0-9.]+)%/);
          if (match) {
            el.style.setProperty("--bar-target", match[1] + "%");
            el.classList.add("scroll-bar-fill");
          }
        }
      });

      barObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.barGrown) {
            entry.target.dataset.barGrown = "true";
            // Small delay so the scan line runs first
            setTimeout(() => {
              entry.target.classList.add("bar-grown");
            }, 300);
            barObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      document.querySelectorAll(".scroll-bar-fill").forEach(el => {
        if (!el.dataset.barGrown) barObs.observe(el);
      });
    }

    // Initial run + re-scan for React re-renders
    setup();
    scanInterval = setInterval(setup, 800);

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      clearInterval(scanInterval);
      revealObs?.disconnect();
      counterObs?.disconnect();
      scanObs?.disconnect();
      barObs?.disconnect();
      document.getElementById("tw-scroll-anim-css")?.remove();
    };
  }, []);
}