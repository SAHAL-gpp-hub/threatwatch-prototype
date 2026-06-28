import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Terminal, Fingerprint, ShieldAlert, Crosshair, ShieldCheck, BarChart3, Siren, Server } from "lucide-react";
import { C } from "../constants/theme";
import GlowDot from "./ui/GlowDot";
import { matchCache, streamWords, isOutOfScope, OUT_OF_SCOPE_MSG } from "../utils/aiCache";
import { useMobile } from "../utils/useMobile";

const SUGGESTED_PROMPTS = [
  { label:"Why was the top threat flagged?",  IconComp:Crosshair,   q:"Why was the highest risk employee flagged? Explain all anomalies." },
  { label:"What should SOC do next?",          IconComp:ShieldCheck, q:"What should the SOC team do right now as immediate response actions?" },
  { label:"Who are the top 3 risks?",          IconComp:BarChart3,   q:"Who are the top 3 highest risk employees and why?" },
  { label:"Summarize all active alerts",       IconComp:Siren,       q:"Summarize all active alerts and their severity." },
  { label:"Explain the ML detection method",  IconComp:Bot,         q:"How does the Isolation Forest ML model detect insider threats? Explain simply." },
  { label:"Which departments are at risk?",   IconComp:Server,      q:"Which departments have the most risk and what patterns do you see?" },
];

const GROQ_MODEL    = "llama-3.1-8b-instant";
const GROQ_FALLBACK = "gemma2-9b-it";

export default function AISOCAnalyst({ employees=[], onAnalyze, messages, setMessages }) {
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const mobile = useMobile();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role:"user", content:text.trim(), id:Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const cachedResponse = matchCache(text, employees);
    const oosSafe = !cachedResponse && isOutOfScope(text) ? OUT_OF_SCOPE_MSG : null;
    const instant = cachedResponse || oosSafe;
    if (instant) {
      await new Promise(r => setTimeout(r, 400+Math.random()*300));
      const msgId = Date.now()+1;
      setMessages(prev => [...prev, {role:"assistant",content:"",id:msgId,streaming:true}]);
      setLoading(false);
      streamWords(instant, msgId, setMessages, () => setTimeout(() => inputRef.current?.focus(), 100));
      return;
    }

    const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
    if (!GROQ_KEY) {
      setMessages(prev => [...prev, {role:"assistant",content:"**API key missing.** Add `VITE_GROQ_KEY` to your `.env` file.",id:Date.now()+1,error:true}]);
      setLoading(false);
      return;
    }

    try {
      const top = employees[0];
      const recentHistory = messages.slice(-4);
      const contextStr = recentHistory.length > 0
        ? "\nRecent conversation:\n" + recentHistory.map(m => `${m.role==="user"?"User":"Assistant"}: ${m.content}`).join("\n")
        : "";
      const rosterStr = employees.map(e => `${e.name}(${e.dept},score:${e.score},${e.level},usb:${e.usb},priv:${e.priv},sent:${e.sentiment})`).join("|");
      const prompt = `SOC AI. Max 3 sentences. Security only. Roster: ${rosterStr}.${contextStr}\n\nQuestion: ${text.trim()}`;
      const makeBody = (model) => JSON.stringify({model,messages:[{role:"user",content:prompt}],max_tokens:120,temperature:0.6});
      const headers = {"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`};

      let res = await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers,body:makeBody(GROQ_MODEL)});
      if (res.status===503||res.status===429) {
        await new Promise(r => setTimeout(r,1500));
        res = await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers,body:makeBody(GROQ_FALLBACK)});
      }
      if (!res.ok) {
        const errData = await res.json().catch(()=>({}));
        const errMsg  = errData?.error?.message||"";
        const isDown  = res.status===503||res.status===429||errMsg.toLowerCase().includes("unavailable")||errMsg.toLowerCase().includes("overloaded");
        if (isDown) {
          const fallback = matchCache("summarize alerts",employees)||matchCache("current risk",employees)||
            `**ThreatWatch AI — Offline Mode**\n\n- **${employees.length}** employees monitored\n- **${employees.filter(e=>e.level==="Critical").length}** Critical · **${employees.filter(e=>e.level==="High").length}** High risk\n- Top threat: **${top?.name}** (Score ${top?.score})`;
          const msgId = Date.now()+1;
          setMessages(prev => [...prev,{role:"assistant",content:"",id:msgId,streaming:true}]);
          setLoading(false);
          streamWords(fallback,msgId,setMessages,()=>setTimeout(()=>inputRef.current?.focus(),100));
          return;
        }
        throw new Error(errMsg||res.statusText);
      }
      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content||"No response received.";
      const msgId = Date.now()+1;
      setMessages(prev => [...prev,{role:"assistant",content:"",id:msgId,streaming:true}]);
      setLoading(false);
      streamWords(reply,msgId,setMessages,()=>setTimeout(()=>inputRef.current?.focus(),100));
    } catch(err) {
      const isNetwork = !navigator.onLine||err.message?.toLowerCase().includes("fetch")||err.message?.toLowerCase().includes("network");
      setMessages(prev => [...prev,{role:"assistant",content:isNetwork?"**Connection error.**\n\nCheck your internet connection.":"**AI backend busy.**\n\nTry rephrasing your question.",id:Date.now()+1,error:true}]);
      setLoading(false);
    }
    setTimeout(()=>inputRef.current?.focus(),100);
  }

  function handleKey(e) {
    if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function parseLine(line) {
    return line.split(/(\*\*[^*]+\*\*)/g).map((p,j) => {
      if (p.startsWith("**")&&p.endsWith("**"))
        return <strong key={j} style={{color:C.cyan,fontWeight:700}}>{p.slice(2,-2)}</strong>;
      return p;
    });
  }

  function renderContent(text) {
    return text.split("\n").map((line,i) => {
      if (line.trim().startsWith("- ")||line.trim().startsWith("• "))
        return <div key={i} style={{display:"flex",gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:C.cyan,flexShrink:0,marginTop:1}}>›</span><span>{parseLine(line.trim().slice(2))}</span></div>;
      if (/^\d+\./.test(line.trim())) {
        const num = line.trim().match(/^(\d+)\./)[1];
        return <div key={i} style={{display:"flex",gap:8,marginBottom:4,paddingLeft:4}}><span style={{color:C.bg,background:C.cyan,borderRadius:2,width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0,marginTop:2}}>{num}</span><span>{parseLine(line.trim().replace(/^\d+\.\s*/,""))}</span></div>;
      }
      if (line.startsWith("###")) return <div key={i} style={{fontSize:12,fontWeight:700,color:C.cyan,marginTop:8,marginBottom:4,letterSpacing:1}}>{line.replace(/^#+\s*/,"").toUpperCase()}</div>;
      if (line==="") return <div key={i} style={{height:8}}/>;
      return <div key={i} style={{marginBottom:2}}>{parseLine(line)}</div>;
    });
  }

  const isEmpty = messages.length===0;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",background:C.bg}}>
      {/* Header */}
      <div style={{
        padding:mobile?"12px 16px":"18px 28px",
        flexShrink:0,borderBottom:`1px solid ${C.cyan}20`,
        background:`linear-gradient(180deg,#0a1628,${C.bg})`,
        position:"relative",overflow:"hidden",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:4,marginBottom:4}}>// SECURITY INTELLIGENCE</div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <h2 style={{fontSize:mobile?17:22,fontWeight:900,color:C.text,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:mobile?1:2}}>AI SOC ANALYST</h2>
              <div style={{display:"flex",alignItems:"center",gap:6,background:`${C.cyan}15`,border:`1px solid ${C.cyan}40`,borderRadius:3,padding:"4px 10px"}}>
                <GlowDot color={C.cyan} pulse size={5}/>
                <span style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>ONLINE · LLAMA 3.1</span>
              </div>
            </div>
            {!mobile && <p style={{color:C.textMid,fontSize:11,marginTop:4,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1}}>ASK ANYTHING ABOUT YOUR THREAT LANDSCAPE · POWERED BY GROQ</p>}
          </div>
          {/* Mini stats — hide on very small mobile */}
          {!mobile && (
            <div style={{display:"flex",gap:10}}>
              {[
                {label:"ACTIVE THREATS", val:employees.filter(e=>e.level==="Critical"||e.level==="High").length, color:C.red},
                {label:"MONITORED",      val:employees.length, color:C.cyan},
                {label:"ML ACCURACY",   val:"97.6%", color:C.green},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center",background:`linear-gradient(135deg,${s.color}12,${s.color}05)`,border:`1px solid ${s.color}40`,borderRadius:6,padding:"10px 16px"}}>
                  <div style={{fontSize:20,fontWeight:900,color:s.color,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:8,color:s.color,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2,marginTop:4,opacity:0.8}}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {/* Mobile: compact 3-stat row */}
          {mobile && (
            <div style={{display:"flex",gap:8}}>
              {[
                {v:employees.filter(e=>e.level==="Critical"||e.level==="High").length, c:C.red, l:"THREATS"},
                {v:employees.length, c:C.cyan, l:"MONITORED"},
                {v:"97.6%", c:C.green, l:"ACCURACY"},
              ].map(s=>(
                <div key={s.l} style={{background:`${s.c}12`,border:`1px solid ${s.c}40`,borderRadius:4,padding:"6px 10px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:900,color:s.c,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1}}>{s.v}</div>
                  <div style={{fontSize:8,color:s.c,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,marginTop:3,opacity:0.8}}>{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{flex:1,overflowY:"auto",padding:mobile?"16px":"24px 28px",display:"flex",flexDirection:"column",gap:14}}>
        {isEmpty && (
          <div style={{animation:"fadeIn 0.5s ease-out"}}>
            {/* Welcome card */}
            <div style={{background:`linear-gradient(135deg,rgba(0,209,255,0.08),rgba(0,209,255,0.02))`,border:`1px solid ${C.cyan}35`,borderRadius:8,padding:mobile?"16px":"22px 24px",marginBottom:20,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.cyan}60,transparent)`}}/>
              <div style={{display:"flex",alignItems:"flex-start",gap:mobile?12:18}}>
                <div style={{width:mobile?40:52,height:mobile?40:52,borderRadius:10,flexShrink:0,background:`linear-gradient(135deg,${C.cyan}25,${C.cyan}10)`,border:`1px solid ${C.cyan}50`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 24px ${C.cyan}30`}}>
                  <Bot size={mobile?20:24} color={C.cyan} strokeWidth={1.5}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:mobile?13:15,fontWeight:700,color:C.text,fontFamily:"var(--sans-font,'Inter',sans-serif)",letterSpacing:1,marginBottom:6}}>
                    ThreatWatch AI Analyst
                    <span style={{marginLeft:8,fontSize:10,color:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",background:`${C.green}15`,border:`1px solid ${C.green}30`,padding:"2px 7px",borderRadius:2}}>● READY</span>
                  </div>
                  <p style={{fontSize:mobile?11:12,color:"#a0bcd8",lineHeight:1.9,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",margin:0}}>
                    I have full visibility into your threat landscape —
                    <span style={{color:C.cyan,fontWeight:700}}> {employees.length} employees</span> monitored,
                    <span style={{color:C.red,fontWeight:700}}> {employees.filter(e=>e.level==="Critical").length} critical</span> threats active.
                  </p>
                  {employees[0]&&employees[0].id!=="---"&&(
                    <div style={{marginTop:12,padding:"8px 14px",background:`${C.red}12`,border:`1px solid ${C.red}40`,borderRadius:4,display:"flex",alignItems:"center",gap:8}}>
                      <ShieldAlert size={13} color={C.red} strokeWidth={2}/>
                      <span style={{fontSize:mobile?10:11,color:"#e0a0b0",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                        <span style={{color:C.red,fontWeight:700}}>TOP THREAT: </span>
                        {employees[0].name} · Score <span style={{color:C.red,fontWeight:700}}>{employees[0].score}/100</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:14,height:1,background:C.cyan}}/>
              <span style={{fontSize:9,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:3}}>SUGGESTED QUERIES</span>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.cyan}40,transparent)`}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:8}}>
              {SUGGESTED_PROMPTS.map((p,i)=>(
                <button key={i} className="cyber-btn" onClick={()=>sendMessage(p.q)} style={{
                  background:`linear-gradient(135deg,rgba(0,209,255,0.08),rgba(0,209,255,0.02))`,
                  border:`1px solid ${C.cyan}25`,borderRadius:6,padding:mobile?"10px 12px":"14px 16px",
                  cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10,
                  animation:`slideInUp 0.3s ease-out ${i*60}ms both`,transition:"all 0.2s",
                }}>
                  <div style={{width:mobile?28:34,height:mobile?28:34,borderRadius:6,flexShrink:0,background:`${C.cyan}12`,border:`1px solid ${C.cyan}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <p.IconComp size={mobile?13:16} color={C.cyan} strokeWidth={1.8}/>
                  </div>
                  <span style={{fontSize:mobile?10:12,color:"#c0d8f0",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1.5,fontWeight:500}}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg)=>(
          <div key={msg.id} style={{display:"flex",flexDirection:msg.role==="user"?"row-reverse":"row",gap:mobile?8:12,alignItems:"flex-start",animation:"slideInUp 0.25s ease-out"}}>
            <div style={{width:mobile?30:36,height:mobile?30:36,borderRadius:8,flexShrink:0,background:msg.role==="user"?`linear-gradient(135deg,${C.purple}40,${C.purple}15)`:`linear-gradient(135deg,${C.cyan}30,${C.cyan}10)`,border:`1px solid ${msg.role==="user"?C.purple:C.cyan}50`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {msg.role==="user"?<Fingerprint size={mobile?14:17} color={C.purple} strokeWidth={1.8}/>:<Bot size={mobile?14:17} color={C.cyan} strokeWidth={1.8}/>}
            </div>
            <div style={{maxWidth:mobile?"80%":"74%",background:msg.role==="user"?`linear-gradient(135deg,#1a1040,#120c30)`:`linear-gradient(135deg,#0d1f38,#091525)`,border:`1px solid ${msg.role==="user"?C.purple:msg.error?C.red:C.cyan}${msg.role==="user"?"50":"30"}`,borderRadius:msg.role==="user"?"10px 2px 10px 10px":"2px 10px 10px 10px",padding:mobile?"10px 14px":"14px 18px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${msg.role==="user"?C.purple:C.cyan}50,transparent)`}}/>
              {msg.role==="user"?(
                <div style={{fontSize:mobile?11:13,color:"#dde8ff",fontFamily:"var(--sans-font,'Inter',sans-serif)",lineHeight:1.7,fontWeight:500}}>{msg.content}</div>
              ):(
                <div style={{fontSize:mobile?10:12,color:"#b8d0e8",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",lineHeight:1.9}}>{renderContent(msg.content)}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{display:"flex",gap:mobile?8:12,alignItems:"flex-start",animation:"fadeIn 0.3s ease-out"}}>
            <div style={{width:mobile?30:36,height:mobile?30:36,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${C.cyan}30,${C.cyan}10)`,border:`1px solid ${C.cyan}50`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Bot size={mobile?14:17} color={C.cyan} strokeWidth={1.8}/>
            </div>
            <div style={{background:`linear-gradient(135deg,rgba(0,209,255,0.08),rgba(0,209,255,0.02))`,border:`1px solid ${C.cyan}30`,borderRadius:"2px 10px 10px 10px",padding:"12px 16px",display:"flex",alignItems:"center",gap:8}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.cyan,animation:`pulseGlow 1.2s ease-in-out ${i*0.25}s infinite`,boxShadow:`0 0 6px ${C.cyan}`}}/>
              ))}
              <span style={{fontSize:10,color:C.cyan,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",marginLeft:4,letterSpacing:1}}>ANALYZING...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input bar */}
      <div style={{flexShrink:0,padding:mobile?"10px 12px 14px":"14px 28px 18px",borderTop:`1px solid ${C.cyan}20`,background:`linear-gradient(0deg,#0a1628,${C.bg})`}}>
        {messages.length > 0 && (
          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            {[
              {label:mobile?"Investigate":"Investigate top threat", q:`Investigate ${employees[0]?.name||"the top employee"} in detail`, c:C.red},
              {label:mobile?"Actions":"Recommended actions",        q:"What immediate actions should the SOC team take right now?", c:C.cyan},
              {label:mobile?"Summary":"Risk summary",               q:"Give me a concise executive summary of the current risk posture", c:C.green},
              {label:"Clear",                                        q:null, c:C.textMid},
            ].map((chip,i)=>(
              <button key={i} className="cyber-btn" onClick={()=>{ if(!chip.q){setMessages([]);return;} sendMessage(chip.q); }} style={{background:`${chip.c}15`,border:`1px solid ${chip.c}40`,color:chip.c,borderRadius:4,padding:"5px 12px",fontSize:mobile?9:10,cursor:"pointer",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:0.5,fontWeight:600}}>{chip.label}</button>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
          <div style={{flex:1,background:`linear-gradient(135deg,rgba(0,209,255,0.08),rgba(0,209,255,0.02))`,border:`2px solid ${C.cyan}50`,borderRadius:8,display:"flex",alignItems:"center",gap:8,padding:mobile?"9px 12px":"12px 16px",transition:"border-color 0.2s,box-shadow 0.2s"}}
            onFocus={e=>{e.currentTarget.style.borderColor=C.cyan;e.currentTarget.style.boxShadow=`0 0 28px ${C.cyan}25`;}}
            onBlur={e=>{e.currentTarget.style.borderColor=`${C.cyan}50`;e.currentTarget.style.boxShadow="none";}}>
            <Terminal size={14} color={C.cyan} strokeWidth={1.8} style={{flexShrink:0}}/>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={mobile?"Ask about threats... (Enter)":"Ask about threats, anomalies, SOC actions... (Enter to send)"}
              rows={1}
              style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#e0eeff",fontSize:mobile?11:13,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",resize:"none",lineHeight:1.6,caretColor:C.cyan}}
            />
            {!mobile && <div style={{fontSize:9,color:`${C.cyan}70`,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",flexShrink:0,letterSpacing:1}}>ENTER</div>}
          </div>
          <button className="cyber-btn" onClick={()=>sendMessage(input)} disabled={!input.trim()||loading} style={{
            background:input.trim()&&!loading?`linear-gradient(135deg,${C.cyan}30,${C.cyan}15)`:`linear-gradient(135deg,#0d1f38,#091525)`,
            border:`2px solid ${input.trim()&&!loading?C.cyan:`${C.cyan}25`}`,
            color:input.trim()&&!loading?C.cyan:`${C.cyan}40`,
            borderRadius:8,padding:mobile?"9px 14px":"12px 22px",cursor:"pointer",
            display:"flex",alignItems:"center",gap:6,
            fontSize:mobile?11:12,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:1,fontWeight:700,
            transition:"all 0.2s",flexShrink:0,
            boxShadow:input.trim()&&!loading?`0 0 20px ${C.cyan}25`:"none",
          }}>
            <Send size={mobile?13:15} strokeWidth={2.5}/>
            {!mobile&&"SEND"}
          </button>
        </div>

        {!mobile && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8}}>
            <div style={{width:20,height:1,background:`linear-gradient(90deg,transparent,${C.cyan}30)`}}/>
            <span style={{fontSize:9,color:`${C.cyan}60`,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",letterSpacing:2}}>THREATWATCH AI · GROQ FREE TIER · SHIFT+ENTER FOR NEW LINE</span>
            <div style={{width:20,height:1,background:`linear-gradient(90deg,${C.cyan}30,transparent)`}}/>
          </div>
        )}
      </div>
    </div>
  );
}