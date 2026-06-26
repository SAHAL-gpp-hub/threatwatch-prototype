import React from "react";
import { C } from "../../constants/theme.js";

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:10, color:C.cyan, fontFamily: C.mono,
      letterSpacing:3, textTransform:"uppercase", marginBottom:14,
      display:"flex", alignItems:"center", gap:8,
    }}>
      <div style={{width:16,height:1,background:C.cyan,opacity:0.7}}/>
      {children}
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.cyan}30,transparent)`}}/>
    </div>
  );
}
export default SectionLabel;
