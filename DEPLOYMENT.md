# Ajax in Plain Sight - Deployment Guide

## Overview

This guide covers deploying Ajax in Plain Sight to Vercel and setting up automated data scraping via GitHub Actions.

## Prerequisites

- Vercel account with the project deployed
- GitHub repository connected to Vercel
- Supabase database connected (with env vars configured)
- Anthropic API key for Claude integration
- GitHub repository admin access to add secrets

## Step 1: Environment Variables

Set these in your Vercel project settings under "Environment Variables":

### Database (Already Configured)
- `POSTGRES_PRISMA_URL` - Supabase connection with pooling
- `POSTGRES_URL_NON_POOLING` - Direct connection for scripts
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### External APIs
- `ANTHROPIC_API_KEY` - Claude API key from https://console.anthropic.com
- `ISR_REVALIDATION_TOKEN` - Secret token for webhook (generate with: `openssl rand -hex 32`)

### GitHub Actions Secrets
Add these to your GitHub repository settings under "Secrets and variables" → "Actions":

```
POSTGRES_URL_NON_POOLING: [Your Supabase connection string]
ANTHROPIC_API_KEY: [Your Anthropic API key]
ISR_REVALIDATION_TOKEN: [Same token used in Vercel env vars]
```

## Step 2: Seed Initial Data

Before the scrapers run, populate the councillor records:

```bash
cd scripts
uv run seed_councillors.py
```

This creates the 7 elected councillors in the database so they're available when votes are imported.

## Step 3: GitHub Actions Workflows

Two workflows are configured to run automatically:

### scrape-minutes.yml (Automated)
- **Trigger**: Every Monday at 9:00 AM UTC
- **Action**: Monitors events.ajax.ca for new meeting PDFs
- **Process**:
  1. Downloads new minutes PDFs
  2. Sends to Claude for vote extraction
  3. Saves motions and votes to database
  4. Triggers ISR revalidation to refresh council pages

### parse-form-4.yml (Manual)
- **Trigger**: Run manually via GitHub Actions tab
- **Action**: Processes campaign finance Form 4 documents
- **Process**:
  1. Reads Form 4 PDFs from `/scripts/form_4_documents/`
  2. Sends to Claude for donation extraction
  3. Saves donations to database
  4. Triggers ISR revalidation to refresh donor pages

**To run manually**:
1. Go to your GitHub repo → "Actions" tab
2. Select "Parse Form 4 Documents (Manual)"
3. Click "Run workflow"

## Step 4: Form 4 Documents (Optional)

To import campaign finance data:

1. Download Form 4 PDFs from the Town of Ajax
2. Place them in `/scripts/form_4_documents/`
3. Manually trigger the `parse-form-4.yml` workflow
4. Data will be imported and pages will auto-update

## Step 5: Verify Deployment

### Check Vercel Logs
```bash
vercel logs
```

### Test API Routes
- Council: `https://your-domain.vercel.app/api/council`
- Votes: `https://your-domain.vercel.app/api/votes?personId=...`
- Donors: `https://your-domain.vercel.app/api/donors?personId=...`

### Test ISR Webhook
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"tags":["test"]}' \
  "https://your-domain.vercel.app/api/webhook/revalidate?token=YOUR_TOKEN_HERE"
```

## Step 6: Monitoring

### Scrape Logs
Check the `scrape_log` table in Supabase to verify:
- Deduplication is working (same content hash = skipped)
- Success/failure status of each scrape
- Any error messages

### Database Metrics
Monitor in Supabase dashboard:
- Rows in `persons`, `motions`, `votes`, `donations` tables
- Query performance with ISR revalidation

## Troubleshooting

### Scraper Not Running
- Check GitHub Actions logs: Go to "Actions" tab in your repo
- Verify secrets are set: Settings → Secrets → Actions
- Check Vercel environment variables are propagated

### No Data Importing
- Verify Claude API key is valid
- Check that events.ajax.ca is accessible and has PDFs
- Look for parsing errors in GitHub Actions logs

### ISR Revalidation Not Working
- Verify `ISR_REVALIDATION_TOKEN` matches in Vercel and GitHub
- Check Vercel logs for webhook hits
- Ensure tag names match between scraper and webhook

## Performance Tuning

### Database Queries
The app uses Prisma ORM with connection pooling via Supabase. For high traffic:
- Enable Supabase read replicas
- Increase connection pool size
- Use API caching headers for static routes

### ISR Configuration
Current settings:
- `/council` - Revalidates every 1 hour
- `/council/[slug]` - Revalidates every 1 hour
- `/elections/2022` - Static (no revalidation needed)

Adjust `revalidate` parameter in page files if needed.

## Maintenance

### Weekly
- Monitor GitHub Actions for scraper success/failures
- Check for new PDFs on events.ajax.ca

### Monthly
- Review database size and connection stats
- Audit vote parsing accuracy
- Check for API errors in Vercel logs

### Quarterly
- Update dependencies: `npm outdated`, `uv pip outdated`
- Test disaster recovery (database restore)
- Review Claude API usage and costs

## Support

For issues or questions:
1. Check GitHub Actions logs for scraper errors
2. Review Supabase logs for database issues
3. Look at Vercel function logs for web app problems
4. Check Anthropic API status if Claude calls fail
