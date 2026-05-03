import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  const secret = process.env.REVALIDATION_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slugs: string[] = body.slugs ?? []

  revalidatePath('/council')
  for (const slug of slugs) {
    revalidatePath(`/council/${slug}`)
    revalidatePath(`/council/${slug}/votes`)
    revalidatePath(`/council/${slug}/donors`)
  }

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
}
