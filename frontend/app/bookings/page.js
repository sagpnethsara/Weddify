'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { nodeAPI } from '@/lib/api'
import { formatDate, formatPrice, getStatusColor } from '@/lib/utils'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await nodeAPI.get('/api/bookings/my')
        setBookings(data.bookings || [])
      } catch {
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const cancelBooking = async (id) => {
    await nodeAPI.put(`/api/bookings/${id}/cancel`)
    setBookings((prev) => prev.map((booking) => booking._id === id ? { ...booking, status: 'cancelled' } : booking))
  }

  return (
    <ProtectedRoute allowedRoles={['couple']}>
      <section className="section-container py-10">
        <h1 className="font-heading text-4xl">My Bookings</h1>
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white p-6 shadow-soft">
          {loading ? 'Loading bookings...' : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-textSecondary">
                  <th className="pb-3">Vendor</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Package</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t border-border">
                    <td className="py-3">{booking.vendorName || 'Vendor'}</td>
                    <td className="py-3">{formatDate(booking.date)}</td>
                    <td className="py-3">{booking.package}</td>
                    <td className="py-3">{formatPrice(booking.amount)}</td>
                    <td className="py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                    <td className="py-3">
                      {booking.status === 'pending' && (
                        <button onClick={() => cancelBooking(booking._id)} className="rounded-lg border border-error px-3 py-1 text-error">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </ProtectedRoute>
  )
}
