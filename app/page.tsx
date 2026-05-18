import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        {/* Version label */}
        <p className="sh-label text-center mb-6">SIDE.HEALTH / v0.1</p>

        {/* Wordmark */}
        <h1 className="text-center text-3xl mb-3">
          <span className="font-bold text-txt">Side</span>
          <span className="font-light text-brand-600">Health</span>
        </h1>

        {/* Tagline */}
        <p className="text-center text-txt-3 text-[15px] leading-relaxed mb-10">
          We are by your side — expert billing disputes and a retained attorney when they won&apos;t budge.
        </p>

        {/* Value props */}
        <div className="border border-border rounded-lg divide-y divide-border mb-10">
          {[
            { num: '01', label: 'Dispute letters', desc: 'Built from your bill, line by line' },
            { num: '02', label: 'Attorney on standby', desc: 'Demand letter on firm letterhead' },
            { num: '03', label: 'Pay only on savings', desc: '10% of what we recover for you' },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-4 px-5 py-4">
              <span className="font-mono text-[10px] font-medium text-txt-4 flex-shrink-0">
                {item.num}
              </span>
              <div>
                <div className="text-[13px] font-medium text-txt mb-0.5">{item.label}</div>
                <div className="text-[11.5px] text-txt-4">{item.desc}</div>
              </div>
            </div>
          ))}
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
