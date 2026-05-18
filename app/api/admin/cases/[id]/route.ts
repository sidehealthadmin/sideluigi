import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/auth'
import { approvePDF } from '@/lib/pdf'

type RouteContext = { params: { id: string } }

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse()
  }

  const { id } = context.params

  try {
    const caseRecord = await prisma.case.findUnique({
      where: { id },
    })

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json({ case: caseRecord })
  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  if (!checkAdminAuth(request)) {
    return unauthorizedResponse()
  }

  const { id } = context.params

  try {
    const body = await request.json()
    const { action, notes } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id },
    })

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (action === 'approve') {
      let approvedPdfPath: string | null = null

      // Move PDF to approved folder
      if (caseRecord.pdfPath) {
        try {
          approvedPdfPath = await approvePDF(id)
        } catch (pdfError) {
          console.error('Error moving PDF to approved folder:', pdfError)
        }
      }

      const updated = await prisma.case.update({
        where: { id },
        data: {
          status: 'approved',
          reviewNotes: notes || null,
          pdfPath: approvedPdfPath || caseRecord.pdfPath,
        },
      })

      console.log(`Case ${id} APPROVED. PDF ready for EHR submission at: ${approvedPdfPath}`)
      return NextResponse.json({ case: updated })
    }

    if (action === 'reject') {
      if (!notes) {
        return NextResponse.json(
          { error: 'Rejection notes are required' },
          { status: 400 }
        )
      }

      const updated = await prisma.case.update({
        where: { id },
        data: {
          status: 'rejected',
          reviewNotes: notes,
        },
      })

      console.log(`Case ${id} REJECTED. Notes: ${notes}`)
      return NextResponse.json({ case: updated })
    }

    // Fallback — should not be reached due to action validation above
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}
