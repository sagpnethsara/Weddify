import { Target, HeartHandshake } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <section className="bg-[url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="bg-black/60 py-24 text-white">
          <div className="section-container">
            <p className="chip border-white/30 bg-white/15 text-white">About Us</p>
            <h1 className="mt-4 page-title">About Weddify</h1>
            <p className="mt-4 max-w-2xl text-white/90">A platform built to make wedding planning in Sri Lanka faster, smarter, and deeply personal.</p>
          </div>
        </div>
      </section>

      <section className="section-container py-16">
        <h2 className="section-title">Our Story</h2>
        <p className="mt-4 max-w-4xl leading-relaxed text-textSecondary">
          Weddify was created to solve the overwhelming process of finding reliable wedding vendors across Sri Lanka.
          We combined local wedding planning knowledge with machine learning to help couples make decisions confidently.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="surface-card p-6"><Target className="text-primary" /><h3 className="mt-3 font-heading text-2xl">Mission</h3><p className="mt-2 text-sm text-textSecondary">Empower every couple with trustworthy, data-backed vendor choices.</p></article>
          <article className="surface-card p-6"><HeartHandshake className="text-accent" /><h3 className="mt-3 font-heading text-2xl">Vision</h3><p className="mt-2 text-sm text-textSecondary">Become Sri Lanka's most trusted AI wedding planning platform.</p></article>
        </div>

      </section>
    </>
  )
}
