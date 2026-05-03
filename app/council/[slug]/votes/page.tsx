import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 3600

async function getCouncillorVotes(slug: string) {
  try {
    const { data: person } = await supabase
      .from('persons')
      .select(`
        id,
        full_name,
        votes!person_id(
          id,
          position,
          motions:motion_id(
            id,
            title,
            full_text,
            outcome,
            meetings:meeting_id(meeting_date, committee)
          )
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
  const person = await getCouncillorVotes(params.slug)
  return {
    title: `${person?.full_name || 'Councillor'} Voting Record - Ajax in Plain Sight`,
    description: `Complete voting record for ${person?.full_name} on Ajax town council motions.`,
  }
}

export default async function VotesPage({ params }: { params: { slug: string } }) {
  const person = await getCouncillorVotes(params.slug)

  if (!person) notFound()

  const votes = (person.votes || []).sort((a: any, b: any) => {
    return new Date(b.motions.meetings.meeting_date).getTime() - 
           new Date(a.motions.meetings.meeting_date).getTime()
  })

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
          <p className="text-lg text-muted-foreground">Voting Record ({votes.length} votes)</p>
        </div>

        {votes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">
                No voting records available yet. Once meeting minutes are processed, votes will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {votes.map((vote: any, idx: number) => {
              const motion = vote.motions
              const meeting = motion.meetings
              const positionColor = vote.position === 'for' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : vote.position === 'against'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'

              return (
                <Card key={vote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{motion.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(meeting.meeting_date).toLocaleDateString()} • {meeting.committee}
                        </p>
                        {motion.full_text && (
                          <p className="text-sm text-foreground mt-3 leading-relaxed">{motion.full_text}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${positionColor}`}>
                          {vote.position === 'for' ? 'For' : vote.position === 'against' ? 'Against' : 'Absent'}
                        </span>
                        {motion.outcome && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Motion {motion.outcome}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
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
