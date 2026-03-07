import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { LayoutDashboard, Trophy, UserSearch, BellRing, BarChart3, Shield, Zap, AlertTriangle, Users, Flame, Crosshair, Bell, Eye, Radio, Activity, Lock, Database, Server, Cpu, TrendingUp, TrendingDown, Minus, CheckCircle, Clock, FileWarning, ShieldAlert, Usb, Mail, FolderOpen, KeyRound, LogIn, Skull, ShieldX, MonitorX, Siren } from "lucide-react";

// ── GLOBAL STYLES ────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #00000040; }
  ::-webkit-scrollbar-thumb { background: #00ffe140; border-radius: 2px; }

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
  @keyframes blink {
    0%,100% { opacity:1; } 50% { opacity:0; }
  }
  @keyframes riskRise {
    from { width: 0; }
  }

  .cyber-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
  }
  .cyber-btn::before {
    content:'';
    position:absolute;
    top:0;left:-100%;
    width:100%;height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.4s;
  }
  .cyber-btn:hover::before { left:100%; }
  .cyber-btn:hover { transform: translateY(-1px); }

  .nav-item { transition: all 0.2s; }
  .nav-item:hover { background: rgba(0,255,225,0.06) !important; padding-left: 18px !important; }

  .row-hover { transition: background 0.15s; }
  .row-hover:hover { background: rgba(0,255,225,0.04) !important; }

  .card-hover { transition: all 0.25s; }
  .card-hover:hover { transform: translateY(-2px); border-color: rgba(0,255,225,0.4) !important; box-shadow: 0 8px 30px rgba(0,255,225,0.08) !important; }
`;

// ── PALETTE ──────────────────────────────────────────────
const C = {
  bg:       "#030912",
  panel:    "#070e1b",
  panelAlt: "#050c18",
  border:   "#0d1f35",
  borderHi: "#0e2a45",
  cyan:     "#00ffe1",
  cyanDim:  "#00ffe140",
  cyanFaint:"#00ffe108",
  red:      "#ff1e50",
  redDim:   "#ff1e5040",
  orange:   "#ff7c1e",
  yellow:   "#ffd700",
  green:    "#00ff87",
  purple:   "#9d6fff",
  text:     "#e2eeff",
  textMid:  "#7a98c0",
  textLow:  "#3d5470",
  muted:    "#1a3050",
};

const LEVEL_C = { Critical: C.red, High: C.orange, Moderate: C.yellow, Low: C.green };
const LEVEL_BG = {
  Critical: "rgba(255,30,80,0.12)",
  High:     "rgba(255,124,30,0.12)",
  Moderate: "rgba(255,215,0,0.10)",
  Low:      "rgba(0,255,135,0.10)",
};

// ── DATA — embedded directly from employee_summary.json (ML output) ──────────
const RAW_DATA = [
  {"employee_id":"EMP-007","name":"Fatima Al-Hassan","initials":"FA","department":"IT","role":"Systems Administrator","peak_score":94.5,"risk_label":"CRITICAL","trend":"Rising","login_hour":1,"files":214,"privilege":7,"usb":1,"sentiment":-0.92,"timeline":[{"day":1,"score":17.8},{"day":2,"score":9.0},{"day":3,"score":42.9},{"day":4,"score":20.7},{"day":5,"score":6.4},{"day":6,"score":14.0},{"day":7,"score":7.3},{"day":8,"score":9.3},{"day":9,"score":23.8},{"day":10,"score":28.3},{"day":11,"score":18.0},{"day":12,"score":15.8},{"day":13,"score":14.5},{"day":14,"score":12.0},{"day":15,"score":13.4},{"day":16,"score":13.1},{"day":17,"score":39.6},{"day":18,"score":9.5},{"day":19,"score":23.3},{"day":20,"score":21.2},{"day":21,"score":44.4},{"day":22,"score":8.6},{"day":23,"score":18.9},{"day":24,"score":4.9},{"day":25,"score":8.5},{"day":26,"score":94.3},{"day":27,"score":92.9},{"day":28,"score":94.1},{"day":29,"score":92.4},{"day":30,"score":94.5}]},
  {"employee_id":"EMP-002","name":"Priya Nair","initials":"PN","department":"Finance","role":"Financial Analyst","peak_score":60.4,"risk_label":"HIGH","trend":"Stable","login_hour":8,"files":25,"privilege":0,"usb":0,"sentiment":0.37,"timeline":[{"day":1,"score":12.8},{"day":2,"score":23.3},{"day":3,"score":13.9},{"day":4,"score":8.5},{"day":5,"score":7.1},{"day":6,"score":17.4},{"day":7,"score":11.6},{"day":8,"score":15.4},{"day":9,"score":6.9},{"day":10,"score":8.4},{"day":11,"score":12.9},{"day":12,"score":60.4},{"day":13,"score":15.3},{"day":14,"score":19.6},{"day":15,"score":39.1},{"day":16,"score":34.9},{"day":17,"score":30.6},{"day":18,"score":27.8},{"day":19,"score":14.9},{"day":20,"score":30.5},{"day":21,"score":7.7},{"day":22,"score":28.7},{"day":23,"score":51.5},{"day":24,"score":16.8},{"day":25,"score":13.3},{"day":26,"score":23.4},{"day":27,"score":9.3},{"day":28,"score":31.8},{"day":29,"score":6.1},{"day":30,"score":11.5}]},
  {"employee_id":"EMP-017","name":"David Park","initials":"DP","department":"Marketing","role":"Brand Strategist","peak_score":53.4,"risk_label":"MODERATE","trend":"Rising","login_hour":8,"files":17,"privilege":0,"usb":1,"sentiment":0.68,"timeline":[{"day":1,"score":5.9},{"day":2,"score":10.5},{"day":3,"score":14.7},{"day":4,"score":5.5},{"day":5,"score":5.2},{"day":6,"score":10.0},{"day":7,"score":11.8},{"day":8,"score":12.7},{"day":9,"score":11.0},{"day":10,"score":14.9},{"day":11,"score":25.9},{"day":12,"score":44.6},{"day":13,"score":21.9},{"day":14,"score":18.3},{"day":15,"score":15.0},{"day":16,"score":8.5},{"day":17,"score":6.3},{"day":18,"score":8.6},{"day":19,"score":8.9},{"day":20,"score":28.4},{"day":21,"score":53.4},{"day":22,"score":21.9},{"day":23,"score":16.6},{"day":24,"score":11.7},{"day":25,"score":7.5},{"day":26,"score":13.9},{"day":27,"score":4.5},{"day":28,"score":42.1},{"day":29,"score":10.3},{"day":30,"score":41.8}]},
  {"employee_id":"EMP-020","name":"Hannah Mueller","initials":"HM","department":"IT","role":"Cloud Infrastructure Eng","peak_score":50.2,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":19,"privilege":0,"usb":0,"sentiment":0.28,"timeline":[{"day":1,"score":14.7},{"day":2,"score":18.7},{"day":3,"score":13.9},{"day":4,"score":13.8},{"day":5,"score":14.8},{"day":6,"score":19.0},{"day":7,"score":23.7},{"day":8,"score":14.5},{"day":9,"score":16.9},{"day":10,"score":28.7},{"day":11,"score":10.5},{"day":12,"score":13.2},{"day":13,"score":6.4},{"day":14,"score":19.7},{"day":15,"score":11.5},{"day":16,"score":9.0},{"day":17,"score":14.0},{"day":18,"score":16.0},{"day":19,"score":15.0},{"day":20,"score":18.5},{"day":21,"score":14.2},{"day":22,"score":20.3},{"day":23,"score":36.5},{"day":24,"score":14.7},{"day":25,"score":11.1},{"day":26,"score":19.1},{"day":27,"score":50.2},{"day":28,"score":7.5},{"day":29,"score":11.9},{"day":30,"score":9.8}]},
  {"employee_id":"EMP-019","name":"Omar Shaikh","initials":"OS","department":"Sales","role":"Business Dev Manager","peak_score":47.5,"risk_label":"MODERATE","trend":"Declining","login_hour":9,"files":18,"privilege":0,"usb":0,"sentiment":0.57,"timeline":[{"day":1,"score":13.3},{"day":2,"score":13.7},{"day":3,"score":5.5},{"day":4,"score":42.7},{"day":5,"score":13.4},{"day":6,"score":10.1},{"day":7,"score":20.5},{"day":8,"score":9.1},{"day":9,"score":10.2},{"day":10,"score":10.9},{"day":11,"score":10.2},{"day":12,"score":15.0},{"day":13,"score":14.5},{"day":14,"score":30.5},{"day":15,"score":19.5},{"day":16,"score":7.5},{"day":17,"score":5.3},{"day":18,"score":20.3},{"day":19,"score":24.8},{"day":20,"score":13.3},{"day":21,"score":19.6},{"day":22,"score":47.5},{"day":23,"score":28.2},{"day":24,"score":7.3},{"day":25,"score":11.8},{"day":26,"score":11.8},{"day":27,"score":7.8},{"day":28,"score":7.5},{"day":29,"score":11.0},{"day":30,"score":15.9}]},
  {"employee_id":"EMP-010","name":"Robert Liu","initials":"RL","department":"Engineering","role":"Frontend Developer","peak_score":47.3,"risk_label":"MODERATE","trend":"Declining","login_hour":9,"files":24,"privilege":0,"usb":0,"sentiment":0.44,"timeline":[{"day":1,"score":21.0},{"day":2,"score":5.5},{"day":3,"score":39.6},{"day":4,"score":10.7},{"day":5,"score":5.2},{"day":6,"score":17.1},{"day":7,"score":11.6},{"day":8,"score":28.8},{"day":9,"score":12.0},{"day":10,"score":11.2},{"day":11,"score":5.5},{"day":12,"score":26.8},{"day":13,"score":22.3},{"day":14,"score":7.6},{"day":15,"score":5.6},{"day":16,"score":18.2},{"day":17,"score":7.6},{"day":18,"score":19.6},{"day":19,"score":8.2},{"day":20,"score":24.5},{"day":21,"score":8.7},{"day":22,"score":11.6},{"day":23,"score":47.3},{"day":24,"score":7.6},{"day":25,"score":6.9},{"day":26,"score":17.2},{"day":27,"score":8.4},{"day":28,"score":15.2},{"day":29,"score":5.9},{"day":30,"score":5.9}]},
  {"employee_id":"EMP-001","name":"Marcus Webb","initials":"MW","department":"Engineering","role":"Senior DevOps Engineer","peak_score":45.6,"risk_label":"MODERATE","trend":"Stable","login_hour":10,"files":23,"privilege":0,"usb":0,"sentiment":0.5,"timeline":[{"day":1,"score":8.5},{"day":2,"score":8.7},{"day":3,"score":12.7},{"day":4,"score":23.4},{"day":5,"score":11.6},{"day":6,"score":5.5},{"day":7,"score":45.6},{"day":8,"score":9.2},{"day":9,"score":14.0},{"day":10,"score":6.4},{"day":11,"score":9.7},{"day":12,"score":9.3},{"day":13,"score":13.8},{"day":14,"score":12.7},{"day":15,"score":13.8},{"day":16,"score":16.1},{"day":17,"score":24.1},{"day":18,"score":5.6},{"day":19,"score":41.6},{"day":20,"score":13.3},{"day":21,"score":38.5},{"day":22,"score":17.2},{"day":23,"score":19.6},{"day":24,"score":9.2},{"day":25,"score":13.5},{"day":26,"score":23.8},{"day":27,"score":8.2},{"day":28,"score":14.9},{"day":29,"score":13.8},{"day":30,"score":14.3}]},
  {"employee_id":"EMP-006","name":"Chen Wei","initials":"CW","department":"Engineering","role":"Backend Developer","peak_score":44.9,"risk_label":"MODERATE","trend":"Rising","login_hour":10,"files":20,"privilege":1,"usb":0,"sentiment":0.38,"timeline":[{"day":1,"score":14.0},{"day":2,"score":6.8},{"day":3,"score":8.7},{"day":4,"score":6.6},{"day":5,"score":11.9},{"day":6,"score":4.8},{"day":7,"score":5.0},{"day":8,"score":12.5},{"day":9,"score":12.0},{"day":10,"score":11.3},{"day":11,"score":37.8},{"day":12,"score":18.3},{"day":13,"score":5.9},{"day":14,"score":7.7},{"day":15,"score":8.1},{"day":16,"score":8.8},{"day":17,"score":22.9},{"day":18,"score":5.6},{"day":19,"score":19.6},{"day":20,"score":36.4},{"day":21,"score":12.6},{"day":22,"score":6.6},{"day":23,"score":12.9},{"day":24,"score":11.6},{"day":25,"score":5.6},{"day":26,"score":28.4},{"day":27,"score":34.9},{"day":28,"score":8.4},{"day":29,"score":44.9},{"day":30,"score":35.4}]},
  {"employee_id":"EMP-011","name":"Nina Patel","initials":"NP","department":"HR","role":"Talent Acquisition Lead","peak_score":43.3,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":19,"privilege":0,"usb":0,"sentiment":0.4,"timeline":[{"day":1,"score":4.8},{"day":2,"score":11.7},{"day":3,"score":13.9},{"day":4,"score":13.3},{"day":5,"score":7.7},{"day":6,"score":25.0},{"day":7,"score":34.5},{"day":8,"score":6.7},{"day":9,"score":6.9},{"day":10,"score":6.6},{"day":11,"score":16.6},{"day":12,"score":14.1},{"day":13,"score":5.0},{"day":14,"score":43.3},{"day":15,"score":13.7},{"day":16,"score":7.3},{"day":17,"score":16.7},{"day":18,"score":5.1},{"day":19,"score":7.5},{"day":20,"score":8.4},{"day":21,"score":8.1},{"day":22,"score":11.6},{"day":23,"score":30.6},{"day":24,"score":9.9},{"day":25,"score":14.9},{"day":26,"score":8.8},{"day":27,"score":11.3},{"day":28,"score":17.1},{"day":29,"score":15.0},{"day":30,"score":6.0}]},
  {"employee_id":"EMP-008","name":"James Thornton","initials":"JT","department":"Marketing","role":"Marketing Director","peak_score":42.6,"risk_label":"MODERATE","trend":"Rising","login_hour":8,"files":24,"privilege":0,"usb":0,"sentiment":0.71,"timeline":[{"day":1,"score":6.3},{"day":2,"score":31.0},{"day":3,"score":12.2},{"day":4,"score":5.2},{"day":5,"score":11.6},{"day":6,"score":18.3},{"day":7,"score":16.0},{"day":8,"score":9.5},{"day":9,"score":18.2},{"day":10,"score":19.2},{"day":11,"score":7.5},{"day":12,"score":32.8},{"day":13,"score":4.2},{"day":14,"score":6.9},{"day":15,"score":4.9},{"day":16,"score":7.3},{"day":17,"score":6.5},{"day":18,"score":5.2},{"day":19,"score":15.1},{"day":20,"score":42.6},{"day":21,"score":7.0},{"day":22,"score":8.8},{"day":23,"score":17.9},{"day":24,"score":10.2},{"day":25,"score":5.7},{"day":26,"score":11.3},{"day":27,"score":17.7},{"day":28,"score":21.4},{"day":29,"score":24.7},{"day":30,"score":16.4}]},
  {"employee_id":"EMP-013","name":"Yuki Tanaka","initials":"YT","department":"Engineering","role":"ML Engineer","peak_score":41.5,"risk_label":"MODERATE","trend":"Stable","login_hour":9,"files":11,"privilege":0,"usb":0,"sentiment":0.58,"timeline":[{"day":1,"score":5.8},{"day":2,"score":10.2},{"day":3,"score":5.7},{"day":4,"score":15.0},{"day":5,"score":14.9},{"day":6,"score":18.2},{"day":7,"score":9.0},{"day":8,"score":9.3},{"day":9,"score":32.9},{"day":10,"score":4.8},{"day":11,"score":41.5},{"day":12,"score":10.8},{"day":13,"score":17.8},{"day":14,"score":9.9},{"day":15,"score":5.8},{"day":16,"score":10.9},{"day":17,"score":17.0},{"day":18,"score":5.3},{"day":19,"score":18.0},{"day":20,"score":8.4},{"day":21,"score":9.3},{"day":22,"score":24.8},{"day":23,"score":4.7},{"day":24,"score":13.1},{"day":25,"score":17.3},{"day":26,"score":10.9},{"day":27,"score":6.9},{"day":28,"score":12.2},{"day":29,"score":6.4},{"day":30,"score":17.0}]},
  {"employee_id":"EMP-016","name":"Sofia Rossi","initials":"SR","department":"Legal","role":"Corporate Counsel","peak_score":40.5,"risk_label":"MODERATE","trend":"Rising","login_hour":9,"files":24,"privilege":0,"usb":1,"sentiment":0.38,"timeline":[{"day":1,"score":7.9},{"day":2,"score":16.1},{"day":3,"score":15.8},{"day":4,"score":12.3},{"day":5,"score":8.4},{"day":6,"score":18.8},{"day":7,"score":12.0},{"day":8,"score":6.5},{"day":9,"score":15.3},{"day":10,"score":16.4},{"day":11,"score":7.3},{"day":12,"score":10.9},{"day":13,"score":12.5},{"day":14,"score":16.2},{"day":15,"score":5.7},{"day":16,"score":6.3},{"day":17,"score":9.6},{"day":18,"score":10.7},{"day":19,"score":12.5},{"day":20,"score":13.3},{"day":21,"score":12.8},{"day":22,"score":10.2},{"day":23,"score":22.0},{"day":24,"score":8.5},{"day":25,"score":19.3},{"day":26,"score":40.5},{"day":27,"score":22.5},{"day":28,"score":12.3},{"day":29,"score":9.3},{"day":30,"score":38.0}]},
  {"employee_id":"EMP-012","name":"Carlos Mendez","initials":"CM","department":"Sales","role":"Regional Sales Manager","peak_score":40.3,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":23,"privilege":0,"usb":0,"sentiment":0.43,"timeline":[{"day":1,"score":12.2},{"day":2,"score":12.9},{"day":3,"score":34.8},{"day":4,"score":7.0},{"day":5,"score":22.2},{"day":6,"score":28.9},{"day":7,"score":6.0},{"day":8,"score":8.7},{"day":9,"score":40.3},{"day":10,"score":15.6},{"day":11,"score":31.7},{"day":12,"score":5.9},{"day":13,"score":7.8},{"day":14,"score":9.5},{"day":15,"score":6.7},{"day":16,"score":6.1},{"day":17,"score":8.0},{"day":18,"score":10.6},{"day":19,"score":6.8},{"day":20,"score":19.8},{"day":21,"score":6.6},{"day":22,"score":10.4},{"day":23,"score":19.7},{"day":24,"score":10.5},{"day":25,"score":9.9},{"day":26,"score":11.0},{"day":27,"score":8.0},{"day":28,"score":16.1},{"day":29,"score":7.7},{"day":30,"score":18.9}]},
  {"employee_id":"EMP-005","name":"Tomás Rivera","initials":"TR","department":"Legal","role":"Compliance Officer","peak_score":39.1,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":25,"privilege":0,"usb":0,"sentiment":0.33,"timeline":[{"day":1,"score":11.7},{"day":2,"score":21.2},{"day":3,"score":17.3},{"day":4,"score":14.3},{"day":5,"score":11.9},{"day":6,"score":12.9},{"day":7,"score":31.9},{"day":8,"score":4.7},{"day":9,"score":12.4},{"day":10,"score":18.5},{"day":11,"score":24.8},{"day":12,"score":11.8},{"day":13,"score":16.5},{"day":14,"score":9.7},{"day":15,"score":14.0},{"day":16,"score":39.1},{"day":17,"score":11.2},{"day":18,"score":6.0},{"day":19,"score":21.4},{"day":20,"score":12.4},{"day":21,"score":31.7},{"day":22,"score":10.1},{"day":23,"score":7.5},{"day":24,"score":27.2},{"day":25,"score":7.0},{"day":26,"score":7.7},{"day":27,"score":13.9},{"day":28,"score":6.8},{"day":29,"score":9.1},{"day":30,"score":22.9}]},
  {"employee_id":"EMP-009","name":"Sarah Kim","initials":"SK","department":"Finance","role":"Accountant","peak_score":39.1,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":17,"privilege":0,"usb":0,"sentiment":0.53,"timeline":[{"day":1,"score":17.5},{"day":2,"score":14.6},{"day":3,"score":6.7},{"day":4,"score":8.0},{"day":5,"score":39.1},{"day":6,"score":8.9},{"day":7,"score":12.5},{"day":8,"score":17.9},{"day":9,"score":12.4},{"day":10,"score":5.5},{"day":11,"score":10.0},{"day":12,"score":9.9},{"day":13,"score":27.1},{"day":14,"score":10.7},{"day":15,"score":13.0},{"day":16,"score":12.1},{"day":17,"score":19.6},{"day":18,"score":16.8},{"day":19,"score":16.0},{"day":20,"score":36.6},{"day":21,"score":10.9},{"day":22,"score":10.9},{"day":23,"score":10.0},{"day":24,"score":34.0},{"day":25,"score":13.7},{"day":26,"score":10.7},{"day":27,"score":9.6},{"day":28,"score":38.1},{"day":29,"score":6.8},{"day":30,"score":6.2}]},
  {"employee_id":"EMP-018","name":"Elena Vasquez","initials":"EV","department":"Engineering","role":"QA Engineer","peak_score":38.7,"risk_label":"MODERATE","trend":"Stable","login_hour":9,"files":23,"privilege":0,"usb":0,"sentiment":0.43,"timeline":[{"day":1,"score":14.1},{"day":2,"score":10.0},{"day":3,"score":7.1},{"day":4,"score":14.9},{"day":5,"score":8.9},{"day":6,"score":14.8},{"day":7,"score":20.0},{"day":8,"score":8.9},{"day":9,"score":17.4},{"day":10,"score":33.9},{"day":11,"score":20.9},{"day":12,"score":36.9},{"day":13,"score":17.3},{"day":14,"score":29.6},{"day":15,"score":18.0},{"day":16,"score":5.2},{"day":17,"score":10.5},{"day":18,"score":7.7},{"day":19,"score":8.5},{"day":20,"score":18.9},{"day":21,"score":15.1},{"day":22,"score":9.3},{"day":23,"score":8.6},{"day":24,"score":33.9},{"day":25,"score":10.7},{"day":26,"score":11.8},{"day":27,"score":6.9},{"day":28,"score":38.7},{"day":29,"score":13.2},{"day":30,"score":7.3}]},
  {"employee_id":"EMP-003","name":"Derek Sloane","initials":"DS","department":"Sales","role":"Account Executive","peak_score":38.6,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":23,"privilege":0,"usb":0,"sentiment":0.37,"timeline":[{"day":1,"score":10.6},{"day":2,"score":9.8},{"day":3,"score":6.2},{"day":4,"score":15.8},{"day":5,"score":13.0},{"day":6,"score":13.9},{"day":7,"score":17.8},{"day":8,"score":7.0},{"day":9,"score":38.6},{"day":10,"score":15.8},{"day":11,"score":12.5},{"day":12,"score":31.5},{"day":13,"score":13.5},{"day":14,"score":11.5},{"day":15,"score":18.6},{"day":16,"score":12.2},{"day":17,"score":10.5},{"day":18,"score":12.6},{"day":19,"score":12.0},{"day":20,"score":20.3},{"day":21,"score":6.9},{"day":22,"score":16.5},{"day":23,"score":15.1},{"day":24,"score":17.1},{"day":25,"score":31.2},{"day":26,"score":21.2},{"day":27,"score":21.3},{"day":28,"score":7.1},{"day":29,"score":7.0},{"day":30,"score":7.7}]},
  {"employee_id":"EMP-015","name":"Liam O'Brien","initials":"LO","department":"IT","role":"Network Administrator","peak_score":37.3,"risk_label":"MODERATE","trend":"Stable","login_hour":8,"files":15,"privilege":0,"usb":0,"sentiment":0.44,"timeline":[{"day":1,"score":10.5},{"day":2,"score":8.5},{"day":3,"score":6.3},{"day":4,"score":5.2},{"day":5,"score":17.1},{"day":6,"score":5.9},{"day":7,"score":24.8},{"day":8,"score":6.2},{"day":9,"score":21.3},{"day":10,"score":34.0},{"day":11,"score":30.0},{"day":12,"score":20.1},{"day":13,"score":6.1},{"day":14,"score":14.7},{"day":15,"score":6.9},{"day":16,"score":24.2},{"day":17,"score":7.6},{"day":18,"score":6.9},{"day":19,"score":11.5},{"day":20,"score":16.6},{"day":21,"score":21.9},{"day":22,"score":22.5},{"day":23,"score":37.3},{"day":24,"score":23.6},{"day":25,"score":9.6},{"day":26,"score":9.0},{"day":27,"score":7.1},{"day":28,"score":23.0},{"day":29,"score":7.5},{"day":30,"score":9.7}]},
  {"employee_id":"EMP-004","name":"Aisha Okonkwo","initials":"AO","department":"HR","role":"HR Manager","peak_score":35.2,"risk_label":"MODERATE","trend":"Stable","login_hour":7,"files":22,"privilege":0,"usb":0,"sentiment":0.32,"timeline":[{"day":1,"score":8.1},{"day":2,"score":9.8},{"day":3,"score":13.2},{"day":4,"score":9.8},{"day":5,"score":12.0},{"day":6,"score":5.0},{"day":7,"score":17.3},{"day":8,"score":9.6},{"day":9,"score":17.2},{"day":10,"score":6.7},{"day":11,"score":14.4},{"day":12,"score":10.4},{"day":13,"score":8.9},{"day":14,"score":8.4},{"day":15,"score":13.4},{"day":16,"score":19.1},{"day":17,"score":6.9},{"day":18,"score":35.2},{"day":19,"score":14.1},{"day":20,"score":22.8},{"day":21,"score":22.3},{"day":22,"score":7.3},{"day":23,"score":16.6},{"day":24,"score":6.8},{"day":25,"score":9.8},{"day":26,"score":22.5},{"day":27,"score":17.4},{"day":28,"score":7.6},{"day":29,"score":8.0},{"day":30,"score":20.1}]},
  {"employee_id":"EMP-014","name":"Amara Osei","initials":"AM","department":"Finance","role":"Risk Analyst","peak_score":27.3,"risk_label":"LOW","trend":"Stable","login_hour":9,"files":26,"privilege":0,"usb":0,"sentiment":0.69,"timeline":[{"day":1,"score":9.2},{"day":2,"score":16.8},{"day":3,"score":11.3},{"day":4,"score":10.9},{"day":5,"score":8.2},{"day":6,"score":17.7},{"day":7,"score":19.8},{"day":8,"score":18.9},{"day":9,"score":9.3},{"day":10,"score":19.9},{"day":11,"score":5.4},{"day":12,"score":12.5},{"day":13,"score":11.5},{"day":14,"score":9.8},{"day":15,"score":15.2},{"day":16,"score":10.0},{"day":17,"score":8.3},{"day":18,"score":6.6},{"day":19,"score":8.7},{"day":20,"score":15.5},{"day":21,"score":15.0},{"day":22,"score":17.8},{"day":23,"score":27.3},{"day":24,"score":13.1},{"day":25,"score":12.9},{"day":26,"score":7.2},{"day":27,"score":19.3},{"day":28,"score":12.7},{"day":29,"score":11.6},{"day":30,"score":14.5}]}
];

// Map JSON fields → dashboard fields
const EMPLOYEES = RAW_DATA.map((e, i) => ({
  id:           e.employee_id,
  name:         e.name,
  initials:     e.initials,
  dept:         e.department,
  role:         e.role,
  score:        e.peak_score,
  level:        e.risk_label === "CRITICAL" ? "Critical"
                : e.risk_label === "HIGH"   ? "High"
                : e.risk_label === "MODERATE" ? "Moderate" : "Low",
  trend:        e.trend,
  loginTime:    `${String(e.login_hour).padStart(2,"0")}:00`,
  files:        e.files,
  priv:         e.privilege,
  usb:          e.usb,
  sentiment:    e.sentiment,
  timeline:     e.timeline,
  lastActivity: i === 0 ? "2 min ago" : i === 1 ? "15 min ago"
                : i < 4 ? `${i} hr ago` : `${i-2} days ago`,
}));

// Threat actor is always rank #1 (highest score — from real ML output)
const THREAT = EMPLOYEES[0];

// Timeline for deep-dive — real 30-day scores from Isolation Forest
const TIMELINE = THREAT.timeline.map(t => ({
  day:       t.day,
  score:     t.score,
  baseline:  28,
  threshold: 70,
}));

// Dept threat counts — computed from real ML-scored employee data
const _dmap = {};
EMPLOYEES.forEach(e => {
  if (!_dmap[e.dept]) _dmap[e.dept] = {d:e.dept, h:0, c:0};
  if (e.level === "Critical") _dmap[e.dept].c++;
  else if (e.level === "High") _dmap[e.dept].h++;
});
const DEPT = Object.values(_dmap).filter(d=>d.h+d.c>0).sort((a,b)=>(b.h+b.c)-(a.h+a.c));

// Radar — real normalized values for top threat
const RADAR_REAL = [
  {s:"Files",    v: Math.min(100, Math.round(THREAT.files/3))},
  {s:"Privilege",v: Math.min(100, THREAT.priv*10)},
  {s:"USB",      v: THREAT.usb*100},
  {s:"Email",    v: Math.round((1-THREAT.sentiment)/2*100)},
  {s:"Score",    v: Math.round(THREAT.score)},
];

const ALERT_ACTIVITY = [
  {day:"Mon",v:7},{day:"Tue",v:9},{day:"Wed",v:8},{day:"Thu",v:12},
  {day:"Fri",v:15},{day:"Sat",v:19},{day:"Sun",v:25},
];

const ML_PERF = [
  {m:"Oct",p:94.2,r:93.1,f:94.0},{m:"Nov",p:94.8,r:93.6,f:94.5},
  {m:"Dec",p:95.3,r:94.1,f:95.0},{m:"Jan",p:96.1,r:94.8,f:95.8},
  {m:"Feb",p:96.9,r:95.4,f:96.6},{m:"Mar",p:97.6,r:96.1,f:97.2},
];

const EVENTS = Array.from({length:24},(_,i)=>({
  h:`${String(i).padStart(2,"0")}:00`,
  v: i<8 ? 70+Math.random()*100 : i<14 ? 190+Math.random()*150 : 140+Math.random()*120,
}));

// Dept threat counts — computed from real ML-scored employee data
const DEPT_MAP = {};
// will be populated after EMPLOYEES is defined — see below after imports

const RADAR_DATA = [
  {s:"Files",    v:94},{s:"Privilege",v:88},{s:"USB",v:80},{s:"Email",v:82},{s:"Score",v:94},
];

// ── MICRO COMPONENTS ─────────────────────────────────────

function GlowDot({ color, size=8, pulse=false }) {
  return (
    <span style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}}>
      <span style={{width:size,height:size,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`,display:"block"}}/>
      {pulse && <span style={{position:"absolute",width:size,height:size,borderRadius:"50%",background:color,animation:"orbitPing 1.5s ease-out infinite"}}/>}
    </span>
  );
}

function CyberBadge({ level }) {
  const c = LEVEL_C[level];
  return (
    <span style={{
      background: LEVEL_BG[level],
      color: c,
      border: `1px solid ${c}60`,
      padding:"2px 10px",
      borderRadius:2,
      fontSize:10,
      fontFamily:"'Share Tech Mono',monospace",
      fontWeight:700,
      letterSpacing:1,
      textTransform:"uppercase",
      display:"inline-flex",
      alignItems:"center",
      gap:5,
    }}>
      <GlowDot color={c} size={5} pulse={level==="Critical"}/>
      {level}
    </span>
  );
}

function ScoreBar({ score, level, width=80 }) {
  const c = LEVEL_C[level];
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width,height:4,background:C.muted,borderRadius:2,overflow:"hidden"}}>
        <div style={{width:`${score}%`,height:"100%",background:c,borderRadius:2,
          boxShadow:`0 0 8px ${c}`,
          animation:"riskRise 1s ease-out"
        }}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color:c,fontFamily:"'Share Tech Mono',monospace",minWidth:24}}>{score}</span>
    </div>
  );
}

function Avatar({ initials, size=36, level }) {
  const c = level ? LEVEL_C[level] : C.cyan;
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`radial-gradient(circle at 40% 35%, #1a3050, #060e1d)`,
      border:`2px solid ${c}50`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.32, fontWeight:700, color:c,
      fontFamily:"'Orbitron',monospace",
      boxShadow:`0 0 12px ${c}30`,
      flexShrink:0,
    }}>
      {initials}
    </div>
  );
}

function Panel({ children, style={}, critical=false, glow=false, animate=true }) {
  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${critical ? C.redDim : C.border}`,
      borderRadius:6,
      position:"relative",
      overflow:"hidden",
      animation: animate ? "slideInUp 0.4s ease-out both" : "none",
      ...(critical ? {animation:"criticalPulse 2s ease-in-out infinite"} : {}),
      ...(glow ? {boxShadow:`0 0 30px ${C.cyan}10`} : {}),
      ...style,
    }}>
      {/* top accent line */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,
        background: critical
          ? `linear-gradient(90deg, transparent, ${C.red}, transparent)`
          : `linear-gradient(90deg, transparent, ${C.cyan}80, transparent)`
      }}/>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:10, color:C.cyan, fontFamily:"'Share Tech Mono',monospace",
      letterSpacing:3, textTransform:"uppercase", marginBottom:14,
      display:"flex", alignItems:"center", gap:8,
    }}>
      <div style={{width:16,height:1,background:C.cyan}}/>
      {children}
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.cyan}40,transparent)`}}/>
    </div>
  );
}

function StatCard({ label, value, sub, subColor=C.green, icon, delay=0, critical=false }) {
  return (
    <Panel style={{flex:1,minWidth:0,padding:"20px 22px",animationDelay:`${delay}ms`}} critical={critical}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{
            fontSize:10, color:C.textLow, letterSpacing:2,
            textTransform:"uppercase", marginBottom:10,
            fontFamily:"'Share Tech Mono',monospace",
          }}>{label}</div>
          <div style={{
            fontSize:30, fontWeight:900, color: critical ? C.red : C.text,
            lineHeight:1, fontFamily:"'Orbitron',monospace",
            textShadow: critical ? `0 0 20px ${C.red}60` : "none",
            animation:"countUp 0.5s ease-out",
          }}>{value}</div>
          {sub && <div style={{fontSize:11,color:subColor,marginTop:8,fontFamily:"'Share Tech Mono',monospace"}}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width:42,height:42,borderRadius:6,
            background:`linear-gradient(135deg,${C.cyan}15,${C.cyan}05)`,
            border:`1px solid ${C.cyan}30`,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{icon}</div>
        )}
      </div>
    </Panel>
  );
}

// ── TOOLTIP ──────────────────────────────────────────────
const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#050d1a",border:`1px solid ${C.cyan}40`,borderRadius:4,padding:"8px 14px",fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.textMid}}>
      <div style={{color:C.cyan,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||C.cyan}}>{p.name||p.dataKey}: <span style={{color:C.text,fontWeight:700}}>{typeof p.value==="number"?p.value.toFixed(1):p.value}</span></div>
      ))}
    </div>
  );
};

// ── EMPLOYEE TABLE ────────────────────────────────────────
function RiskTable({ employees, delay=0 }) {
  return (
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead>
        <tr style={{borderBottom:`1px solid ${C.border}`}}>
          {["#","Employee","Dept","Risk Score","Level","Trend","Last Activity","Action"].map(h=>(
            <th key={h} style={{
              padding:"8px 14px",textAlign:"left",
              fontSize:9,color:C.textLow,fontWeight:600,
              letterSpacing:2,textTransform:"uppercase",
              fontFamily:"'Share Tech Mono',monospace",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((e,i)=>(
          <tr key={e.id} className="row-hover" style={{
            borderBottom:`1px solid ${C.border}50`,
            animation:`slideInUp 0.4s ease-out both`,
            animationDelay:`${delay + i*60}ms`,
          }}>
            <td style={{padding:"13px 14px",color:C.textLow,fontSize:12,fontFamily:"'Share Tech Mono',monospace"}}>{i+1}</td>
            <td style={{padding:"13px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar initials={e.initials} size={34} level={e.level}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{e.name}</div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginTop:1}}>{e.role}</div>
                </div>
              </div>
            </td>
            <td style={{padding:"13px 14px",fontSize:11,color:C.textMid,fontFamily:"'Share Tech Mono',monospace"}}>{e.dept}</td>
            <td style={{padding:"13px 14px"}}><ScoreBar score={e.score} level={e.level}/></td>
            <td style={{padding:"13px 14px"}}><CyberBadge level={e.level}/></td>
            <td style={{padding:"13px 14px",fontSize:11,fontFamily:"'Share Tech Mono',monospace",
              color:e.trend==="Rising"?C.red:e.trend==="Declining"?C.green:C.textMid}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {e.trend==="Rising" ? <TrendingUp size={13} strokeWidth={2}/> : e.trend==="Declining" ? <TrendingDown size={13} strokeWidth={2}/> : <Minus size={13} strokeWidth={2}/>}
                {e.trend}
              </div>
            </td>
            <td style={{padding:"13px 14px",fontSize:11,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>{e.lastActivity}</td>
            <td style={{padding:"13px 14px"}}>
              <button className="cyber-btn" style={{
                background:"transparent",border:`1px solid ${C.cyan}40`,
                color:C.cyan,borderRadius:3,padding:"5px 14px",
                fontSize:11,cursor:"pointer",fontFamily:"'Share Tech Mono',monospace",
                display:"flex",alignItems:"center",gap:5,
              }}><Eye size={11} strokeWidth={2}/>ANALYZE</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── PAGE: DASHBOARD OVERVIEW ─────────────────────────────
function DashboardOverview({ attackDone }) {
  const riskDist = [
    {name:"Low",     value:620, color:C.green},
    {name:"Moderate",value:487, color:C.yellow},
    {name:"High",    value:115, color:C.orange},
    {name:"Critical",value:attackDone?34:26, color:C.red},
  ];
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:26,animation:"glitchIn 0.5s ease-out"}}>
        <div style={{fontSize:9,color:C.cyan,fontFamily:"'Share Tech Mono',monospace",letterSpacing:4,marginBottom:6}}>// SYSTEM STATUS: OPERATIONAL</div>
        <h2 style={{fontSize:26,fontWeight:900,color:C.text,margin:0,fontFamily:"'Orbitron',monospace",letterSpacing:2}}>DASHBOARD OVERVIEW</h2>
        <p style={{color:C.textLow,fontSize:11,margin:"6px 0 0",fontFamily:"'Share Tech Mono',monospace"}}>REAL-TIME BEHAVIORAL RISK INTELLIGENCE — FRI MAR 06 2026</p>
      </div>

      <div style={{display:"flex",gap:14,marginBottom:18}}>
        <StatCard label="Total Employees"    value="1,248" sub="+3 onboarded today" icon={<Users size={18} color={C.cyan}/>} delay={0}/>
        <StatCard label="Active Alerts"      value={attackDone?"31":"24"} sub={attackDone?"+14 today":"+7 today"} subColor={C.orange} icon={<Zap size={18} color={C.orange}/>} delay={60}/>
        <StatCard label="High Risk"          value={attackDone?"48":"41"} sub="+5 this week" subColor={C.orange} icon={<Flame size={18} color={C.orange}/>} delay={120}/>
        <StatCard label="Critical Threats"   value={attackDone?"8":"6"} sub="+2 urgent" subColor={C.red} icon={<Crosshair size={18} color={C.red}/>} delay={180} critical={attackDone}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,marginBottom:14}}>
        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Alert Activity — 7 Days</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={ALERT_ACTIVITY}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.red} stopOpacity={0.4}/>
                  <stop offset="100%" stopColor={C.red} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fill:C.textLow,fontSize:10,fontFamily:"'Share Tech Mono',monospace"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.textLow,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="v" name="Alerts" stroke={C.red} fill="url(#ag)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Risk Distribution</SectionLabel>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
            <PieChart width={130} height={130}>
              <Pie data={riskDist} cx={60} cy={60} innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                {riskDist.map((e,i)=><Cell key={i} fill={e.color} style={{filter:`drop-shadow(0 0 4px ${e.color})`}}/>)}
              </Pie>
            </PieChart>
          </div>
          {riskDist.map(r=>(
            <div key={r.name} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:11,fontFamily:"'Share Tech Mono',monospace",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.textMid,display:"flex",alignItems:"center",gap:7}}>
                <GlowDot color={r.color} size={6}/>
                {r.name}
              </span>
              <span style={{color:r.color,fontWeight:700}}>{r.value} <span style={{color:C.textLow,fontWeight:400}}>{Math.round(r.value/1248*100)}%</span></span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel style={{padding:"22px"}} animate={false}>
        <SectionLabel>Employee Risk Ranking — Top Threats</SectionLabel>
        <RiskTable employees={EMPLOYEES.slice(0,5)} delay={200}/>
      </Panel>
    </div>
  );
}

// ── PAGE: LEADERBOARD ─────────────────────────────────────
function RiskLeaderboard() {
  const top3 = EMPLOYEES.slice(0,3);
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:9,color:C.cyan,fontFamily:"'Share Tech Mono',monospace",letterSpacing:4,marginBottom:6}}>// THREAT INTELLIGENCE</div>
        <h2 style={{fontSize:26,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace",letterSpacing:2}}>RISK LEADERBOARD</h2>
        <p style={{color:C.textLow,fontSize:11,marginTop:6,fontFamily:"'Share Tech Mono',monospace"}}>EMPLOYEES RANKED BY BEHAVIORAL THREAT SCORE</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18}}>
        {top3.map((e,i)=>{
          const c = LEVEL_C[e.level];
          return (
            <Panel key={e.id} style={{padding:"22px",animationDelay:`${i*100}ms`}} critical={e.level==="Critical"}>
              <div style={{position:"absolute",top:16,right:16}}>
                {i===0 ? <Trophy size={22} color="#ffd700" strokeWidth={1.5}/> : i===1 ? <Trophy size={20} color="#94a3b8" strokeWidth={1.5}/> : <Trophy size={18} color="#cd7f32" strokeWidth={1.5}/>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                <div style={{position:"relative"}}>
                  <Avatar initials={e.initials} size={48} level={e.level}/>
                  <div style={{
                    position:"absolute",bottom:-4,right:-4,
                    width:20,height:20,borderRadius:"50%",
                    background:C.panel,border:`2px solid ${c}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:9,fontWeight:700,color:c,
                    fontFamily:"'Orbitron',monospace",
                  }}>{i+1}</div>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif"}}>{e.name}</div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>{e.dept}</div>
                </div>
              </div>
              <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:6}}>RISK SCORE</div>
              <div style={{width:"100%",height:4,background:C.muted,borderRadius:2,marginBottom:10,overflow:"hidden"}}>
                <div style={{width:`${e.score}%`,height:"100%",background:c,borderRadius:2,boxShadow:`0 0 10px ${c}`,animation:"riskRise 1s ease-out"}}/>
              </div>
              <div style={{fontSize:42,fontWeight:900,color:c,fontFamily:"'Orbitron',monospace",
                textShadow:`0 0 20px ${c}80`,lineHeight:1,marginBottom:12}}>{e.score}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <CyberBadge level={e.level}/>
                <span style={{fontSize:11,color:C.red,fontFamily:"'Share Tech Mono',monospace"}}>↑ RISING</span>
              </div>
            </Panel>
          );
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:14,marginBottom:14}}>
        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Risk Score Comparison — All Employees</SectionLabel>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={EMPLOYEES.map(e=>({n:e.name.split(" ")[0],s:e.score,l:e.level}))}>
              <XAxis dataKey="n" tick={{fill:C.textLow,fontSize:10,fontFamily:"'Share Tech Mono',monospace"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:C.textLow,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="s" name="Score" radius={[3,3,0,0]}>
                {EMPLOYEES.map((e,i)=>(
                  <Cell key={i} fill={LEVEL_C[e.level]} style={{filter:`drop-shadow(0 0 4px ${LEVEL_C[e.level]})`}}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Threat Profile</SectionLabel>
          <div style={{fontSize:11,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginBottom:8}}>{THREAT.name} — #1</div>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={RADAR_REAL}>
              <PolarGrid stroke={C.border}/>
              <PolarAngleAxis dataKey="s" tick={{fill:C.textLow,fontSize:9,fontFamily:"'Share Tech Mono',monospace"}}/>
              <Radar dataKey="v" stroke={C.red} fill={C.red} fillOpacity={0.2} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
          {[["Files",`${THREAT.files}`],["Priv.",`${THREAT.priv}`],["USB",`${THREAT.usb}`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:11,fontFamily:"'Share Tech Mono',monospace",borderTop:`1px solid ${C.border}`}}>
              <span style={{color:C.textLow}}>{k}</span>
              <span style={{color:C.red,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel style={{padding:"22px"}} animate={false}>
        <SectionLabel>Full Rankings</SectionLabel>
        <RiskTable employees={EMPLOYEES} delay={100}/>
      </Panel>
    </div>
  );
}

// ── PAGE: EMPLOYEE DEEP DIVE ──────────────────────────────
function EmployeeDeepDive() {
  const emp = THREAT;
  const loginStr = `${String(emp.loginTime).padStart(5,"0")}`;
  const signals = [
    {s:"After-Hours Login",     base:"08:30–18:00",        obs:loginStr,               dev:"Outside normal window",     sev:"Critical"},
    {s:"File Access Volume",    base:"~25 files/day",      obs:`${emp.files} files`,   dev:`+${Math.round(emp.files/25*100-100)}% over baseline`, sev:"Critical"},
    {s:"Privilege Escalation",  base:"0/week",             obs:`${emp.priv} attempts`, dev:`${emp.priv} unauthorized attempts`, sev:"Critical"},
    {s:"USB / Removable Media", base:"0 connections",      obs:`${emp.usb} device(s)`, dev:"Policy violation",          sev:"Critical"},
    {s:"Email Sentiment Score", base:"Neutral (0–+0.5)",   obs:`${emp.sentiment}`,     dev:"Strongly negative",         sev:"High"},
  ];
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26}}>
        <div>
          <div style={{fontSize:9,color:C.cyan,fontFamily:"'Share Tech Mono',monospace",letterSpacing:4,marginBottom:6}}>// BEHAVIORAL ANALYSIS</div>
          <h2 style={{fontSize:26,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace",letterSpacing:2}}>EMPLOYEE DEEP DIVE</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:C.panelAlt,border:`1px solid ${C.redDim}`,borderRadius:4,padding:"10px 16px"}}>
          <Avatar initials={emp.initials} size={28} level={emp.level}/>
          <span style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif"}}>{emp.name}</span>
          <CyberBadge level={emp.level}/>
        </div>
      </div>

      {/* profile */}
      <Panel style={{padding:"22px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}} critical>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div style={{position:"relative"}}>
            <Avatar initials={emp.initials} size={58} level={emp.level}/>
            <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:`2px solid ${C.red}`,animation:"pulseGlow 2s ease-in-out infinite",color:C.red}}/>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace"}}>{emp.name}</span>
              <CyberBadge level={emp.level}/>
            </div>
            <div style={{fontSize:12,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>{emp.role} — {emp.dept}</div>
            <div style={{fontSize:11,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginTop:4}}>LAST ACTIVITY: 2 MIN AGO</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:4}}>RISK SCORE</div>
          <div style={{fontSize:64,fontWeight:900,color:C.red,fontFamily:"'Orbitron',monospace",lineHeight:1,
            textShadow:`0 0 30px ${C.red}80, 0 0 60px ${C.red}40`}}>{emp.score}</div>
          <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>/ 100</div>
        </div>
      </Panel>

      {/* timeline */}
      <Panel style={{padding:"22px",marginBottom:14}} animate={false}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SectionLabel>30-Day Risk Score Timeline</SectionLabel>
          <span style={{
            background:"rgba(255,30,80,0.15)",border:`1px solid ${C.redDim}`,
            color:C.red,padding:"4px 12px",borderRadius:2,fontSize:10,
            fontFamily:"'Share Tech Mono',monospace",fontWeight:700,letterSpacing:1,
          }}>⚠ ESCALATING PATTERN</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={TIMELINE}>
            <defs>
              <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={C.cyan} stopOpacity={0.8}/>
                <stop offset="83%"  stopColor={C.cyan} stopOpacity={0.8}/>
                <stop offset="100%" stopColor={C.red}  stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={d=>d%5===0?`D${d}`:""}/>
            <YAxis domain={[0,100]} tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>} labelFormatter={d=>`Day ${d}`}/>
            <Line type="monotone" dataKey="score"     stroke="url(#tg)" strokeWidth={2.5} dot={false} name="Score"/>
            <Line type="monotone" dataKey="baseline"  stroke={C.border} strokeWidth={1} strokeDasharray="4 4" dot={false} name="Baseline"/>
            <Line type="monotone" dataKey="threshold" stroke={`${C.red}60`} strokeWidth={1} strokeDasharray="4 4" dot={false} name="Threshold"/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:20,marginTop:10}}>
          {[["Risk Score","url(#tg)","solid"],["Org. Baseline",C.border,"dashed"],["High Risk Threshold",C.red,"dashed"]].map(([l,c,s])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>
              <div style={{width:20,height:2,background:c,opacity:s==="dashed"?0.5:1}}/>
              {l}
            </div>
          ))}
        </div>
      </Panel>

      {/* behavior indicators */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:1,marginBottom:12}}>BEHAVIOR INDICATORS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {[
            {Icon:LogIn,    label:"Login Time",      value:loginStr,              sub:"Last recorded",      bad:false},
            {Icon:FolderOpen,label:"Files Accessed", value:`${emp.files}`,        sub:"Files past 24h",      bad:true},
            {Icon:KeyRound, label:"Priv. Attempts",  value:`${emp.priv}`,         sub:"Unauthorized",        bad:true},
            {Icon:Usb,      label:"USB Activity",    value:`${emp.usb} device(s)`,sub:"External connected",  bad:true},
            {Icon:Mail,     label:"Email Sentiment", value:`${emp.sentiment}`,    sub:"Negative tone",       bad:true},
          ].map((b,i)=>(
            <Panel key={b.label} style={{padding:"16px",animationDelay:`${i*80}ms`}} critical={b.bad}>
              <div style={{
                width:34,height:34,borderRadius:6,marginBottom:12,
                background:`linear-gradient(135deg,${b.bad?C.red:C.cyan}20,${b.bad?C.red:C.cyan}08)`,
                border:`1px solid ${b.bad?C.red:C.cyan}30`,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}><b.Icon size={16} color={b.bad?C.red:C.cyan} strokeWidth={1.8}/></div>
              <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginBottom:4}}>{b.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:b.bad?C.red:C.text,fontFamily:"'Orbitron',monospace",marginBottom:4}}>{b.value}</div>
              <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>{b.sub}</div>
              {b.bad && <div style={{fontSize:9,color:C.red,marginTop:8,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>⚠ ANOMALOUS</div>}
            </Panel>
          ))}
        </div>
      </div>

      {/* signal breakdown */}
      <Panel style={{padding:"22px"}} animate={false}>
        <SectionLabel>Anomaly Signal Breakdown</SectionLabel>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Signal","Baseline","Observed","Deviation","Severity"].map(h=>(
                <th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:9,color:C.textLow,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Share Tech Mono',monospace"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signals.map((r,i)=>(
              <tr key={r.s} className="row-hover" style={{borderBottom:`1px solid ${C.border}40`,animation:`slideInUp 0.4s ease-out both`,animationDelay:`${i*80}ms`}}>
                <td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif"}}>{r.s}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>{r.base}</td>
                <td style={{padding:"12px 14px",fontSize:12,fontWeight:700,color:C.red,fontFamily:"'Share Tech Mono',monospace"}}>{r.obs}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.textMid}}>{r.dev}</td>
                <td style={{padding:"12px 14px"}}><CyberBadge level={r.sev}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

// ── PAGE: ALERT CENTER ────────────────────────────────────
const ALERTS = [
  { id:1, type:"Data Exfiltration Attempt", level:"Critical", status:"Investigating",
    name: RAW_DATA[0].name, dept: RAW_DATA[0].department, time:"Today, 02:14 AM",
    desc:`Unusual after-hours access detected. Employee accessed ${RAW_DATA[0].files} sensitive files across 8 restricted directories. USB device connected and 2.4GB of data transferred to external drive.`,
    actions:["Immediately suspend user account access","Isolate user's workstation from network","Preserve forensic evidence on USB device","Notify CISO and legal department","Initiate HR escalation protocol"],
  },
  { id:2, type:"Privilege Escalation",        level:"Critical", status:"Open",          name: RAW_DATA[1].name, dept:RAW_DATA[1].department, time:"Today, 11:48 PM", desc:"", actions:[] },
  { id:3, type:"Unusual Data Access Pattern", level:"High",     status:"Open",          name: RAW_DATA[2].name, dept:RAW_DATA[2].department, time:"Today, 07:22 PM", desc:"", actions:[] },
  { id:4, type:"Sensitive Document Access",   level:"High",     status:"Investigating", name: RAW_DATA[3].name, dept:RAW_DATA[3].department, time:"Today, 06:55 PM", desc:"", actions:[] },
];

function AlertCenter() {
  const [expanded, setExpanded] = useState(1);
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26}}>
        <div>
          <div style={{fontSize:9,color:C.red,fontFamily:"'Share Tech Mono',monospace",letterSpacing:4,marginBottom:6,animation:"neonText 2s ease-in-out infinite"}}>// ⚠ ACTIVE THREATS DETECTED</div>
          <h2 style={{fontSize:26,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace",letterSpacing:2}}>ALERT CENTER</h2>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[["2 Critical",C.red],[" 2 High",C.orange]].map(([t,c])=>(
            <span key={t} style={{
              background:`${c}15`,border:`1px solid ${c}50`,color:c,
              padding:"6px 16px",borderRadius:2,fontSize:11,fontWeight:700,
              fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,
              display:"flex",alignItems:"center",gap:6,
            }}>
              <GlowDot color={c} pulse size={7}/>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* filters */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <input placeholder="Search alerts by name, type, department..." style={{
          flex:1,background:C.panelAlt,border:`1px solid ${C.border}`,
          borderRadius:3,padding:"10px 16px",color:C.textMid,fontSize:12,
          outline:"none",fontFamily:"'Share Tech Mono',monospace",minWidth:260,
        }}/>
        <div style={{display:"flex",gap:6}}>
          {["ALL","CRITICAL","HIGH"].map((f,i)=>(
            <button key={f} className="cyber-btn" style={{
              background:i===0?`${C.cyan}15`:C.panelAlt,
              border:`1px solid ${i===0?C.cyan:C.border}`,
              color:i===0?C.cyan:C.textLow,borderRadius:3,
              padding:"8px 14px",fontSize:10,cursor:"pointer",
              fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,
            }}>{f}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["ALL","OPEN","INVESTIGATING","RESOLVED"].map((f,i)=>(
            <button key={f} className="cyber-btn" style={{
              background:i===0?`${C.cyan}15`:C.panelAlt,
              border:`1px solid ${i===0?C.cyan:C.border}`,
              color:i===0?C.cyan:C.textLow,borderRadius:3,
              padding:"8px 14px",fontSize:10,cursor:"pointer",
              fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
        {ALERTS.map((a,i)=>(
          <div key={a.id} style={{
            background:C.panel,
            border:`1px solid ${LEVEL_C[a.level]}40`,
            borderLeft:`3px solid ${LEVEL_C[a.level]}`,
            borderRadius:4,overflow:"hidden",
            animation:`slideInUp 0.4s ease-out both`,
            animationDelay:`${i*80}ms`,
            ...(a.level==="Critical"?{animation:"criticalPulse 3s ease-in-out infinite"}:{}),
          }}>
            <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}
              onClick={()=>setExpanded(expanded===a.id?null:a.id)}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:26,flexShrink:0}}>
                  {a.level==="Critical" ? <ShieldAlert size={22} color={C.red} strokeWidth={1.8}/> : <AlertTriangle size={20} color={C.orange} strokeWidth={1.8}/>}
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:0.5}}>{a.type}</span>
                    <CyberBadge level={a.level}/>
                    <span style={{
                      background:a.status==="Investigating"?`${C.yellow}15`:`${C.textLow}20`,
                      border:`1px solid ${a.status==="Investigating"?C.yellow:C.textLow}40`,
                      color:a.status==="Investigating"?C.yellow:C.textLow,
                      padding:"2px 10px",borderRadius:2,fontSize:9,fontFamily:"'Share Tech Mono',monospace",fontWeight:700,letterSpacing:1,
                    }}>● {a.status.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginTop:4}}>
                    {a.name} · {a.dept} · {a.time}
                  </div>
                </div>
              </div>
              <button className="cyber-btn" style={{
                background:"transparent",border:`1px solid ${C.cyan}40`,color:C.cyan,
                borderRadius:3,padding:"6px 16px",fontSize:10,cursor:"pointer",
                fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,flexShrink:0,
                display:"flex",alignItems:"center",gap:5,
              }}><Eye size={11} strokeWidth={2}/>ANALYZE</button>
            </div>

            {expanded===a.id && a.desc && (
              <div style={{padding:"0 20px 20px",borderTop:`1px solid ${C.border}40`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,margin:"18px 0"}}>
                  <div>
                    <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Incident Description</div>
                    <p style={{fontSize:13,color:C.textMid,lineHeight:1.8,margin:0}}>{a.desc}</p>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Recommended Actions</div>
                    {a.actions.map((ac,j)=>(
                      <div key={j} style={{display:"flex",gap:10,marginBottom:10,fontSize:12,color:C.textMid,alignItems:"flex-start"}}>
                        <span style={{
                          width:20,height:20,borderRadius:2,flexShrink:0,
                          background:`${C.red}15`,border:`1px solid ${C.red}40`,
                          color:C.red,display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:9,fontWeight:700,fontFamily:"'Share Tech Mono',monospace",
                        }}>{j+1}</span>
                        {ac}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[
                    {l:"SUSPEND ACCOUNT",   bg:C.red,         color:"white",    border:C.red,    icon:<Lock size={12} strokeWidth={2}/>},
                    {l:"ENHANCED MONITOR",  bg:"transparent", color:C.cyan,     border:C.cyan,   icon:<Eye size={12} strokeWidth={2}/>},
                    {l:"VIEW FULL LOG",     bg:"transparent", color:C.textMid,  border:C.border, icon:<FileWarning size={12} strokeWidth={2}/>},
                  ].map(b=>(
                    <button key={b.l} className="cyber-btn" style={{
                      background:b.bg,border:`1px solid ${b.border}`,color:b.color,
                      borderRadius:3,padding:"8px 18px",fontSize:10,cursor:"pointer",
                      fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,fontWeight:700,
                      display:"flex",alignItems:"center",gap:6,
                    }}>{b.icon}{b.l}</button>
                  ))}
                  <button className="cyber-btn" style={{
                    marginLeft:"auto",
                    background:`${C.green}10`,border:`1px solid ${C.green}40`,color:C.green,
                    borderRadius:3,padding:"8px 18px",fontSize:10,cursor:"pointer",
                    fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,fontWeight:700,
                    display:"flex",alignItems:"center",gap:6,
                  }}><CheckCircle size={12} strokeWidth={2}/>MARK RESOLVED</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:14}}>
        {[
          ["Mean Time to Detect","4.2 min","↓ 12% from last week",C.green],
          ["Mean Time to Respond","18.7 min","↑ 3% from last week",C.orange],
          ["False Positive Rate","2.4%","ML accuracy 97.6%",C.green],
          ["Alerts Resolved (30d)","218","97.3% resolution",C.green],
        ].map(([l,v,s,c])=>(
          <Panel key={l} style={{flex:1,padding:"18px"}} animate={false}>
            <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:8}}>{l}</div>
            <div style={{fontSize:24,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace"}}>{v}</div>
            <div style={{fontSize:10,color:c,marginTop:6,fontFamily:"'Share Tech Mono',monospace"}}>{s}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

// ── PAGE: SYSTEM ANALYTICS ────────────────────────────────
function SystemAnalytics() {
  const modelDist = [
    {name:"Behavioral ML",v:38,c:C.cyan},{name:"NLP Sentiment",v:22,c:C.purple},
    {name:"Network Graph",v:18,c:C.green},{name:"Time Series",v:14,c:C.yellow},{name:"Anomaly Detect.",v:8,c:C.red},
  ];
  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:9,color:C.cyan,fontFamily:"'Share Tech Mono',monospace",letterSpacing:4,marginBottom:6}}>// PLATFORM HEALTH</div>
        <h2 style={{fontSize:26,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace",letterSpacing:2}}>SYSTEM ANALYTICS</h2>
        <p style={{color:C.textLow,fontSize:11,marginTop:6,fontFamily:"'Share Tech Mono',monospace"}}>ML MODEL HEALTH, INFRASTRUCTURE METRICS</p>
      </div>

      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {[
          ["Events Processed","4.8M","+12.3%",C.green,<Activity size={16} color={C.green}/>,0],
          ["ML Predictions","218K","+8.7%",C.green,<Cpu size={16} color={C.green}/>,60],
          ["Model Accuracy","97.6%","+0.5%",C.green,<Radio size={16} color={C.green}/>,120],
          ["Detection Latency","1.4s","-0.3s",C.green,<Clock size={16} color={C.green}/>,180],
          ["Data Sources","47","+2 new",C.cyan,<Database size={16} color={C.cyan}/>,240],
          ["False Positives","26","-18%",C.green,<CheckCircle size={16} color={C.green}/>,300],
        ].map(([l,v,s,c,icon,d])=>(
          <Panel key={l} style={{flex:"1 1 130px",padding:"16px",animationDelay:`${d}ms`}}>
            <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,marginBottom:6,lineHeight:1.4}}>{l}</div>
            <div style={{fontSize:20,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace"}}>{v}</div>
            <div style={{fontSize:10,color:c,marginTop:6,fontFamily:"'Share Tech Mono',monospace"}}>{s}</div>
          </Panel>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>ML Model Performance — 6 Months</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ML_PERF}>
              <XAxis dataKey="m" tick={{fill:C.textLow,fontSize:10,fontFamily:"'Share Tech Mono',monospace"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[88,100]} tick={{fill:C.textLow,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Line type="monotone" dataKey="p" name="Precision" stroke={C.purple} strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="r" name="Recall"    stroke={C.cyan}   strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="f" name="F1 Score"  stroke={C.green}  strokeWidth={2.5} dot={{r:4,fill:C.green,strokeWidth:0}}/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:20,marginTop:10}}>
            {[["Precision",C.purple],["Recall",C.cyan],["F1 Score",C.green]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>
                <div style={{width:16,height:2,background:c}}/>
                {l}
              </div>
            ))}
          </div>
        </Panel>

        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Event Processing Load — 24h</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={EVENTS}>
              <defs>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.purple} stopOpacity={0.5}/>
                  <stop offset="100%" stopColor={C.red}    stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="h" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} interval={5}/>
              <YAxis tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="v" name="Events" stroke={C.red} fill="url(#eg)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:14,marginBottom:14}}>
        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Threats by Department</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPT} layout="vertical">
              <XAxis type="number" tick={{fill:C.textLow,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="d" type="category" tick={{fill:C.textLow,fontSize:10,fontFamily:"'Share Tech Mono',monospace"}} axisLine={false} tickLine={false} width={76}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="h" name="High"     fill={C.orange} radius={[0,3,3,0]} stackId="a"/>
              <Bar dataKey="c" name="Critical" fill={C.red}    radius={[0,3,3,0]} stackId="a"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,marginTop:10}}>
            {[["High",C.orange],["Critical",C.red]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>
                <GlowDot color={c} size={6}/>
                {l}
              </div>
            ))}
          </div>
        </Panel>

        <Panel style={{padding:"22px"}} animate={false}>
          <SectionLabel>Detection Model Mix</SectionLabel>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <PieChart width={130} height={130}>
              <Pie data={modelDist} cx={60} cy={60} innerRadius={36} outerRadius={56} dataKey="v" strokeWidth={0}>
                {modelDist.map((e,i)=><Cell key={i} fill={e.c} style={{filter:`drop-shadow(0 0 4px ${e.c})`}}/>)}
              </Pie>
            </PieChart>
          </div>
          {modelDist.map(m=>(
            <div key={m.name} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:10,fontFamily:"'Share Tech Mono',monospace",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.textMid,display:"flex",alignItems:"center",gap:6}}><GlowDot color={m.c} size={6}/>{m.name}</span>
              <span style={{color:m.c,fontWeight:700}}>{m.v}%</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* infra health */}
      <Panel style={{padding:"22px"}} animate={false}>
        <SectionLabel>Infrastructure Health</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[
            {n:"ML Inference Engine",     s:"OPERATIONAL", up:"99.98%", lat:"1.4s",  c:C.green},
            {n:"Event Stream Processor",  s:"OPERATIONAL", up:"99.95%", lat:"0.2s",  c:C.green},
            {n:"Data Lake (S3)",           s:"OPERATIONAL", up:"100%",   lat:"—",     c:C.green},
            {n:"Alert Notification Svc",  s:"DEGRADED",    up:"97.2%",  lat:"4.1s",  c:C.yellow},
          ].map(sv=>(
            <div key={sv.n} style={{
              background:C.panelAlt,border:`1px solid ${sv.c}25`,
              borderRadius:4,padding:"16px",
            }}>
              <div style={{fontSize:9,color:sv.c,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                <GlowDot color={sv.c} size={6} pulse={sv.s==="DEGRADED"}/>
                {sv.s}
              </div>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10,fontFamily:"'Rajdhani',sans-serif"}}>{sv.n}</div>
              {[["Uptime",sv.up],["Avg Latency",sv.lat]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:10,fontFamily:"'Share Tech Mono',monospace"}}>
                  <span style={{color:C.textLow}}>{k}</span>
                  <span style={{color:C.textMid}}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── NAV ITEMS ─────────────────────────────────────────────
const NAV = [
  {id:"overview",    label:"Dashboard Overview", Icon: LayoutDashboard},
  {id:"leaderboard", label:"Risk Leaderboard",   Icon: Trophy},
  {id:"deepdive",    label:"Employee Deep Dive", Icon: UserSearch},
  {id:"alerts",      label:"Alert Center",       Icon: BellRing},
  {id:"analytics",   label:"System Analytics",   Icon: BarChart3},
];

// ── APP ───────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("overview");
  const [attack, setAttack]       = useState(false);
  const [attackStage, setStage]   = useState(0); // 0=idle 1=flash 2=log 3=spike 4=done
  const [liveScore, setLiveScore] = useState(THREAT.score);
  const [logLines, setLogLines]   = useState([]);
  const [tick, setTick]           = useState(0);

  // live clock tick
  useEffect(()=>{ const t=setInterval(()=>setTick(x=>x+1),1000); return()=>clearInterval(t); },[]);

  // ── ATTACK SEQUENCE ──────────────────────────────────────
  // Stage 1 (0ms)   : Red flash overlay — "INTRUSION DETECTED"
  // Stage 2 (800ms) : Terminal log starts printing live
  // Stage 3 (2800ms): Risk score counter animates 22 → 94
  // Stage 4 (4200ms): Navigate to Alert Center, show new alert
  // ─────────────────────────────────────────────────────────
  const ATTACK_LOGS = [
    { t:0,    text:`[SYSTEM] Behavioral anomaly engine triggered`,                                          color: C.yellow },
    { t:300,  text:`[TARGET] Flagging employee: ${THREAT.name} · ${THREAT.id} · ${THREAT.dept}`,           color: C.orange },
    { t:600,  text:`[DETECT] Login hour: ${THREAT.loginTime} — deviation from 09:00 baseline`,             color: C.orange },
    { t:900,  text:`[DETECT] Files accessed: ${THREAT.files} in 6h window (+${Math.round(THREAT.files/25*100-100)}% over avg)`, color: C.red },
    { t:1200, text:`[DETECT] Privilege escalation attempts: ${THREAT.priv} (baseline: 0/week)`,            color: C.red },
    { t:1500, text:`[DETECT] USB device connected — 2.4GB outbound transfer initiated`,                    color: C.red },
    { t:1800, text:`[DETECT] Email sentiment score: ${THREAT.sentiment} (threshold: < 0.0)`,               color: C.red },
    { t:2100, text:`[MODEL]  Isolation Forest decision_function → anomaly_score: -0.847`,                  color: C.cyan },
    { t:2400, text:`[SCORE]  AccessAnomaly   = ${Math.round(THREAT.files/3)} × 0.40  =  ${(Math.round(THREAT.files/3)*0.40).toFixed(1)}`, color: C.cyan },
    { t:2700, text:`[SCORE]  BehavioralDrift = ${Math.min(100,Math.round(Math.abs(parseInt(THREAT.loginTime)-9)*8+THREAT.usb*40))} × 0.35  =  ${(Math.min(100,Math.round(Math.abs(parseInt(THREAT.loginTime)-9)*8+THREAT.usb*40))*0.35).toFixed(1)}`, color: C.cyan },
    { t:3000, text:`[SCORE]  SentimentShift  = ${Math.round((1-THREAT.sentiment)/2*100)} × 0.25  =  ${(Math.round((1-THREAT.sentiment)/2*100)*0.25).toFixed(1)}`, color: C.cyan },
    { t:3200, text:`[SCORE]  ─────────────────────────────────────────────────`,                          color: C.textLow },
    { t:3400, text:`[SCORE]  IRI = ${THREAT.score.toFixed(1)} → CLASSIFICATION: CRITICAL 🚨`,             color: C.green },
    { t:3700, text:`[ALERT]  Auto-alert dispatched to SOC team — Priority P0`,                             color: C.red },
    { t:4000, text:`[ACTION] Navigating to Alert Center... Stand by.`,                                     color: C.textMid },
  ];

  const logEndRef = useRef(null);
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior:"smooth" });
  }, [logLines]);

  function handleAttack() {
    if (attack) return; // prevent double-trigger

    // ── STAGE 1 (0ms): Red screen flash ──────────────────────
    setStage(1);
    setLogLines([]);
    setLiveScore(18); // start low — animates up

    // ── STAGE 2 (600ms): Terminal log starts printing ─────────
    setTimeout(() => setStage(2), 600);

    ATTACK_LOGS.forEach(({ t, text, color }) => {
      setTimeout(() => {
        setLogLines(prev => [...prev, { text, color }]);
      }, 800 + t);
    });

    // ── STAGE 3 (2400ms): Risk score counter 18 → 94.5 ───────
    setTimeout(() => {
      setStage(3);
      let current = 18;
      const target = THREAT.score;
      const interval = setInterval(() => {
        current = Math.min(current + 1.8, target);
        setLiveScore(parseFloat(current.toFixed(1)));
        if (current >= target) clearInterval(interval);
      }, 35);
    }, 2400);

    // ── STAGE 4 (5400ms): Navigate to Alert Center ────────────
    setTimeout(() => {
      setAttack(true);
      setStage(4);
      setPage("alerts");
    }, 5400);
  }

  const now = new Date();
  const timeStr = now.toTimeString().slice(0,8);

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden",position:"relative",fontFamily:"'Rajdhani',sans-serif"}}>

        {/* ── GRID BACKGROUND ── */}
        <div style={{
          position:"fixed",inset:0,
          backgroundImage:`linear-gradient(${C.cyan}06 1px,transparent 1px),linear-gradient(90deg,${C.cyan}06 1px,transparent 1px)`,
          backgroundSize:"40px 40px",
          animation:"gridScroll 8s linear infinite",
          pointerEvents:"none",zIndex:0,
        }}/>

        {/* ── SCANLINE ── */}
        <div style={{
          position:"fixed",top:0,left:0,right:0,height:"3px",
          background:`linear-gradient(transparent,${C.cyan}15,transparent)`,
          animation:"scanline 6s linear infinite",
          pointerEvents:"none",zIndex:1,opacity:0.4,
        }}/>

        {/* ── STAGE 1: Full-screen red flash ── */}
        {attackStage === 1 && (
          <div style={{
            position:"fixed",inset:0,zIndex:199,
            background:`radial-gradient(ellipse at center, ${C.red}25 0%, transparent 70%)`,
            animation:"fadeIn 0.2s ease-out",
            pointerEvents:"none",
          }}/>
        )}

        {/* ── ATTACK SEQUENCE OVERLAY ── */}
        {(attackStage === 1 || attackStage === 2 || attackStage === 3) && (
          <div style={{
            position:"fixed",inset:0,zIndex:200,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(0,0,0,0.85)",
            backdropFilter:"blur(6px)",
            animation:"fadeIn 0.3s ease-out",
          }}>
            <div style={{
              width:640,
              background:"#05090f",
              border:`1px solid ${C.red}`,
              borderRadius:8,
              boxShadow:`0 0 80px ${C.red}30, 0 0 160px ${C.red}10`,
              overflow:"hidden",
              animation:"criticalPulse 2s ease-in-out infinite",
            }}>

              {/* ── Header bar ── */}
              <div style={{
                background:`linear-gradient(90deg,${C.red}20,${C.red}08)`,
                borderBottom:`1px solid ${C.red}40`,
                padding:"14px 20px",
                display:"flex",alignItems:"center",justifyContent:"space-between",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <ShieldX size={20} color={C.red} style={{filter:`drop-shadow(0 0 8px ${C.red})`}}/>
                  <span style={{
                    fontSize:13,fontWeight:900,color:C.red,
                    fontFamily:"'Orbitron',monospace",letterSpacing:3,
                    textShadow:`0 0 15px ${C.red}`,
                  }}>INSIDER THREAT DETECTED</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <GlowDot color={C.red} pulse size={8}/>
                  <span style={{fontSize:10,color:C.red,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2}}>LIVE</span>
                </div>
              </div>

              {/* ── Employee identity ── */}
              <div style={{
                padding:"16px 20px",
                borderBottom:`1px solid ${C.border}`,
                display:"flex",alignItems:"center",gap:14,
                background:"rgba(255,30,80,0.04)",
              }}>
                <Avatar initials={THREAT.initials} size={44} level="Critical"/>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace"}}>{THREAT.name}</div>
                  <div style={{fontSize:11,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginTop:3}}>
                    {THREAT.role} · {THREAT.dept} · {THREAT.id}
                  </div>
                </div>
                {/* Live risk score counter */}
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2,marginBottom:4}}>RISK INDEX</div>
                  <div style={{
                    fontSize:44,fontWeight:900,
                    fontFamily:"'Orbitron',monospace",
                    color: liveScore > 80 ? C.red : liveScore > 50 ? C.orange : C.yellow,
                    textShadow:`0 0 30px ${liveScore > 80 ? C.red : C.orange}`,
                    lineHeight:1,
                    transition:"color 0.3s",
                  }}>{liveScore.toFixed(1)}</div>
                  <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>/ 100</div>
                </div>
              </div>

              {/* ── Risk score bar ── */}
              <div style={{padding:"12px 20px 4px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{
                  width:"100%",height:6,
                  background:C.muted,borderRadius:3,overflow:"hidden",
                }}>
                  <div style={{
                    width:`${liveScore}%`,height:"100%",borderRadius:3,
                    background:`linear-gradient(90deg,${C.yellow},${C.orange},${C.red})`,
                    boxShadow:`0 0 12px ${C.red}`,
                    transition:"width 0.1s linear",
                  }}/>
                </div>
                <div style={{
                  display:"flex",justifyContent:"space-between",
                  fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",marginTop:6,
                }}>
                  <span>LOW</span><span>MODERATE</span><span>HIGH</span><span style={{color:C.red}}>CRITICAL</span>
                </div>
              </div>

              {/* ── Terminal log ── */}
              <div style={{
                padding:"14px 20px",
                fontFamily:"'Share Tech Mono',monospace",
                fontSize:11,
                lineHeight:1.9,
                height:240,
                overflowY:"auto",
                background:"#020609",
              }}>
                {logLines.length === 0 && (
                  <span style={{color:C.textLow}}>// initializing anomaly engine...<span style={{animation:"blink 1s step-end infinite",display:"inline-block",width:8,height:12,background:C.cyan,verticalAlign:"middle",marginLeft:4}}/></span>
                )}
                {logLines.map((line, i) => (
                  <div key={i} style={{
                    color: line.color,
                    animation:"slideInUp 0.2s ease-out",
                    opacity: i < logLines.length - 1 ? 0.7 : 1,
                  }}>
                    <span style={{color:C.textLow,marginRight:8}}>{String(i).padStart(2,"0")}</span>
                    {line.text}
                    {i === logLines.length - 1 && (
                      <span style={{
                        display:"inline-block",width:7,height:12,
                        background:line.color,verticalAlign:"middle",marginLeft:4,
                        animation:"blink 0.8s step-end infinite",
                      }}/>
                    )}
                  </div>
                ))}
                <div ref={logEndRef}/>
              </div>

              {/* ── Footer ── */}
              <div style={{
                padding:"12px 20px",
                background:`rgba(255,30,80,0.06)`,
                borderTop:`1px solid ${C.red}30`,
                display:"flex",alignItems:"center",justifyContent:"space-between",
              }}>
                <div style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>
                  {logLines.length < ATTACK_LOGS.length
                    ? `ANALYZING... ${logLines.length}/${ATTACK_LOGS.length} signals processed`
                    : "REDIRECTING TO ALERT CENTER..."}
                </div>
                <div style={{display:"flex",gap:6}}>
                  {[C.red,C.orange,C.yellow].map((c,i)=>(
                    <div key={i} style={{
                      width:8,height:8,borderRadius:"50%",background:c,
                      animation:`orbitPing ${1+i*0.3}s ease-out infinite`,
                    }}/>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── SIDEBAR ── */}
        <div style={{
          width:236,background:`${C.panelAlt}ee`,
          borderRight:`1px solid ${C.border}`,
          display:"flex",flexDirection:"column",flexShrink:0,
          position:"relative",zIndex:10,
          backdropFilter:"blur(10px)",
        }}>
          {/* logo */}
          <div style={{padding:"20px 18px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{
                width:38,height:38,borderRadius:6,
                background:`linear-gradient(135deg,${C.red},#8b0000)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:`0 0 20px ${C.red}50`,
              }}><Shield size={20} color="white" strokeWidth={2}/></div>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:C.text,fontFamily:"'Orbitron',monospace",letterSpacing:1}}>ThreatWatch</div>
                <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:2}}>AI SECURITY PLATFORM</div>
              </div>
            </div>
          </div>

          {/* nav */}
          <div style={{padding:"14px 10px",flex:1}}>
            <div style={{fontSize:8,color:C.textLow,letterSpacing:3,padding:"0 8px",marginBottom:10,fontFamily:"'Share Tech Mono',monospace"}}>NAVIGATION</div>
            {NAV.map(item=>{
              const active = page===item.id;
              const { Icon } = item;
              return (
                <div key={item.id} className="nav-item" onClick={()=>setPage(item.id)} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"11px 12px",borderRadius:3,marginBottom:2,cursor:"pointer",
                  background:active?`${C.cyan}0e`:"transparent",
                  border:active?`1px solid ${C.cyan}25`:`1px solid transparent`,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <Icon size={15} color={active ? C.cyan : C.textMid} strokeWidth={1.8}/>
                    <span style={{fontSize:13,fontWeight:active?700:500,color:active?C.text:C.textMid}}>{item.label}</span>
                  </div>
                  {active && <div style={{width:4,height:4,borderRadius:"50%",background:C.cyan,boxShadow:`0 0 6px ${C.cyan}`}}/>}
                </div>
              );
            })}
          </div>

          {/* ml status */}
          <div style={{padding:"14px 18px",borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <GlowDot color={C.green} pulse size={8}/>
              <span style={{fontSize:11,fontWeight:700,color:C.green,fontFamily:"'Share Tech Mono',monospace"}}>ML ENGINE ONLINE</span>
            </div>
            <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",lineHeight:1.8}}>
              Last scan: 2 min ago<br/>Models: v4.2.1 active
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:5}}>
          {/* topbar */}
          <div style={{
            height:54,background:`${C.panelAlt}dd`,
            borderBottom:`1px solid ${C.border}`,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"0 24px",flexShrink:0,backdropFilter:"blur(10px)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif",letterSpacing:1}}>
                Insider Risk Monitoring Dashboard
              </span>
              <span style={{
                background:`${C.green}12`,border:`1px solid ${C.green}40`,
                color:C.green,padding:"3px 12px",borderRadius:2,
                fontSize:10,fontWeight:700,fontFamily:"'Share Tech Mono',monospace",
                display:"flex",alignItems:"center",gap:5,
              }}>
                <GlowDot color={C.green} pulse size={5}/>
                LIVE
              </span>
              <span style={{fontSize:10,color:C.textLow,fontFamily:"'Share Tech Mono',monospace"}}>{timeStr}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{position:"relative",cursor:"pointer",display:"flex",alignItems:"center"}}>
                <Bell size={20} color={C.textMid}/>
                {attack && <div style={{
                  position:"absolute",top:-4,right:-4,width:16,height:16,
                  borderRadius:"50%",background:C.red,border:`2px solid ${C.bg}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:8,color:"white",fontWeight:700,
                  animation:"orbitPing 1s ease-out infinite",
                }}>!</div>}
              </div>

              <button onClick={handleAttack} className="cyber-btn" style={{
                background:`linear-gradient(135deg,${C.red},#b00030)`,
                border:`1px solid ${C.red}80`,
                color:"white",borderRadius:4,padding:"8px 20px",
                fontSize:12,fontWeight:700,cursor:"pointer",
                fontFamily:"'Share Tech Mono',monospace",letterSpacing:1,
                boxShadow:`0 0 20px ${C.red}40`,
                display:"flex",alignItems:"center",gap:8,
              }}>
                <Zap size={14} color="white" strokeWidth={2.5}/>
                SIMULATE INSIDER ATTACK
              </button>

              <div style={{
                display:"flex",alignItems:"center",gap:10,
                background:C.panelAlt,border:`1px solid ${C.border}`,
                borderRadius:4,padding:"6px 14px",
              }}>
                <div style={{
                  width:30,height:30,borderRadius:"50%",
                  background:`linear-gradient(135deg,${C.purple},#5b3fd4)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:12,fontWeight:900,color:"white",fontFamily:"'Orbitron',monospace",
                  boxShadow:`0 0 10px ${C.purple}50`,
                }}>S</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"'Rajdhani',sans-serif"}}>SOC Analyst</div>
                  <div style={{fontSize:9,color:C.textLow,fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}>LEVEL 3</div>
                </div>
              </div>
            </div>
          </div>

          {/* page */}
          <div style={{flex:1,overflow:"hidden"}}>
            {page==="overview"    && <DashboardOverview attackDone={attack}/>}
            {page==="leaderboard" && <RiskLeaderboard/>}
            {page==="deepdive"    && <EmployeeDeepDive/>}
            {page==="alerts"      && <AlertCenter/>}
            {page==="analytics"   && <SystemAnalytics/>}
          </div>
        </div>
      </div>
    </>
  );
}