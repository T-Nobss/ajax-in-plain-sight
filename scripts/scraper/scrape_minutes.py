"""
Scrape Ajax town council meeting minutes from the official website
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import Optional


class AjaxMeetingsScraper:
    """Scrape Ajax town council meeting minutes"""

    def __init__(self):
        self.base_url = "https://www.ajax.ca"
        self.meetings_url = f"{self.base_url}/en/residents/council-meetings.html"
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (compatible; AjaxScraper/1.0)",
            }
        )

    def get_recent_meetings(self, days_back: int = 90) -> list[dict]:
        """Get recent council meeting minutes from the past N days"""
        try:
            response = self.session.get(self.meetings_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")
            meetings = []

            # Find all meeting links/documents
            # Note: The actual selectors depend on the Town of Ajax website structure
            meeting_links = soup.find_all("a", class_=["meeting-minutes", "pdf", "minutes"])

            cutoff_date = datetime.now() - timedelta(days=days_back)

            for link in meeting_links:
                meeting_info = self._parse_meeting_link(link)
                if meeting_info and meeting_info.get("date"):
                    if datetime.fromisoformat(meeting_info["date"]) > cutoff_date:
                        meetings.append(meeting_info)

            return sorted(meetings, key=lambda x: x["date"], reverse=True)

        except Exception as e:
            print(f"Error scraping meetings: {e}")
            return []

    def _parse_meeting_link(self, link) -> Optional[dict]:
        """Parse a meeting link to extract metadata"""
        try:
            url = link.get("href")
            text = link.get_text(strip=True)

            if not url:
                return None

            # Make URL absolute
            if url.startswith("/"):
                url = f"{self.base_url}{url}"
            elif not url.startswith("http"):
                url = f"{self.base_url}/{url}"

            # Extract date and committee from text if possible
            committee = "Council"  # Default
            if "committee" in text.lower():
                committee = "Committee"

            # Try to extract date from text (e.g., "October 25, 2024")
            date_str = None
            for part in text.split():
                if any(month in part for month in ["January", "February", "March", "April", "May", "June", 
                                                    "July", "August", "September", "October", "November", "December"]):
                    date_str = text
                    break

            return {
                "title": text,
                "url": url,
                "committee": committee,
                "date": date_str,
                "type": "minutes",
            }

        except Exception as e:
            print(f"Error parsing meeting link: {e}")
            return None

    def download_minutes(self, url: str) -> Optional[str]:
        """Download and extract text from meeting minutes PDF"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            # If it's a PDF, we'd need pdfplumber or similar
            # For now, just return the raw content
            if url.endswith(".pdf"):
                # This would require PDF processing
                print(f"PDF download: {url}")
                return None
            else:
                # HTML page
                soup = BeautifulSoup(response.content, "html.parser")
                text_content = soup.get_text()
                return text_content

        except Exception as e:
            print(f"Error downloading minutes: {e}")
            return None


if __name__ == "__main__":
    scraper = AjaxMeetingsScraper()
    print("Scraping recent Ajax council meetings...")

    meetings = scraper.get_recent_meetings(days_back=180)
    print(f"\nFound {len(meetings)} meetings in the last 180 days")

    for meeting in meetings[:5]:  # Show first 5
        print(f"\nMeeting: {meeting['title']}")
        print(f"Committee: {meeting['committee']}")
        print(f"URL: {meeting['url']}")
