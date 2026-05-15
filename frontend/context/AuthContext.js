'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import { nodeAPI } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const role = user?.role || null
  const isAuthenticated = Boolean(user)

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('weddify_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        jwtDecode(token)
        const { data } = await nodeAPI.get('/api/auth/me')
        setUser(data.user)
      } catch {
        localStorage.removeItem('weddify_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = (token, authUser) => {
    localStorage.setItem('weddify_token', token)
    setUser(authUser)
  }

  const logout = async () => {
    try {
      await nodeAPI.post('/api/auth/logout')
    } catch {
      // Ignore network/logout endpoint issues and clear local state.
    } finally {
      localStorage.removeItem('weddify_token')
      setUser(null)
      router.push('/login')
    }
  }

  const value = useMemo(() => ({
    user,
    role,
    loading,
    isAuthenticated,
    login,
    logout
  }), [user, role, loading, isAuthenticated])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
