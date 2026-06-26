import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UserSearch, LogIn, FolderOpen, KeyRound, Usb, Mail } from "lucide-react";
import { C, LEVEL_C } from "../constants/theme.js";
import { Panel } from "./ui/Panel.jsx";
import { Avatar } from "./ui/Avatar.jsx";
import { CyberBadge } from "./ui/CyberBadge.jsx";
import { SectionLabel } from "./ui/SectionLabel.jsx";
import { TT } from "./ui/Tooltip.jsx";
import { EMPTY_EMP } from "../utils/data.js";

export function EmployeeDeepDive({ emp = EMPTY_EMP, employees = [], onAnalyze }) {
  const loginStr    = emp.loginTime || "00:00";
  const loginHour   = emp.login_hour ?? parseInt(loginStr);
  const scoreColor  = LEVEL_C[emp.level] || C.cyan;
  const isCritical  = emp.level === "Critical";

  // ── Dynamic anomaly flags based on ACTUAL values ──────
  const loginBad  = loginHour < 7 || loginHour > 20;
  const baseFiles = employees.length > 1
    ? [...employees].sort((a,b)=>a.files-b.files)[Math.floor(employees.length/2)]?.files || 25
    : 25;
  const filesDev  = Math.round((emp.files - baseFiles) / baseFiles * 100);
  const filesBad  = emp.files > baseFiles * 1.8;
  const privBad   = emp.priv > 0;
  const usbBad    = emp.usb > 0;
  const sentBad   = emp.sentiment < 0;
  const anomCount = [loginBad,filesBad,privBad,usbBad,sentBad].filter(Boolean).length;

  // ── Timeline from real ML data ────────────────────────
  const empTimeline = (emp.timeline || []).map(t => ({
    day: t.day, score: t.score, baseline: 28, threshold: 70,
  }));

  // ── Trend: compare last 5 days vs first 5 days ────────
  const tl = emp.timeline || [];
  const recentAvg = tl.slice(-5).reduce((s,t)=>s+t.score,0) / Math.max(1, Math.min(5, tl.length));
  const earlyAvg  = tl.slice(0,5).reduce((s,t)=>s+t.score,0)  / Math.max(1, Math.min(5, tl.length));
  const trendUp   = recentAvg > earlyAvg + 5;
  const trendDown = recentAvg < earlyAvg - 5;
  const trendLabel = trendUp ? "ESCALATING PATTERN" : trendDown ? "DECLINING RISK" : "STABLE PATTERN";
  const trendColor = trendUp ? C.red : trendDown ? C.green : C.yellow;

  // ── Dynamic signals table ─────────────────────────────
  const signals = [
    {
      s:"Login Time",
      base:"08:00 – 18:00",
      obs: loginStr,
      dev: loginBad ? `${Math.abs(loginHour - 9)}h outside normal window` : "Within normal hours",
      sev: loginBad ? (loginHour < 4 || loginHour > 23 ? "Critical" : "High") : "Low",
      bad: loginBad,
    },
    {
      s:"File Access Volume",
      base:`~${baseFiles} files/day`,
      obs:`${emp.files} files`,
      dev: filesBad ? `+${filesDev}% over baseline` : filesDev >= 0 ? `+${filesDev}% (normal range)` : `${filesDev}% below avg`,
      sev: emp.files > baseFiles*6 ? "Critical" : emp.files > baseFiles*3 ? "High" : emp.files > baseFiles*1.5 ? "Moderate" : "Low",
      bad: filesBad,
    },
    {
      s:"Privilege Escalation",
      base:"0 / week",
      obs:`${emp.priv} attempt${emp.priv!==1?"s":""}`,
      dev: privBad ? `${emp.priv} unauthorized escalation${emp.priv>1?"s":""} detected` : "No escalation attempts",
      sev: emp.priv >= 5 ? "Critical" : emp.priv >= 2 ? "High" : emp.priv === 1 ? "Moderate" : "Low",
      bad: privBad,
    },
    {
      s:"USB / Removable Media",
      base:"0 connections",
      obs: usbBad ? `${emp.usb} device connected` : "None",
      dev: usbBad ? "Policy violation — removable media detected" : "No USB activity",
      sev: usbBad ? "High" : "Low",
      bad: usbBad,
    },
    {
      s:"Email Sentiment",
      base:"Neutral (0.0 – +0.5)",
      obs: `${emp.sentiment}`,
      dev: sentBad ? `Negative tone — ${Math.abs(emp.sentiment).toFixed(2)} below neutral` : emp.sentiment > 0.6 ? "Positive tone (normal)" : "Neutral (normal)",
      sev: emp.sentiment < -0.6 ? "Critical" : emp.sentiment < -0.2 ? "High" : emp.sentiment < 0 ? "Moderate" : "Low",
      bad: sentBad,
    },
  ];

  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>

      {/* ── Header with employee selector ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <div style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6}}>// BEHAVIORAL ANALYSIS</div>
          <h2 style={{fontSize:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>EMPLOYEE DEEP DIVE</h2>
        </div>
        {/* Employee quick-switch */}
        {employees.length > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              background:C.panelAlt,border:`1px solid ${scoreColor}40`,
              borderRadius:4,padding:"8px 14px",display:"flex",alignItems:"center",gap:8,
            }}>
              <UserSearch size={13} color={scoreColor} strokeWidth={1.8}/>
              <select
                value={emp.id}
                onChange={e=>{
                  const found = employees.find(x=>x.id===e.target.value);
                  if(found && onAnalyze) onAnalyze(found);
                }}
                style={{
                  background:"transparent",border:"none",outline:"none",
                  color:C.text,fontSize:12,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",cursor:"pointer",
                }}>
                  {employees.map(e=>(
                    <option key={e.id} value={e.id} style={{background:C.bg,color:C.text}}>
                      {e.name} — {e.level} ({e.score})
                    </option>
                  ))}
              </select>
            </div>
            <CyberBadge level={emp.level}/>
          </div>
        )}
      </div>

      {/* ── Profile card ── */}
      <Panel style={{padding:"22px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}} critical={isCritical}>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div style={{position:"relative"}}>
            <Avatar initials={emp.initials} size={58} level={emp.level}/>
            <div style={{
              position:"absolute",inset:-4,borderRadius:"50%",
              border:`2px solid ${scoreColor}`,
              animation: isCritical ? "pulseGlow 2s ease-in-out infinite" : "none",
              color:scoreColor,
            }}/>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{emp.name}</span>
              <CyberBadge level={emp.level}/>
            </div>
            <div style={{fontSize:12,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{emp.role} — {emp.dept} — {emp.id}</div>
            <div style={{display:"flex",gap:14,marginTop:8}}>
              <span style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                LAST SEEN: {emp.lastActivity || "—"}
              </span>
              <span style={{fontSize:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
                color: anomCount >= 3 ? C.red : anomCount >= 1 ? C.orange : C.green}}>
                {anomCount}/5 ANOMALIES
              </span>
            </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:4}}>RISK SCORE</div>
          <div style={{
            fontSize:64,fontWeight:900,color:scoreColor,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1,
            textShadow:`0 0 30px ${scoreColor}80, 0 0 60px ${scoreColor}40`,
          }}>{emp.score}</div>
          <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginTop:4}}>/ 100 · {emp.trend}</div>
        </div>
      </Panel>

      {/* ── Timeline ── */}
      <Panel style={{padding:"22px",marginBottom:14}} animate={false}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SectionLabel>30-Day Risk Score Timeline</SectionLabel>
          <span style={{
            background:`${trendColor}18`,border:`1px solid ${trendColor}50`,
            color:trendColor,padding:"4px 12px",borderRadius:2,fontSize:10,
            fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:700,letterSpacing:1,
          }}>{trendLabel}</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={empTimeline}>
            <defs>
              <linearGradient id="tg2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={C.cyan}      stopOpacity={0.8}/>
                <stop offset="70%"  stopColor={C.cyan}      stopOpacity={0.8}/>
                <stop offset="100%" stopColor={scoreColor}  stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={d=>d%5===0?`D${d}`:""}/>
            <YAxis domain={[0,100]} tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>} labelFormatter={d=>`Day ${d}`}/>
            <Line type="monotone" dataKey="score"     stroke="url(#tg2)" strokeWidth={2.5} dot={false} name="Score" isAnimationActive={false}/>
            <Line type="monotone" dataKey="baseline"  stroke={C.border}         strokeWidth={1} strokeDasharray="4 4" dot={false} name="Baseline" isAnimationActive={false}/>
            <Line type="monotone" dataKey="threshold" stroke={`${C.red}60`}     strokeWidth={1} strokeDasharray="4 4" dot={false} name="Threshold" isAnimationActive={false}/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:20,marginTop:10}}>
          {[["Risk Score","url(#tg2)","solid"],["Org. Baseline",C.border,"dashed"],["High Risk Threshold",C.red,"dashed"]].map(([l,c,s])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
              <div style={{width:20,height:2,background:c,opacity:s==="dashed"?0.5:1}}/>
              {l}
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Behavior Indicators ── */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)",letterSpacing:1,marginBottom:12}}>BEHAVIOR INDICATORS</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {[
            {Icon:LogIn,     label:"Login Time",      value:loginStr,               sub:"Last recorded",      bad:loginBad},
            {Icon:FolderOpen,label:"Files Accessed",  value:`${emp.files}`,         sub:"Files past 24h",     bad:filesBad},
            {Icon:KeyRound,  label:"Priv. Attempts",  value:`${emp.priv}`,          sub:"Unauthorized",       bad:privBad},
            {Icon:Usb,       label:"USB Activity",    value:`${emp.usb} device(s)`, sub:"External connected", bad:usbBad},
            {Icon:Mail,      label:"Email Sentiment", value:`${emp.sentiment}`,     sub:sentBad?"Negative tone":"Neutral tone", bad:sentBad},
          ].map((b,i)=>{
            const col = b.bad ? scoreColor : C.cyan;
            return (
              <Panel key={b.label} style={{padding:"16px",animationDelay:`${i*80}ms`}} critical={b.bad && isCritical}>
                <div style={{
                  width:34,height:34,borderRadius:6,marginBottom:12,
                  background:`linear-gradient(135deg,${col}20,${col}08)`,
                  border:`1px solid ${col}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}><b.Icon size={16} color={col} strokeWidth={1.8}/></div>
                <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:4}}>{b.label}</div>
                <div style={{fontSize:16,fontWeight:800,color:b.bad?col:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:4}}>{b.value}</div>
                <div style={{fontSize:10,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{b.sub}</div>
                {b.bad
                  ? <div style={{fontSize:9,color:col,marginTop:8,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>ANOMALOUS</div>
                  : <div style={{fontSize:9,color:C.green,marginTop:8,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>NORMAL</div>
                }
              </Panel>
            );
          })}
        </div>
      </div>

      {/* ── Signal Breakdown Table ── */}
      <Panel style={{padding:"22px"}} animate={false}>
        <SectionLabel>Anomaly Signal Breakdown</SectionLabel>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Signal","Baseline","Observed","Deviation","Severity"].map(h=>(
                <th key={h} style={{padding:"8px 14px",textAlign:"left",fontSize:9,color:C.textMid,letterSpacing:2,textTransform:"uppercase",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signals.map((r,i)=>(
              <tr key={r.s} className="row-hover" style={{borderBottom:`1px solid ${C.border}40`,animation:`slideInUp 0.4s ease-out both`,animationDelay:`${i*80}ms`}}>
                <td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)"}}>{r.s}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{r.base}</td>
                <td style={{padding:"12px 14px",fontSize:12,fontWeight:700,color:r.bad?LEVEL_C[r.sev]:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{r.obs}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:r.bad?C.textMid:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{r.dev}</td>
                <td style={{padding:"12px 14px"}}><CyberBadge level={r.sev}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
export default EmployeeDeepDive;
