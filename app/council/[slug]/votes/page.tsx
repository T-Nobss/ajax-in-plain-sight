import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const revalidate = 3600

// Generate static params for all councillors
export async function generateStaticParams() {
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
}

async function getCouncillorVotes(slug: string) {
  const person = await prisma.person.findUnique({
    where: { slug },
    include: {
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
      },
      roles: {
        where: {
          end_date: null,
        },
      },
    },
  })

  if (!person) {
    notFound()
  }

  return person
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const person = await prisma.person.findUnique({
    where: { slug: params.slug },
  })

  return {
    title: `${person?.full_name} - Voting Record - Ajax in Plain Sight`,
    description: `Complete voting record for ${person?.full_name} on Ajax town council`,
  }
}

export default async function VotesPage({ params }: { params: { slug: string } }) {
  const person = await getCouncillorVotes(params.slug)
  const role = person.roles[0]

  const totalVotes = person.votes.length
  const forVotes = person.votes.filter((v) => v.position === 'for').length
  const againstVotes = person.votes.filter((v) => v.position === 'against').length
  const absentVotes = person.votes.filter((v) => v.position === 'absent').length
  const forPercentage = totalVotes > 0 ? Math.round((forVotes / totalVotes) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/council" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Council
          </Link>
          <div className="flex gap-2">
            <Link href={`/council/${person.slug}`}>
              <Button variant="ghost" size="sm">
                Profile
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-pretty">{person.full_name}</h1>
          {role && (
            <p className="text-lg text-muted-foreground">
              {role.title} {person.ward && `• ${person.ward}`}
            </p>
          )}
        </div>

        {/* Voting Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{totalVotes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Favour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{forVotes}</p>
              <p className="text-xs text-muted-foreground mt-1">{forPercentage}% of votes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Against</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{againstVotes}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalVotes > 0 ? Math.round((againstVotes / totalVotes) * 100) : 0}% of votes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{absentVotes}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalVotes > 0 ? Math.round((absentVotes / totalVotes) * 100) : 0}% of votes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Voting Record */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Voting Record</h2>

          {person.votes.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No voting records available yet. Check back after meeting minutes are processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {person.votes.map((vote) => (
                <Card key={vote.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-1">{vote.motion.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {vote.motion.meeting.meeting_date
                              ? new Date(vote.motion.meeting.meeting_date).toLocaleDateString()
                              : 'Unknown date'}
                          </span>
                          <span>{vote.motion.meeting.committee}</span>
                          <span>Motion #{vote.motion.sequence}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            vote.position === 'for'
                              ? 'bg-primary/10 text-primary'
                              : vote.position === 'against'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-secondary/10 text-secondary-foreground'
                          }`}
                        >
                          {vote.position === 'for' && 'In Favour'}
                          {vote.position === 'against' && 'Against'}
                          {vote.position === 'absent' && 'Absent'}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            vote.motion.outcome === 'CARRIED'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {vote.motion.outcome}
                        </div>
                      </div>
                    </div>
                    {vote.motion.full_text && (
                      <details className="cursor-pointer">
                        <summary className="text-sm text-primary hover:text-primary/80">View full motion text</summary>
                        <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{vote.motion.full_text}</p>
                      </details>
                    )}
                    {vote.motion.meeting.source_url && (
                      <Link href={vote.motion.meeting.source_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3">
                        <Button variant="outline" size="sm" className="gap-2">
                          Original Minutes <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30 mt-16 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Ajax in Plain Sight • Civic Transparency for Ajax, Ontario</p>
        </div>
      </footer>
    </div>
  )
}
