'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Calendar, DollarSign, Users, UserCheck, Clock3 } from 'lucide-react'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import StatsCard from '@/components/dashboard/StatsCard'
import BudgetTracker from '@/components/dashboard/BudgetTracker'
import GuestList from '@/components/dashboard/GuestList'
import BookingList from '@/components/dashboard/BookingList'
import { nodeAPI } from '@/lib/api'
import { daysUntil, formatDate, formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function CoupleDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [budget, setBudget] = useState(0)
  const [guests, setGuests] = useState([])
  const planLoaded = useRef(false)
  const budgetTimer = useRef(null)

  useEffect(() => {
    const fetchAll = async () => {
      const [bookingsRes, planRes] = await Promise.allSettled([
        nodeAPI.get('/api/bookings/my'),
        nodeAPI.get('/api/couple/plan')
      ])

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.data.bookings || [])
      } else {
        console.error('Bookings load failed:', bookingsRes.reason)
      }

      if (planRes.status === 'fulfilled') {
        setBudget(planRes.value.data.budget || 0)
        const loadedGuests = (planRes.value.data.guests || []).map(({ name, side, status }) => ({ name, side, status }))
        setGuests(loadedGuests)
      } else {
        console.error('Plan load failed:', planRes.reason)
      }

      planLoaded.current = true
    }
    fetchAll()
  }, [])

  const handleBudgetChange = (value) => {
    setBudget(value)
    if (!planLoaded.current) return
    clearTimeout(budgetTimer.current)
    budgetTimer.current = setTimeout(() => {
      nodeAPI.put('/api/couple/plan', { budget: value }).catch((e) => console.error('Budget save failed:', e))
    }, 600)
  }

  const handleGuestsChange = (updater) => {
    setGuests((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (planLoaded.current) {
        nodeAPI.put('/api/couple/plan', { guests: next }).catch((e) => console.error('Guests save failed:', e))
      }
      return next
    })
  }

  const days = useMemo(() => daysUntil(user?.weddingDate), [user?.weddingDate])
  const confirmedGuests = useMemo(() => guests.filter((g) => g.status === 'Confirmed').length, [guests])
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings])
  const totalSpent = useMemo(() => bookings.reduce((sum, b) => sum + (b.amount || 0), 0), [bookings])

  return (
    <ProtectedRoute allowedRoles={['couple']}>
      <section className="section-container py-10">
        <div className="rounded-3xl bg-rose-gradient p-8 text-white shadow-panel">
          <p className="chip border-white/30 bg-white/15 text-white">Couple Dashboard</p>
          <h1 className="font-heading text-4xl">
            Welcome back, {user?.groomName || 'Groom'} & {user?.brideName || 'Bride'}!
          </h1>
          <p className="mt-2 text-white/90">Wedding date: {formatDate(user?.weddingDate)}</p>
          <p className="mt-1 text-white/90">Your wedding is in {days} days</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Days Until Wedding" value={days} icon={Calendar} iconClass="text-blue-500" />
          <StatsCard title="Total Budget" value={budget > 0 ? formatPrice(budget) : 'Not set'} icon={DollarSign} iconClass="text-success" />
          <StatsCard title="Vendors Booked" value={bookings.length} icon={Users} iconClass="text-primary" />
          <StatsCard title="Guests Confirmed" value={confirmedGuests} icon={UserCheck} iconClass="text-purple-500" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <BudgetTracker budget={budget} onBudgetChange={handleBudgetChange} bookings={bookings} />
            <GuestList guests={guests} onGuestsChange={handleGuestsChange} />
            <BookingList bookings={bookings} />
          </div>

          <aside className="surface-card h-fit space-y-4 p-6">
            <h2 className="font-heading text-2xl">Quick Actions</h2>
            <Link href="/vendors" className="btn-primary block w-full text-center">Browse Vendors</Link>
            <button
              className="btn-secondary w-full"
              onClick={() => document.getElementById('budget-input')?.focus()}
            >
              Update Budget
            </button>
            <button
              className="btn-ghost w-full"
              onClick={() => document.getElementById('guest-input')?.focus()}
            >
              Manage Guests
            </button>
            {pendingBookings > 0 && (
              <div className="rounded-xl bg-background p-4 text-xs text-textSecondary">
                <p className="flex items-center gap-2">
                  <Clock3 size={14} />
                  {pendingBookings} booking {pendingBookings === 1 ? 'confirmation' : 'confirmations'} pending
                </p>
              </div>
            )}
            {budget > 0 && totalSpent > 0 && (
              <div className="rounded-xl bg-background p-4 text-xs text-textSecondary">
                <p>Total spent: <span className="font-semibold text-primary">{formatPrice(totalSpent)}</span></p>
                <p className="mt-1">Remaining: <span className="font-semibold text-accent">{formatPrice(Math.max(0, budget - totalSpent))}</span></p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </ProtectedRoute>
  )
}
