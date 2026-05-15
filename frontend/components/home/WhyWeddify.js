'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

const features = [
  'AI-powered vendor recommendations',
  'All 25 Sri Lankan districts covered',
  'Verified and trusted vendors only',
  'Real-time booking management',
  'Budget tracking and planning tools',
  'Guest list and RSVP management'
]

export default function WhyWeddify() {
  return (
    <section className="section-container py-20">
      <h2 className="font-heading text-center text-4xl">Why Couples Choose Weddify</h2>
      <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-heading text-3xl">The Smart Way to Plan Your Wedding in Sri Lanka</h3>
          <p className="mt-4 leading-relaxed text-textSecondary">
            Weddify combines human wedding planning needs with an advanced AI recommendation engine to guide
            couples to the right vendors based on quality, value, and compatibility.
          </p>
          <p className="mt-3 leading-relaxed text-textSecondary">
            Built specifically for Sri Lanka, the platform understands district-level availability, local pricing
            patterns, and category-specific vendor strengths.
          </p>
          <Link href="/register" className="mt-7 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
            Get Started
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 rounded-2xl bg-white p-7 shadow-soft"
        >
          {features.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle className="text-accent" size={20} />
              <p className="text-sm text-textSecondary">{item}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
