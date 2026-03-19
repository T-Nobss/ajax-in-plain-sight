import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'About - Ajax in Plain Sight',
  description: 'Learn about the Ajax in Plain Sight project and why civic transparency matters.',
}

export default function About() {
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
        <h1 className="text-4xl font-bold mb-8 text-pretty">About Ajax in Plain Sight</h1>

        <div className="prose prose-base max-w-none space-y-6 text-foreground [&_p]:text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3">
          <p>
            Ajax in Plain Sight is a civic transparency platform dedicated to making local government data accessible to all residents of Ajax, Ontario. We believe that informed citizens make better voters and stronger communities.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to demystify local government and empower Ajax residents with the information they need to participate meaningfully in democracy. By aggregating and presenting council voting records, campaign finance data, and election results in an easy-to-understand format, we aim to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Increase government transparency and accountability</li>
            <li>Help voters make informed decisions</li>
            <li>Track how elected officials vote on important issues</li>
            <li>Expose the sources of campaign funding</li>
            <li>Create a historical record of local elections</li>
          </ul>

          <h2>What We Track</h2>
          
          <h3>Council Voting Records</h3>
          <p>
            We document every motion brought before Ajax Town Council, including the outcome and how each councillor voted. This data comes from official meeting minutes and council records published by the Town of Ajax.
          </p>

          <h3>Campaign Finance (Form 4s)</h3>
          <p>
            All candidates in Ajax municipal elections are required to file Form 4 financial statements showing contributions they received. We process these official documents to create a transparent record of who funded each candidate's campaign.
          </p>

          <h3>Election Results</h3>
          <p>
            We maintain detailed records of election results, including vote counts, percentages, and outcomes. For the 2022 municipal election, we provide complete data on all 26 candidates across all positions.
          </p>

          <h2>Data Sources</h2>
          <p>
            All data on Ajax in Plain Sight comes from official public sources:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Town of Ajax Council Meeting Minutes (events.ajax.ca)</li>
            <li>Town of Ajax Form 4 Financial Statements</li>
            <li>Town of Ajax Election Official Results</li>
            <li>Elections Canada</li>
          </ul>

          <h2>How We Use AI</h2>
          <p>
            To efficiently extract and structure data from PDFs and meeting documents, we use Claude (an AI assistant made by Anthropic) to parse meeting minutes and financial forms. AI helps us quickly convert unstructured documents into organized, searchable data. However, all extracted data is reviewed and validated against source documents.
          </p>

          <h2>Privacy & Accuracy</h2>
          <p>
            We are committed to accuracy and privacy:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>All data displayed is from official public records</li>
            <li>We do not store personal information beyond what is already public</li>
            <li>We regularly verify our data against official sources</li>
            <li>Errors or inaccuracies can be reported for correction</li>
          </ul>

          <h2>Open Data</h2>
          <p>
            We believe in the power of open data. While Ajax in Plain Sight provides a user-friendly interface, all underlying data is available for download in structured formats for researchers, journalists, and other interested parties.
          </p>

          <h2>Get Involved</h2>
          <p>
            Have a suggestion or found an error? We welcome feedback from the community. Data correction requests and feature suggestions can be submitted through our contact form.
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-6">
              Ready to explore the data? Start by viewing our current council members or the 2022 election results.
            </p>
            <div className="flex gap-4">
              <Link href="/council">
                <Button>View Council</Button>
              </Link>
              <Link href="/elections/2022">
                <Button variant="outline">Election Results</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
