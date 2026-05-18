export function buildNarrativePrompt(data: {
  condition: string
  duration: string
  medication: string
  narrative: string
  priorTreatments: string[]
  outcomes: Record<string, string>
}): string {
  const treatmentList = data.priorTreatments.length > 0
    ? data.priorTreatments.join(', ')
    : 'no prior treatments'

  const outcomeList = Object.entries(data.outcomes)
    .map(([treatment, outcome]) => `${treatment}: ${outcome}`)
    .join('; ')

  return `You are drafting the personal narrative section of a formal insurance appeal letter.
Write in first person from the patient's perspective.
Tone: professional, direct, emotionally grounded — not dramatic or overwrought.

Patient information:
- Condition: ${data.condition}
- Duration of condition: ${data.duration}
- Medication denied: ${data.medication}
- Patient's own words about impact on daily life: ${data.narrative}
- Prior treatments tried: ${treatmentList}
- Outcomes of prior treatments: ${outcomeList || 'not specified'}

Write exactly 2–3 paragraphs that:
1. Describe the patient's condition and how it has concretely affected their daily life, using details from what they shared
2. Explain the treatment journey — what was tried, what failed or caused problems, and why this specific medication was ultimately prescribed
3. State clearly and directly what is at stake if this appeal is denied

Rules:
- Do not include clinical citations or legal references — those come in later sections
- Do not begin with filler phrases like "I am writing to appeal" or "I hope this letter finds you well"
- Do not use dramatic or pleading language — let the facts speak
- Output plain prose only — no headers, no bullet points, no markdown`
}
