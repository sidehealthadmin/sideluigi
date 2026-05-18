export function buildClinicalMedicalNecessityPrompt(data: {
  medication: string
  condition: string
  duration: string
  priorTreatments: string[]
}): string {
  const treatmentList = data.priorTreatments.length > 0
    ? data.priorTreatments.join(', ')
    : 'no prior alternatives'

  return `You are drafting the clinical evidence section of a formal insurance appeal letter.
The denial reason is medical necessity — the insurer claims the prescribed treatment is not medically necessary.

Patient facts:
- Prescribed medication: ${data.medication}
- Condition: ${data.condition}
- Duration of condition: ${data.duration}
- Prior treatments tried: ${treatmentList}

Write exactly 2–3 paragraphs that:
1. Define medical necessity in the specific clinical context of ${data.condition} and explain why ${data.medication} meets that definition for this patient's presentation
2. Cite established clinical guidelines and peer-reviewed evidence that position ${data.medication} as standard of care or a guideline-recommended treatment for ${data.condition}
3. Argue that given this patient's documented history — including duration of illness and treatments already attempted — the prescription of ${data.medication} meets any reasonable, evidence-based definition of medical necessity

Citation format: Author(s), "Title," Journal Name, Year. (Use real, verifiable citations only. If uncertain about a specific citation, describe the category and quality of supporting evidence instead.)

Output plain prose only — no headers, no bullet points, no markdown`
}
