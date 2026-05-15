export default function StatsCard({ title, value, icon: Icon, iconClass = 'text-primary', note }) {
  return (
    <article className="surface-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/35">
      <div className="flex items-center justify-between">
        <p className="text-sm text-textSecondary">{title}</p>
        <div className="rounded-lg bg-background p-2">
          <Icon className={iconClass} size={20} />
        </div>
      </div>
      <h3 className="mt-3 font-heading text-3xl">{value}</h3>
      {note && <p className="mt-1 text-xs text-textSecondary">{note}</p>}
    </article>
  )
}
