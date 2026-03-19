import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Mail, Globe, MapPin } from 'lucide-react'

export const generateStaticParams = async () => {
  // This will be replaced with database queries in Phase 3
  const slugs = [
    'sheila-levy',
    'rod-truscott',
    'monica-beckerson',
    'sean-duffy',
    'victoria-macleod',
    'pat-moreira',
    'bev-aitcheson',
    'john-smith',
  ]

  return slugs.map((slug) => ({
    slug: slug,
  }))
}

const getCandidateData = (slug: string) => {
  const candidates: Record<string, any> = {
    'sheila-levy': {
      name: 'Sheila Levy',
      position: 'Mayor (Elected)',
      ward: 'At Large',
      votesReceived: 14203,
      votePct: 52.3,
      bio: 'Sheila Levy has served as Mayor of Ajax since 2022. With a background in municipal governance and community engagement, she is committed to sustainable development and fiscal responsibility.',
      email: 'slevy@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'rod-truscott': {
      name: 'Rod Truscott',
      position: 'Councillor (Elected)',
      ward: 'Ward 1',
      votesReceived: 8941,
      votePct: 48.2,
      bio: 'Rod Truscott is a dedicated community leader focused on infrastructure improvements and public safety initiatives.',
      email: 'rtruscott@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'monica-beckerson': {
      name: 'Monica Beckerson',
      position: 'Councillor (Elected)',
      ward: 'Ward 2',
      votesReceived: 8234,
      votePct: 44.4,
      bio: 'Monica Beckerson advocates for environmental sustainability and youth engagement in municipal decision-making.',
      email: 'mbeckerson@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'sean-duffy': {
      name: 'Sean Duffy',
      position: 'Councillor (Elected)',
      ward: 'Ward 3',
      votesReceived: 7920,
      votePct: 42.7,
      bio: 'Sean Duffy brings private sector experience to council, focusing on business development and economic growth.',
      email: 'sduffy@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'victoria-macleod': {
      name: 'Victoria Macleod',
      position: 'Councillor (Elected)',
      ward: 'Ward 4',
      votesReceived: 7654,
      votePct: 41.3,
      bio: 'Victoria Macleod is passionate about housing affordability and community services.',
      email: 'vmacleod@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'pat-moreira': {
      name: 'Pat Moreira',
      position: 'Councillor (Elected)',
      ward: 'Ward 5',
      votesReceived: 7432,
      votePct: 40.1,
      bio: 'Pat Moreira champions transportation initiatives and quality of life improvements for Ajax residents.',
      email: 'pmoreira@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'bev-aitcheson': {
      name: 'Bev Aitcheson',
      position: 'Councillor (Elected)',
      ward: 'Ward 6',
      votesReceived: 7189,
      votePct: 38.8,
      bio: 'Bev Aitcheson works on heritage preservation and cultural community programming.',
      email: 'baitcheson@ajax.ca',
      photo: '/placeholder-user.jpg',
    },
    'john-smith': {
      name: 'John Smith',
      position: 'Candidate',
      ward: 'At Large',
      votesReceived: 6821,
      votePct: 36.8,
      bio: 'John Smith was a candidate in the 2022 election.',
      email: 'jsmith@example.com',
      photo: '/placeholder-user.jpg',
    },
  }

  return candidates[slug] || null
}

export const metadata = {
  title: 'Candidate Profile - Ajax in Plain Sight',
  description: 'View candidate profile, voting records, and campaign finance information.',
}

export default function CandidatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (params as any).slug
  const candidate = getCandidateData(slug)

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/elections/2022" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
              <ChevronLeft className="w-4 h-4" />
              Back to Elections
            </Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-2xl font-bold">Candidate not found</h1>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/elections/2022" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Elections
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2 text-pretty">{candidate.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">{candidate.position}</p>
            <p className="text-lg text-foreground mb-6">{candidate.bio}</p>
            <div className="flex flex-wrap gap-4">
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-primary hover:text-primary/80">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{candidate.email}</span>
                </a>
              )}
              {candidate.ward && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{candidate.ward}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>2022 Election Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vote Percentage</p>
                  <p className="text-3xl font-bold text-primary">{candidate.votePct}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Votes Received</p>
                  <p className="text-2xl font-bold text-foreground">{candidate.votesReceived.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Voting Record</CardTitle>
              <CardDescription>Council meeting votes and motions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Full voting records will be available in Phase 3 of the project once council meeting data is populated.
              </p>
              <Button variant="outline" disabled size="sm">
                View Voting History (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Finance</CardTitle>
              <CardDescription>Donations and funding sources</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Campaign donation data from Form 4 filings will be available in Phase 3 once data is processed.
              </p>
              <Button variant="outline" disabled size="sm">
                View Donations (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back Link */}
        <div className="flex justify-center pt-6 border-t border-border">
          <Link href="/elections/2022">
            <Button variant="ghost">← Back to 2022 Election Results</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
