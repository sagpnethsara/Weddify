'use client'

import { useForm } from 'react-hook-form'

export default function GuestList({ guests, onGuestsChange }) {
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = (values) => {
    onGuestsChange((prev) => [...prev, { ...values, status: 'Pending' }])
    reset()
  }

  const toggleStatus = (idx) => {
    onGuestsChange((prev) =>
      prev.map((g, i) =>
        i === idx ? { ...g, status: g.status === 'Confirmed' ? 'Pending' : 'Confirmed' } : g
      )
    )
  }

  const removeGuest = (idx) => {
    onGuestsChange((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl">Guest List Manager</h2>
        <span className="text-sm text-textSecondary">{guests.length} guests · {guests.filter((g) => g.status === 'Confirmed').length} confirmed</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          id="guest-input"
          className="rounded-xl border border-border px-3 py-2 text-sm"
          placeholder="Guest Name"
          {...register('name', { required: true })}
        />
        <select className="rounded-xl border border-border px-3 py-2 text-sm" {...register('side', { required: true })}>
          <option value="Bride">Bride Side</option>
          <option value="Groom">Groom Side</option>
        </select>
        <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Add Guest</button>
      </form>

      {guests.length === 0 ? (
        <p className="mt-6 text-center text-sm text-textSecondary">No guests added yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-textSecondary">
                <th className="pb-2">Name</th>
                <th className="pb-2">Side</th>
                <th className="pb-2">RSVP</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="py-2">{guest.name}</td>
                  <td className="py-2">{guest.side}</td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleStatus(idx)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${guest.status === 'Confirmed' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}
                    >
                      {guest.status}
                    </button>
                  </td>
                  <td className="py-2">
                    <button onClick={() => removeGuest(idx)} className="text-xs text-error hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
