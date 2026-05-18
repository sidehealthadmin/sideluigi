'use client'

import { CaseSummary } from '@/app/admin/review/page'

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const DENIAL_TYPE_LABELS: Record<string, string> = {
  step_therapy: 'Step Therapy',
  medical_necessity: 'Medical Necessity',
  formulary_exclusion: 'Formulary Exclusion',
}

interface Props {
  caseData: CaseSummary
  onOpen: () => void
}

export default function CaseRow({ caseData, onOpen }: Props) {
  const created = new Date(caseData.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <button
      onClick={onOpen}
      className="w-full bg-surface border border-border rounded p-4 text-left hover:border-brand-500 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-txt">{caseData.patientName}</span>
            <span className="text-border-2">•</span>
            <span className="text-txt-3 text-sm">{caseData.medication}</span>
            <span className="text-border-2">•</span>
            <span className="text-txt-3 text-sm">{caseData.insurerName}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-txt-4">{caseData.condition}</span>
            {caseData.denialType && (
              <span className="text-xs bg-bg text-txt-3 px-2 py-0.5 rounded-full">
                {DENIAL_TYPE_LABELS[caseData.denialType] || caseData.denialType}
              </span>
            )}
            <span className="text-xs text-txt-4">Generated {created}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[caseData.status] || 'bg-bg text-txt-3'}`}>
            {STATUS_LABELS[caseData.status] || caseData.status}
          </span>
          <svg className="w-4 h-4 text-border-2 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
