import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Award, Users } from 'lucide-react'

export const metadata = {
  title: '2022 Election Results - Ajax in Plain Sight',
  description: 'Complete results from the 2022 Ajax municipal election. Vote counts and percentages for all 26 candidates.',
}

// Sample candidate data - this will be replaced with Prisma queries in Phase 3
const candidates2022 = [
  {
    id: '1',
    name: 'Sheila Levy',
    slug: 'sheila-levy',
    position: 'Mayor',
    won: true,
    votesReceived: 14203,
    votePct: 52.3,
  },
  {
    id: '2',
    name: 'Rod Truscott',
    slug: 'rod-truscott',
    position: 'Councillor',
    won: true,
    votesReceived: 8941,
    votePct: 48.2,
  },
  {
    id: '3',
    name: 'Monica Beckerson',
    slug: 'monica-beckerson',
    position: 'Councillor',
    won: true,
    votesReceived: 8234,
    votePct: 44.4,
  },
  {
    id: '4',
    name: 'Sean Duffy',
    slug: 'sean-duffy',
    position: 'Councillor',
    won: true,
    votesReceived: 7920,
    votePct: 42.7,
  },
  {
    id: '5',
    name: 'Victoria Macleod',
    slug: 'victoria-macleod',
    position: 'Councillor',
    Won: true,
    votesReceived: 7654,
    votePct: 41.3,
  },
  {
    id: '6',
    name: 'Pat Moreira',
    slug: 'pat-moreira',
    position: 'Councillor',
    won: true,
    votesReceived: 7432,
    votePct: 40.1,
  },
  {
    id: '7',
    name: 'Bev Aitcheson',
    slug: 'bev-aitcheson',
    position: 'Councillor',
    won: true,
    votesReceived: 7189,
    votePct: 38.8,
  },
  {
    id: '8',
    name: 'John Smith',
    slug: 'john-smith',
    position: 'Councillor (Runner-up)',
    won: false,
    votesReceived: 6821,
    votePct: 36.8,
  },
]

export default function Elections2022() {
  const winners = candidates2022.filter((c) => c.won)
  const runnerUps = candidates2022.filter((c) => !c.won)

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
          <h1 className="text-4xl font-bold mb-4 text-pretty">2022 Ajax Municipal Election Results</h1>
          <p className="text-lg text-muted-foreground">
            Complete results from the October 24, 2022 election for Mayor and Town Council.
          </p>
        </div>

        {/* Election Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Mayor Elected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">Sheila Levy</p>
              <p className="text-sm text-muted-foreground mt-2">52.3% of votes (14,203)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Councillors Elected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">7</p>
              <p className="text-sm text-muted-foreground mt-2">Out of 26 candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Election Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">Oct 24, 2022</p>
              <p className="text-sm text-muted-foreground mt-2">Completed successfully</p>
            </CardContent>
          </Card>
        </div>

        {/* Mayor Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Mayor Election Results</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-foreground">Sheila Levy</span>
                      <span className="text-sm text-muted-foreground">52.3%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div className="bg-primary h-3 rounded-full" style={{ width: '52.3%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">14,203 votes</p>
                  </div>
                  <Link href="/elections/2022/sheila-levy">
                    <Button variant="ghost" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Council Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Council Election Results (Elected)</h2>
          <div className="space-y-3">
            {winners.map((candidate, index) => (
              <Card key={candidate.id}>
                <CardContent className="pt-6">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">Position {index + 1}</p>
                        </div>
                        <span className="text-sm text-muted-foreground font-semibold">{candidate.votePct}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${candidate.votePct}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{candidate.votesReceived.toLocaleString()} votes</p>
                    </div>
                    <Link href={`/elections/2022/${candidate.slug}`}>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Runner-ups */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Other Candidates</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {runnerUps.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.votesReceived.toLocaleString()} votes ({candidate.votePct}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="bg-secondary/30">
          <CardHeader>
            <CardTitle>Want to learn more?</CardTitle>
            <CardDescription>Explore voting records and campaign finance data for elected officials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/council">
                <Button variant="outline">View Current Council</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
