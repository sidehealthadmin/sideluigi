'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-mono text-[11px] text-txt-3 tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-mono text-[10px] text-txt-4">
          About 5–8 minutes total
        </span>
      </div>
      <div className="w-full bg-border rounded-full h-2">
        <div
          className="bg-gradient-to-r from-brand-600 to-brand-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
