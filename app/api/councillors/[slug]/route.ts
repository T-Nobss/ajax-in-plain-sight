import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const person = await prisma.person.findUnique({
      where: { slug: params.slug },
      include: {
        roles: {
          where: {
            end_date: null,
          },
        },
        votes: {
          include: {
            motion: {
              include: {
                meeting: true,
              },
            },
          },
          orderBy: {
            motion: {
              meeting: {
                meeting_date: 'desc',
              },
            },
          },
        },
        donations: {
          orderBy: {
            amount_cents: 'desc',
          },
        },
      },
    })

    if (!person) {
      return NextResponse.json({ error: 'Councillor not found' }, { status: 404 })
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('[v0] Error fetching councillor:', error)
    return NextResponse.json({ error: 'Failed to fetch councillor' }, { status: 500 })
  }
}
