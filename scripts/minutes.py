import os, re, json, hashlib, time, requests, base64
from supabase import create_client
from bs4 import BeautifulSoup

db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

MEETINGS = [
    ("2025-10-20", "Council", "https://events.ajax.ca/Meetings/Detail/2025-10-20-1300-Council-Meeting/b2e294a9-60ed-4143-a47a-b39900debe99"),
    ("2025-09-15", "Council", "https://events.ajax.ca/Meetings/Detail/2025-09-15-1300-Council-Meeting/9603e89b-f21d-4d16-bcfc-b35601106440"),
    ("2025-06-23", "Council", "https://events.ajax.ca/Meetings/Detail/2025-06-23-1300-Council-Meeting/3a8f2b1c-4e5d-6789-abcd-ef0123456789"),
]

NAME_MAP = {
    "collier": "shaun-collier", "crawford": "marilyn-crawford",
    "lee": "sterling-lee", "dies": "joanne-dies",
    "tyler morin": "rob-tyler-morin", "henry": "nancy-henry", "bower": "lisa-bower",
}

def resolve(name):
    n = name.lower()
    for k, slug in NAME_MAP.items():
        if k in n:
            r = db.table("persons").select("id").eq("slug", slug).execute()
            if r.data: return r.data[0]["id"]
    return None

def call_claude(text):
    r = requests.post("https://api.anthropic.com/v1/messages",
        headers={"x-api-key":ANTHROPIC_KEY,"anthropic-version":"2023-06-01","content-type":"application/json"},
        json={"model":"claude-opus-4-5","max_tokens":4000,"messages":[{"role":"user","content":f"""Extract all recorded votes from this Ajax Town Council meeting.
Return ONLY valid JSON, no markdown.
Format: {{"meeting_date":"YYYY-MM-DD","committee":"Council","motions":[{{"sequence":1,"motion_title":"","motion_full_text":"","outcome":"CARRIED","in_favour":[],"opposed":[]}}]}}
Only include motions with explicit In Favour/Opposed lists.\n\n{text[:12000]}"""}]},timeout=120)
    r.raise_for_status()
    return json.loads(re.sub(r"```json|```","",r.json()["content"][0]["text"]).strip())

print("Minutes scraper starting...\n")
ok=skip=err=0

for date, committee, url in MEETINGS:
    print(f"-> {date} {committee}")
    try:
        r = requests.get(url, headers={"User-Agent":"Mozilla/5.0"}, timeout=30)
        soup = BeautifulSoup(r.text, "lxml")
        text = soup.get_text(separator="\n", strip=True)
        if "In Favour" not in text and "CARRIED" not in text:
            print("   no votes found in page"); err+=1; continue
        print(f"   {len(text)} chars")
    except Exception as e: print(f"   fetch error: {e}"); err+=1; continue

    h = hashlib.md5(text.encode()).hexdigest()
    r2 = db.table("scrape_log").select("id").eq("content_hash",h).eq("status","success").execute()
    if r2.data: print("   already done"); skip+=1; continue

    try:
        extracted = call_claude(text)
        motions = extracted.get("motions",[])
        print(f"   {len(motions)} motions")
    except Exception as e: print(f"   claude error: {e}"); err+=1; time.sleep(10); continue

    mtg = db.table("meetings").insert({"meeting_date":date,"committee":committee,"source_url":url}).execute()
    meeting_id = mtg.data[0]["id"]

    votes_written = 0
    for m in motions:
        mot = db.table("motions").insert({"meeting_id":meeting_id,"sequence":m.get("sequence",0),"title":m.get("motion_title","")[:255],"full_text":m.get("motion_full_text"),"outcome":m.get("outcome")}).execute()
        mid = mot.data[0]["id"]
        for name in m.get("in_favour",[]):
            pid = resolve(name)
            if pid: db.table("votes").insert({"motion_id":mid,"person_id":pid,"position":"for"}).execute(); votes_written+=1
        for name in m.get("opposed",[]):
            pid = resolve(name)
            if pid: db.table("votes").insert({"motion_id":mid,"person_id":pid,"position":"against"}).execute(); votes_written+=1

    print(f"   {len(motions)} motions, {votes_written} votes written")
    db.table("scrape_log").insert({"source_url":url,"content_hash":h,"status":"success"}).execute()
    ok+=1; time.sleep(5)

print(f"\nDone! Processed:{ok} Skipped:{skip} Errors:{err}")
