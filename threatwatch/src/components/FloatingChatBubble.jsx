import React, { useState, useEffect, useRef } from "react";
import { Bot, Send } from "lucide-react";
import { C } from "../constants/theme";
import { matchCache, streamWords, isOutOfScope, OUT_OF_SCOPE_MSG } from "../utils/aiCache";
import { useMobile } from "../utils/useMobile";

export default function FloatingChatBubble({ setPage, page, employees=[], messages, setMessages }) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef   = useRef(null);
  const containerRef = useRef(null);
  const mobile = useMobile();

  // Panel dimensions — full-width sheet on mobile
  const panelW = mobile ? "calc(100vw - 24px)" : 370;
  const panelH = mobile ? "65vh" : 500;

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading, isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setTimeout(() => setIsOpen(false), 50);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      const map = {g:"leaderboard",a:"alerts",s:"soc",d:"deepdive",o:"overview",t:"twin",f:"forecast"};
      if (map[e.key.toLowerCase()]) { setPage(map[e.key.toLowerCase()]); setIsOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPage]);

  if (page==="soc") return null;

  async function sendMessage(text) {
    if (!text.trim()||loading) return;
    const userMsg = { role:"user", content:text.trim(), id:Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const cached  = matchCache(text, employees);
    const oos     = !cached&&isOutOfScope(text)?OUT_OF_SCOPE_MSG:null;
    const instant = cached||oos;
    if (instant) {
      await new Promise(r => setTimeout(r, 350+Math.random()*250));
      const msgId = Date.now()+1;
      setMessages(prev => [...prev,{role:"assistant",content:"",id:msgId,streaming:true}]);
      setLoading(false);
      streamWords(instant,msgId,setMessages);
      return;
    }

    try {
      const top = employees[0];
      const recentHistory = messages.slice(-4);
      const contextStr = recentHistory.length>0
        ? "\nRecent conversation:\n"+recentHistory.map(m=>`${m.role==="user"?"User":"Assistant"}: ${m.content}`).join("\n")
        : "";
      const rosterStr = employees.map(e=>`${e.name}(${e.dept},score:${e.score},${e.level},usb:${e.usb},priv:${e.priv},sent:${e.sentiment})`).join("|");
      const prompt = `SOC AI. Max 40 words. Security only. Roster: ${rosterStr}.${contextStr}\nQ: ${text.trim()}`;
      const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
      const makeBody = (model) => JSON.stringify({model,messages:[{role:"user",content:prompt}],max_tokens:120,temperature:0.7});
      const headers = {"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`};
      let res = await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers,body:makeBody("llama-3.1-8b-instant")});
      if (res.status===503||res.status===429) {
        await new Promise(r=>setTimeout(r,1500));
        res = await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers,body:makeBody("gemma2-9b-it")});
      }
      if (!res.ok) {
        const errData = await res.json().catch(()=>({}));
        const errMsg  = errData?.error?.message||"";
        const isDown  = res.status===503||res.status===429||errMsg.toLowerCase().includes("unavailable")||errMsg.toLowerCase().includes("overloaded")||errMsg.toLowerCase().includes("temporarily");
        if (isDown) {
          const fallback = matchCache("summarize alerts",employees)||matchCache("current risk",employees)||
            `**ThreatWatch AI — Offline Mode**\n\n- **${employees.length}** employees monitored\n- **${employees.filter(e=>e.level==="Critical").length}** Critical · **${employees.filter(e=>e.level==="High").length}** High risk\n- Top threat: **${top?.name}** (Score ${top?.score})`;
          const msgId = Date.now()+1;
          setMessages(prev=>[...prev,{role:"assistant",content:"",id:msgId,streaming:true}]);
          setLoading(false);
          streamWords(fallback,msgId,setMessages);
          return;
        }
        throw new Error(errMsg||res.statusText);
      }
      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content||"No response.";
      const msgId = Date.now()+1;
      setMessages(prev=>[...prev,{role:"assistant",content:"",id:msgId,streaming:true}]);
      setLoading(false);
      streamWords(reply,msgId,setMessages);
    } catch(err) {
      const isNetwork = !navigator.onLine||err.message?.toLowerCase().includes("fetch")||err.message?.toLowerCase().includes("network");
      setMessages(prev=>[...prev,{role:"assistant",content:isNetwork?"**Connection error.**\n\nCheck your internet connection.":"**AI backend busy.**\n\nTry rephrasing.",id:Date.now()+1,error:true}]);
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function parseLine(line) {
    return line.split(/(\*\*[^*]+\*\*)/g).map((p,j)=>{
      if (p.startsWith("**")&&p.endsWith("**"))
        return <strong key={j} style={{color:C.cyan,fontWeight:700}}>{p.slice(2,-2)}</strong>;
      return p;
    });
  }

  function renderContent(text) {
    return text.split("\n").map((line,i)=>{
      if (line.trim().startsWith("- ")||line.trim().startsWith("• "))
        return <div key={i} style={{display:"flex",gap:6,marginBottom:3,paddingLeft:4}}><span style={{color:C.cyan,flexShrink:0,marginTop:1}}>›</span><span>{parseLine(line.trim().slice(2))}</span></div>;
      if (/^\d+\./.test(line.trim())) {
        const num = line.trim().match(/^(\d+)\./)[1];
        return <div key={i} style={{display:"flex",gap:6,marginBottom:3,paddingLeft:4}}><span style={{color:C.cyan,fontWeight:700,flexShrink:0}}>{num}.</span><span>{parseLine(line.trim().replace(/^\d+\.\s*/,""))}</span></div>;
      }
      if (line==="") return <div key={i} style={{height:6}}/>;
      return <div key={i} style={{marginBottom:3}}>{parseLine(line)}</div>;
    });
  }

  // Position: on mobile anchor to bottom-right but let panel grow left/up
  const containerStyle = {
    position:"fixed",
    bottom:mobile?12:20,
    right:mobile?12:20,
    zIndex:350,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* FAB button */}
      {!isOpen && (
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",top:-6,left:-6,right:-6,bottom:-6,borderRadius:"50%",border:`1.5px solid ${C.cyan}40`,animation:"chatbotRipple 2s infinite ease-out"}}/>
          <div style={{position:"absolute",top:-12,left:-12,right:-12,bottom:-12,borderRadius:"50%",border:`1px solid ${C.cyan}20`,animation:"chatbotRipple 2s infinite ease-out 0.8s"}}/>
          <button
            onClick={()=>setIsOpen(true)}
            style={{
              width:mobile?52:58,height:mobile?52:58,borderRadius:"50%",
              background:"rgba(8,20,36,0.95)",border:`2px solid ${C.cyan}`,
              boxShadow:`0 0 25px ${C.cyan}50,inset 0 0 15px rgba(0,209,255,0.2)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",transition:"all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
              animation:"chatbotPulse 4s infinite ease-in-out",position:"relative",overflow:"hidden",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1) translateY(-2px)";e.currentTarget.style.borderColor=C.purple;e.currentTarget.style.boxShadow=`0 0 35px ${C.purple}80,inset 0 0 15px rgba(157,111,255,0.3)`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1) translateY(0px)";e.currentTarget.style.borderColor=C.cyan;e.currentTarget.style.boxShadow=`0 0 25px ${C.cyan}50,inset 0 0 15px rgba(0,209,255,0.2)`;}}
          >
            <div style={{position:"absolute",left:0,right:0,height:"100%",width:"100%",background:"linear-gradient(180deg,transparent,rgba(0,209,255,0.2),transparent)",animation:"scanningSweep 2s linear infinite"}}/>
            <Bot size={mobile?24:28} color={C.cyan} strokeWidth={1.8}/>
            {messages.length>0&&(
              <div style={{position:"absolute",top:-2,right:-2,background:C.red,color:"#fff",fontSize:9,fontWeight:900,width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.bg}`,boxShadow:`0 0 12px ${C.red}aa`,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)"}}>
                {messages.filter(m=>m.role==="assistant").length}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          width:panelW,
          height:panelH,
          background:"rgba(8,16,28,0.98)",
          backdropFilter:"blur(25px)",
          WebkitBackdropFilter:"blur(25px)",
          border:`1px solid rgba(0,209,255,0.4)`,
          borderRadius:mobile?16:20,
          boxShadow:`0 24px 64px rgba(0,0,0,0.85),0 0 40px rgba(0,209,255,0.2),inset 0 0 20px rgba(0,209,255,0.05)`,
          display:"flex",flexDirection:"column",overflow:"hidden",
          animation:"chatPanelOpen 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          // On mobile, shift left so it doesn't overflow right edge
          position:mobile?"absolute":undefined,
          bottom:mobile?0:undefined,
          right:mobile?0:undefined,
        }}>
          <div style={{position:"absolute",left:0,right:0,height:4,zIndex:10,background:`linear-gradient(90deg,transparent,${C.cyan},transparent)`,boxShadow:`0 0 8px ${C.cyan}`,animation:"scanningSweep 3.5s linear infinite"}}/>

          {/* Header */}
          <div style={{padding:mobile?"12px 16px":"16px 20px",background:"linear-gradient(180deg,rgba(0,209,255,0.12),transparent)",borderBottom:"1px solid rgba(0,209,255,0.2)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(0,209,255,0.1)",border:"1px solid rgba(0,209,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Bot size={16} color={C.cyan}/>
              </div>
              <div>
                <div style={{fontSize:mobile?12:13,fontWeight:800,color:C.text,fontFamily:"var(--sans-font,Inter,sans-serif)",letterSpacing:0.5}}>ThreatWatch Copilot</div>
                <div style={{fontSize:9,color:C.green,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",display:"flex",alignItems:"center",gap:4}}>
                  <span style={{width:4,height:4,borderRadius:"50%",background:C.green,display:"inline-block"}}/> Active Agent
                </div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {messages.length>0&&(
                <button onClick={()=>setMessages([])} style={{background:"transparent",border:"none",color:`${C.cyan}cc`,cursor:"pointer",fontSize:10,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",fontWeight:700,letterSpacing:0.5,transition:"color 0.2s"}}
                  onMouseEnter={e=>e.target.style.color=C.red} onMouseLeave={e=>e.target.style.color=`${C.cyan}cc`}>Clear</button>
              )}
              <button onClick={()=>setIsOpen(false)} style={{background:"transparent",border:"none",color:C.textMid,cursor:"pointer",fontSize:18,transition:"color 0.2s",padding:0,lineHeight:1}}
                onMouseEnter={e=>e.target.style.color=C.cyan} onMouseLeave={e=>e.target.style.color=C.textMid}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:mobile?"12px 14px":"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
            {messages.length===0?(
              <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px",textAlign:"center"}}>
                <Bot size={40} color={`${C.cyan}50`} style={{marginBottom:12,animation:"floatY 3s infinite ease-in-out"}}/>
                <div style={{fontSize:mobile?12:13,fontWeight:800,color:C.text,marginBottom:6,fontFamily:"var(--sans-font,Inter,sans-serif)"}}>Secured SOC Assistant</div>
                <div style={{fontSize:mobile?10:10.5,color:C.textMid,lineHeight:1.6,fontFamily:"var(--sans-font,Inter,sans-serif)",marginBottom:16}}>Real-time visibility into monitored logs and ML metrics.</div>
                <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%"}}>
                  {["Monitored threat summary","Isolation Forest details","Mitigation playbooks"].map((q,idx)=>(
                    <button key={idx} onClick={()=>sendMessage(q)} style={{background:"rgba(0,209,255,0.04)",border:"1px solid rgba(0,209,255,0.2)",borderRadius:8,padding:mobile?"8px 12px":"10px 14px",color:"#c0d8f0",fontSize:mobile?10:11,cursor:"pointer",textAlign:"left",fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",transition:"all 0.2s",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,209,255,0.1)";e.currentTarget.style.borderColor=C.cyan;e.currentTarget.style.transform="translateX(2px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,209,255,0.04)";e.currentTarget.style.borderColor="rgba(0,209,255,0.2)";e.currentTarget.style.transform="translateX(0px)";}}>
                      <span>{q}</span><span style={{color:C.cyan}}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            ):(
              messages.map((msg,i)=>(
                <div key={msg.id||i} style={{alignSelf:msg.role==="user"?"flex-end":"flex-start",maxWidth:"85%",background:msg.role==="user"?`linear-gradient(135deg,rgba(167,139,250,0.18),rgba(167,139,250,0.06))`:`linear-gradient(135deg,rgba(0,209,255,0.12),rgba(0,209,255,0.03))`,border:`1px solid ${msg.role==="user"?"rgba(167,139,250,0.35)":"rgba(0,209,255,0.35)"}`,borderRadius:msg.role==="user"?"14px 14px 2px 14px":"14px 14px 14px 2px",padding:mobile?"8px 12px":"10px 14px",color:msg.error?C.red:"#e5efff",fontSize:mobile?10:11,lineHeight:1.55,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",animation:"fadeIn 0.25s ease-out"}}>
                  {renderContent(msg.content)}
                </div>
              ))
            )}
            {loading&&(
              <div style={{alignSelf:"flex-start",display:"flex",gap:5,alignItems:"center",padding:"9px 14px",background:"rgba(0,209,255,0.06)",borderRadius:10,border:"1px solid rgba(0,209,255,0.25)"}}>
                {[0,1,2].map(i=>(
                  <span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.cyan,display:"inline-block",animation:`dotBounce 1.4s infinite ease-in-out ${i*0.2}s`}}/>
                ))}
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Footer input */}
          <div style={{padding:mobile?"10px 14px 14px":"14px 18px",background:"rgba(0,10,20,0.8)",borderTop:"1px solid rgba(0,209,255,0.18)",display:"flex",gap:8}}>
            <textarea
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Query copilot..."
              rows={1}
              style={{flex:1,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(0,209,255,0.3)",borderRadius:8,padding:mobile?"8px 12px":"10px 14px",color:"#fff",fontSize:mobile?11:11.5,fontFamily:"var(--mono-font,'JetBrains Mono',monospace)",outline:"none",resize:"none",caretColor:C.cyan,transition:"border-color 0.2s"}}
              onFocus={e=>e.currentTarget.style.borderColor=C.cyan}
              onBlur={e=>e.currentTarget.style.borderColor="rgba(0,209,255,0.3)"}
            />
            <button
              onClick={()=>sendMessage(input)}
              style={{width:mobile?32:36,height:mobile?32:36,borderRadius:8,background:input.trim()&&!loading?C.cyan:"rgba(0,209,255,0.08)",border:"none",cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:input.trim()&&!loading?`0 0 12px ${C.cyan}50`:"none",alignSelf:"center"}}>
              <Send size={14} color={input.trim()&&!loading?C.bg:`${C.cyan}40`} strokeWidth={2.2}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}