import streamlit as st
import pandas as pd
import numpy as np
import joblib
import time
from sklearn.preprocessing import MinMaxScaler

# ─────────────────────────────────────────
#  PAGE CONFIG — must be first streamlit call
# ─────────────────────────────────────────

st.set_page_config(
    page_title  = "INSIGHT — Insider Threat Detection",
    page_icon   = "🛡️",
    layout      = "wide",
    initial_sidebar_state = "expanded"
)

# ─────────────────────────────────────────
#  CUSTOM CSS — dark cybersecurity theme
# ─────────────────────────────────────────

st.markdown("""
<style>
    /* Main background */
    .stApp { background-color: #050810; color: #e8ecf5; }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #0a0f1e;
        border-right: 1px solid #1a2540;
    }

    /* Metric cards */
    [data-testid="metric-container"] {
        background-color: #0a0f1e;
        border: 1px solid #1a2540;
        border-radius: 6px;
        padding: 16px;
    }

    /* Buttons */
    .stButton > button {
        background-color: #ff3f6c;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 12px 24px;
        width: 100%;
        font-size: 16px;
    }

    .stButton > button:hover {
        background-color: #ff1a52;
        transform: translateY(-1px);
    }

    /* Headers */
    h1, h2, h3 { color: #e8ecf5 !important; }

    /* Risk badge colors */
    .badge-critical {
        background: rgba(255,63,108,0.15);
        border: 1px solid #ff3f6c;
        color: #ff3f6c;
        padding: 3px 12px;
        border-radius: 3px;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 1px;
    }
    .badge-high {
        background: rgba(240,165,0,0.15);
        border: 1px solid #f0a500;
        color: #f0a500;
        padding: 3px 12px;
        border-radius: 3px;
        font-weight: 700;
        font-size: 12px;
    }
    .badge-moderate {
        background: rgba(108,99,255,0.15);
        border: 1px solid #6c63ff;
        color: #6c63ff;
        padding: 3px 12px;
        border-radius: 3px;
        font-weight: 700;
        font-size: 12px;
    }
    .badge-low {
        background: rgba(0,245,196,0.1);
        border: 1px solid #00f5c4;
        color: #00f5c4;
        padding: 3px 12px;
        border-radius: 3px;
        font-weight: 700;
        font-size: 12px;
    }

    /* Alert banner */
    .alert-banner {
        background: rgba(255,63,108,0.1);
        border: 1px solid #ff3f6c;
        border-left: 4px solid #ff3f6c;
        border-radius: 4px;
        padding: 16px 20px;
        margin: 10px 0;
    }

    /* Terminal-style box */
    .terminal-box {
        background: #000;
        border: 1px solid #1a3a2a;
        border-radius: 4px;
        padding: 16px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #00f5c4;
        line-height: 1.8;
    }

    /* Section label */
    .section-label {
        font-size: 11px;
        letter-spacing: 3px;
        color: #6b7a9e;
        text-transform: uppercase;
        margin-bottom: 8px;
    }

    /* Divider */
    hr { border-color: #1a2540; }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────
#  LOAD DATA & MODEL
#  st.cache_data means it only loads once
#  not on every click — keeps dashboard fast
# ─────────────────────────────────────────

@st.cache_data
def load_data():
    return pd.read_csv("employee_logs_scored.csv")

@st.cache_resource
def load_model():
    model  = joblib.load("isolation_forest_model.pkl")
    scaler = joblib.load("scaler.pkl")
    return model, scaler

df             = load_data()
model, scaler  = load_model()

FEATURE_COLUMNS = [
    "login_hour", "files_accessed", "privilege_attempts",
    "emails_sent", "usb_events", "sentiment_score"
]

# ─────────────────────────────────────────
#  HELPER — Score a single new row
#  Used by the Live Demo button in Screen 3
# ─────────────────────────────────────────

def score_new_row(row_dict):
    """Takes a dict of feature values, returns risk score 0-100"""
    row_df     = pd.DataFrame([row_dict])[FEATURE_COLUMNS]
    row_scaled = scaler.transform(row_df)
    raw        = model.decision_function(row_scaled)[0]

    # Same formula as train_model.py
    flipped    = -raw
    base       = np.clip((flipped + 0.2) / 0.4 * 100, 0, 100)

    access     = min((row_dict["files_accessed"] / 260 + row_dict["privilege_attempts"] / 10) / 2 * 100, 100)
    drift      = min((abs(row_dict["login_hour"] - 9) / 12 + row_dict["usb_events"]) / 2 * 100, 100)
    sentiment  = (1 - row_dict["sentiment_score"]) / 2 * 100

    weighted   = 0.40 * access + 0.35 * drift + 0.25 * sentiment
    final      = np.clip(0.5 * base + 0.5 * weighted, 0, 100)
    return round(final, 1)


def label_risk(score):
    if score <= 30:   return "LOW",      "🟢"
    elif score <= 60: return "MODERATE", "🟡"
    elif score <= 85: return "HIGH",     "🔴"
    else:             return "CRITICAL", "🚨"


# ─────────────────────────────────────────
#  SIDEBAR — Navigation
# ─────────────────────────────────────────

with st.sidebar:
    st.markdown("## 🛡️ INSIGHT")
    st.markdown('<div class="section-label">Behavioral Intelligence System</div>', unsafe_allow_html=True)
    st.markdown("---")

    screen = st.radio(
        "Navigate",
        ["📊  Leaderboard",
         "🔍  Employee Deep Dive",
         "🚨  Alert Panel & Live Demo"],
        label_visibility="collapsed"
    )

    st.markdown("---")

    # Sidebar stats
    total_emp      = df["employee_id"].nunique()
    critical_count = df[df["risk_label"] == "CRITICAL"]["employee_id"].nunique()
    high_count     = df[df["risk_label"] == "HIGH"]["employee_id"].nunique()

    st.metric("Total Employees",  total_emp)
    st.metric("🚨 Critical",      critical_count)
    st.metric("🔴 High Risk",     high_count)

    st.markdown("---")
    st.markdown('<div class="section-label">System Status</div>', unsafe_allow_html=True)
    st.success("● Model Active")
    st.info(f"● Last scored: Day 30")


# ════════════════════════════════════════════
#
#  SCREEN 1 — EMPLOYEE LEADERBOARD
#
# ════════════════════════════════════════════

if screen == "📊  Leaderboard":

    st.markdown("# 📊 Employee Risk Leaderboard")
    st.markdown('<div class="section-label">All employees ranked by peak risk score — current monitoring period</div>', unsafe_allow_html=True)
    st.markdown("---")

    # ── Top KPI row ──
    col1, col2, col3, col4 = st.columns(4)

    peak_scores    = df.groupby("employee_id")["risk_score"].max()
    avg_score      = df.groupby("employee_id")["risk_score"].mean()

    with col1:
        st.metric("👥 Employees Monitored", df["employee_id"].nunique())
    with col2:
        st.metric("🚨 Critical Alerts",
                  df[df["risk_label"] == "CRITICAL"]["employee_id"].nunique(),
                  delta="Requires immediate action",
                  delta_color="inverse")
    with col3:
        st.metric("📈 Highest Risk Score",
                  f"{peak_scores.max():.1f} / 100",
                  delta=df.loc[df["risk_score"] == peak_scores.max(), "employee_id"].values[0])
    with col4:
        st.metric("📊 Fleet Average Score",
                  f"{avg_score.mean():.1f} / 100")

    st.markdown("---")

    # ── Build leaderboard table ──
    leaderboard = (
        df.groupby("employee_id")
        .agg(
            peak_score   = ("risk_score",  "max"),
            avg_score    = ("risk_score",  "mean"),
            days_flagged = ("risk_label",  lambda x: (x.isin(["HIGH","CRITICAL"])).sum())
        )
        .reset_index()
        .sort_values("peak_score", ascending=False)
        .reset_index(drop=True)
    )

    leaderboard["peak_score"] = leaderboard["peak_score"].round(1)
    leaderboard["avg_score"]  = leaderboard["avg_score"].round(1)
    leaderboard["rank"]       = range(1, len(leaderboard) + 1)

    # Add risk label column
    leaderboard["risk_level"] = leaderboard["peak_score"].apply(
        lambda s: label_risk(s)[0]
    )

    # ── Display each row with color coding ──
    st.markdown("### 🏆 Risk Rankings")

    for _, row in leaderboard.iterrows():
        label, icon = label_risk(row["peak_score"])

        # Color the row based on risk
        if label == "CRITICAL":
            bg = "rgba(255,63,108,0.08)"; border = "#ff3f6c"; badge_class = "badge-critical"
        elif label == "HIGH":
            bg = "rgba(240,165,0,0.08)";  border = "#f0a500"; badge_class = "badge-high"
        elif label == "MODERATE":
            bg = "rgba(108,99,255,0.08)"; border = "#6c63ff"; badge_class = "badge-moderate"
        else:
            bg = "rgba(0,245,196,0.04)";  border = "#1a2540"; badge_class = "badge-low"

        col_rank, col_emp, col_score, col_avg, col_days, col_badge = st.columns([0.5, 1.5, 1.5, 1.5, 1, 1])

        with col_rank:
            st.markdown(f"**#{int(row['rank'])}**")
        with col_emp:
            st.markdown(f"**{row['employee_id']}**")
        with col_score:
            st.markdown(f"Peak: **{row['peak_score']}**")
        with col_avg:
            st.markdown(f"Avg: **{row['avg_score']}**")
        with col_days:
            st.markdown(f"⚠️ {int(row['days_flagged'])} days")
        with col_badge:
            st.markdown(f'<span class="{badge_class}">{icon} {label}</span>',
                       unsafe_allow_html=True)

        # Progress bar as visual risk indicator
        bar_color = border
        st.progress(row["peak_score"] / 100)
        st.markdown('<div style="margin-bottom:4px;"></div>', unsafe_allow_html=True)


# ════════════════════════════════════════════
#
#  SCREEN 2 — EMPLOYEE DEEP DIVE
#
# ════════════════════════════════════════════

elif screen == "🔍  Employee Deep Dive":

    st.markdown("# 🔍 Employee Behavioral Analysis")
    st.markdown('<div class="section-label">30-day risk timeline + behavioral signal breakdown</div>', unsafe_allow_html=True)
    st.markdown("---")

    # Employee selector
    all_employees = sorted(df["employee_id"].unique())
    selected_emp  = st.selectbox(
        "Select Employee",
        all_employees,
        index=all_employees.index("EMP-007")  # Default to threat actor
    )

    emp_data      = df[df["employee_id"] == selected_emp].sort_values("day")
    peak          = emp_data["risk_score"].max()
    current_label, current_icon = label_risk(peak)

    # ── Employee header ──
    col_info, col_status = st.columns([3, 1])

    with col_info:
        st.markdown(f"## {selected_emp}")
        st.markdown(f"**30-day monitoring period** &nbsp;|&nbsp; **{len(emp_data)} daily records**")

    with col_status:
        if current_label == "CRITICAL":
            st.error(f"🚨 {current_label}\nPeak Score: {peak}")
        elif current_label == "HIGH":
            st.warning(f"🔴 {current_label}\nPeak Score: {peak}")
        elif current_label == "MODERATE":
            st.info(f"🟡 {current_label}\nPeak Score: {peak}")
        else:
            st.success(f"🟢 {current_label}\nPeak Score: {peak}")

    st.markdown("---")

    # ── 30-day risk score timeline ──
    st.markdown("### 📈 Risk Score Timeline — 30 Days")

    import plotly.graph_objects as go

    fig = go.Figure()

    # Safe zone band (0-30)
    fig.add_hrect(y0=0,  y1=30,  fillcolor="rgba(0,245,196,0.05)",  line_width=0, annotation_text="LOW",      annotation_position="left")
    fig.add_hrect(y0=30, y1=60,  fillcolor="rgba(108,99,255,0.05)", line_width=0, annotation_text="MODERATE", annotation_position="left")
    fig.add_hrect(y0=60, y1=85,  fillcolor="rgba(240,165,0,0.05)",  line_width=0, annotation_text="HIGH",     annotation_position="left")
    fig.add_hrect(y0=85, y1=100, fillcolor="rgba(255,63,108,0.08)", line_width=0, annotation_text="CRITICAL", annotation_position="left")

    # Color each point by risk label
    point_colors = emp_data["risk_score"].apply(
        lambda s: "#ff3f6c" if s > 85 else ("#f0a500" if s > 60 else ("#6c63ff" if s > 30 else "#00f5c4"))
    )

    # Line
    fig.add_trace(go.Scatter(
        x    = emp_data["day"],
        y    = emp_data["risk_score"],
        mode = "lines+markers",
        name = "Risk Score",
        line = dict(color="#00f5c4", width=2),
        marker = dict(color=point_colors, size=8, line=dict(width=1, color="#050810")),
        hovertemplate = "Day %{x}<br>Risk Score: %{y}<extra></extra>"
    ))

    # Mark the spike day if critical
    if peak > 85:
        spike_day = emp_data.loc[emp_data["risk_score"].idxmax(), "day"]
        fig.add_vline(
            x=spike_day,
            line_dash="dash",
            line_color="#ff3f6c",
            annotation_text=f"🚨 SPIKE Day {int(spike_day)}",
            annotation_font_color="#ff3f6c"
        )

    fig.update_layout(
        plot_bgcolor  = "#0a0f1e",
        paper_bgcolor = "#050810",
        font_color    = "#e8ecf5",
        xaxis = dict(title="Day", gridcolor="#1a2540", range=[1, 30]),
        yaxis = dict(title="Risk Score (0–100)", gridcolor="#1a2540", range=[0, 100]),
        height = 380,
        margin = dict(l=60, r=40, t=20, b=40),
        showlegend = False
    )

    st.plotly_chart(fig, use_container_width=True)

    # ── Last 5 days behavioral signals ──
    st.markdown("---")
    st.markdown("### 🔬 Behavioral Signal Breakdown — Last 5 Days")

    last5 = emp_data.tail(5)[
        ["day", "login_hour", "files_accessed", "privilege_attempts",
         "emails_sent", "usb_events", "sentiment_score", "risk_score", "risk_label"]
    ].copy()

    # Normal baselines for comparison
    normal_data    = df[df["day"] <= 25]
    normal_means   = normal_data[FEATURE_COLUMNS].mean()

    col_a, col_b = st.columns(2)

    with col_a:
        st.markdown("**📋 Raw Values (Last 5 Days)**")
        st.dataframe(
            last5.set_index("day"),
            use_container_width=True,
            height=220
        )

    with col_b:
        st.markdown("**📊 Deviation From Normal Baseline**")

        for feat in FEATURE_COLUMNS:
            emp_avg    = emp_data.tail(5)[feat].mean()
            norm_avg   = normal_means[feat]
            deviation  = ((emp_avg - norm_avg) / (norm_avg + 0.01)) * 100

            label_text = f"{feat.replace('_',' ').title()}"
            delta_text = f"{deviation:+.0f}% vs baseline"

            if abs(deviation) > 50:
                st.metric(label_text, f"{emp_avg:.2f}", delta=delta_text, delta_color="inverse")
            else:
                st.metric(label_text, f"{emp_avg:.2f}", delta=delta_text)

    # ── Why flagged explanation ──
    if peak > 60:
        st.markdown("---")
        st.markdown("### 🧠 Why Was This Employee Flagged? (Explainable AI)")

        last_row = emp_data.iloc[-1]
        reasons  = []

        if last_row["login_hour"] < 6 or last_row["login_hour"] > 20:
            reasons.append(f"⏰ **Unusual login time** — logged in at {int(last_row['login_hour'])}:00 (normal: 8–10am)")
        if last_row["files_accessed"] > 80:
            reasons.append(f"📁 **Mass file access** — opened {int(last_row['files_accessed'])} files (normal avg: ~20/day)")
        if last_row["privilege_attempts"] > 3:
            reasons.append(f"🔐 **Privilege escalation** — {int(last_row['privilege_attempts'])} attempts to access restricted areas")
        if last_row["usb_events"] == 1:
            reasons.append(f"💾 **USB activity detected** — external drive connected")
        if last_row["sentiment_score"] < 0:
            reasons.append(f"💬 **Hostile communication** — email sentiment score: {last_row['sentiment_score']} (normal: ~+0.5)")

        for r in reasons:
            st.markdown(
                f'<div class="alert-banner">{r}</div>',
                unsafe_allow_html=True
            )

        st.markdown(
            '<div class="section-label" style="margin-top:12px;">INSIGHT assists security teams — it does not replace human judgment. All alerts require HR + Security review.</div>',
            unsafe_allow_html=True
        )


# ════════════════════════════════════════════
#
#  SCREEN 3 — ALERT PANEL + LIVE DEMO BUTTON
#
# ════════════════════════════════════════════

elif screen == "🚨  Alert Panel & Live Demo":

    st.markdown("# 🚨 Alert Panel")
    st.markdown('<div class="section-label">Active threats requiring immediate attention</div>', unsafe_allow_html=True)
    st.markdown("---")

    # ── Active alerts ──
    peak_per_emp = (
        df.groupby("employee_id")["risk_score"]
        .max()
        .reset_index()
        .rename(columns={"risk_score": "peak_score"})
    )

    critical_emps = peak_per_emp[peak_per_emp["peak_score"] > 85].sort_values("peak_score", ascending=False)
    high_emps     = peak_per_emp[(peak_per_emp["peak_score"] > 60) & (peak_per_emp["peak_score"] <= 85)]

    if len(critical_emps) > 0:
        st.markdown("### 🚨 CRITICAL — Immediate Action Required")
        for _, row in critical_emps.iterrows():
            st.markdown(f"""
            <div class="alert-banner">
                <strong>🚨 {row['employee_id']}</strong> &nbsp;|&nbsp;
                Peak Risk Score: <strong>{row['peak_score']:.1f} / 100</strong> &nbsp;|&nbsp;
                Status: <span class="badge-critical">CRITICAL</span> &nbsp;|&nbsp;
                Action: <strong>Escalate to HR + Security immediately</strong>
            </div>
            """, unsafe_allow_html=True)

    if len(high_emps) > 0:
        st.markdown("### 🔴 HIGH — Monitor Closely")
        for _, row in high_emps.iterrows():
            st.markdown(f"""
            <div style="background:rgba(240,165,0,0.08);border:1px solid #f0a500;
                        border-left:4px solid #f0a500;border-radius:4px;
                        padding:12px 20px;margin:8px 0;">
                <strong>🔴 {row['employee_id']}</strong> &nbsp;|&nbsp;
                Peak Score: <strong>{row['peak_score']:.1f}</strong> &nbsp;|&nbsp;
                Action: Increase monitoring frequency
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # ── LIVE DEMO BUTTON — the money moment ──
    st.markdown("### ⚡ Live Threat Simulation")
    st.markdown(
        '<div class="section-label">Press the button below to inject a new suspicious event for EMP-007 and watch the system respond in real time</div>',
        unsafe_allow_html=True
    )
    st.markdown("<br>", unsafe_allow_html=True)

    # Show current score before
    emp007_current = df[df["employee_id"] == "EMP-007"]["risk_score"].iloc[-1]
    label_before, _ = label_risk(emp007_current)

    col_before, col_arrow, col_after = st.columns([2, 0.5, 2])

    with col_before:
        st.markdown("**Before Attack Simulation**")
        st.metric("EMP-001 Risk Score (normal)", "12.4", delta="LOW RISK", delta_color="off")

    with col_arrow:
        st.markdown("<br><br>→", unsafe_allow_html=True)

    # Placeholder for after score
    after_placeholder = col_after.empty()
    after_placeholder.markdown("**After Attack Simulation**")
    after_placeholder.metric("EMP-007 Risk Score", f"{emp007_current:.1f}", delta=label_before)

    st.markdown("<br>", unsafe_allow_html=True)

    # THE BUTTON
    if st.button("🚨  SIMULATE INSIDER ATTACK  🚨"):

        # Show loading animation
        with st.spinner("⚡ Analyzing behavioral anomaly..."):
            time.sleep(1.5)

        # Inject a new rogue event
        rogue_event = {
            "login_hour"          : 2,     # 2am
            "files_accessed"      : 230,   # mass download
            "privilege_attempts"  : 9,     # hitting locked doors
            "emails_sent"         : 58,    # bulk forwarding
            "usb_events"          : 1,     # USB plugged in
            "sentiment_score"     : -0.91  # very hostile
        }

        new_score            = score_new_row(rogue_event)
        new_label, new_icon  = label_risk(new_score)

        # Update the after column dramatically
        with col_after:
            st.markdown("**After Attack Simulation**")
            st.metric(
                "EMP-007 Risk Score",
                f"{new_score} / 100",
                delta=f"▲ {new_score - emp007_current:.1f} SPIKE DETECTED",
                delta_color="inverse"
            )

        # Big result banner
        st.markdown(f"""
        <div style="background:rgba(255,63,108,0.15);border:2px solid #ff3f6c;
                    border-radius:6px;padding:24px;margin:20px 0;text-align:center;">
            <div style="font-size:14px;letter-spacing:3px;color:#ff3f6c;margin-bottom:8px;">
                INSIDER THREAT DETECTED
            </div>
            <div style="font-size:48px;font-weight:900;color:#ff3f6c;">
                {new_score} / 100
            </div>
            <div style="font-size:18px;font-weight:700;color:#ff3f6c;margin-top:8px;">
                🚨 CRITICAL — Escalate Immediately
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Show what triggered it
        st.markdown("### 🧠 What Triggered The Alert?")

        triggers = [
            ("⏰ Login Hour",          "2:00 AM",   "Normal: 8–10 AM",    "#ff3f6c"),
            ("📁 Files Accessed",      "230 files",  "Normal: ~20/day",    "#ff3f6c"),
            ("🔐 Privilege Attempts",  "9 attempts", "Normal: 0–1",        "#ff3f6c"),
            ("💾 USB Event",           "Detected",   "Normal: Rare",       "#ff3f6c"),
            ("💬 Sentiment Score",     "-0.91",      "Normal: +0.5",       "#ff3f6c"),
        ]

        col1, col2 = st.columns(2)
        for i, (signal, value, baseline, color) in enumerate(triggers):
            col = col1 if i % 2 == 0 else col2
            with col:
                st.markdown(f"""
                <div style="background:rgba(255,63,108,0.06);border:1px solid rgba(255,63,108,0.3);
                            border-left:3px solid {color};border-radius:3px;
                            padding:12px 16px;margin:6px 0;">
                    <div style="font-weight:700;font-size:13px;">{signal}</div>
                    <div style="color:{color};font-size:18px;font-weight:900;">{value}</div>
                    <div style="color:#6b7a9e;font-size:11px;">{baseline}</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown(
            '<div class="section-label" style="text-align:center;font-size:13px;color:#6b7a9e;">'
            'INSIGHT detected this anomaly in real time. '
            'All decisions require human review by HR and Security teams.'
            '</div>',
            unsafe_allow_html=True
        )

    st.markdown("---")

    # Recommended actions reference card
    st.markdown("### 📋 Response Playbook")
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        **🚨 CRITICAL**
        - Notify CISO immediately
        - Suspend access temporarily
        - Escalate to HR + Legal
        - Preserve evidence logs
        """)
    with col2:
        st.markdown("""
        **🔴 HIGH**
        - Alert Security team
        - Increase log monitoring
        - Review recent activity
        - Schedule HR check-in
        """)
    with col3:
        st.markdown("""
        **🟡 MODERATE**
        - Log for review
        - Watch next 48 hours
        - Note in employee file
        - No action yet needed
        """)
