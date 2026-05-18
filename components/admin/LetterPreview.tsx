'use client'

import { useState } from 'react'
import { CaseDetail } from '@/app/admin/review/page'

const DENIAL_TYPE_LABELS: Record<string, string> = {
  step_therapy: 'Step Therapy',
  medical_necessity: 'Medical Necessity',
  formulary_exclusion: 'Formulary Exclusion',
}

interface Props {
  caseData: CaseDetail
  onClose: () => void
  onApprove: (notes?: string) => void
  onReject: (notes: string) => void
}

export default function LetterPreview({ caseData, onClose, onApprove, onReject }: Props) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [approveNotes, setApproveNotes] = useState('')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)

  const isPending = caseData.status === 'pending_review'

  const handleReject = () => {
    if (!rejectNotes.trim()) {
      alert('Please provide rejection notes.')
      return
    }
    onReject(rejectNotes)
  }

  const intakeData = (() => {
    try { return JSON.parse(caseData.intakeData) } catch { return {} }
  })()

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-3xl bg-surface shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface flex-shrink-0">
          <div>
            <h2 className="font-bold text-txt">{caseData.patientName}</h2>
            <p className="text-sm text-txt-3">{caseData.medication} · {caseData.insurerName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              caseData.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
              caseData.status === 'approved' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {caseData.status.replace('_', ' ')}
            </span>
            <button
              onClick={onClose}
              className="text-txt-4 hover:text-txt-3 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs / meta */}
        <div className="px-6 py-3 border-b border-border bg-bg flex-shrink-0">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-txt-4">Denial type: </span>
              <span className="font-medium text-txt-2">
                {DENIAL_TYPE_LABELS[caseData.denialType] || caseData.denialType}
              </span>
            </div>
            <div>
              <span className="text-txt-4">Condition: </span>
              <span className="font-medium text-txt-2">{caseData.condition || '—'}</span>
            </div>
            <div>
              <span className="text-txt-4">State: </span>
              <span className="font-medium text-txt-2">{caseData.patientState || '—'}</span>
            </div>
            <div>
              <span className="text-txt-4">Plan type: </span>
              <span className="font-medium text-txt-2">{caseData.planType || '—'}</span>
            </div>
            {caseData.claimNumber && (
              <div>
                <span className="text-txt-4">Claim #: </span>
                <span className="font-medium text-txt-2">{caseData.claimNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Letter content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {caseData.generatedLetter ? (
            <div className="bg-surface border border-border rounded p-6 font-serif text-sm leading-relaxed text-txt whitespace-pre-wrap shadow-sm">
              {caseData.generatedLetter}
            </div>
          ) : (
            <div className="text-center py-8 text-txt-4">No letter content available.</div>
          )}
        </div>

        {/* Action area */}
        {isPending && !showRejectForm && !showApproveConfirm && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-surface flex gap-3">
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 border-2 border-red-200 hover:border-red-400 text-red-600 hover:text-red-700 font-semibold py-3 rounded transition-all"
            >
              Reject
            </button>
            <button
              onClick={() => setShowApproveConfirm(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded transition-colors"
            >
              Approve
            </button>
          </div>
        )}

        {isPending && showApproveConfirm && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-green-50 space-y-3">
            <p className="font-semibold text-green-800 text-sm">Approve this appeal?</p>
            <p className="text-xs text-green-700">This will move the PDF to the approved output folder for EHR submission.</p>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Optional reviewer notes..."
              rows={2}
              className="w-full border border-green-200 rounded px-3 py-2 text-sm outline-none focus:border-green-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="flex-1 border border-border text-txt-3 py-2 rounded text-sm font-medium transition-colors hover:bg-bg"
              >
                Cancel
              </button>
              <button
                onClick={() => onApprove(approveNotes)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded text-sm transition-colors"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        )}

        {isPending && showRejectForm && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-red-50 space-y-3">
            <p className="font-semibold text-red-800 text-sm">Reason for rejection (required)</p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Explain what needs to be corrected or why this letter cannot be submitted..."
              rows={3}
              autoFocus
              className="w-full border border-red-200 rounded px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowRejectForm(false); setRejectNotes('') }}
                className="flex-1 border border-border text-txt-3 py-2 rounded text-sm font-medium transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNotes.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 rounded text-sm transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        )}

        {/* Review notes display for non-pending */}
        {!isPending && caseData.reviewNotes && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-bg">
            <p className="text-xs font-medium text-txt-4 font-mono uppercase tracking-wide mb-1">Review Notes</p>
            <p className="text-sm text-txt-3">{caseData.reviewNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
