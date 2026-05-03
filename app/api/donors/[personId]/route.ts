import { NextResponse } from 'next/server'
import { getDonationsForPerson } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params
  try {
    const data = await getDonationsForPerson(personId)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
