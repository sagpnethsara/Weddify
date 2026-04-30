'use client'

import { categories, districts } from '@/lib/utils'

export default function VendorFilters({ filters, onChange, onReset }) {
  return (
    <aside className="surface-card p-5">
      <h3 className="font-heading text-2xl">Filters</h3>
      <div className="mt-4 space-y-4">
        <select className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" value={filters.category} onChange={(e) => onChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" value={filters.location} onChange={(e) => onChange('location', e.target.value)}>
          <option value="">All Districts</option>
          {districts.map((district) => <option key={district} value={district}>{district}</option>)}
        </select>

        <select className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" value={filters.priceTier} onChange={(e) => onChange('priceTier', e.target.value)}>
          <option value="">All Price Tiers</option>
          <option value="Budget">Budget</option>
          <option value="Mid-Range">Mid-Range</option>
          <option value="Premium">Premium</option>
        </select>

        <input className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => onChange('minPrice', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20" type="number" min="0" max="5" step="0.1" placeholder="Minimum Rating" value={filters.rating} onChange={(e) => onChange('rating', e.target.value)} />
      </div>
      <button onClick={onReset} className="btn-secondary mt-5 w-full">Reset Filters</button>
    </aside>
  )
}
