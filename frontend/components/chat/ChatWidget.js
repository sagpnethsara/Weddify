'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle, X, Send, Bot, User, MapPin, Star, ChevronDown, Sparkles } from 'lucide-react'
import { nodeAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! Welcome to Weddify 💍 I search our real vendor database to suggest the best matches for your wedding.\n\nTry asking me things like:\n• \"Find photographers in Colombo\"\n• \"Budget caterers in Kandy\"\n• \"Top-rated venues in Galle\""
}

const SUGGESTED_PROMPTS = [
  'Photographers in Colombo',
  'Budget catering in Kandy',
  'Premium venues in Galle',
  'Decorators in Colombo',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Bot size={14} />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm border border-border/60">
        <div className="flex gap-1 items-center h-4">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function VendorChip({ vendor }) {
  const name = vendor.businessName || vendor.vendor_name || 'Vendor'
  const cat = vendor.category || vendor.Category || ''
  const loc = vendor.location || vendor.Location || ''
  const rating = vendor.rating || vendor['Rating (out of 5)']
  const price = vendor.price || vendor['Price (LKR)']
  const id = vendor._id || vendor.id || ''

  return (
    <Link
      href={`/vendors/${id}`}
      className="flex flex-col gap-1 rounded-xl border border-border/70 bg-white p-3 text-xs hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <span className="font-semibold text-textPrimary truncate">{name}</span>
      <span className="text-primary/80">{cat}</span>
      <div className="flex items-center justify-between text-textSecondary">
        {loc && (
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {loc}
          </span>
        )}
        {rating && (
          <span className="flex items-center gap-1">
            <Star size={10} className="text-amber-400" />
            {rating}
          </span>
        )}
      </div>
      {price && (
        <span className="font-semibold text-textPrimary">{formatPrice(price)}</span>
      )}
    </Link>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  // Simple markdown bold (**text**) renderer
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    )
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${isUser ? 'bg-primary text-white' : 'bg-primary/15 text-primary'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? 'rounded-br-sm bg-primary text-white shadow-sm'
              : 'rounded-bl-sm bg-white text-textPrimary shadow-sm border border-border/60'
          }`}
        >
          {renderContent(msg.content)}
        </div>

        {/* Inline vendor chips */}
        {!isUser && msg.vendors?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 w-full">
            {msg.vendors.map((v, i) => (
              <VendorChip key={v._id || v.id || i} vendor={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (open) {
      setUnread(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data } = await nodeAPI.post('/api/chat', {
        messages: newMessages.map(({ role, content }) => ({ role, content }))
      })

      const assistantMsg = {
        role: 'assistant',
        content: data.message,
        vendors: data.vendors || []
      }
      setMessages((prev) => [...prev, assistantMsg])
      if (!open) setUnread(true)
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an issue. Please try again in a moment.',
          vendors: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, open])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggest = (prompt) => {
    sendMessage(prompt)
  }

  const showSuggestions = messages.length === 1 // only show after welcome

  return (
    <>
      {/* Chat panel */}
      <div
        ref={panelRef}
        className={`fixed bottom-24 right-5 z-50 flex w-[360px] max-w-[calc(100vw-2.5rem)] flex-col rounded-3xl border border-border/70 bg-background shadow-2xl transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-3xl bg-primary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Weddify Assistant</p>
              <p className="text-xs text-white/70">Smart vendor search · real data</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl p-1.5 text-white/70 hover:bg-white/15 hover:text-white transition-colors"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}

          {/* Suggested prompts */}
          {showSuggestions && !loading && (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-xs text-textSecondary text-center">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggest(prompt)}
                    className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-white px-4 py-2.5 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about vendors, prices, locations…"
              className="flex-1 bg-transparent text-sm text-textPrimary placeholder-textSecondary outline-none"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-textSecondary">
            Powered by your vendor database · 13,000+ vendors
          </p>
        </div>
      </div>

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
        aria-label="Open chat assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {unread && !open && (
          <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-accent text-[9px] font-bold text-white flex items-center justify-center">
            1
          </span>
        )}
      </button>
    </>
  )
}
