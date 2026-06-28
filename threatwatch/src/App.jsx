import { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  ShieldX, 
  Bell, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  LayoutDashboard, 
  Trophy, 
  UserSearch, 
  GitBranch, 
  TrendingUp, 
  BellRing, 
  BarChart3, 
  Bot, 
  Eye, 
  Radio,
  Menu,
  X 
} from "lucide-react";

import { GLOBAL_CSS, C } from "./constants/theme";
import { useData, EMPTY_EMP } from "./utils/data";
import { useMobile } from "./utils/useMobile";
import { useCursorEffects } from "./utils/useCursorEffects";

import GlowDot from "./components/ui/GlowDot";
import Avatar from "./components/ui/Avatar";
import SkeletonPage from "./components/ui/SkeletonPage";

import DashboardOverview from "./components/DashboardOverview";
import RiskLeaderboard from "./components/RiskLeaderboard";
import EmployeeDeepDive from "./components/EmployeeDeepDive";
import ForecastEngine from "./components/ForecastEngine";
import AlertCenter from "./components/AlertCenter";
import SystemAnalytics from "./components/SystemAnalytics";
import BehavioralTwin from "./components/BehavioralTwin";
import AISOCAnalyst from "./components/AISOCAnalyst";
import FloatingChatBubble from "./components/FloatingChatBubble";

const NAV = [
  { id: "overview",    label: "Dashboard Overview",  Icon: LayoutDashboard },
  { id: "leaderboard", label: "Risk Leaderboard",    Icon: Trophy },
  { id: "deepdive",    label: "Employee Deep Dive",  Icon: UserSearch },
  { id: "twin",        label: "Behavioral Twin",     Icon: GitBranch, badge: "NEW" },
  { id: "forecast",    label: "Threat Forecast",     Icon: TrendingUp, badge: "NEW" },
  { id: "alerts",      label: "Alert Center",        Icon: BellRing },
  { id: "analytics",   label: "System Analytics",    Icon: BarChart3 },
  { id: "soc",         label: "AI SOC Analyst",       Icon: Bot, badge: "AI" },
];

export default function App() {
  const [page, setPage] = useState("overview");
  const [attack, setAttack] = useState(false);
  const [attackStage, setStage] = useState(0);
  const [logLines, setLogLines] = useState([]);
  const [tick, setTick] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [pageKey, setPageKey] = useState(0);
  const [showAboutModal, setShowAboutModal] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mobile = useMobile();
  useCursorEffects(mobile);

  const [messages, setMessages] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    setScrollProgress(0);
    setShowScrollIndicator(true);
  }, [page]);

  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      if (target && target.scrollHeight) {
        const totalHeight = target.scrollHeight - target.clientHeight;
        if (totalHeight > 0) {
          const scrolled = (target.scrollTop / totalHeight) * 100;
          setScrollProgress(scrolled);
          if (target.scrollTop > 50) {
            setShowScrollIndicator(false);
          } else {
            setShowScrollIndicator(true);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  // Live data hook
  const { employees, loading, lastUpdate, error } = useData();
  const topThreat = employees[0] || EMPTY_EMP;

  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    if (!selectedEmp && employees.length > 0 && employees[0].id !== "---") {
      setSelectedEmp(employees[0]);
    }
    if (selectedEmp && employees.length > 0) {
      const updated = employees.find(e => e.id === selectedEmp.id);
      if (updated && updated.score !== selectedEmp.score) setSelectedEmp(updated);
    }
  }, [employees]);

  const [liveScore, setLiveScore] = useState(0);
  useEffect(() => { 
    setLiveScore(topThreat.score); 
  }, [topThreat.score]);

  function analyzeEmployee(emp) {
    setSelectedEmp(emp);
    setPage("deepdive");
    setPageKey(k => k + 1);
  }

  useEffect(() => { 
    const t = setInterval(() => setTick(x => x + 1), 1000); 
    return () => clearInterval(t); 
  }, []);

  useEffect(() => {
    document.title = `ThreatWatch — ${employees.filter(e => e.level === "Critical").length} Critical Threat${employees.filter(e => e.level === "Critical").length !== 1 ? "s" : ""} Detected`;
  }, [employees]);

  const ATTACK_LOGS = [
    { t: 0,    text: `[SYSTEM] Behavioral anomaly engine triggered`,                                          color: C.yellow },
    { t: 300,  text: `[TARGET] Flagging employee: ${topThreat.name} · ${topThreat.id} · ${topThreat.dept}`,           color: C.orange },
    { t: 600,  text: `[DETECT] Login hour: ${topThreat.loginTime} — deviation from 09:00 baseline`,             color: C.orange },
    { t: 900,  text: `[DETECT] Files accessed: ${topThreat.files} in 6h window (+${Math.round(topThreat.files / 25 * 100 - 100)}% over avg)`, color: C.red },
    { t: 1200, text: `[DETECT] Privilege escalation attempts: ${topThreat.priv} (baseline: 0/week)`,            color: C.red },
    { t: 1500, text: `[DETECT] USB device connected — 2.4GB outbound transfer initiated`,                    color: C.red },
    { t: 1800, text: `[DETECT] Email sentiment score: ${topThreat.sentiment} (threshold: < 0.0)`,               color: C.red },
    { t: 2100, text: `[MODEL]  Isolation Forest decision_function → anomaly_score: -0.847`,                  color: C.cyan },
    { t: 2400, text: `[SCORE]  AccessAnomaly   = ${Math.round(topThreat.files / 3)} × 0.40  =  ${(Math.round(topThreat.files / 3) * 0.40).toFixed(1)}`, color: C.cyan },
    { t: 2700, text: `[SCORE]  BehavioralDrift = ${Math.min(100, Math.round(Math.abs(parseInt(topThreat.loginTime) - 9) * 8 + topThreat.usb * 40))} × 0.35  =  ${(Math.min(100, Math.round(Math.abs(parseInt(topThreat.loginTime) - 9) * 8 + topThreat.usb * 40)) * 0.35).toFixed(1)}`, color: C.cyan },
    { t: 3000, text: `[SCORE]  SentimentShift  = ${Math.round((1 - topThreat.sentiment) / 2 * 100)} × 0.25  =  ${(Math.round((1 - topThreat.sentiment) / 2 * 100) * 0.25).toFixed(1)}`, color: C.cyan },
    { t: 3200, text: `[SCORE]  ─────────────────────────────────────────────────`,                          color: C.textLow },
    { t: 3400, text: `[SCORE]  IRI = ${topThreat.score.toFixed(1)} -> CLASSIFICATION: CRITICAL`,             color: C.green },
    { t: 3700, text: `[ALERT]  Auto-alert dispatched to SOC team — Priority P0`,                             color: C.red },
    { t: 4000, text: `[ACTION] Navigating to Alert Center... Stand by.`,                                     color: C.textMid },
  ];

  const logEndRef = useRef(null);
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logLines]);

  function handleAttack() {
    if (attack) return;

    setStage(1);
    setLogLines([]);
    setLiveScore(18);

    setTimeout(() => setStage(2), 600);

    ATTACK_LOGS.forEach(({ t, text, color }) => {
      setTimeout(() => {
        setLogLines(prev => [...prev, { text, color }]);
      }, 800 + t);
    });

    setTimeout(() => {
      setStage(3);
      let current = 18;
      const target = topThreat.score;
      const interval = setInterval(() => {
        current = Math.min(current + 1.8, target);
        setLiveScore(parseFloat(current.toFixed(1)));
        if (current >= target) clearInterval(interval);
      }, 35);
    }, 2400);

    setTimeout(() => {
      setAttack(true);
      setStage(4);
      setPage("alerts");
    }, 5400);
  }

  function handleDemo() {
    if (demoActive) { setDemoActive(false); setDemoStep(-1); return; }
    setDemoActive(true);
    setDemoStep(0);
    const steps = [
      [0,       () => { setPage("overview");    setDemoStep(1);  }],
      [2000,    () => { setPage("leaderboard"); setDemoStep(2);  }],
      [2800,    () => { setPage("deepdive");    setDemoStep(3);  }],
      [3600,    () => { setPage("forecast");    setDemoStep(4);  }],
      [4400,    () => { setPage("twin");        setDemoStep(5);  }],
      [5200,    () => { handleAttack();         setDemoStep(6);  }],
      [11000,   () => { setPage("soc");         setDemoStep(7);  }],
      [13000,   () => { setDemoActive(false); setDemoStep(-1); }],
    ];
    steps.forEach(([delay, fn]) => setTimeout(fn, delay));
  }

  const DEMO_STEPS = [
    "Starting demo...",
    "Dashboard Overview — live threat stats",
    "Risk Leaderboard — top threat identified",
    "Employee Deep Dive — 30-day behavioural spike",
    "Threat Forecast — 7-day trajectory",
    "Behavioral Twin — +740% deviation",
    "Simulating insider attack sequence...",
    "AI SOC Analyst — live threat analysis",
  ];

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`
        /* ── Hide default cursor everywhere ── */
        *, *::before, *::after { cursor: none !important; }

        /* ── Dot: small filled circle, instant ── */
        #tw-cursor-dot {
          position: fixed;
          width: 8px; height: 8px;
          background: #00d1ff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          top: 0; left: 0;
          box-shadow: 0 0 8px #00d1ff, 0 0 16px #00d1ff80;
          transition: background 0.2s, box-shadow 0.2s;
        }

        /* ── Ring: larger circle, lags behind ── */
        #tw-cursor-ring {
          position: fixed;
          width: 36px; height: 36px;
          border: 1.5px solid #00d1ff;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          top: 0; left: 0;
          opacity: 0.7;
          transition: width 0.2s ease, height 0.2s ease,
                      border-color 0.2s ease, opacity 0.2s ease,
                      background 0.15s ease;
          box-shadow: 0 0 10px #00d1ff40, inset 0 0 8px #00d1ff10;
        }

        /* Crosshair notches on the ring */
        #tw-cursor-ring::before,
        #tw-cursor-ring::after {
          content: '';
          position: absolute;
          background: #00d1ff;
          opacity: 0.8;
        }
        #tw-cursor-ring::before {
          width: 1px; height: 8px;
          left: 50%; top: -5px;
          transform: translateX(-50%);
        }
        #tw-cursor-ring::after {
          width: 8px; height: 1px;
          top: 50%; left: -5px;
          transform: translateY(-50%);
        }

        /* Hover state — ring expands + brightens */
        #tw-cursor-ring.tw-ring-hover {
          width: 52px; height: 52px;
          border-color: #00d1ff;
          opacity: 1;
          background: rgba(0,209,255,0.05);
          margin-left: -8px; margin-top: -8px;
        }

        /* Click state — ring contracts + flashes */
        #tw-cursor-ring.tw-ring-click {
          width: 24px; height: 24px;
          border-color: #ff1e50;
          opacity: 1;
          background: rgba(255,30,80,0.08);
          margin-left: 6px; margin-top: 6px;
          box-shadow: 0 0 16px #ff1e5080;
        }
        #tw-cursor-ring.tw-ring-click::before,
        #tw-cursor-ring.tw-ring-click::after {
          background: #ff1e50;
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden", position: "relative", fontFamily: C.sans }}>
        {/* SCROLL PROGRESS BAR */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${scrollProgress}%`,
          height: "3px",
          background: `linear-gradient(90deg, ${C.cyan}, #9d6fff)`,
          boxShadow: `0 0 10px ${C.cyan}cc`,
          zIndex: 9999,
          transition: "width 0.1s ease-out",
          pointerEvents: "none",
        }} />

        {/* MOBILE SIDEBAR OVERLAY */}
        {mobile && sidebarOpen && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 99, backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease-out",
          }} onClick={() => setSidebarOpen(false)} />
        )}
        {/* GRID BACKGROUND */}
        <div style={{
          position: "fixed", 
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0,209,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,209,255,0.04) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
          animation: "gridScroll 8s linear infinite",
          pointerEvents: "none", 
          zIndex: 0,
        }} />

        {/* SCANLINE */}
        <div style={{
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          height: "2px",
          background: `linear-gradient(transparent,${C.cyan}20,transparent)`,
          animation: "scanline 8s linear infinite",
          pointerEvents: "none", 
          zIndex: 1, 
          opacity: 0.3,
        }} />

        {/* STAGE 1: Full-screen red flash */}
        {attackStage === 1 && (
          <div style={{
            position: "fixed", 
            inset: 0, 
            zIndex: 199,
            background: `radial-gradient(ellipse at center, ${C.red}25 0%, transparent 70%)`,
            animation: "fadeIn 0.2s ease-out",
            pointerEvents: "none",
          }} />
        )}

        {/* ATTACK SEQUENCE OVERLAY */}
        {(attackStage === 1 || attackStage === 2 || attackStage === 3) && (
          <div style={{
            position: "fixed", 
            inset: 0, 
            zIndex: 200,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            animation: "fadeIn 0.3s ease-out",
          }}>
            <div style={{
              width: mobile ? "calc(100vw - 32px)" : 640,
              maxWidth: mobile ? "calc(100vw - 32px)" : 640,
              background: "#0a0e14",
              border: `1px solid ${C.red}`,
              borderRadius: 8,
              boxShadow: `0 0 80px ${C.red}30, 0 0 160px ${C.red}10`,
              overflow: "hidden",
              animation: "criticalPulse 2s ease-in-out infinite",
            }}>
              {/* Header bar */}
              <div style={{
                background: `linear-gradient(90deg,${C.red}20,${C.red}08)`,
                borderBottom: `1px solid ${C.red}40`,
                padding: "14px 20px",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldX size={20} color={C.red} style={{ filter: `drop-shadow(0 0 8px ${C.red})` }} />
                  <span style={{
                    fontSize: 13, 
                    fontWeight: 800, 
                    color: C.red,
                    fontFamily: C.mono, 
                    letterSpacing: 2,
                    textShadow: `0 0 15px ${C.red}`,
                  }}>INSIDER THREAT DETECTED</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <GlowDot color={C.red} pulse size={8} />
                  <span style={{ fontSize: 10, color: C.red, fontFamily: C.mono, letterSpacing: 2 }}>LIVE</span>
                </div>
              </div>

              {/* Employee identity */}
              <div style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex", 
                alignItems: "center", 
                gap: 14,
                background: "rgba(255,30,80,0.04)",
              }}>
                <Avatar initials={topThreat.initials} size={44} level="Critical" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: C.sans }}>{topThreat.name}</div>
                  <div style={{ fontSize: 11, color: C.textLow, fontFamily: C.mono, marginTop: 3 }}>
                    {topThreat.role} · {topThreat.dept} · {topThreat.id}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: C.textLow, fontFamily: C.mono, letterSpacing: 2, marginBottom: 4 }}>RISK INDEX</div>
                  <div style={{
                    fontSize: 44, 
                    fontWeight: 800,
                    fontFamily: C.mono,
                    color: liveScore > 80 ? C.red : liveScore > 50 ? C.orange : C.yellow,
                    textShadow: `0 0 30px ${liveScore > 80 ? C.red : C.orange}`,
                    lineHeight: 1,
                    transition: "color 0.3s",
                  }}>{liveScore.toFixed(1)}</div>
                  <div style={{ fontSize: 9, color: C.textLow, fontFamily: C.mono }}>/ 100</div>
                </div>
              </div>

              {/* Risk score bar */}
              <div style={{ padding: "12px 20px 4px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{
                  width: "100%", 
                  height: 6,
                  background: "rgba(255,255,255,0.06)", 
                  borderRadius: 3, 
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${liveScore}%`, 
                    height: "100%", 
                    borderRadius: 3,
                    background: `linear-gradient(90deg,${C.yellow},${C.orange},${C.red})`,
                    boxShadow: `0 0 12px ${C.red}`,
                    transition: "width 0.1s linear",
                  }} />
                </div>
                <div style={{
                  display: "flex", 
                  justifyContent: "space-between",
                  fontSize: 9, 
                  color: C.textLow, 
                  fontFamily: C.mono, 
                  marginTop: 6,
                }}>
                  <span>LOW</span><span>MODERATE</span><span>HIGH</span><span style={{ color: C.red }}>CRITICAL</span>
                </div>
              </div>

              {/* Terminal log */}
              <div style={{
                padding: "14px 20px",
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                fontSize: 11,
                lineHeight: 1.9,
                height: 240,
                overflowY: "auto",
                background: "#06090f",
              }}>
                {logLines.length === 0 && (
                  <span style={{ color: C.textLow }}>// initializing anomaly engine...<span style={{ animation: "blink 1s step-end infinite", display: "inline-block", width: 8, height: 12, background: C.cyan, verticalAlign: "middle", marginLeft: 4 }} /></span>
                )}
                {logLines.map((line, i) => (
                  <div key={i} style={{
                    color: line.color,
                    animation: "slideInUp 0.2s ease-out",
                    opacity: i < logLines.length - 1 ? 0.7 : 1,
                  }}>
                    <span style={{ color: C.textLow, marginRight: 8 }}>{String(i).padStart(2, "0")}</span>
                    {line.text}
                    {i === logLines.length - 1 && (
                      <span style={{
                        display: "inline-block", 
                        width: 7, 
                        height: 12,
                        background: line.color, 
                        verticalAlign: "middle", 
                        marginLeft: 4,
                        animation: "blink 0.8s step-end infinite",
                      }} />
                    )}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 20px",
                background: `rgba(255,30,80,0.06)`,
                borderTop: `1px solid ${C.red}30`,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
              }}>
                <div style={{ fontSize: 10, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>
                  {logLines.length < ATTACK_LOGS.length
                    ? `ANALYZING... ${logLines.length}/${ATTACK_LOGS.length} signals processed`
                    : "REDIRECTING TO ALERT CENTER..."}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[C.red, C.orange, C.yellow].map((c, i) => (
                    <div key={i} style={{
                      width: 8, 
                      height: 8, 
                      borderRadius: "50%", 
                      background: c,
                      animation: `orbitPing ${1 + i * 0.3}s ease-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR */}
        <div style={{
          width: mobile ? 260 : 236,
          background: "rgba(10,14,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: `1px solid ${C.border}`,
          display: mobile ? (sidebarOpen ? "flex" : "none") : "flex", 
          flexDirection: "column", 
          flexShrink: 0,
          position: mobile ? "fixed" : "relative", 
          zIndex: mobile ? 100 : 10,
          top: 0,
          left: 0,
          bottom: 0,
          ...(mobile ? { boxShadow: "4px 0 24px rgba(0,0,0,0.5)", animation: "slideInLeft 0.25s ease-out" } : {}),
        }}>
          {mobile && (
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: `linear-gradient(135deg,${C.cyan},#0088bb)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 20px ${C.cyan}40`,
                }}><Shield size={16} color="#0a0e14" strokeWidth={2.5} /></div>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: C.sans }}>ThreatWatch</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{
                background: "transparent", border: "none", color: C.textMid,
                cursor: "pointer", padding: 4,
              }}><X size={20} /></button>
            </div>
          )}
          {!mobile && (
          <div style={{ padding: "20px 18px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, 
                height: 38, 
                borderRadius: 8,
                background: `linear-gradient(135deg,${C.cyan},#0088bb)`,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: `0 0 20px ${C.cyan}40`,
              }}><Shield size={20} color="#0a0e14" strokeWidth={2.5} /></div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: C.sans, letterSpacing: 0.5 }}>ThreatWatch</div>
                <div style={{ fontSize: 9, color: C.textLow, fontFamily: C.mono, letterSpacing: 2 }}>AI SECURITY PLATFORM</div>
              </div>
            </div>
          </div>
          )}

          <div style={{ padding: "14px 10px", flex: 1 }}>
            <div style={{ fontSize: 9, color: C.textMid, letterSpacing: 3, padding: "0 8px", marginBottom: 10, fontFamily: C.mono }}>NAVIGATION</div>
            {NAV.map(item => {
              const active = page === item.id;
              const { Icon } = item;
              return (
                <div key={item.id} className="nav-item" onClick={() => { setPage(item.id); setPageKey(k => k + 1); if (mobile) setSidebarOpen(false); }} style={{
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "11px 12px", 
                  borderRadius: 6, 
                  marginBottom: 2, 
                  cursor: "pointer",
                  background: active ? (item.id === "twin" ? `${C.purple}18` : `${C.cyan}10`) : "transparent",
                  border: active ? (item.id === "twin" ? `1px solid ${C.purple}35` : `1px solid ${C.borderHi}`) : `1px solid transparent`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={15} color={active ? (item.id === "twin" ? C.purple : C.cyan) : C.textLow} strokeWidth={1.8} />
                    <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? C.text : C.textMid, fontFamily: C.sans }}>{item.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {item.badge && !active && (
                      <span style={{
                        background: `${C.purple}20`, 
                        border: `1px solid ${C.purple}45`,
                        color: C.purple, 
                        fontSize: 7, 
                        fontFamily: C.mono,
                        padding: "1px 5px", 
                        borderRadius: 3, 
                        letterSpacing: 1,
                      }}>{item.badge}</span>
                    )}
                    {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: item.id === "twin" ? C.purple : C.cyan, boxShadow: `0 0 6px ${item.id === "twin" ? C.purple : C.cyan}` }} />}
                  </div>
                </div>
              );
            })}
          </div>

          {!mobile && (
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <GlowDot color={C.green} pulse size={8} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green, fontFamily: C.mono }}>ML ENGINE ONLINE</span>
            </div>
            <div style={{ fontSize: 10, color: C.textMid, fontFamily: C.mono, lineHeight: 1.8 }}>
              Last scan: 2 min ago<br />Models: v4.2.1 active
            </div>
            <div style={{
              marginTop: 10, 
              paddingTop: 10,
              borderTop: `1px solid ${C.border}`,
              fontSize: 8, 
              letterSpacing: 2, 
              lineHeight: 2,
              fontFamily: C.mono,
            }}>
              <div style={{ color: `${C.cyan}90` }}>INSIGHT PROJECT</div>
              <div style={{ color: `${C.cyan}60` }}>AI THREAT DETECTION</div>
            </div>
          </div>
          )}
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 5 }}>
          {/* Topbar */}
          <div style={{
            height: mobile ? 50 : 56,
            background: "rgba(10,14,20,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${C.border}`,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            padding: mobile ? "0 12px" : "0 24px", 
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: mobile ? 10 : 14, minWidth: 0, flex: 1 }}>
              {mobile && (
                <button onClick={() => setSidebarOpen(true)} style={{
                  background: "transparent", border: "none", color: C.text,
                  cursor: "pointer", padding: 4, flexShrink: 0,
                }}><Menu size={22} /></button>
              )}
              <span style={{ fontSize: mobile ? 12 : 14, fontWeight: 700, color: C.text, fontFamily: C.sans, letterSpacing: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {mobile ? "ThreatWatch" : "Insider Risk Monitoring Dashboard"}
              </span>
              {!mobile && (
              <>
              <span style={{
                background: `${C.green}15`, 
                border: `1px solid ${C.green}50`,
                color: C.green, 
                padding: "3px 12px", 
                borderRadius: 4,
                fontSize: 10, 
                fontWeight: 700, 
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                display: "flex", 
                alignItems: "center", 
                gap: 5,
              }}>
                <GlowDot color={C.green} pulse size={5} />
                LIVE
              </span>
              <span style={{ fontSize: 10, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{timeStr}</span>
              </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 14, flexShrink: 0 }}>
              {mobile && (
                <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Bell size={18} color={C.textMid} />
                  {attack && <div style={{
                    position: "absolute", top: -4, right: -4, width: 14, height: 14,
                    borderRadius: "50%", background: C.red, border: `2px solid ${C.bg}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 7, color: "white", fontWeight: 700,
                    animation: "orbitPing 1s ease-out infinite",
                  }}>!</div>}
                </div>
              )}
              {!mobile && (
              <>
              <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => setShowAboutModal(true)}>
                <ShieldCheck size={20} color={C.cyan} style={{ animation: "pulse-animation 3s infinite" }} />
              </div>

              <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Bell size={20} color={C.textMid} />
                {attack && <div style={{
                  position: "absolute", 
                  top: -4, 
                  right: -4, 
                  width: 16, 
                  height: 16,
                  borderRadius: "50%", 
                  background: C.red, 
                  border: `2px solid ${C.bg}`,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: 8, 
                  color: "white", 
                  fontWeight: 700,
                  animation: "orbitPing 1s ease-out infinite",
                }}>!</div>}
              </div>

              <button onClick={handleDemo} className="cyber-btn" style={{
                background: demoActive
                  ? `linear-gradient(135deg,${C.purple},#5b3fd4)`
                  : `linear-gradient(135deg,${C.cyan}20,${C.cyan}08)`,
                border: `1px solid ${demoActive ? C.purple : C.cyan}`,
                color: demoActive ? "white" : C.cyan,
                borderRadius: 4, 
                padding: "8px 18px",
                fontSize: 12, 
                fontWeight: 700, 
                cursor: "pointer",
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                letterSpacing: 1,
                boxShadow: demoActive ? `0 0 20px ${C.purple}50` : `0 0 12px ${C.cyan}15`,
                display: "flex", 
                alignItems: "center", 
                gap: 8,
                transition: "all 0.3s",
              }}>
                {demoActive
                  ? <><span style={{ animation: "pulseGlow 1s ease-in-out infinite", display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "white" }}></span> STOP DEMO</>
                  : <><Sparkles size={14} strokeWidth={2} /> AUTO DEMO</>
                }
              </button>

              <button onClick={handleAttack} className="cyber-btn" style={{
                background: `linear-gradient(135deg,${C.red},#b00030)`,
                border: `1px solid ${C.red}80`,
                color: "white", 
                borderRadius: 4, 
                padding: "8px 20px",
                fontSize: 12, 
                fontWeight: 700, 
                cursor: "pointer",
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                letterSpacing: 1,
                boxShadow: `0 0 20px ${C.red}40`,
                display: "flex", 
                alignItems: "center", 
                gap: 8,
              }}>
                <Zap size={14} color="white" strokeWidth={2.5} />
                SIMULATE INSIDER ATTACK
              </button>

              <div style={{
                display: "flex", 
                alignItems: "center", 
                gap: 10,
                background: C.panelAlt, 
                border: `1px solid ${C.border}`,
                borderRadius: 4, 
                padding: "6px 14px",
              }}>
                <div style={{
                  width: 30, 
                  height: 30, 
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.purple}, #5b3fd4)`,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: 12, 
                  fontWeight: 900, 
                  color: "white", 
                  fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                  boxShadow: `0 0 10px ${C.purple}50`,
                }}>S</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, fontFamily: "var(--sans-font,'Inter',sans-serif)" }}>SOC Analyst</div>
                  <div style={{ fontSize: 9, color: C.green, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>● ACTIVE SESSION</div>
                </div>
              </div>
              </>
              )}
            </div>
          </div>

          {/* Page body */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              zIndex: 10,
              display: "flex", 
              alignItems: "center", 
              justifyContent: "flex-end",
              padding: "6px 32px", 
              pointerEvents: "none",
            }}>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: C.cyan, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, animation: "pulseGlow 1s ease-in-out infinite" }} />
                  LOADING DATA...
                </div>
              )}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: C.orange, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange }} />
                  OFFLINE — COPY employee_summary.json TO public/
                </div>
              )}
              {!loading && !error && lastUpdate && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: `${C.green}`, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulseGlow 3s ease-in-out infinite" }} />
                  LIVE · UPDATED {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            {employees.length === 0
              ? <SkeletonPage />
              : <div key={pageKey} style={{ height: "100%", animation: "pageEnter 0.22s ease-out" }}>
                  {page === "overview"    && <DashboardOverview attackDone={attack} employees={employees} onAnalyze={analyzeEmployee} lastUpdate={lastUpdate} />}
                  {page === "leaderboard" && <RiskLeaderboard employees={employees} onAnalyze={analyzeEmployee} lastUpdate={lastUpdate} />}
                  {page === "deepdive"    && <EmployeeDeepDive emp={selectedEmp || topThreat} employees={employees} onAnalyze={analyzeEmployee} />}
                  {page === "forecast"    && <ForecastEngine employees={employees} onAnalyze={analyzeEmployee} />}
                  {page === "alerts"      && <AlertCenter employees={employees} onAnalyze={analyzeEmployee} />}
                  {page === "analytics"   && <SystemAnalytics employees={employees} lastUpdate={lastUpdate} />}
                  {page === "twin"        && <BehavioralTwin employees={employees} onAnalyze={analyzeEmployee} />}
                  {page === "soc"         && <AISOCAnalyst employees={employees} onAnalyze={analyzeEmployee} messages={messages} setMessages={setMessages} />}
                </div>
            }
          </div>
        </div>
      </div>

      {/* Floating chatbot bubble */}
      <FloatingChatBubble setPage={setPage} page={page} employees={employees} messages={messages} setMessages={setMessages} />

      {/* Cyberpunk Floating Mouse Scroll Indicator */}
      {showScrollIndicator && ["overview", "leaderboard", "deepdive", "forecast", "alerts", "analytics", "twin"].includes(page) && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
          animation: "fadeIn 0.5s ease-out",
        }}>
          <div style={{
            width: "20px",
            height: "32px",
            border: `1.5px solid ${C.cyan}50`,
            borderRadius: "10px",
            position: "relative",
            boxShadow: `0 0 8px ${C.cyan}15`,
          }}>
            <div style={{
              width: "3px",
              height: "6px",
              background: C.cyan,
              borderRadius: "50%",
              position: "absolute",
              top: "6px",
              left: "50%",
              animation: "mouseScrollWheel 1.5s infinite ease-out",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--mono-font)",
            fontSize: "9px",
            color: `${C.cyan}80`,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            textShadow: `0 0 5px ${C.cyan}30`,
          }}>
            Scroll to Explore
          </span>
        </div>
      )}

      {/* Demo mode step indicator */}
      {demoActive && demoStep >= 0 && (
        <div style={{
          position: "fixed", 
          bottom: 20, 
          left: "50%", 
          transform: "translateX(-50%)",
          zIndex: 400, 
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${C.purple}60`, 
          borderRadius: 30,
          padding: "10px 24px",
          boxShadow: `0 0 30px ${C.purple}30`,
          display: "flex", 
          alignItems: "center", 
          gap: 12,
          animation: "slideInUp 0.3s ease-out",
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === demoStep ? 20 : 6,
                height: 6, 
                borderRadius: 3,
                background: i < demoStep ? C.purple : i === demoStep ? C.cyan : C.border,
                transition: "all 0.3s",
              }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: C.cyan, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1, whiteSpace: "nowrap" }}>
            {DEMO_STEPS[demoStep] || "Running demo..."}
          </span>
          <button onClick={() => { setDemoActive(false); setDemoStep(-1); }} style={{
            background: "transparent", 
            border: "none", 
            color: C.textMid,
            cursor: "pointer", 
            fontSize: 14, 
            padding: "0 4px",
          }}>✕</button>
        </div>
      )}

      {/* INFO / ABOUT MODAL */}
      {showAboutModal && (
        <div style={{
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 500, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "rgba(3, 5, 8, 0.8)", 
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "fadeIn 0.25s ease-out"
        }}>
          <div style={{
            width: mobile ? "calc(100vw - 32px)" : 560,
            maxWidth: mobile ? "calc(100vw - 32px)" : 560,
            maxHeight: "85vh",
            background: "rgba(6, 12, 24, 0.98)",
            border: `1.5px solid rgba(0, 209, 255, 0.4)`,
            borderRadius: mobile ? 12 : 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.95), 0 0 60px rgba(0, 209, 255, 0.25), inset 0 0 30px rgba(0, 209, 255, 0.05)",
            display: "flex", 
            flexDirection: "column",
            animation: "scaleInModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
            position: "relative"
          }}>
            <div style={{
              position: "absolute", 
              left: 0, 
              right: 0, 
              height: 2, 
              zIndex: 10,
              background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
              boxShadow: `0 0 8px ${C.cyan}`,
              animation: "scanningSweep 4s linear infinite"
            }} />

            <div style={{
              padding: mobile ? "20px 16px 14px" : "32px 32px 20px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              position: "relative", 
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(0, 209, 255, 0.08), transparent)"
            }}>
              <button
                onClick={() => setShowAboutModal(false)}
                style={{
                  position: "absolute", 
                  top: 20, 
                  right: 24,
                  background: "transparent", 
                  border: "none", 
                  color: C.textMid,
                  cursor: "pointer", 
                  fontSize: 20, 
                  transition: "all 0.2s",
                  fontFamily: "var(--sans-font, sans-serif)"
                }}
                onMouseEnter={e => {
                  e.target.style.color = C.red;
                  e.target.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={e => {
                  e.target.style.color = C.textMid;
                  e.target.style.transform = "rotate(0deg)";
                }}
              >
                ✕
              </button>

              <div style={{
                marginBottom: 16,
                animation: "floatY 4s infinite ease-in-out",
                filter: `drop-shadow(0 0 15px ${C.cyan}40)`
              }}>
                <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(0, 209, 255, 0.04)" />
                  <circle cx="12" cy="11" r="3.5" stroke={C.red} strokeWidth="1.5" />
                  <path d="M7.5 11h.01M16.5 11h.01" stroke={C.text} strokeWidth="2.5" />
                </svg>
              </div>

                  <h1 style={{ fontSize: mobile ? 26 : 34, fontWeight: 900, color: C.text, fontFamily: C.sans, margin: "0 0 6px", letterSpacing: 0.5, textShadow: `0 0 20px ${C.cyan}30` }}>
                ThreatWatch
              </h1>
              <p style={{ fontSize: 13.5, color: C.textMid, fontFamily: C.sans, margin: 0, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
                AI-Powered Insider Threat Prediction System
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "0 16px 16px" : "0 32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}25, transparent)` }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div 
                  style={{
                    background: "rgba(255, 30, 80, 0.02)", 
                    border: `1px solid rgba(255, 30, 80, 0.15)`,
                    borderRadius: 10, 
                    padding: "14px 18px", 
                    transition: "all 0.25s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 30, 80, 0.04)"; e.currentTarget.style.borderColor = "rgba(255, 30, 80, 0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 30, 80, 0.02)"; e.currentTarget.style.borderColor = "rgba(255, 30, 80, 0.15)"; }}
                >
                  <div style={{ fontSize: 10, color: C.red, fontFamily: C.mono, letterSpacing: 2, fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.red }} /> THE PROBLEM
                  </div>
                  <p style={{ fontSize: 13, color: "#cbdcf0", fontFamily: C.sans, lineHeight: 1.75, margin: 0 }}>
                    Insider threats take <span style={{ color: C.red, fontWeight: 700 }}>77 days</span> to detect on average and cost <span style={{ color: C.red, fontWeight: 700 }}>$15.38M</span> per incident. Traditional DLP systems miss <span style={{ color: C.red, fontWeight: 700 }}>60%</span> of attacks.
                  </p>
                </div>

                <div 
                  style={{
                    background: "rgba(0, 209, 255, 0.02)", 
                    border: `1px solid rgba(0, 209, 255, 0.15)`,
                    borderRadius: 10, 
                    padding: "14px 18px", 
                    transition: "all 0.25s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 209, 255, 0.04)"; e.currentTarget.style.borderColor = "rgba(0, 209, 255, 0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 209, 255, 0.02)"; e.currentTarget.style.borderColor = "rgba(0, 209, 255, 0.15)"; }}
                >
                  <div style={{ fontSize: 10, color: C.cyan, fontFamily: C.mono, letterSpacing: 2, fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.cyan }} /> OUR SOLUTION
                  </div>
                  <p style={{ fontSize: 13, color: "#cbdcf0", fontFamily: C.sans, lineHeight: 1.75, margin: 0 }}>
                    ThreatWatch uses behavioral AI to detect anomalous patterns across <span style={{ color: C.cyan, fontWeight: 700 }}>5 signal channels</span>, scoring threats in under <span style={{ color: C.cyan, fontWeight: 700 }}>2 seconds</span>.
                  </p>
                </div>
              </div>

              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}25, transparent)` }} />

              <div>
                <div style={{ fontSize: 10, color: C.cyan, fontFamily: C.mono, letterSpacing: 2, fontWeight: 800, marginBottom: 12 }}>HOW IT WORKS</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: mobile ? "center" : "space-between", background: "rgba(0, 209, 255, 0.03)", border: `1.5px dashed rgba(0, 209, 255, 0.2)`, borderRadius: 12, padding: mobile ? "14px 12px" : "14px 20px", flexWrap: mobile ? "wrap" : "nowrap", gap: mobile ? 8 : 0 }}>
                  {[
                    { label: "Monitor", Icon: Eye, color: C.cyan },
                    { label: "Analyze", Icon: Radio, color: C.purple },
                    { label: "Score", Icon: BarChart3, color: C.yellow },
                    { label: "Alert", Icon: BellRing, color: C.red }
                  ].map((step, idx) => {
                    const { Icon } = step;
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
                        <div style={{
                          width: 24, 
                          height: 24, 
                          borderRadius: "50%",
                          background: `${step.color}15`, 
                          border: `1px solid ${step.color}35`,
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center"
                        }}>
                          <Icon size={12} color={step.color} strokeWidth={2.5} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: C.mono, letterSpacing: 0.5 }}>{step.label}</span>
                        {idx < 3 && <span style={{ color: `${C.cyan}50`, fontSize: 10, marginLeft: 12, marginRight: 4, fontWeight: 800 }}>➔</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}25, transparent)` }} />

              <div>
                <div style={{ fontSize: 10, color: C.cyan, fontFamily: C.mono, letterSpacing: 2, fontWeight: 800, marginBottom: 10 }}>TECH STACK</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["React", "FastAPI", "Python", "Isolation Forest", "Gemini AI", "Recharts", "Vite"].map((tech, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "rgba(0, 209, 255, 0.06)", 
                        border: `1px solid rgba(0, 209, 255, 0.25)`,
                        color: C.cyan, 
                        borderRadius: 6, 
                        padding: "5px 12px", 
                        fontSize: 10.5, 
                        fontWeight: 700,
                        fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                        letterSpacing: 0.5,
                        transition: "all 0.2s", 
                        cursor: "default"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(0, 209, 255, 0.12)";
                        e.currentTarget.style.borderColor = C.cyan;
                        e.currentTarget.style.transform = "translateY(-1.5px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(0, 209, 255, 0.06)";
                        e.currentTarget.style.borderColor = "rgba(0, 209, 255, 0.25)";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.cyan}25, transparent)` }} />

              <div>
                <div style={{ fontSize: 10, color: C.cyan, fontFamily: C.mono, letterSpacing: 2, fontWeight: 800, marginBottom: 8 }}>THE TEAM</div>
                <div 
                  style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(255, 255, 255, 0.02)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0, 209, 255, 0.3)"; e.currentTarget.style.background = "rgba(0, 209, 255, 0.01)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"; }}
                >
                  <div style={{
                    width: 36, 
                    height: 36, 
                    borderRadius: "50%", 
                    background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: C.bg, 
                    fontWeight: 900, 
                    fontSize: 14, 
                    fontFamily: C.mono,
                    boxShadow: `0 0 12px rgba(0, 209, 255, 0.3)`
                  }}>
                    S
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text, fontFamily: C.sans, marginBottom: 2 }}>
                      Sahal <span style={{ fontSize: 11, fontWeight: 400, color: C.textMid, marginLeft: 8 }}>Backend · ML · DevOps · Frontend</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textLow, fontFamily: C.mono }}>
                      Government Polytechnic Palanpur · Sem 5
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              padding: mobile ? "12px 16px 18px" : "16px 32px 22px", 
              borderTop: `1px solid ${C.border}`,
              background: "rgba(0, 8, 16, 0.6)", 
              display: "flex", 
              gap: 12, 
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}>
              <button
                className="cyber-btn"
                onClick={() => {
                  setShowAboutModal(false);
                  handleDemo();
                }}
                style={{
                  background: `linear-gradient(135deg, ${C.purple}, #5b3fd4)`,
                  border: "none", 
                  color: "white", 
                  borderRadius: 8, 
                  padding: "11px 24px",
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                  letterSpacing: 0.5,
                  boxShadow: `0 0 15px ${C.purple}50`, 
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 25px ${C.purple}80`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 15px ${C.purple}50`}
              >
                Launch Auto Demo ➔
              </button>

              <button
                className="cyber-btn"
                onClick={() => setShowAboutModal(false)}
                style={{
                  background: "transparent", 
                  border: `1.5px solid ${C.border}`, 
                  color: C.textMid,
                  borderRadius: 8, 
                  padding: "11px 24px", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer",
                  fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.target.style.borderColor = C.cyan;
                  e.target.style.color = C.cyan;
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = C.border;
                  e.target.style.color = C.textMid;
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}