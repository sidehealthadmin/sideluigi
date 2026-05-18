'use client'

import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const OUTCOME_OPTIONS = [
  { value: "Didn't work", label: "Didn't work" },
  { value: 'Caused side effects', label: 'Caused side effects' },
  { value: "Doctor said it wasn't appropriate for me", label: "Doctor said it wasn't appropriate for me" },
  { value: 'Temporarily helped but stopped working', label: 'Temporarily helped but stopped working' },
]

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step5Outcomes({ data, onUpdate, onNext, onBack }: Props) {
  // If no prior treatments (skipped or none selected), skip this step
  if (data.noTreatments || data.priorTreatments.length === 0) {
    return (
      <StepShell
        title="For each treatment you listed, what happened?"
        onNext={onNext}
        onBack={onBack}
      >
        <div className="bg-bg rounded p-6 text-center text-txt-3">
          <p>You indicated you haven't tried other treatments.</p>
          <p className="text-sm mt-1">Click Continue to proceed.</p>
        </div>
      </StepShell>
    )
  }

  const setOutcome = (treatment: string, outcome: string) => {
    onUpdate({
      treatmentOutcomes: { ...data.treatmentOutcomes, [treatment]: outcome },
    })
  }

  const setDetail = (treatment: string, detail: string) => {
    const key = `${treatment}_detail`
    onUpdate({
      treatmentOutcomes: { ...data.treatmentOutcomes, [key]: detail },
    })
  }

  const allFilled = data.priorTreatments.every(t => data.treatmentOutcomes[t])

  return (
    <StepShell
      title="For each treatment you listed, what happened?"
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!allFilled}
    >
      <div className="space-y-6">
        {data.priorTreatments.map((treatment) => (
          <div key={treatment} className="bg-surface border border-border rounded p-4 space-y-3">
            <p className="font-medium text-txt-2 text-sm">{treatment}</p>

            <div className="space-y-2">
              {OUTCOME_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setOutcome(treatment, value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-center gap-2
                    ${data.treatmentOutcomes[treatment] === value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-border hover:border-border-2 text-txt-3'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
                    ${data.treatmentOutcomes[treatment] === value
                      ? 'border-brand-600 bg-brand-600'
                      : 'border-border-2'
                    }`}
                  />
                  {label}
                </button>
              ))}
            </div>

            {/* Optional detail */}
            {data.treatmentOutcomes[treatment] && (
              <input
                type="text"
                placeholder="Optional: add more detail (e.g., which side effects?)"
                value={data.treatmentOutcomes[`${treatment}_detail`] || ''}
                onChange={(e) => setDetail(treatment, e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-txt-3 outline-none focus:border-brand-600 transition-colors"
              />
            )}
          </div>
        ))}
      </div>
    </StepShell>
  )
}
