import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for our database
export interface Person {
  id: string
  slug: string
  full_name: string
  ward?: string
  photo_url?: string
  email?: string
  created_at: string
}

export interface Role {
  id: string
  person_id: string
  election_id?: string
  title: string
  ward?: string
  won: boolean
  votes_received?: number
  vote_pct?: number
  start_date?: string
  end_date?: string | null
}

export interface Vote {
  id: string
  motion_id: string
  person_id: string
  position: 'for' | 'against' | 'absent'
}

export interface Motion {
  id: string
  meeting_id: string
  sequence: number
  title: string
  full_text?: string
  outcome?: string
}

export interface Meeting {
  id: string
  meeting_date: string
  committee: string
  source_url?: string
  pdf_url?: string
}

export interface Donation {
  id: string
  person_id: string
  election_id?: string
  donor_name: string
  donor_address?: string
  amount_cents: number
  source?: string
}
