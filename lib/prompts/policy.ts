export function buildPolicyPrompt(data: {
  denialType: string
  patientState: string
  planType: string
}): string {
  const denialContext: Record<string, string> = {
    step_therapy: `This is a step therapy / prior authorization denial. Many states have enacted step therapy override laws requiring insurers to grant exceptions when a patient has already tried and failed required medications, when required medications are contraindicated, or when a physician certifies that the required medications are not clinically appropriate. Reference any applicable state law for ${data.patientState} and the insurer's own prior authorization policies.`,
    medical_necessity: `This is a medical necessity denial. Reference ACA Section 2719 (29 CFR § 2590.715-2719), which requires non-grandfathered health plans to have an internal and external appeals process. Reference the insurer's own Evidence of Coverage definition of medical necessity and the obligation to apply that definition consistently with evidence-based clinical standards.`,
    formulary_exclusion: `This is a formulary exclusion denial. Reference the insurer's formulary exception process, which must be available under applicable law. For ACA marketplace plans, reference the requirement to cover medically necessary treatments. For Medicare Part D plans, reference 42 CFR § 423.578, which establishes the formulary exception process. Argue that the prescribing physician has determined the formulary alternatives are not appropriate for this patient.`,
  }

  const denialSpecific = denialContext[data.denialType] || denialContext['medical_necessity']

  return `You are drafting the policy and legal argument section of a formal insurance appeal letter.

Denial type: ${data.denialType}
Patient's state: ${data.patientState}
Plan type: ${data.planType}

Context for this denial type:
${denialSpecific}

Write exactly 2–3 paragraphs that:
1. Reference the insurer's contractual obligation under their own Evidence of Coverage or Summary of Benefits and Coverage to provide coverage for medically necessary treatments prescribed by a licensed treating physician
2. Cite the applicable regulatory framework for this denial type (see context above), including any state-specific protections that apply in ${data.patientState}
3. State clearly that the patient is formally exercising their right to a full and fair review under applicable plan documents and law, and that if the internal appeal is denied, the patient reserves the right to pursue an independent external review through the applicable state or federal process

Tone: firm, professional, and factual. State rights and obligations without making threats. Do not say "we will sue" or similar — instead say "the patient reserves the right to pursue all available remedies."

Output plain prose only — no headers, no bullet points, no markdown`
}
