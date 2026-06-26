import React from "react";
import { C, LEVEL_C, LEVEL_BG } from "../../constants/theme.js";
import { GlowDot } from "./GlowDot.jsx";

export function CyberBadge({ level }) {
  const c = LEVEL_C[level];
  return (
    <span style={{
      background: LEVEL_BG[level],
      color: c,
      border: `1px solid ${c}50`,
      padding:"3px 10px",
      borderRadius:4,
      fontSize:10,
      fontFamily: C.mono,
      fontWeight:700,
      letterSpacing:1,
      textTransform:"uppercase",
      display:"inline-flex",
      alignItems:"center",
      gap:5,
    }}>
      <GlowDot color={c} size={5} pulse={level==="Critical"}/>
      {level}
    </span>
  );
}
export default CyberBadge;
