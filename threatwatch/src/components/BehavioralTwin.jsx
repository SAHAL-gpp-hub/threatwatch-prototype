import React, { useState, useEffect } from "react";
import { 
  LogIn, 
  FolderOpen, 
  KeyRound, 
  Usb, 
  Mail, 
  GitBranch, 
  Eye, 
  ArrowUpRight 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Area 
} from "recharts";
import { C, LEVEL_C } from "../constants/theme";
import Panel from "./ui/Panel";
import SectionLabel from "./ui/SectionLabel";
import CyberBadge from "./ui/CyberBadge";
import TT from "./ui/Tooltip";

export default function BehavioralTwin({ employees = [], onAnalyze }) {
  const [selectedId, setSelectedId] = useState(null);
  const [scanActive, setScanActive] = useState(false);
  const [scanned, setScanned] = useState(false);

  const emp = selectedId ? employees.find(e => e.id === selectedId) : employees[0];

  useEffect(() => {
    if (!emp) return;
    setScanActive(true);
    setScanned(false);
    const t = setTimeout(() => { 
      setScanActive(false); 
      setScanned(true); 
    }, 1800);
    return () => clearTimeout(t);
  }, [emp?.id]);

  if (!emp || emp.id === "---") return (
    <div style={{
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100%", 
      color: C.textLow, 
      fontFamily: "var(--mono-font,'JetBrains Mono',monospace)"
    }}>
      LOADING TWIN DATA...
    </div>
  );

  const loginHr = emp.login_hour ?? parseInt(emp.loginTime);
  const baseLogin = "08:30 – 09:15 AM";
  const obsLogin = emp.loginTime || "—";
  const loginAnom = loginHr < 6 || loginHr > 22;

  const baseFiles = Math.round(emp.files * 0.15 + 18);
  const obsFiles = emp.files;
  const filesAnom = obsFiles > baseFiles * 2;
  const filesDev = baseFiles > 0 ? Math.round((obsFiles - baseFiles) / baseFiles * 100) : 0;

  const basePriv = 0;
  const obsPriv = emp.priv;
  const privAnom = obsPriv > 0;

  const baseUsb = "None";
  const obsUsb = emp.usb > 0 ? `${emp.usb} device connected` : "None";
  const usbAnom = emp.usb > 0;

  const baseSent = "+0.45 (Neutral–Positive)";
  const obsSent = `${emp.sentiment}`;
  const sentAnom = emp.sentiment < 0;

  const anomCount = [loginAnom, filesAnom, privAnom, usbAnom, sentAnom].filter(Boolean).length;
  const devScore = Math.round(
    (loginAnom ? 180 : 0) +
    (filesAnom ? filesDev : 0) +
    (privAnom ? 120 : 0) +
    (usbAnom ? 90 : 0) +
    (sentAnom ? 95 : 0)
  );

  const metrics = [
    { label: "Login Time", baseline: baseLogin, twin: "08:45 AM (predicted)", observed: obsLogin, anomaly: loginAnom, icon: LogIn },
    { label: "Files Accessed", baseline: `${baseFiles}/day`, twin: `${baseFiles + 2}/day (forecast)`, observed: `${obsFiles} files`, anomaly: filesAnom, icon: FolderOpen, devPct: filesDev },
    { label: "Privilege Usage", baseline: "0 attempts", twin: "0 attempts", observed: `${obsPriv} attempt${obsPriv !== 1 ? "s" : ""}`, anomaly: privAnom, icon: KeyRound },
    { label: "USB / Removable", baseline: baseUsb, twin: "None expected", observed: obsUsb, anomaly: usbAnom, icon: Usb },
    { label: "Email Sentiment", baseline: baseSent, twin: "+0.40 (Neutral)", observed: obsSent, anomaly: sentAnom, icon: Mail },
  ];

  const twinTimeline = (emp.timeline || []).map((t, i) => ({
    day: t.day,
    real: t.score,
    twin: Math.min(45, 15 + Math.sin(i * 0.4) * 8 + Math.random() * 6),
    upper: 55,
    lower: 8,
  }));

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{
            fontSize: 9, 
            color: C.purple, 
            fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
            letterSpacing: 4, 
            marginBottom: 6, 
            animation: "neonText 3s ease-in-out infinite",
            filter: "hue-rotate(200deg)"
          }}>// BEHAVIORAL INTELLIGENCE</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2 }}>
            DIGITAL TWIN
          </h2>
          <p style={{ color: C.textLow, fontSize: 11, marginTop: 5, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>
            VIRTUAL BEHAVIORAL MODEL · REAL vs PREDICTED
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: C.panelAlt, 
            border: `1px solid ${C.purple}40`,
            borderRadius: 4, 
            padding: "8px 14px", 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
          }}>
            <GitBranch size={13} color={C.purple} strokeWidth={1.8} />
            <select
              value={selectedId || (employees[0]?.id || "")}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                background: "transparent", 
                border: "none", 
                outline: "none",
                color: C.text, 
                fontSize: 12, 
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                cursor: "pointer",
              }}>
              {employees.map(e => (
                <option key={e.id} value={e.id} style={{ background: C.panel, color: C.text }}>
                  {e.name} ({e.id})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onAnalyze && onAnalyze(emp)}
            className="cyber-btn"
            style={{
              background: `${C.purple}15`, 
              border: `1px solid ${C.purple}50`,
              color: C.purple, 
              borderRadius: 4, 
              padding: "8px 16px",
              fontSize: 11, 
              cursor: "pointer", 
              fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
              letterSpacing: 1, 
              display: "flex", 
              alignItems: "center", 
              gap: 6,
            }}>
            <Eye size={12} strokeWidth={2} />FULL PROFILE
          </button>
        </div>
      </div>

      {/* Twin Identity Card */}
      <div style={{
        background: `linear-gradient(135deg, ${C.panel}, ${C.panelAlt})`,
        border: `1px solid ${C.purple}40`,
        borderRadius: 6, 
        padding: "20px 24px", 
        marginBottom: 16,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        position: "relative", 
        overflow: "hidden",
        animation: emp.level === "Critical" ? "twinPulse 3s ease-in-out infinite" : "none",
      }}>
        {scanActive && (
          <div style={{
            position: "absolute", 
            left: 0, 
            right: 0, 
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.purple}, transparent)`,
            animation: "scanBar 1.8s ease-in-out",
            zIndex: 10, 
            pointerEvents: "none",
          }}/>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, 
              height: 56, 
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.panelAlt},${C.panel})`,
              border: `2px solid ${LEVEL_C[emp.level]}60`,
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: 18, 
              fontWeight: 900, 
              color: LEVEL_C[emp.level],
              fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
              marginBottom: 6,
            }}>{emp.initials}</div>
            <div style={{ fontSize: 9, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2 }}>REAL</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,${LEVEL_C[emp.level]}60,${C.purple}60)` }} />
            <div style={{ fontSize: 9, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2 }}>VS</div>
            <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,${C.purple}60,${C.purple}20)` }} />
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, 
              height: 56, 
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.purple}20,${C.purple}08)`,
              border: `2px solid ${C.purple}60`,
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: 18, 
              fontWeight: 900, 
              color: C.purple,
              fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
              marginBottom: 6,
              animation: "floatY 4s ease-in-out infinite",
              boxShadow: `0 0 20px ${C.purple}30`,
            }}>
              {emp.initials}
            </div>
            <div style={{ fontSize: 8, color: C.purple, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2 }}>TWIN</div>
          </div>

          <div style={{ marginLeft: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>{emp.name}</div>
            <div style={{ fontSize: 11, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", marginTop: 4 }}>
              {emp.role} · {emp.dept} · {emp.id}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <CyberBadge level={emp.level} />
              <span style={{
                fontSize: 10, 
                color: C.purple, 
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                background: `${C.purple}15`, 
                border: `1px solid ${C.purple}30`,
                padding: "2px 8px", 
                borderRadius: 2
              }}>
                TWIN ACTIVE
              </span>
              {scanned && (
                <span style={{ fontSize: 10, color: C.green, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", animation: "fadeIn 0.5s ease-out" }}>
                  SYNC COMPLETE
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2, marginBottom: 6 }}>DEVIATION SCORE</div>
          <div style={{
            fontSize: 52, 
            fontWeight: 900,
            color: devScore > 400 ? C.red : devScore > 200 ? C.orange : C.green,
            fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
            lineHeight: 1,
            textShadow: devScore > 400 ? `0 0 30px ${C.red}80` : devScore > 200 ? `0 0 20px ${C.orange}60` : `0 0 15px ${C.green}60`,
          }}>+{devScore}%</div>
          <div style={{ fontSize: 10, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", marginTop: 4 }}>
            {anomCount} of 5 signals anomalous
          </div>
        </div>
      </div>

      {/* Metric Comparison Table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <Panel style={{ padding: "20px" }} critical={emp.level === "Critical"} animate={false}>
          <SectionLabel>Behavioral Comparison Matrix</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 80px",
            gap: 0, 
            marginTop: 4,
          }}>
            {["METRIC", "TWIN BASELINE", "OBSERVED", "STATUS"].map(h => (
              <div key={h} style={{
                padding: "8px 10px", 
                fontSize: 9, 
                color: C.textMid,
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                letterSpacing: 2,
                borderBottom: `1px solid ${C.border}`,
              }}>{h}</div>
            ))}
            {metrics.map((m, i) => (
              <React.Fragment key={i}>
                <div style={{
                  padding: "12px 10px",
                  borderBottom: `1px solid ${C.border}40`,
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8,
                  animation: `slideInUp 0.3s ease-out ${i * 60}ms both`,
                }}>
                  <m.icon size={13} color={m.anomaly ? LEVEL_C[emp.level] : C.textLow} strokeWidth={1.8} />
                  <span style={{ fontSize: 11, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{m.label}</span>
                </div>
                <div style={{
                  padding: "12px 10px", 
                  fontSize: 11, 
                  color: C.textLow,
                  fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                  borderBottom: `1px solid ${C.border}40`,
                  animation: `slideInUp 0.3s ease-out ${i * 60 + 20}ms both`,
                  display: "flex", 
                  alignItems: "center",
                }}>{m.baseline}</div>
                <div style={{
                  padding: "12px 10px", 
                  fontSize: 11,
                  color: m.anomaly ? LEVEL_C[emp.level] : C.green,
                  fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                  fontWeight: m.anomaly ? 700 : 400,
                  borderBottom: `1px solid ${C.border}40`,
                  animation: `slideInUp 0.3s ease-out ${i * 60 + 40}ms both`,
                  display: "flex", 
                  alignItems: "center", 
                  gap: 6,
                }}>
                  {m.anomaly && <ArrowUpRight size={11} strokeWidth={2.5} />}
                  {m.observed}
                  {m.devPct > 0 && m.anomaly && (
                    <span style={{ fontSize: 9, color: C.red, background: `${C.red}15`, padding: "1px 5px", borderRadius: 2 }}>+{m.devPct}%</span>
                  )}
                </div>
                <div style={{
                  padding: "12px 10px",
                  borderBottom: `1px solid ${C.border}40`,
                  animation: `slideInUp 0.3s ease-out ${i * 60 + 60}ms both`,
                  display: "flex", 
                  alignItems: "center",
                }}>
                  {m.anomaly
                    ? <span style={{
                        fontSize: 9, 
                        color: C.red, 
                        fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                        background: `${C.red}15`, 
                        border: `1px solid ${C.red}30`,
                        padding: "2px 6px", 
                        borderRadius: 2, 
                        letterSpacing: 1
                      }}>ANOMALY</span>
                    : <span style={{
                        fontSize: 9, 
                        color: C.green, 
                        fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                        background: `${C.green}10`, 
                        border: `1px solid ${C.green}20`,
                        padding: "2px 6px", 
                        borderRadius: 2, 
                        letterSpacing: 1
                      }}>NORMAL</span>
                  }
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{
            marginTop: 16, 
            padding: "14px",
            background: devScore > 400 ? `${C.red}08` : devScore > 200 ? `${C.orange}08` : `${C.green}08`,
            border: `1px solid ${devScore > 400 ? C.red : devScore > 200 ? C.orange : C.green}25`,
            borderRadius: 4,
          }}>
            <div style={{ display: "flex", justifyContext: "space-between", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2 }}>TWIN DIVERGENCE INDEX</span>
              <span style={{
                fontSize: 16, 
                fontWeight: 900, 
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                color: devScore > 400 ? C.red : devScore > 200 ? C.orange : C.green,
              }}>+{devScore}%</span>
            </div>
            <div style={{ width: "100%", height: 6, background: C.muted, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(100, devScore / 8)}%`, 
                height: "100%",
                background: devScore > 400 ? `linear-gradient(90deg,${C.orange},${C.red})`
                           : devScore > 200 ? `linear-gradient(90deg,${C.yellow},${C.orange})`
                           : `linear-gradient(90deg,${C.cyan},${C.green})`,
                borderRadius: 3, 
                transition: "width 1.2s ease-out",
                boxShadow: `0 0 8px ${devScore > 400 ? C.red : devScore > 200 ? C.orange : C.green}`,
              }} />
            </div>
            <div style={{ fontSize: 9, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", marginTop: 6, letterSpacing: 1 }}>
              {devScore > 400
                ? `CRITICAL DIVERGENCE · Twin model and observed behavior are severely misaligned`
                : devScore > 200
                ? `MODERATE DIVERGENCE · ${anomCount} behavioral signals outside predicted range`
                : `LOW DIVERGENCE · Employee behavior matches twin model closely`}
            </div>
          </div>
        </Panel>

        {/* Right column: twin timeline + signal bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel style={{ padding: "20px" }} animate={false}>
            <SectionLabel>30-Day Twin Overlay — Real vs Predicted Normal</SectionLabel>
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={twinTimeline}>
                <defs>
                  <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={LEVEL_C[emp.level]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={LEVEL_C[emp.level]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="twinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.purple} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: C.textLow, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={d => d % 5 === 0 ? `D${d}` : ""} />
                <YAxis domain={[0, 100]} tick={{ fill: C.textLow, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} labelFormatter={d => `Day ${d}`} />
                <Area type="monotone" dataKey="upper" stroke="none" fill={`${C.purple}10`} name="Normal Band Upper" isAnimationActive={false} />
                <Area type="monotone" dataKey="twin" stroke={C.purple} strokeWidth={1.5} fill="url(#twinGrad)" strokeDasharray="5 3" name="Twin Prediction" isAnimationActive={false} />
                <Area type="monotone" dataKey="real" stroke={LEVEL_C[emp.level]} strokeWidth={2} fill="url(#realGrad)" name="Real Behavior" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              {[["Real Behavior", LEVEL_C[emp.level], "solid"], ["Twin Prediction", C.purple, "dashed"], ["Normal Band", C.purple, "area"]].map(([l, c, s]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>
                  <div style={{ width: 18, height: 2, background: c, opacity: s === "area" ? 0.3 : 1, borderStyle: s === "dashed" ? "dashed" : "solid" }} />
                  {l}
                </div>
              ))}
            </div>
          </Panel>

          <Panel style={{ padding: "20px" }} animate={false}>
            <SectionLabel>Behavioral Signal Strength</SectionLabel>
            {[
              { label: "Login Deviation", val: loginAnom ? 85 : 5, color: loginAnom ? C.red : C.green },
              { label: "File Access Spike", val: Math.min(100, Math.abs(filesDev)), color: filesAnom ? C.red : C.green },
              { label: "Privilege Misuse", val: privAnom ? 90 : 0, color: privAnom ? C.red : C.green },
              { label: "USB Risk", val: usbAnom ? 80 : 0, color: usbAnom ? C.orange : C.green },
              { label: "Sentiment Shift", val: sentAnom ? Math.round(Math.abs(emp.sentiment) * 80) : 10, color: sentAnom ? C.orange : C.green },
            ].map((s, i) => (
              <div key={s.label} style={{ marginBottom: 10, animation: `slideInUp 0.3s ease-out ${i * 80}ms both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: s.color, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", fontWeight: 700 }}>{s.val}%</span>
                </div>
                <div style={{ width: "100%", height: 5, background: C.muted, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${s.val}%`, 
                    height: "100%",
                    background: s.color, 
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${s.color}80`,
                    transition: "width 1s ease-out",
                  }} />
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* Twin Intelligence Summary */}
      <Panel style={{ padding: "20px" }} critical={devScore > 400} animate={false}>
        <SectionLabel>Twin Intelligence Report</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 8 }}>
          {[
            {
              title: "Behavioral Consistency",
              val: devScore > 400 ? "CRITICAL" : devScore > 200 ? "MODERATE" : "NORMAL",
              color: devScore > 400 ? C.red : devScore > 200 ? C.orange : C.green,
              desc: `The digital twin predicts stable behavior within ±${Math.round(baseFiles * 0.2)} files/day and login between 08:00–10:00. Current deviation ${devScore > 200 ? "significantly exceeds" : "is within"} the predicted normal range.`,
            },
            {
              title: "Anomaly Pattern Match",
              val: `${anomCount}/5 SIGNALS`,
              color: anomCount >= 3 ? C.red : anomCount >= 1 ? C.orange : C.green,
              desc: `${anomCount} out of 5 behavioral signals deviate from twin baseline. ${anomCount >= 3 ? "Pattern consistent with insider threat or account compromise." : anomCount >= 1 ? "Isolated anomalies detected, monitoring recommended." : "No significant deviations detected."}`,
            },
            {
              title: "Twin Confidence",
              val: `${Math.max(72, 95 - devScore / 20).toFixed(0)}%`,
              color: C.purple,
              desc: `Model trained on ${Math.min(30, emp.timeline?.length || 25)} days of behavioral data. Confidence reflects alignment between observed patterns and learned baseline. Re-trains every 24 hours.`,
            },
          ].map((card, i) => (
            <div key={i} style={{
              background: C.panelAlt, 
              borderRadius: 4, 
              padding: "16px",
              border: `1px solid ${card.color}20`,
              animation: `slideInUp 0.4s ease-out ${i * 100}ms both`,
            }}>
              <div style={{ fontSize: 9, color: C.textLow, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2, marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: card.color, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", marginBottom: 8, lineHeight: 1 }}>{card.val}</div>
              <p style={{ fontSize: 11, color: C.textLow, lineHeight: 1.7, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
