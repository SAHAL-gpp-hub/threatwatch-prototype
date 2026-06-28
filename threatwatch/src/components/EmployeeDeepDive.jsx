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
import { useMobile } from "../utils/useMobile.js";

export function EmployeeDeepDive({ emp = EMPTY_EMP, employees = [], onAnalyze }) {
  const mobile = useMobile();
  const loginStr    = emp.loginTime || "00:00";
  const loginHour   = emp.login_hour ?? parseInt(loginStr);
  const scoreColor  = LEVEL_C[emp.level] || C.cyan;
  const isCritical  = emp.level === "Critical";

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

  const empTimeline = (emp.timeline || []).map(t => ({
    day: t.day, score: t.score, baseline: 28, threshold: 70,
  }));

  const tl = emp.timeline || [];
  const recentAvg = tl.slice(-5).reduce((s,t)=>s+t.score,0) / Math.max(1, Math.min(5, tl.length));
  const earlyAvg  = tl.slice(0,5).reduce((s,t)=>s+t.score,0)  / Math.max(1, Math.min(5, tl.length));
  const trendUp   = recentAvg > earlyAvg + 5;
  const trendDown = recentAvg < earlyAvg - 5;
  const trendLabel = trendUp ? "ESCALATING PATTERN" : trendDown ? "DECLINING RISK" : "STABLE PATTERN";
  const trendColor = trendUp ? C.red : trendDown ? C.green : C.yellow;

  const signals = [
    { s:"Login Time", base:"08:00 – 18:00", obs:loginStr,
      dev: loginBad ? `${Math.abs(loginHour - 9)}h outside normal window` : "Within normal hours",
      sev: loginBad ? (loginHour < 4 || loginHour > 23 ? "Critical" : "High") : "Low", bad: loginBad },
    { s:"File Access", base:`~${baseFiles} files/day`, obs:`${emp.files} files`,
      dev: filesBad ? `+${filesDev}% over baseline` : filesDev >= 0 ? `+${filesDev}% (normal)` : `${filesDev}% below avg`,
      sev: emp.files > baseFiles*6 ? "Critical" : emp.files > baseFiles*3 ? "High" : emp.files > baseFiles*1.5 ? "Moderate" : "Low",
      bad: filesBad },
    { s:"Priv. Escalation", base:"0 / week", obs:`${emp.priv} attempt${emp.priv!==1?"s":""}`,
      dev: privBad ? `${emp.priv} unauthorized escalation${emp.priv>1?"s":""} detected` : "No escalation attempts",
      sev: emp.priv >= 5 ? "Critical" : emp.priv >= 2 ? "High" : emp.priv === 1 ? "Moderate" : "Low", bad: privBad },
    { s:"USB Activity", base:"0 connections", obs: usbBad ? `${emp.usb} device` : "None",
      dev: usbBad ? "Policy violation — removable media detected" : "No USB activity",
      sev: usbBad ? "High" : "Low", bad: usbBad },
    { s:"Email Sentiment", base:"Neutral (0.0 – +0.5)", obs:`${emp.sentiment}`,
      dev: sentBad ? `Negative tone — ${Math.abs(emp.sentiment).toFixed(2)} below neutral` : emp.sentiment > 0.6 ? "Positive (normal)" : "Neutral (normal)",
      sev: emp.sentiment < -0.6 ? "Critical" : emp.sentiment < -0.2 ? "High" : emp.sentiment < 0 ? "Moderate" : "Low", bad: sentBad },
  ];

  return (
    <div style={{padding:mobile?"14px 12px":"28px 32px",overflowY:"auto",height:"100%"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:mobile?"flex-start":"flex-start",marginBottom:mobile?16:22,flexDirection:mobile?"column":"row",gap:mobile?12:0}}>
        <div>
          <div style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6}}>// BEHAVIORAL ANALYSIS</div>
          <h2 style={{fontSize:mobile?17:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:mobile?1:2}}>EMPLOYEE DEEP DIVE</h2>
        </div>
        {employees.length > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{
              background:C.panelAlt,border:`1px solid ${scoreColor}40`,
              borderRadius:4,padding:"7px 12px",display:"flex",alignItems:"center",gap:8,
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
                  color:C.text,fontSize:mobile?11:12,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",cursor:"pointer",
                  maxWidth:mobile?160:220,
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

      {/* Profile card */}
      <Panel style={{padding:mobile?"14px":"22px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:mobile?"flex-start":"center",flexDirection:mobile?"column":"row",gap:mobile?14:0}} critical={isCritical}>
        <div style={{display:"flex",alignItems:"center",gap:mobile?14:18}}>
          <div style={{position:"relative",flexShrink:0}}>
            <Avatar initials={emp.initials} size={mobile?46:58} level={emp.level}/>
            <div style={{
              position:"absolute",inset:-4,borderRadius:"50%",
              border:`2px solid ${scoreColor}`,
              animation: isCritical ? "pulseGlow 2s ease-in-out infinite" : "none",
            }}/>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:mobile?16:22,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{emp.name}</span>
              <CyberBadge level={emp.level}/>
            </div>
            <div style={{fontSize:mobile?10:12,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{emp.role} — {emp.dept}</div>
            <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"}}>
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
        <div style={{textAlign:mobile?"left":"right",paddingLeft:mobile?4:0}}>
          <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:4}}>RISK SCORE</div>
          <div style={{
            fontSize:mobile?44:64,fontWeight:900,color:scoreColor,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1,
            textShadow:`0 0 30px ${scoreColor}80, 0 0 60px ${scoreColor}40`,
          }}>{emp.score}</div>
          <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginTop:4}}>/ 100 · {emp.trend}</div>
        </div>
      </Panel>

      {/* Timeline */}
      <Panel style={{padding:mobile?"14px":"22px",marginBottom:14}} animate={false}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <SectionLabel>30-Day Risk Score Timeline</SectionLabel>
          <span style={{
            background:`${trendColor}18`,border:`1px solid ${trendColor}50`,
            color:trendColor,padding:"4px 10px",borderRadius:2,fontSize:mobile?9:10,
            fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:700,letterSpacing:1,
          }}>{trendLabel}</span>
        </div>
        <ResponsiveContainer width="100%" height={mobile?140:180}>
          <LineChart data={empTimeline}>
            <defs>
              <linearGradient id="tg2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={C.cyan}      stopOpacity={0.8}/>
                <stop offset="70%"  stopColor={C.cyan}      stopOpacity={0.8}/>
                <stop offset="100%" stopColor={scoreColor}  stopOpacity={1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={d=>d%5===0?`D${d}`:""}/>
            <YAxis domain={[0,100]} tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} width={28}/>
            <Tooltip content={<TT/>} labelFormatter={d=>`Day ${d}`}/>
            <Line type="monotone" dataKey="score"     stroke="url(#tg2)" strokeWidth={2.5} dot={false} name="Score" isAnimationActive={false}/>
            <Line type="monotone" dataKey="baseline"  stroke={C.border}         strokeWidth={1} strokeDasharray="4 4" dot={false} name="Baseline" isAnimationActive={false}/>
            <Line type="monotone" dataKey="threshold" stroke={`${C.red}60`}     strokeWidth={1} strokeDasharray="4 4" dot={false} name="Threshold" isAnimationActive={false}/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:mobile?12:20,marginTop:8,flexWrap:"wrap"}}>
          {[["Risk Score","url(#tg2)","solid"],["Org. Baseline",C.border,"dashed"],["Threshold",C.red,"dashed"]].map(([l,c,s])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
              <div style={{width:16,height:2,background:c,opacity:s==="dashed"?0.5:1}}/>
              {l}
            </div>
          ))}
        </div>
      </Panel>

      {/* Behavior Indicators */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:mobile?11:13,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)",letterSpacing:1,marginBottom:10}}>BEHAVIOR INDICATORS</div>
        <div style={{display:"grid",gridTemplateColumns:mobile?"repeat(3,1fr)":"repeat(5,1fr)",gap:mobile?8:10}}>
          {[
            {Icon:LogIn,     label:"Login Time",    value:loginStr,               sub:"Last recorded",  bad:loginBad},
            {Icon:FolderOpen,label:"Files",          value:`${emp.files}`,         sub:"Past 24h",        bad:filesBad},
            {Icon:KeyRound,  label:"Priv.",          value:`${emp.priv}`,          sub:"Unauthorized",   bad:privBad},
            {Icon:Usb,       label:"USB",            value:`${emp.usb}`,           sub:"External",        bad:usbBad},
            {Icon:Mail,      label:"Sentiment",      value:`${emp.sentiment}`,     sub:sentBad?"Negative":"Neutral", bad:sentBad},
          ].map((b,i)=>{
            const col = b.bad ? scoreColor : C.cyan;
            return (
              <Panel key={b.label} style={{padding:mobile?"12px":"16px",animationDelay:`${i*80}ms`}} critical={b.bad && isCritical}>
                <div style={{
                  width:mobile?28:34,height:mobile?28:34,borderRadius:6,marginBottom:mobile?8:12,
                  background:`linear-gradient(135deg,${col}20,${col}08)`,
                  border:`1px solid ${col}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}><b.Icon size={mobile?13:16} color={col} strokeWidth={1.8}/></div>
                <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:2}}>{b.label}</div>
                <div style={{fontSize:mobile?13:16,fontWeight:800,color:b.bad?col:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:2}}>{b.value}</div>
                <div style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{b.sub}</div>
                {b.bad
                  ? <div style={{fontSize:9,color:col,marginTop:6,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>ANOMALOUS</div>
                  : <div style={{fontSize:9,color:C.green,marginTop:6,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>NORMAL</div>
                }
              </Panel>
            );
          })}
        </div>
      </div>

      {/* Signal Breakdown Table — scrollable on mobile */}
      <Panel style={{padding:mobile?"14px":"22px"}} animate={false}>
        <SectionLabel>Anomaly Signal Breakdown</SectionLabel>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:mobile?480:0}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["Signal","Baseline","Observed","Deviation","Severity"].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:9,color:C.textMid,letterSpacing:2,textTransform:"uppercase",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map((r,i)=>(
                <tr key={r.s} className="row-hover" style={{borderBottom:`1px solid ${C.border}40`,animation:`slideInUp 0.4s ease-out both`,animationDelay:`${i*80}ms`}}>
                  <td style={{padding:"10px 10px",fontSize:mobile?11:13,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)",whiteSpace:"nowrap"}}>{r.s}</td>
                  <td style={{padding:"10px 10px",fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",whiteSpace:"nowrap"}}>{r.base}</td>
                  <td style={{padding:"10px 10px",fontSize:11,fontWeight:700,color:r.bad?LEVEL_C[r.sev]:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",whiteSpace:"nowrap"}}>{r.obs}</td>
                  <td style={{padding:"10px 10px",fontSize:10,color:r.bad?C.textMid:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{r.dev}</td>
                  <td style={{padding:"10px 10px"}}><CyberBadge level={r.sev}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
export default EmployeeDeepDive;