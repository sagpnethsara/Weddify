export default function LoadingSkeleton({ className = 'h-40' }) {
  return <div className={`${className} animate-pulse rounded-2xl border border-border/60 bg-white/70`} />
}
