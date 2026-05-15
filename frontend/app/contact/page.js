'use client'

import { useForm } from 'react-hook-form'
import { MapPin, Mail, Phone, Clock } from 'lucide-react'
import Toast from '@/components/common/Toast'
import { useState } from 'react'

export default function ContactPage() {
  const [toast, setToast] = useState('')
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = () => {
    setToast('Message sent successfully')
    reset()
  }

  return (
    <>
      <section className="bg-rose-gradient py-20 text-white">
        <div className="section-container">
          <p className="chip border-white/30 bg-white/15 text-white">Support Team</p>
          <h1 className="mt-4 page-title">Contact Weddify</h1>
          <p className="mt-3 text-white/90">Need support with vendors, bookings, or onboarding? We are here to help.</p>
        </div>
      </section>

      <section className="section-container py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="surface-card p-6">
            <h2 className="font-heading text-3xl">Send Us a Message</h2>
            <div className="mt-5 space-y-3">
              <input className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" placeholder="Your Name" {...register('name', { required: true })} />
              <input className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" placeholder="Email Address" {...register('email', { required: true })} />
              <input className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" placeholder="Subject" {...register('subject', { required: true })} />
              <textarea rows={5} className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" placeholder="Message" {...register('message', { required: true })} />
            </div>
            <button className="btn-primary mt-4">Send Message</button>
          </form>

          <div className="space-y-6">
            <div className="surface-card p-6">
              <h2 className="font-heading text-3xl">Contact Details</h2>
              <div className="mt-5 space-y-4 text-sm text-textSecondary">
                <p className="flex items-center gap-2"><MapPin size={17} /> Colombo, Sri Lanka</p>
                <p className="flex items-center gap-2"><Mail size={17} /> info@weddify.lk</p>
                <p className="flex items-center gap-2"><Phone size={17} /> +94 11 234 5678</p>
                <p className="flex items-center gap-2"><Clock size={17} /> Mon-Fri 9am-6pm</p>
              </div>
            </div>
            <div className="surface-card overflow-hidden">
              <iframe
                title="Colombo map placeholder"
                src="https://maps.google.com/maps?q=Colombo%20Sri%20Lanka&t=&z=11&ie=UTF8&iwloc=&output=embed"
                className="h-72 w-full"
              />
            </div>
          </div>
        </div>
      </section>
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  )
}
