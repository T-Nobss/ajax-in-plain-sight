import { supabase } from './supabase'
import type { Donation } from './supabase'

// ─── Council ──────────────────────────────────────────────────────────────────

export async function getSittingCouncillors() {
  const { data, error } = await supabase
    .from('roles')
    .select(`
      id, title, ward, won, start_date, end_date,
      persons (id, slug, full_name, email, photo_url, ward)
    `)
    .is('end_date', null)
    .order('title')

  if (error) throw new Error(error.message)

  return (data ?? []).map((row: any) => ({
    ...row.persons,
    role: { id: row.id, title: row.title, ward: row.ward, won: row.won, start_date: row.start_date, end_date: row.end_date }
  }))
}

export async function getPersonBySlug(slug: string) {
  const { data, error } = await supabase
    .from('persons')
    .select(`
      id, slug, full_name, email, photo_url, ward,
      roles (id, title, ward, won, votes_received, vote_pct, start_date, end_date, election_id)
    `)
    .eq('slug', slug)
    .single()

  if (error) return null
  const currentRole = (data.roles as any[])?.find((r: any) => !r.end_date) ?? (data.roles as any[])?.[0] ?? null
  return { ...data, role: currentRole }
}

export async function getAllCouncillorSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('roles')
    .select('persons(slug)')
    .is('end_date', null)
  return (data ?? []).map((r: any) => r.persons?.slug).filter(Boolean)
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export async function getVotesForPerson(personId: string) {
  const { data, error } = await supabase
    .from('votes')
    .select(`
      id, position,
      motions (
        id, title, full_text, outcome, sequence,
        meetings (id, meeting_date, committee, source_url, pdf_url)
      )
    `)
    .eq('person_id', personId)

  if (error) throw new Error(error.message)

  // Sort by meeting date descending
  const sorted = (data ?? []).sort((a: any, b: any) => {
    const dateA = a.motions?.meetings?.meeting_date ?? ''
    const dateB = b.motions?.meetings?.meeting_date ?? ''
    return dateB.localeCompare(dateA)
  })

  return sorted.map((row: any) => ({
    id: row.id,
    position: row.position,
    motion: {
      ...row.motions,
      meeting: row.motions?.meetings,
    }
  }))
}

// ─── Donations ────────────────────────────────────────────────────────────────

export async function getDonationsForPerson(personId: string): Promise<Donation[]> {
  // Get the 2022 election ID first
  const { data: electionData } = await supabase
    .from('elections')
    .select('id')
    .eq('year', 2022)
    .single()

  if (!electionData) return []

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('person_id', personId)
    .eq('election_id', electionData.id)
    .order('amount_cents', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Elections ────────────────────────────────────────────────────────────────

export async function get2022Results() {
  const { data: election } = await supabase
    .from('elections')
    .select('id')
    .eq('year', 2022)
    .single()

  if (!election) return []

  const { data, error } = await supabase
    .from('roles')
    .select(`
      id, title, ward, won, votes_received, vote_pct,
      persons (id, slug, full_name)
    `)
    .eq('election_id', election.id)
    .order('votes_received', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row: any) => ({
    ...row.persons,
    role: {
      id: row.id, title: row.title, ward: row.ward,
      won: row.won, votes_received: row.votes_received, vote_pct: row.vote_pct
    }
  }))
}
