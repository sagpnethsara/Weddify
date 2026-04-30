'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { nodeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function VendorDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [profileForm, setProfileForm] = useState({ businessName: '', description: '', price: '', priceTier: '' })
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          nodeAPI.get('/api/vendors/my/profile'),
          nodeAPI.get('/api/bookings/my')
        ])
        const v = profileRes.data.vendor
        setProfileForm({
          businessName: v.businessName || '',
          description: v.description || '',
          price: v.price || '',
          priceTier: v.priceTier || ''
        })
        setBookings(bookingsRes.data.bookings || [])
      } catch {
        setBookings([])
      }
    }
    load()
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaveStatus('saving')
    try {
      const payload = {
        ...profileForm,
        price: profileForm.price !== '' ? Number(profileForm.price) : undefined
      }
      const { data } = await nodeAPI.put(`/api/vendors/${user._id}`, payload)
      const v = data.vendor
      setProfileForm({
        businessName: v.businessName || '',
        description: v.description || '',
        price: v.price || '',
        priceTier: v.priceTier || ''
      })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  const totalBookings = bookings.length
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings])
  const acceptedCount = useMemo(() => bookings.filter((b) => b.status === 'accepted').length, [bookings])

  const monthlyData = useMemo(() => {
    const counts = Array(12).fill(0)
    bookings.forEach((b) => {
      if (b.date) {
        const m = new Date(b.date).getMonth()
        if (m >= 0 && m < 12) counts[m]++
      }
    })
    return MONTHS.map((month, i) => ({ month, bookings: counts[i] }))
  }, [bookings])

  const actOnBooking = async (id, action) => {
    await nodeAPI.put(`/api/bookings/${id}/${action}`)
    setBookings((prev) => prev.map((booking) => booking._id === id ? { ...booking, status: action === 'accept' ? 'accepted' : 'declined' } : booking))
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <section className="section-container py-10">
        {user?.status === 'pending' && (
          <div className="mb-6 rounded-2xl bg-warning/15 px-6 py-4 text-warning">
            Your vendor account is pending approval. Our admin team will review it within 24 hours.
          </div>
        )}

        <h1 className="font-heading text-4xl">Vendor Dashboard</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-textSecondary">Total Bookings</p>
            <p className="mt-1 font-heading text-3xl">{totalBookings}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-textSecondary">Pending</p>
            <p className="mt-1 font-heading text-3xl text-warning">{pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-soft">
            <p className="text-sm text-textSecondary">Accepted</p>
            <p className="mt-1 font-heading text-3xl text-success">{acceptedCount}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">Monthly Bookings</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#B76E79" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">Edit Profile</h2>
            <form onSubmit={saveProfile} className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                placeholder="Business Name"
                value={profileForm.businessName}
                onChange={(e) => { setSaveStatus(''); setProfileForm((f) => ({ ...f, businessName: e.target.value })) }}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-textSecondary">Starting Price (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                    placeholder="e.g. 150000"
                    value={profileForm.price}
                    onChange={(e) => { setSaveStatus(''); setProfileForm((f) => ({ ...f, price: e.target.value })) }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-textSecondary">Price Tier</label>
                  <select
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                    value={profileForm.priceTier}
                    onChange={(e) => { setSaveStatus(''); setProfileForm((f) => ({ ...f, priceTier: e.target.value })) }}
                  >
                    <option value="">Select tier</option>
                    <option value="Budget">Budget</option>
                    <option value="Mid-Range">Mid-Range</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>
              <textarea
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                rows={3}
                placeholder="Business Description"
                value={profileForm.description}
                onChange={(e) => { setSaveStatus(''); setProfileForm((f) => ({ ...f, description: e.target.value })) }}
              />
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saveStatus === 'saving'} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {saveStatus === 'saving' ? 'Saving…' : 'Save Changes'}
                </button>
                {saveStatus === 'saved' && <span className="text-sm text-success">Saved successfully</span>}
                {saveStatus === 'error' && <span className="text-sm text-error">Failed to save</span>}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-heading text-2xl">Incoming Booking Requests</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="text-textSecondary"><th className="pb-2">Couple</th><th className="pb-2">Date</th><th className="pb-2">Status</th><th className="pb-2">Actions</th></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-border">
                    <td className="py-3">{booking.coupleName || 'Couple'}</td>
                    <td className="py-3">{booking.date?.slice(0, 10)}</td>
                    <td className="py-3">{booking.status}</td>
                    <td className="py-3">
                      {booking.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => actOnBooking(booking._id, 'accept')} className="rounded-lg bg-success px-3 py-1 text-white text-sm">Accept</button>
                          <button onClick={() => actOnBooking(booking._id, 'decline')} className="rounded-lg bg-error px-3 py-1 text-white text-sm">Decline</button>
                        </div>
                      ) : (
                        <span className="text-xs text-textSecondary capitalize">{booking.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  )
}
