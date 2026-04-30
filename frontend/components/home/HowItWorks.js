'use client'

import { motion } from 'framer-motion'
import { SlidersHorizontal, Brain, CheckCircle } from 'lucide-react'

const steps = [
  {
    title: 'Tell Us Your Preferences',
    description: 'Set your budget, preferred location, vendor category and wedding date',
    icon: SlidersHorizontal,
    iconClass: 'bg-primary/15 text-primary'
  },
  {
    title: 'AI Finds Best Vendors',
    description: 'Our stacking ensemble ML model analyses 12 features to recommend the most suitable vendors for your wedding',
    icon: Brain,
    iconClass: 'bg-accent/15 text-accent'
  },
  {
    title: 'Book with Confidence',
    description: 'Review AI confidence scores, compare packages and book your preferred vendors directly through the platform',
    icon: CheckCircle,
    iconClass: 'bg-blue-100 text-blue-600'
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-container py-20">
      <div className="text-center">
        <p className="chip">How It Works</p>
        <h2 className="section-title mt-4">How Weddify Works</h2>
        <p className="mt-3 text-textSecondary">Three simple steps to your perfect wedding</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="surface-card p-7"
            >
              <div className={`mb-5 inline-flex rounded-full p-4 ${step.iconClass}`}>
                <Icon size={24} />
              </div>
              <h3 className="font-heading text-2xl leading-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-textSecondary">{step.description}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
