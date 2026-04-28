"""
Seed script — populates Ajax in Plain Sight database with real data.

Run once after creating your Supabase tables:
  pip install supabase python-dotenv
  python scripts/seed.py

Requires environment variables:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY  (use service key, not anon key)
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
db = create_client(url, key)

print("🌱 Seeding Ajax in Plain Sight database...")

# ─── Elections ────────────────────────────────────────────────────────────────

print("\n→ Creating elections...")
db.table("elections").upsert([
    {"year": 2022, "election_date": "2022-10-24", "status": "closed"},
    {"year": 2026, "election_date": "2026-10-26", "status": "upcoming"},
], on_conflict="year").execute()

election_2022 = db.table("elections").select("id").eq("year", 2022).single().execute().data
ELECTION_2022_ID = election_2022["id"]
print(f"  2022 election id: {ELECTION_2022_ID}")

# ─── Persons ──────────────────────────────────────────────────────────────────

print("\n→ Creating persons...")

# All 2022 candidates (sitting councillors + defeated candidates)
persons = [
    # Sitting councillors (won = True, end_date = None)
    {"slug": "shaun-collier",    "full_name": "Shaun Collier",    "email": "mayor@ajax.ca"},
    {"slug": "marilyn-crawford", "full_name": "Marilyn Crawford", "email": "mcrawford@ajax.ca"},
    {"slug": "sterling-lee",     "full_name": "Sterling Lee",     "email": "slee@ajax.ca"},
    {"slug": "joanne-dies",      "full_name": "Joanne Dies",      "email": "jdies@ajax.ca"},
    {"slug": "rob-tyler-morin",  "full_name": "Rob Tyler-Morin",  "email": "rtylermorin@ajax.ca"},
    {"slug": "nancy-henry",      "full_name": "Nancy Henry",      "email": "nhenry@ajax.ca"},
    {"slug": "lisa-bower",       "full_name": "Lisa Bower",       "email": "lbower@ajax.ca"},
    # 2022 candidates who didn't win
    {"slug": "arthur-augustine",        "full_name": "Arthur Augustine"},
    {"slug": "colin-hubble",            "full_name": "Colin Hubble"},
    {"slug": "garry-reader",            "full_name": "Garry Reader"},
    {"slug": "intab-ali",               "full_name": "Intab Ali"},
    {"slug": "vic-jagmohan",            "full_name": "Vic Jagmohan"},
    {"slug": "adam-bashir",             "full_name": "Adam Bashir"},
    {"slug": "daniel-corrigan",         "full_name": "Daniel Corrigan"},
    {"slug": "andras-adaikkalam",       "full_name": "Andras Adaikkalam"},
    {"slug": "arshad-awan",             "full_name": "Arshad Awan"},
    {"slug": "ashmeed-khan",            "full_name": "Ashmeed Khan"},
    {"slug": "selladurai-jeyakumaran",  "full_name": "Selladurai Jeyakumaran"},
    {"slug": "azhar-khan",              "full_name": "Azhar Khan"},
    {"slug": "ramon-estaris",           "full_name": "Ramon Estaris"},
    {"slug": "liliane-niyongabo-kisoro","full_name": "Liliane Niyongabo Kisoro"},
]

for p in persons:
    db.table("persons").upsert(p, on_conflict="slug").execute()
    print(f"  {p['full_name']}")

def pid(slug):
    return db.table("persons").select("id").eq("slug", slug).single().execute().data["id"]

# ─── Roles ────────────────────────────────────────────────────────────────────

print("\n→ Creating roles (2022 election results)...")

roles = [
    # Mayor
    {"slug": "shaun-collier",    "title": "Mayor",                        "ward": None,     "won": True,  "votes": 11691, "pct": 62.3, "start": "2022-11-15", "end": None},
    {"slug": "arthur-augustine", "title": "Mayor",                        "ward": None,     "won": False, "votes": 3481,  "pct": 18.6},
    {"slug": "colin-hubble",     "title": "Mayor",                        "ward": None,     "won": False, "votes": 1852,  "pct": 9.9},
    {"slug": "garry-reader",     "title": "Mayor",                        "ward": None,     "won": False, "votes": 1735,  "pct": 9.2},
    # Regional Councillors
    {"slug": "marilyn-crawford", "title": "Regional Councillor",          "ward": "Ward 1", "won": True,  "votes": 5108,  "pct": 80.7, "start": "2022-11-15", "end": None},
    {"slug": "intab-ali",        "title": "Regional Councillor",          "ward": "Ward 1", "won": False, "votes": 1222,  "pct": 19.3},
    {"slug": "sterling-lee",     "title": "Regional Councillor",          "ward": "Ward 2", "won": True,  "votes": 3066,  "pct": 58.8, "start": "2022-11-15", "end": None},
    {"slug": "vic-jagmohan",     "title": "Regional Councillor",          "ward": "Ward 2", "won": False, "votes": 1156,  "pct": 22.2},
    {"slug": "adam-bashir",      "title": "Regional Councillor",          "ward": "Ward 2", "won": False, "votes": 995,   "pct": 19.1},
    {"slug": "joanne-dies",      "title": "Regional Councillor",          "ward": "Ward 3", "won": True,  "votes": 5095,  "pct": 73.8, "start": "2022-11-15", "end": None},
    {"slug": "daniel-corrigan",  "title": "Regional Councillor",          "ward": "Ward 3", "won": False, "votes": 1811,  "pct": 26.2},
    # Local Councillors
    {"slug": "rob-tyler-morin",         "title": "Local Councillor", "ward": "Ward 1", "won": True,  "votes": 4475, "pct": 71.1, "start": "2022-11-15", "end": None},
    {"slug": "andras-adaikkalam",       "title": "Local Councillor", "ward": "Ward 1", "won": False, "votes": 962,  "pct": 15.3},
    {"slug": "arshad-awan",             "title": "Local Councillor", "ward": "Ward 1", "won": False, "votes": 861,  "pct": 13.7},
    {"slug": "nancy-henry",             "title": "Local Councillor", "ward": "Ward 2", "won": True,  "votes": 1667, "pct": 31.2, "start": "2022-11-15", "end": None},
    {"slug": "ashmeed-khan",            "title": "Local Councillor", "ward": "Ward 2", "won": False, "votes": 1634, "pct": 30.6},
    {"slug": "selladurai-jeyakumaran",  "title": "Local Councillor", "ward": "Ward 2", "won": False, "votes": 986,  "pct": 18.5},
    {"slug": "azhar-khan",              "title": "Local Councillor", "ward": "Ward 2", "won": False, "votes": 838,  "pct": 15.7},
    {"slug": "ramon-estaris",           "title": "Local Councillor", "ward": "Ward 2", "won": False, "votes": 215,  "pct": 4.0},
    {"slug": "lisa-bower",              "title": "Local Councillor", "ward": "Ward 3", "won": True,  "votes": 6117, "pct": 88.1, "start": "2022-11-15", "end": None},
    {"slug": "liliane-niyongabo-kisoro","title": "Local Councillor", "ward": "Ward 3", "won": False, "votes": 824,  "pct": 11.9},
]

for r in roles:
    record = {
        "person_id":      pid(r["slug"]),
        "election_id":    ELECTION_2022_ID,
        "title":          r["title"],
        "ward":           r.get("ward"),
        "won":            r["won"],
        "votes_received": r.get("votes"),
        "vote_pct":       r.get("pct"),
        "start_date":     r.get("start"),
        "end_date":       r.get("end"),  # None = currently serving
    }
    db.table("roles").insert(record).execute()
    status = "✓ elected" if r["won"] else "  lost"
    print(f"  {status}  {r['full_name'] if 'full_name' in r else r['slug']}")

print("\n✅ Seed complete!")
print(f"\n  Persons:   {len(persons)}")
print(f"  Roles:     {len(roles)}")
print(f"  Elections: 2")
print("\nNext steps:")
print("  1. Run the Form 4 parser to populate donations")
print("  2. Run the minutes scraper to populate votes")
print("  3. Deploy: vercel --prod")
