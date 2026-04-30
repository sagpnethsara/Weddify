'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null

  const isError = type === 'error'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-soft ${
          isError ? 'border-error/30 bg-white text-error' : 'border-success/30 bg-white text-success'
        }`}
      >
        {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close toast">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
