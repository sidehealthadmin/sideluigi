import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse()
  }

  try {
    const cases = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        patientName: true,
        insurerName: true,
        medication: true,
        denialType: true,
        condition: true,
        status: true,
        createdAt: true,
        denialDate: true,
        reviewNotes: true,
      },
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}
