import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')
    const motionId = searchParams.get('motionId')

    let query: any = {}

    if (personId) {
      query.personId = personId
    }
    if (motionId) {
      query.motionId = motionId
    }

    const votes = await prisma.vote.findMany({
      where: query,
      include: {
        person: true,
        motion: {
          include: {
            meeting: true,
          },
        },
      },
      orderBy: {
        motion: {
          meeting: {
            meetingDate: 'desc',
          },
        },
      },
      take: 100,
    })

    return NextResponse.json(votes)
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
  }
}
