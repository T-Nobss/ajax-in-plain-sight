import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify the request has a valid secret token
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { tag } = await request.json()

    if (!tag) {
      return NextResponse.json({ error: 'Missing tag parameter' }, { status: 400 })
    }

    // Revalidate ISR pages based on tag
    if (tag === 'council') {
      revalidateTag('council')
      revalidateTag('councillors')
    } else if (tag === 'elections') {
      revalidateTag('elections')
    } else if (tag === 'all') {
      revalidateTag('council')
      revalidateTag('councillors')
      revalidateTag('elections')
    }

    console.log(`[v0] Revalidated tag: ${tag}`)
    return NextResponse.json({ revalidated: true, tag })
  } catch (err) {
    console.error('[v0] Revalidation error:', err)
    return NextResponse.json(
      { error: 'Failed to revalidate', details: String(err) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Revalidation API',
      note: 'POST with Authorization header and { tag: "council|elections|all" }',
    },
    { status: 200 }
  )
}
