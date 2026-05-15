const activities = [
  'Admin approved Thisara Photography',
  'New couple registration from Kandy',
  'Vendor booking request created for Galle Ocean Ballroom',
  'System retrained ML batch scoring for vendor ranking'
]

export default function ActivityFeed() {
  return (
    <aside className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="font-heading text-2xl">Activity Feed</h2>
      <div className="mt-4 space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="rounded-xl bg-background px-4 py-3 text-sm text-textSecondary">
            {activity}
          </div>
        ))}
      </div>
    </aside>
  )
}
