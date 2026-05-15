'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Calendar, MapPin, Star, BadgeCheck, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { nodeAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import Toast from '@/components/common/Toast'
import { useAuth } from '@/context/AuthContext'

export default function VendorProfilePage() {
  const params = useParams()
  const vendorId = params?.id
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [bookError, setBookError] = useState('')
  const [toast, setToast] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm()

  useEffect(() => {
    const loadVendor = async () => {
      try {
        const { data } = await nodeAPI.get(`/api/vendors/${vendorId}`)
        setVendor(data.vendor)
      } catch (err) {
        setLoadError(err.response?.data?.message || 'Vendor not found')
      } finally {
        setLoading(false)
      }
    }

    if (vendorId) loadVendor()
  }, [vendorId])

  const { user, isAuthenticated } = useAuth()
  const isCatalogueVendor = String(vendorId).startsWith('py_')
  const canMessage = isAuthenticated && !isCatalogueVendor && user?.role !== 'vendor'

  const onBook = async (values) => {
    setBookError('')
    try {
      await nodeAPI.post('/api/bookings', {
        vendorId,
        vendorName: vendor?.businessName || vendor?.vendor_name || '',
        date: values.date,
        package: values.package,
        amount: Number(values.amount),
        notes: values.notes
      })
      setToast(isCatalogueVendor ? 'Enquiry submitted! The vendor will be notified.' : 'Booking request submitted successfully')
      reset()
    } catch (err) {
      setBookError(err.response?.data?.message || 'Failed to submit booking request')
    }
  }

  if (loading) return <div className="section-container py-16">Loading vendor profile...</div>
  if (loadError) return <div className="section-container py-16 text-error">{loadError}</div>
  if (!vendor) return null

  return (
    <section className="section-container py-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-white p-7 shadow-soft">
          <h1 className="font-heading text-4xl">{vendor.businessName}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-textSecondary"><MapPin size={15} /> {vendor.location}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-textSecondary"><Star size={15} className="text-warning" /> {vendor.rating || 0} / 5</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-textSecondary"><BadgeCheck size={15} className="text-success" /> {vendor.verified ? 'Verified Vendor' : 'Pending Verification'}</p>
          <p className="mt-6 text-sm leading-relaxed text-textSecondary">{vendor.description || 'Professional wedding service provider with tailored packages for Sri Lankan weddings.'}</p>

          <div className="mt-8 rounded-xl bg-background p-4">
            <h3 className="font-semibold">Packages</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead><tr className="text-textSecondary"><th className="pb-2">Package</th><th className="pb-2">Price</th></tr></thead>
                <tbody>
                  {(vendor.packages || [{ name: 'Standard', price: vendor.price || 75000 }]).map((pkg, idx) => (
                    <tr key={idx} className="border-t border-border"><td className="py-2">{pkg.name}</td><td className="py-2">{formatPrice(pkg.price)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {canMessage && (
            <Link
              href={`/messages/${vendorId}`}
              className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-primary/40 bg-primary/5 px-5 py-4 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              <MessageCircle size={18} />
              Message this vendor
            </Link>
          )}
          <form onSubmit={handleSubmit(onBook)} className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">{isCatalogueVendor ? 'Send Enquiry' : 'Book Now'}</h2>
            {isCatalogueVendor && (
              <p className="mt-1 text-xs text-textSecondary">
                This vendor is from our discovery catalogue. Submit an enquiry and we'll follow up.
              </p>
            )}
            {bookError && <p className="mt-2 text-sm text-error">{bookError}</p>}
            <div className="mt-4 space-y-3">
              <input type="date" className="w-full rounded-xl border border-border px-3 py-2 text-sm" {...register('date', { required: true })} />
              <input className="w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="Preferred package" {...register('package', { required: true })} />
              <input type="number" className="w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="Amount (Rs.)" {...register('amount', { required: true, min: 0 })} />
              <textarea rows={3} className="w-full rounded-xl border border-border px-3 py-2 text-sm" placeholder="Notes (optional)" {...register('notes')} />
            </div>
            <button disabled={isSubmitting} className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-70">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} />
                {isCatalogueVendor ? 'Submit Enquiry' : 'Submit Booking Request'}
              </span>
            </button>
          </form>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </section>
  )
}
