import pandas as pd
import numpy as np

# ─────────────────────────────────────────
#  CONFIGURATION
#  Must match what you set in Step 1
# ─────────────────────────────────────────

THREAT_EMPLOYEE  = "EMP-007"   # The employee going rogue
ROGUE_STARTS_DAY = 26          # Day they start acting suspicious
TOTAL_DAYS       = 30          # Must match Step 1
RANDOM_SEED      = 42

np.random.seed(RANDOM_SEED)

# ─────────────────────────────────────────
#  STEP 2A — Load the CSV from Step 1
# ─────────────────────────────────────────

df = pd.read_csv("employee_logs.csv")

print(f"✅ Loaded employee_logs.csv")
print(f"   Total rows loaded: {len(df)}")

# Let's see what EMP-007 looks like RIGHT NOW (normal)
emp007_before = df[df["employee_id"] == THREAT_EMPLOYEE]
print(f"\n📋 EMP-007 BEFORE injection (Days 1–5 sample):")
print(emp007_before.head().to_string(index=False))


# ─────────────────────────────────────────
#  STEP 2B — Define what "going rogue" looks like
#
#  These are the extreme values for the last 5 days
#  Compare these carefully with the normal ranges
#  from Step 1 — the contrast is the whole point
# ─────────────────────────────────────────

def generate_rogue_day(employee_id, day):
    """
    Returns one row of SUSPICIOUS behavioral data.

    Normal  →  Rogue (what changes):
    ───────────────────────────────────────────────
    login_hour       9am   →  2am  (midnight access)
    files_accessed   20    →  200+ (mass downloading)
    privilege_attempts 0   →  7-9  (trying locked doors)
    emails_sent      20    →  50+  (bulk forwarding?)
    usb_events       rare  →  always (copying data out)
    sentiment_score  +0.5  →  -0.8 (hostile tone)
    ───────────────────────────────────────────────
    """

    return {
        "employee_id"         : employee_id,
        "day"                 : day,

        # Logging in at 2am instead of 9am
        # loc=2 means centered around 2am
        "login_hour"          : int(np.clip(np.random.normal(loc=2, scale=0.5), 1, 4)),

        # Accessing 10x more files than usual — mass data grab
        "files_accessed"      : int(np.clip(np.random.normal(loc=210, scale=20), 180, 260)),

        # Repeatedly trying to access restricted folders
        "privilege_attempts"  : int(np.clip(np.random.normal(loc=8, scale=1), 6, 10)),

        # Sending way more emails — possibly exfiltrating data
        "emails_sent"         : int(np.clip(np.random.normal(loc=55, scale=5), 45, 70)),

        # USB drive plugged in EVERY rogue day (copying files out)
        "usb_events"          : 1,

        # Email tone turned hostile — negative sentiment
        "sentiment_score"     : round(np.clip(np.random.normal(loc=-0.8, scale=0.1), -1.0, -0.6), 2),
    }


# ─────────────────────────────────────────
#  STEP 2C — Replace EMP-007's last 5 days
#            with rogue behavior
# ─────────────────────────────────────────

rogue_rows = []

for day in range(ROGUE_STARTS_DAY, TOTAL_DAYS + 1):  # Days 26 to 30
    rogue_row = generate_rogue_day(THREAT_EMPLOYEE, day)
    rogue_rows.append(rogue_row)

print(f"\n🚨 Generated {len(rogue_rows)} rogue days for {THREAT_EMPLOYEE}")
print(f"   Rogue period: Day {ROGUE_STARTS_DAY} → Day {TOTAL_DAYS}")

# ─────────────────────────────────────────
#  STEP 2D — Swap the rows in the DataFrame
#
#  We find EMP-007's last 5 days in the
#  original dataframe and replace them
# ─────────────────────────────────────────

# Find rows to remove (EMP-007, days 26–30)
mask_to_remove = (
    (df["employee_id"] == THREAT_EMPLOYEE) &
    (df["day"] >= ROGUE_STARTS_DAY)
)

# Remove those rows
df = df[~mask_to_remove]
print(f"\n✅ Removed {mask_to_remove.sum()} normal rows for rogue period")

# Add the rogue rows in their place
rogue_df = pd.DataFrame(rogue_rows)
df = pd.concat([df, rogue_df], ignore_index=True)

# Sort so the CSV stays neat: by employee, then by day
df = df.sort_values(["employee_id", "day"]).reset_index(drop=True)

print(f"✅ Injected rogue rows back in")
print(f"   Total rows still: {len(df)} (should still be 600)")


# ─────────────────────────────────────────
#  STEP 2E — Save updated CSV
# ─────────────────────────────────────────

df.to_csv("employee_logs.csv", index=False)
print(f"\n✅ Saved updated employee_logs.csv")


# ─────────────────────────────────────────
#  STEP 2F — Verify: show the contrast
#            Normal days vs Rogue days
# ─────────────────────────────────────────

emp007_after = df[df["employee_id"] == THREAT_EMPLOYEE]

normal_period = emp007_after[emp007_after["day"] <= 25]
rogue_period  = emp007_after[emp007_after["day"] >= 26]

print(f"\n{'─'*55}")
print(f"  EMP-007 BEHAVIOR COMPARISON")
print(f"{'─'*55}")
print(f"{'Metric':<25} {'Normal (avg)':<15} {'Rogue (avg)'}")
print(f"{'─'*55}")

cols = ["login_hour", "files_accessed", "privilege_attempts",
        "emails_sent", "usb_events", "sentiment_score"]

for col in cols:
    normal_avg = round(normal_period[col].mean(), 2)
    rogue_avg  = round(rogue_period[col].mean(), 2)
    flag = "  🚨" if col in ["files_accessed", "privilege_attempts",
                               "usb_events", "sentiment_score"] else ""
    print(f"  {col:<23} {str(normal_avg):<15} {rogue_avg}{flag}")

print(f"{'─'*55}")
print(f"\n🎯 EMP-007's last 5 days (the rogue period):")
print(rogue_period.to_string(index=False))

print(f"""
─────────────────────────────────────────
  WHAT THIS STEP DID

  ✅ Loaded 600 normal rows from Step 1
  ✅ Replaced EMP-007's last 5 days with
     extreme rogue behavior
  ✅ Saved back to employee_logs.csv

  The contrast is dramatic on purpose —
  this is what the model will detect in
  Step 3 (Isolation Forest training)

  NEXT → Run train_model.py (Step 3)
─────────────────────────────────────────
""")
