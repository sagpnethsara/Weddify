'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-6">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/55" />
      <div className="section-container relative z-10 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="chip border-white/30 bg-white/15 text-white">AI Wedding Planning Platform</p>
          <h1 className="mt-5 font-heading text-5xl leading-tight text-white sm:text-7xl">
            Plan Your Perfect Sri Lankan Wedding
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            AI-powered vendor recommendations tailored for Sri Lanka. Find trusted photographers, venues,
            caterers and more in your district.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/vendors" className="btn-primary rounded-full px-8 py-3.5 text-sm font-bold">
              Find Vendors
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-full border border-white px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white hover:text-textPrimary">
              Register Free
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
