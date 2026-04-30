'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Server, Brain } from 'lucide-react'
import axios from 'axios'

const nodeURL = process.env.NEXT_PUBLIC_NODE_API_URL || 'http://localhost:8000'
const mlURL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000'

const initialState = {
  node: { loading: true, ok: false, message: 'Checking Node API...' },
  ml: { loading: true, ok: false, message: 'Checking Python ML API...' }
}

export default function SystemStatus() {
  const [status, setStatus] = useState(initialState)

  useEffect(() => {
    let cancelled = false

    const checkNode = async () => {
      try {
        await axios.get(`${nodeURL}/`, { timeout: 3500 })
        if (!cancelled) {
          setStatus((prev) => ({
            ...prev,
            node: { loading: false, ok: true, message: 'Connected to Node backend' }
          }))
        }
      } catch {
        if (!cancelled) {
          setStatus((prev) => ({
            ...prev,
            node: { loading: false, ok: false, message: 'Node backend is unreachable' }
          }))
        }
      }
    }

    const checkML = async () => {
      try {
        await axios.get(`${mlURL}/`, { timeout: 3500 })
        if (!cancelled) {
          setStatus((prev) => ({
            ...prev,
            ml: { loading: false, ok: true, message: 'Connected to Python ML backend' }
          }))
        }
      } catch {
        if (!cancelled) {
          setStatus((prev) => ({
            ...prev,
            ml: { loading: false, ok: false, message: 'Python ML backend is unreachable' }
          }))
        }
      }
    }

    checkNode()
    checkML()

    return () => {
      cancelled = true
    }
  }, [])

  const renderCard = (title, item, Icon) => (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-primary" size={18} />
          <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
        </div>
        {item.loading ? (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-textSecondary">Checking...</span>
        ) : item.ok ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
            <CheckCircle2 size={13} /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-error/15 px-2 py-1 text-xs font-semibold text-error">
            <AlertTriangle size={13} /> Offline
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-textSecondary">{item.message}</p>
    </article>
  )

  return (
    <section className="section-container py-8">
      <div className="rounded-3xl bg-background/70 p-5">
        <h2 className="font-heading text-2xl text-textPrimary">Live Platform Connection Status</h2>
        <p className="mt-1 text-sm text-textSecondary">Frontend connectivity to both services in real time.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {renderCard('Node.js API', status.node, Server)}
          {renderCard('Python ML API', status.ml, Brain)}
        </div>
      </div>
    </section>
  )
}
