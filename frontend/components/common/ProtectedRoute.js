'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const dashboardByRole = {
  couple: '/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin'
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.push(dashboardByRole[role] || '/login')
      return
    }

    if (pathname === '/login' || pathname === '/register') {
      router.push(dashboardByRole[role] || '/dashboard')
    }
  }, [isAuthenticated, role, loading, router, allowedRoles, pathname])

  if (loading) {
    return (
      <div className="section-container py-24">
        <div className="h-48 animate-pulse rounded-2xl border border-border/70 bg-white/80 shadow-soft" />
      </div>
    )
  }

  if (!isAuthenticated || (allowedRoles.length > 0 && !allowedRoles.includes(role))) {
    return null
  }

  return children
}
