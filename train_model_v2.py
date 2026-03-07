import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler
import joblib, json, warnings
warnings.filterwarnings("ignore")

RANDOM_SEED     = 42
TRAINING_DAYS   = 25
FEATURE_COLUMNS = ["login_hour","files_accessed","privilege_attempts",
                   "emails_sent","usb_events","sentiment_score"]

np.random.seed(RANDOM_SEED)

# ── Load ─────────────────────────────────
df = pd.read_csv("employee_logs.csv")
print(f"✅ Loaded {len(df)} rows | Columns: {list(df.columns)}")

# ── Train Isolation Forest ────────────────
X_train        = df[df["day"] <= TRAINING_DAYS][FEATURE_COLUMNS]
scaler         = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)

model = IsolationForest(n_estimators=100, contamination=0.05, random_state=RANDOM_SEED)
model.fit(X_train_scaled)
print(f"✅ Model trained on {len(X_train)} rows (days 1–{TRAINING_DAYS})")

# ── Score all rows ────────────────────────
X_all        = df[FEATURE_COLUMNS]
X_all_scaled = scaler.transform(X_all)
raw_scores   = model.decision_function(X_all_scaled)

flipped   = -raw_scores
base_score = ((flipped - flipped.min()) / (flipped.max() - flipped.min())) * 100

access_anomaly   = ((df["files_accessed"]/df["files_accessed"].max() +
                     df["privilege_attempts"]/(df["privilege_attempts"].max()+0.01)) / 2 * 100).values
behavioral_drift = ((np.abs(df["login_hour"]-9)/12 + df["usb_events"]) / 2 * 100).values
sentiment_shift  = ((1 - df["sentiment_score"]) / 2 * 100).values

weighted = 0.40*access_anomaly + 0.35*behavioral_drift + 0.25*sentiment_shift
final    = np.clip(0.5*base_score + 0.5*weighted, 0, 100).round(1)

def label(s):
    if s <= 30:  return "LOW"
    if s <= 60:  return "MODERATE"
    if s <= 85:  return "HIGH"
    return "CRITICAL"

df["risk_score"] = final
df["risk_label"] = df["risk_score"].apply(label)

# ── Save scored CSV ───────────────────────
df.to_csv("employee_logs_scored.csv", index=False)
joblib.dump(model,  "isolation_forest_model.pkl")
joblib.dump(scaler, "scaler.pkl")
print(f"✅ Saved employee_logs_scored.csv")

# ── Build dashboard-ready summary JSON ───
# Per-employee summary: latest day stats + peak score + 30-day timeline
summary = []
for emp_id, grp in df.groupby("employee_id"):
    grp = grp.sort_values("day")
    latest  = grp.iloc[-1]
    peak    = grp["risk_score"].max()
    timeline = grp[["day","risk_score"]].rename(columns={"risk_score":"score"}).to_dict("records")

    # last 5 rogue days avg vs first 25 normal days avg
    normal_avg = grp[grp["day"] <= 25]["risk_score"].mean()
    recent_avg = grp[grp["day"] > 25]["risk_score"].mean() if len(grp[grp["day"]>25]) else normal_avg
    trend = "Rising" if recent_avg > normal_avg + 5 else ("Declining" if recent_avg < normal_avg - 5 else "Stable")

    summary.append({
        "employee_id":  emp_id,
        "name":         latest["name"],
        "initials":     latest["initials"],
        "department":   latest["department"],
        "role":         latest["role"],
        "peak_score":   round(peak, 1),
        "risk_label":   label(peak),
        "trend":        trend,
        "login_hour":   int(latest["login_hour"]),
        "files":        int(latest["files_accessed"]),
        "privilege":    int(latest["privilege_attempts"]),
        "usb":          int(latest["usb_events"]),
        "sentiment":    round(float(latest["sentiment_score"]), 2),
        "timeline":     timeline,
    })

import pathlib

# Sort by peak score descending
summary.sort(key=lambda x: x["peak_score"], reverse=True)

# ── Smart save: writes to BOTH current dir AND Vite public/ folder ────────────
def save_json(path):
    with open(path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"✅ Saved → {path}")

# 1. Always save locally
save_json("employee_summary.json")

# 2. Auto-detect Vite project's public/ folder and save there too
#    This makes it available at http://localhost:5173/employee_summary.json
script_dir = pathlib.Path(__file__).resolve().parent
candidates = [
    script_dir / "public",
    script_dir.parent / "public",
    script_dir / "threatwatch" / "public",
    script_dir.parent / "threatwatch" / "public",
]
for pub in candidates:
    if pub.is_dir():
        save_json(pub / "employee_summary.json")
        break
else:
    print("⚠️  Vite public/ not found. Copy employee_summary.json there manually.")
    print("    (Usually: YourProject/threatwatch/public/employee_summary.json)")

print(f"\n{'─'*55}")
print(f"  EMPLOYEE RISK LEADERBOARD")
print(f"{'─'*55}")
for i, e in enumerate(summary[:8], 1):
    bar = "█" * int(e["peak_score"] / 5)
    print(f"  {i:2}. {e['name']:<22} {e['department']:<14} [{bar:<20}] {e['peak_score']:5.1f}  {e['risk_label']}")
print(f"{'─'*55}")
print(f"\n🔄 Dashboard auto-refreshes within 15s via fetch()")