import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import CategoryIcon from '@/components/common/CategoryIcon'

const vendors = [
  { name: 'Thisara Photography', category: 'Photographers', location: 'Colombo', rating: 4.8, price: 'Rs. 85,000 - Rs. 180,000' },
  { name: 'Galle Ocean Ballroom', category: 'Venues', location: 'Galle', rating: 4.7, price: 'Rs. 450,000 - Rs. 1,200,000' },
  { name: 'Kandy Blossom Decor', category: 'Decorators', location: 'Kandy', rating: 4.6, price: 'Rs. 120,000 - Rs. 350,000' },
  { name: 'Royal Flavors Catering', category: 'Catering', location: 'Gampaha', rating: 4.9, price: 'Rs. 2,800 / plate' }
]

export default function FeaturedVendors() {
  return (
    <section className="section-container py-20">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-4xl">Featured Vendors This Month</h2>
          <p className="mt-2 text-textSecondary">Top-performing services selected by quality and booking consistency</p>
        </div>
      </div>

      <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4">
        {vendors.map((vendor) => (
          <article key={vendor.name} className="min-w-[280px] snap-start rounded-2xl border border-border bg-white p-6 shadow-soft sm:min-w-[320px]">
            <CategoryIcon category={vendor.category} className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-heading text-2xl">{vendor.name}</h3>
            <p className="mt-1 text-sm text-textSecondary">{vendor.category}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-textSecondary"><MapPin size={14} /> {vendor.location}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-textSecondary"><Star size={14} className="text-warning" /> {vendor.rating} / 5.0</p>
            <p className="mt-2 text-sm font-medium text-textPrimary">{vendor.price}</p>
            <Link href="/vendors" className="mt-5 block rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white">
              View Profile
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
