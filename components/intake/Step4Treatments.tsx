'use client'

import { useState } from 'react'
import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const COMMON_TREATMENTS: Record<string, string[]> = {
  default: [
    'Generic version of the same drug class',
    'Over-the-counter medications (e.g., ibuprofen, acetaminophen)',
    'Physical therapy',
    'Dietary and lifestyle changes',
    'A different prescription medication',
    'Injections or infusions',
    'Surgery or procedure',
    'Mental health therapy / counseling',
    'Occupational therapy',
    'Alternative therapies (acupuncture, chiropractic, etc.)',
  ],
}

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step4Treatments({ data, onUpdate, onNext, onBack }: Props) {
  const [customTreatment, setCustomTreatment] = useState('')
  const medication = data.medication || 'this medication'

  const toggle = (treatment: string) => {
    const current = data.priorTreatments
    const updated = current.includes(treatment)
      ? current.filter(t => t !== treatment)
      : [...current, treatment]
    onUpdate({ priorTreatments: updated, noTreatments: false })
  }

  const addCustom = () => {
    if (!customTreatment.trim()) return
    const updated = [...data.priorTreatments, customTreatment.trim()]
    onUpdate({ priorTreatments: updated })
    setCustomTreatment('')
  }

  const handleNoTreatments = () => {
    onUpdate({ noTreatments: true, priorTreatments: [] })
  }

  const canContinue = data.noTreatments || data.priorTreatments.length > 0

  return (
    <StepShell
      title={`Before ${medication}, what other treatments did you try?`}
      subtitle="Insurance companies often deny claims when they want you to try cheaper options first. Listing what you've already tried is one of the strongest arguments in your appeal."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!canContinue}
    >
      <div className="space-y-4">
        {/* Checklist */}
        <div className="space-y-2">
          {COMMON_TREATMENTS.default.map((treatment) => {
            const selected = data.priorTreatments.includes(treatment)
            return (
              <button
                key={treatment}
                onClick={() => toggle(treatment)}
                className={`
                  w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3
                  ${selected
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-border hover:border-border-2 text-txt-2'
                  }
                `}
              >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                  ${selected ? 'border-brand-600 bg-brand-600' : 'border-border-2'}`}
                >
                  {selected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                      <path d="M2 6l3 3 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm">{treatment}</span>
              </button>
            )
          })}
        </div>

        {/* Custom treatment */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customTreatment}
            onChange={(e) => setCustomTreatment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCustom() }}
            placeholder="Add your own treatment..."
            className="flex-1 border border-border focus:border-brand-600 rounded px-4 py-3 text-sm outline-none transition-colors"
          />
          <button
            onClick={addCustom}
            disabled={!customTreatment.trim()}
            className="bg-border hover:bg-border-2 disabled:opacity-50 text-txt-2 px-4 py-3 rounded font-medium text-sm transition-colors"
          >
            Add
          </button>
        </div>

        {/* Custom treatments added */}
        {data.priorTreatments.filter(t => !COMMON_TREATMENTS.default.includes(t)).map(t => (
          <div key={t} className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded px-4 py-3 text-sm text-brand-700">
            <span>{t}</span>
            <button
              onClick={() => onUpdate({ priorTreatments: data.priorTreatments.filter(x => x !== t) })}
              className="text-brand-500 hover:text-red-500 ml-2"
            >
              ✕
            </button>
          </div>
        ))}

        {/* None option */}
        <button
          onClick={handleNoTreatments}
          className={`w-full text-left px-4 py-3 rounded border transition-all flex items-center gap-3
            ${data.noTreatments
              ? 'border-txt-3 bg-bg text-txt-2'
              : 'border-border hover:border-border-2 text-txt-3'
            }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
            ${data.noTreatments ? 'border-txt-3 bg-txt-3' : 'border-border-2'}`}
          >
            {data.noTreatments && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                <path d="M2 6l3 3 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm">I haven't tried other treatments</span>
        </button>
      </div>
    </StepShell>
  )
}
