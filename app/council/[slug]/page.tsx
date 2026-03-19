import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const prisma = new PrismaClient()

export const revalidate = 3600 // ISR: revalidate hourly

export const generateStaticParams = async () => {
  try {
    const councillors = await prisma.role.findMany({
      where: {
        endDate: null,
      },
      include: {
        person: true,
      },
    })

    return councillors.map((role) => ({
      slug: role.person.slug,
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
                meetingDate: 'desc',
              },
            },
          },
          take: 50,
        },
        donations: true,
      },
    })

    return person
  } catch (error) {
    console.error('[v0] Error fetching councillor:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (params as any).slug
  const person = await getCouncillorData(slug)

  return {
    title: `${person?.fullName || 'Councillor'} - Ajax in Plain Sight`,
    description: `Voting record and profile for ${person?.fullName}, Ajax Town Councillor.`,
  }
}

export default async function CouncillorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (params as any).slug
  const person = await getCouncillorData(slug)

  if (!person) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/council" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
              <ChevronLeft className="w-4 h-4" />
              Back to Council
            </Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-2xl font-bold">Councillor not found</h1>
        </main>
      </div>
    )
  }

  const currentRole = person.roles.find((r) => !r.endDate)
  const voteStats = {
    for: person.votes.filter((v) => v.position === 'for').length,
    against: person.votes.filter((v) => v.position === 'against').length,
    abstain: person.votes.filter((v) => v.position === 'abstain').length,
  }

  const totalDonations = person.donations.reduce((sum, d) => sum + d.amountCents, 0)

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/council" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Council
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{person.fullName}</h1>
            {currentRole && (
              <>
                <p className="text-xl text-muted-foreground mb-2">{currentRole.title}</p>
                {currentRole.election && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Elected in {currentRole.election.year}
                  </p>
                )}
              </>
            )}
            {person.bio && <p className="text-lg text-foreground mb-6">{person.bio}</p>}
            <div className="flex flex-wrap gap-4">
              {person.email && (
                <a href={`mailto:${person.email}`} className="text-primary hover:text-primary/80">
                  Email: {person.email}
                </a>
              )}
              {person.ward && (
                <div className="text-muted-foreground">
                  Ward: {person.ward}
                </div>
              )}
            </div>
          </div>

          {person.votes.length > 0 && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Voting Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Votes For</p>
                    <p className="text-2xl font-bold text-primary">{voteStats.for}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Votes Against</p>
                    <p className="text-2xl font-bold text-destructive">{voteStats.against}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Abstentions</p>
                    <p className="text-2xl font-bold text-muted-foreground">{voteStats.abstain}</p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">Total Votes Cast</p>
                    <p className="text-lg font-semibold">{person.votes.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs for Votes and Donors */}
        <Tabs defaultValue="votes" className="mb-12">
          <TabsList>
            <TabsTrigger value="votes">Voting Record</TabsTrigger>
            <TabsTrigger value="donors">Campaign Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="votes" className="space-y-6">
            {person.votes.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">
                    No voting records available yet. Meeting minutes will be processed in Phase 4.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {person.votes.map((vote) => (
                    <Card key={vote.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{vote.motion.title}</p>
                              {vote.motion.meeting && (
                                <p className="text-sm text-muted-foreground">
                                  {new Date(vote.motion.meeting.meetingDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                                vote.position === 'for'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : vote.position === 'against'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}
                            >
                              {vote.position.charAt(0).toUpperCase() + vote.position.slice(1)}
                            </span>
                          </div>
                          {vote.motion.outcome && (
                            <p className="text-xs text-muted-foreground">
                              Motion {vote.motion.outcome}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            {person.donations.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">
                    Campaign finance data will be available once Form 4 documents are processed in Phase 4.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle>Total Campaign Donations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      ${(totalDonations / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      From {person.donations.length} donor{person.donations.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  {person.donations.map((donation) => (
                    <Card key={donation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{donation.donorName}</p>
                            {donation.donorAddress && (
                              <p className="text-sm text-muted-foreground">{donation.donorAddress}</p>
                            )}
                            {donation.source && (
                              <p className="text-xs text-muted-foreground mt-1">Source: {donation.source}</p>
                            )}
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <p className="font-semibold text-foreground">
                              ${(donation.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Back Link */}
        <div className="flex justify-center pt-6 border-t border-border">
          <Link href="/council">
            <Button variant="ghost">← Back to Council</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
