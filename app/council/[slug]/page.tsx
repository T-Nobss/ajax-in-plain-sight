import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const { data: persons } = await supabase
      .from('persons')
      .select('slug')
      .in('id', await supabase
        .from('roles')
        .select('person_id')
        .is('end_date', null)
        .then(r => r.data?.map(x => x.person_id) || []))

    return (persons || []).map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

async function getCouncillorData(slug: string) {
  try {
    const { data: person, error } = await supabase
      .from('persons')
      .select(`
        *,
        roles!person_id(
          id,
          title,
          ward,
          end_date,
          elections:election_id(id, year)
        ),
        votes!person_id(
          id,
          position,
          motions:motion_id(
            id,
            title,
            outcome,
            meetings:meeting_id(meeting_date)
          )
        ),
        donations!person_id(
          id,
          donor_name,
          donor_address,
          amount_cents
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) return null
    return person
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const person = await getCouncillorData(params.slug)
  return {
    title: `${person?.full_name || 'Councillor'} - Ajax in Plain Sight`,
    description: `Voting record and profile for ${person?.full_name}, Ajax Town Councillor.`,
  }
}

export default async function CouncillorPage({ params }: { params: { slug: string } }) {
  const person = await getCouncillorData(params.slug)

  if (!person) notFound()

  const currentRole = person.roles?.[0]
  const voteStats = {
    for: person.votes?.filter((v: any) => v.position === 'for').length || 0,
    against: person.votes?.filter((v: any) => v.position === 'against').length || 0,
    absent: person.votes?.filter((v: any) => v.position === 'absent').length || 0,
  }

  const totalDonations = (person.donations || []).reduce((sum: number, d: any) => sum + d.amount_cents, 0)

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/council" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Council
          </Link>
          <div className="flex gap-2">
            <Link href={`/council/${person.slug}/votes`}>
              <Button variant="ghost" size="sm">
                Voting Record
              </Button>
            </Link>
            <Link href={`/council/${person.slug}/donors`}>
              <Button variant="ghost" size="sm">
                Campaign Finance
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.full_name} className="w-full rounded-lg mb-4 shadow-md" />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <span className="text-muted-foreground">No photo</span>
              </div>
            )}
            {person.email && (
              <a href={`mailto:${person.email}`} className="block">
                <Button className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </Button>
              </a>
            )}
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2 text-pretty">{person.full_name}</h1>
            {currentRole && (
              <div className="mb-6">
                <p className="text-lg text-primary font-medium">{currentRole.title}</p>
                {person.ward && <p className="text-muted-foreground">{person.ward}</p>}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Votes For</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{voteStats.for}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Votes Against</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-destructive">{voteStats.against}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{person.votes?.length || 0}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>Voting Record</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View all {person.votes?.length || 0} recorded votes on council motions, organized by date.
              </p>
              <Link href={`/council/${person.slug}/votes`}>
                <Button className="w-full">View Voting History →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>Campaign Finance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                See all {person.donations?.length || 0} documented campaign contributions.
              </p>
              <Link href={`/council/${person.slug}/donors`}>
                <Button className="w-full">View Donor List →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About This Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              This profile aggregates publicly available information about {person.full_name}, including voting records from official Ajax town council meeting minutes and campaign finance data from Form 4 filings.
            </p>
            <p>
              Voting records are updated automatically each week when new council minutes are published. Campaign finance data comes from the 2022 municipal election.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
