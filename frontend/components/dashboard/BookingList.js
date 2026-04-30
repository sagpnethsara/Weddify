import { formatDate, formatPrice, getStatusColor } from '@/lib/utils'

export default function BookingList({ bookings }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-heading text-2xl">Recent Bookings</h2>
      <div className="mt-4 space-y-3">
        {bookings.map((booking) => (
          <article key={booking._id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-textPrimary">{booking.vendorName || 'Vendor Booking'}</h3>
                <p className="text-xs text-textSecondary">{formatDate(booking.date)} • {formatPrice(booking.amount || 0)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
