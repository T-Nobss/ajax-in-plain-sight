import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types matching your 8 Supabase tables exactly ───────────────────────────

export type Person = {
  id: string
  slug: string
  full_name: string
  ward: string | null
  photo_url: string | null
  email: string | null
  created_at: string
}

export type Election = {
  id: string
  year: number
  election_date: string | null
  status: 'closed' | 'upcoming' | 'active'
}

export type Role = {
  id: string
  person_id: string
  election_id: string | null
  title: string
  ward: string | null
  won: boolean
  votes_received: number | null
  vote_pct: number | null
  start_date: string | null
  end_date: string | null
}

export type Meeting = {
  id: string
  meeting_date: string
  committee: string
  source_url: string | null
  pdf_url: string | null
}

export type Motion = {
  id: string
  meeting_id: string
  sequence: number
  title: string
  full_text: string | null
  outcome: string | null
}

export type Vote = {
  id: string
  motion_id: string
  person_id: string
  position: 'for' | 'against' | 'absent'
}

export type Donation = {
  id: string
  person_id: string
  election_id: string
  donor_name: string
  donor_address: string | null
  amount_cents: number
  contribution_type: 'monetary' | 'goods_services' | null
  source: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDollars(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Toronto',
  })
}
