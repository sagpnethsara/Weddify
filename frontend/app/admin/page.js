'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Trash2, AlertCircle, Edit2, X } from 'lucide-react'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import ApprovalTable from '@/components/admin/ApprovalTable'
import ActivityFeed from '@/components/admin/ActivityFeed'
import { nodeAPI } from '@/lib/api'
import StatsCard from '@/components/dashboard/StatsCard'
import { Users, Store, CalendarCheck, BadgeCheck } from 'lucide-react'
import Toast from '@/components/common/Toast'

const chartColors = ['#B76E79', '#2D6A4F', '#60A5FA', '#F59E0B']

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'bookings', label: 'Bookings' }
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({ totalUsers: 0, totalVendors: 0, totalBookings: 0, approvedVendors: 0, categories: [] })
  const [pendingVendors, setPendingVendors] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [allVendors, setAllVendors] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editItemType, setEditItemType] = useState(null) // 'user', 'vendor', 'booking'
  const [editFormData, setEditFormData] = useState({})
  const [isEditSaving, setIsEditSaving] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [statsRes, pendingRes, usersRes, vendorsRes, bookingsRes] = await Promise.all([
        nodeAPI.get('/api/admin/stats'),
        nodeAPI.get('/api/admin/vendors/pending'),
        nodeAPI.get('/api/admin/users'),
        nodeAPI.get('/api/admin/vendors'),
        nodeAPI.get('/api/admin/bookings')
      ])
      setStats(statsRes.data || {})
      setPendingVendors(pendingRes.data.vendors || [])
      setAllUsers(usersRes.data || [])
      setAllVendors(vendorsRes.data || [])
      setAllBookings(bookingsRes.data || [])
    } catch (error) {
      setToast({ message: 'Failed to load admin data', type: 'error' })
      setStats((prev) => ({ ...prev, categories: [] }))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return
    try {
      await nodeAPI.delete(`/api/admin/users/${id}`)
      setAllUsers((prev) => prev.filter((u) => u._id !== id))
      setToast({ message: 'User deleted successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to delete user', type: 'error' })
    }
  }

  const handleDeleteVendor = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"?`)) return
    try {
      await nodeAPI.delete(`/api/admin/vendors/${id}`)
      setAllVendors((prev) => prev.filter((v) => v._id !== id))
      setToast({ message: 'Vendor deleted successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to delete vendor', type: 'error' })
    }
  }

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking?')) return
    try {
      await nodeAPI.delete(`/api/admin/bookings/${id}`)
      setAllBookings((prev) => prev.filter((b) => b._id !== id))
      setToast({ message: 'Booking deleted successfully', type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to delete booking', type: 'error' })
    }
  }

  const handleAction = async (id, action) => {
    try {
      await nodeAPI.put(`/api/admin/vendors/${id}/${action}`)
      setPendingVendors((prev) => prev.filter((vendor) => vendor._id !== id))
      setToast({ message: `Vendor ${action}d successfully`, type: 'success' })
    } catch (error) {
      setToast({ message: `Failed to ${action} vendor`, type: 'error' })
    }
  }

  const openEditModal = (item, type) => {
    setEditingItem(item)
    setEditItemType(type)
    if (type === 'user') {
      setEditFormData({
        name: item.name || '',
        email: item.email || '',
        phone: item.phone || ''
      })
    } else if (type === 'vendor') {
      setEditFormData({
        ownerName: item.ownerName || '',
        email: item.email || '',
        businessName: item.businessName || '',
        status: item.status || 'pending'
      })
    } else if (type === 'booking') {
      setEditFormData({
        status: item.status || 'pending',
        amount: item.amount || 0,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : ''
      })
    }
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingItem(null)
    setEditItemType(null)
    setEditFormData({})
  }

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !editItemType) return
    try {
      setIsEditSaving(true)
      let endpoint = ''
      let updateData = editFormData

      if (editItemType === 'user') {
        endpoint = `/api/admin/users/${editingItem._id}`
      } else if (editItemType === 'vendor') {
        endpoint = `/api/admin/vendors/${editingItem._id}`
      } else if (editItemType === 'booking') {
        endpoint = `/api/admin/bookings/${editingItem._id}`
      }

      await nodeAPI.put(endpoint, updateData)

      // Update local state
      if (editItemType === 'user') {
        setAllUsers((prev) =>
          prev.map((u) => (u._id === editingItem._id ? { ...u, ...editFormData } : u))
        )
      } else if (editItemType === 'vendor') {
        setAllVendors((prev) =>
          prev.map((v) => (v._id === editingItem._id ? { ...v, ...editFormData } : v))
        )
      } else if (editItemType === 'booking') {
        setAllBookings((prev) =>
          prev.map((b) => (b._id === editingItem._id ? { ...b, ...editFormData } : b))
        )
      }

      setToast({ message: `${editItemType.charAt(0).toUpperCase() + editItemType.slice(1)} updated successfully`, type: 'success' })
      closeEditModal()
    } catch (error) {
      setToast({ message: `Failed to update ${editItemType}`, type: 'error' })
    } finally {
      setIsEditSaving(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <section className="section-container py-10">
        <h1 className="font-heading text-4xl">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div onClick={() => setActiveTab('users')} className="cursor-pointer">
                <StatsCard title="Total Users" value={stats.totalUsers || 0} icon={Users} iconClass="text-blue-500" />
              </div>
              <div onClick={() => setActiveTab('vendors')} className="cursor-pointer">
                <StatsCard title="Total Vendors" value={stats.totalVendors || 0} icon={Store} iconClass="text-primary" />
              </div>
              <div onClick={() => setActiveTab('bookings')} className="cursor-pointer">
                <StatsCard title="Total Bookings" value={stats.totalBookings || 0} icon={CalendarCheck} iconClass="text-accent" />
              </div>
              <div onClick={() => setActiveTab('vendors')} className="cursor-pointer">
                <StatsCard title="Approved Vendors" value={stats.approvedVendors || 0} icon={BadgeCheck} iconClass="text-success" />
              </div>
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
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="mt-8 overflow-x-auto rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">Users</h2>
            {loading ? (
              <div className="py-8 text-center text-textSecondary">Loading...</div>
            ) : allUsers.length === 0 ? (
              <div className="py-8 text-center text-textSecondary">No users found</div>
            ) : (
              <table className="mt-4 min-w-full text-left text-sm">
                <thead>
                  <tr className="text-textSecondary">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user._id} className="border-t border-border hover:bg-background transition-colors">
                      <td className="py-3">{user.groomName ? `${user.groomName} & ${user.brideName}` : user.email}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.phone || '-'}</td>
                      <td className="py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 flex gap-2">
                        <button
                          onClick={() => openEditModal(user, 'user')}
                          className="inline-flex items-center gap-2 rounded-lg bg-border px-3 py-1 text-sm font-medium text-textPrimary hover:bg-gray-200 transition-colors"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.groomName ? `${user.groomName} & ${user.brideName}` : user.email)}
                          className="inline-flex items-center gap-2 rounded-lg bg-error px-3 py-1 text-sm text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="mt-8 overflow-x-auto rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">Vendors</h2>
            {loading ? (
              <div className="py-8 text-center text-textSecondary">Loading...</div>
            ) : allVendors.length === 0 ? (
              <div className="py-8 text-center text-textSecondary">No vendors found</div>
            ) : (
              <table className="mt-4 min-w-full text-left text-sm">
                <thead>
                  <tr className="text-textSecondary">
                    <th className="pb-3">Business Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVendors.map((vendor) => (
                    <tr key={vendor._id} className="border-t border-border hover:bg-background transition-colors">
                      <td className="py-3 font-medium">{vendor.businessName || vendor.ownerName || vendor.email || '-'}</td>
                      <td className="py-3">{vendor.email}</td>
                      <td className="py-3">{vendor.category || '-'}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          vendor.status === 'approved' ? 'bg-success/20 text-success' :
                          vendor.status === 'pending' ? 'bg-warning/20 text-warning' :
                          'bg-error/20 text-error'
                        }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="py-3">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 flex gap-2">
                        <button
                          onClick={() => openEditModal(vendor, 'vendor')}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1 text-sm text-white hover:bg-opacity-90 transition-colors"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                            onClick={() => handleDeleteVendor(vendor._id, vendor.businessName || vendor.ownerName || vendor.email)}
                          className="inline-flex items-center gap-2 rounded-lg bg-error px-3 py-1 text-sm text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="mt-8 overflow-x-auto rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-heading text-2xl">Bookings</h2>
            {loading ? (
              <div className="py-8 text-center text-textSecondary">Loading...</div>
            ) : allBookings.length === 0 ? (
              <div className="py-8 text-center text-textSecondary">No bookings found</div>
            ) : (
              <table className="mt-4 min-w-full text-left text-sm">
                <thead>
                  <tr className="text-textSecondary">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Event Date</th>
                    <th className="pb-3">Budget</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((booking) => (
                    <tr key={booking._id} className="border-t border-border hover:bg-background transition-colors">
                      <td className="py-3">{booking.coupleId?.groomName ? `${booking.coupleId.groomName} & ${booking.coupleId.brideName}` : booking.coupleId?.email || 'Unknown'}</td>
                      <td className="py-3">{booking.vendorId?.businessName || booking.vendorId?.ownerName || 'Unknown'}</td>
                      <td className="py-3">{booking.date ? new Date(booking.date).toLocaleDateString() : '-'}</td>
                      <td className="py-3">${booking.amount || 0}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-success/20 text-success' :
                          booking.status === 'pending' ? 'bg-warning/20 text-warning' :
                          'bg-error/20 text-error'
                        }`}>
                          {booking.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3">{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 flex gap-2">
                        <button
                          onClick={() => openEditModal(booking, 'booking')}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1 text-sm text-white hover:bg-opacity-90 transition-colors"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-error px-3 py-1 text-sm text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-2xl">
                  Edit {editItemType.charAt(0).toUpperCase() + editItemType.slice(1)}
                </h2>
                <button onClick={closeEditModal} className="text-textSecondary hover:text-textPrimary">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {editItemType === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Name</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleEditFormChange('email', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Phone</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={(e) => handleEditFormChange('phone', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {editItemType === 'vendor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Owner Name</label>
                      <input
                        type="text"
                        value={editFormData.ownerName || ''}
                        onChange={(e) => handleEditFormChange('ownerName', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Business Name</label>
                      <input
                        type="text"
                        value={editFormData.businessName || ''}
                        onChange={(e) => handleEditFormChange('businessName', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleEditFormChange('email', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Status</label>
                      <select
                        value={editFormData.status || 'pending'}
                        onChange={(e) => handleEditFormChange('status', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </>
                )}

                {editItemType === 'booking' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Event Date</label>
                      <input
                        type="date"
                        value={editFormData.date || ''}
                        onChange={(e) => handleEditFormChange('date', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Amount</label>
                      <input
                        type="number"
                        value={editFormData.amount || 0}
                        onChange={(e) => handleEditFormChange('amount', parseFloat(e.target.value))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textPrimary mb-1">Status</label>
                      <select
                        value={editFormData.status || 'pending'}
                        onChange={(e) => handleEditFormChange('status', e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary focus:border-primary focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeEditModal}
                  className="flex-1 rounded-lg border border-border px-4 py-2 font-medium text-textPrimary hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditSaving}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                >
                  {isEditSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </section>
    </ProtectedRoute>
  )
}