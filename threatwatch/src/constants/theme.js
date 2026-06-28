// ── PALETTE — Stitch Cyber-Glassmorphism ─────────────────
export const C = {
  // Backgrounds
  bg:       "#0a0e14",
  panel:    "rgba(255,255,255,0.03)",
  panelAlt: "rgba(255,255,255,0.02)",
  panelSolid: "#10141a",     // solid fallback for overlays
  border:   "rgba(0,209,255,0.1)",
  borderHi: "rgba(0,209,255,0.25)",
  // Accents
  cyan:     "#00d1ff",       // Cyber-Blue — primary interactive
  cyanDim:  "rgba(0,209,255,0.15)",
  cyanFaint:"rgba(0,209,255,0.05)",
  red:      "#ff3131",       // Warning-Red — critical threats
  redDim:   "rgba(255,49,49,0.15)",
  orange:   "#ff9a3c",       // High severity
  yellow:   "#ffd166",       // Moderate
  green:    "#39ff14",       // Neon-Green — safe / active
  purple:   "#a78bfa",       // AI / Behavioral Twin accent
  // Text
  text:     "#dfe2eb",
  textMid:  "#bbc9cf",
  textLow:  "#859399",
  muted:    "rgba(0,209,255,0.08)",
  // Mono font
  mono:     "'JetBrains Mono', monospace",
  sans:     "'Inter', sans-serif",
};

export const LEVEL_C = { Critical: C.red, High: C.orange, Moderate: C.yellow, Low: C.green };

export const LEVEL_BG = {
  Critical: "rgba(255,49,49,0.10)",
  High:     "rgba(255,154,60,0.10)",
  Moderate: "rgba(255,209,102,0.08)",
  Low:      "rgba(57,255,20,0.08)",
};

// ── GLOBAL STYLES ────────────────────────────────────────
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    --mono-font: 'JetBrains Mono', monospace;
    --sans-font: 'Inter', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,209,255,0.15); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,209,255,0.4); }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes flicker {
    0%,100% { opacity:1; } 92% { opacity:1; } 93% { opacity:0.85; } 94% { opacity:1; } 96% { opacity:0.9; } 97% { opacity:1; }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 8px currentColor, 0 0 20px currentColor; opacity:1; }
    50% { box-shadow: 0 0 15px currentColor, 0 0 40px currentColor, 0 0 60px currentColor; opacity:0.85; }
  }
  @keyframes pulse-animation {
    0% { transform: scale(0.95); opacity:0.5; }
    50% { transform: scale(1.05); opacity:1; }
    100% { transform: scale(0.95); opacity:0.5; }
  }
  @keyframes scaleIn {
    from { opacity:0; transform: scale(0.9) translateY(10px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }
  @keyframes scaleInModal {
    from { opacity:0; transform: scale(0.85); }
    to   { opacity:1; transform: scale(1); }
  }
  @keyframes borderPulse {
    0%,100% { border-color: rgba(0,255,225,0.3); }
    50% { border-color: rgba(0,255,225,0.8); box-shadow: 0 0 20px rgba(0,255,225,0.2), inset 0 0 20px rgba(0,255,225,0.03); }
  }
  @keyframes criticalPulse {
    0%,100% { border-color: rgba(255,30,80,0.4); box-shadow: 0 0 10px rgba(255,30,80,0.2); }
    50% { border-color: rgba(255,30,80,0.9); box-shadow: 0 0 30px rgba(255,30,80,0.4), inset 0 0 30px rgba(255,30,80,0.05); }
  }
  @keyframes slideInLeft {
    from { opacity:0; transform: translateX(-30px); }
    to   { opacity:1; transform: translateX(0); }
  }
  @keyframes slideInUp {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; } to { opacity:1; }
  }
  @keyframes countUp {
    from { opacity:0; transform: scale(0.8); }
    to   { opacity:1; transform: scale(1); }
  }
  @keyframes glitchIn {
    0%   { clip-path: inset(0 0 100% 0); }
    20%  { clip-path: inset(0 0 60% 0); opacity:0.8; }
    40%  { clip-path: inset(0 0 80% 0); opacity:1; }
    60%  { clip-path: inset(0 0 30% 0); }
    80%  { clip-path: inset(0 0 10% 0); }
    100% { clip-path: inset(0 0 0% 0); }
  }
  @keyframes orbitPing {
    0%   { transform: scale(1); opacity:1; }
    100% { transform: scale(2.5); opacity:0; }
  }
  @keyframes dash {
    to { stroke-dashoffset: -20; }
  }
  @keyframes threatFlash {
    0%,100% { background: rgba(255,30,80,0.0); }
    50%     { background: rgba(255,30,80,0.15); }
  }
  @keyframes gridScroll {
    from { background-position: 0 0; }
    to   { background-position: 0 40px; }
  }
  @keyframes neonText {
    0%,100% { text-shadow: 0 0 7px #00ffe1, 0 0 20px #00ffe1; }
    50%     { text-shadow: 0 0 15px #00ffe1, 0 0 40px #00ffe1, 0 0 80px #00ffe1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
  }
  @keyframes twinPulse {
    0%,100% { box-shadow: 0 0 0px rgba(157,111,255,0); }
    50%     { box-shadow: 0 0 30px rgba(157,111,255,0.35), inset 0 0 20px rgba(157,111,255,0.05); }
  }
  @keyframes scanBar {
    0%   { top: 0%; opacity:0.7; }
    50%  { opacity:1; }
    100% { top: 100%; opacity:0; }
  }
  @keyframes deviationRise {
    from { width: 0%; }
    to   { width: var(--target-w); }
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-6px); }
  }
  @keyframes blink {
    0%,100% { opacity:1; } 50% { opacity:0; }
  }
  @keyframes riskRise {
    from { width: 0; }
  }
  @keyframes chatbotOrbit {
    0%   { transform: rotate(0deg)   translateX(42px) rotate(0deg);   opacity:1; }
    100% { transform: rotate(360deg) translateX(42px) rotate(-360deg); opacity:1; }
  }
  @keyframes chatbotRipple {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes chatbotGlow {
    0%,100% { box-shadow: 0 0 20px rgba(0,209,255,0.4), 0 0 40px rgba(0,209,255,0.15), inset 0 0 15px rgba(0,209,255,0.1); }
    50%     { box-shadow: 0 0 30px rgba(0,209,255,0.6), 0 0 60px rgba(0,209,255,0.25), inset 0 0 20px rgba(0,209,255,0.15); }
  }
  @keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes modalBackdrop {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmerLine {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  @keyframes chatPanelOpen {
    from { opacity: 0; transform: translateY(20px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }

  .cyber-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
    font-family: 'JetBrains Mono', monospace;
  }
  .cyber-btn::before {
    content:'';
    position:absolute;
    top:0;left:-100%;
    width:100%;height:100%;
    background: linear-gradient(90deg, transparent, rgba(0,209,255,0.12), transparent);
    transition: left 0.4s;
  }
  .cyber-btn:hover::before { left:100%; }
  .cyber-btn:hover { transform: translateY(-1px); }

  /* ── GLASS PANEL ── */
  .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(0, 209, 255, 0.1);
    position: relative;
    overflow: hidden;
  }
  .glass-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,209,255,0.35), transparent);
    pointer-events: none;
  }
  .cyber-glow {
    box-shadow: 0 0 20px rgba(0, 209, 255, 0.18);
  }
  .cyber-glow-red {
    box-shadow: 0 0 20px rgba(255, 49, 49, 0.25);
  }
  .live-pulse {
    animation: pulse-animation 2s infinite;
  }

  .nav-item { transition: all 0.2s; }
  .nav-item:hover { background: rgba(0,209,255,0.06) !important; }

  .row-hover { transition: background 0.15s; }
  .row-hover:hover { background: rgba(0,209,255,0.04) !important; }

  .card-hover { transition: all 0.25s; }
  .card-hover:hover { transform: translateY(-2px); border-color: rgba(0,209,255,0.3) !important; box-shadow: 0 8px 30px rgba(0,209,255,0.08) !important; }

  @media print {
    #no-print { display: none !important; }
    body { background: white !important; color: black !important; }
    .panel-print { border: 1px solid #ccc !important; background: white !important; }
  }
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(0,209,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 4px;
  }

  @keyframes chatbotPulse {
    0% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 209, 255, 0.4), 0 0 40px rgba(0, 209, 255, 0.1); }
    50% { transform: scale(1.08); box-shadow: 0 0 35px rgba(0, 209, 255, 0.7), 0 0 70px rgba(0, 209, 255, 0.35); }
    100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 209, 255, 0.4), 0 0 40px rgba(0, 209, 255, 0.1); }
  }
  @keyframes scanningSweep {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes borderNeonGlow {
    0%, 100% { border-color: rgba(0, 209, 255, 0.35); }
    50% { border-color: rgba(0, 209, 255, 0.85); box-shadow: 0 0 15px rgba(0, 209, 255, 0.2); }
  }

  body { font-family: 'Inter', sans-serif; }

  /* ── MOBILE OVERRIDES ── */
  html, body, #root {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    width: 100% !important;
  }

  @media (max-width: 768px) {
    * {
      -webkit-tap-highlight-color: transparent;
    }
    table {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .cyber-btn:hover::before { left: -100% !important; }
    .card-hover:hover { transform: none !important; }
    .cyber-btn:hover { transform: none !important; }
  }
`;
