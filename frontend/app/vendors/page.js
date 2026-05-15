'use client'

import { useEffect, useRef, useState } from 'react'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import VendorFilters from '@/components/vendors/VendorFilters'
import VendorGrid from '@/components/vendors/VendorGrid'
import { nodeAPI } from '@/lib/api'

const initialFilters = {
  category: '',
  location: '',
  priceTier: '',
  minPrice: '',
  maxPrice: '',
  rating: ''
}

export default function VendorsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const requestIdRef = useRef(0)

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const category = query.get('category')
    if (category) {
      setFilters((prev) => ({ ...prev, category }))
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [filters])

  useEffect(() => {
    const controller = new AbortController()

    const fetchVendors = async () => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      const hadVendorsBeforeRequest = vendors.length > 0

      if (!hadVendorsBeforeRequest) setLoading(true)
      setError('')

      try {
        const query = {
          ...Object.fromEntries(Object.entries(debouncedFilters).filter(([, value]) => value !== '')),
          page: 1,
          limit: 24
        }

        const { data } = await nodeAPI.get('/api/vendors', {
          params: query,
          signal: controller.signal
        })

        if (requestId !== requestIdRef.current) return
        setVendors(data.vendors || [])
        setLoading(false)
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        if (requestId !== requestIdRef.current) return
        setError(err.response?.data?.message || 'Unexpected error while loading vendors')
        setLoading(false)
      } finally {
        if (requestId === requestIdRef.current && !hadVendorsBeforeRequest) {
          setLoading(false)
        }
      }
    }

    fetchVendors()

    return () => {
      controller.abort()
    }
  }, [debouncedFilters])

  const handleChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  return (
    <ProtectedRoute allowedRoles={['couple']}>
      <section className="section-container py-10">
        <div className="mb-8 rounded-3xl bg-champagne-gradient p-7 shadow-soft sm:p-8">
          <p className="chip">Vendor Discovery</p>
          <h1 className="mt-4 page-title">Find Your Perfect Vendors</h1>
          <p className="mt-2 text-textSecondary">Filter vendors by category, district and budget, then let AI rank the best matches.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <VendorFilters filters={filters} onChange={handleChange} onReset={() => setFilters(initialFilters)} />
          <VendorGrid vendors={vendors} loading={loading} error={error} />
        </div>
      </section>
    </ProtectedRoute>
  )
}
