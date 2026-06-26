import React from "react";

export function GlowDot({ color, size=8, pulse=false }) {
  return (
    <span style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}}>
      <span style={{width:size,height:size,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`,display:"block"}}/>
      {pulse && <span style={{position:"absolute",width:size,height:size,borderRadius:"50%",background:color,animation:"pulse-animation 1.5s ease-out infinite", opacity:0.6}}/> }
    </span>
  );
}

export default GlowDot;
