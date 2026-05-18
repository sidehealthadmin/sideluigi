export function buildClinicalFormularyPrompt(data: {
  medication: string
  condition: string
  formularyAlternatives: string
}): string {
  return `You are drafting the clinical evidence section of a formal insurance appeal letter.
The denial reason is formulary exclusion — the prescribed medication is not on the insurer's covered drug list.

Patient facts:
- Prescribed medication: ${data.medication}
- Condition: ${data.condition}
- Formulary alternatives offered by insurer: ${data.formularyAlternatives || 'not specified'}

Write exactly 2–3 paragraphs that:
1. Explain why the formulary alternatives are clinically inadequate or inappropriate for this specific patient — focusing on mechanism differences, tolerability, contraindications, or documented lack of efficacy in patients with this patient's profile
2. Cite peer-reviewed evidence or clinical guidelines that support ${data.medication} specifically — not just the broader drug class — for ${data.condition}
3. Articulate the clinical differentiation between ${data.medication} and the offered formulary alternatives, including relevant efficacy data, mechanism of action differences, or tolerability profiles that make substitution clinically inappropriate

Citation format: Author(s), "Title," Journal Name, Year. (Use real, verifiable citations only. If uncertain about a specific citation, describe the category of supporting evidence instead.)

Output plain prose only — no headers, no bullet points, no markdown`
}
