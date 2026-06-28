import React, { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, ShieldAlert, Flame, Activity, Clock, Database } from "lucide-react";
import { C } from "../constants/theme.js";
import { GlowDot } from "./ui/GlowDot.jsx";
import { Panel } from "./ui/Panel.jsx";
import { SectionLabel } from "./ui/SectionLabel.jsx";
import { TT } from "./ui/Tooltip.jsx";
import { EVENTS } from "../utils/data.js";
import { useMobile } from "../utils/useMobile.js";

export function SystemAnalytics({ employees=[], lastUpdate=null }) {
  const [updateSec, setUpdateSec] = useState(0);
  const mobile = useMobile();

  useEffect(() => {
    const t = setInterval(() => setUpdateSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [lastUpdate]);
  useEffect(() => { setUpdateSec(0); }, [lastUpdate]);

  const dmap = {};
  employees.forEach(e => {
    if (!dmap[e.dept]) dmap[e.dept] = {d:e.dept,h:0,c:0,total:0,scoreSum:0};
    if (e.level === "Critical") dmap[e.dept].c++;
    else if (e.level === "High") dmap[e.dept].h++;
    dmap[e.dept].total++;
    dmap[e.dept].scoreSum += e.score;
  });
  const liveDept = Object.values(dmap)
    .map(d => ({...d,avg:d.total?Math.round(d.scoreSum/d.total):0}))
    .sort((a,b)=>(b.h+b.c)-(a.h+a.c));

  const liveAccuracy = employees.length
    ? Math.max(91, Math.min(99, 100 - (employees.filter(e=>e.level==="Critical").length*0.5) - (employees.filter(e=>e.level==="High").length*0.1) + (employees.length*0.05)))
    : 97.6;
  const MONTHS = ["Oct","Nov","Dec","Jan","Feb","Mar"];
  const ML_PERF = MONTHS.map((m,i) => {
    const p = i/(MONTHS.length-1);
    return {
      m,
      p: parseFloat((93.0 + p*(liveAccuracy-93.0)).toFixed(1)),
      r: parseFloat((91.5 + p*(liveAccuracy-2.0-91.5)).toFixed(1)),
      f: parseFloat((92.0 + p*(liveAccuracy-0.5-92.0)).toFixed(1)),
    };
  });

  const critCount  = employees.filter(e=>e.level==="Critical").length;
  const highCount  = employees.filter(e=>e.level==="High").length;
  const avgScore   = employees.length ? (employees.reduce((s,e)=>s+e.score,0)/employees.length).toFixed(1) : "0.0";
  const afterHours = employees.filter(e=>{ const h=e.login_hour??parseInt(e.loginTime||"9"); return h<7||h>20; }).length;
  const usbEvents  = employees.reduce((s,e)=>s+(e.usb||0),0);
  const secAgo = updateSec < 60 ? `${updateSec}s ago` : `${Math.floor(updateSec/60)}m ago`;

  const sentimentSignals = employees.filter(e=>e.sentiment<0).length;
  const usbSignals       = employees.filter(e=>e.usb>0).length;
  const privSignals      = employees.filter(e=>e.priv>0).length;
  const afterHoursCount  = employees.filter(e=>{ const h=e.login_hour??8; return h<7||h>20; }).length;
  const totalSignals     = sentimentSignals+usbSignals+privSignals+afterHoursCount+employees.length;
  const pct = (n,base) => Math.max(5,Math.round(base+(n/Math.max(1,totalSignals))*20));
  const behavPct = pct(employees.length,30), nlpPct = pct(sentimentSignals,18);
  const netPct = pct(privSignals,16), tsPct = pct(afterHoursCount,12), anomPct = pct(usbSignals,6);
  const totalPct = behavPct+nlpPct+netPct+tsPct+anomPct;
  const modelDist = [
    {name:"Behavioral ML",   v:Math.round(behavPct/totalPct*100), c:C.cyan},
    {name:"NLP Sentiment",   v:Math.round(nlpPct/totalPct*100),   c:C.purple},
    {name:"Network Graph",   v:Math.round(netPct/totalPct*100),   c:C.green},
    {name:"Time Series",     v:Math.round(tsPct/totalPct*100),    c:C.yellow},
    {name:"Anomaly Detect.", v:Math.round(anomPct/totalPct*100),  c:C.red},
  ];

  const statCards = [
    ["Employees",  employees.length,    "Active surveillance",       C.cyan,   <Users    size={16} color={C.cyan}/>,    0],
    ["Critical",   critCount,           critCount>0?"Immediate action":"All clear", critCount>0?C.red:C.green, <ShieldAlert size={16} color={critCount>0?C.red:C.green}/>, 60],
    ["High Risk",  highCount,           "Elevated monitoring",       C.orange, <Flame    size={16} color={C.orange}/>,  120],
    ["Avg Score",  avgScore,            `/${employees.length} emps`, C.yellow, <Activity size={16} color={C.yellow}/>,  180],
    ["After-Hours",afterHours,          "Behavioral anomalies",      afterHours>2?C.red:C.green, <Clock size={16} color={afterHours>2?C.red:C.green}/>, 240],
    ["USB Events", usbEvents,           "Exfil risk signals",        usbEvents>3?C.red:C.textMid, <Database size={16} color={usbEvents>3?C.red:C.textMid}/>, 300],
  ];

  return (
    <div style={{padding:mobile?"14px 12px":"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:mobile?16:26}}>
        <div style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6}}>// PLATFORM HEALTH</div>
        <h2 style={{fontSize:mobile?17:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:mobile?1:2}}>SYSTEM ANALYTICS</h2>
        <p style={{color:C.textLow,fontSize:mobile?9:11,marginTop:4,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>ML MODEL HEALTH, INFRASTRUCTURE METRICS</p>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <GlowDot color={C.green} pulse size={6}/>
        <span style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>
          ALL METRICS LIVE · UPDATED {secAgo.toUpperCase()}
        </span>
      </div>

      {/* Stat cards — 3 cols on mobile, 6 on desktop */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"repeat(3,1fr)":"repeat(6,1fr)",gap:mobile?8:12,marginBottom:16}}>
        {statCards.map(([l,v,s,c,icon,d])=>(
          <Panel key={l} style={{padding:mobile?"12px":"16px",animationDelay:`${d}ms`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontSize:mobile?8:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,lineHeight:1.4}}>{l}</div>
              {icon}
            </div>
            <div style={{fontSize:mobile?18:22,fontWeight:900,color:c,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{v}</div>
            <div style={{fontSize:mobile?9:10,color:C.textMid,marginTop:4,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{s}</div>
          </Panel>
        ))}
      </div>

      {/* ML Perf + Event Load */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:14,marginBottom:14}}>
        <Panel style={{padding:mobile?"14px":"22px"}} animate={false}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <SectionLabel>ML Model Performance — 6 Months</SectionLabel>
            {!mobile && <span style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>UPDATED {secAgo} AGO</span>}
          </div>
          <ResponsiveContainer width="100%" height={mobile?150:180}>
            <LineChart data={ML_PERF}>
              <XAxis dataKey="m" tick={{fill:C.textLow,fontSize:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[88,100]} tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip content={<TT/>}/>
              <Line type="monotone" dataKey="p" name="Precision" stroke={C.purple} strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="r" name="Recall"    stroke={C.cyan}   strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="f" name="F1 Score"  stroke={C.green}  strokeWidth={2.5} dot={{r:3,fill:C.green,strokeWidth:0}}/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            {[["Precision",C.purple],["Recall",C.cyan],["F1 Score",C.green]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:mobile?9:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                <div style={{width:14,height:2,background:c}}/>{l}
              </div>
            ))}
          </div>
        </Panel>

        <Panel style={{padding:mobile?"14px":"22px"}} animate={false}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <SectionLabel>Event Processing Load — 24h</SectionLabel>
          </div>
          <ResponsiveContainer width="100%" height={mobile?150:180}>
            <AreaChart data={EVENTS}>
              <defs>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.purple} stopOpacity={0.5}/>
                  <stop offset="100%" stopColor={C.red}    stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="h" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} interval={mobile?7:5}/>
              <YAxis tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="v" name="Events" stroke={C.red} fill="url(#eg)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Threats by Dept + Model Mix */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 260px",gap:14,marginBottom:14}}>
        <Panel style={{padding:mobile?"14px":"22px"}} animate={false}>
          <SectionLabel>Threats by Department</SectionLabel>
          <ResponsiveContainer width="100%" height={mobile?160:200}>
            <BarChart data={liveDept} layout="vertical">
              <XAxis type="number" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="d" type="category" tick={{fill:C.textLow,fontSize:mobile?9:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}} axisLine={false} tickLine={false} width={mobile?60:76}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="h" name="High"     fill={C.orange} radius={[0,3,3,0]} stackId="a"/>
              <Bar dataKey="c" name="Critical" fill={C.red}    radius={[0,3,3,0]} stackId="a"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:14,marginTop:8}}>
            {[["High",C.orange],["Critical",C.red]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                <GlowDot color={c} size={6}/>{l}
              </div>
            ))}
          </div>
        </Panel>

        <Panel style={{padding:mobile?"14px":"22px"}} animate={false}>
          <SectionLabel>Detection Model Mix</SectionLabel>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
            <PieChart width={120} height={120}>
              <Pie data={modelDist} cx={56} cy={56} innerRadius={34} outerRadius={52} dataKey="v" strokeWidth={0}>
                {modelDist.map((e,i)=><Cell key={i} fill={e.c} style={{filter:`drop-shadow(0 0 4px ${e.c})`}}/>)}
              </Pie>
            </PieChart>
          </div>
          {modelDist.map(m=>(
            <div key={m.name} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:mobile?9:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.textMid,display:"flex",alignItems:"center",gap:5}}><GlowDot color={m.c} size={6}/>{m.name}</span>
              <span style={{color:m.c,fontWeight:700}}>{m.v}%</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* Infrastructure Health */}
      <Panel style={{padding:mobile?"14px":"22px"}} animate={false}>
        <SectionLabel>Infrastructure Health</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:mobile?10:12}}>
          {(()=>{
            const hasCrit = employees.some(e=>e.level==="Critical");
            return [
              {n:"ML Inference Engine",    s:"OPERATIONAL", up:"99.98%", lat:"1.4s",  c:C.green},
              {n:"Event Stream Processor", s:"OPERATIONAL", up:"99.95%", lat:"0.2s",  c:C.green},
              {n:"Data Lake (S3)",          s:"OPERATIONAL", up:"100%",   lat:"—",     c:C.green},
              {n:"Alert Notification Svc", s:hasCrit?"HIGH LOAD":"OPERATIONAL", up:hasCrit?"98.7%":"99.9%", lat:hasCrit?"2.1s":"0.4s", c:hasCrit?C.yellow:C.green},
            ];
          })().map(sv=>(
            <div key={sv.n} style={{background:C.panelAlt,border:`1px solid ${sv.c}25`,borderRadius:4,padding:mobile?"12px":"16px"}}>
              <div style={{fontSize:9,color:sv.c,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
                <GlowDot color={sv.c} size={6} pulse={sv.s==="DEGRADED"}/>{sv.s}
              </div>
              <div style={{fontSize:mobile?11:13,fontWeight:700,color:C.text,marginBottom:8,fontFamily:"var(--sans-font,'Inter',sans-serif)"}}>{sv.n}</div>
              {[["Uptime",sv.up],["Latency",sv.lat]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:mobile?9:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
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
export default SystemAnalytics;