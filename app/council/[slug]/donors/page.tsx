import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const revalidate = 3600

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

async function getCouncillorDonors(slug: string) {
  const person = await prisma.person.findUnique({
    where: { slug },
    include: {
      donations: {
        orderBy: {
          amount_cents: 'desc',
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
    title: `${person?.full_name} - Campaign Finance - Ajax in Plain Sight`,
    description: `Campaign contributions and donors for ${person?.full_name}`,
  }
}

export default async function DonorsPage({ params }: { params: { slug: string } }) {
  const person = await getCouncillorDonors(params.slug)
  const role = person.roles[0]

  const totalDonations = person.donations.reduce((sum, d) => sum + d.amount_cents, 0)
  const avgDonation = person.donations.length > 0 ? Math.round(totalDonations / person.donations.length) : 0

  // Group donations by donor
  const donorGroups = person.donations.reduce(
    (acc, donation) => {
      const donor = donation.donor_name
      if (!acc[donor]) {
        acc[donor] = {
          name: donor,
          address: donation.donor_address,
          total: 0,
          count: 0,
          donations: [],
        }
      }
      acc[donor].total += donation.amount_cents
      acc[donor].count += 1
      acc[donor].donations.push(donation)
      return acc
    },
    {} as Record<
      string,
      {
        name: string
        address: string | null
        total: number
        count: number
        donations: typeof person.donations
      }
    >
  )

  const topDonors = Object.values(donorGroups).sort((a, b) => b.total - a.total).slice(0, 10)

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
            <Link href={`/council/${person.slug}/votes`}>
              <Button variant="ghost" size="sm">
                Voting Record
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

        {/* Campaign Finance Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                ${(totalDonations / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{person.donations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{Object.keys(donorGroups).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">${(avgDonation / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Donors */}
        {topDonors.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top 10 Donors</h2>
            <div className="space-y-3">
              {topDonors.map((donor) => (
                <Card key={donor.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{donor.name}</p>
                        {donor.address && <p className="text-sm text-muted-foreground">{donor.address}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{donor.count} donation(s)</p>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        ${(donor.total / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(donor.total / totalDonations) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Donations */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Donations</h2>

          {person.donations.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No campaign finance data available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {person.donations.map((donation) => (
                <Card key={donation.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{donation.donor_name}</p>
                        {donation.donor_address && (
                          <p className="text-xs text-muted-foreground truncate">{donation.donor_address}</p>
                        )}
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-semibold text-foreground">
                          ${(donation.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {donation.donation_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(donation.donation_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Information */}
        <Card className="mt-12 bg-secondary/30">
          <CardHeader>
            <CardTitle>About Campaign Finance Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80 space-y-3">
            <p>
              This information comes from Form 4 Financial Statements filed with the Town of Ajax for the 2022 municipal election.
            </p>
            <p>
              All donations are publicly available and sourced from official election records. These donations help fund campaign activities like advertising, events, and outreach.
            </p>
            <p>
              Data is current as of the filing date. For the most up-to-date information, visit the Town of Ajax website.
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
