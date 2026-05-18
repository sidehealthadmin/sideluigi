'use client'

import { useEffect, useState } from 'react'

interface Props {
  isGenerating: boolean
  caseId: string | null
}

const MESSAGES = [
  'Reading your denial notice...',
  'Reviewing treatment history...',
  'Drafting your personal narrative...',
  'Gathering clinical evidence...',
  'Building the legal argument...',
  'Assembling your appeal letter...',
  'Formatting your document...',
]

export default function Step10Status({ isGenerating, caseId }: Props) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, MESSAGES.length - 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [isGenerating])

  if (!isGenerating && caseId) {
    // Success state
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-txt">Your appeal is ready for review.</h1>
            <p className="text-txt-3 mt-3 leading-relaxed">
              Our team will review your appeal letter before it's submitted. We'll notify you once it's been sent to your insurance company.
            </p>
          </div>
          <div className="bg-surface rounded border border-border p-4 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-txt-2">Appeal letter generated</p>
                <p className="text-xs text-txt-4 font-mono">Case #{caseId.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-txt-2">Pending staff review</p>
                <p className="text-xs text-txt-4">Typically reviewed within 1 business day</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-txt-4">
            Keep a copy of your denial notice and any documents you uploaded.
          </p>
        </div>
      </div>
    )
  }

  if (!isGenerating && !caseId) {
    // Error state
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-txt">Something went wrong.</h1>
          <p className="text-txt-3">We weren't able to generate your appeal. Please try again or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated logo */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-brand-50" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-txt">Building your appeal…</h1>
          <p className="text-txt-3 text-base transition-all duration-500">
            {MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-2">
          {MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                i < messageIndex
                  ? 'text-green-600'
                  : i === messageIndex
                  ? 'text-brand-600 font-medium'
                  : 'text-border-2'
              }`}
            >
              {i < messageIndex ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : i === messageIndex ? (
                <div className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
              ) : (
                <div className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-border" />
              )}
              {msg}
            </div>
          ))}
        </div>

        <p className="text-xs text-txt-4">Usually takes 30–60 seconds. Please don't close this page.</p>
      </div>
    </div>
  )
}
