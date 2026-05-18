'use client'

import { useState } from 'react'
import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onSubmit: () => void
  onBack: () => void
}

interface ReviewField {
  label: string
  key: keyof IntakeFormData
  format?: (value: any) => string
}

const REVIEW_SECTIONS: Array<{
  title: string
  fields: ReviewField[]
}> = [
  {
    title: 'Denial information',
    fields: [
      { label: 'Insurance company', key: 'insurerName' },
      { label: 'Patient name', key: 'patientName' },
      { label: 'Date of denial', key: 'denialDate' },
      { label: 'Medication or procedure', key: 'medication' },
      { label: 'Reason for denial', key: 'denialReasonPlain' },
    ],
  },
  {
    title: 'Your condition',
    fields: [
      { label: 'Condition', key: 'condition' },
      { label: 'How long', key: 'duration' },
    ],
  },
  {
    title: 'Treatments tried',
    fields: [
      {
        label: 'Prior treatments',
        key: 'priorTreatments',
        format: (v: string[]) => v.length > 0 ? v.join(', ') : 'None listed',
      },
    ],
  },
  {
    title: 'Your doctor',
    fields: [
      { label: 'Provider', key: 'providerName' },
      { label: 'Practice', key: 'practiceName' },
      { label: 'Specialty', key: 'providerSpecialty' },
      { label: 'State', key: 'patientState' },
    ],
  },
]

export default function Step9Review({ data, onUpdate, onSubmit, onBack }: Props) {
  const [editingKey, setEditingKey] = useState<keyof IntakeFormData | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (key: keyof IntakeFormData) => {
    const value = data[key]
    setEditValue(Array.isArray(value) ? value.join(', ') : String(value || ''))
    setEditingKey(key)
  }

  const saveEdit = () => {
    if (editingKey) {
      // If the original value was an array, split the edited string back into an array
      const originalValue = data[editingKey]
      if (Array.isArray(originalValue)) {
        onUpdate({ [editingKey]: editValue.split(',').map(s => s.trim()).filter(Boolean) } as Partial<IntakeFormData>)
      } else {
        onUpdate({ [editingKey]: editValue } as Partial<IntakeFormData>)
      }
      setEditingKey(null)
    }
  }

  const hasNarrative = data.narrative.trim().length > 0

  return (
    <StepShell
      title="Here's what we have. Review before we build your appeal."
      onBack={onBack}
      hideNext={true}
    >
      <div className="space-y-6">
        {REVIEW_SECTIONS.map(({ title, fields }) => (
          <div key={title}>
            <h3 className="text-xs font-semibold text-txt-4 font-mono uppercase tracking-wider mb-2">{title}</h3>
            <div className="bg-surface rounded border border-border divide-y divide-border">
              {fields.map(({ label, key, format }) => {
                const rawValue = data[key]
                const displayValue = format
                  ? format(rawValue)
                  : Array.isArray(rawValue)
                  ? rawValue.join(', ')
                  : String(rawValue || '')
                const isEmpty = !displayValue || displayValue === 'None listed'

                return (
                  <div key={String(key)} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-txt-4 font-mono font-medium mb-0.5">{label}</p>
                      {editingKey === key ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }}
                          className="w-full text-txt border-b-2 border-brand-600 outline-none bg-transparent"
                        />
                      ) : (
                        <p className={`text-sm ${isEmpty ? 'text-txt-4 italic' : 'text-txt'}`}>
                          {isEmpty ? 'Not provided' : displayValue}
                        </p>
                      )}
                    </div>
                    {!format && (
                      <button
                        onClick={() => startEdit(key)}
                        className="text-border-2 hover:text-brand-600 flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Narrative preview */}
        <div>
          <h3 className="text-xs font-semibold text-txt-4 font-mono uppercase tracking-wider mb-2">Your story</h3>
          <div className="bg-surface rounded border border-border p-4">
            {hasNarrative ? (
              <p className="text-sm text-txt-3 line-clamp-4">{data.narrative}</p>
            ) : (
              <p className="text-sm text-txt-4 italic">No personal narrative added.</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onSubmit}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Build My Appeal
        </button>
        <p className="text-center text-xs text-txt-4">
          This will take about 30–60 seconds
        </p>
      </div>
    </StepShell>
  )
}
