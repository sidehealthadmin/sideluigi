import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ParsedLineItem {
  cptCode: string | null
  description: string
  billedAmount: number
  isHospitalOutpatient: boolean
}

export interface ParsedDenialNotice {
  insurerName: string
  patientName: string
  denialDate: string
  medication: string
  denialReason: string
  denialReasonPlain: string
  claimNumber?: string
  lineItems?: ParsedLineItem[]
  totalBilled?: number
  insurancePaid?: number
  patientOwes?: number
  documentType?: 'denial_notice' | 'billing_statement' | 'eob' | 'other'
  providerName?: string
  confidence: 'high' | 'medium' | 'low'
}

const PARSE_PROMPT = `You are analyzing a health insurance or medical billing document. It may be one of:
- An insurance denial notice (a letter denying coverage for a medication or procedure)
- A hospital/medical billing statement (an itemized bill showing charges, insurance payments, and patient balance)
- An Explanation of Benefits (EOB)

Extract the following fields from the document. Adapt your extraction based on the document type:

{
  "insurerName": "Name of the insurance company (from denial letter header, or from 'Primary insurance' / 'Benefits Summary' on a bill)",
  "patientName": "Full name of the patient/member",
  "denialDate": "For denial letters: date the denial was issued. For bills: date of service. Format as a string, e.g. 'February 2, 2026'",
  "medication": "For denial letters: the medication or procedure denied. For bills: the primary service or procedure billed (e.g. 'Emergency Room Visit', 'MRI', 'Surgery'). Include CPT code if shown.",
  "denialReason": "For denial letters: the official reason for denial. For bills: a summary of the billing issue, e.g. 'Patient billed $X after insurance covered $Y of $Z total charges' with actual amounts from the document.",
  "denialReasonPlain": "A plain-language explanation: For denials, explain why it was denied. For bills, explain the charges in simple terms, e.g. 'You were billed $6,032 for an ER visit. Your insurance (Blue Cross) paid $2,032.52, leaving you with $3,999.48 to pay.'",
  "claimNumber": "Claim number, case number, or account number if present, otherwise null",
  "lineItems": "Array of line items if the document is an itemized bill. Each item: { \"cptCode\": \"CPT code or null\", \"description\": \"Service description\", \"billedAmount\": 0.00, \"isHospitalOutpatient\": true/false }. Return null if no line items found.",
  "totalBilled": "Total amount billed (before insurance), or null",
  "insurancePaid": "Amount insurance covered/paid, or null",
  "patientOwes": "Amount the patient owes (outstanding balance), or null",
  "documentType": "One of: 'denial_notice', 'billing_statement', 'eob', 'other'",
  "providerName": "Name of the hospital, clinic, or provider if shown, otherwise null",
  "confidence": "Your confidence in the extraction: 'high' if document clearly shows all fields, 'medium' if some fields were inferred, 'low' if document was unclear or incomplete"
}

If a field cannot be found, use null for that field.
Return only the JSON object — no markdown, no commentary.`

export async function parseDenialNotice(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ParsedDenialNotice> {
  // Convert buffer to base64
  const base64Data = fileBuffer.toString('base64')

  // Map mime type to Claude's expected image type
  type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  const mediaTypeMap: Record<string, ImageMediaType> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'application/pdf': 'image/png', // PDFs will be handled differently
  }

  // For PDFs, send as a document block
  if (mimeType === 'application/pdf') {
    const messages: MessageParam[] = [
      {
        role: 'user',
        content: [
          {
            type: 'document' as const,
            source: {
              type: 'base64' as const,
              media_type: 'application/pdf' as const,
              data: base64Data,
            },
          },
          {
            type: 'text' as const,
            text: PARSE_PROMPT,
          },
        ],
      },
    ]

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages,
    })

    return parseClaudeResponse(message)
  }

  // For images (JPG/PNG)
  const imageMediaType = mediaTypeMap[mimeType] || 'image/png'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: PARSE_PROMPT,
          },
        ],
      },
    ],
  })

  return parseClaudeResponse(message)
}

function parseClaudeResponse(message: Anthropic.Message): ParsedDenialNotice {
  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    // Strip any markdown code blocks if Claude added them
    const cleaned = content.text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    return {
      insurerName: parsed.insurerName || '',
      patientName: parsed.patientName || '',
      denialDate: parsed.denialDate || '',
      medication: parsed.medication || '',
      denialReason: parsed.denialReason || '',
      denialReasonPlain: parsed.denialReasonPlain || '',
      claimNumber: parsed.claimNumber || undefined,
      lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : undefined,
      totalBilled: parsed.totalBilled ? Number(parsed.totalBilled) : undefined,
      insurancePaid: parsed.insurancePaid ? Number(parsed.insurancePaid) : undefined,
      patientOwes: parsed.patientOwes ? Number(parsed.patientOwes) : undefined,
      documentType: parsed.documentType || 'other',
      providerName: parsed.providerName || undefined,
      confidence: (['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low') as 'high' | 'medium' | 'low',
    }
  } catch (err) {
    throw new Error(`Failed to parse Claude response as JSON: ${content.text}`)
  }
}
