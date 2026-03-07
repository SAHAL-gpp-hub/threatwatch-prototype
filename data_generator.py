import pandas as pd
import numpy as np
import os

# ─────────────────────────────────────────
#  CONFIGURATION
#  Change these values anytime you want
# ─────────────────────────────────────────

TOTAL_EMPLOYEES = 20          # How many employees to simulate
TOTAL_DAYS = 30          # How many days of logs to generate
THREAT_EMPLOYEE = "EMP-007"   # This employee will go rogue in Step 2
RANDOM_SEED = 42          # Keeps results same every time you run

np.random.seed(RANDOM_SEED)

# ─────────────────────────────────────────
#  STEP 1A — Define employee list
# ─────────────────────────────────────────

# Create employee IDs: EMP-001, EMP-002 ... EMP-020
employee_ids = [f"EMP-{str(i).zfill(3)}" for i in range(1, TOTAL_EMPLOYEES + 1)]

print(f"✅ Created {len(employee_ids)} employees")
print(f"   Employees: {employee_ids[:5]} ... {employee_ids[-1]}")
print(f"   Threat actor will be: {THREAT_EMPLOYEE}")


# ─────────────────────────────────────────
#  STEP 1B — Define what "normal" looks like
#  These are the ranges for a normal employee
#  on a normal working day
# ─────────────────────────────────────────

def generate_normal_day(employee_id, day):
    """
    Returns one row of normal behavioral data
    for a given employee on a given day.
    
    Think of this as: what does a regular
    employee do on a regular Tuesday?
    """

    return {
        "employee_id"        : employee_id,
        "day"                : day,

        # Login hour — normal staff log in between 8am and 10am
        # np.random.normal gives us a bell curve centered at 9
        "login_hour"         : int(np.clip(np.random.normal(loc=9, scale=1), 7, 11)),

        # Files accessed — most employees open 10 to 30 files a day
        "files_accessed"     : int(np.clip(np.random.normal(loc=20, scale=5), 5, 40)),

        # Privilege attempts — trying to open restricted folders
        # Normal employees rarely do this (0 or 1 times)
        "privilege_attempts" : int(np.clip(np.random.normal(loc=0.3, scale=0.5), 0, 2)),

        # Emails sent — average office worker sends 10–30 emails
        "emails_sent"        : int(np.clip(np.random.normal(loc=20, scale=5), 5, 40)),

        # USB events — did they plug in a USB drive? (0 = No, 1 = Yes)
        # Normal employees almost never do this
        "usb_events"         : int(np.random.choice([0, 1], p=[0.95, 0.05])),

        # Sentiment score — tone of their emails
        # +1.0 = very positive, 0 = neutral, -1.0 = very hostile
        # Normal employees stay between 0.2 and 0.8 (generally positive)
        "sentiment_score"    : round(np.clip(np.random.normal(loc=0.5, scale=0.15), 0.1, 0.9), 2),
    }


# ─────────────────────────────────────────
#  STEP 1C — Generate logs for ALL employees
#  for ALL 30 days
# ─────────────────────────────────────────

all_logs = []  # This list will collect every single row

for emp in employee_ids:
    for day in range(1, TOTAL_DAYS + 1):
        row = generate_normal_day(emp, day)
        all_logs.append(row)

print(f"\n✅ Generated normal logs")
print(f"   Total rows: {len(all_logs)}")
print(f"   ({TOTAL_EMPLOYEES} employees × {TOTAL_DAYS} days = {TOTAL_EMPLOYEES * TOTAL_DAYS} rows)")


# ─────────────────────────────────────────
#  STEP 1D — Convert to DataFrame and save
# ─────────────────────────────────────────

df = pd.DataFrame(all_logs)

# Save to CSV — this file will be used by all future steps
output_path = "employee_logs.csv"
df.to_csv(output_path, index=False)

print(f"\n✅ Saved to '{output_path}'")
print(f"\n📋 Preview of first 5 rows:")
print(df.head().to_string(index=False))

print(f"\n📊 Quick stats for normal employees:")
print(df[["login_hour","files_accessed","privilege_attempts","sentiment_score"]].describe().round(2))


# ─────────────────────────────────────────
#  WHAT THIS FILE PRODUCED
#
#  employee_logs.csv with columns:
#  ┌──────────────────┬─────────────────────────┐
#  │ employee_id      │ EMP-001 to EMP-020       │
#  │ day              │ 1 to 30                  │
#  │ login_hour       │ 7 to 11 (normal range)   │
#  │ files_accessed   │ 5 to 40 (normal range)   │
#  │ privilege_attempts│ 0 to 2 (rare)           │
#  │ emails_sent      │ 5 to 40 (normal range)   │
#  │ usb_events       │ 0 or 1 (mostly 0)        │
#  │ sentiment_score  │ 0.1 to 0.9 (positive)    │
#  └──────────────────┴─────────────────────────┘
#
#  NEXT → Run data_injector.py (Step 2)
#         to make EMP-007 go rogue
# ─────────────────────────────────────────
