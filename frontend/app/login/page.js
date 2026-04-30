'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Gem, Heart, Store, Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { nodeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import Toast from '@/components/common/Toast'

const roleTabs = [
  { key: 'couple', label: 'Couple', icon: Heart },
  { key: 'vendor', label: 'Vendor', icon: Store },
  { key: 'admin', label: 'Admin', icon: Shield }
]

const redirectByRole = {
  couple: '/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin'
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('couple')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const router = useRouter()
  const { login, isAuthenticated, role } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectByRole[role] || '/dashboard')
    }
  }, [isAuthenticated, role, router])

  const onSubmit = async (values) => {
    setError('')
    try {
      const { data } = await nodeAPI.post('/api/auth/login', {
        email: values.email,
        password: values.password
      })

      if (data.user.role !== selectedRole) {
        setError(`This account is registered as ${data.user.role}. Please select the correct role.`)
        return
      }

      login(data.token, data.user)
      setToast('Login successful')
      router.push(redirectByRole[data.user.role] || '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <section className="section-container grid min-h-[calc(100vh-8rem)] items-stretch gap-8 py-10 lg:grid-cols-2">
      <div className="hidden rounded-3xl bg-rose-gradient p-10 text-white shadow-panel lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="chip border-white/30 bg-white/15 text-white">Account Access</p>
          <h1 className="mt-4 font-heading text-5xl leading-tight">Love is in the details. Let Weddify guide every one.</h1>
          <p className="mt-4 text-white/90">Discover trusted Sri Lankan wedding vendors with confidence.</p>
        </div>
        <p className="text-sm text-white/80">AI recommendations based on real vendor performance.</p>
      </div>

      <div className="surface-card rounded-3xl p-7 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Gem size={24} />
          </div>
          <div>
            <h2 className="font-heading text-3xl text-primary">Weddify</h2>
            <p className="text-sm text-textSecondary">Welcome Back</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-background p-2">
          {roleTabs.map((tab) => {
            const Icon = tab.icon
            const active = selectedRole === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedRole(tab.key)}
                className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold ${
                  active ? 'bg-primary text-white shadow-sm' : 'text-textSecondary'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <div className="input-shell">
              <Mail className="text-textSecondary" size={17} />
              <input
                className="input-base"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' }
                })}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="input-shell">
              <Lock className="text-textSecondary" size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-base"
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-textSecondary">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-textSecondary">
              <input type="checkbox" className="accent-primary" {...register('remember')} /> Remember me
            </label>
            <Link href="/contact" className="font-medium text-primary">Forgot password?</Link>
          </div>

          {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <button
            disabled={isSubmitting}
            className="btn-primary w-full gap-2 py-3 text-sm font-bold disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />} Login
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-textSecondary">
          <div className="h-px flex-1 bg-border" />
          <span>or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-textSecondary">
          Don't have an account? <Link href="/register" className="font-semibold text-primary">Register</Link>
        </p>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </section>
  )
}
