"""
Minutes Scraper - Monitors events.ajax.ca for new council meeting PDFs
Extracts voting records and populates the database
"""
import os
import hashlib
import json
import httpx
from datetime import datetime
from pathlib import Path
import base64
from anthropic import Anthropic

from db_utils import check_scrape_log, log_scrape, get_db_connection


EVENTS_URL = "https://events.ajax.ca/en/list/town-council"
CLAUDE_MODEL = "claude-3-5-sonnet-20241022"


def hash_content(content: bytes) -> str:
    """Create a SHA256 hash of content for deduplication"""
    return hashlib.sha256(content).hexdigest()


def fetch_meeting_pdfs() -> list[dict]:
    """
    Fetch list of meeting PDFs from events.ajax.ca
    Returns list of dicts with: {title, url, date}
    """
    print("[v0] Fetching meeting list from events.ajax.ca...")
    try:
        response = httpx.get(EVENTS_URL, timeout=30)
        response.raise_for_status()
        
        # Parse HTML to extract PDF links (simplified - would need BeautifulSoup in production)
        # For now, return empty list as placeholder
        print("[v0] Successfully fetched events page")
        return []
    except Exception as e:
        print(f"[v0] Error fetching events: {e}")
        return []


def download_pdf(url: str) -> bytes | None:
    """Download a PDF file from URL"""
    try:
        print(f"[v0] Downloading PDF from {url}...")
        response = httpx.get(url, timeout=60)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"[v0] Error downloading PDF: {e}")
        return None


def extract_votes_with_claude(pdf_content: bytes, meeting_date: str) -> dict | None:
    """
    Use Claude to extract voting records from meeting minutes PDF
    Claude reads the PDF and returns structured JSON with motions and votes
    """
    client = Anthropic()
    
    # Convert PDF to base64 for Claude API
    pdf_base64 = base64.standard_b64encode(pdf_content).decode("utf-8")
    
    extraction_prompt = """
    Please analyze this Town of Ajax Council meeting minutes PDF and extract ALL voting records.
    
    For each motion that was voted on, provide:
    - Motion number/sequence
    - Motion title/description
    - Outcome (CARRIED or LOST)
    - How each councillor voted (FOR, AGAINST, or ABSENT)
    
    Return as JSON with this exact structure:
    {
        "motions": [
            {
                "sequence": 1,
                "title": "Motion text here",
                "outcome": "CARRIED",
                "votes": {
                    "Councillor Name": "FOR",
                    "Another Councillor": "AGAINST"
                }
            }
        ]
    }
    
    If no voting records found, return {"motions": []}
    """
    
    try:
        print("[v0] Sending PDF to Claude for processing...")
        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": extraction_prompt,
                        }
                    ],
                }
            ],
        )
        
        # Parse Claude's response
        response_text = message.content[0].text
        
        # Extract JSON from response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            print("[v0] No JSON found in Claude response")
            return None
            
    except Exception as e:
        print(f"[v0] Error processing PDF with Claude: {e}")
        return None


def save_votes_to_db(motions: list[dict], meeting_date: str) -> bool:
    """Save extracted votes to database"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # First create or get the meeting record
                cur.execute(
                    """
                    INSERT INTO meetings (meeting_date, committee, created_at)
                    VALUES (%s, 'Council', NOW())
                    ON CONFLICT DO NOTHING
                    RETURNING id
                    """,
                    (meeting_date,),
                )
                
                meeting_result = cur.fetchone()
                if not meeting_result:
                    # Meeting already exists, fetch its ID
                    cur.execute(
                        "SELECT id FROM meetings WHERE meeting_date = %s",
                        (meeting_date,),
                    )
                    meeting_result = cur.fetchone()
                
                if not meeting_result:
                    print("[v0] Failed to create/find meeting record")
                    return False
                
                meeting_id = meeting_result[0]
                
                # Insert motions and votes
                for motion_data in motions:
                    # Insert motion
                    cur.execute(
                        """
                        INSERT INTO motions (meeting_id, sequence, title, outcome)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                        """,
                        (
                            meeting_id,
                            motion_data.get("sequence"),
                            motion_data.get("title"),
                            motion_data.get("outcome"),
                        ),
                    )
                    
                    motion_id = cur.fetchone()[0]
                    
                    # Insert votes for this motion
                    votes = motion_data.get("votes", {})
                    for councillor_name, vote_position in votes.items():
                        # Find person by name
                        cur.execute(
                            "SELECT id FROM persons WHERE full_name = %s",
                            (councillor_name,),
                        )
                        person_result = cur.fetchone()
                        
                        if person_result:
                            person_id = person_result[0]
                            cur.execute(
                                """
                                INSERT INTO votes (motion_id, person_id, position)
                                VALUES (%s, %s, %s)
                                ON CONFLICT DO NOTHING
                                """,
                                (motion_id, person_id, vote_position.lower()),
                            )
                
                conn.commit()
                print(f"[v0] Successfully saved {len(motions)} motions to database")
                return True
                
    except Exception as e:
        print(f"[v0] Error saving to database: {e}")
        return False


def scrape_meeting_minutes():
    """Main scraper function"""
    print("[v0] Starting meeting minutes scraper...")
    
    # Fetch list of meetings
    meetings = fetch_meeting_pdfs()
    print(f"[v0] Found {len(meetings)} meetings to process")
    
    for meeting in meetings:
        print(f"[v0] Processing meeting: {meeting['title']}")
        
        # Download PDF
        pdf_content = download_pdf(meeting["url"])
        if not pdf_content:
            continue
        
        # Check scrape log for deduplication
        content_hash = hash_content(pdf_content)
        if check_scrape_log(meeting["url"], content_hash):
            print(f"[v0] Already scraped: {meeting['url']}")
            continue
        
        # Extract votes using Claude
        motions_data = extract_votes_with_claude(pdf_content, meeting["date"])
        if not motions_data:
            log_scrape(meeting["url"], content_hash, "failed", "Claude extraction failed")
            continue
        
        # Save to database
        if save_votes_to_db(motions_data.get("motions", []), meeting["date"]):
            log_scrape(meeting["url"], content_hash, "success")
            print(f"[v0] Successfully processed {meeting['title']}")
        else:
            log_scrape(meeting["url"], content_hash, "failed", "Database save failed")


if __name__ == "__main__":
    scrape_meeting_minutes()
