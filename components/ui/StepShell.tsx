'use client'

interface StepShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  hideNext?: boolean
}

export default function StepShell({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  hideNext = false,
}: StepShellProps) {
  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-txt leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-txt-3 text-base leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-txt-3 hover:text-txt-2 font-medium transition-colors"
          >
            <span className="w-[30px] h-[30px] rounded-[6px] border border-border bg-surface flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            Back
          </button>
        ) : (
          <div />
        )}

        {!hideNext && onNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className="flex items-center gap-2 bg-gradient-to-br from-brand-600 to-brand-500 text-white font-mono text-[11.5px] font-medium tracking-wider uppercase rounded border border-brand-600 shadow-[0_2px_8px_rgba(79,95,212,0.25)] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 transition-colors"
          >
            {nextLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
