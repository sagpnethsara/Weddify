'use client'

import { motion } from 'framer-motion'
import { Star, Camera } from 'lucide-react'

const testimonials = [
  {
    quote: 'Weddify made our wedding planning so much easier. The AI recommendations were spot on and we found our photographer in Colombo within minutes.',
    name: 'Kasun & Nimasha',
    label: 'Colombo Wedding, December 2024',
    avatar: 'KN'
  },
  {
    quote: 'We used Weddify to find our catering team in Kandy. The AI confidence score gave us so much confidence in our choice. Everything was perfect!',
    name: 'Roshan & Dilani',
    label: 'Kandy Wedding, November 2024',
    avatar: 'RD'
  },
  {
    quote: 'As a vendor on Weddify, I have received 3x more bookings since joining. The platform is professional and the couples are serious about booking.',
    name: 'Thisara Photography',
    label: 'Colombo Vendor',
    avatarIcon: true
  }
]

export default function Testimonials() {
  return (
    <section className="section-container py-20">
      <h2 className="text-center font-heading text-4xl">What Couples Say About Us</h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((item, idx) => (
          <motion.article
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-soft"
          >
            <div className="mb-4 flex text-warning">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-sm leading-relaxed text-textSecondary">{item.quote}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                {item.avatarIcon ? <Camera size={16} /> : item.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-textPrimary">{item.name}</p>
                <p className="text-xs text-textSecondary">{item.label}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
