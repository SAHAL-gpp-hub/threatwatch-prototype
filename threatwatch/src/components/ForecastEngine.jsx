import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  ReferenceLine, 
  Area, 
  LineChart, 
  Line,
  Tooltip
} from "recharts";
import { C, LEVEL_C } from "../constants/theme";
import Panel from "./ui/Panel";
import Avatar from "./ui/Avatar";
import TT from "./ui/Tooltip";
import { useMobile } from "../utils/useMobile";

export default function ForecastEngine({ employees = [], onAnalyze }) {
  const mobile = useMobile();
  const [selectedId, setSelectedId] = useState(null);
  const emp = selectedId ? employees.find(e => e.id === selectedId) || employees[0] : employees[0];

  function linearForecast(timeline, futureDays = 7) {
    if (!timeline || timeline.length < 5) return [];
    const recent = timeline.slice(-10);
    const n = recent.length;
    const xs = recent.map((_, i) => i);
    const ys = recent.map(p => p.score);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const lastDay = timeline[timeline.length - 1].day;
    return Array.from({ length: futureDays }, (_, i) => {
      const x = n + i;
      const projected = Math.max(0, Math.min(100, intercept + slope * x));
      return { day: lastDay + i + 1, score: parseFloat(projected.toFixed(1)), forecast: true };
    });
  }

  function getThreatTrajectory(timeline, forecast) {
    if (!forecast.length) return { label: "UNKNOWN", color: C.textMid, icon: "—" };
    const lastReal = timeline[timeline.length - 1]?.score || 0;
    const lastForecast = forecast[forecast.length - 1]?.score || 0;
    const delta = lastForecast - lastReal;
    if (delta > 15) return { label: "ESCALATING", color: C.red, icon: "^^", desc: "Rapid threat escalation predicted" };
    if (delta > 5) return { label: "RISING", color: C.orange, icon: "^", desc: "Gradual increase in risk score" };
    if (delta < -10) return { label: "DECLINING", color: C.green, icon: "v", desc: "Threat appears to be subsiding" };
    if (delta < -3) return { label: "STABILISING", color: C.yellow, icon: "\\", desc: "Slight downward trend detected" };
    return { label: "STABLE", color: C.cyan, icon: "->", desc: "No significant change predicted" };
  }

  const forecast7 = emp ? linearForecast(emp.timeline, 7) : [];
  const traj = emp ? getThreatTrajectory(emp.timeline, forecast7) : {};

  const chartData = emp ? [
    ...emp.timeline.map(p => ({ day: `D${p.day}`, score: p.score, forecast: null })),
    ...forecast7.map(p => ({ day: `D${p.day}`, score: null, forecast: p.score })),
  ] : [];

  const orgForecasts = employees.map(e => {
    const fc = linearForecast(e.timeline, 7);
    const lastReal = e.timeline?.[e.timeline.length - 1]?.score || e.score;
    const lastFc = fc[fc.length - 1]?.score || lastReal;
    return { ...e, forecastScore: parseFloat(lastFc.toFixed(1)), delta: parseFloat((lastFc - lastReal).toFixed(1)) };
  }).sort((a, b) => b.forecastScore - a.forecastScore);

  const escalating = orgForecasts.filter(e => e.delta > 5).length;

  return (
    <div style={{ padding: mobile ? "16px 12px" : "28px 32px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: mobile ? "stretch" : "flex-start", marginBottom: mobile ? 16 : 24, flexDirection: mobile ? "column" : "row", gap: mobile ? 14 : 0 }}>
        <div>
          <div style={{ fontSize: 9, color: C.cyan, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 4, marginBottom: 6 }}>
            // PREDICTIVE ANALYTICS ENGINE
          </div>
          <h2 style={{ fontSize: mobile ? 18 : 26, fontWeight: 900, color: C.text, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: mobile ? 1 : 2 }}>
            THREAT FORECAST
          </h2>
          <p style={{ color: C.textMid, fontSize: mobile ? 10 : 11, marginTop: 6, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1 }}>
            7-DAY TRAJECTORY PREDICTION · LINEAR REGRESSION ON 30-DAY BEHAVIORAL BASELINE
          </p>
        </div>
        <div style={{ display: "flex", gap: mobile ? 6 : 10, flexWrap: "wrap" }}>
          {[
            { label: "FORECASTED THREATS", val: orgForecasts.filter(e => e.forecastScore >= 60).length, color: C.red },
            { label: "ESCALATING NOW", val: escalating, color: C.orange },
            { label: "EMPLOYEES TRACKED", val: employees.length, color: C.cyan },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: "center",
              background: `linear-gradient(135deg,${s.color}12,${s.color}05)`,
              border: `1px solid ${s.color}40`, 
              borderRadius: 6, 
              padding: mobile ? "8px 10px" : "10px 18px",
              flex: mobile ? "1 1 calc(33% - 4px)" : "0 0 auto",
              minWidth: mobile ? 90 : "auto",
            }}>
              <div style={{ fontSize: mobile ? 18 : 22, fontWeight: 900, color: s.color, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: mobile ? 7 : 8, color: s.color, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: mobile ? 1 : 2, marginTop: 5, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 320px", gap: mobile ? 14 : 16, marginBottom: 16 }}>
        {/* Left: Individual forecast chart */}
        <Panel style={{ padding: mobile ? "16px" : "22px" }} animate={false}>
          <div style={{ display: "flex", justifyContent: mobile ? "flex-start" : "space-between", alignItems: "center", marginBottom: 18, flexDirection: mobile ? "column" : "row", gap: mobile ? 10 : 0 }}>
            <div style={{ fontSize: 11, color: C.cyan, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2 }}>
              INDIVIDUAL TRAJECTORY FORECAST
            </div>
            <select
              value={selectedId || emp?.id || ""}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                background: "rgba(0,209,255,0.08)", 
                border: `1px solid ${C.cyan}40`, 
                color: C.text,
                borderRadius: 4, 
                padding: "6px 12px", 
                fontSize: 11,
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                cursor: "pointer", 
                outline: "none",
                width: mobile ? "100%" : "auto",
                maxWidth: "100%",
              }}>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.level} ({e.score})</option>
              ))}
            </select>
          </div>

          {emp && (
            <div style={{
              display: "flex", 
              alignItems: "center", 
              gap: mobile ? 10 : 14,
              padding: mobile ? "10px" : "12px 16px", 
              marginBottom: 16,
              background: `${LEVEL_C[emp.level]}08`,
              border: `1px solid ${LEVEL_C[emp.level]}30`, 
              borderRadius: 6,
              flexWrap: mobile ? "wrap" : "nowrap",
            }}>
              <Avatar initials={emp.initials} size={mobile ? 32 : 38} level={emp.level} />
              <div style={{ flex: mobile ? "1 1 calc(100% - 42px)" : 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "var(--sans-font,'Inter',sans-serif)" }}>{emp.name}</div>
                <div style={{ fontSize: 10, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{emp.role} · {emp.dept}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1, marginBottom: 4 }}>CURRENT</div>
                <div style={{ fontSize: mobile ? 16 : 20, fontWeight: 900, color: LEVEL_C[emp.level], fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{emp.score}</div>
              </div>
              {!mobile && <div style={{ width: 1, height: 36, background: C.border }} />}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1, marginBottom: 4 }}>FORECAST D+7</div>
                <div style={{ fontSize: mobile ? 16 : 20, fontWeight: 900, color: traj.color, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>
                  {forecast7[6]?.score ?? "—"}
                </div>
              </div>
              <div style={{
                display: "flex", 
                alignItems: "center", 
                gap: 6,
                background: `${traj.color}15`, 
                border: `1px solid ${traj.color}40`,
                borderRadius: 4, 
                padding: "6px 12px",
              }}>
                <span style={{ fontSize: 16, color: traj.color, fontWeight: 900 }}>{traj.icon}</span>
                <span style={{ fontSize: 10, color: traj.color, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", fontWeight: 700, letterSpacing: 1 }}>{traj.label}</span>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={mobile ? 180 : 220}>
            <ComposedChart data={chartData} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={emp ? LEVEL_C[emp.level] : C.cyan} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={emp ? LEVEL_C[emp.level] : C.cyan} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={traj.color || C.cyan} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={traj.color || C.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: C.textLow, fontSize: 9, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}
                axisLine={false} tickLine={false} interval={6} />
              <YAxis domain={[0, 100]} tick={{ fill: C.textLow, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <ReferenceLine x="D30" stroke={C.cyan} strokeDasharray="4 2" strokeOpacity={0.5}
                label={{ value: "TODAY", position: "top", fill: C.cyan, fontSize: 9, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }} />
              <ReferenceLine y={60} stroke={C.orange} strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={80} stroke={C.red} strokeDasharray="3 3" strokeOpacity={0.4} />
              <Area type="monotone" dataKey="score" name="Historical" stroke={emp ? LEVEL_C[emp.level] : C.cyan}
                fill="url(#histGrad)" strokeWidth={2} dot={false} connectNulls={false} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke={traj.color || C.cyan}
                fill="url(#foreGrad)" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: traj.color || C.cyan, strokeWidth: 0 }}
                connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", gap: mobile ? 12 : 20, marginTop: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              ["Historical", emp ? LEVEL_C[emp.level] : C.cyan, "solid"],
              ["7-Day Forecast", traj.color || C.cyan, "dashed"],
              ["High Risk (60)", C.orange, "dotted"],
              ["Critical (80)", C.red, "dotted"],
            ].map(([l, c, style]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>
                <div style={{
                  width: 18, 
                  height: 2, 
                  background: c, 
                  borderTop: style === "dashed" ? "none" : "",
                  borderTopStyle: style === "dashed" ? "dashed" : style === "dotted" ? "dotted" : "solid",
                  borderTopColor: c, 
                  borderTopWidth: style !== "solid" ? 2 : 0
                }} />
                {l}
              </div>
            ))}
          </div>

          {emp && (
            <div style={{
              marginTop: 14, 
              padding: mobile ? "10px" : "12px 16px",
              background: `${traj.color}10`, 
              border: `1px solid ${traj.color}30`, 
              borderRadius: 4,
              display: "flex", 
              gap: 12, 
              alignItems: "center",
              flexWrap: mobile ? "wrap" : "nowrap",
            }}>
              <div style={{ fontSize: 22, color: traj.color }}>{traj.icon}</div>
              <div style={{ flex: mobile ? "1 1 calc(100% - 34px)" : 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: traj.color, fontWeight: 700, fontFamily: "var(--sans-font,'Inter',sans-serif)", letterSpacing: 1 }}>
                  FORECAST: {traj.label}
                </div>
                <div style={{ fontSize: 11, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", marginTop: 3 }}>
                  {traj.desc} · Predicted score in 7 days: <span style={{ color: traj.color, fontWeight: 700 }}>{forecast7[6]?.score ?? "N/A"}</span> / 100
                </div>
              </div>
              <button className="cyber-btn" onClick={() => onAnalyze && onAnalyze(emp)} style={{
                marginLeft: mobile ? 0 : "auto", 
                background: `${C.cyan}15`, 
                border: `1px solid ${C.cyan}40`,
                color: C.cyan, 
                borderRadius: 4, 
                padding: "8px 16px", 
                cursor: "pointer", 
                fontSize: 10,
                fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", 
                letterSpacing: 1, 
                flexShrink: 0,
              }}>DEEP DIVE</button>
            </div>
          )}
        </Panel>

        {/* Right: Organisation forecast ranking */}
        <Panel style={{ padding: mobile ? "16px" : "22px" }} animate={false}>
          <div style={{ fontSize: 11, color: C.cyan, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 2, marginBottom: 16 }}>
            ORG-WIDE 7-DAY FORECAST
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto" }}>
            {orgForecasts.slice(0, 12).map((e, i) => {
              const deltaColor = e.delta > 5 ? C.red : e.delta > 0 ? C.orange : e.delta < -3 ? C.green : C.textMid;
              const fc = linearForecast(e.timeline, 7);
              const sparkData = [...(e.timeline || []).slice(-10).map(p => ({ v: p.score })), ...fc.map(p => ({ v: p.score, f: true }))];
              return (
                <div key={e.id} className="row-hover" onClick={() => setSelectedId(e.id)} style={{
                  display: "flex", 
                  alignItems: "center", 
                  gap: 10,
                  padding: "10px 12px", 
                  borderRadius: 4, 
                  cursor: "pointer",
                  background: selectedId === e.id ? `${C.cyan}08` : "transparent",
                  border: `1px solid ${selectedId === e.id ? C.cyan + "30" : "transparent"}`,
                }}>
                  <div style={{
                    width: 22, 
                    height: 22, 
                    borderRadius: 4, 
                    flexShrink: 0,
                    background: `${LEVEL_C[e.level]}15`, 
                    border: `1px solid ${LEVEL_C[e.level]}40`,
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: 9, 
                    fontWeight: 700, 
                    color: LEVEL_C[e.level], 
                    fontFamily: "var(--mono-font,'JetBrains Mono',monospace)",
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: C.text, 
                      fontFamily: "var(--sans-font,'Inter',sans-serif)",
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap"
                    }}>{e.name}</div>
                    <div style={{ fontSize: 9, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)" }}>{e.dept}</div>
                  </div>
                  <div style={{ width: 48, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height={24}>
                      <LineChart data={sparkData}>
                        <Line type="monotone" dataKey="v" stroke={deltaColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: deltaColor, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", lineHeight: 1 }}>
                      {e.forecastScore}
                    </div>
                    <div style={{ fontSize: 9, color: deltaColor, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", marginTop: 2 }}>
                      {e.delta > 0 ? "+" : ""}{e.delta}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Model info footer */}
      <Panel style={{ padding: mobile ? "12px 16px" : "16px 22px" }} animate={false}>
        <div style={{ display: "flex", gap: mobile ? 16 : 32, alignItems: "center", flexWrap: "wrap"}}>
          <div style={{ flex: mobile ? "1 1 100%" : "0 0 auto" }}>
            <div style={{ fontSize: 9, color: C.cyan, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 3, marginBottom: 6 }}>FORECAST MODEL</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "var(--sans-font,'Inter',sans-serif)" }}>Linear Regression (OLS) on 10-Day Rolling Window</div>
          </div>
          {!mobile && <div style={{ width: 1, height: 36, background: C.border }} />}
          {[
            ["Training Window", "Last 10 days"],
            ["Forecast Horizon", "7 days"],
            ["Input Features", "Daily IRI Score"],
            ["Baseline Period", "30 days"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 9, color: C.textMid, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", letterSpacing: 1, marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 12, color: C.text, fontFamily: "var(--mono-font,'JetBrains Mono',monospace)", fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
