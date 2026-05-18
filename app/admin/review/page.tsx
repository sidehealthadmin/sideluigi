'use client'

import { useState, useEffect, useCallback } from 'react'
import CaseRow from '@/components/admin/CaseRow'
import LetterPreview from '@/components/admin/LetterPreview'

export interface CaseSummary {
  id: string
  patientName: string
  insurerName: string
  medication: string
  denialType: string
  condition: string
  status: string
  createdAt: string
  denialDate: string
  reviewNotes: string | null
}

export interface CaseDetail extends CaseSummary {
  generatedLetter: string | null
  pdfPath: string | null
  intakeData: string
  patientAddress: string | null
  patientState: string | null
  duration: string | null
  planType: string | null
  claimNumber: string | null
}

type FilterStatus = 'all' | 'pending_review' | 'approved' | 'rejected'

export default function ReviewQueuePage() {
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('pending_review')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

  const fetchCases = useCallback(async (pwd: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/cases', {
        headers: {
          Authorization: `Basic ${btoa(`:${pwd}`)}`,
        },
      })
      if (res.status === 401) {
        setAuthError('Incorrect password.')
        setIsAuthenticated(false)
        return
      }
      if (!res.ok) throw new Error('Failed to load cases')
      const data = await res.json()
      setCases(data.cases)
      setIsAuthenticated(true)
    } catch (e) {
      setError('Could not load cases. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCase = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/cases/${id}`, {
        headers: { Authorization: `Basic ${btoa(`:${password}`)}` },
      })
      if (!res.ok) throw new Error('Failed to load case')
      const data = await res.json()
      setSelectedCase(data.case)
    } catch (e) {
      console.error(e)
    }
  }, [password])

  const handleAction = useCallback(async (
    id: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/cases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`:${password}`)}`,
        },
        body: JSON.stringify({ action, notes }),
      })
      if (!res.ok) throw new Error('Action failed')
      await fetchCases(password)
      setSelectedCase(null)
    } catch (e) {
      alert('Action failed. Please try again.')
    }
  }, [password, fetchCases])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCases(password)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-txt">Staff Login</h1>
            <p className="text-txt-3 mt-1 text-sm">Enter the admin password to access the review queue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full border border-border focus:border-brand-600 rounded px-4 py-3 outline-none transition-colors"
            />
            {authError && (
              <p className="text-red-500 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  const filteredCases = filter === 'all'
    ? cases
    : cases.filter(c => c.status === filter)

  const counts = {
    all: cases.length,
    pending_review: cases.filter(c => c.status === 'pending_review').length,
    approved: cases.filter(c => c.status === 'approved').length,
    rejected: cases.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-txt">Review Queue</h1>
          <p className="text-txt-3 text-sm mt-0.5">
            Review and approve appeal letters before EHR submission
          </p>
        </div>
        <button
          onClick={() => fetchCases(password)}
          className="flex items-center gap-2 text-txt-3 hover:text-txt-2 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded p-1 w-fit mb-6">
        {(['pending_review', 'all', 'approved', 'rejected'] as FilterStatus[]).map((status) => {
          const labels: Record<FilterStatus, string> = {
            pending_review: 'Pending',
            all: 'All',
            approved: 'Approved',
            rejected: 'Rejected',
          }
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                ${filter === status
                  ? 'bg-txt text-white'
                  : 'text-txt-3 hover:text-txt-2'
                }`}
            >
              {labels[status]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${filter === status
                  ? 'bg-white/20 text-white'
                  : 'bg-bg text-txt-3'
                }`}>
                {counts[status]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-txt-4">Loading cases…</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">{error}</div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-txt-4 font-medium">No {filter !== 'all' ? filter.replace('_', ' ') : ''} cases</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCases.map((c) => (
            <CaseRow
              key={c.id}
              caseData={c}
              onOpen={() => fetchCase(c.id)}
            />
          ))}
        </div>
      )}

      {/* Letter preview modal */}
      {selectedCase && (
        <LetterPreview
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onApprove={(notes) => handleAction(selectedCase.id, 'approve', notes)}
          onReject={(notes) => handleAction(selectedCase.id, 'reject', notes)}
        />
      )}
    </div>
  )
}
