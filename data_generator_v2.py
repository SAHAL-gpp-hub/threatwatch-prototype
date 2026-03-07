import pandas as pd
import numpy as np
import os

# ─────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────
TOTAL_DAYS   = 30
RANDOM_SEED  = 42
np.random.seed(RANDOM_SEED)

# ─────────────────────────────────────────
#  ENRICHED EMPLOYEE PROFILES
#  Now includes: name, initials, dept, role
#  + a "stress_level" that subtly affects
#    their normal behavior (makes data richer)
# ─────────────────────────────────────────
EMPLOYEES = [
    {"id":"EMP-001","name":"Marcus Webb",      "initials":"MW","dept":"Engineering","role":"Senior DevOps Engineer",    "stress":0.2},
    {"id":"EMP-002","name":"Priya Nair",        "initials":"PN","dept":"Finance",    "role":"Financial Analyst",         "stress":0.6},
    {"id":"EMP-003","name":"Derek Sloane",      "initials":"DS","dept":"Sales",      "role":"Account Executive",         "stress":0.5},
    {"id":"EMP-004","name":"Aisha Okonkwo",     "initials":"AO","dept":"HR",         "role":"HR Manager",                "stress":0.3},
    {"id":"EMP-005","name":"Tomás Rivera",      "initials":"TR","dept":"Legal",      "role":"Compliance Officer",        "stress":0.4},
    {"id":"EMP-006","name":"Chen Wei",          "initials":"CW","dept":"Engineering","role":"Backend Developer",         "stress":0.3},
    {"id":"EMP-007","name":"John Smith",  "initials":"JS","dept":"IT",         "role":"Systems Administrator",    "stress":0.7},
    {"id":"EMP-008","name":"James Thornton",    "initials":"JT","dept":"Marketing",  "role":"Marketing Director",        "stress":0.2},
    {"id":"EMP-009","name":"Sarah Kim",         "initials":"SK","dept":"Finance",    "role":"Accountant",                "stress":0.3},
    {"id":"EMP-010","name":"Robert Liu",        "initials":"RL","dept":"Engineering","role":"Frontend Developer",        "stress":0.2},
    {"id":"EMP-011","name":"Nina Patel",        "initials":"NP","dept":"HR",         "role":"Talent Acquisition Lead",  "stress":0.4},
    {"id":"EMP-012","name":"Carlos Mendez",     "initials":"CM","dept":"Sales",      "role":"Regional Sales Manager",   "stress":0.5},
    {"id":"EMP-013","name":"Yuki Tanaka",       "initials":"YT","dept":"Engineering","role":"ML Engineer",               "stress":0.3},
    {"id":"EMP-014","name":"Amara Osei",        "initials":"AM","dept":"Finance",    "role":"Risk Analyst",              "stress":0.4},
    {"id":"EMP-015","name":"Liam O'Brien",      "initials":"LO","dept":"IT",         "role":"Network Administrator",    "stress":0.5},
    {"id":"EMP-016","name":"Sofia Rossi",       "initials":"SR","dept":"Legal",      "role":"Corporate Counsel",        "stress":0.3},
    {"id":"EMP-017","name":"David Park",        "initials":"DP","dept":"Marketing",  "role":"Brand Strategist",         "stress":0.4},
    {"id":"EMP-018","name":"Elena Vasquez",     "initials":"EV","dept":"Engineering","role":"QA Engineer",               "stress":0.3},
    {"id":"EMP-019","name":"Omar Shaikh",       "initials":"OS","dept":"Sales",      "role":"Business Dev Manager",     "stress":0.6},
    {"id":"EMP-020","name":"Hannah Mueller",    "initials":"HM","dept":"IT",         "role":"Cloud Infrastructure Eng","stress":0.3},
]

THREAT_ID        = "EMP-007"
ROGUE_STARTS_DAY = 26

print(f"✅ Loaded {len(EMPLOYEES)} employee profiles")
print(f"   Threat actor: {THREAT_ID} — {next(e['name'] for e in EMPLOYEES if e['id']==THREAT_ID)}")

# ─────────────────────────────────────────
#  GENERATE NORMAL DAILY LOGS
# ─────────────────────────────────────────
def normal_day(emp, day):
    s = emp["stress"]  # stress subtly shifts behavior
    return {
        "employee_id":         emp["id"],
        "name":                emp["name"],
        "initials":            emp["initials"],
        "department":          emp["dept"],
        "role":                emp["role"],
        "day":                 day,
        "login_hour":          int(np.clip(np.random.normal(9 - s*0.5, 1.0), 7, 12)),
        "files_accessed":      int(np.clip(np.random.normal(20 + s*5,  5.0), 5,  45)),
        "privilege_attempts":  int(np.clip(np.random.normal(s*0.5,    0.5), 0,   2)),
        "emails_sent":         int(np.clip(np.random.normal(20,        5.0), 5,  40)),
        "usb_events":          int(np.random.choice([0,1], p=[0.95, 0.05])),
        "sentiment_score":     round(np.clip(np.random.normal(0.5 - s*0.1, 0.15), 0.1, 0.9), 2),
    }

# ─────────────────────────────────────────
#  GENERATE ROGUE LOGS (last 5 days)
# ─────────────────────────────────────────
def rogue_day(emp, day):
    return {
        "employee_id":         emp["id"],
        "name":                emp["name"],
        "initials":            emp["initials"],
        "department":          emp["dept"],
        "role":                emp["role"],
        "day":                 day,
        "login_hour":          int(np.clip(np.random.normal(2,   0.5), 1, 4)),
        "files_accessed":      int(np.clip(np.random.normal(210, 20),  180, 260)),
        "privilege_attempts":  int(np.clip(np.random.normal(8,   1.0), 6,  10)),
        "emails_sent":         int(np.clip(np.random.normal(55,  5.0), 45, 70)),
        "usb_events":          1,
        "sentiment_score":     round(np.clip(np.random.normal(-0.8, 0.1), -1.0, -0.6), 2),
    }

# ─────────────────────────────────────────
#  BUILD FULL DATASET
# ─────────────────────────────────────────
all_rows = []
threat_emp = next(e for e in EMPLOYEES if e["id"] == THREAT_ID)

for emp in EMPLOYEES:
    for day in range(1, TOTAL_DAYS + 1):
        if emp["id"] == THREAT_ID and day >= ROGUE_STARTS_DAY:
            all_rows.append(rogue_day(emp, day))
        else:
            all_rows.append(normal_day(emp, day))

df = pd.DataFrame(all_rows)
df = df.sort_values(["employee_id","day"]).reset_index(drop=True)

df.to_csv("employee_logs.csv", index=False)

print(f"\n✅ Generated {len(df)} rows → employee_logs.csv")
print(f"\n📋 Sample rows:")
print(df[df["employee_id"]==THREAT_ID].tail(3).to_string(index=False))
print(f"\n📊 Columns: {list(df.columns)}")
print("\n✅ NEXT → run train_model.py")
