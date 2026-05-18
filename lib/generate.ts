import Anthropic from '@anthropic-ai/sdk'
import { buildNarrativePrompt } from './prompts/narrative'
import { buildClinicalStepTherapyPrompt } from './prompts/clinical-step-therapy'
import { buildClinicalMedicalNecessityPrompt } from './prompts/clinical-medical-necessity'
import { buildClinicalFormularyPrompt } from './prompts/clinical-formulary'
import { buildPolicyPrompt } from './prompts/policy'
import { buildAssemblyPrompt } from './prompts/assembly'
import { buildCostJustificationPrompt } from './prompts/cost-justification'
import { buildCostJustification, CostJustificationData } from './medicare-lookup'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type DenialType = 'step_therapy' | 'medical_necessity' | 'formulary_exclusion'

export interface LineItem {
  cptCode: string
  description: string
  billedAmount: number
  isHospitalOutpatient: boolean
}

export interface IntakeData {
  patientName: string
  patientAddress?: string
  patientState?: string
  patientZip?: string
  insurerName: string
  denialDate: string
  medication: string
  condition: string
  denialType: DenialType
  claimNumber?: string
  planType?: string
  duration: string
  priorTreatments: string[]
  treatmentOutcomes: Record<string, string>
  narrative: string
  formularyAlternatives?: string
  lineItems?: LineItem[]
}

async function callClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }
  return content.text
}

function buildClinicalPrompt(
  denialType: DenialType,
  data: IntakeData
): string {
  switch (denialType) {
    case 'step_therapy':
      return buildClinicalStepTherapyPrompt({
        medication: data.medication,
        condition: data.condition,
        priorTreatments: data.priorTreatments,
        outcomes: data.treatmentOutcomes,
      })
    case 'medical_necessity':
      return buildClinicalMedicalNecessityPrompt({
        medication: data.medication,
        condition: data.condition,
        duration: data.duration,
        priorTreatments: data.priorTreatments,
      })
    case 'formulary_exclusion':
      return buildClinicalFormularyPrompt({
        medication: data.medication,
        condition: data.condition,
        formularyAlternatives: data.formularyAlternatives || '',
      })
  }
}

export async function generateAppealLetter(
  data: IntakeData
): Promise<{
  letter: string
  sections: { narrative: string; clinical: string; policy: string; costJustification?: string }
  costData?: CostJustificationData
}> {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Build cost justification data if ZIP and line items are provided
  let costJustificationData: CostJustificationData | undefined
  let costJustificationOutput: string | undefined

  if (data.patientZip && data.lineItems && data.lineItems.length > 0) {
    try {
      costJustificationData = await buildCostJustification(data.patientZip, data.lineItems)
      const costPrompt = buildCostJustificationPrompt({
        costData: costJustificationData,
        medication: data.medication,
        denialType: data.denialType,
        insurerName: data.insurerName,
      })
      costJustificationOutput = await callClaude(costPrompt)
    } catch (err) {
      console.error('Cost justification lookup failed, continuing without it:', err)
    }
  }

  // Run all three core section prompts in parallel for speed
  const [narrativeOutput, clinicalOutput, policyOutput] = await Promise.all([
    callClaude(
      buildNarrativePrompt({
        condition: data.condition,
        duration: data.duration,
        medication: data.medication,
        narrative: data.narrative,
        priorTreatments: data.priorTreatments,
        outcomes: data.treatmentOutcomes,
      })
    ),
    callClaude(buildClinicalPrompt(data.denialType, data)),
    callClaude(
      buildPolicyPrompt({
        denialType: data.denialType,
        patientState: data.patientState || 'Unknown',
        planType: data.planType || 'not specified',
      })
    ),
  ])

  // Final call: assemble into complete letter
  const letter = await callClaude(
    buildAssemblyPrompt({
      date: today,
      patientName: data.patientName,
      patientAddress: data.patientAddress || '',
      insurerName: data.insurerName,
      medication: data.medication,
      claimNumber: data.claimNumber || '',
      denialDate: data.denialDate,
      narrativeOutput,
      clinicalOutput,
      policyOutput,
      costJustificationOutput,
    })
  )

  return {
    letter,
    sections: {
      narrative: narrativeOutput,
      clinical: clinicalOutput,
      policy: policyOutput,
      costJustification: costJustificationOutput,
    },
    costData: costJustificationData,
  }
}

/**
 * Map a raw denial reason string (e.g., extracted from a denial notice)
 * to one of the three canonical denial types.
 */
export function mapDenialType(rawReason: string): DenialType {
  const lower = rawReason.toLowerCase()

  if (
    lower.includes('step therapy') ||
    lower.includes('step-therapy') ||
    lower.includes('prior authorization') ||
    lower.includes('prior auth') ||
    lower.includes('preferred alternative') ||
    lower.includes('try another')
  ) {
    return 'step_therapy'
  }

  if (
    lower.includes('formulary') ||
    lower.includes('not covered') ||
    lower.includes('non-formulary') ||
    lower.includes('not on') ||
    lower.includes('excluded')
  ) {
    return 'formulary_exclusion'
  }

  // Default to medical_necessity
  return 'medical_necessity'
}
