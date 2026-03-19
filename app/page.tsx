import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Ajax in Plain Sight</div>
          <div className="flex gap-6">
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/register" className="text-foreground hover:text-primary transition-colors">
              Register
            </Link>
            <Link href="/council" className="text-foreground hover:text-primary transition-colors">
              Council
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-6 text-pretty">
              Civic Transparency for Ajax, Ontario
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Access town council voting records, campaign finance data, and election results. Making governance visible and accountable.
            </p>
            <div className="flex gap-4">
              <Link href="/council">
                <Button size="lg" className="gap-2">
                  View Council Members <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/elections/2022">
                <Button size="lg" variant="outline">
                  2022 Election Results
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>7 Councillors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Serving Ajax today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Voting Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Every motion tracked</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Campaign Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Full transparency</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>26 Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">2022 election data</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-pretty">What You Can Learn</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Council Voting Patterns</CardTitle>
                <CardDescription>See how your representatives vote on every motion and proposal</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track voting records across all council members. Filter by date, topic, or vote outcome.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Finance</CardTitle>
                <CardDescription>Follow the money in Ajax elections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View all candidate donations from official Form 4 filings. Understand who funds local campaigns.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>Complete 2022 election data at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See vote counts, percentages, and outcomes for all candidates. Historical data for comparison.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-pretty">Make Your Voice Heard</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            An informed electorate is a powerful one. Use this data to make better voting decisions and hold your representatives accountable.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Register to Vote
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>Ajax in Plain Sight - Civic Transparency for Ajax, Ontario</p>
          <p className="mt-2">Data sourced from official Town of Ajax records and Elections Canada</p>
        </div>
      </footer>
    </div>
  )
}
