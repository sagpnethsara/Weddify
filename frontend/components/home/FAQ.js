'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How does vendor recommendation work?',
    a: 'We analyse vendor features including rating, experience, response time, verified status and repeat client rate to surface the best matches for your wedding.'
  },
  {
    q: 'Is Weddify free to use for couples?',
    a: 'Yes, couples can register and use all planning tools completely free. You only pay the vendor directly when you make a booking.'
  },
  {
    q: 'How do vendors get verified?',
    a: 'All vendors go through an admin review process before being approved on the platform. We verify business details and service quality.'
  },
  {
    q: 'Can I use Weddify from any district in Sri Lanka?',
    a: 'Yes, we cover all 25 districts across Sri Lanka. You can filter vendors by your specific district.'
  },
  {
    q: 'How do I book a vendor?',
    a: 'Browse vendors, view their profile, then click View Profile to submit a booking request directly through the platform.'
  }
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section-container py-20">
      <h2 className="text-center font-heading text-4xl">Frequently Asked Questions</h2>
      <div className="mx-auto mt-10 max-w-4xl space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = idx === open
          return (
            <div key={item.q} className="rounded-xl border border-border bg-white">
              <button
                onClick={() => setOpen(isOpen ? -1 : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-textPrimary">{item.q}</span>
                <ChevronDown className={`transition ${isOpen ? 'rotate-180' : ''}`} size={18} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-textSecondary">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
