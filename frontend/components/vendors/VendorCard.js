import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import CategoryIcon from '@/components/common/CategoryIcon'
import { formatPrice } from '@/lib/utils'

export default function VendorCard({ vendor }) {
  return (
    <article className="surface-card group p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/45">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
            <CategoryIcon category={vendor.category || vendor.Category} className="h-7 w-7" />
          </div>
          <h3 className="mt-3 font-heading text-2xl">{vendor.businessName || vendor.vendor_name}</h3>
          <p className="text-sm text-textSecondary">{vendor.category || vendor.Category}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-textSecondary">
        <p className="flex items-center gap-2"><MapPin size={15} /> {vendor.location || vendor.Location}</p>
        {(vendor.rating || vendor['Rating (out of 5)'])
          ? <p className="flex items-center gap-2"><Star size={15} className="text-warning" /> {vendor.rating || vendor['Rating (out of 5)']}</p>
          : <p className="flex items-center gap-2"><Star size={15} className="text-border" /> <span className="italic">No rating yet</span></p>
        }
        {(vendor.price || vendor['Price (LKR)'])
          ? <p className="font-semibold text-textPrimary">{formatPrice(vendor.price || vendor['Price (LKR)'])}</p>
          : <p className="font-semibold text-textSecondary italic">Contact for pricing</p>
        }
      </div>

      <Link href={`/vendors/${vendor._id || vendor.id || ''}`} className="btn-primary mt-5 w-full text-center">
        View Profile
      </Link>
    </article>
  )
}
