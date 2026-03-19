import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Register to Vote - Ajax in Plain Sight',
  description: 'Register to vote in Ajax municipal elections. Information and links to official registration.',
}

export default function Register() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-4 text-pretty">Register to Vote in Ajax</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Your vote matters. Make sure you're registered before the next election.
        </p>

        {/* Registration Requirements */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Who Can Vote?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Be a Canadian citizen</span>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Be 18 years or older on election day</span>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Reside in Ajax for at least 12 consecutive months</span>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">Not be disqualified by law</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Residency Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">
                To vote in Ajax municipal elections, you must be:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>An owner, resident, or tenant of property in Ajax, OR</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>A spouse or adult child of a property owner, OR</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Have resided in Ajax for 12 consecutive months</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Registration Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How to Register</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-lg">Visit the Town of Ajax Elections Office</CardTitle>
                    <CardDescription>In person registration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-sm text-muted-foreground mb-3">
                  Visit the Town of Ajax Elections office to register in person. Bring proof of residency and identification.
                </p>
                <Button className="w-full sm:w-auto" asChild>
                  <a href="https://www.ajax.ca/en/residents/elections.html" target="_blank" rel="noopener noreferrer">
                    Find Elections Office Details
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-lg">Online Registration</CardTitle>
                    <CardDescription>Quick and convenient</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-sm text-muted-foreground mb-3">
                  Many municipalities offer online registration. Check the Town of Ajax website for online voter registration options.
                </p>
                <Button className="w-full sm:w-auto" asChild>
                  <a href="https://www.ajax.ca/en/residents/elections.html" target="_blank" rel="noopener noreferrer">
                    Register Online
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-lg">On Election Day</CardTitle>
                    <CardDescription>Last-minute registration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-sm text-muted-foreground">
                  You can register on election day at your voting location, but it's recommended to register in advance to streamline the process.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Dates */}
        <Card className="mb-12 bg-secondary/30">
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-foreground">Voter Registration Deadline</p>
              <p className="text-sm text-muted-foreground">Usually 15 days before election day</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-foreground">Early Voting Period</p>
              <p className="text-sm text-muted-foreground">Check the Town of Ajax website for dates</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold text-foreground">Election Day</p>
              <p className="text-sm text-muted-foreground">Municipal elections are held every 4 years</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Town of Ajax Elections</CardTitle>
                <CardDescription>Official municipal elections page</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visit the official Town of Ajax website for the most current election information and registration details.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.ajax.ca/en/residents/elections.html" target="_blank" rel="noopener noreferrer">
                    Visit Website →
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elections Canada</CardTitle>
                <CardDescription>Federal voting information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For federal elections, visit Elections Canada to register and find your polling location.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.elections.ca" target="_blank" rel="noopener noreferrer">
                    Visit Website →
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Questions */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 opacity-90">
              For specific questions about Ajax municipal voter registration, contact the Town of Ajax Elections office directly.
            </p>
            <Button variant="secondary" asChild>
              <a href="https://www.ajax.ca/en/residents/elections.html" target="_blank" rel="noopener noreferrer">
                Contact Elections Office
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
