import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Town Council - Ajax in Plain Sight',
  description: 'Meet the 7 elected councillors serving Ajax. View their voting records and profiles.',
}

// Static generation - no database queries during build
export const revalidate = 3600

export default async function Council() {
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

        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground mb-4">
              Council data will be populated once the database is connected and seeded with current councillor information. For now, visit the election results page to see 2022 candidates.
            </p>
            <Link href="/elections/2022">
              <Button>View 2022 Election Results</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-secondary/30 mt-8">
          <CardHeader>
            <CardTitle>Coming Soon: Live Council Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you connect your Supabase database and seed it with councillor data, this page will display:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Photos and contact information for all current councillors</li>
              <li>Individual profiles with complete voting history</li>
              <li>Campaign finance information from Form 4 filings</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

