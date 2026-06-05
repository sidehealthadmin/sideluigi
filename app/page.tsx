import Link from 'next/link'

function SideHealthLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Cross / signal icon */}
      <g transform="translate(90, 100)">
        {/* Vertical pill — teal */}
        <rect x="-22" y="-80" width="44" height="110" rx="22" fill="#5BC5C2" />
        {/* Horizontal pill — blue */}
        <rect x="-80" y="-22" width="110" height="44" rx="22" fill="#3B82C4" />
        {/* Top-right rounded corner — blue, overlaps to form cross */}
        <rect x="-22" y="-80" width="102" height="44" rx="22" fill="#3B82C4" />
        {/* Signal waves */}
        <g stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d="M-12,10 Q-12,-2 -4,-10" />
          <path d="M-20,18 Q-20,-2 -4,-18" />
          <path d="M-28,26 Q-28,-2 -4,-26" />
        </g>
      </g>
      {/* SIDE text */}
      <text x="170" y="85" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="600" fontSize="72" fill="#2D3748" letterSpacing="6">SIDE</text>
      {/* HEALTH text */}
      <text x="170" y="155" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="600" fontSize="72" fill="#2D3748" letterSpacing="6">HEALTH</text>
      {/* TM */}
      <text x="488" y="85" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="400" fontSize="16" fill="#2D3748">™</text>
    </svg>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        {/* Version label */}
        <p className="sh-label text-center mb-6">SIDE.HEALTH / v0.1</p>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <SideHealthLogo className="w-[320px] h-auto" />
        </div>

        {/* Tagline */}
        <p className="text-center text-txt-3 text-[15px] leading-relaxed mb-10">
          We are by your side — expert billing disputes when your medical bills don&apos;t add up.
        </p>

        {/* Value prop */}
        <div className="border border-border rounded-lg mb-10">
          <div className="flex items-center gap-4 px-5 py-4">
            <span className="font-mono text-[10px] font-medium text-txt-4 flex-shrink-0">
              01
            </span>
            <div>
              <div className="text-[13px] font-medium text-txt mb-0.5">Dispute letters</div>
              <div className="text-[11.5px] text-txt-4">Built from your bill, line by line</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/intake">
          <button className="sh-btn sh-btn-primary">
            Get started &rarr;
          </button>
        </Link>
      </div>
    </div>
  )
}
