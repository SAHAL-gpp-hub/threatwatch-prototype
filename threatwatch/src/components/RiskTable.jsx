import React from "react";
import { TrendingUp, TrendingDown, Minus, Eye } from "lucide-react";
import { C } from "../constants/theme.js";
import { Avatar } from "./ui/Avatar.jsx";
import { ScoreBar } from "./ui/ScoreBar.jsx";
import { CyberBadge } from "./ui/CyberBadge.jsx";

export function RiskTable({ employees, delay=0, onAnalyze }) {
  return (
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead>
        <tr style={{borderBottom:`1px solid ${C.border}`}}>
          {["#","Employee","Dept","Risk Score","Level","Trend","Last Activity","Action"].map(h=>(
            <th key={h} style={{
              padding:"10px 14px",textAlign:"left",
              fontSize:10,color:C.textLow,fontWeight:700,
              letterSpacing:2,textTransform:"uppercase",
              fontFamily: C.mono,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((e,i)=>(
          <tr key={e.id} className="row-hover" style={{
            borderBottom:`1px solid rgba(0,209,255,0.05)`,
            animation:`slideInUp 0.4s ease-out both`,
            animationDelay:`${delay + i*60}ms`,
          }}>
            <td style={{padding:"14px 14px",color:C.textLow,fontSize:12,fontFamily:C.mono}}>{i+1}</td>
            <td style={{padding:"14px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar initials={e.initials} size={34} level={e.level}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:C.sans}}>{e.name}</div>
                  <div style={{fontSize:10,color:C.textLow,fontFamily:C.mono,marginTop:1}}>{e.role}</div>
                </div>
              </div>
            </td>
            <td style={{padding:"14px 14px",fontSize:11,color:C.textMid,fontFamily:C.mono}}>{e.dept}</td>
            <td style={{padding:"14px 14px"}}><ScoreBar score={e.score} level={e.level}/></td>
            <td style={{padding:"14px 14px"}}><CyberBadge level={e.level}/></td>
            <td style={{padding:"14px 14px",fontSize:11,fontFamily:C.mono,
              color:e.trend==="Rising"?C.red:e.trend==="Declining"?C.green:C.textMid}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {e.trend==="Rising" ? <TrendingUp size={13} strokeWidth={2}/> : e.trend==="Declining" ? <TrendingDown size={13} strokeWidth={2}/> : <Minus size={13} strokeWidth={2}/>}
                {e.trend}
              </div>
            </td>
            <td style={{padding:"14px 14px",fontSize:11,color:C.textLow,fontFamily:C.mono}}>{e.lastActivity}</td>
            <td style={{padding:"14px 14px"}}>
              <button className="cyber-btn" onClick={()=>onAnalyze&&onAnalyze(e)} style={{
                background:`linear-gradient(135deg,${C.cyanDim},${C.cyanFaint})`,
                border:`1px solid ${C.borderHi}`,
                color:C.cyan,borderRadius:5,padding:"6px 14px",
                fontSize:11,cursor:"pointer",fontFamily:C.mono,
                display:"flex",alignItems:"center",gap:5,
              }}><Eye size={11} strokeWidth={2}/>ANALYZE</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default RiskTable;
