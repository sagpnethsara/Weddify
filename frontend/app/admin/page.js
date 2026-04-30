'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import ApprovalTable from '@/components/admin/ApprovalTable'
import ActivityFeed from '@/components/admin/ActivityFeed'
import { nodeAPI } from '@/lib/api'
import StatsCard from '@/components/dashboard/StatsCard'
import { Users, Store, CalendarCheck, BadgeCheck } from 'lucide-react'

const chartColors = ['#B76E79', '#2D6A4F', '#60A5FA', '#F59E0B']

export default function AdminPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalBookings: 0, approvedVendors: 0, categories: [] })
  const [pendingVendors, setPendingVendors] = useState([])

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          nodeAPI.get('/api/admin/stats'),
          nodeAPI.get('/api/admin/vendors/pending')
        ])
        setStats(statsRes.data || {})
        setPendingVendors(pendingRes.data.vendors || [])
      } catch {
        setStats((prev) => ({ ...prev, categories: [] }))
      }
    }
    fetchAdminData()
  }, [])

  const handleAction = async (id, action) => {
    await nodeAPI.put(`/api/admin/vendors/${id}/${action}`)
    setPendingVendors((prev) => prev.filter((vendor) => vendor._id !== id))
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <section className="section-container py-10">
        <h1 className="font-heading text-4xl">Admin Dashboard</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Total Users" value={stats.totalUsers || 0} icon={Users} iconClass="text-blue-500" />
          <StatsCard title="Total Vendors" value={stats.totalVendors || 0} icon={Store} iconClass="text-primary" />
          <StatsCard title="Total Bookings" value={stats.totalBookings || 0} icon={CalendarCheck} iconClass="text-accent" />
          <StatsCard title="Approved Vendors" value={stats.approvedVendors || 0} icon={BadgeCheck} iconClass="text-success" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">Category Distribution</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categories || []} dataKey="count" nameKey="category" outerRadius={100}>
                    {(stats.categories || []).map((_, idx) => <Cell key={idx} fill={chartColors[idx % chartColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <ActivityFeed />
        </div>

        <div className="mt-8">
          <ApprovalTable
            vendors={pendingVendors}
            onApprove={(id) => handleAction(id, 'approve')}
            onReject={(id) => handleAction(id, 'reject')}
          />
        </div>
      </section>
    </ProtectedRoute>
  )
}
