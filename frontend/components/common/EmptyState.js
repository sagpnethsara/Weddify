import { SearchX } from 'lucide-react'

export default function EmptyState({ title = 'No data found', description = 'Try adjusting your filters.' }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
      <SearchX className="mx-auto mb-4 text-textSecondary" size={32} />
      <h3 className="font-heading text-2xl text-textPrimary">{title}</h3>
      <p className="mt-2 text-sm text-textSecondary">{description}</p>
    </div>
  )
}
