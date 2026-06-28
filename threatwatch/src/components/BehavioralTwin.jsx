import React, { useState, useEffect } from "react";
import { LogIn, FolderOpen, KeyRound, Usb, Mail, GitBranch, Eye, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import { C, LEVEL_C } from "../constants/theme";
import Panel from "./ui/Panel";
import SectionLabel from "./ui/SectionLabel";
import CyberBadge from "./ui/CyberBadge";
import TT from "./ui/Tooltip";
import { useMobile } from "../utils/useMobile";

export default function BehavioralTwin({ employees = [], onAnalyze }) {
  const [selectedId, setSelectedId] = useState(null);
  const [scanActive, setScanActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const mobile = useMobile();

  const emp = selectedId ? employees.find(e => e.id === selectedId) : employees[0];

  useEffect(() => {
    if (!emp) return;
    setScanActive(true);
    setScanned(false);
    const t = setTimeout(() => { setScanActive(false); setScanned(true); }, 1800);
    return () => clearTimeout(t);
  }, [emp?.id]);

  if (!emp || emp.id === "---") return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
      LOADING TWIN DATA...
    </div>
  );

  const loginHr    = emp.login_hour ?? parseInt(emp.loginTime);
  const obsLogin   = emp.loginTime || "—";
  const loginAnom  = loginHr < 6 || loginHr > 22;
  const baseFiles  = Math.round(emp.files * 0.15 + 18);
  const obsFiles   = emp.files;
  const filesAnom  = obsFiles > baseFiles * 2;
  const filesDev   = baseFiles > 0 ? Math.round((obsFiles - baseFiles) / baseFiles * 100) : 0;
  const obsPriv    = emp.priv;
  const privAnom   = obsPriv > 0;
  const obsUsb     = emp.usb > 0 ? `${emp.usb} device` : "None";
  const usbAnom    = emp.usb > 0;
  const sentAnom   = emp.sentiment < 0;

  const anomCount = [loginAnom, filesAnom, privAnom, usbAnom, sentAnom].filter(Boolean).length;
  const devScore  = Math.round(
    (loginAnom ? 180 : 0) + (filesAnom ? filesDev : 0) +
    (privAnom ? 120 : 0)  + (usbAnom ? 90 : 0) + (sentAnom ? 95 : 0)
  );

  const metrics = [
    { label:"Login Time",      baseline:"08:30 – 09:15 AM",       twin:"08:45 AM (predicted)", observed:obsLogin,          anomaly:loginAnom, icon:LogIn },
    { label:"Files Accessed",  baseline:`${baseFiles}/day`,        twin:`${baseFiles+2}/day`,   observed:`${obsFiles} files`,anomaly:filesAnom, icon:FolderOpen, devPct:filesDev },
    { label:"Privilege Usage", baseline:"0 attempts",              twin:"0 attempts",            observed:`${obsPriv} attempt${obsPriv!==1?"s":""}`, anomaly:privAnom, icon:KeyRound },
    { label:"USB / Removable", baseline:"None",                    twin:"None expected",         observed:obsUsb,            anomaly:usbAnom, icon:Usb },
    { label:"Email Sentiment", baseline:"+0.45 (Neutral–Positive)",twin:"+0.40 (Neutral)",       observed:`${emp.sentiment}`,anomaly:sentAnom, icon:Mail },
  ];

  const twinTimeline = (emp.timeline || []).map((t, i) => ({
    day: t.day, real: t.score,
    twin: Math.min(45, 15 + Math.sin(i * 0.4) * 8 + Math.random() * 6),
    upper: 55, lower: 8,
  }));

  const devColor = devScore > 400 ? C.red : devScore > 200 ? C.orange : C.green;

  return (
    <div style={{padding:mobile?"14px 12px":"28px 32px",overflowY:"auto",height:"100%"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:mobile?16:24,flexDirection:mobile?"column":"row",gap:mobile?12:0}}>
        <div>
          <div style={{fontSize:9,color:C.purple,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:6,animation:"neonText 3s ease-in-out infinite",filter:"hue-rotate(200deg)"}}>// BEHAVIORAL INTELLIGENCE</div>
          <h2 style={{fontSize:mobile?17:26,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:mobile?1:2}}>DIGITAL TWIN</h2>
          <p style={{color:C.textLow,fontSize:mobile?9:11,marginTop:4,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>VIRTUAL BEHAVIORAL MODEL · REAL vs PREDICTED</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{background:C.panelAlt,border:`1px solid ${C.purple}40`,borderRadius:4,padding:"7px 12px",display:"flex",alignItems:"center",gap:8}}>
            <GitBranch size={13} color={C.purple} strokeWidth={1.8}/>
            <select
              value={selectedId || (employees[0]?.id || "")}
              onChange={e => setSelectedId(e.target.value)}
              style={{background:"transparent",border:"none",outline:"none",color:C.text,fontSize:mobile?11:12,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",cursor:"pointer",maxWidth:mobile?150:220}}>
              {employees.map(e => (
                <option key={e.id} value={e.id} style={{background:C.panel,color:C.text}}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>
          <button onClick={() => onAnalyze && onAnalyze(emp)} className="cyber-btn" style={{
            background:`${C.purple}15`,border:`1px solid ${C.purple}50`,color:C.purple,
            borderRadius:4,padding:"7px 14px",fontSize:11,cursor:"pointer",
            fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,
            display:"flex",alignItems:"center",gap:6,
          }}><Eye size={12} strokeWidth={2}/>PROFILE</button>
        </div>
      </div>

      {/* Twin Identity Card */}
      <div style={{
        background:`linear-gradient(135deg,${C.panel},${C.panelAlt})`,
        border:`1px solid ${C.purple}40`,borderRadius:6,
        padding:mobile?"14px 16px":"20px 24px",marginBottom:16,
        display:"flex",alignItems:mobile?"flex-start":"center",justifyContent:"space-between",
        position:"relative",overflow:"hidden",
        animation:emp.level==="Critical"?"twinPulse 3s ease-in-out infinite":"none",
        flexDirection:mobile?"column":"row",gap:mobile?14:0,
      }}>
        {scanActive && (
          <div style={{position:"absolute",left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${C.purple},transparent)`,animation:"scanBar 1.8s ease-in-out",zIndex:10,pointerEvents:"none"}}/>
        )}

        {/* Avatars */}
        <div style={{display:"flex",alignItems:"center",gap:mobile?12:20}}>
          <div style={{textAlign:"center"}}>
            <div style={{width:mobile?44:56,height:mobile?44:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.panelAlt},${C.panel})`,border:`2px solid ${LEVEL_C[emp.level]}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mobile?15:18,fontWeight:900,color:LEVEL_C[emp.level],fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:4}}>{emp.initials}</div>
            <div style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>REAL</div>
          </div>

          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:40,height:1,background:`linear-gradient(90deg,${LEVEL_C[emp.level]}60,${C.purple}60)`}}/>
            <div style={{fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>VS</div>
            <div style={{width:40,height:1,background:`linear-gradient(90deg,${C.purple}60,${C.purple}20)`}}/>
          </div>

          <div style={{textAlign:"center"}}>
            <div style={{width:mobile?44:56,height:mobile?44:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.purple}20,${C.purple}08)`,border:`2px solid ${C.purple}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:mobile?15:18,fontWeight:900,color:C.purple,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:4,animation:"floatY 4s ease-in-out infinite",boxShadow:`0 0 20px ${C.purple}30`}}>{emp.initials}</div>
            <div style={{fontSize:8,color:C.purple,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>TWIN</div>
          </div>

          <div style={{marginLeft:mobile?8:16}}>
            <div style={{fontSize:mobile?15:18,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>{emp.name}</div>
            <div style={{fontSize:mobile?10:11,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginTop:3}}>{emp.role} · {emp.dept}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
              <CyberBadge level={emp.level}/>
              <span style={{fontSize:9,color:C.purple,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",background:`${C.purple}15`,border:`1px solid ${C.purple}30`,padding:"2px 7px",borderRadius:2}}>TWIN ACTIVE</span>
              {scanned && <span style={{fontSize:9,color:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",animation:"fadeIn 0.5s ease-out"}}>SYNC ✓</span>}
            </div>
          </div>
        </div>

        {/* Deviation score */}
        <div style={{textAlign:mobile?"left":"right"}}>
          <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:4}}>DEVIATION SCORE</div>
          <div style={{fontSize:mobile?36:52,fontWeight:900,color:devColor,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1,textShadow:devScore>400?`0 0 30px ${C.red}80`:devScore>200?`0 0 20px ${C.orange}60`:`0 0 15px ${C.green}60`}}>+{devScore}%</div>
          <div style={{fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginTop:4}}>{anomCount} of 5 signals anomalous</div>
        </div>
      </div>

      {/* Comparison matrix + charts — stack on mobile */}
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:14,marginBottom:16}}>
        <Panel style={{padding:mobile?"14px":"20px"}} critical={emp.level==="Critical"} animate={false}>
          <SectionLabel>Behavioral Comparison Matrix</SectionLabel>
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 70px",gap:0,marginTop:4,minWidth:360}}>
              {["METRIC","TWIN BASELINE","OBSERVED","STATUS"].map(h=>(
                <div key={h} style={{padding:"7px 8px",fontSize:9,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,borderBottom:`1px solid ${C.border}`}}>{h}</div>
              ))}
              {metrics.map((m,i)=>(
                <React.Fragment key={i}>
                  <div style={{padding:"10px 8px",borderBottom:`1px solid ${C.border}40`,display:"flex",alignItems:"center",gap:7,animation:`slideInUp 0.3s ease-out ${i*60}ms both`}}>
                    <m.icon size={12} color={m.anomaly?LEVEL_C[emp.level]:C.textLow} strokeWidth={1.8}/>
                    <span style={{fontSize:10,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{m.label}</span>
                  </div>
                  <div style={{padding:"10px 8px",fontSize:10,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",borderBottom:`1px solid ${C.border}40`,display:"flex",alignItems:"center"}}>{m.baseline}</div>
                  <div style={{padding:"10px 8px",fontSize:10,color:m.anomaly?LEVEL_C[emp.level]:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:m.anomaly?700:400,borderBottom:`1px solid ${C.border}40`,display:"flex",alignItems:"center",gap:5}}>
                    {m.anomaly && <ArrowUpRight size={10} strokeWidth={2.5}/>}
                    {m.observed}
                    {m.devPct > 0 && m.anomaly && <span style={{fontSize:9,color:C.red,background:`${C.red}15`,padding:"1px 4px",borderRadius:2}}>+{m.devPct}%</span>}
                  </div>
                  <div style={{padding:"10px 8px",borderBottom:`1px solid ${C.border}40`,display:"flex",alignItems:"center"}}>
                    {m.anomaly
                      ? <span style={{fontSize:9,color:C.red,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",background:`${C.red}15`,border:`1px solid ${C.red}30`,padding:"2px 6px",borderRadius:2,letterSpacing:1}}>ANOMALY</span>
                      : <span style={{fontSize:9,color:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",background:`${C.green}10`,border:`1px solid ${C.green}20`,padding:"2px 6px",borderRadius:2,letterSpacing:1}}>NORMAL</span>
                    }
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{marginTop:14,padding:"12px",background:devScore>400?`${C.red}08`:devScore>200?`${C.orange}08`:`${C.green}08`,border:`1px solid ${devColor}25`,borderRadius:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <span style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>TWIN DIVERGENCE INDEX</span>
              <span style={{fontSize:14,fontWeight:900,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",color:devColor}}>+{devScore}%</span>
            </div>
            <div style={{width:"100%",height:6,background:C.muted,borderRadius:3,overflow:"hidden"}}>
              <div style={{width:`${Math.min(100,devScore/8)}%`,height:"100%",background:devScore>400?`linear-gradient(90deg,${C.orange},${C.red})`:devScore>200?`linear-gradient(90deg,${C.yellow},${C.orange})`:`linear-gradient(90deg,${C.cyan},${C.green})`,borderRadius:3,transition:"width 1.2s ease-out",boxShadow:`0 0 8px ${devColor}`}}/>
            </div>
            <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginTop:6,letterSpacing:1}}>
              {devScore>400?"CRITICAL DIVERGENCE · Behavior severely misaligned with twin model":devScore>200?`MODERATE DIVERGENCE · ${anomCount} signals outside predicted range`:"LOW DIVERGENCE · Behavior matches twin model closely"}
            </div>
          </div>
        </Panel>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Panel style={{padding:mobile?"14px":"20px"}} animate={false}>
            <SectionLabel>30-Day Twin Overlay</SectionLabel>
            <ResponsiveContainer width="100%" height={mobile?140:175}>
              <AreaChart data={twinTimeline}>
                <defs>
                  <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={LEVEL_C[emp.level]} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={LEVEL_C[emp.level]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="twinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.purple} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={C.purple} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={d=>d%5===0?`D${d}`:""}/>
                <YAxis domain={[0,100]} tick={{fill:C.textLow,fontSize:9}} axisLine={false} tickLine={false} width={28}/>
                <Tooltip content={<TT/>} labelFormatter={d=>`Day ${d}`}/>
                <Area type="monotone" dataKey="upper"  stroke="none"         fill={`${C.purple}10`}   name="Normal Band"    isAnimationActive={false}/>
                <Area type="monotone" dataKey="twin"   stroke={C.purple}     strokeWidth={1.5}  fill="url(#twinGrad)" strokeDasharray="5 3" name="Twin Prediction" isAnimationActive={false}/>
                <Area type="monotone" dataKey="real"   stroke={LEVEL_C[emp.level]} strokeWidth={2} fill="url(#realGrad)" name="Real Behavior" isAnimationActive={false}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
              {[["Real",LEVEL_C[emp.level],"solid"],["Twin",C.purple,"dashed"],["Band",C.purple,"area"]].map(([l,c,s])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                  <div style={{width:14,height:2,background:c,opacity:s==="area"?0.3:1}}/>
                  {l}
                </div>
              ))}
            </div>
          </Panel>

          <Panel style={{padding:mobile?"14px":"20px"}} animate={false}>
            <SectionLabel>Behavioral Signal Strength</SectionLabel>
            {[
              {label:"Login Deviation",   val:loginAnom?85:5,                              color:loginAnom?C.red:C.green},
              {label:"File Access Spike", val:Math.min(100,Math.abs(filesDev)),             color:filesAnom?C.red:C.green},
              {label:"Privilege Misuse",  val:privAnom?90:0,                               color:privAnom?C.red:C.green},
              {label:"USB Risk",          val:usbAnom?80:0,                                color:usbAnom?C.orange:C.green},
              {label:"Sentiment Shift",   val:sentAnom?Math.round(Math.abs(emp.sentiment)*80):10, color:sentAnom?C.orange:C.green},
            ].map((s,i)=>(
              <div key={s.label} style={{marginBottom:9,animation:`slideInUp 0.3s ease-out ${i*80}ms both`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,color:C.textMid,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>{s.label}</span>
                  <span style={{fontSize:10,color:s.color,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:700}}>{s.val}%</span>
                </div>
                <div style={{width:"100%",height:5,background:C.muted,borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${s.val}%`,height:"100%",background:s.color,borderRadius:3,boxShadow:`0 0 8px ${s.color}80`,transition:"width 1s ease-out"}}/>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* Intelligence Summary */}
      <Panel style={{padding:mobile?"14px":"20px"}} critical={devScore>400} animate={false}>
        <SectionLabel>Twin Intelligence Report</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr",gap:12,marginTop:8}}>
          {[
            {title:"Behavioral Consistency", val:devScore>400?"CRITICAL":devScore>200?"MODERATE":"NORMAL", color:devColor,
              desc:`Twin predicts stable behavior within ±${Math.round(baseFiles*0.2)} files/day. Deviation ${devScore>200?"significantly exceeds":"within"} normal range.`},
            {title:"Anomaly Pattern Match",  val:`${anomCount}/5 SIGNALS`, color:anomCount>=3?C.red:anomCount>=1?C.orange:C.green,
              desc:`${anomCount} signals deviate from baseline. ${anomCount>=3?"Consistent with insider threat.":anomCount>=1?"Isolated anomalies.":"No significant deviations."}`},
            {title:"Twin Confidence",        val:`${Math.max(72,95-devScore/20).toFixed(0)}%`, color:C.purple,
              desc:`Model trained on ${Math.min(30,emp.timeline?.length||25)} days of data. Re-trains every 24 hours.`},
          ].map((card,i)=>(
            <div key={i} style={{background:C.panelAlt,borderRadius:4,padding:mobile?"12px":"16px",border:`1px solid ${card.color}20`,animation:`slideInUp 0.4s ease-out ${i*100}ms both`}}>
              <div style={{fontSize:9,color:C.textLow,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginBottom:6}}>{card.title}</div>
              <div style={{fontSize:mobile?16:20,fontWeight:900,color:card.color,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginBottom:6,lineHeight:1}}>{card.val}</div>
              <p style={{fontSize:mobile?10:11,color:C.textLow,lineHeight:1.7,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",margin:0}}>{card.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}