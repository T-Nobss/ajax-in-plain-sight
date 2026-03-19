# Ajax Civic Data Scraper

Automated scraper and data extraction pipeline for Ajax town council voting records and campaign finance data.

## Overview

This scraper:
1. **Scrapes** meeting minutes from the Town of Ajax website
2. **Extracts** voting records using Claude AI
3. **Seeds** the database with councillor and donation data
4. **Keeps data fresh** via automated GitHub Actions

## Setup

### Prerequisites
- Python 3.10+
- Anthropic API key (for Claude vote extraction)
- PostgreSQL database (for production)

### Installation

```bash
cd scripts/scraper

# Install dependencies
uv pip install -e .

# Or with pip
pip install -e .
```

### Configuration

Set environment variables:

```bash
export ANTHROPIC_API_KEY=your-api-key
export DATABASE_URL=postgresql://user:pass@localhost/ajax
```

## Usage

### Run the full pipeline

```bash
python main.py
```

### Run individual scripts

```bash
# Extract votes from meeting minutes
python extract_votes.py

# Scrape recent meetings
python scrape_minutes.py

# Seed councillor data
python seed_councillors.py
```

## Data Pipeline

```
Meeting Minutes (Town Website)
    ↓
Scrape & Download
    ↓
Claude AI Extraction
    ↓
Parse Votes & Motions
    ↓
Database Insert
    ↓
ISR Cache Invalidation
    ↓
Website Update
```

## AI-Powered Vote Extraction

The scraper uses Claude 3.5 Sonnet to extract voting records from unstructured meeting minutes:

```python
from extract_votes import MeetingMinutesExtractor

extractor = MeetingMinutesExtractor()
minutes_text = open("meeting_minutes.pdf", "r").read()
votes = extractor.extract_votes(minutes_text)

# Returns:
# [
#   {
#     "councillor_name": "Shaun Collier",
#     "position": "for",
#     "motion_title": "Q3 Budget Report",
#     "motion_outcome": "CARRIED"
#   },
#   ...
# ]
```

## Supported Data Sources

- **Meeting Minutes**: Ajax Town Council meeting minutes (PDF/HTML)
- **Councillor Data**: 2022 election results
- **Campaign Finance**: Form 4 filings from municipal elections
- **Election Results**: Vote counts and percentages

## Database Schema

The scraper populates:
- `persons` - Councillors and candidates
- `roles` - Position history (mayor, councillor)
- `meetings` - Council meetings
- `motions` - Motions discussed
- `votes` - Individual votes cast
- `elections` - Election cycles
- `donations` - Campaign contributions

## Running on Schedule

GitHub Actions automatically runs the scraper weekly to keep data fresh:

```yaml
# .github/workflows/scrape.yml
name: Update Civic Data
on:
  schedule:
    - cron: '0 1 * * MON'  # Weekly Monday 1 AM UTC

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
      - run: pip install -e scripts/scraper
      - run: cd scripts/scraper && python main.py
```

## Troubleshooting

**Claude API errors?**
- Check that `ANTHROPIC_API_KEY` is set correctly
- Verify your API key has appropriate permissions
- Check API rate limits

**Database connection issues?**
- Verify `DATABASE_URL` is correct
- Ensure database server is running
- Check network connectivity

**Scraper not finding meetings?**
- The Town of Ajax website structure may have changed
- Update selectors in `scrape_minutes.py`
- Check the website for meeting minutes location

## Development

To add support for new data sources:

1. Create a new scraper class in a new file
2. Implement `get_data()` method
3. Add to `main.py` pipeline
4. Update this README

Example:

```python
# scripts/scraper/scrape_form4.py
class Form4Scraper:
    def __init__(self):
        self.base_url = "https://ajax.ca"
    
    def get_donations(self, year: int) -> list[dict]:
        """Get campaign contributions for an election year"""
        pass
```

## License

See LICENSE file in project root.
