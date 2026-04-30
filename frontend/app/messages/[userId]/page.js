'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, BadgeCheck, MapPin, Tag } from 'lucide-react'
import { nodeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/common/ProtectedRoute'

const timeLabel = (date) => {
  const d = new Date(date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const shouldShowTime = (msgs, idx) => {
  if (idx === 0) return true
  const prev = new Date(msgs[idx - 1].createdAt)
  const curr = new Date(msgs[idx].createdAt)
  return curr - prev > 5 * 60 * 1000 // show timestamp if gap > 5 min
}

export default function ConversationPage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [other, setOther] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const isFirstLoad = useRef(true)

  const fetchMessages = useCallback(async (scroll = false) => {
    try {
      const { data } = await nodeAPI.get(`/api/messages/${userId}`)
      setMessages(data.messages || [])
      if (!other) setOther(data.other)
      if (scroll) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (_) {}
    if (isFirstLoad.current) {
      setLoading(false)
      isFirstLoad.current = false
    }
  }, [userId, other])

  useEffect(() => {
    fetchMessages(true)
    const id = setInterval(() => fetchMessages(false), 3000)
    return () => clearInterval(id)
  }, [userId])

  // Scroll to bottom on new messages
  const prevLen = useRef(0)
  useEffect(() => {
    if (messages.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      prevLen.current = messages.length
    }
  }, [messages.length])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      await nodeAPI.post(`/api/messages/${userId}`, { content: text })
      await fetchMessages(true)
    } catch (_) {
      setInput(text) // restore on error
    }
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <ProtectedRoute>
      <section className="section-container py-6">
        <div className="mx-auto flex max-w-2xl flex-col" style={{ height: 'calc(100vh - 9rem)' }}>

          {/* Header */}
          <div className="surface-card mb-3 flex items-center gap-3 p-4">
            <Link href="/messages" className="rounded-xl border border-border p-2 text-textSecondary hover:text-primary transition-colors">
              <ArrowLeft size={18} />
            </Link>

            {other ? (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                  {other.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-textPrimary truncate">{other.name}</span>
                    {other.verified && <BadgeCheck size={15} className="text-accent shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-textSecondary">
                    {other.category && <span className="flex items-center gap-1"><Tag size={10} />{other.category}</span>}
                    {other.location && <span className="flex items-center gap-1"><MapPin size={10} />{other.location}</span>}
                  </div>
                </div>
                {other.role === 'vendor' && (
                  <Link href={`/vendors/${userId}`} className="btn-secondary shrink-0 text-xs px-3 py-1.5">
                    View Profile
                  </Link>
                )}
              </>
            ) : (
              <div className="h-8 w-40 animate-pulse rounded-lg bg-border/40" />
            )}
          </div>

          {/* Messages area */}
          <div className="surface-card flex-1 overflow-y-auto p-4 space-y-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-textSecondary">Loading conversation…</div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-textSecondary">
                  No messages yet. Say hello to <strong>{other?.name}</strong>!
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = String(msg.senderId) === String(user?._id)
                const showTime = shouldShowTime(messages, i)

                return (
                  <div key={msg._id}>
                    {showTime && (
                      <div className="my-3 text-center text-[10px] text-textSecondary">
                        {timeLabel(msg.createdAt)}
                      </div>
                    )}
                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                      {!isMine && (
                        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {other?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? 'rounded-br-sm bg-primary text-white'
                            : 'rounded-bl-sm bg-white border border-border/60 text-textPrimary shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="surface-card mt-3 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Message ${other?.name || ''}…`}
                className="flex-1 resize-none rounded-xl border border-border/80 bg-white px-4 py-2.5 text-sm text-textPrimary placeholder-textSecondary outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                disabled={sending}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-textSecondary">Enter to send · Shift+Enter for new line</p>
          </div>

        </div>
      </section>
    </ProtectedRoute>
  )
}
