import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 3600

async function getCouncillorDonors(slug: string) {
  try {
    const { data: person } = await supabase
      .from('persons')
      .select(`
        id,
        full_name,
        donations!person_id(
          id,
          donor_name,
          donor_address,
          amount_cents,
          source
        )
      `)
      .eq('slug', slug)
      .single()

    if (!person) return null
    return person
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const person = await getCouncillorDonors(params.slug)
  return {
    title: `${person?.full_name || 'Councillor'} Campaign Finance - Ajax in Plain Sight`,
    description: `Campaign donations and financing for ${person?.full_name} from the 2022 election.`,
  }
}

export default async function DonorsPage({ params }: { params: { slug: string } }) {
  const person = await getCouncillorDonors(params.slug)

  if (!person) notFound()

  const donations = (person.donations || []).sort((a: any, b: any) => b.amount_cents - a.amount_cents)
  const totalDonations = donations.reduce((sum: number, d: any) => sum + d.amount_cents, 0)

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/council/${params.slug}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{person.full_name}</h1>
          <p className="text-lg text-muted-foreground">Campaign Finance - 2022 Election</p>
        </div>

        {donations.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">
                No campaign donation records available yet. Form 4 documents will be processed and appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-secondary/30 mb-8">
              <CardHeader>
                <CardTitle>Total Campaign Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">
                  ${(totalDonations / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  From {donations.length} donor{donations.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {donations.map((donation: any) => (
                <Card key={donation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{donation.donor_name}</p>
                        {donation.donor_address && (
                          <p className="text-sm text-muted-foreground mt-1">{donation.donor_address}</p>
                        )}
                        {donation.source && (
                          <p className="text-xs text-muted-foreground mt-2">Source: {donation.source}</p>
                        )}
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-semibold text-foreground">
                          ${(donation.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="mt-12">
          <Link href={`/council/${params.slug}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
