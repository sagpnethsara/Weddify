export default function AIBadge({ recommended }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${recommended ? 'bg-success/15 text-success' : 'bg-gray-100 text-textSecondary'}`}>
      {recommended ? 'AI Recommended' : 'Under Review'}
    </span>
  )
}
