import React from "react";
import { C } from "../../constants/theme.js";
import { Panel } from "./Panel.jsx";

export function StatCard({ label, value, sub, subColor=C.green, icon, delay=0, critical=false }) {
  return (
    <Panel style={{flex:1,minWidth:0,padding:"20px 22px",animationDelay:`${delay}ms`}} critical={critical}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{
            fontSize:10, color:C.textMid, letterSpacing:2,
            textTransform:"uppercase", marginBottom:10,
            fontFamily: C.mono,
          }}>{label}</div>
          <div
            className="scroll-counter"
            data-target={typeof value === "number" ? value : undefined}
            data-suffix={typeof value === "string" && isNaN(value) ? value.replace(/[0-9.]/g,"") : ""}
            style={{
              fontSize:30, fontWeight:800, color: critical ? C.red : C.text,
              lineHeight:1, fontFamily: C.mono,
              textShadow: critical ? `0 0 20px ${C.red}60` : "none",
              animation:"countUp 0.5s ease-out",
            }}
          >
            {value}
          </div>
          {sub && <div style={{fontSize:11,color:subColor,marginTop:8,fontFamily:C.mono}}>{sub}</div>}
        </div>
        {icon && (
          <div style={{
            width:42,height:42,borderRadius:8,
            background:`linear-gradient(135deg,${C.cyanDim},${C.cyanFaint})`,
            border:`1px solid ${C.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{icon}</div>
        )}
      </div>
    </Panel>
  );
}
export default StatCard;