import { useEffect } from "react";

/**
 * ThreatWatch Cursor Effects
 * 1. Custom crosshair cursor with cyan ring + inertia lag
 * 2. Particle trail (fading cyan/red dots behind the cursor)
 * 3. Magnetic pull on .cyber-btn buttons
 */
export function useCursorEffects(mobile) {
  useEffect(() => {
    // Don't run on mobile — no cursor there
    if (mobile) return;

    // ── DOM: cursor elements ─────────────────────────────
    const dot   = document.createElement("div");
    const ring  = document.createElement("div");
    dot.id  = "tw-cursor-dot";
    ring.id = "tw-cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // ── Canvas: particle trail ───────────────────────────
    const canvas = document.createElement("canvas");
    canvas.id = "tw-trail-canvas";
    canvas.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      pointer-events:none;z-index:9998;
    `;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // ── State ────────────────────────────────────────────
    let mx = -100, my = -100;   // real mouse pos
    let rx = -100, ry = -100;   // ring pos (lagged)
    let particles = [];
    let animId;
    let isDown = false;

    const CYAN = "#00d1ff";
    const RED  = "#ff1e50";

    // ── Mouse listeners ──────────────────────────────────
    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
    }
    function onDown() { isDown = true;  ring.classList.add("tw-ring-click"); }
    function onUp()   { isDown = false; ring.classList.remove("tw-ring-click"); }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);

    // ── Particle factory ─────────────────────────────────
    function spawnParticle(x, y) {
      const isCrit = document.querySelector(".cyber-glow-red") !== null;
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1,
        decay: 0.035 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 2,
        color: isCrit ? RED : (Math.random() > 0.85 ? RED : CYAN),
      });
    }

    let frameCount = 0;

    // ── Main RAF loop ────────────────────────────────────
    function loop() {
      animId = requestAnimationFrame(loop);
      frameCount++;

      // 1. Move dot instantly
      dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;

      // 2. Ring follows with inertia (lerp)
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;

      // 3. Spawn particle every 2 frames
      if (frameCount % 2 === 0) spawnParticle(mx, my);

      // 4. Draw particles
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.life -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.life * 200).toString(16).padStart(2, "0");
        ctx.shadowBlur  = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    loop();

    // ── Magnetic buttons ─────────────────────────────────
    // Scan every 500ms for new .cyber-btn elements (since they re-render)
    const magnetMap = new Map();

    function applyMagnetic(btn) {
      if (magnetMap.has(btn)) return; // already attached

      function onEnter() { btn.style.transition = "transform 0.2s ease"; }
      function onLeave() {
        btn.style.transition = "transform 0.4s ease";
        btn.style.transform  = "translate(0,0)";
      }
      function onMMove(e) {
        const r   = btn.getBoundingClientRect();
        const bx  = r.left + r.width  / 2;
        const by  = r.top  + r.height / 2;
        const dx  = e.clientX - bx;
        const dy  = e.clientY - by;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxD = 60;
        if (dist < maxD) {
          const pull = (1 - dist / maxD) * 7; // max 7px pull
          btn.style.transform = `translate(${dx * pull / dist}px, ${dy * pull / dist}px)`;
          ring.classList.add("tw-ring-hover");
        }
      }
      function onMLeave() {
        ring.classList.remove("tw-ring-hover");
      }

      btn.addEventListener("mouseenter", onEnter);
      btn.addEventListener("mouseleave", onLeave);
      btn.addEventListener("mousemove",  onMMove);
      btn.addEventListener("mouseleave", onMLeave);

      magnetMap.set(btn, { onEnter, onLeave, onMMove, onMLeave });
    }

    function scanButtons() {
      document.querySelectorAll(".cyber-btn, button").forEach(applyMagnetic);
    }

    scanButtons();
    const scanInterval = setInterval(scanButtons, 600);

    // ── Hover: enlarge ring over interactive elements ────
    function onHoverIn()  { ring.classList.add("tw-ring-hover"); }
    function onHoverOut() { ring.classList.remove("tw-ring-hover"); }

    document.querySelectorAll("a, input, select, textarea").forEach(el => {
      el.addEventListener("mouseenter", onHoverIn);
      el.addEventListener("mouseleave", onHoverOut);
    });

    // ── Resize canvas ────────────────────────────────────
    function onResize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    // ── Cleanup ──────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(scanInterval);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      window.removeEventListener("resize", onResize);
      magnetMap.forEach(({ onEnter, onLeave, onMMove, onMLeave }, btn) => {
        btn.removeEventListener("mouseenter", onEnter);
        btn.removeEventListener("mouseleave", onLeave);
        btn.removeEventListener("mousemove",  onMMove);
        btn.removeEventListener("mouseleave", onMLeave);
      });
      dot.remove();
      ring.remove();
      canvas.remove();
    };
  }, [mobile]);
}