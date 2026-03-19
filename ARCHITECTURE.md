# Ajax in Plain Sight - Architecture Document

## System Overview

Ajax in Plain Sight is a modern civic transparency platform built with Next.js 16, PostgreSQL, and AI-powered data extraction. The system combines static site generation with incremental static regeneration and serverless functions to deliver fast, scalable civic data.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Browser (CDN Edge)                      │
│  Static HTML + CSS + JS (Vercel Edge Network - 200ms globally)  │
└────────────┬─────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──┐          ┌───▼──┐
│ SSG  │          │ ISR  │
│Pages │          │Pages │
│      │          │(1hr) │
└──────┘          └──────┘
    │                 │
    └────────┬────────┘
             │
    ┌────────▼────────────────────┐
    │  Vercel Serverless Functions │
    │  (Node.js API Routes)        │
    │  - /api/council              │
    │  - /api/votes                │
    │  - /api/revalidate           │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │  Prisma ORM Layer            │
    │  (Type-safe Database Access) │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │  PostgreSQL (Supabase)       │
    │  - persons                   │
    │  - roles                      │
    │  - motions                    │
    │  - votes                      │
    │  - donations                  │
    │  - meetings                   │
    └──────────────────────────────┘
```

## Data Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│            GitHub Actions Scheduler (Weekly Monday 9am UTC)       │
└──────────────────┬───────────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │ Scrape Minutes      │
        │ (scrape_minutes.py) │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────┐
        │ Download PDFs from           │
        │ events.ajax.ca              │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │ Check scrape_log for        │
        │ Deduplication (content hash)│
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │ Send to Claude API           │
        │ (extract_votes.py)          │
        │ Extract:                     │
        │ - Councillor names           │
        │ - Vote positions             │
        │ - Motion titles              │
        │ - Outcomes                   │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │ Insert into Database         │
        │ - meetings                   │
        │ - motions                    │
        │ - votes                      │
        │ - scrape_log (dedup)         │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │ POST to Revalidation Webhook │
        │ /api/webhook/revalidate      │
        │ Tag: "council"               │
        └──────────┬──────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │ Trigger ISR Revalidation     │
        │ - /council                   │
        │ - /council/[slug]            │
        │ - /council/[slug]/votes      │
        └──────────────────────────────┘
```

## Page Generation Strategies

### Static Site Generation (SSG)
Built at deploy time, served instantly from CDN:
- `/` - Home page
- `/about` - About page
- `/register` - Voter registration
- `/elections/2022` - 2022 election results
- `/elections/2022/[candidate]` - Candidate profiles

**Cache**: Permanent (invalidate via Vercel rebuild)

### Incremental Static Regeneration (ISR)
Pre-generated, revalidates periodically:
- `/council` - Council listing
- `/council/[slug]` - Councillor profile
- `/council/[slug]/votes` - Voting history
- `/council/[slug]/donors` - Donor list

**Revalidate**: Every 1 hour OR on webhook
**Cache**: Edge (200ms response times globally)

### Server-Side Rendering (SSR)
Generated on-demand via API routes:
- `GET /api/councillors` - All councillors
- `GET /api/councillors/[slug]` - Single councillor with full data
- `POST /api/revalidate` - Trigger revalidation

**Cache**: None (always fresh)

## Database Schema

### persons
```sql
id              UUID PRIMARY KEY
full_name       VARCHAR(255) NOT NULL
slug            VARCHAR(255) UNIQUE NOT NULL
email           VARCHAR(255)
ward            VARCHAR(100)
photo_url       VARCHAR(500)
bio             TEXT
created_at      TIMESTAMP DEFAULT NOW()
```

Relationships:
- roles (one-to-many)
- votes (one-to-many)
- donations (one-to-many)

### roles
```sql
id              UUID PRIMARY KEY
person_id       UUID FOREIGN KEY
election_id     UUID FOREIGN KEY
title           VARCHAR(255) NOT NULL
start_date      DATE
end_date        DATE (null = current)
votes_received  INTEGER
```

### elections
```sql
id              UUID PRIMARY KEY
year            INTEGER
type            ENUM('municipal', 'federal', 'provincial')
```

### meetings
```sql
id              UUID PRIMARY KEY
election_id     UUID FOREIGN KEY
committee       VARCHAR(255)
meeting_date    DATE
source_url      VARCHAR(500)
minutes_text    TEXT
```

### motions
```sql
id              UUID PRIMARY KEY
meeting_id      UUID FOREIGN KEY
sequence        INTEGER
title           VARCHAR(500)
full_text       TEXT
outcome         ENUM('CARRIED', 'DEFEATED')
```

### votes
```sql
id              UUID PRIMARY KEY
motion_id       UUID FOREIGN KEY
person_id       UUID FOREIGN KEY
position        ENUM('for', 'against', 'absent')
```

### donations
```sql
id              UUID PRIMARY KEY
person_id       UUID FOREIGN KEY
donor_name      VARCHAR(255)
donor_address   TEXT
amount_cents    INTEGER
donation_date   DATE
```

### scrape_log
```sql
id              UUID PRIMARY KEY
source_url      VARCHAR(500)
content_hash    VARCHAR(64) -- SHA256
status          ENUM('success', 'error')
error_message   TEXT
created_at      TIMESTAMP
```

## API Routes

### Public Endpoints

**GET /api/councillors**
- List all current councillors
- Returns: Array of persons with roles and stats
- Cache: 1 minute (browser), 1 hour (CDN)

**GET /api/councillors/[slug]**
- Get full councillor profile
- Includes: votes, donations, contact info
- Cache: 1 hour

**POST /api/revalidate**
- Trigger ISR revalidation
- Auth: REVALIDATE_SECRET token
- Params: tag (council, elections, all)
- Used by: GitHub Actions after scraping

### Internal Webhooks

**POST /api/webhook/revalidate**
- GitHub Actions calls this after scraping
- Auth: ISR_REVALIDATION_TOKEN
- Triggers: revalidateTag('council')

## Performance Optimization

### Caching Layers

1. **CDN Edge** (Vercel Global Network)
   - ISR pages cached for 1 hour
   - Response time: <100ms globally
   - Automatic purge on revalidate

2. **Browser Cache**
   - Static assets: 1 year
   - ISR pages: 5 minutes
   - API responses: 1 minute

3. **Database Query Cache**
   - Prisma enables connection pooling
   - Read replicas for high-traffic queries
   - Full-text search indexes on motion text

### Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Responsive srcset generation
- Lazy loading below fold

### Bundle Optimization
- Code splitting per route
- Tree-shaking unused code
- CSS purging with Tailwind
- Minification via Vercel

## Security

### Authentication & Authorization
- API routes validate tokens in Authorization header
- Revalidation webhook uses HMAC signing
- GitHub Actions uses repository secrets
- No passwords stored in code

### Data Protection
- All credentials in environment variables
- HTTPS enforced on production
- Database credentials never committed
- Row-level security possible with Supabase

### Input Validation
- Prisma prevents SQL injection
- Next.js API routes validate input
- Claude API calls are sandboxed
- URL parameters validated against schema

## Scaling Strategy

### Current Capacity
- ~10,000 monthly active users
- ~1M page views/month
- Full database: <100MB

### Scale to 100k Users

1. **Database**
   - Enable Supabase read replicas
   - Increase connection pool size
   - Add indexes on frequent queries
   - Implement query caching layer

2. **CDN**
   - Extend ISR revalidation period
   - Use stale-while-revalidate headers
   - Increase cache-max-age

3. **API**
   - Add rate limiting
   - Implement request deduplication
   - Cache repeated API calls
   - Add background job queue

4. **Scraping**
   - Parallelize PDF parsing
   - Add scraping queue for many meetings
   - Implement exponential backoff

### Scale to 1M Users

Add:
- Database sharding by municipality
- Multi-region CDN distribution
- API gateway with rate limiting
- Background job processor (Bull)
- Search engine (Elasticsearch)
- Analytics pipeline (dbt)

## Monitoring & Observability

### Logging
- Vercel function logs (automatic)
- GitHub Actions step logs (automatic)
- Application logs via console.log()
- Database query logs (Prisma debug)

### Metrics
- Vercel Analytics: response times, regions
- Database size: Supabase dashboard
- API usage: GitHub Actions logs
- Error rates: Vercel error tracking

### Alerts
- GitHub Actions failure notifications
- Vercel deployment failures
- Database connection errors
- API endpoint downtime

## Development Workflow

```
Feature Branch
    ↓
    Create .env.local from .env.example
    ↓
    npm install && pnpm exec prisma migrate dev
    ↓
    npm run dev (start local server)
    ↓
    Make changes and test
    ↓
    Git commit
    ↓
    Push to feature branch
    ↓
    Create GitHub Pull Request
    ↓
    Vercel Preview Deployment (automatic)
    ↓
    Code Review
    ↓
    Merge to main
    ↓
    Production Deployment (automatic)
```

## Disaster Recovery

### Backup Strategy
- Database: Supabase automatic daily backups
- Code: GitHub repository (infinite history)
- Media: Vercel builds stored indefinitely

### Recovery Procedures

**Database corruption**:
1. Contact Supabase support for point-in-time recovery
2. Or: Connect backup database and restore schema
3. Re-run scripts to repopulate from source

**Data loss**:
1. Check scrape_log for timestamps
2. Restore from appropriate backup
3. Re-run scraper from that date forward

**Deployment failure**:
1. Run: `vercel rollback` to previous deployment
2. Or: Fix issue and push to main again
3. GitHub Actions redeploys automatically

## Future Enhancements

- Admin dashboard for manual data entry
- Advanced search across all pages
- Voting comparison tool (compare 2 councillors)
- Donate tracking (show flow of money)
- Historical trends (voting patterns over time)
- Mobile app (React Native)
- Real-time meeting minutes (live voting)
- Integration with other municipalities

## References

- Next.js ISR: https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
- Prisma: https://www.prisma.io/docs/
- Supabase: https://supabase.com/docs
- Claude API: https://docs.anthropic.com/
