export default function ConfidenceBar({ value = 0 }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-textSecondary">
        <span>AI Confidence</span>
        <span>{Number(value).toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }} />
      </div>
    </div>
  )
}
