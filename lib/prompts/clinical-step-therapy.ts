export function buildClinicalStepTherapyPrompt(data: {
  medication: string
  condition: string
  priorTreatments: string[]
  outcomes: Record<string, string>
}): string {
  const treatmentList = data.priorTreatments.join(', ')
  const outcomeList = Object.entries(data.outcomes)
    .map(([t, o]) => `${t}: ${o}`)
    .join('; ')

  return `You are drafting the clinical evidence section of a formal insurance appeal letter.
The denial reason is step therapy / prior authorization — the insurer requires the patient to first try alternative medications.

Patient facts:
- Prescribed medication: ${data.medication}
- Condition: ${data.condition}
- Prior treatments already tried: ${treatmentList}
- Outcomes of those treatments: ${outcomeList}

Write exactly 2–3 paragraphs that:
1. Cite 2–3 peer-reviewed studies or established clinical guidelines (e.g., from ACR, AHA, AAN, NICE, or equivalent professional societies) that support ${data.medication} as an appropriate, evidence-based treatment for ${data.condition}
2. Reference any relevant professional society recommendations or treatment guidelines that endorse this medication for this condition
3. Argue that step therapy requirements have been satisfied given the patient's treatment history — or, if the history shows step therapy would be clinically inappropriate, argue that clearly

Citation format: Author(s), "Title," Journal Name, Year. (Use real, verifiable citations only. If you are not confident a specific citation is accurate, describe the type and quality of evidence that exists for this treatment instead of fabricating details.)

Output plain prose only — no headers, no bullet points, no markdown`
}
