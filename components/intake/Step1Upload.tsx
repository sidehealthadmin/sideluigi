'use client'

import { useState, useRef, useCallback } from 'react'
import { IntakeFormData } from '@/app/intake/page'
import StepShell from '@/components/ui/StepShell'

interface ParsedFields {
  insurerName: string
  patientName: string
  denialDate: string
  medication: string
  denialReasonPlain: string
  denialReason: string
  claimNumber?: string
  confidence: string
}

interface Props {
  data: IntakeFormData
  onUpdate: (updates: Partial<IntakeFormData>) => void
  onNext: () => void
}

export default function Step1Upload({ data, onUpdate, onNext }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [parsedFields, setParsedFields] = useState<ParsedFields | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setUploadError('')
    setIsUploading(true)
    setParsedFields(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      const parsed: ParsedFields = result.data
      setParsedFields(parsed)
      onUpdate({
        insurerName: parsed.insurerName || '',
        patientName: parsed.patientName || '',
        denialDate: parsed.denialDate || '',
        medication: parsed.medication || '',
        denialReason: parsed.denialReason || '',
        denialReasonPlain: parsed.denialReasonPlain || '',
        claimNumber: parsed.claimNumber || '',
        denialNoticePath: result.filePath || '',
      })
    } catch (err: any) {
      setUploadError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [onUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const fields: Array<{ key: keyof IntakeFormData; label: string; required?: boolean }> = [
    { key: 'insurerName', label: 'Insurance company', required: true },
    { key: 'patientName', label: 'Patient name', required: true },
    { key: 'denialDate', label: 'Date of denial', required: true },
    { key: 'medication', label: 'Medication or procedure denied', required: true },
    { key: 'denialReasonPlain', label: 'Reason for denial', required: true },
  ]

  const canContinue = parsedFields !== null || (data.insurerName && data.patientName && data.denialDate && data.medication)

  return (
    <StepShell
      title="Upload your denial notice to get started."
      subtitle="This is the letter from your insurance company saying your claim was denied. It may have arrived by mail or through your patient portal."
      onNext={onNext}
      nextDisabled={!canContinue}
    >
      <div className="space-y-6">
        {/* Upload zone */}
        {!parsedFields && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border border-dashed rounded p-10 text-center cursor-pointer transition-all
              ${isDragging
                ? 'border-brand-600 bg-brand-50'
                : 'border-border-2 hover:border-brand-600 hover:bg-brand-50 bg-surface'
              }
            `}
          >
            {isUploading ? (
              <div className="space-y-3">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
                <p className="text-txt-2 font-medium">Reading your denial notice…</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-[6px] border border-border bg-bg-2 flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-txt-2 font-medium text-[13.5px]">Drag and drop your file here</p>
                  <p className="font-mono text-[10.5px] text-txt-4 mt-1">or tap to browse — PDF, JPG, or PNG</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        )}

        {uploadError && (
          <div className="bg-status-red-bg border border-status-red-border rounded p-4 text-status-red text-sm">
            {uploadError}
          </div>
        )}

        {/* Parsed field confirmation */}
        {parsedFields && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-txt-2">Does this look right?</p>
              <button
                onClick={() => { setParsedFields(null); onUpdate({ denialNoticePath: '' }) }}
                className="text-sm text-brand-600 hover:text-brand-500"
              >
                Upload a different file
              </button>
            </div>
            <p className="text-txt-3 text-sm">Tap any field to correct it.</p>

            <div className="space-y-3">
              {fields.map(({ key, label, required }) => (
                <div key={key} className="bg-surface rounded border border-border p-[13px_14px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] font-medium text-txt-4 tracking-widest uppercase mb-1">
                        {label}{required && <span className="text-status-red ml-1">*</span>}
                      </p>
                      {editingField === key ? (
                        <input
                          autoFocus
                          type="text"
                          value={data[key] as string}
                          onChange={(e) => onUpdate({ [key]: e.target.value })}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setEditingField(null) }}
                          className="w-full text-txt font-medium text-[13px] border-b-2 border-brand-500 outline-none bg-transparent py-1"
                        />
                      ) : (
                        <p
                          onClick={() => setEditingField(key)}
                          className="text-txt font-medium text-[13px] cursor-pointer hover:text-brand-600 transition-colors"
                        >
                          {(data[key] as string) || (
                            <span className="text-txt-4 italic">Not found — tap to add</span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingField(key)}
                      className="text-txt-4 hover:text-brand-600 flex-shrink-0 mt-1"
                      aria-label="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {parsedFields.confidence === 'low' && (
              <div className="bg-status-amber-bg border border-status-amber-border rounded p-4 text-status-amber text-sm">
                Some fields couldn't be read clearly. Please review and correct any that look wrong.
              </div>
            )}
          </div>
        )}

        {/* Skip option */}
        {!parsedFields && !isUploading && (
          <div className="text-center">
            <button
              onClick={onNext}
              className="font-mono text-[10.5px] text-txt-4 hover:text-txt-3 underline underline-offset-2"
            >
              I don't have my denial notice — enter details manually
            </button>
          </div>
        )}
      </div>
    </StepShell>
  )
}
