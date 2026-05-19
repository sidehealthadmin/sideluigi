'use client'

import { useEffect, useState } from 'react'

interface Props {
  isGenerating: boolean
  caseId: string | null
  letterText?: string | null
  pdfBase64?: string | null
}

const MESSAGES = [
  'Reading your document...',
  'Reviewing treatment history...',
  'Drafting your personal narrative...',
  'Gathering clinical evidence...',
  'Building the argument...',
  'Assembling your dispute letter...',
  'Formatting your document...',
]

export default function Step10Status({ isGenerating, caseId, letterText, pdfBase64 }: Props) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [showLetter, setShowLetter] = useState(false)

  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setMessageIndex(prev => Math.min(prev + 1, MESSAGES.length - 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [isGenerating])

  const handleDownloadPDF = () => {
    if (!pdfBase64) return
    const byteCharacters = atob(pdfBase64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dispute-letter-${caseId || 'draft'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopyText = () => {
    if (!letterText) return
    navigator.clipboard.writeText(letterText)
  }

  if (!isGenerating && caseId) {
    // Success state
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-txt">Your dispute letter is ready.</h1>
            <p className="text-txt-3 mt-3 leading-relaxed">
              Review your letter below, then download the PDF to send to your insurance company or provider.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {pdfBase64 && (
              <button
                onClick={handleDownloadPDF}
                className="sh-btn sh-btn-primary flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            )}
            {letterText && (
              <button
                onClick={() => setShowLetter(!showLetter)}
                className="sh-btn sh-btn-outline flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {showLetter ? 'Hide letter' : 'View letter'}
              </button>
            )}
          </div>

          {/* Letter preview */}
          {showLetter && letterText && (
            <div className="text-left bg-white border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border">
                <p className="font-mono text-[10px] font-medium text-txt-4 tracking-widest uppercase">Letter preview</p>
                <button
                  onClick={handleCopyText}
                  className="text-xs text-brand-600 hover:text-brand-500 font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy text
                </button>
              </div>
              <div className="px-6 py-5 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-txt leading-relaxed font-sans">
                  {letterText}
                </pre>
              </div>
            </div>
          )}

          {/* Status card */}
          <div className="bg-surface rounded border border-border p-4 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-txt-2">Dispute letter generated</p>
                <p className="text-xs text-txt-4 font-mono">Case #{caseId.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-txt-2">Ready to download</p>
                <p className="text-xs text-txt-4">Send to your insurer or provider to dispute the charges</p>
              </div>
            </div>
          </div>

          {/* Start over */}
          <button
            onClick={() => window.location.href = '/'}
            className="text-xs text-txt-4 hover:text-txt-3 underline underline-offset-2"
          >
            Start a new dispute
          </button>
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
          <p className="text-txt-3">We weren't able to generate your dispute letter. Please try again or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="sh-btn sh-btn-primary"
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
          <h1 className="text-2xl font-bold text-txt">Building your dispute letter…</h1>
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
