import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Review Queue — Appeal My Denial',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg">
      {/* Admin header */}
      <header className="bg-txt text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-brand-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Appeal My Denial — Staff Portal</span>
          </div>
          <a href="/" className="text-txt-4 hover:text-white text-sm transition-colors">
            ← Patient intake
          </a>
        </div>
      </header>
      {children}
    </div>
  )
}
