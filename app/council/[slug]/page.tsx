import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Mail } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const persons = await prisma.person.findMany({
      where: {
        roles: {
          some: {
            end_date: null,
          },
        },
      },
      select: {
        slug: true,
      },
    })

    return persons.map((person) => ({
      slug: person.slug,
    }))
  } catch (error) {
    console.error('[v0] Error generating static params:', error)
    return []
  }
}

async function getCouncillorData(slug: string) {
  try {
    const person = await prisma.person.findUnique({
      where: { slug },
      include: {
        roles: {
          where: {
            end_date: null,
          },
          include: {
            election: true,
          },
        },
        votes: {
          include: {
            motion: {
              include: {
                meeting: true,
              },
            },
          },
          orderBy: {
            motion: {
              meeting: {
                meeting_date: 'desc',
              },
            },
          },
          take: 50,
        },
        donations: {
          orderBy: {
            amount_cents: 'desc',
          },
        },
      },
    })

    return person
  } catch (error) {
    console.error('[v0] Error fetching councillor:', error)
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

  if (!person) {
    notFound()
  }

  const currentRole = person.roles[0]
  const voteStats = {
    for: person.votes.filter((v) => v.position === 'for').length,
    against: person.votes.filter((v) => v.position === 'against').length,
    absent: person.votes.filter((v) => v.position === 'absent').length,
  }

  const totalDonations = person.donations.reduce((sum, d) => sum + d.amount_cents, 0)

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
        {/* Profile Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Photo */}
          <div>
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.full_name} className="w-full rounded-lg mb-4 shadow-md" />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <span className="text-muted-foreground">No photo available</span>
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

          {/* Info */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2 text-pretty">{person.full_name}</h1>
            {currentRole && (
              <div className="mb-6">
                <p className="text-lg text-primary font-medium">{currentRole.title}</p>
                {person.ward && <p className="text-muted-foreground">{person.ward}</p>}
                {currentRole.election && (
                  <p className="text-sm text-muted-foreground mt-2">Elected in {currentRole.election.year}</p>
                )}
              </div>
            )}

            {/* Stats */}
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
                  <p className="text-2xl font-bold">{person.votes.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle>Voting Record</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View all {person.votes.length} recorded votes on council motions, organized by date and committee.
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
                See all {person.donations.length} documented campaign contributions and donors from the 2022 election.
              </p>
              <Link href={`/council/${person.slug}/donors`}>
                <Button className="w-full">View Donor List →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
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

      <footer className="border-t border-border bg-muted/30 mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Ajax in Plain Sight • Civic Transparency for Ajax, Ontario</p>
        </div>
      </footer>
    </div>
  )
}

