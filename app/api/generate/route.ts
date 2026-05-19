import { NextRequest, NextResponse } from 'next/server'
import { generateAppealLetter, mapDenialType, IntakeData, LineItem } from '@/lib/generate'
import { generatePDF } from '@/lib/pdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const required = ['patientName', 'insurerName', 'denialDate', 'medication']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Map raw denial type string if needed
    const denialType = body.denialType
      ? mapDenialType(body.denialType)
      : mapDenialType(body.denialReason || '')

    // Parse line items for cost justification if provided
    const lineItems: LineItem[] | undefined = body.lineItems
      ? body.lineItems.map((item: any) => ({
          cptCode: String(item.cptCode || ''),
          description: String(item.description || ''),
          billedAmount: Number(item.billedAmount || 0),
          isHospitalOutpatient: Boolean(item.isHospitalOutpatient),
        }))
      : undefined

    const intakeData: IntakeData = {
      patientName: body.patientName,
      patientAddress: body.patientAddress || '',
      patientState: body.patientState || '',
      patientZip: body.patientZip || '',
      insurerName: body.insurerName,
      denialDate: body.denialDate,
      medication: body.medication,
      condition: body.condition || '',
      denialType,
      claimNumber: body.claimNumber || '',
      planType: body.planType || '',
      duration: body.duration || '1–3 years',
      priorTreatments: body.priorTreatments || [],
      treatmentOutcomes: body.treatmentOutcomes || {},
      narrative: body.narrative || '',
      formularyAlternatives: body.formularyAlternatives || '',
      lineItems,
    }

    // Generate the letter
    const { letter, sections } = await generateAppealLetter(intakeData)

    // Generate a temporary case ID (no database on Vercel)
    const caseId = `case-${Date.now()}`

    // Try to save to database if available, but don't fail if it's not
    try {
      const { prisma } = await import('@/lib/db')
      const caseRecord = await prisma.case.create({
        data: {
          patientName: intakeData.patientName,
          patientAddress: intakeData.patientAddress,
          patientState: intakeData.patientState,
          insurerName: intakeData.insurerName,
          denialDate: intakeData.denialDate,
          medication: intakeData.medication,
          condition: intakeData.condition,
          denialType: intakeData.denialType,
          claimNumber: intakeData.claimNumber,
          planType: intakeData.planType,
          duration: intakeData.duration,
          intakeData: JSON.stringify(body),
          generatedLetter: letter,
          status: 'pending_review',
          denialNoticePath: body.denialNoticePath || null,
        },
      })
      // Use the real case ID if DB succeeded
      Object.assign(intakeData, { _caseId: caseRecord.id })
    } catch (dbError) {
      console.warn('Database not available, skipping save:', (dbError as Error).message)
    }

    // Generate PDF (in memory, returns base64)
    let pdfBase64: string | null = null
    try {
      pdfBase64 = await generatePDF({
        caseId,
        letterText: letter,
        patientName: intakeData.patientName,
        insurerName: intakeData.insurerName,
        medication: intakeData.medication,
        denialDate: intakeData.denialDate,
      })
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
    }

    return NextResponse.json({
      success: true,
      caseId,
      letter,
      sections,
      pdfBase64,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate appeal letter. Please try again.' },
      { status: 500 }
    )
  }
}
