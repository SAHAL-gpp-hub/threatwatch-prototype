import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Users, Zap, Flame, Crosshair, FileWarning } from "lucide-react";
import { C } from "../constants/theme.js";
import { StatCard } from "./ui/StatCard.jsx";
import { Panel } from "./ui/Panel.jsx";
import { SectionLabel } from "./ui/SectionLabel.jsx";
import { GlowDot } from "./ui/GlowDot.jsx";
import { TT } from "./ui/Tooltip.jsx";
import { RiskTable } from "./RiskTable.jsx";
import { generateReport } from "../reportGenerator.js";

export function DashboardOverview({ attackDone, employees=[], onAnalyze, lastUpdate=null }) {
  // Build last-7-day alert activity from employee timelines (days 24-30)
  const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const alertActivity = DAYS.map((day, i) => {
    const dayIdx = 24 + i; // days 24-30 of 30-day timeline
    const total = employees.reduce((sum, e) => {
      const pt = e.timeline?.find(p => p.day === dayIdx);
      return sum + (pt && pt.score > 40 ? 1 : pt && pt.score > 20 ? 0.5 : 0);
    }, 0);
    return { day, v: Math.round(total) };
  });

  const critCount = employees.filter(e=>e.level==="Critical").length;
  const highCount = employees.filter(e=>e.level==="High"||e.level==="Critical").length;
  const riskDist = [
    {name:"Low",     value:employees.filter(e=>e.level==="Low").length * 31,     color:C.green},
    {name:"Moderate",value:employees.filter(e=>e.level==="Moderate").length * 24, color:C.yellow},
    {name:"High",    value:employees.filter(e=>e.level==="High").length * 14,     color:C.orange},
    {name:"Critical",value:attackDone ? critCount*4+8 : critCount*4,              color:C.red},
  ];

  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:26,animation:"glitchIn 0.5s ease-out"}}>
        <div style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6}}>// SYSTEM STATUS: OPERATIONAL</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h2 style={{fontSize:26,fontWeight:900,color:C.text,margin:0,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>DASHBOARD OVERVIEW</h2>
            <p style={{color:C.textMid,fontSize:11,margin:"6px 0 0",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>REAL-TIME BEHAVIORAL RISK INTELLIGENCE — LIVE MONITORING ACTIVE</p>
          </div>
          <button id="no-print" className="cyber-btn" onClick={()=>generateReport(employees)} style={{
            background:`linear-gradient(135deg,${C.cyan}20,${C.cyan}08)`,
            border:`1px solid ${C.cyan}60`,color:C.cyan,
            borderRadius:4,padding:"8px 18px",cursor:"pointer",fontSize:10,
            fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,fontWeight:700,
            display:"flex",alignItems:"center",gap:7,flexShrink:0,marginTop:4,
            boxShadow:`0 0 12px ${C.cyan}15`,
          }}>
            <FileWarning size={13} strokeWidth={2}/>
            EXPORT REPORT
          </button>
        </div>
      </div>

      <div style={{display:"flex",gap:14,marginBottom:18}}>
        <StatCard label="Employees Monitored" value={employees.length} sub="Active ML surveillance" icon={<Users size={18} color={C.cyan}/>} delay={0}/>
        <StatCard label="Active Alerts"      value={attackDone ? highCount+critCount+3 : highCount+critCount} sub={attackDone?"+3 since attack":"+1 today"} subColor={C.orange} icon={<Zap size={18} color={C.orange}/>} delay={60}/>
        <StatCard label="High Risk"          value={attackDone ? highCount+1 : highCount} sub={`${highCount} employees flagged`} subColor={C.orange} icon={<Flame size={18} color={C.orange}/>} delay={120}/>
        <StatCard label="Critical Threats"   value={attackDone ? critCount+1 : critCount} sub={critCount>0?"Immediate action required":"All clear"} subColor={C.red} icon={<Crosshair size={18} color={C.red}/>} delay={180} critical={attackDone||critCount>0}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,marginBottom:14}}>
        <Panel style={{padding:"22px"}} animate={false}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <SectionLabel>Alert Activity — 7 Days</SectionLabel>
            {lastUpdate && <span style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>LIVE</span>}
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={alertActivity}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={C.red} stopOpacity={0.4}/>
                  <stop offset="100%" stopColor={C.red} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fill:C.textLow,fontSize:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.textLow,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Area type="monotone" dataKey="v" name="Alerts" stroke={C.red} fill="url(#ag)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{padding:"22px"}} animate={false}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <SectionLabel>Risk Distribution</SectionLabel>
            {lastUpdate && <span style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>LIVE</span>}
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
            <PieChart width={130} height={130}>
              <Pie data={riskDist} cx={60} cy={60} innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                {riskDist.map((e,i)=><Cell key={i} fill={e.color} style={{filter:`drop-shadow(0 0 4px ${e.color})`}}/>)}
              </Pie>
            </PieChart>
          </div>
          {riskDist.map(r=>(
            <div key={r.name} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:11,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.textMid,display:"flex",alignItems:"center",gap:7}}>
                <GlowDot color={r.color} size={6}/>
                {r.name}
              </span>
              <span style={{color:r.color,fontWeight:700}}>{r.value} <span style={{color:C.textLow,fontWeight:400}}>{employees.length > 0 ? Math.round(r.value/employees.length*100) : 0}%</span></span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel style={{padding:"22px"}} animate={false}>
        <SectionLabel>Employee Risk Ranking — Top Threats</SectionLabel>
        <RiskTable employees={employees.slice(0,5)} delay={200} onAnalyze={onAnalyze}/>
      </Panel>
    </div>
  );
}
export default DashboardOverview;
