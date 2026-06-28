import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Eye, Lock, FileWarning, CheckCircle } from "lucide-react";
import { C, LEVEL_C } from "../constants/theme.js";
import { GlowDot } from "./ui/GlowDot.jsx";
import { CyberBadge } from "./ui/CyberBadge.jsx";
import { Panel } from "./ui/Panel.jsx";
import { SectionLabel } from "./ui/SectionLabel.jsx";
import { useMobile } from "../utils/useMobile.js";

export function AlertCenter({ employees=[], onAnalyze }) {
  const [expanded, setExpanded]   = useState(1);
  const [search,   setSearch]     = useState("");
  const [levelF,   setLevelF]     = useState("ALL");
  const [statusF,  setStatusF]    = useState("ALL");
  const [resolved, setResolved]   = useState({});
  const mobile = useMobile();

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

  const critN   = employees.filter(e=>e.level==="Critical").length;
  const highN   = employees.filter(e=>e.level==="High").length;
  const totalAt = critN + highN;
  const mttd    = (1.2 + critN * 0.3 + highN * 0.1).toFixed(1);
  const mttr    = (8 + critN * 2.5 + highN * 1.2).toFixed(1);
  const fpRate  = (Math.max(0.8, 5 - employees.length * 0.15)).toFixed(1);
  const resolvedAlerts = employees.length * 11 + 8;

  const metrics = [
    { l:"TOTAL ACTIVE",  v:totalAt,        s:`${critN} critical`,          c:C.red    },
    { l:"MTTD",          v:`${mttd}h`,     s:"Mean time to detect",        c:C.yellow },
    { l:"MTTR",          v:`${mttr}h`,     s:"Mean time to resolve",        c:C.orange },
    { l:"FALSE POS.",    v:`${fpRate}%`,   s:"Accuracy maintained",         c:C.green  },
  ];

  return (
    <div style={{padding:mobile?"14px 12px":"28px 32px",overflowY:"auto",height:"100%"}}>
      {/* Title row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:mobile?16:26,flexDirection:"row",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:9,color:C.red,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6,animation:"neonText 2s ease-in-out infinite"}}>// ACTIVE THREATS DETECTED</div>
          <h2 style={{fontSize:mobile?17:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:mobile?1:2}}>ALERT CENTER</h2>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[[`${alerts.filter(a=>a.level==="Critical").length} Critical`,C.red],[`${alerts.filter(a=>a.level==="High").length} High`,C.orange]].map(([t,c])=>(
            <span key={t} style={{
              background:`${c}15`,border:`1px solid ${c}50`,color:c,
              padding:"5px 12px",borderRadius:2,fontSize:10,fontWeight:700,
              fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
              display:"flex",alignItems:"center",gap:5,
            }}>
              <GlowDot color={c} pulse size={7}/>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:mobile?14:20,flexWrap:"wrap"}}>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder={mobile?"Search alerts...":"Search by name, type, department, level..."}
          style={{
            flex:"1 1 100%",background:C.panelAlt,
            border:`1px solid ${search ? C.cyan : C.border}`,
            borderRadius:3,padding:"9px 14px",
            color:C.text,fontSize:12,
            outline:"none",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",minWidth:0,
            transition:"border-color 0.2s",
          }}
        />
        {search && (
          <button onClick={()=>setSearch("")} style={{
            background:`${C.red}15`,border:`1px solid ${C.red}40`,color:C.red,
            borderRadius:3,padding:"7px 11px",fontSize:11,cursor:"pointer",
            fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
          }}>CLEAR</button>
        )}
        {/* Level filters */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["ALL","CRITICAL","HIGH"].map((f)=>{
            const active = levelF===f;
            const col = f==="CRITICAL"?C.red:f==="HIGH"?C.orange:C.cyan;
            return (
              <button key={f} className="cyber-btn" onClick={()=>setLevelF(f)} style={{
                background:active?`${col}20`:C.panelAlt,
                border:`1px solid ${active?col:C.border}`,
                color:active?col:C.textMid,borderRadius:3,
                padding:mobile?"7px 10px":"8px 14px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
                transition:"all 0.15s",fontWeight:active?700:400,
              }}>{f}</button>
            );
          })}
        </div>
        {/* Status filters — collapse on very small mobile */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["ALL","OPEN","INVESTIGATING","RESOLVED"].map((f)=>{
            const active = statusF===f;
            const col = f==="RESOLVED"?C.green:f==="INVESTIGATING"?C.yellow:C.cyan;
            return (
              <button key={f} className="cyber-btn" onClick={()=>setStatusF(f)} style={{
                background:active?`${col}20`:C.panelAlt,
                border:`1px solid ${active?col:C.border}`,
                color:active?col:C.textMid,borderRadius:3,
                padding:mobile?"7px 10px":"8px 14px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
                transition:"all 0.15s",fontWeight:active?700:400,
              }}>{mobile && f==="INVESTIGATING" ? "INVEST." : f}</button>
            );
          })}
        </div>
      </div>

      {/* Alert cards */}
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
            {/* Card header row */}
            <div
              style={{padding:mobile?"12px 12px":"16px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",cursor:"pointer",gap:8}}
              onClick={()=>setExpanded(expanded===a.id?null:a.id)}
            >
              <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1,minWidth:0}}>
                <div style={{paddingTop:2,flexShrink:0}}>
                  {a.level==="Critical" ? <ShieldAlert size={mobile?18:22} color={C.red} strokeWidth={1.8}/> : <AlertTriangle size={mobile?16:20} color={C.orange} strokeWidth={1.8}/>}
                </div>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                    <span style={{fontSize:mobile?12:14,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)",letterSpacing:0.5}}>{a.type}</span>
                    <CyberBadge level={a.level}/>
                    <span style={{
                      background:a.status==="Investigating"?`${C.yellow}15`:`${C.textLow}20`,
                      border:`1px solid ${a.status==="Investigating"?C.yellow:C.textLow}40`,
                      color:a.status==="Investigating"?C.yellow:a.status==="Resolved"?C.green:C.textLow,
                      padding:"2px 8px",borderRadius:2,fontSize:9,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:700,letterSpacing:1,
                    }}>● {a.status.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {a.emp?.name} · {a.emp?.dept} · Today
                  </div>
                </div>
              </div>
              <button className="cyber-btn" onClick={e2=>{e2.stopPropagation();onAnalyze&&onAnalyze(a.emp)}} style={{
                background:"transparent",border:`1px solid ${C.cyan}40`,color:C.cyan,
                borderRadius:3,padding:mobile?"5px 10px":"6px 16px",fontSize:10,cursor:"pointer",
                fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,flexShrink:0,
                display:"flex",alignItems:"center",gap:5,
              }}><Eye size={11} strokeWidth={2}/>{mobile?"":"ANALYZE"}</button>
            </div>

            {expanded===a.id && a.desc && (
              <div style={{padding:mobile?"0 12px 14px":"0 20px 20px",borderTop:`1px solid ${C.border}40`}}>
                <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?14:24,margin:"16px 0"}}>
                  <div>
                    <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Incident Description</div>
                    <p style={{fontSize:mobile?12:13,color:C.textMid,lineHeight:1.8,margin:0}}>{a.desc}</p>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Recommended Actions</div>
                    {a.actions.map((ac,j)=>(
                      <div key={j} style={{display:"flex",gap:8,marginBottom:8,fontSize:mobile?11:12,color:C.textMid,alignItems:"flex-start"}}>
                        <span style={{
                          width:18,height:18,borderRadius:2,flexShrink:0,
                          background:`${C.red}15`,border:`1px solid ${C.red}40`,
                          color:C.red,display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:9,fontWeight:700,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",
                        }}>{j+1}</span>
                        {ac}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[
                    {l:"SUSPEND",    bg:C.red,         color:"white",    border:C.red,    icon:<Lock size={11} strokeWidth={2}/>,    full:"SUSPEND ACCOUNT"},
                    {l:"MONITOR",    bg:"transparent", color:C.cyan,     border:C.cyan,   icon:<Eye size={11} strokeWidth={2}/>,     full:"ENHANCED MONITOR"},
                    {l:"VIEW LOG",   bg:"transparent", color:C.textMid,  border:C.border, icon:<FileWarning size={11} strokeWidth={2}/>, full:"VIEW FULL LOG"},
                  ].map(b=>(
                    <button key={b.l} className="cyber-btn" style={{
                      background:b.bg,border:`1px solid ${b.border}`,color:b.color,
                      borderRadius:3,padding:"7px 14px",fontSize:10,cursor:"pointer",
                      fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,fontWeight:700,
                      display:"flex",alignItems:"center",gap:5,
                    }}>{b.icon}{mobile?b.l:b.full}</button>
                  ))}
                  <button className="cyber-btn" onClick={()=>setResolved(r=>({...r,[a.id]:true}))} style={{
                    marginLeft:"auto",
                    background:resolved[a.id]?`${C.green}25`:`${C.green}10`,
                    border:`1px solid ${C.green}${resolved[a.id]?"70":"40"}`,color:C.green,
                    borderRadius:3,padding:"7px 14px",fontSize:10,cursor:"pointer",
                    fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,fontWeight:700,
                    display:"flex",alignItems:"center",gap:5,
                  }}><CheckCircle size={11} strokeWidth={2}/>{resolved[a.id]?"RESOLVED":"MARK RESOLVED"}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom metrics grid */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4, 1fr)",gap:12}}>
        {metrics.map(({l,v,s,c})=>(
          <Panel key={l} style={{padding:mobile?"14px":"18px"}}>
            <div style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:6}}>{l}</div>
            <div style={{fontSize:mobile?20:24,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{v}</div>
            <div style={{fontSize:10,color:c,marginTop:6,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{s}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
export default AlertCenter;