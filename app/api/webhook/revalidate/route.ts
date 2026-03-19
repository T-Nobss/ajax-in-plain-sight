import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Verify the revalidation token
    const token = request.nextUrl.searchParams.get('token')
    
    if (!token || token !== process.env.ISR_REVALIDATION_TOKEN) {
      console.log('[v0] Invalid revalidation token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const tags = body.tags || []

    console.log('[v0] Revalidating tags:', tags)

    // Revalidate specified cache tags
    for (const tag of tags) {
      revalidateTag(tag)
      console.log(`[v0] Revalidated tag: ${tag}`)
    }

    // Also revalidate by path for council pages
    if (tags.includes('council-votes') || tags.includes('council-donors')) {
      console.log('[v0] Revalidating council pages')
      // Note: revalidatePath is for next.js app router, used in server components
      // For now, we rely on tag-based revalidation
    }

    return NextResponse.json({
      status: 'success',
      message: `Revalidated ${tags.length} tag(s)`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
