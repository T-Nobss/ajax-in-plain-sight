import { NextResponse } from 'next/server'
import { getVotesForPerson } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params
  try {
    const data = await getVotesForPerson(personId)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
