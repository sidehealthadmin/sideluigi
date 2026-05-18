import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ParsedDenialNotice {
  insurerName: string
  patientName: string
  denialDate: string
  medication: string
  denialReason: string
  denialReasonPlain: string
  claimNumber?: string
  confidence: 'high' | 'medium' | 'low'
}

const PARSE_PROMPT = `You are analyzing a health insurance denial notice document.
Extract the following fields from the document. Return your answer as valid JSON only, with no additional text or explanation.

Fields to extract:
{
  "insurerName": "Name of the insurance company",
  "patientName": "Full name of the patient/member",
  "denialDate": "Date the denial was issued (as a string, e.g. 'January 15, 2025')",
  "medication": "Name of the medication or procedure that was denied",
  "denialReason": "The official reason for denial as stated in the document",
  "denialReasonPlain": "A plain-language explanation of the denial reason that a patient without medical knowledge would understand (1-2 sentences)",
  "claimNumber": "Claim or case number if present, otherwise null",
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
      confidence: (['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low') as 'high' | 'medium' | 'low',
    }
  } catch (err) {
    throw new Error(`Failed to parse Claude response as JSON: ${content.text}`)
  }
}
