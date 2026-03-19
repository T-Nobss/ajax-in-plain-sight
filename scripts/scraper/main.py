"""
Main orchestration script for the Ajax civic data pipeline
"""
import os
import sys
from pathlib import Path
from datetime import datetime

# Add the scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from seed_councillors import AJAX_COUNCILLORS_2022
from extract_votes import MeetingMinutesExtractor
from scrape_minutes import AjaxMeetingsScraper


def run_pipeline():
    """Run the complete data pipeline"""
    print("=" * 60)
    print("AJAX CIVIC DATA PIPELINE")
    print("=" * 60)
    print(f"Started at: {datetime.now().isoformat()}\n")

    # Step 1: Verify API key
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("⚠️  WARNING: ANTHROPIC_API_KEY not set")
        print("   Set this environment variable to enable Claude-powered vote extraction")
        print("   Export it with: export ANTHROPIC_API_KEY=your-key\n")

    # Step 2: Load initial data
    print("📋 Step 1: Loading initial councillor data...")
    print(f"   Loaded {len(AJAX_COUNCILLORS_2022)} councillors from 2022 election")
    for councillor in AJAX_COUNCILLORS_2022:
        print(f"   - {councillor['full_name']} ({councillor['title']})")
    print()

    # Step 3: Scrape meetings
    print("🔍 Step 2: Scraping recent council meetings...")
    scraper = AjaxMeetingsScraper()
    meetings = scraper.get_recent_meetings(days_back=30)
    print(f"   Found {len(meetings)} recent meetings")
    if meetings:
        for meeting in meetings[:3]:
            print(f"   - {meeting['title']}")
    print()

    # Step 4: Extract votes (if API key available)
    if os.getenv("ANTHROPIC_API_KEY"):
        print("🤖 Step 3: Extracting voting records with Claude...")
        extractor = MeetingMinutesExtractor()

        # Sample extraction
        sample_minutes = """
        AJAX TOWN COUNCIL MEETING MINUTES
        October 25, 2024

        Present: Shaun Collier (Mayor), Marilyn Crawford, Sterling Lee, Joanne Dies,
        Rob Tyler-Morin, Nancy Henry, Lisa Bower

        MOTION 1: Approval of Q3 Budget Report
        Vote: 7-0 in favour - CARRIED

        MOTION 2: Amendment to Zoning By-law
        Vote:
        - Shaun Collier: FOR
        - Marilyn Crawford: AGAINST
        - Sterling Lee: FOR
        - Joanne Dies: FOR
        - Rob Tyler-Morin: FOR
        - Nancy Henry: AGAINST
        - Lisa Bower: FOR
        Result: 5-2 in favour - CARRIED
        """

        print("   Processing sample meeting minutes...")
        votes = extractor.extract_votes(sample_minutes)
        print(f"   Extracted {len(votes)} votes")
    else:
        print("⏭️  Step 3: Skipped (Claude API key required)")
    print()

    # Step 5: Summary
    print("📊 Pipeline Summary:")
    print(f"   - Councillors loaded: {len(AJAX_COUNCILLORS_2022)}")
    print(f"   - Meetings found: {len(meetings)}")
    print(f"   - Status: Ready for database seeding\n")

    print("✅ Pipeline complete!")
    print("\nNext steps:")
    print("   1. Set up database connection")
    print("   2. Seed councillor data")
    print("   3. Process meeting minutes with Claude")
    print("   4. Deploy to production\n")


if __name__ == "__main__":
    run_pipeline()
