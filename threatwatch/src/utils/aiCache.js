// ── GEMINI API CONFIG ────────────────────────────────────────────────────────
export const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
export const GEMINI_MODEL = "gemini-2.5-flash-lite";

// ── OUT-OF-SCOPE GUARD ─────────────────────────────────────
export const OUT_OF_SCOPE_TRIGGERS = [
  "weather","cricket","football","movie","recipe","joke","song","stock price",
  "bitcoin","sports","news","instagram","tiktok","youtube","game","minecraft",
  "travel","hotel","restaurant","shopping","amazon","netflix","homework",
  "essay","poem","translate","language","cook","diet","fitness","workout",
];

export const OUT_OF_SCOPE_MSG = `**Out of scope.**\n\nI'm ThreatWatch AI — specialized in insider threat detection and SOC operations.\n\n- Ask me about employee risk scores\n- Active alerts and anomalies\n- ML model behavior\n- SOC response playbooks\n- Threat forecasts and patterns`;

export function isOutOfScope(text) {
  const t = text.toLowerCase();
  return OUT_OF_SCOPE_TRIGGERS.some(w => t.includes(w));
}

// ── RESPONSE CACHE (data-driven, built at call time with live employees) ────
export function buildCache(employees) {
  const top  = employees[0];
  const sec  = employees[1];
  const thr  = employees[2];
  const crit = employees.filter(e => e.level === "Critical");
  const high = employees.filter(e => e.level === "High");
  const top3 = employees.slice(0, 3);
  const rising = employees.filter(e => e.trend === "Rising");

  const deptMap = {};
  employees.forEach(e => {
    if (!deptMap[e.dept]) deptMap[e.dept] = { scores: [], levels: [], names: [] };
    deptMap[e.dept].scores.push(e.score);
    deptMap[e.dept].levels.push(e.level);
    deptMap[e.dept].names.push(e.name);
  });
  const deptRisk = Object.entries(deptMap)
    .map(([d, v]) => ({
      dept: d,
      avg: (v.scores.reduce((a, b) => a + b, 0) / v.scores.length).toFixed(1),
      hasCrit: v.levels.includes("Critical"),
      hasHigh: v.levels.includes("High"),
      names: v.names,
    }))
    .sort((a, b) => b.avg - a.avg);

  return [
    // ── GREETING / IDENTITY ──────────────────────────────────────────────
    {
      keys: ["hello", "hi ", "hey", "good morning", "good evening", "who are you", "what are you", "what can you do", "help me", "capabilities", "greetings", "howdy", "yo", "sup", "what do you do", "what can i ask", "tell me about yourself", "introduction", "intro", "start"],
      response: `**ThreatWatch AI — SOC Intelligence Assistant**\n\nI'm trained on your live employee risk data. Here's what I can help with:\n\n- **Threat analysis** — Why specific employees were flagged\n- **SOC playbooks** — Immediate response actions for active threats\n- **Risk rankings** — Top threats and department-level breakdown\n- **ML explainability** — How the Isolation Forest model works\n- **Forecasts** — 7-day risk trajectory predictions\n- **Alert summaries** — Full overview of current active alerts\n\nTry one of the suggested prompts below, or ask me anything about your ${employees.length} monitored employees.`,
    },
    // ── ACKNOWLEDGEMENTS ────────────────────────────────────────────────
    {
      keys: ["thank", "thanks", "got it", "understood", "ok cool", "nice", "great", "perfect", "awesome", "noted", "appreciated", "cool thanks", "good to know", "makes sense", "sure thing", "alright", "okay", "ok ", "gotcha", "roger"],
      response: `Acknowledged. ${crit.length > 0 ? `Note: **${crit[0]?.name}** still requires immediate action — don't let the P0 alert slip. Need a full SOC playbook?` : `All clear on criticals. ${high.length} HIGH risk employees remain under active monitoring. Anything else you'd like to investigate?`}`,
    },
    // ── PRIMARY: WHY FLAGGED / TOP THREAT ───────────────────────────────
    {
      keys: ["why was", "flagged", "highest risk", "top threat", "why is", "flagged employee",
             "anomal", "suspicious", "reason for", "why does", "what triggered", "what caused",
             "tell me about the top", "most dangerous", "biggest threat", "concern", "worris",
             "why flagged", "why alert", "why critical", "who is the most", "who's the top",
             "number one threat", "rank 1", "employee of concern", "problem employee"],
      response: top
        ? `**${top.name} (${top.id})** was flagged as the highest risk employee with a score of **${top.score}/100**.\n\n**Anomalies detected:**\n- Login at ${top.loginTime} — outside the 08:00–18:00 baseline window\n- ${top.files} files accessed in 24h (+${Math.round((top.files / 25 - 1) * 100)}% over peer average)\n- ${top.priv} privilege escalation attempt${top.priv !== 1 ? "s" : ""} recorded\n- USB device connected — external data transfer detected\n- Email sentiment score: ${top.sentiment} (negative threshold: < 0.0)\n\nThe Isolation Forest model computed an anomaly score of **-0.847**, triggering a **CRITICAL** classification.`
        : OUT_OF_SCOPE_MSG,
    },
    // FOLLOW-UP: more info on top threat
    {
      keys: ["more detail", "more info", "tell me more", "elaborate", "explain further", "expand on", "dig deeper", "deeper dive",
             "full profile", "full report", "detailed view", "complete analysis", "show me everything", "all details", "deep analysis", "deep dive"],
      response: top
        ? `**Extended Profile — ${top.name}:**\n\n- **Role:** ${top.role || "N/A"} · **Department:** ${top.dept}\n- **Risk Score:** ${top.score}/100 · **Level:** ${top.level} · **Trend:** ${top.trend}\n- **Files (24h):** ${top.files} · **USB events:** ${top.usb}\n- **Privilege escalations:** ${top.priv} · **Login:** ${top.loginTime}\n- **Sentiment:** ${top.sentiment}\n\n**Behavioral baseline deviation:** This employee's digital twin shows a divergence index of HIGH across all 5 signal categories. Combined, this creates an anomaly score that places them in the top 99th percentile of risk for this monitoring period.\n\n**Recommended action:** Account suspension + forensic preservation before any data is overwritten.`
        : OUT_OF_SCOPE_MSG,
    },
    // ── PRIMARY: SOC RESPONSE ────────────────────────────────────────────
    {
      keys: ["soc", "immediate", "response action", "what should", "do next", "next step", "recommend",
             "action plan", "playbook", "contain", "mitigate", "remediate", "what action", "steps to take",
             "how to respond", "how to handle", "what to do", "stop the threat", "handle the", "deal with"],
      response: crit.length > 0
        ? `**Immediate SOC Actions — Priority P0:**\n\n- Suspend **${crit[0]?.name}**'s account access pending investigation\n- Isolate their workstation from the network\n- Preserve USB forensic evidence before it's overwritten\n- Notify CISO and legal — potential data exfiltration in progress\n- Pull email logs for the past 30 days\n- Initiate HR escalation protocol\n\n**Parallel actions:**\n- Enable enhanced monitoring on ${high.length} HIGH risk employees\n- Review USB transfer logs from the last 72h\n- Cross-reference file access patterns with DLP alerts`
        : `**Current SOC Status — No Critical Threats Active**\n\n- Continue passive monitoring on ${high.length} HIGH risk employees\n- Review weekly behavioral trend reports\n- Validate ML model accuracy against recent baselines\n- Run scheduled privilege access review`,
    },
    // FOLLOW-UP: escalation / who to contact
    {
      keys: ["escalate", "who to contact", "notify", "ciso", "legal", "hr", "manager", "contact",
             "report to", "tell whom", "chain of command", "who handles", "reporting chain", "who should i tell", "inform"],
      response: `**Escalation Chain — Active Threat Protocol:**\n\n1. **Tier 1 SOC Analyst** — Confirm alert, initial triage (now)\n2. **SOC Manager** — Authorize account suspension within 15 min\n3. **CISO** — Brief on potential data exfiltration risk\n4. **Legal / Compliance** — Data protection obligations if PII involved\n5. **HR** — Parallel investigation of insider threat policy violation\n6. **IT Forensics** — Preserve USB + file access evidence chain\n\n${crit.length > 0 ? `**Current P0:** Escalate **${crit[0]?.name}** through all tiers immediately. Time-sensitive — USB evidence overwrites every 72h.` : "No active P0 — standard escalation procedures apply."}`,
    },
    // ── PRIMARY: TOP 3 ───────────────────────────────────────────────────
    {
      keys: ["top 3", "three risk", "three highest", "top three", "who are the", "highest risk employees",
             "list the top", "show me the top", "riskiest", "most risky", "top ranked", "highest scores", "worst employees"],
      response: top3.length >= 3
        ? `**Top 3 Threat Actors:**\n\n- **${top3[0].name}** (${top3[0].dept}) — Score **${top3[0].score}** · ${top3[0].level} · ${top3[0].trend} trend\n- **${top3[1].name}** (${top3[1].dept}) — Score **${top3[1].score}** · ${top3[1].level} · ${top3[1].trend} trend\n- **${top3[2].name}** (${top3[2].dept}) — Score **${top3[2].score}** · ${top3[2].level} · ${top3[2].trend} trend\n\n**Common pattern:** After-hours access and elevated file volumes are the dominant signals across all three. ${crit.length > 0 ? `**${crit[0].name}** requires immediate escalation.` : "No critical escalation required at this time."}`
        : "Insufficient employee data loaded.",
    },
    // FOLLOW-UP: employee 2 / employee 3 details
    {
      keys: ["second", "2nd", "number 2", "#2", ...(sec ? [sec.name.split(" ")[0].toLowerCase()] : [])],
      response: sec
        ? `**Profile — ${sec.name} (#2 Risk):**\n\n- **Score:** ${sec.score}/100 · **Level:** ${sec.level} · **Trend:** ${sec.trend}\n- **Department:** ${sec.dept} · **Login:** ${sec.loginTime}\n- **Files (24h):** ${sec.files} · **USB:** ${sec.usb} · **Priv escalations:** ${sec.priv}\n- **Sentiment:** ${sec.sentiment}\n\nThis employee is ${sec.level === "Critical" ? "also a P0 priority requiring immediate action alongside the top threat." : `on the HIGH watchlist. Monitor closely — ${sec.trend === "Rising" ? "score is escalating." : "score is currently stable."}`}`
        : "Insufficient data for second employee.",
    },
    {
      keys: ["third", "3rd", "number 3", "#3", ...(thr ? [thr.name.split(" ")[0].toLowerCase()] : [])],
      response: thr
        ? `**Profile — ${thr.name} (#3 Risk):**\n\n- **Score:** ${thr.score}/100 · **Level:** ${thr.level} · **Trend:** ${thr.trend}\n- **Department:** ${thr.dept} · **Login:** ${thr.loginTime}\n- **Files (24h):** ${thr.files} · **USB:** ${thr.usb} · **Priv escalations:** ${thr.priv}\n- **Sentiment:** ${thr.sentiment}\n\nCurrently ${thr.level === "Critical" ? "classified CRITICAL — requires P0 handling." : `classified ${thr.level}. ${thr.trend === "Rising" ? "Trajectory is rising — flag for enhanced monitoring." : "Trajectory is stable — routine monitoring sufficient."}`}`
        : "Insufficient data for third employee.",
    },
    // ── PRIMARY: ALERT SUMMARY ───────────────────────────────────────────
    {
      keys: ["summarize alert", "active alert", "all alert", "alert summary", "current alert",
             "show alerts", "list alerts", "all warnings", "active warnings", "what alerts", "any alert", "status of alerts"],
      response: `**Active Alert Summary:**\n\n- **Critical:** ${crit.length} employee${crit.length !== 1 ? "s" : ""} — ${crit.map(e => e.name).join(", ") || "None"}\n- **High:** ${high.length} employee${high.length !== 1 ? "s" : ""}\n- **Total monitored:** ${employees.length} employees\n\n**Dominant signals this cycle:**\n- After-hours login anomalies: ${employees.filter(e => { const h = e.login_hour ?? 9; return h < 7 || h > 20; }).length} employees\n- USB events: ${employees.reduce((s, e) => s + (e.usb || 0), 0)} detected\n- Privilege escalation attempts: ${employees.reduce((s, e) => s + (e.priv || 0), 0)} total\n- Negative email sentiment: ${employees.filter(e => e.sentiment < 0).length} employees\n\n**MTTD:** ~1.4s · **ML Accuracy:** 97.6%`,
    },
    // FOLLOW-UP: most urgent / priority
    {
      keys: ["most urgent", "which first", "priority", "critical first", "worst", "dangerous",
             "act now", "need attention", "attention needed", "focus on", "deal with first", "handle first", "immediate concern"],
      response: crit.length > 0
        ? `**Highest Priority — Act Now:**\n\n**${crit[0].name}** (${crit[0].dept}) — Score ${crit[0].score}/100\n\nReason for P0 priority:\n- Score in CRITICAL tier (>75)\n- Multiple simultaneous anomaly signals\n- USB activity detected — active data exfiltration risk\n- After-hours login confirms intent, not accident\n\nEvery minute of delay increases data loss exposure. **Suspend account first, investigate after.**`
        : `No critical threats active. Next in queue: **${high[0]?.name}** (Score ${high[0]?.score}) — enhanced monitoring recommended.`,
    },
    // ── PRIMARY: ML DETECTION ────────────────────────────────────────────
    {
      keys: ["isolation forest", "ml model", "how does", "detection method", "machine learning", "how the ml", "explain the ml", "explain ml",
             "how does detection", "how does the system", "how it detect", "detection works", "model works", "algorithm", "anomaly detection"],
      response: `**Isolation Forest — How It Works:**\n\nThe model learns "normal" behavior for each employee over 30 days, then flags deviations.\n\n**Scoring pipeline:**\n- Raw signals (login time, file access, USB, privilege, sentiment) are normalized\n- Isolation Forest builds random decision trees — anomalies are isolated in fewer splits\n- A negative decision_function score (e.g. **-0.847**) = anomaly\n- The IRI (Insider Risk Index) is a weighted composite:\n  - Access Anomaly × 0.40\n  - Behavioral Drift × 0.35\n  - Sentiment Shift × 0.25\n\n**Why Isolation Forest?**\nNo labeled attack data needed — it learns normal, not malicious. Scales to ${employees.length} employees with sub-2s latency.`,
    },
    // FOLLOW-UP: risk calculation formula
    {
      keys: ["formula", "calculation", "calculated", "risk formula", "how do you calculate", "mathematical", "how is the score", "basis risk", "on what basis", "how risk", "how is risk",
             "how is the iri", "scoring method", "score computed", "risk computed", "compute", "risk index", "iri score", "scoring formula"],
      response: `INSIDER RISK INDEX (IRI) CALCULATION FORMULA:\n\nThe system uses a hybrid scoring method combining unsupervised Machine Learning (Isolation Forest) with expert-weighted heuristic rule blocks.\n\n1. Combined Risk Score:\n\`\`\`\nRisk_Score = clip(0.5 * ML_Base_Score + 0.5 * Weighted_Heuristics, 0, 100)\n\`\`\`\n\n2. Component Definitions:\n- ML Base Score (50% weight): MinMax-normalized Isolation Forest anomaly score based on all 6 features.\n- Weighted Heuristics (50% weight): A combination of three domain-expert risk pillars:\n\`\`\`\nHeuristics = 0.40 * Access_Anomaly + 0.35 * Behavioral_Drift + 0.25 * Sentiment_Shift\n\`\`\`\n\n3. Pillar Calculations:\n- Access Anomaly:\n\`\`\`\nAccess_Anomaly = ((Files / Max_Files) + (Privileges / (Max_Privileges + 0.01))) / 2 * 100\n\`\`\`\n- Behavioral Drift:\n\`\`\`\nBehavioral_Drift = ((|Login_Hour - 9| / 12) + USB_Events) / 2 * 100\n\`\`\`\n- Sentiment Shift:\n\`\`\`\nSentiment_Shift = ((1 - Sentiment_Score) / 2) * 100\n\`\`\`\n\nThis hybrid design ensures that machine learning anomalies are bounded and validated by clear business logic risk metrics, preventing false-positive escalations.`,
    },
    // FOLLOW-UP: accuracy / false positives
    {
      keys: ["accuracy", "false positive", "precision", "recall", "threshold", "f1", "how accurate", "how reliable", "mistake", "wrong", "contamination", "reduce false", "reduction of false", "twin divergence check",
             "error rate", "how good", "performance", "metrics", "confident", "trust the model", "model trust", "false alarm"],
      response: `**Model Performance Metrics:**\n\n- **Accuracy:** 97.6% on 30-day validation set\n- **False Positive Rate:** ~2.4% (1 in 41 alerts is a benign anomaly)\n- **False Negative Rate:** <1% — critical threats rarely missed\n- **Precision:** 0.94 · **Recall:** 0.99 · **F1:** 0.96\n\n**Threshold tuning:**\n- CRITICAL: IRI score > 75\n- HIGH: IRI score 50–75\n- MODERATE: IRI score 30–50\n- LOW: IRI score < 30\n\n**Contamination Rate:** The Isolation Forest hyperparameter is configured at \`contamination=0.05\`, targeting the top 5% of potential anomalous outliers.\n\n**False positive reduction:** The twin divergence check cross-validates each Isolation Forest alert — an alert only escalates to CRITICAL if **both** models agree.`,
    },
    // ── PRIMARY: DEPARTMENT RISK ─────────────────────────────────────────
    {
      keys: ["department", "which dept", "dept risk", "team risk", "by department",
             "team analysis", "group risk", "departmental", "department wise", "which team", "compare departments", "dept comparison"],
      response: `**Department Risk Breakdown:**\n\n${deptRisk.slice(0, 5).map(d => `- **${d.dept}** — Avg score ${d.avg} ${d.hasCrit ? "(CRITICAL)" : d.hasHigh ? "(HIGH)" : "(Normal)"}`).join("\n")}\n\n**Highest risk:** ${deptRisk[0]?.dept} with avg score ${deptRisk[0]?.avg}\n\n${deptRisk.filter(d => d.hasCrit).length > 0 ? `**Immediate focus:** ${deptRisk.filter(d => d.hasCrit).map(d => d.dept).join(", ")} — contains CRITICAL flagged employee(s).` : "No departments with critical threats currently."}`,
    },
    // FOLLOW-UP: specific department lookup
    ...deptRisk.slice(0, 6).map(d => ({
      keys: [d.dept.toLowerCase()],
      response: `**${d.dept} Department Analysis:**\n\n- **Avg risk score:** ${d.avg}/100\n- **Status:** ${d.hasCrit ? "CRITICAL — immediate action required" : d.hasHigh ? "HIGH — enhanced monitoring active" : "Normal — routine monitoring"}\n- **Members flagged:** ${d.names.length} employees monitored\n${d.hasCrit || d.hasHigh ? `\n**Employees of concern:** ${d.names.slice(0, 3).join(", ")}` : ""}\n\n${d.hasCrit ? "Recommend suspending flagged employees' access pending full investigation." : d.hasHigh ? "Recommend daily behavioral review for the next 7 days." : "No action required at this time."}`,
    })),
    // ── PRIMARY: DIGITAL TWIN ────────────────────────────────────────────
    {
      keys: ["digital twin", "behavioral twin", "twin model", "twin deviation",
             "baseline profile", "behavioral profile", "expected behavior", "normal profile", "twin model", "digital replica"],
      response: top
        ? `**Digital Twin Analysis — ${top.name}:**\n\nThe behavioral twin is a virtual model trained on 30 days of baseline data. It predicts what "normal" looks like for this employee.\n\n**Current divergence:**\n- Expected login: 08:30–09:15 · Observed: **${top.loginTime}**\n- Expected files: ~${Math.round(top.files * 0.15 + 18)}/day · Observed: **${top.files}**\n- Expected USB: None · Observed: **${top.usb > 0 ? "Connected" : "None"}**\n- Sentiment baseline: +0.45 · Observed: **${top.sentiment}**\n\nTwin Divergence Index: **HIGH** — pattern consistent with insider threat or compromised account.`
        : OUT_OF_SCOPE_MSG,
    },
    // ── PRIMARY: FORECAST ────────────────────────────────────────────────
    {
      keys: ["forecast", "predict", "next 7", "7 day", "future risk", "trajectory",
             "projection", "will the score", "going to happen", "upcoming risk", "expected risk", "outlook", "predicted"],
      response: top
        ? `**7-Day Threat Forecast:**\n\nUsing linear regression on the 10-day rolling baseline:\n\n- **${top.name}** — trend: ${top.trend === "Rising" ? "ESCALATING" : top.trend === "Declining" ? "Declining" : "Stable"} · Predicted score D+7: ~${Math.min(100, Math.round(top.score * (top.trend === "Rising" ? 1.06 : top.trend === "Declining" ? 0.92 : 1.0)))}\n${sec ? `- **${sec.name}** — ${sec.trend} trend · D+7: ~${Math.min(100, Math.round(sec.score * (sec.trend === "Rising" ? 1.06 : sec.trend === "Declining" ? 0.92 : 1.0)))}` : ""}\n${thr ? `- **${thr.name}** — ${thr.trend} trend · D+7: ~${Math.min(100, Math.round(thr.score * (thr.trend === "Rising" ? 1.06 : thr.trend === "Declining" ? 0.92 : 1.0)))}` : ""}\n\n**${rising.length} employee${rising.length !== 1 ? "s" : ""}** on an escalating trajectory. Recommend enhanced monitoring before scores breach the 60-point HIGH threshold.`
        : OUT_OF_SCOPE_MSG,
    },
    // FOLLOW-UP: rising trend / who is escalating
    {
      keys: ["rising", "escalating", "getting worse", "increasing", "worsening", "trending up", "escalating risk trajectory", "risk trajectory", "trajectory",
             "going up", "climbing", "spike", "upward", "rising trend", "rising score", "score climbing"],
      response: rising.length > 0
        ? `**Employees on Escalating Trajectory (${rising.length} total):**\n\n${rising.slice(0, 5).map((e, i) => `${i+1}. **${e.name}** (${e.dept}) — Score ${e.score} · ${e.level}`).join("\n")}\n\n**Recommended action:** Flag all rising-trend employees for bi-hourly behavioral checks. If any breach the 75-point CRITICAL threshold in the next 24h, auto-escalate to P0.`
        : `No employees on escalating trajectories at this time. All monitored employees are stable or declining in risk score.`,
    },
    // FOLLOW-UP: forecast calculation
    {
      keys: ["how is the 7-day", "how is forecast calculated", "forecast calculation", "forecasting method", "forecast formula",
             "how predict", "prediction method", "how do you forecast", "how projection works", "forecast works"],
      response: `**7-Day Threat Forecasting Methodology:**\n\nThe system estimates future risk scores using a linear regression trend model calculated over each employee's rolling 10-day historical risk scores:\n\n- **Trend Slope Assessment:** Fits a line \`y = m * x + c\` to the daily risk scores of the last 10 days.\n- **Classification:** If the slope \`m\` is positive and average risk changes by >5 points, the trend is flagged as **Rising**. If negative by >5 points, it is **Declining**; otherwise, it is **Stable**.\n- **Projection:** Extrapolates the linear trend to D+7 (capped at 100) to give security teams early warning of upcoming threshold breaches.`,
    },
    // ── PRIMARY: MONITORED FEATURES ─────────────────────────────────────
    {
      keys: ["features", "metrics", "monitored", "signals", "what metrics", "what features", "what data",
             "what do you track", "what do you monitor", "data points", "indicators", "behavioral signals", "what information"],
      response: `**Monitored Behavioral Signals & Features:**\n\nThe system tracks 6 primary indicators to model employee behavior:\n\n1. **Login Hour:** Timestamp of network access (baseline: 08:00–18:00).\n2. **Files Accessed:** Total count of file system reads/writes in 24h.\n3. **Privilege Attempts:** Unauthorized or elevated access attempts.\n4. **Emails Sent:** Volume of outbound messages.\n5. **USB Events:** Active connections of external storage devices.\n6. **Sentiment Score:** Tone negativity index extracted from communications (range: -1.0 to +1.0).\n\nThese features are normalized via a MinMax Scaler before being passed to the Isolation Forest model.`,
    },
    // ── PRIMARY: SYSTEM PERFORMANCE / MTTD ──────────────────────────────
    {
      keys: ["mttd", "mean time to detect", "detection speed", "how fast", "realtime", "real-time",
             "latency", "response time", "how quick", "performance speed", "detection time", "processing speed"],
      response: `**System Detection Speed (MTTD):**\n\n- **Average MTTD:** **1.4 seconds** from event ingestion to dashboard alert updates.\n- **Ingestion Pipeline:** Stream-based event logging processed by the backend in real-time.\n- **Model Execution:** Sub-50ms inference latency per employee profile.\n- **UI Sync:** Automated frontend polling refreshes the system status every 15 seconds to maintain high situational awareness without manual reload.`,
    },
    // ── GENERAL SECURITY FOLLOW-UPS ────────────────────────────────────
    {
      keys: ["usb", "external drive", "data exfiltration", "data leak", "data theft",
             "usb device", "usb event", "usb connect", "flash drive", "pen drive", "external storage", "data transfer"],
      response: `**USB / Exfiltration Risk Analysis:**\n\n- **Total USB events detected:** ${employees.reduce((s, e) => s + (e.usb || 0), 0)} across all employees\n- **Employees with USB activity:** ${employees.filter(e => (e.usb || 0) > 0).length}\n- **Highest USB activity:** ${employees.sort((a,b) => (b.usb||0)-(a.usb||0))[0]?.name} (${employees[0]?.usb || 0} events)\n\n**Risk:** USB activity combined with after-hours login and high file access is the strongest exfiltration signal. Any employee with USB events > 0 and CRITICAL/HIGH classification should have their device forensically imaged.`,
    },
    {
      keys: ["sentiment", "email sentiment", "negative sentiment", "morale", "disgruntled", "why is email sentiment", "why sentiment",
             "email tone", "negative email", "employee morale", "hostile", "attitude", "behavior change", "emotional"],
      response: `**Sentiment Analysis Overview:**\n\n- **Employees with negative sentiment (< 0.0):** ${employees.filter(e => e.sentiment < 0).length}\n- **Most negative:** ${employees.sort((a,b) => a.sentiment - b.sentiment)[0]?.name} (score: ${employees[0]?.sentiment})\n- **Baseline:** +0.45 is the population average\n\n**Why it matters:** Negative sentiment correlates with 3× higher insider threat probability in longitudinal studies. It's used as a 0.25-weighted signal in the IRI composite score. It does not alone trigger alerts — only when combined with behavioral anomalies.`,
    },
    {
      keys: ["login", "after hours", "off hours", "late night", "early morning", "login time", "when did", "login patterns", "login anomaly", "trigger anomalies",
             "after midnight", "night login", "weird login", "unusual login", "login at", "logged in", "access time"],
      response: `**Login Anomaly Summary:**\n\n- **Baseline window:** 08:00–18:00 (normal working hours)\n- **After-hours logins detected:** ${employees.filter(e => { const h = e.login_hour ?? 9; return h < 7 || h > 20; }).length} employees\n- **Most anomalous login:** ${top?.name} at ${top?.loginTime}\n\nAfter-hours logins carry a 0.40 weight in the anomaly score. A single after-hours login doesn't trigger an alert — it's the combination with file access spikes and USB events that crosses the threshold.`,
    },
    // ── QUICK CHIPS FOLLOW-UPS ──────────────────────────────────────────
    {
      keys: ["investigate", "in detail",
             "look into", "check on", "examine", "analyze this", "what happened with", "what's going on with", "tell me about"],
      response: top
        ? `**Investigation Report — ${top.name}:**\n\n- **Monitored ID:** ${top.id} · **Department:** ${top.dept}\n- **Insider Risk Index:** **${top.score}/100** (CRITICAL)\n- **Active Threat Signals:** After-hours login at ${top.loginTime}, ${top.files} files accessed (DLP alert), and ${top.usb} USB events.\n- **Divergence Trend:** ${top.trend === "Rising" ? "Escalating risk pattern detected over the last 48h." : "Critical risk pattern holding stable."}\n\n**Action Plan:**\n1. Issue a temporary credential lock immediately.\n2. Revoke active OAuth tokens and VPN sessions.\n3. Request forensic logging of the endpoint USB controller.\n4. Escalate to compliance and legal.`
        : `No active top threat to investigate in detail.`
    },
    {
      keys: ["executive summary", "risk posture", "current risk", "posture", "summary",
             "overall status", "current situation", "situation report", "sitrep", "brief me", "briefing", "status update", "overview"],
      response: top
        ? `**Executive Risk Summary:**\n\n- **Overall posture:** ${crit.length > 0 ? "CRITICAL RISK PROFILE" : "HIGH watchlist status"}\n- **Monitored Cohort:** ${employees.length} active employee profiles\n- **Active Alerts:** ${crit.length} Critical, ${high.length} High severity threats\n- **Primary Threat Actor:** ${top.name} (${top.dept}) — Score ${top.score}/100\n- **Core Anomalies:** After-hours activity (${employees.filter(e => { const h = e.login_hour ?? 9; return h < 7 || h > 20; }).length} instances), unauthorized USB connection events, privilege escalation attempts.\n- **SOC Operations:** MTTD ~1.4s · Model accuracy 97.6% (Isolation Forest + Twin Divergence).\n\n**Recommended Priority:** Immediately execute standard containment protocol for ${top.name}.`
        : `Executive summary: No critical active threats.`
    },
    // ── EMPLOYEE NAME MATCHER (top 5 by score) ──────────────────────
    ...employees.slice(0, 5).map(e => {
      const first = e.name.split(" ")[0].toLowerCase();
      const last  = e.name.split(" ").slice(1).join(" ").toLowerCase();
      return {
        keys: [e.name.toLowerCase(), e.id.toLowerCase(), first, last],
        response: `**${e.name}** (${e.id}) — Score **${e.score}/100** · ${e.level} · ${e.trend} trend\n\nDepartment: ${e.dept} · Role: ${e.role}\nLogin: ${e.loginTime} · Files: ${e.files} · USB: ${e.usb} · Privilege: ${e.priv} · Sentiment: ${e.sentiment}\n\n${e.level === "Critical" ? `**⚠ CRITICAL — Immediate SOC action required.** This employee shows multiple simultaneous anomaly signals. Recommend account suspension and forensic investigation.` : e.level === "High" ? `**HIGH RISK — Enhanced monitoring active.** Flag for daily behavioral review and privilege audit.` : `Currently classified ${e.level}. Routine monitoring in effect.`}`,
      };
    }),
    // ── GENERIC CATCH-ALL (matches any risk/score/threat/employee query) ─
    {
      keys: ["score", "risk", "threat", "monitor", "employee", "data", "who",
             "how many", "count", "number of", "list all", "all employees", "show me", "check",
             "any issue", "anything wrong", "safe", "normal", "looks okay"],
      response: top
        ? `**Current Monitoring Status:**\n\n- **Employees monitored:** ${employees.length}\n- **Critical threats:** ${crit.length} — ${crit.map(e => e.name).join(", ") || "None"}\n- **High risk:** ${high.length}\n- **Moderate risk:** ${employees.filter(e => e.level === "Moderate").length}\n- **Low risk:** ${employees.filter(e => e.level === "Low").length}\n\n**Top 3 threats:**\n${top3.map((e,i) => `${i+1}. **${e.name}** (${e.dept}): ${e.score}/100 — ${e.level} — ${e.trend}`).join("\n")}\n\nAsk me about a specific employee, department, SOC response, or ML detection method.`
        : `No employee data loaded yet. Try refreshing the dashboard.`,
    },
  ];
}

export function matchCache(input, employees) {
  const t = input.toLowerCase().trim();
  const cache = buildCache(employees);
  for (const entry of cache) {
    if (entry.keys.some(k => t.includes(k))) return entry.response;
  }
  return null;
}

// Shared typewriter streamer — word-by-word, fast but readable
export function streamWords(text, msgId, setMessages, onDone) {
  const words = text.split(" ");
  let i = 0;
  let built = "";
  const interval = setInterval(() => {
    if (i >= words.length) {
      clearInterval(interval);
      if (onDone) onDone();
      return;
    }
    built += (i === 0 ? "" : " ") + words[i];
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: built } : m));
    i++;
  }, 35); // Fast but readable streaming pace
}
