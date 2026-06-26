import React from "react";
import { C } from "../../constants/theme.js";

export function Panel({ children, style={}, critical=false, glow=false, animate=true }) {
  return (
    <div className={`glass-panel${glow ? " cyber-glow" : ""}${critical ? " cyber-glow-red" : ""}`} style={{
      borderRadius:8,
      animation: animate ? "slideInUp 0.4s ease-out both" : "none",
      ...(critical ? {animation:"criticalPulse 2s ease-in-out infinite", borderColor: `${C.red}30`} : {}),
      ...style,
      // Ensure the child styles apply
    }}>
      {children}
    </div>
  );
}
export default Panel;
