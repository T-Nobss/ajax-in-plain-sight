import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const councillors = await prisma.person.findMany({
      where: {
        roles: {
          some: {
            end_date: null,
          },
        },
      },
      include: {
        roles: {
          where: {
            end_date: null,
          },
        },
        votes: {
          select: { id: true },
        },
        donations: {
          select: { amount_cents: true },
        },
      },
    })

    return NextResponse.json(councillors)
  } catch (error) {
    console.error('[v0] Error fetching councillors:', error)
    return NextResponse.json({ error: 'Failed to fetch councillors' }, { status: 500 })
  }
}
