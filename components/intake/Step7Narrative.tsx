'use client'

import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const MIN_SUGGESTED = 500
const PLACEHOLDER = `For example:

Before starting this medication, I was unable to work a full day without pain stopping me. Simple tasks — cooking dinner, playing with my kids, sleeping through the night — had become impossible.

When I started this medication, I was finally able to return to work full time and be present for my family again. If the appeal is denied and I have to stop, I will lose that ability.`

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step7Narrative({ data, onUpdate, onNext, onBack }: Props) {
  const count = data.narrative.length
  const medication = data.medication || 'this medication'
  const isLong = count >= MIN_SUGGESTED

  return (
    <StepShell
      title="In your own words, how has this condition affected your daily life — and what changed when you started treatment?"
      subtitle="This is your chance to tell your story. Be specific: work, family, sleep, pain, activities you've had to stop. The more detail you give, the stronger your appeal."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-3">
        <textarea
          value={data.narrative}
          onChange={(e) => onUpdate({ narrative: e.target.value })}
          placeholder={PLACEHOLDER}
          rows={10}
          autoFocus
          className="w-full border border-border focus:border-brand-600 rounded px-4 py-4 text-txt text-base outline-none transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <div className={`text-sm font-medium transition-colors ${isLong ? 'text-green-600' : 'text-txt-4'}`}>
            {isLong ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Great detail — this will strengthen your appeal
              </span>
            ) : (
              `${MIN_SUGGESTED - count > 0 ? MIN_SUGGESTED - count : 0} more characters suggested`
            )}
          </div>
          <span className="text-sm text-txt-4">{count.toLocaleString()} characters</span>
        </div>

        {count === 0 && (
          <p className="text-sm text-txt-4">
            You can skip this for now, but adding your personal story significantly improves appeal success rates.
          </p>
        )}
      </div>
    </StepShell>
  )
}
