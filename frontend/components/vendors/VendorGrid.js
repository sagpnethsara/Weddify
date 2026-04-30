import VendorCard from '@/components/vendors/VendorCard'
import EmptyState from '@/components/common/EmptyState'
import LoadingSkeleton from '@/components/common/LoadingSkeleton'

export default function VendorGrid({ vendors, loading, error }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-72" />)}
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Could not load vendors" description={error} />
  }

  if (!vendors.length) {
    return <EmptyState title="No vendors found" description="Try changing category, location, or budget filters." />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {vendors.map((vendor, index) => (
        <VendorCard key={vendor._id || vendor.id || index} vendor={vendor} />
      ))}
    </div>
  )
}
