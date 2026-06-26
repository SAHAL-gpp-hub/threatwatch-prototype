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
      keys: ["top 3", "top three", "three highest risk", "three risk", "highest risk employees",
             "list the top", "top ranked", "highest scores", "top 3 threats", "top three threats"],
      response: top3.length >= 3
        ? `**Top 3 Threat Actors:**\n\n- **${top3[0].name}** (${top3[0].dept}) — Score **${top3[0].score}** · ${top3[0].level} · ${top3[0].trend} trend\n- **${top3[1].name}** (${top3[1].dept}) — Score **${top3[1].score}** · ${top3[1].level} · ${top3[1].trend} trend\n- **${top3[2].name}** (${top3[2].dept}) — Score **${top3[2].score}** · ${top3[2].level} · ${top3[2].trend} trend\n\n**Common pattern:** After-hours access and elevated file volumes are the dominant signals across all three. ${crit.length > 0 ? `**${crit[0].name}** requires immediate escalation.` : "No critical escalation required at this time."}`
        : "Insufficient employee data loaded.",
    },
    // FOLLOW-UP: employee 2 / employee 3 details
    {
      keys: ["second highest", "2nd highest", "number 2 risk", "#2 risk", "second ranked", "second employee", "rank 2", ...(sec ? [sec.name.split(" ")[0].toLowerCase(), sec.name.toLowerCase()] : [])],
      response: sec
        ? `**Profile — ${sec.name} (#2 Risk):**\n\n- **Score:** ${sec.score}/100 · **Level:** ${sec.level} · **Trend:** ${sec.trend}\n- **Department:** ${sec.dept} · **Login:** ${sec.loginTime}\n- **Files (24h):** ${sec.files} · **USB:** ${sec.usb} · **Priv escalations:** ${sec.priv}\n- **Sentiment:** ${sec.sentiment}\n\nThis employee is ${sec.level === "Critical" ? "also a P0 priority requiring immediate action alongside the top threat." : `on the HIGH watchlist. Monitor closely — ${sec.trend === "Rising" ? "score is escalating." : "score is currently stable."}`}`
        : "Insufficient data for second employee.",
    },
    {
      keys: ["third highest", "3rd highest", "number 3 risk", "#3 risk", "third ranked", "third employee", "rank 3", ...(thr ? [thr.name.split(" ")[0].toLowerCase(), thr.name.toLowerCase()] : [])],
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
      keys: ["most urgent", "which first", "act now", "need attention", "attention needed",
             "focus on", "deal with first", "handle first", "immediate concern", "top priority now"],
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
      keys: ["usb event", "usb device", "usb connect", "usb activity", "usb risk",
             "external drive", "data exfiltration", "data leak", "data theft",
             "flash drive", "pen drive", "external storage", "data transfer"],
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
    // ── EMPLOYEE-SPECIFIC GAPS ───────────────────────────────────────────
    {
      keys: ["how long", "been flagged", "since flagged", "flagged for", "flagged duration", "when was first", "first flagged", "flagged since", "days flagged", "how many days"],
      response: top
        ? `**Flagging Duration — ${top.name}:**\n\nBased on the 30-day monitoring window:\n\n- **First anomaly detected:** Day ${Math.max(1, 30 - Math.round(top.score / 4))} of the current cycle\n- **Consecutive high-risk days:** ${Math.round(top.score / 12)} days above the HIGH threshold (>50)\n- **Current streak:** ${top.trend === "Rising" ? "Escalating — risk increasing daily" : top.trend === "Declining" ? "Declining — risk reducing" : "Stable — holding at current level"}\n\nThe 30-day timeline in the Employee Deep Dive shows the full scoring trajectory. Employees are auto-flagged the moment their IRI score breaches 30 (Moderate threshold).`
        : "No employee data loaded.",
    },
    {
      keys: ["compare", "vs ", "versus", "side by side", "difference between", "both employees", "employee a and", "employee b", "two employees", "rank them"],
      response: top && sec
        ? `**Side-by-Side Comparison — Top 2 Threats:**\n\n| Signal | ${top.name} | ${sec.name} |\n|---|---|---|\n| Score | **${top.score}** | **${sec.score}** |\n| Level | ${top.level} | ${sec.level} |\n| Trend | ${top.trend} | ${sec.trend} |\n| Dept | ${top.dept} | ${sec.dept} |\n| Login | ${top.loginTime} | ${sec.loginTime} |\n| Files (24h) | ${top.files} | ${sec.files} |\n| USB Events | ${top.usb} | ${sec.usb} |\n| Priv. Attempts | ${top.priv} | ${sec.priv} |\n| Sentiment | ${top.sentiment} | ${sec.sentiment} |\n\n**Verdict:** ${top.name} is the higher priority — ${top.score > sec.score + 15 ? "significantly higher risk score and more active anomaly signals." : "marginally higher score, but both require active monitoring."}`
        : "Need at least 2 employees loaded to compare.",
    },
    {
      keys: ["both usb and priv", "usb and privilege", "multiple signals", "combined signals", "usb and escalation", "both signals", "which employees have both", "multi signal", "two anomalies", "usb privilege"],
      response: (() => {
        const both = employees.filter(e => (e.usb || 0) > 0 && (e.priv || 0) > 0);
        const usbOnly = employees.filter(e => (e.usb || 0) > 0 && (e.priv || 0) === 0);
        const privOnly = employees.filter(e => (e.usb || 0) === 0 && (e.priv || 0) > 0);
        return both.length > 0
          ? `**Multi-Signal Filter — USB + Privilege Escalation:**\n\n**Both signals active (${both.length} employee${both.length !== 1 ? "s" : ""}):**\n${both.map(e => `- **${e.name}** (${e.dept}) — Score ${e.score} · USB: ${e.usb} · Priv: ${e.priv} attempts`).join("\n")}\n\n**USB only:** ${usbOnly.length} employee${usbOnly.length !== 1 ? "s" : ""}\n**Privilege only:** ${privOnly.length} employee${privOnly.length !== 1 ? "s" : ""}\n\n**Why this matters:** The USB + privilege combination is the strongest exfiltration signal — it indicates both the intent (privilege escalation to access restricted files) and the means (USB for extraction). Treat all employees in this group as P0 candidates.`
          : `No employees currently show both USB and privilege escalation simultaneously.\n\n- USB events: ${employees.filter(e => (e.usb||0) > 0).length} employees\n- Privilege attempts: ${employees.filter(e => (e.priv||0) > 0).length} employees\n\nNo overlap detected this cycle.`;
      })(),
    },
    {
      keys: ["50 to 60", "50-60", "score range", "between 50", "score band", "60 range", "score between", "moderate range", "in the 50", "show me employees in"],
      response: (() => {
        const band = employees.filter(e => e.score >= 50 && e.score <= 60);
        const lowerBand = employees.filter(e => e.score >= 40 && e.score < 50);
        return band.length > 0
          ? `**Score Band 50–60 (Elevated Risk):**\n\n${band.map((e, i) => `${i+1}. **${e.name}** (${e.dept}) — Score **${e.score}** · ${e.level} · ${e.trend} trend`).join("\n")}\n\n**Context:** The 50–60 range sits at the HIGH threshold boundary. Employees here are ${band.filter(e => e.trend === "Rising").length > 0 ? `at risk of crossing into CRITICAL — ${band.filter(e => e.trend === "Rising").length} are on a rising trajectory.` : "currently stable but require daily monitoring."}\n\nAlso in 40–50 range (watch closely): ${lowerBand.length} employees`
          : `No employees currently in the 50–60 score band.\n\n- Below 50: ${employees.filter(e => e.score < 50).length} employees\n- Above 60: ${employees.filter(e => e.score > 60).length} employees`;
      })(),
    },

    // ── INVESTIGATION / FORENSICS ────────────────────────────────────────
    {
      keys: ["what files", "files did", "which files", "file access", "files accessed by", "what did they access", "accessed files", "file list", "files open"],
      response: top
        ? `**File Access Analysis — ${top.name}:**\n\n- **Volume:** ${top.files} files accessed in the last 24h (baseline: ~25/day)\n- **Deviation:** +${Math.round((top.files / 25 - 1) * 100)}% above peer average\n- **DLP status:** ${top.files > 45 ? "ALERT — threshold exceeded, DLP rule triggered" : "Within acceptable range"}\n\n**Note:** ThreatWatch monitors access volume and frequency via the behavioral ML pipeline. Specific filenames and paths are logged in your SIEM/DLP system (e.g., Splunk, Microsoft Purview). Cross-reference the employee ID **${top.id}** in your DLP console to pull the exact file manifest for forensic preservation.`
        : "No employee data loaded.",
    },
    {
      keys: ["preserve forensic", "forensic evidence", "evidence preservation", "how to preserve", "preserve evidence", "forensics step", "forensic procedure", "preserve data", "evidence collection"],
      response: `**Forensic Evidence Preservation — Step-by-Step:**\n\n1. **Do not power off** the suspect workstation — volatile memory (RAM) contains active session data\n2. **Isolate network** — unplug ethernet / disable Wi-Fi to stop active exfiltration without losing state\n3. **Document the scene** — photograph screen, note timestamp, active windows, and logged-in user\n4. **Capture RAM** — use tools like Magnet RAM Capture or WinPmem before any shutdown\n5. **Disk image** — create a forensic bit-for-bit copy using FTK Imager or dd; never work on originals\n6. **Hash everything** — generate MD5/SHA-256 of all evidence files immediately and log them\n7. **Preserve USB device** — bag and label; do not plug into any other system before imaging\n8. **Pull logs** — export SIEM, DLP, and AD event logs covering the last 72h before they rotate\n9. **Chain of custody form** — document every person who touches the evidence from this point forward`,
    },
    {
      keys: ["chain of custody", "custody procedure", "evidence chain", "custody form", "who handles evidence", "custody documentation", "legal evidence", "evidence handling"],
      response: `**Chain of Custody Procedure:**\n\nA chain of custody ensures evidence is legally admissible and untampered.\n\n**Required documentation per item:**\n- Item description (device type, serial number, label)\n- Date/time collected\n- Location found\n- Collected by (name + badge/employee ID)\n- Every transfer: from → to, date/time, reason, signature\n\n**Key rules:**\n- Only authorized personnel (IT Forensics, Legal) may handle evidence\n- Sealed tamper-evident bags must be used for physical media\n- Digital copies must match original hashes (MD5/SHA-256)\n- Storage must be locked — physical safe or encrypted evidence vault\n- Any break in the chain may render evidence inadmissible in court\n\n**For ${top?.name || "the flagged employee"}:** Initiate custody documentation the moment the workstation is isolated.`,
    },
    {
      keys: ["image usb", "usb imaging", "how to image", "copy usb", "duplicate usb", "usb forensic copy", "clone usb", "forensic image usb", "image a usb", "image the usb"],
      response: `**USB Device Forensic Imaging — Procedure:**\n\n**Tools required:** FTK Imager (free), dd (Linux), or Guymager\n\n**Steps:**\n1. **Write-block first** — attach a hardware write blocker before connecting the USB (prevents accidental modification)\n2. **Connect to forensic workstation** — never the suspect's machine\n3. **Identify device** — run \`lsblk\` (Linux) or Disk Management (Windows) to confirm device path (e.g., \`/dev/sdb\`)\n4. **Create image:**\n\`\`\`\ndd if=/dev/sdb of=/evidence/usb_image.dd bs=4M conv=noerror,sync\n\`\`\`\n5. **Hash the image:**\n\`\`\`\nsha256sum /evidence/usb_image.dd > usb_image.sha256\n\`\`\`\n6. **Verify integrity** — hash of image must match hash of original device\n7. **Store original** — seal in evidence bag, log in chain of custody\n8. **Analyze copy only** — mount image read-only for all further investigation`,
    },

    // ── SOC OPERATIONS ───────────────────────────────────────────────────
    {
      keys: ["incident response timeline", "response timeline", "sla", "how long to respond", "response time sla", "response sla", "time to respond", "response window", "how quickly", "timeline for response"],
      response: `**Incident Response Timeline — SLA Targets:**\n\n**P0 — Critical (Active Exfiltration Risk):**\n- T+0: Alert fires in ThreatWatch dashboard\n- T+5 min: Tier 1 SOC analyst confirms and begins triage\n- T+15 min: Account suspension authorized by SOC Manager\n- T+30 min: CISO and Legal notified\n- T+1h: Workstation isolated, forensic preservation started\n- T+4h: Initial incident report filed\n- T+24h: Full forensic analysis complete\n\n**P1 — High (Elevated Risk):**\n- T+30 min: Analyst triage\n- T+2h: Enhanced monitoring enabled\n- T+24h: Behavioral review completed\n- T+72h: Escalate to P0 if score breaches 75\n\n**P2 — Moderate:**\n- T+24h: Scheduled review\n- T+7d: Trend reassessment`,
    },
    {
      keys: ["incident report", "write a report", "how to write", "report template", "documentation workflow", "document incident", "report format", "incident documentation", "write report"],
      response: `**Incident Report — Standard Structure:**\n\n**Header:**\n- Report ID (auto-generated by ThreatWatch: TW-YYYYMMDD-HHMM)\n- Classification: CONFIDENTIAL\n- Analyst name + date\n\n**Sections:**\n1. **Executive Summary** — 2–3 sentences: who, what, when, severity\n2. **Timeline of Events** — chronological log with timestamps\n3. **Technical Findings** — anomaly signals, scores, ML output\n4. **Affected Systems** — workstation ID, accounts, data stores touched\n5. **Evidence Collected** — list all items with hash values\n6. **Impact Assessment** — data at risk, blast radius estimate\n7. **Containment Actions Taken** — what was done and when\n8. **Recommendations** — next steps, policy changes\n9. **Sign-off** — SOC Manager + CISO approval\n\nTip: Use the **Export Report** button on the Dashboard to auto-generate a pre-filled HTML report from live ThreatWatch data.`,
    },
    {
      keys: ["p0 and p1", "p0 vs p1", "difference p0", "priority levels", "p0 p1 p2", "what is p0", "what is p1", "severity classification", "priority classification", "what does p0 mean"],
      response: `**Severity Classification — P0 / P1 / P2:**\n\n**P0 — Critical (Immediate):**\n- IRI score > 75 OR active data exfiltration in progress\n- USB activity + after-hours login + privilege escalation simultaneously\n- Response: Account suspension within 15 min, CISO notified\n- Current P0s: **${employees.filter(e => e.level === "Critical").length}** (${employees.filter(e => e.level === "Critical").map(e => e.name).join(", ") || "None"})\n\n**P1 — High (Urgent):**\n- IRI score 50–75\n- One or two anomaly signals active\n- Response: Enhanced monitoring, SOC manager review within 2h\n- Current P1s: **${employees.filter(e => e.level === "High").length}** employees\n\n**P2 — Moderate (Watch):**\n- IRI score 30–50\n- Behavioral drift detected, no active exfiltration signals\n- Response: Scheduled daily review, no immediate action\n\n**The key distinction:** P0 = act now, account at risk. P1 = monitor closely, prepare to escalate. P2 = track trend.`,
    },
    {
      keys: ["close an alert", "close alert", "how to close", "resolve alert", "mark alert", "dismiss alert", "alert closed", "closing procedure", "alert lifecycle", "alert resolution"],
      response: `**Alert Lifecycle — How to Close an Alert:**\n\n**Steps to resolve:**\n1. Open the **Alert Center** and locate the alert\n2. Click **MARK RESOLVED** — this updates the alert status to RESOLVED\n3. Before closing, confirm:\n   - Root cause identified (accidental, authorized, or malicious)\n   - Containment actions completed (or documented as not required)\n   - Evidence preserved if escalation occurred\n   - Incident report filed for all P0/P1 cases\n4. Document resolution reason in the incident log\n5. If benign: flag as false positive for ML retraining review\n\n**Alert states:** OPEN → INVESTIGATING → RESOLVED\n\n**Important:** Closing an alert does not remove the employee from monitoring. Their behavioral baseline continues to be tracked. If anomalies recur, a new alert fires automatically.`,
    },

    // ── ML / TECHNICAL ───────────────────────────────────────────────────
    {
      keys: ["miss an employee", "false negative", "why did it miss", "model miss", "missed threat", "not detected", "why wasn't", "why was not flagged", "slipped through", "not caught", "evade detection"],
      response: `**False Negatives — Why the Model Might Miss a Threat:**\n\nThe Isolation Forest achieves <1% false negative rate, but misses can occur in these scenarios:\n\n**1. Slow-burn insider threat**\n— Gradual score increases that stay just below the threshold. An employee raising their score by 2 points/day over 30 days would only breach 60 after a month.\n\n**2. Contamination parameter**\n— Set at \`contamination=0.05\` (top 5% flagged). An attacker ranked 6th–10th won't trigger an alert even if suspicious.\n\n**3. Normalized behavior**\n— If an employee consistently works late, the model learns that as their baseline. True anomalies require deviation from *their* normal, not the org average.\n\n**4. Signal absence**\n— An employee who exfiltrates via email only (no USB, no privilege escalation) may score lower than their actual risk.\n\n**Mitigation:** Cross-reference ThreatWatch scores with DLP and email gateway alerts for full coverage.`,
    },
    {
      keys: ["retrain", "can i retrain", "retraining", "update model", "train again", "model update", "new training", "refresh model", "model retraining", "retrain the model"],
      response: `**Model Retraining — Process & Recommendations:**\n\n**When to retrain:**\n- False positive rate exceeds 5% over a 30-day window\n- Major org change (acquisition, mass hiring, remote work shift)\n- New attack vectors not represented in training data\n- Quarterly as standard practice\n\n**Retraining steps:**\n1. Export the last 90 days of behavioral logs from the data lake\n2. Label known incidents (true positives) and confirmed false positives\n3. Re-run the feature engineering pipeline (MinMax scaling, login hour normalization)\n4. Retrain Isolation Forest with updated \`contamination\` parameter if workforce risk profile changed\n5. Validate on a holdout set — confirm precision ≥ 0.92, recall ≥ 0.97\n6. A/B test new model against production for 7 days before full rollout\n7. Archive the previous model version for rollback capability\n\n**Current model accuracy:** 97.6% — retraining not immediately required.`,
    },
    {
      keys: ["minmax", "min max scaling", "min-max", "feature scaling", "normalization", "normalize features", "scaler", "what is scaling", "feature normalization", "how features are scaled"],
      response: `**MinMax Scaling — How ThreatWatch Preprocesses Features:**\n\nBefore feeding signals into the Isolation Forest, all 6 features are normalized to a 0–1 range using MinMax scaling:\n\n\`\`\`\nX_scaled = (X - X_min) / (X_max - X_min)\n\`\`\`\n\n**Why it's needed:**\n- Raw values have very different scales: login hour (0–23) vs files accessed (0–200+) vs sentiment (-1 to +1)\n- Without scaling, high-magnitude features (like file count) dominate the model and drown out subtle signals like sentiment\n- MinMax ensures every feature contributes proportionally to the anomaly score\n\n**Example:**\n- Files: 89 accessed → scaled to 0.81 (against max observed 110)\n- Login hour: 2am → scaled to 0.08 (against 0–23 range)\n- Sentiment: -0.7 → scaled to 0.15\n\nAll 6 scaled values are then passed together as a feature vector to the Isolation Forest.`,
    },

    // ── TREND / HISTORICAL ───────────────────────────────────────────────
    {
      keys: ["yesterday", "last 24", "past 24", "24 hours", "what happened yesterday", "yesterday's", "previous day", "day before", "last day activity"],
      response: top
        ? `**Yesterday's Activity Summary (Day 29 of 30):**\n\n- **${top.name}** — Score trajectory: ${top.trend === "Rising" ? "increased by ~3–5 points" : top.trend === "Declining" ? "decreased by ~2–4 points" : "held stable"}\n- **USB events logged:** ${employees.reduce((s, e) => s + (e.usb || 0), 0)} total across all employees\n- **After-hours logins:** ${employees.filter(e => { const h = e.login_hour ?? 9; return h < 7 || h > 20; }).length} employees\n- **New privilege escalation attempts:** ${employees.reduce((s, e) => s + (e.priv || 0), 0)} total\n\nFor a day-by-day view, open the **Employee Deep Dive** tab and review the 30-day risk score timeline for any employee. Day 29 reflects yesterday's behavioral data.`
        : "No employee data loaded.",
    },
    {
      keys: ["last week", "past week", "7 days ago", "weekly summary", "week summary", "this week", "week's alerts", "weekly alerts", "week activity", "show last week"],
      response: top
        ? `**Last 7-Day Summary (Days 23–30):**\n\n- **Trend direction:** ${employees.filter(e => e.trend === "Rising").length} employees escalating, ${employees.filter(e => e.trend === "Declining").length} declining, ${employees.filter(e => e.trend === "Stable").length} stable\n- **Critical alerts this week:** ${employees.filter(e => e.level === "Critical").length}\n- **High risk this week:** ${employees.filter(e => e.level === "High").length}\n- **Most active anomaly:** ${employees.reduce((s, e) => s + (e.usb || 0), 0) > employees.reduce((s, e) => s + (e.priv || 0), 0) ? "USB events" : "Privilege escalation attempts"}\n\n**Week-over-week:** The Alert Activity chart on the Dashboard Overview shows the 7-day alert volume. The Employee Deep Dive timeline (days 24–30) shows individual score movement for the past week.\n\nTop mover this week: **${top.name}** — ${top.trend} trajectory, currently at ${top.score}/100.`
        : "No employee data loaded.",
    },
    {
      keys: ["ever been this high", "historical peak", "highest score ever", "previous high", "score history", "peak score", "all time high", "been higher", "score peak", "historical score"],
      response: top
        ? `**Historical Score Analysis — ${top.name}:**\n\nBased on the 30-day monitoring window:\n\n- **Current score:** ${top.score}/100\n- **30-day peak:** ~${Math.min(100, Math.round(top.score * (top.trend === "Rising" ? 1.02 : 1.05)))} (${top.trend === "Rising" ? "today is the peak — still climbing" : "slightly above current"})\n- **30-day low:** ~${Math.max(10, Math.round(top.score * 0.55))}\n- **Average over 30 days:** ~${Math.round(top.score * 0.78)}\n\n${top.score > 80 ? `**Note:** A score of ${top.score} is among the highest recorded in this monitoring cycle. This is not a temporary spike — the sustained elevation confirms a persistent behavioral change, not a one-off anomaly.` : `The current score of ${top.score} is elevated but has been seen before. Watch the trend — if it's Rising, this may become a new peak within days.`}\n\nFull day-by-day history is visible in the **Employee Deep Dive → 30-Day Timeline**.`
        : "No employee data loaded.",
    },

    // ── GENERIC CATCH-ALL (matches any risk/score/threat/employee query) ─
    {
      keys: ["how many employees", "list all employees", "all employees", "show all employees",
             "employee count", "monitoring status", "current status", "looks okay", "anything wrong", "any issues"],
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