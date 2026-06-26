import React from "react";

export function SkeletonPage() {
  const bar = (w, h=12, mb=0) => (
    <div className="skeleton" style={{width:w, height:h, marginBottom:mb, borderRadius:3}}/>
  );
  return (
    <div style={{padding:"28px 32px",height:"100%",overflow:"hidden"}}>
      {/* Header */}
      <div style={{marginBottom:28}}>
        {bar("120px", 9, 8)}
        {bar("280px", 26, 6)}
        {bar("220px", 11)}
      </div>
      {/* Stat cards */}
      <div style={{display:"flex",gap:14,marginBottom:18}}>
        {[1,2,3,4].map(i=>(
          <div key={i} className="glass-panel" style={{flex:1,borderRadius:8,padding:"18px"}}>
            {bar("60%", 9, 10)}
            {bar("80%", 28, 8)}
            {bar("50%", 10)}
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,marginBottom:14}}>
        <div className="glass-panel" style={{borderRadius:8,padding:"22px"}}>
          {bar("180px", 11, 16)}
          <div className="skeleton" style={{width:"100%",height:190,borderRadius:4}}/>
        </div>
        <div className="glass-panel" style={{borderRadius:8,padding:"22px"}}>
          {bar("140px", 11, 16)}
          <div className="skeleton" style={{width:"100%",height:130,borderRadius:"50%",margin:"0 auto"}}/>
          {[1,2,3,4].map(i=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid rgba(0,209,255,0.1)`}}>
            {bar("40%",10)} {bar("20%",10)}
          </div>)}
        </div>
      </div>
      {/* Table */}
      <div className="glass-panel" style={{borderRadius:8,padding:"22px"}}>
        {bar("200px", 11, 16)}
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:`1px solid rgba(0,209,255,0.06)`,alignItems:"center"}}>
            <div className="skeleton" style={{width:32,height:32,borderRadius:6,flexShrink:0}}/>
            {bar("25%", 11)} {bar("15%", 11)} {bar("20%", 11)} {bar("30%", 8)}
          </div>
        ))}
      </div>
    </div>
  );
}
export default SkeletonPage;
