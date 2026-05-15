import Link from 'next/link'
import { DollarSign, Users, CalendarCheck } from 'lucide-react'

const tools = [
  {
    title: 'Budget Tracker',
    description: 'Track every rupee of your wedding budget',
    icon: DollarSign,
    content: (
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-textSecondary"><span>Spent</span><span>72%</span></div>
        <div className="h-2 rounded-full bg-gray-200"><div className="h-full w-[72%] rounded-full bg-primary" /></div>
      </div>
    )
  },
  {
    title: 'Guest List Manager',
    description: 'Manage invitations and track RSVPs easily',
    icon: Users,
    content: <p className="mt-4 text-sm text-textSecondary">184 guests tracked • 126 confirmed • 34 pending</p>
  },
  {
    title: 'Vendor Bookings',
    description: 'All your bookings in one organised dashboard',
    icon: CalendarCheck,
    content: <p className="mt-4 text-sm text-textSecondary">5 active bookings • 2 pending confirmations</p>
  }
]

export default function PlanningTools() {
  return (
    <section className="section-container py-20">
      <div className="text-center">
        <h2 className="font-heading text-4xl">Complete Wedding Planning Tools</h2>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <article key={tool.title} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <Icon className="text-primary" size={28} />
              <h3 className="mt-4 font-heading text-2xl">{tool.title}</h3>
              <p className="mt-2 text-sm text-textSecondary">{tool.description}</p>
              {tool.content}
              <Link href="/dashboard" className="mt-5 inline-block text-sm font-semibold text-primary">Learn More</Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
