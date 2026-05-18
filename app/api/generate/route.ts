import { NextRequest, NextResponse } from 'next/server'
import { generateAppealLetter, mapDenialType, IntakeData, LineItem } from '@/lib/generate'
import { generatePDF } from '@/lib/pdf'
import { prisma } from '@/lib/db'

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

    // Save case to database
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

    // Generate PDF
    let pdfPath: string | null = null
    try {
      pdfPath = await generatePDF({
        caseId: caseRecord.id,
        letterText: letter,
        patientName: intakeData.patientName,
        insurerName: intakeData.insurerName,
        medication: intakeData.medication,
        denialDate: intakeData.denialDate,
      })

      // Update case with PDF path
      await prisma.case.update({
        where: { id: caseRecord.id },
        data: { pdfPath },
      })
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      // Continue even if PDF fails — letter text is still saved
    }

    return NextResponse.json({
      success: true,
      caseId: caseRecord.id,
      letter,
      sections,
      pdfPath,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate appeal letter. Please try again.' },
      { status: 500 }
    )
  }
}
