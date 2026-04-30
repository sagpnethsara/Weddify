'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, BadgeCheck, Clock } from 'lucide-react'
import { nodeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/common/ProtectedRoute'

const roleColor = { vendor: 'bg-accent/15 text-accent', couple: 'bg-primary/15 text-primary', admin: 'bg-border text-textSecondary' }

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(date).toLocaleDateString()
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await nodeAPI.get('/api/messages')
      setConversations(data.conversations || [])
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <ProtectedRoute>
      <section className="section-container py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle size={22} />
            </div>
            <div>
              <h1 className="font-heading text-3xl">Messages</h1>
              <p className="text-sm text-textSecondary">Your conversations with {user?.role === 'vendor' ? 'couples' : 'vendors'}</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="surface-card h-20 animate-pulse bg-border/30" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="surface-card flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle size={32} />
              </div>
              <div>
                <p className="font-semibold text-textPrimary">No conversations yet</p>
                <p className="mt-1 text-sm text-textSecondary">
                  {user?.role === 'couple'
                    ? 'Browse vendors and click "Message this vendor" to start a conversation.'
                    : 'Couples will be able to message you from your vendor profile.'}
                </p>
              </div>
              {user?.role === 'couple' && (
                <Link href="/vendors" className="btn-primary mt-2">Browse Vendors</Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link
                  key={conv.partnerId}
                  href={`/messages/${conv.partnerId}`}
                  className={`surface-card flex items-center gap-4 p-4 transition hover:border-primary/40 hover:-translate-y-0.5 ${conv.unreadCount > 0 ? 'border-primary/30 bg-primary/5' : ''}`}
                >
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                    {conv.partnerName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-textPrimary truncate">{conv.partnerName}</span>
                      {conv.partnerVerified && <BadgeCheck size={14} className="text-accent shrink-0" />}
                      <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${roleColor[conv.partnerRole] || ''}`}>
                        {conv.partnerRole}
                      </span>
                    </div>
                    {conv.partnerCategory && (
                      <p className="text-xs text-primary/80">{conv.partnerCategory}{conv.partnerLocation ? ` · ${conv.partnerLocation}` : ''}</p>
                    )}
                    <p className={`mt-1 truncate text-sm ${conv.unreadCount > 0 ? 'font-semibold text-textPrimary' : 'text-textSecondary'}`}>
                      {conv.lastMessageMine ? 'You: ' : ''}{conv.lastMessage}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="flex items-center gap-1 text-xs text-textSecondary">
                      <Clock size={11} />
                      {timeAgo(conv.lastMessageAt)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  )
}
