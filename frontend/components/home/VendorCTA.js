import Link from 'next/link'

export default function VendorCTA() {
  return (
    <section className="section-container py-20">
      <div className="rounded-3xl bg-rose-gradient px-8 py-14 text-center text-white">
        <h2 className="font-heading text-4xl">Are You a Wedding Vendor?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-white/90">
          Join 500+ vendors on Weddify and reach thousands of couples planning their weddings across Sri Lanka.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary">Register as Vendor</Link>
          <Link href="/about" className="rounded-full border border-white px-6 py-3 text-sm font-bold text-white">Learn More</Link>
        </div>
      </div>
    </section>
  )
}
