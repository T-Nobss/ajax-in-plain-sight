"""
Form 4 Parser - Extracts campaign finance data from candidate financial statements
One-shot script to process all 21 candidate Form 4 documents
"""
import os
import base64
import json
from pathlib import Path
import hashlib

from anthropic import Anthropic
from db_utils import check_scrape_log, log_scrape, get_db_connection


CLAUDE_MODEL = "claude-3-5-sonnet-20241022"
FORM_4_DIRECTORY = "./form_4_documents"  # Directory containing PDF Form 4 files


def hash_content(content: bytes) -> str:
    """Create a SHA256 hash of content"""
    return hashlib.sha256(content).hexdigest()


def extract_donations_with_claude(pdf_content: bytes, candidate_name: str) -> list[dict] | None:
    """
    Use Claude to extract donation records from Form 4 PDF
    Returns list of donations with donor name, address, amount, and donation type
    """
    client = Anthropic()
    
    pdf_base64 = base64.standard_b64encode(pdf_content).decode("utf-8")
    
    extraction_prompt = f"""
    Please analyze this Form 4 financial statement from {candidate_name} and extract ALL donations/contributions.
    
    For each donation, provide:
    - Donor name
    - Donor address (if available)
    - Amount in dollars
    - Type (Monetary or In-kind)
    - Date (if available)
    - Description
    
    Return as JSON with this exact structure:
    {{
        "candidate": "{candidate_name}",
        "donations": [
            {{
                "donor_name": "John Doe",
                "donor_address": "123 Main St, Ajax, ON",
                "amount_cents": 50000,
                "donation_type": "Monetary",
                "date": "2022-08-15",
                "description": "Campaign contribution"
            }}
        ]
    }}
    
    If no donations found, return {{"candidate": "{candidate_name}", "donations": []}}
    """
    
    try:
        print(f"[v0] Sending Form 4 to Claude for {candidate_name}...")
        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=4000,
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
        
        response_text = message.content[0].text
        
        # Extract JSON
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            print(f"[v0] No JSON found in Claude response for {candidate_name}")
            return None
            
    except Exception as e:
        print(f"[v0] Error processing Form 4 with Claude: {e}")
        return None


def save_donations_to_db(donations_data: dict, pdf_filename: str) -> bool:
    """Save extracted donations to database"""
    try:
        candidate_name = donations_data.get("candidate", "")
        donations = donations_data.get("donations", [])
        
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Find the candidate
                cur.execute(
                    "SELECT id FROM persons WHERE full_name = %s",
                    (candidate_name,),
                )
                result = cur.fetchone()
                
                if not result:
                    print(f"[v0] Candidate not found: {candidate_name}")
                    return False
                
                person_id = result[0]
                
                # Insert donations
                for donation in donations:
                    try:
                        cur.execute(
                            """
                            INSERT INTO donations (
                                person_id, donor_name, donor_address,
                                amount_cents, source
                            )
                            VALUES (%s, %s, %s, %s, %s)
                            ON CONFLICT DO NOTHING
                            """,
                            (
                                person_id,
                                donation.get("donor_name"),
                                donation.get("donor_address"),
                                donation.get("amount_cents", 0),
                                pdf_filename,
                            ),
                        )
                    except Exception as e:
                        print(f"[v0] Error inserting donation: {e}")
                        continue
                
                conn.commit()
                print(f"[v0] Saved {len(donations)} donations for {candidate_name}")
                return True
                
    except Exception as e:
        print(f"[v0] Error saving donations to database: {e}")
        return False


def parse_form_4_documents():
    """Process all Form 4 documents in the directory"""
    print("[v0] Starting Form 4 parser...")
    
    form_4_path = Path(FORM_4_DIRECTORY)
    if not form_4_path.exists():
        print(f"[v0] Form 4 directory not found: {FORM_4_DIRECTORY}")
        print("[v0] Place Form 4 PDF files in the scripts/form_4_documents directory")
        return
    
    pdf_files = list(form_4_path.glob("*.pdf"))
    print(f"[v0] Found {len(pdf_files)} Form 4 documents to process")
    
    for pdf_file in pdf_files:
        print(f"\n[v0] Processing: {pdf_file.name}")
        
        try:
            # Read PDF
            with open(pdf_file, "rb") as f:
                pdf_content = f.read()
            
            # Check scrape log for deduplication
            content_hash = hash_content(pdf_content)
            if check_scrape_log(str(pdf_file), content_hash):
                print(f"[v0] Already processed: {pdf_file.name}")
                continue
            
            # Extract candidate name from filename (e.g., "John_Doe_Form4.pdf" -> "John Doe")
            candidate_name = pdf_file.stem.replace("_", " ").replace(" Form4", "").replace(" form4", "")
            
            # Extract donations
            donations_data = extract_donations_with_claude(pdf_content, candidate_name)
            if not donations_data:
                log_scrape(str(pdf_file), content_hash, "failed", "Claude extraction failed")
                continue
            
            # Save to database
            if save_donations_to_db(donations_data, pdf_file.name):
                log_scrape(str(pdf_file), content_hash, "success")
                print(f"[v0] Successfully processed {pdf_file.name}")
            else:
                log_scrape(str(pdf_file), content_hash, "failed", "Database save failed")
                
        except Exception as e:
            print(f"[v0] Error processing {pdf_file.name}: {e}")
            content_hash = hashlib.sha256(b"error").hexdigest()
            log_scrape(str(pdf_file), content_hash, "failed", str(e))


if __name__ == "__main__":
    parse_form_4_documents()
