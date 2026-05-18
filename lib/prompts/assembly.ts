export function buildAssemblyPrompt(data: {
  date: string
  patientName: string
  patientAddress: string
  insurerName: string
  medication: string
  claimNumber: string
  denialDate: string
  narrativeOutput: string
  clinicalOutput: string
  policyOutput: string
  costJustificationOutput?: string
}): string {
  const hasCostSection = !!data.costJustificationOutput

  const costBlock = hasCostSection
    ? `\n\nCOST JUSTIFICATION & FAIR MARKET VALUE ANALYSIS:\n${data.costJustificationOutput}`
    : ''

  const costInstruction = hasCostSection
    ? `, then Cost Justification & Fair Market Value Analysis`
    : ''

  const costNote = hasCostSection
    ? ` The Cost Justification section should present the Medicare fee schedule data analytically and tie it back to the argument that the charges or denial are unreasonable.`
    : ''

  return `You are assembling a complete, professionally formatted insurance appeal letter from ${hasCostSection ? 'four' : 'three'} pre-drafted sections.

Letter metadata:
- Date: ${data.date}
- From: ${data.patientName}${data.patientAddress ? `, ${data.patientAddress}` : ''}
- To: ${data.insurerName} Appeals Department
- Re: Appeal of Denial — ${data.medication}${data.claimNumber ? ` — Claim # ${data.claimNumber}` : ''}
- Denial date referenced: ${data.denialDate}

${hasCostSection ? 'Four' : 'Three'} sections to assemble:

PERSONAL NARRATIVE:
${data.narrativeOutput}

CLINICAL EVIDENCE:
${data.clinicalOutput}

POLICY & LEGAL ARGUMENT:
${data.policyOutput}${costBlock}

Assembly instructions:
1. Begin with a standard letter header: date (top right or top left), patient name and address, a blank line, insurer name and "Appeals Department" as the recipient, a blank line, the Re: line
2. Write a single opening sentence: "This letter constitutes a formal appeal of the denial dated ${data.denialDate} for [medication]."
3. Insert the sections in order: Personal Narrative, then Clinical Evidence${costInstruction}, then Policy & Legal Argument. Do not add section headers or labels — the letter should read as continuous, flowing prose${costNote}
4. Close with exactly this sentence: "I respectfully request a full review of this appeal and a written response within the timeframe required by my plan documents and applicable law."
5. End with a signature block: "Sincerely," followed by a blank line, then the patient's name

Output the complete letter text only. No commentary, no metadata, no markdown formatting. Plain text letter format.`
}
