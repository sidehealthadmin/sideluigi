'use client'

import { useState } from 'react'
import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

const COMMON_CONDITIONS: Record<string, string[]> = {
  default: [
    'Type 2 diabetes', 'Rheumatoid arthritis', 'Crohn\'s disease',
    'Multiple sclerosis', 'Psoriasis', 'Asthma', 'COPD',
    'Chronic migraine', 'Major depressive disorder', 'Bipolar disorder',
    'Atopic dermatitis (eczema)', 'Ulcerative colitis', 'Ankylosing spondylitis',
    'Lupus (SLE)', 'Fibromyalgia', 'Heart failure', 'Hypertension',
    'High cholesterol', 'Hypothyroidism', 'Sleep apnea',
  ],
}

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Condition({ data, onUpdate, onNext, onBack }: Props) {
  const [query, setQuery] = useState(data.condition || '')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const medication = data.medication || 'this medication'
  const suggestions = COMMON_CONDITIONS.default.filter(c =>
    query.length > 0 && c.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (condition: string) => {
    setQuery(condition)
    onUpdate({ condition })
    setShowSuggestions(false)
  }

  const handleInput = (value: string) => {
    setQuery(value)
    onUpdate({ condition: value })
    setShowSuggestions(value.length > 0)
  }

  return (
    <StepShell
      title={`What condition were you prescribed ${medication} for?`}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!data.condition.trim()}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setShowSuggestions(query.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Start typing your condition..."
          className="w-full border border-border focus:border-brand-600 rounded px-4 py-4 text-txt text-base outline-none transition-colors"
          autoFocus
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded shadow-lg z-10 overflow-hidden">
            {suggestions.slice(0, 6).map((suggestion) => (
              <button
                key={suggestion}
                onMouseDown={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-3 text-txt-2 hover:bg-brand-50 hover:text-brand-700 transition-colors border-b border-border last:border-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {!showSuggestions && !query && (
        <div className="mt-4">
          <p className="text-sm text-txt-4 mb-3 font-mono text-[10px] tracking-widest uppercase">Common conditions:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.default.slice(0, 8).map((condition) => (
              <button
                key={condition}
                onClick={() => handleSelect(condition)}
                className="text-sm bg-border hover:bg-brand-50 hover:text-brand-700 text-txt-3 px-3 py-2 rounded-lg transition-colors"
              >
                {condition}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  )
}
