import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')
    const electionId = searchParams.get('electionId')

    let query: any = {}

    if (personId) {
      query.personId = personId
    }
    if (electionId) {
      query.electionId = electionId
    }

    const donations = await prisma.donation.findMany({
      where: query,
      include: {
        person: true,
        election: true,
      },
      orderBy: {
        donationDate: 'desc',
      },
      take: 500,
    })

    return NextResponse.json(donations)
  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }
}
