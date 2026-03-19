# Ajax in Plain Sight

A civic transparency platform for Ajax, Ontario that tracks town council voting records, campaign finance data, and election results.

## Features

- **Council Voting Records**: View how each councillor voted on every motion
- **Campaign Finance**: See all donations from official Form 4 filings
- **Election Results**: Complete 2022 municipal election data for all 26 candidates
- **Automated Updates**: Scrapes new meeting minutes weekly via GitHub Actions
- **Civic Engagement**: Educational resources on voter registration and municipal government

## Tech Stack

- **Frontend**: Next.js 16 with React 19, Tailwind CSS v4, shadcn/ui components
- **Backend**: Node.js API routes, PostgreSQL (Supabase), Prisma ORM
- **Data Processing**: Python scrapers with Claude AI for PDF parsing
- **Automation**: GitHub Actions for scheduled scraping and ISR revalidation
- **Deployment**: Vercel (serverless functions + ISR caching)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account (free tier works)
- Anthropic API key for Claude

### Installation

1. **Clone and install**:
```bash
git clone https://github.com/your-org/ajax-in-plain-sight.git
cd ajax-in-plain-sight
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Anthropic credentials
```

3. **Set up database**:
```bash
pnpm exec prisma migrate dev
# This will create all tables from schema.prisma
```

4. **Seed initial data**:
```bash
cd scripts
uv run seed_councillors.py
```

5. **Start development server**:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page
│   ├── about/page.tsx            # About page
│   ├── register/page.tsx         # Voter registration guide
│   ├── elections/2022/           # 2022 election results (static)
│   ├── council/                  # Current council (dynamic with ISR)
│   └── api/                      # API routes
├── components/                   # React components (shadcn/ui)
├── prisma/
│   └── schema.prisma             # Database schema
├── scripts/
│   ├── scrape_minutes.py         # Weekly scraper for meeting PDFs
│   ├── parse_form_4.py           # Parser for campaign finance docs
│   ├── seed_councillors.py       # Initial data population
│   └── db_utils.py               # Database utilities
├── .github/workflows/            # GitHub Actions automation
│   ├── scrape-minutes.yml        # Weekly scraper (Mon 9am UTC)
│   └── parse-form-4.yml          # Manual Form 4 parser
└── DEPLOYMENT.md                 # Deployment & setup guide
```

## Database Schema

- **persons**: Councillors, candidates, and elected officials
- **elections**: Electoral events (2022, 2026, etc.)
- **roles**: Positions held by people in elections
- **meetings**: Town council meeting records
- **motions**: Proposals voted on in council
- **votes**: Individual councillor votes on motions
- **donations**: Campaign contributions from Form 4 filings
- **scrape_log**: Deduplication log for automated scrapers

## How It Works

### Static Pages (Fast CDN Serving)
- Home, about, register pages
- 2022 election results and candidate profiles
- Generated at build time, served from global CDN

### Dynamic Pages (ISR - Incremental Static Regeneration)
- Council member listings
- Voting records and history
- Donor information
- Revalidates hourly or on data update via webhook

### Automated Data Pipeline
1. **GitHub Actions** runs scrapers on schedule (Monday 9am UTC)
2. **Minutes Scraper** fetches PDFs from events.ajax.ca
3. **Claude AI** extracts structured data from PDFs
4. **Deduplication** prevents duplicate processing via scrape_log
5. **Database** stores votes, motions, and donations
6. **ISR Webhook** triggers page revalidation automatically

## API Endpoints

### Public API Routes
- `GET /api/council` - List all current councillors
- `GET /api/votes?personId=...` - Get voting history for a councillor
- `GET /api/votes?motionId=...` - Get all votes on a motion
- `GET /api/donors?personId=...` - Get donation history for a candidate
- `POST /api/webhook/revalidate?token=...` - Trigger ISR revalidation

### Internal Webhooks
- `POST /api/webhook/revalidate` - GitHub Actions calls this after scraping

## Development

### Running Scrapers Locally

**Parse meeting minutes**:
```bash
cd scripts
uv run scrape_minutes.py
```

**Parse Form 4 documents** (place PDFs in `scripts/form_4_documents/`):
```bash
cd scripts
uv run parse_form_4.py
```

### Database Management

**View schema**:
```bash
pnpm exec prisma studio  # Opens GUI at http://localhost:5555
```

**Run migrations**:
```bash
pnpm exec prisma migrate dev --name add_new_table
```

**Generate Prisma client**:
```bash
pnpm exec prisma generate
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions covering:
- Environment variables configuration
- GitHub Actions secrets
- Vercel deployment
- Database setup
- Monitoring and troubleshooting

## Data Sources

All data comes from official public sources:
- Town of Ajax Council Meeting Minutes (events.ajax.ca)
- Town of Ajax Form 4 Financial Statements
- Town of Ajax Official Election Results
- Elections Canada

## Privacy & Data

- No personal information is stored beyond what's already public
- All displayed data comes from official municipal records
- We do not track user behavior or store IP addresses
- Data accuracy verified against source documents

## Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Report bugs or suggest improvements via GitHub Issues.

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for setup help
- Review GitHub Actions logs for scraper errors
- Check Vercel logs for deployment issues
- Email: hello@ajaxinplainsight.ca

## Team

Built with ❤️ for civic transparency in Ajax, Ontario.

---

**Last Updated**: March 2024  
**Version**: 1.0.0  
**Status**: Production Ready
