import { CostJustificationData } from '@/lib/medicare-lookup'

export function buildCostJustificationPrompt(data: {
  costData: CostJustificationData
  medication: string
  denialType: string
  insurerName: string
}): string {
  // Build the comparison table as structured text for the LLM
  const comparisonRows = data.costData.comparisons.map(c => {
    if (c.medicareRate !== null && c.ratio !== null) {
      return `- CPT ${c.cptCode} (${c.description}): Billed $${c.billedAmount.toLocaleString()}, Medicare benchmark $${c.medicareRate.toFixed(2)} (${c.rateSource}), ratio ${c.ratio.toFixed(1)}x. Assessment: ${c.assessmentNote}`
    } else {
      return `- CPT ${c.cptCode} (${c.description}): Billed $${c.billedAmount.toLocaleString()}. ${c.assessmentNote}`
    }
  }).join('\n')

  const manualReviewItems = data.costData.comparisons
    .filter(c => c.requiresManualReview)
    .map(c => `CPT ${c.cptCode} (${c.description})`)
    .join(', ')

  return `You are drafting the cost justification section of a formal insurance appeal or hospital billing dispute letter. Your role is to establish fair market value for the billed services using Medicare fee schedule benchmarks as the standard of customary and reasonable charges.

Patient ZIP code: ${data.costData.patientZip}
Medicare locality: ${data.costData.locality}
Insurer or hospital: ${data.insurerName}

Line item cost comparisons (billed amount vs. Medicare benchmark):
${comparisonRows}

Overall assessment: ${data.costData.overallAssessment}

${manualReviewItems ? `Items flagged for manual rate verification (no benchmark available): ${manualReviewItems}` : ''}

Write exactly 2–3 paragraphs that:

1. MEDICARE FEE SCHEDULE BENCHMARK: Establish the Medicare Fee-for-Service rate as the recognized benchmark for customary and reasonable charges. For each line item, state the Medicare benchmark rate, cite the specific CMS data source (Medicare Physician Fee Schedule or Hospital Outpatient Prospective Payment System Addendum B, as applicable), and note the geographic locality used. Present these rates as the baseline against which billed charges should be evaluated.

2. CHARGE COMPARISON: For each line item, clearly present: (a) the amount billed, (b) the Medicare rate, and (c) the ratio between them. Note that commercial insurance rates typically fall within 1.5x to 3.0x of Medicare rates in most markets. Flag any charges that exceed this range. If a charge exceeds 5x the Medicare rate, characterize it as significantly exceeding any reasonable benchmark for customary charges in the patient's geographic area.

3. FAIR MARKET VALUE ARGUMENT: Synthesize the findings into a clear argument. If charges are reasonable relative to Medicare benchmarks, argue that the billed amounts are consistent with customary rates and the denial or underpayment is not supported by market data. If charges are excessive, argue that the billed amounts exceed fair market value and request an adjustment to a level consistent with customary commercial rates in the patient's geographic area (typically 1.5–2.5x Medicare).

Rules:
- Cite the specific CMS data source and year for each rate used (e.g., "CMS OPPS Addendum B CY2026" or "CMS MPFS CY2026, Oakland/Berkeley locality")
- If a rate could not be retrieved, state this clearly and note it has been flagged for manual verification
- Do not fabricate rates — only use the rates provided in the comparison data above
- Reference the "customary and reasonable" standard that most commercial health plans use for reimbursement determinations
- Tone: analytical, professional, evidence-based
- Output plain prose only — no headers, no bullet points, no markdown`
}
