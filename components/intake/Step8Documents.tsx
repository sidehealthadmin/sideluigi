'use client'

import { useRef } from 'react'
import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const DOC_TYPES = [
  {
    key: 'letter_of_medical_necessity',
    label: 'Letter of medical necessity from your doctor',
    description: 'A letter from your prescribing physician explaining why this medication is necessary',
  },
  {
    key: 'eob',
    label: 'Previous Explanation of Benefits (EOB)',
    description: 'A previous insurance statement showing treatment history',
  },
  {
    key: 'lab_results',
    label: 'Lab results or clinical notes',
    description: 'Any test results or visit notes that support your diagnosis',
  },
  {
    key: 'prior_auth',
    label: 'Prior authorization correspondence',
    description: 'Any previous approval letters or prior auth paperwork',
  },
]

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step8Documents({ data, onUpdate, onNext, onBack }: Props) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const toggleDoc = (key: string) => {
    const current = data.supportingDocs
    if (current.includes(key)) {
      onUpdate({ supportingDocs: current.filter(d => d !== key) })
    } else {
      onUpdate({ supportingDocs: [...current, key] })
    }
  }

  return (
    <StepShell
      title="Do you have any of these documents to add?"
      subtitle="They can strengthen your appeal, but all are optional."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue"
    >
      <div className="space-y-3">
        {DOC_TYPES.map(({ key, label, description }) => {
          const checked = data.supportingDocs.includes(key)
          return (
            <div
              key={key}
              className={`rounded border p-4 transition-all ${
                checked ? 'border-brand-500 bg-brand-50' : 'border-border'
              }`}
            >
              <button
                onClick={() => toggleDoc(key)}
                className="w-full text-left flex items-start gap-3"
              >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all
                  ${checked ? 'border-brand-600 bg-brand-600' : 'border-border-2'}`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                      <path d="M2 6l3 3 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-medium text-sm ${checked ? 'text-brand-700' : 'text-txt-2'}`}>{label}</p>
                  <p className="text-xs text-txt-4 mt-0.5">{description}</p>
                </div>
              </button>

              {checked && (
                <div className="mt-3 ml-8">
                  <button
                    onClick={() => fileRefs.current[key]?.click()}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attach file (optional)
                  </button>
                  <input
                    ref={(el) => { fileRefs.current[key] = el }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )
        })}

        <p className="text-sm text-txt-4 text-center pt-2">
          Don't have these? That's fine — your appeal can still be strong without them.
        </p>
      </div>
    </StepShell>
  )
}
