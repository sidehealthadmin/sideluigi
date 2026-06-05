import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        {/* Version label */}
        <p className="sh-label text-center mb-6">SIDE.HEALTH / v0.1</p>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/side-health-logo.png"
            alt="Side Health"
            width={320}
            height={128}
            priority
          />
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
