import React from "react";
import { C, LEVEL_C } from "../../constants/theme.js";

export function ScoreBar({ score, level, width=80 }) {
  const c = LEVEL_C[level];
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
        <div
          className="scroll-bar-fill"
          style={{
            width:`${score}%`,
            "--bar-target": `${score}%`,
            height:"100%",
            background:c,
            borderRadius:2,
            boxShadow:`0 0 8px ${c}`,
          }}
        />
      </div>
      <span style={{fontSize:13,fontWeight:700,color:c,fontFamily:C.mono,minWidth:24}}>{score}</span>
    </div>
  );
}
export default ScoreBar;