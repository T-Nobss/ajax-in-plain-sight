import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Mail, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Town Council - Ajax in Plain Sight',
  description: 'Meet the 7 elected councillors serving Ajax. View their voting records and profiles.',
}

// ISR - revalidate every 1 hour when new meeting minutes arrive
export const revalidate = 3600

async function getCouncillors() {
  try {
    // Get current councillors (those with no end_date)
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        id,
        title,
        ward,
        person_id,
        persons:person_id(
          id,
          slug,
          full_name,
          ward,
          photo_url,
          email
        )
      `)
      .is('end_date', null)
      .order('persons(full_name)')

    if (error) {
      console.error('[v0] Error fetching roles:', error)
      return []
    }

    // Transform the nested data
    return (roles || []).map(role => ({
      ...role.persons,
      title: role.title,
      ward: role.ward || role.persons.ward
    }))
  } catch (err) {
    console.error('[v0] Failed to fetch councillors:', err)
    return []
  }
}

export default async function Council() {
  const councillors = await getCouncillors()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-pretty">Ajax Town Council</h1>
          <p className="text-lg text-muted-foreground">
            Meet the 7 elected councillors serving Ajax. Click on any councillor to view their voting record and campaign finance information.
          </p>
        </div>

        {councillors.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">
                Council data will be populated once you seed the database with current councillor information. For now, visit the election results page to see 2022 candidates.
              </p>
              <Link href="/elections/2022">
                <Button>View 2022 Election Results</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {councillors.map((councillor) => (
              <Card key={councillor.id} className="h-full hover:shadow-lg transition-shadow">
                {councillor.photo_url && (
                  <div className="w-full h-40 bg-muted overflow-hidden rounded-t-lg">
                    <img
                      src={councillor.photo_url}
                      alt={councillor.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 text-base">{councillor.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Title</p>
                    <p className="text-sm font-medium text-foreground">{councillor.title}</p>
                  </div>
                  {councillor.ward && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Ward</p>
                      <p className="text-sm font-medium text-foreground">{councillor.ward}</p>
                    </div>
                  )}
                  {councillor.email && (
                    <a
                      href={`mailto:${councillor.email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </a>
                  )}
                  <div className="pt-2 space-y-2">
                    <Link href={`/council/${councillor.slug}`} className="block">
                      <Button variant="outline" className="w-full justify-between text-xs" size="sm">
                        Profile <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                    <Link href={`/council/${councillor.slug}/votes`} className="block">
                      <Button variant="ghost" className="w-full text-xs" size="sm">
                        Voting Record
                      </Button>
                    </Link>
                    <Link href={`/council/${councillor.slug}/donors`} className="block">
                      <Button variant="ghost" className="w-full text-xs" size="sm">
                        Campaign Finance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Voting Records & Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you select a councillor, you&apos;ll be able to view their complete voting history on council motions and campaign donor information from Form 4 filings.
            </p>
            <p className="text-xs text-muted-foreground">
              This data will be automatically updated every time new meeting minutes are processed (typically weekly).
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

