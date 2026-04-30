'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatPrice } from '@/lib/utils'

const COLORS = ['#B76E79', '#2D6A4F', '#F59E0B', '#60A5FA', '#A78BFA', '#F87171']

export default function BudgetTracker({ budget, onBudgetChange, bookings = [] }) {
  const spentByCategory = useMemo(() => {
    const map = {}
    bookings.forEach((b) => {
      const label = b.vendorName || b.package || 'Other'
      map[label] = (map[label] || 0) + (b.amount || 0)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [bookings])

  const totalSpent = useMemo(() => bookings.reduce((sum, b) => sum + (b.amount || 0), 0), [bookings])
  const remaining = Math.max(0, budget - totalSpent)
  const progress = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-heading text-2xl">Budget Tracker</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <label className="text-sm text-textSecondary">Set total budget (LKR)</label>
          <input
            id="budget-input"
            type="number"
            min="0"
            value={budget || ''}
            onChange={(e) => onBudgetChange(Number(e.target.value || 0))}
            placeholder="Enter your budget"
            className="mt-2 w-full rounded-xl border border-border px-4 py-2 text-sm"
          />
          <div className="mt-4 grid gap-2 text-sm">
            <p>Spent: <span className="font-semibold">{formatPrice(totalSpent)}</span></p>
            <p>Remaining: <span className="font-semibold text-accent">{formatPrice(remaining)}</span></p>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-textSecondary">
              <span>Usage</span><span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="h-64">
          {spentByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spentByCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                  {spentByCategory.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-textSecondary">
              No bookings yet — spending breakdown will appear here.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
