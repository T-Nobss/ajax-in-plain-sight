import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const councillors = await prisma.role.findMany({
      where: {
        endDate: null, // Currently serving
      },
      include: {
        person: true,
      },
      orderBy: {
        votesReceived: 'desc',
      },
    })

    return NextResponse.json(councillors)
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch councillors' }, { status: 500 })
  }
}
