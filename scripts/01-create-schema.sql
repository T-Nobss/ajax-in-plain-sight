-- Ajax in Plain Sight Database Schema
-- Run this in Supabase SQL editor or execute via CLI
-- Created for Phase 1: Foundation & Database Setup

CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  ward TEXT,
  photo_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  election_date DATE,
  status TEXT NOT NULL DEFAULT 'closed', -- closed | upcoming | active
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES persons(id),
  election_id UUID REFERENCES elections(id),
  title TEXT NOT NULL,
  ward TEXT,
  won BOOLEAN NOT NULL DEFAULT false,
  votes_received INT,
  vote_pct NUMERIC(5,2),
  start_date DATE,
  end_date DATE  -- NULL means currently serving
);

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_date DATE NOT NULL,
  committee TEXT NOT NULL,  -- Council | GGC | CAPC
  source_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE motions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id),
  sequence INT NOT NULL,
  title TEXT NOT NULL,
  full_text TEXT,
  outcome TEXT  -- CARRIED | LOST
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motion_id UUID REFERENCES motions(id),
  person_id UUID REFERENCES persons(id),
  position TEXT NOT NULL  -- for | against | absent
);

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES persons(id),
  election_id UUID REFERENCES elections(id),
  donor_name TEXT NOT NULL,
  donor_address TEXT,
  amount_cents INT NOT NULL,
  source TEXT  -- PDF filename for traceability
);

CREATE TABLE scrape_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT  -- success | error | skipped
);
