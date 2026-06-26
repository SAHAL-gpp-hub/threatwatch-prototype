import React from "react";
import { C } from "../../constants/theme.js";

export const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"rgba(10,14,20,0.95)",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 14px",fontFamily:C.mono,fontSize:11,color:C.textMid,backdropFilter:"blur(8px)"}}>
      <div style={{color:C.cyan,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||C.cyan}}>{p.name||p.dataKey}: <span style={{color:C.text,fontWeight:700}}>{typeof p.value==="number"?p.value.toFixed(1):p.value}</span></div>
      ))}
    </div>
  );
};

export default TT;
