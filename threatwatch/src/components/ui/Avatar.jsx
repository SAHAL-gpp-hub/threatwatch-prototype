import React from "react";
import { C, LEVEL_C } from "../../constants/theme.js";

export function Avatar({ initials, size=36, level }) {
  const c = level ? LEVEL_C[level] : C.cyan;
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:`radial-gradient(circle at 40% 35%, rgba(0,209,255,0.12), rgba(10,14,20,0.9))`,
      border:`1.5px solid ${c}60`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.32, fontWeight:700, color:c,
      fontFamily: C.mono,
      boxShadow:`0 0 12px ${c}25`,
      flexShrink:0,
    }}>
      {initials}
    </div>
  );
}
export default Avatar;
