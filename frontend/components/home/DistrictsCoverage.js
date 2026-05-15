import Link from 'next/link'
import { districts } from '@/lib/utils'

const popular = new Set(['Colombo', 'Gampaha', 'Kandy', 'Galle'])

export default function DistrictsCoverage() {
  return (
    <section className="section-container py-20">
      <h2 className="text-center font-heading text-4xl">Serving Couples Across Sri Lanka</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {districts.map((district) => (
          <span
            key={district}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              popular.has(district)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-white text-textSecondary'
            }`}
          >
            {district}
          </span>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/vendors" className="text-sm font-semibold text-primary">View vendors in your district</Link>
      </div>
    </section>
  )
}
