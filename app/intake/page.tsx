'use client'

import { useState, useCallback } from 'react'
import ProgressBar from '@/components/intake/ProgressBar'
import Step1Upload from '@/components/intake/Step1Upload'
import Step2Condition from '@/components/intake/Step2Condition'
import Step3Duration from '@/components/intake/Step3Duration'
import Step4Treatments from '@/components/intake/Step4Treatments'
import Step5Outcomes from '@/components/intake/Step5Outcomes'
import Step6Doctor from '@/components/intake/Step6Doctor'
import Step7Narrative from '@/components/intake/Step7Narrative'
import Step8Documents from '@/components/intake/Step8Documents'
import Step9Review from '@/components/intake/Step9Review'
import Step10Status from '@/components/intake/Step10Status'

export interface IntakeFormData {
  // From denial notice (Step 1)
  insurerName: string
  patientName: string
  denialDate: string
  medication: string
  denialReason: string
  denialReasonPlain: string
  claimNumber: string
  denialNoticePath: string

  // Step 2
  condition: string

  // Step 3
  duration: string

  // Step 4
  priorTreatments: string[]
  noTreatments: boolean

  // Step 5
  treatmentOutcomes: Record<string, string>

  // Step 6
  providerName: string
  practiceName: string
  providerSpecialty: string

  // Step 7
  narrative: string

  // Step 8
  supportingDocs: string[]

  // Additional fields
  patientAddress: string
  patientState: string
  patientZip: string
  planType: string
  formularyAlternatives: string
}

const INITIAL_DATA: IntakeFormData = {
  insurerName: '',
  patientName: '',
  denialDate: '',
  medication: '',
  denialReason: '',
  denialReasonPlain: '',
  claimNumber: '',
  denialNoticePath: '',
  condition: '',
  duration: '',
  priorTreatments: [],
  noTreatments: false,
  treatmentOutcomes: {},
  providerName: '',
  practiceName: '',
  providerSpecialty: '',
  narrative: '',
  supportingDocs: [],
  patientAddress: '',
  patientState: '',
  patientZip: '',
  planType: '',
  formularyAlternatives: '',
}

const TOTAL_STEPS = 9

export default function IntakePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<IntakeFormData>(INITIAL_DATA)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const updateData = useCallback((updates: Partial<IntakeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS + 1))
    window.scrollTo(0, 0)
  }, [])

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = useCallback(async () => {
    setIsGenerating(true)
    setStep(10)
    window.scrollTo(0, 0)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.patientName,
          patientAddress: formData.patientAddress,
          patientState: formData.patientState,
          patientZip: formData.patientZip,
          insurerName: formData.insurerName,
          denialDate: formData.denialDate,
          medication: formData.medication,
          condition: formData.condition,
          denialType: formData.denialReason,
          denialReason: formData.denialReason,
          claimNumber: formData.claimNumber,
          planType: formData.planType,
          duration: formData.duration,
          priorTreatments: formData.priorTreatments,
          treatmentOutcomes: formData.treatmentOutcomes,
          narrative: formData.narrative,
          formularyAlternatives: formData.formularyAlternatives,
          denialNoticePath: formData.denialNoticePath,
        }),
      })

      if (!response.ok) {
        console.error('Generation API error:', response.status)
        return
      }
      const data = await response.json()
      if (data.success) {
        setCaseId(data.caseId)
      } else {
        console.error('Generation returned error:', data.error)
      }
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [formData])

  // Show step 10 (status) separately
  if (step === 10) {
    return (
      <div className="min-h-screen bg-bg">
        <Step10Status isGenerating={isGenerating} caseId={caseId} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              <span className="font-bold text-txt">Side</span>
              <span className="font-light text-brand-600">Health</span>
            </span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      {/* Step content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 1 && (
          <Step1Upload
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
          />
        )}
        {step === 2 && (
          <Step2Condition
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 3 && (
          <Step3Duration
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 4 && (
          <Step4Treatments
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 5 && (
          <Step5Outcomes
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 6 && (
          <Step6Doctor
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 7 && (
          <Step7Narrative
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 8 && (
          <Step8Documents
            data={formData}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 9 && (
          <Step9Review
            data={formData}
            onUpdate={updateData}
            onSubmit={handleSubmit}
            onBack={prevStep}
          />
        )}
      </main>
    </div>
  )
}
