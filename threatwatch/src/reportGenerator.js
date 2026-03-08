// ThreatWatch — Report Generator
// Plain JS, no JSX — Vite treats .js as standard ES module

// ── EXPORT REPORT GENERATOR ──────────────────────────────
export function generateReport(employees) {
  const now      = new Date();
  const ts       = now.toLocaleString();
  const pad      = n => String(n).padStart(2,"0");
  const reportId = "TW-"+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+"-"+pad(now.getHours())+pad(now.getMinutes());

  const critEmps  = employees.filter(e=>e.level==="Critical");
  const highEmps  = employees.filter(e=>e.level==="High");
  const modEmps   = employees.filter(e=>e.level==="Moderate");
  const avgScore  = employees.length ? (employees.reduce((s,e)=>s+e.score,0)/employees.length).toFixed(1) : 0;
  const isAfterHours = e => { const h=e.login_hour??8; return h<7||h>20; };
  const afterHrs  = employees.filter(isAfterHours).length;
  const usbTotal  = employees.reduce((s,e)=>s+(e.usb||0),0);
  const privTotal = employees.filter(e=>e.priv>0).length;
  const negSent   = employees.filter(e=>e.sentiment<0).length;
  const deptMap   = {};
  employees.forEach(e=>{ deptMap[e.dept]=(deptMap[e.dept]||0)+(e.level==="Critical"||e.level==="High"?1:0); });
  const topDept   = Object.entries(deptMap).sort((a,b)=>b[1]-a[1])[0];

  const lc = l => l==="Critical"?"#ff1e50":l==="High"?"#ff7c1e":l==="Moderate"?"#ffd700":"#00ff87";
  const lb = l => l==="Critical"?"#ff1e5020":l==="High"?"#ff7c1e20":l==="Moderate"?"#ffd70015":"#00ff8715";

  const getFlags = e => {
    const f = [];
    if (isAfterHours(e)) f.push("After-hours login");
    if (e.files > 45) f.push("File exfil (+" + Math.round((e.files-25)/25*100) + "% above baseline)");
    if (e.priv>0) f.push("Privilege escalation (" + e.priv + " attempts)");
    if (e.usb>0) f.push("USB device connected");
    if (e.sentiment<-0.3) f.push("Negative sentiment (" + (e.sentiment||0).toFixed(2) + ")");
    return f.join(" &middot; ") || "No critical anomalies";
  };

  const css = "*{box-sizing:border-box;margin:0;padding:0}" +
    "body{font-family:'Courier New',monospace;background:#030912;color:#e2eeff;padding:40px;line-height:1.5;font-size:13px}" +
    ".hdr{border-bottom:2px solid #00ffe1;padding-bottom:20px;margin-bottom:28px}" +
    ".logo{font-size:28px;font-weight:900;color:#00ffe1;letter-spacing:6px}" +
    ".sub{font-size:11px;color:#5a7a9f;letter-spacing:3px;margin-top:4px}" +
    ".rmeta{display:flex;gap:32px;margin-top:16px;padding:14px;background:#080f1e;border:1px solid #112540;border-radius:4px;flex-wrap:wrap}" +
    ".rmeta div label{font-size:9px;color:#5a7a9f;letter-spacing:2px;display:block;margin-bottom:3px}" +
    ".rmeta div span{font-size:13px;color:#e2eeff;font-weight:700}" +
    ".sec{margin-bottom:28px}" +
    ".st{font-size:10px;color:#00ffe1;letter-spacing:4px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #0d2a45}" +
    ".g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}" +
    ".card{background:#080f1e;border:1px solid #112540;border-radius:4px;padding:14px;text-align:center}" +
    ".card .v{font-size:28px;font-weight:900}" +
    ".card .l{font-size:9px;color:#5a7a9f;letter-spacing:2px;margin-top:4px}" +
    "table{width:100%;border-collapse:collapse;font-size:12px}" +
    "th{text-align:left;padding:10px 12px;background:#070e1b;color:#00ffe1;font-size:9px;letter-spacing:3px;border-bottom:1px solid #0d2a45}" +
    "td{padding:9px 12px;border-bottom:1px solid #0a1a2a;vertical-align:top}" +
    ".badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:1px}" +
    ".flags{font-size:10px;color:#7a98c0;line-height:1.8}" +
    ".rec{background:#080f1e;border-left:3px solid #00ffe1;padding:10px 14px;margin-bottom:8px;border-radius:0 4px 4px 0;font-size:12px}" +
    ".rec.u{border-left-color:#ff1e50}.rec.w{border-left-color:#ff7c1e}" +
    ".footer{margin-top:40px;padding-top:16px;border-top:1px solid #0d2a45;display:flex;justify-content:space-between;font-size:10px;color:#3d5470}" +
    ".toolbar{margin-bottom:24px;display:flex;gap:12px;align-items:center}" +
    ".btn{padding:8px 18px;border:1px solid;border-radius:4px;cursor:pointer;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1px}" +
    "@media print{.toolbar{display:none!important}body{background:#fff;color:#000}.logo,.st{color:#007755}.card,.rmeta,.rec{background:#f8f8f8;border-color:#ccc}.badge,.v{print-color-adjust:exact;-webkit-print-color-adjust:exact}}";

  const threatRows = [...critEmps,...highEmps].map((e,i) =>
    "<tr>" +
    "<td style='color:#5a7a9f'>"+(i+1)+"</td>" +
    "<td><strong>"+e.name+"</strong><br/><span style='color:#5a7a9f;font-size:10px'>"+e.id+"</span></td>" +
    "<td style='font-size:11px'>"+e.role+"<br/><span style='color:#5a7a9f'>"+e.dept+"</span></td>" +
    "<td><strong style='color:"+lc(e.level)+";font-size:16px'>"+e.score+"</strong></td>" +
    "<td><span class='badge' style='background:"+lb(e.level)+";color:"+lc(e.level)+"'>"+e.level.toUpperCase()+"</span></td>" +
    "<td style='color:"+(e.trend==="Rising"?"#ff1e50":e.trend==="Declining"?"#00ff87":"#7a98c0")+"'>"+(e.trend==="Rising"?"&#8593;":e.trend==="Declining"?"&#8595;":"&mdash;")+" "+e.trend+"</td>" +
    "<td class='flags'>"+getFlags(e)+"</td></tr>"
  ).join("");

  const allRows = employees.map((e,i) =>
    "<tr>" +
    "<td style='color:#5a7a9f'>"+(i+1)+"</td>" +
    "<td>"+e.name+"</td><td>"+e.dept+"</td>" +
    "<td style='color:"+lc(e.level)+";font-weight:700'>"+e.score+"</td>" +
    "<td><span class='badge' style='background:"+lb(e.level)+";color:"+lc(e.level)+"'>"+e.level+"</span></td>" +
    "<td style='color:"+(e.trend==="Rising"?"#ff1e50":e.trend==="Declining"?"#00ff87":"#7a98c0")+"'>"+e.trend+"</td>" +
    "<td style='color:"+(isAfterHours(e)?"#ff1e50":"#7a98c0")+"'>"+(e.loginTime||(e.login_hour??8)+":00")+"</td>" +
    "<td style='color:"+(e.files>45?"#ff7c1e":"#7a98c0")+"'>"+e.files+"</td>" +
    "<td style='color:"+(e.usb>0?"#ff1e50":"#7a98c0")+";font-weight:"+(e.usb>0?"700":"400")+"'>"+(e.usb>0?"YES":"&mdash;")+"</td></tr>"
  ).join("");

  const recs =
    (critEmps.length>0?"<div class='rec u'>&#128308; IMMEDIATE: "+critEmps.map(e=>e.name).join(", ")+" &mdash; suspend access pending investigation.</div>":"") +
    (highEmps.length>0?"<div class='rec w'>&#129000; PRIORITY: "+highEmps.map(e=>e.name).join(", ")+" &mdash; escalate to security team within 24h.</div>":"") +
    (afterHrs>0?"<div class='rec w'>&#129000; After-hours access detected across "+afterHrs+" employees &mdash; verify business justification.</div>":"") +
    (usbTotal>0?"<div class='rec u'>&#128308; USB events detected &mdash; verify data transfer authorisation and check DLP logs.</div>":"") +
    (privTotal>0?"<div class='rec u'>&#128308; Privilege escalation logged &mdash; audit permission changes and review PAM policy.</div>":"") +
    "<div class='rec'>&#128994; Continue 30-day behavioural monitoring for all "+modEmps.length+" Moderate risk employees.</div>" +
    "<div class='rec'>&#128994; Schedule quarterly model retraining to incorporate new behavioural patterns.</div>";

  const html = "<!DOCTYPE html><html><head><meta charset='utf-8'/><title>ThreatWatch Report "+reportId+"</title><style>"+css+"</style></head><body>" +
    "<div class='toolbar'>" +
      "<button class='btn' style='background:#00ffe115;color:#00ffe1;border-color:#00ffe140' onclick='window.print()'>&#9632; PRINT / SAVE PDF</button>" +
      "<button class='btn' id='dlbtn' style='background:#9d6fff15;color:#9d6fff;border-color:#9d6fff40'>&#9632; DOWNLOAD HTML</button>" +
      "<span style='margin-left:auto;font-size:10px;color:#3d5470'>Report ID: "+reportId+" &nbsp;|&nbsp; CONFIDENTIAL</span>" +
    "</div>" +
    "<div class='hdr'><div class='logo'>THREATWATCH</div><div class='sub'>INSIDER THREAT INTELLIGENCE REPORT &middot; INSIGHT PLATFORM &middot; SSIP 2026</div>" +
      "<div class='rmeta'><div><label>GENERATED</label><span>"+ts+"</span></div><div><label>REPORT ID</label><span>"+reportId+"</span></div>" +
      "<div><label>EMPLOYEES</label><span>"+employees.length+"</span></div><div><label>ML ENGINE</label><span>Isolation Forest v4.2.1</span></div>" +
      "<div><label>PERIOD</label><span>Last 30 days</span></div><div><label>STATUS</label><span style='color:#ff1e50'>CONFIDENTIAL</span></div></div></div>" +
    "<div class='sec'><div class='st'>// 01 &middot; EXECUTIVE SUMMARY</div><div class='g4'>" +
      "<div class='card'><div class='v' style='color:#ff1e50'>"+critEmps.length+"</div><div class='l'>CRITICAL THREATS</div></div>" +
      "<div class='card'><div class='v' style='color:#ff7c1e'>"+highEmps.length+"</div><div class='l'>HIGH RISK</div></div>" +
      "<div class='card'><div class='v' style='color:#ffd700'>"+modEmps.length+"</div><div class='l'>MODERATE RISK</div></div>" +
      "<div class='card'><div class='v' style='color:#00ffe1'>"+avgScore+"</div><div class='l'>AVG RISK SCORE</div></div>" +
    "</div></div>" +
    "<div class='sec'><div class='st'>// 02 &middot; BEHAVIOURAL SIGNAL SUMMARY</div>" +
      "<table><tr><th>SIGNAL TYPE</th><th>COUNT</th><th>% WORKFORCE</th><th>SEVERITY</th></tr>" +
      "<tr><td>After-Hours System Access</td><td>"+afterHrs+"</td><td>"+(afterHrs/Math.max(1,employees.length)*100).toFixed(0)+"%</td><td><span class='badge' style='background:#ff1e5020;color:#ff1e50'>"+(afterHrs>2?"HIGH":"MODERATE")+"</span></td></tr>" +
      "<tr><td>Excessive File Access (&gt;45 files)</td><td>"+employees.filter(e=>e.files>45).length+"</td><td>"+(employees.filter(e=>e.files>45).length/Math.max(1,employees.length)*100).toFixed(0)+"%</td><td><span class='badge' style='background:#ff7c1e20;color:#ff7c1e'>ELEVATED</span></td></tr>" +
      "<tr><td>Privilege Escalation</td><td>"+privTotal+"</td><td>"+(privTotal/Math.max(1,employees.length)*100).toFixed(0)+"%</td><td><span class='badge' style='background:#ff1e5020;color:#ff1e50'>"+(privTotal>0?"HIGH":"NORMAL")+"</span></td></tr>" +
      "<tr><td>USB / External Device Events</td><td>"+usbTotal+"</td><td>"+(usbTotal/Math.max(1,employees.length)*100).toFixed(0)+"%</td><td><span class='badge' style='background:#ff7c1e20;color:#ff7c1e'>"+(usbTotal>0?"ELEVATED":"NORMAL")+"</span></td></tr>" +
      "<tr><td>Negative Email Sentiment</td><td>"+negSent+"</td><td>"+(negSent/Math.max(1,employees.length)*100).toFixed(0)+"%</td><td><span class='badge' style='background:#ffd70020;color:#ffd700'>MONITOR</span></td></tr>" +
      "<tr><td>Highest Risk Department</td><td colspan='2'>"+(topDept?topDept[0]+" ("+topDept[1]+" flagged)":"&mdash;")+"</td><td><span class='badge' style='background:#ff7c1e20;color:#ff7c1e'>PRIORITY</span></td></tr>" +
      "</table></div>" +
    "<div class='sec'><div class='st'>// 03 &middot; THREAT ACTOR PROFILES</div>" +
      "<table><tr><th>#</th><th>EMPLOYEE</th><th>ROLE / DEPT</th><th>SCORE</th><th>LEVEL</th><th>TREND</th><th>ANOMALY FLAGS</th></tr>" +
      threatRows+"</table></div>" +
    "<div class='sec'><div class='st'>// 04 &middot; FULL EMPLOYEE RISK REGISTER</div>" +
      "<table><tr><th>#</th><th>EMPLOYEE</th><th>DEPT</th><th>SCORE</th><th>LEVEL</th><th>TREND</th><th>LOGIN</th><th>FILES</th><th>USB</th></tr>" +
      allRows+"</table></div>" +
    "<div class='sec'><div class='st'>// 05 &middot; RECOMMENDATIONS</div>"+recs+"</div>" +
    "<div class='footer'><span>INSIGHT &middot; AI-Powered Insider Threat Detection</span><span>"+reportId+" &middot; "+ts+" &middot; CONFIDENTIAL</span></div>" +
    "<script>document.getElementById('dlbtn').onclick=function(){" +"var b=new Blob([document.documentElement.outerHTML],{type:'text/html'});" +"var a=document.createElement('a');a.href=URL.createObjectURL(b);" +"a.download='ThreatWatch-"+reportId+".html';a.click()};" +"</script></body></html>";

  const w = window.open("","_blank","width=1100,height=800");
  w.document.write(html);
  w.document.close();
}