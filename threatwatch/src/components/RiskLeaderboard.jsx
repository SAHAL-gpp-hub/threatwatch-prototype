import React from "react";
import { BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Eye } from "lucide-react";
import { C, LEVEL_C } from "../constants/theme.js";
import { Panel } from "./ui/Panel.jsx";
import { Avatar } from "./ui/Avatar.jsx";
import { CyberBadge } from "./ui/CyberBadge.jsx";
import { SectionLabel } from "./ui/SectionLabel.jsx";
import { TT } from "./ui/Tooltip.jsx";
import { EMPTY_EMP, buildRadar } from "../utils/data.js";
import { RiskTable } from "./RiskTable.jsx";
import { useMobile } from "../utils/useMobile.js";

export function RiskLeaderboard({ employees=[], onAnalyze, lastUpdate=null }) {
  const mobile = useMobile();
  const top3 = employees.slice(0,3);
  return (
    <div style={{padding:mobile?"16px 12px":"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:mobile?18:26}}>
        <div style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6}}>// THREAT INTELLIGENCE</div>
        <h2 style={{fontSize:mobile?18:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:mobile?1:2}}>RISK LEADERBOARD</h2>
        <p style={{color:C.textLow,fontSize:mobile?10:11,marginTop:6,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>EMPLOYEES RANKED BY BEHAVIORAL THREAT SCORE</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:14,marginBottom:18}}>
        {top3.map((e,i)=>{
          const c = LEVEL_C[e.level];
          return (
            <Panel key={e.id} style={{padding:mobile?"16px":"22px",animationDelay:`${i*100}ms`,cursor:"pointer"}} critical={e.level==="Critical"}
              onClick={()=>onAnalyze&&onAnalyze(e)}>
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
                    fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
                  }}>{i+1}</div>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)"}}>{e.name}</div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{e.dept}</div>
                </div>
              </div>
              <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:6}}>RISK SCORE</div>
              <div style={{width:"100%",height:4,background:C.muted,borderRadius:2,marginBottom:10,overflow:"hidden"}}>
                <div style={{width:`${e.score}%`,height:"100%",background:c,borderRadius:2,boxShadow:`0 0 10px ${c}`,animation:"riskRise 1s ease-out"}}/>
              </div>
              <div style={{fontSize:42,fontWeight:900,color:c,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
                textShadow:`0 0 20px ${c}80`,lineHeight:1,marginBottom:12}}>{e.score}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <CyberBadge level={e.level}/>
                <span style={{fontSize:11,color:e.trend==="Rising"?C.red:e.trend==="Declining"?C.green:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                  {e.trend==="Rising"?"^":e.trend==="Declining"?"v":"-"} {e.trend}
                </span>
              </div>
              <button className="cyber-btn" onClick={e2=>{e2.stopPropagation();onAnalyze&&onAnalyze(e)}} style={{
                marginTop:12,width:"100%",background:"transparent",
                border:`1px solid ${C.cyan}40`,color:C.cyan,borderRadius:3,
                padding:"7px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
                display:"flex",alignItems:"center",justifyContent:"center",gap:5,
              }}><Eye size={11} strokeWidth={2}/>DEEP DIVE</button>
            </Panel>
          );
        })}
      </div>

      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 260px",gap:14,marginBottom:14}}>
        <Panel style={{padding:mobile?"16px":"22px"}} animate={false}>
          <SectionLabel>Risk Score Comparison — All Employees</SectionLabel>
          <ResponsiveContainer width="100%" height={mobile?160:190}>
            <BarChart data={employees.map(e=>({n:e.name.split(" ")[0],s:e.score,l:e.level}))}>
              <XAxis dataKey="n" tick={{fill:C.textLow,fontSize:mobile?9:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:C.textLow,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="s" name="Score" radius={[3,3,0,0]}>
                {employees.map((e,i)=>(
                  <Cell key={i} fill={LEVEL_C[e.level]} style={{filter:`drop-shadow(0 0 4px ${LEVEL_C[e.level]})`}}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel style={{padding:mobile?"16px":"22px"}} animate={false}>
          <SectionLabel>Threat Profile</SectionLabel>
          <div style={{fontSize:11,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:8}}>{(top3[0]||EMPTY_EMP).name} — #1</div>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={buildRadar(top3[0] || EMPTY_EMP)}>
              <PolarGrid stroke={C.border}/>
              <PolarAngleAxis dataKey="s" tick={{fill:C.textLow,fontSize:9,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}/>
              <Radar dataKey="v" stroke={C.red} fill={C.red} fillOpacity={0.2} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
          {[["Files",`${(top3[0]||EMPTY_EMP).files}`],["Priv.",`${(top3[0]||EMPTY_EMP).priv}`],["USB",`${(top3[0]||EMPTY_EMP).usb}`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:11,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",borderTop:`1px solid ${C.border}`}}>
              <span style={{color:C.textLow}}>{k}</span>
              <span style={{color:C.red,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel style={{padding:mobile?"16px":"22px"}} animate={false}>
        <SectionLabel>Full Rankings</SectionLabel>
        <RiskTable employees={employees} delay={100} onAnalyze={onAnalyze}/>
      </Panel>
    </div>
  );
}
export default RiskLeaderboard;
