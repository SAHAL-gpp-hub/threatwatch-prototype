import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Eye, Lock, FileWarning, CheckCircle } from "lucide-react";
import { C, LEVEL_C } from "../constants/theme.js";
import { GlowDot } from "./ui/GlowDot.jsx";
import { CyberBadge } from "./ui/CyberBadge.jsx";
import { Panel } from "./ui/Panel.jsx";
import { SectionLabel } from "./ui/SectionLabel.jsx";

export function AlertCenter({ employees=[], onAnalyze }) {
  const [expanded, setExpanded]   = useState(1);
  const [search,   setSearch]     = useState("");
  const [levelF,   setLevelF]     = useState("ALL");
  const [statusF,  setStatusF]    = useState("ALL");
  const [resolved, setResolved]   = useState({});

  // Build alerts dynamically from top employees
  const allAlerts = [
    { id:1, type:"Data Exfiltration Attempt",   level:"Critical", status:"Investigating",
      emp: employees[0],
      desc: employees[0] ? `Unusual after-hours access detected. Employee accessed ${employees[0].files} sensitive files. USB device connected and 2.4GB transferred to external drive.` : "",
      actions:["Immediately suspend user account access","Isolate workstation from network","Preserve forensic evidence on USB device","Notify CISO and legal department","Initiate HR escalation protocol"],
    },
    { id:2, type:"Privilege Escalation",          level:"Critical", status:"Open",          emp: employees[1], desc:"", actions:[] },
    { id:3, type:"Unusual Data Access Pattern",   level:"High",     status:"Open",          emp: employees[2], desc:"", actions:[] },
    { id:4, type:"Sensitive Document Access",      level:"High",     status:"Investigating", emp: employees[3], desc:"", actions:[] },
  ].filter(a => a.emp).map(a => ({
    ...a,
    status: resolved[a.id] ? "Resolved" : a.status,
  }));

  const alerts = allAlerts.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.emp?.name?.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.emp?.dept?.toLowerCase().includes(q) ||
      a.level.toLowerCase().includes(q);
    const matchLevel  = levelF  === "ALL" || a.level.toUpperCase()  === levelF;
    const matchStatus = statusF === "ALL" || a.status.toUpperCase() === statusF;
    return matchSearch && matchLevel && matchStatus;
  });

  return (
    <div style={{padding:"28px 32px",overflowY:"auto",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26}}>
        <div>
          <div style={{fontSize:9,color:C.red,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6,animation:"neonText 2s ease-in-out infinite"}}>// ACTIVE THREATS DETECTED</div>
          <h2 style={{fontSize:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>ALERT CENTER</h2>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[[`${alerts.filter(a=>a.level==="Critical").length} Critical`,C.red],[`${alerts.filter(a=>a.level==="High").length} High`,C.orange]].map(([t,c])=>(
            <span key={t} style={{
              background:`${c}15`,border:`1px solid ${c}50`,color:c,
              padding:"6px 16px",borderRadius:2,fontSize:11,fontWeight:700,
              fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
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
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name, type, department, level..."
          style={{
            flex:1,background:C.panelAlt,
            border:`1px solid ${search ? C.cyan : C.border}`,
            borderRadius:3,padding:"10px 16px",
            color:C.text,fontSize:12,
            outline:"none",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",minWidth:260,
            transition:"border-color 0.2s",
          }}
        />
        {search && (
          <button onClick={()=>setSearch("")} style={{
            background:`${C.red}15`,border:`1px solid ${C.red}40`,color:C.red,
            borderRadius:3,padding:"8px 12px",fontSize:11,cursor:"pointer",
            fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
          }}>CLEAR</button>
        )}
        <div style={{display:"flex",gap:6}}>
          {["ALL","CRITICAL","HIGH"].map((f)=>{
            const active = levelF===f;
            const col = f==="CRITICAL"?C.red:f==="HIGH"?C.orange:C.cyan;
            return (
              <button key={f} className="cyber-btn" onClick={()=>setLevelF(f)} style={{
                background:active?`${col}20`:C.panelAlt,
                border:`1px solid ${active?col:C.border}`,
                color:active?col:C.textMid,borderRadius:3,
                padding:"8px 14px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
                transition:"all 0.15s",fontWeight:active?700:400,
              }}>{f}</button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["ALL","OPEN","INVESTIGATING","RESOLVED"].map((f)=>{
            const active = statusF===f;
            const col = f==="RESOLVED"?C.green:f==="INVESTIGATING"?C.yellow:C.cyan;
            return (
              <button key={f} className="cyber-btn" onClick={()=>setStatusF(f)} style={{
                background:active?`${col}20`:C.panelAlt,
                border:`1px solid ${active?col:C.border}`,
                color:active?col:C.textMid,borderRadius:3,
                padding:"8px 14px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
                transition:"all 0.15s",fontWeight:active?700:400,
              }}>{f}</button>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
        {alerts.length === 0 && (
          <div style={{
            padding:"40px",textAlign:"center",
            background:C.panel,border:`1px solid ${C.border}`,borderRadius:4,
          }}>
            <div style={{fontSize:13,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>
              NO ALERTS MATCH CURRENT FILTERS
            </div>
            <button onClick={()=>{setSearch("");setLevelF("ALL");setStatusF("ALL");}} style={{
              marginTop:12,background:`${C.cyan}15`,border:`1px solid ${C.cyan}40`,color:C.cyan,
              borderRadius:3,padding:"6px 18px",fontSize:10,cursor:"pointer",
              fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
            }}>RESET FILTERS</button>
          </div>
        )}
        {alerts.map((a,i)=>(
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
                    <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)",letterSpacing:0.5}}>{a.type}</span>
                    <CyberBadge level={a.level}/>
                    <span style={{
                      background:a.status==="Investigating"?`${C.yellow}15`:`${C.textLow}20`,
                      border:`1px solid ${a.status==="Investigating"?C.yellow:C.textLow}40`,
                      color:a.status==="Investigating"?C.yellow:C.textLow,
                      padding:"2px 10px",borderRadius:2,fontSize:9,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:700,letterSpacing:1,
                    }}>● {a.status.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginTop:4}}>
                    {a.emp?.name} · {a.emp?.dept} · {a.time || "Today"}
                  </div>
                </div>
              </div>
              <button className="cyber-btn" onClick={e2=>{e2.stopPropagation();onAnalyze&&onAnalyze(a.emp)}} style={{
                background:"transparent",border:`1px solid ${C.cyan}40`,color:C.cyan,
                borderRadius:3,padding:"6px 16px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,flexShrink:0,
                display:"flex",alignItems:"center",gap:5,
              }}><Eye size={11} strokeWidth={2}/>ANALYZE</button>
            </div>

            {expanded===a.id && a.desc && (
              <div style={{padding:"0 20px 20px",borderTop:`1px solid ${C.border}40`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,margin:"18px 0"}}>
                  <div>
                    <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Incident Description</div>
                    <p style={{fontSize:13,color:C.textMid,lineHeight:1.8,margin:0}}>{a.desc}</p>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Recommended Actions</div>
                    {a.actions.map((ac,j)=>(
                      <div key={j} style={{display:"flex",gap:10,marginBottom:10,fontSize:12,color:C.textMid,alignItems:"flex-start"}}>
                        <span style={{
                          width:20,height:20,borderRadius:2,flexShrink:0,
                          background:`${C.red}15`,border:`1px solid ${C.red}40`,
                          color:C.red,display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:9,fontWeight:700,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
                        }}>{j+1}</span>
                        {ac}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[
                    {l:"SUSPEND ACCOUNT",   bg:C.red,         color:"white",    border:C.red,    icon: <Lock size={12} strokeWidth={2}/>},
                    {l:"ENHANCED MONITOR",  bg:"transparent", color:C.cyan,     border:C.cyan,   icon: <Eye size={12} strokeWidth={2}/>},
                    {l:"VIEW FULL LOG",     bg:"transparent", color:C.textMid,  border:C.border, icon: <FileWarning size={12} strokeWidth={2}/>},
                  ].map(b=>(
                    <button key={b.l} className="cyber-btn" style={{
                      background:b.bg,border:`1px solid ${b.border}`,color:b.color,
                      borderRadius:3,padding:"8px 18px",fontSize:10,cursor:"pointer",
                      fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,fontWeight:700,
                      display:"flex",alignItems:"center",gap:6,
                    }}>{b.icon}{b.l}</button>
                  ))}
                  <button className="cyber-btn" onClick={()=>setResolved(r=>({...r,[a.id]:true}))} style={{
                    marginLeft:"auto",
                    background:resolved[a.id]?`${C.green}25`:`${C.green}10`,
                    border:`1px solid ${C.green}${resolved[a.id]?"70":"40"}`,color:C.green,
                    borderRadius:3,padding:"8px 18px",fontSize:10,cursor:"pointer",
                    fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,fontWeight:700,
                    display:"flex",alignItems:"center",gap:6,
                  }}><CheckCircle size={12} strokeWidth={2}/>{resolved[a.id]?"RESOLVED":"MARK RESOLVED"}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(() => {
        const critN   = employees.filter(e=>e.level==="Critical").length;
        const highN   = employees.filter(e=>e.level==="High").length;
        const totalAt = critN + highN;
        const mttd    = (1.2 + critN * 0.3 + highN * 0.1).toFixed(1);
        const mttr    = (8 + critN * 2.5 + highN * 1.2).toFixed(1);
        const fpRate  = (Math.max(0.8, 5 - employees.length * 0.15)).toFixed(1);
        const resolvedAlerts= employees.length * 11 + 8;
        return (
          <div style={{display:"flex",gap:14}}>
            {[
              ["Mean Time to Detect",  `${mttd} min`,   `${mttd<3?"improving":"monitor"}`, mttd<3?C.green:C.orange],
              ["Mean Time to Respond", `${mttr} min`,   `${totalAt} active threats`, mttr<15?C.green:C.orange],
              ["False Positive Rate",  `${fpRate}%`,    "ML accuracy 97.6%",          C.green],
              ["Alerts Resolved (30d)",`${resolvedAlerts}`,   `${(resolvedAlerts/(resolvedAlerts+totalAt)*100).toFixed(1)}% resolution`, C.green],
            ].map(([l,v,s,c])=>(
              <Panel key={l} style={{flex:1,padding:"18px"}} animate={false}>
                <div style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:8}}>{l}</div>
                <div style={{fontSize:24,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{v}</div>
                <div style={{fontSize:10,color:c,marginTop:6,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{s}</div>
              </Panel>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
export default AlertCenter;
