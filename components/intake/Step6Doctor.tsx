'use client'

import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const SPECIALTIES = [
  'Primary Care / Family Medicine',
  'Internal Medicine',
  'Rheumatology',
  'Neurology',
  'Oncology',
  'Cardiology',
  'Gastroenterology',
  'Pulmonology',
  'Psychiatry',
  'Dermatology',
  'Endocrinology',
  'Hematology',
  'Nephrology',
  'Urology',
  'Other Specialist',
]

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step6Doctor({ data, onUpdate, onNext, onBack }: Props) {
  const medication = data.medication || 'this medication'

  return (
    <StepShell
      title={`Who prescribed ${medication} for you?`}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!data.providerName.trim()}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-txt-3 mb-1.5">
            Doctor's name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.providerName}
            onChange={(e) => onUpdate({ providerName: e.target.value })}
            placeholder="Dr. Jane Smith"
            autoFocus
            className="w-full border border-border focus:border-brand-600 rounded px-4 py-3 text-txt outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-txt-3 mb-1.5">
            Practice or hospital name
          </label>
          <input
            type="text"
            value={data.practiceName}
            onChange={(e) => onUpdate({ practiceName: e.target.value })}
            placeholder="General Hospital / Medical Group"
            className="w-full border border-border focus:border-brand-600 rounded px-4 py-3 text-txt outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-txt-3 mb-1.5">
            Specialty
          </label>
          <select
            value={data.providerSpecialty}
            onChange={(e) => onUpdate({ providerSpecialty: e.target.value })}
            className="w-full border border-border focus:border-brand-600 rounded px-4 py-3 text-txt outline-none transition-colors bg-surface"
          >
            <option value="">Select specialty...</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-txt-3 mb-1.5">
              Your state
            </label>
            <input
              type="text"
              value={data.patientState}
              onChange={(e) => onUpdate({ patientState: e.target.value })}
              placeholder="e.g., California"
              className="w-full border border-border focus:border-brand-600 rounded px-4 py-3 text-txt outline-none transition-colors"
            />
            <p className="text-xs text-txt-4 mt-1">For state-specific appeal laws.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-3 mb-1.5">
              Your ZIP code
            </label>
            <input
              type="text"
              value={data.patientZip}
              onChange={(e) => onUpdate({ patientZip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
              placeholder="e.g., 94546"
              maxLength={5}
              inputMode="numeric"
              className="w-full border border-border focus:border-brand-600 rounded px-4 py-3 text-txt outline-none transition-colors"
            />
            <p className="text-xs text-txt-4 mt-1">For cost benchmarking.</p>
          </div>
        </div>
      </div>
    </StepShell>
  )
}
