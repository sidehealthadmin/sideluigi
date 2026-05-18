'use client'

import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const DURATIONS = [
  { value: 'Less than 6 months', label: 'Less than 6 months' },
  { value: '6–12 months', label: '6–12 months' },
  { value: '1–3 years', label: '1–3 years' },
  { value: 'More than 3 years', label: 'More than 3 years' },
]

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Duration({ data, onUpdate, onNext, onBack }: Props) {
  return (
    <StepShell
      title="How long have you been dealing with this condition?"
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!data.duration}
    >
      <div className="space-y-3">
        {DURATIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { onUpdate({ duration: value }); }}
            className={`
              w-full text-left px-5 py-4 rounded border font-medium transition-all
              ${data.duration === value
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-border hover:border-border-2 text-txt-2 hover:bg-bg'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all
                ${data.duration === value
                  ? 'border-brand-600 bg-brand-600'
                  : 'border-border-2'
                }`}
              >
                {data.duration === value && (
                  <svg className="w-3 h-3 text-white m-auto mt-0.5" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {label}
            </div>
          </button>
        ))}
      </div>
    </StepShell>
  )
}
