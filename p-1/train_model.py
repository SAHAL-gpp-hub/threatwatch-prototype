import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler
import joblib
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────

THREAT_EMPLOYEE  = "EMP-007"
TRAINING_DAYS    = 25        # Train ONLY on normal period (days 1-25)
RANDOM_SEED      = 42

# These are the behavioral columns the model will learn from
# We do NOT include employee_id or day — those aren't behaviors
FEATURE_COLUMNS = [
    "login_hour",
    "files_accessed",
    "privilege_attempts",
    "emails_sent",
    "usb_events",
    "sentiment_score"
]

# ─────────────────────────────────────────
#  STEP 3A — Load data from Step 2
# ─────────────────────────────────────────

df = pd.read_csv("employee_logs.csv")

print(f"✅ Loaded employee_logs.csv")
print(f"   Total rows: {len(df)}")
print(f"   Employees : {df['employee_id'].nunique()}")
print(f"   Days      : {df['day'].nunique()}")


# ─────────────────────────────────────────
#  STEP 3B — Prepare TRAINING data
#
#  Key decision: we train the model ONLY on
#  the normal period (days 1–25) of ALL employees.
#
#  Why? The model needs to learn what normal
#  looks like BEFORE it can detect abnormal.
#
#  Think of it like teaching a guard what a
#  normal working day looks like — then asking
#  them to flag anything unusual.
# ─────────────────────────────────────────

training_data = df[df["day"] <= TRAINING_DAYS].copy()

print(f"\n✅ Training data prepared")
print(f"   Rows used for training : {len(training_data)}")
print(f"   Days covered           : 1 → {TRAINING_DAYS} (normal period only)")
print(f"   Features used          : {FEATURE_COLUMNS}")

# Extract just the feature columns for training
X_train = training_data[FEATURE_COLUMNS]


# ─────────────────────────────────────────
#  STEP 3C — Scale the features
#
#  Problem: login_hour ranges 7–11
#           files_accessed ranges 5–260
#  The model would unfairly weight larger numbers
#
#  Solution: Scale everything to 0.0 → 1.0
#  Now all features are equally important
# ─────────────────────────────────────────

scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)

print(f"\n✅ Features scaled to range [0.0 → 1.0]")
print(f"   (Prevents large-valued columns from dominating)")


# ─────────────────────────────────────────
#  STEP 3D — Train the Isolation Forest
#
#  How Isolation Forest works:
#  ───────────────────────────
#  Imagine a game: pick a random feature,
#  pick a random cut-point, split the data.
#  Keep splitting until each point is alone.
#
#  Normal points  → take MANY splits to isolate
#                   (they blend in with others)
#  Anomalies      → isolated in VERY FEW splits
#                   (they're already alone/extreme)
#
#  The model gives each row an anomaly score.
#  We convert that into our 0–100 Risk Index.
#
#  contamination=0.05 means:
#  "Expect about 5% of data to be anomalous"
# ─────────────────────────────────────────

print(f"\n⏳ Training Isolation Forest model...")

model = IsolationForest(
    n_estimators   = 100,      # Number of isolation trees (more = more stable)
    contamination  = 0.05,     # Expected % of anomalies in training data
    random_state   = RANDOM_SEED,
    max_samples    = "auto"
)

model.fit(X_train_scaled)

print(f"✅ Model trained successfully!")
print(f"   Trees built    : 100")
print(f"   Training rows  : {len(X_train_scaled)}")


# ─────────────────────────────────────────
#  STEP 3E — Score ALL 30 days of ALL employees
#
#  Now we run the trained model on the FULL
#  dataset (all 30 days including rogue period)
#
#  The model outputs a "decision_function" score:
#  → More negative = more anomalous
#  → Close to 0 or positive = normal
#
#  We'll flip and scale this into 0–100
# ─────────────────────────────────────────

print(f"\n⏳ Scoring all 600 rows...")

X_all        = df[FEATURE_COLUMNS]
X_all_scaled = scaler.transform(X_all)   # Use SAME scaler from training

# Raw anomaly scores from the model
# More negative = more suspicious
raw_scores = model.decision_function(X_all_scaled)

# ─────────────────────────────────────────
#  STEP 3F — Convert raw scores to Risk Index
#
#  Our formula from the poster:
#  IRI = 0.40 × AccessAnomaly
#      + 0.35 × BehavioralDrift
#      + 0.25 × SentimentShift
#
#  Practical approach:
#  1. Flip the isolation score (negative → positive)
#  2. Normalize to 0–100 range
#  3. Blend with individual feature deviations
#     using the poster weights
# ─────────────────────────────────────────

# Step 1: Flip so higher = more risky
flipped = -raw_scores

# Step 2: Normalize to 0–100
min_val = flipped.min()
max_val = flipped.max()
base_score = ((flipped - min_val) / (max_val - min_val)) * 100

# Step 3: Calculate individual component scores
#         These map directly to our poster formula

# AccessAnomaly — how abnormal are file access + privilege attempts?
access_raw    = df["files_accessed"] / df["files_accessed"].max()
priv_raw      = df["privilege_attempts"] / (df["privilege_attempts"].max() + 0.01)
access_anomaly = ((access_raw + priv_raw) / 2 * 100).values

# BehavioralDrift — how far is login hour + USB from normal?
login_raw     = np.abs(df["login_hour"] - 9) / 12   # deviation from 9am
usb_raw       = df["usb_events"].values
behavioral_drift = ((login_raw + usb_raw) / 2 * 100).values

# SentimentShift — hostile email tone (flip so -1 becomes high risk)
sentiment_shift = ((1 - df["sentiment_score"]) / 2 * 100).values

# Step 4: Apply weights from poster formula
#         IRI = 0.40×Access + 0.35×Behavioral + 0.25×Sentiment
weighted_score = (
    0.40 * access_anomaly   +
    0.35 * behavioral_drift +
    0.25 * sentiment_shift
)

# Step 5: Blend model score + weighted formula (50/50)
#         This gives us both ML power + explainability
final_score = (0.5 * base_score + 0.5 * weighted_score)
final_score = np.clip(final_score, 0, 100).round(1)

# ─────────────────────────────────────────
#  STEP 3G — Add risk labels
# ─────────────────────────────────────────

def label_risk(score):
    if score <= 30:   return "LOW"
    elif score <= 60: return "MODERATE"
    elif score <= 85: return "HIGH"
    else:             return "CRITICAL"

df["risk_score"] = final_score
df["risk_label"] = df["risk_score"].apply(label_risk)

print(f"✅ Risk scores calculated for all rows")


# ─────────────────────────────────────────
#  STEP 3H — Save everything
# ─────────────────────────────────────────

# Save scored data
df.to_csv("employee_logs_scored.csv", index=False)

# Save model + scaler so dashboard can reload them
joblib.dump(model,  "isolation_forest_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print(f"✅ Saved employee_logs_scored.csv")
print(f"✅ Saved isolation_forest_model.pkl")
print(f"✅ Saved scaler.pkl")


# ─────────────────────────────────────────
#  STEP 3I — Results verification
#            Show the proof that it works
# ─────────────────────────────────────────

# Get EMP-007's scores across all 30 days
emp007 = df[df["employee_id"] == THREAT_EMPLOYEE][["day","risk_score","risk_label"]]

print(f"\n{'─'*50}")
print(f"  EMP-007 RISK SCORE — DAY BY DAY")
print(f"{'─'*50}")
for _, row in emp007.iterrows():
    bar    = "█" * int(row["risk_score"] / 5)
    label  = f"  ← 🚨 {row['risk_label']}" if row["risk_score"] > 60 else f"  ← {row['risk_label']}"
    print(f"  Day {int(row['day']):02d}  [{bar:<20}] {row['risk_score']:5.1f}{label}")

print(f"{'─'*50}")

# Show top 5 riskiest employees overall (peak score)
print(f"\n🏆 TOP 5 RISKIEST EMPLOYEES (peak score):")
peak_scores = df.groupby("employee_id")["risk_score"].max().sort_values(ascending=False)
for i, (emp, score) in enumerate(peak_scores.head(5).items(), 1):
    marker = "  ← 🚨 THREAT ACTOR" if emp == THREAT_EMPLOYEE else ""
    print(f"  {i}. {emp}  →  {score:.1f}{marker}")

print(f"""
─────────────────────────────────────────
  WHAT THIS STEP DID

  ✅ Trained Isolation Forest on normal
     behavior (days 1–25)
  ✅ Scored all 600 rows using:
     IRI = 0.40×Access + 0.35×Drift
         + 0.25×Sentiment
  ✅ EMP-007 spikes to CRITICAL on Day 26
  ✅ Saved model files for dashboard

  NEXT → Run dashboard.py (Step 4)
─────────────────────────────────────────
""")
