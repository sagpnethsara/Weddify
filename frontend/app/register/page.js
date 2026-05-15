'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Gem, Heart, Store, User, Mail, Lock, Phone, Calendar, MapPin, Tag, Award,
  FileText, Building2, Loader2, Eye, EyeOff, CheckCircle2
} from 'lucide-react'
import { nodeAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { categories, districts } from '@/lib/utils'
import Toast from '@/components/common/Toast'

function getStrength(password) {
  if (!password) return { label: 'Weak', score: 10 }
  const score = Math.min(100,
    (password.length >= 8 ? 25 : 0) +
    (/[A-Z]/.test(password) ? 20 : 0) +
    (/[a-z]/.test(password) ? 20 : 0) +
    (/\d/.test(password) ? 20 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 15 : 0)
  )
  if (score > 75) return { label: 'Strong', score }
  if (score > 50) return { label: 'Good', score }
  return { label: 'Weak', score }
}

export default function RegisterPage() {
  const [tab, setTab] = useState('couple')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  const password = watch('password') || ''
  const passwordStrength = useMemo(() => getStrength(password), [password])

  const onSubmit = async (values) => {
    setError('')
    try {
      if (tab === 'couple') {
        const { data } = await nodeAPI.post('/api/auth/register/couple', {
          groomName: values.groomName,
          brideName: values.brideName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          weddingDate: values.weddingDate,
          location: values.location
        })
        login(data.token, data.user)
        setToast('Couple account created successfully')
        router.push('/dashboard')
      } else {
        const { data } = await nodeAPI.post('/api/auth/register/vendor', {
          businessName: values.businessName,
          ownerName: values.ownerName,
          email: values.email,
          password: values.password,
          phone: values.phone,
          category: values.category,
          location: values.location,
          experience: Number(values.experience),
          description: values.description
        })
        login(data.token, data.user)
        setToast('Vendor account created successfully')
        router.push('/vendor/dashboard')
      }
      reset()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account')
    }
  }

  const wrap = 'input-shell'
  const inp = 'input-base'

  return (
    <section className="section-container grid min-h-[calc(100vh-8rem)] items-stretch gap-8 py-10 lg:grid-cols-2">
      <div className="hidden rounded-3xl bg-green-gradient p-10 text-white shadow-panel lg:flex lg:flex-col lg:justify-between relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 z-10 bg-black/30" />
        
        <div className="relative z-20">
          <p className="chip border-white/35 bg-white/15 text-white backdrop-blur-md">Join Weddify</p>
          <h1 className="mt-4 font-heading text-5xl leading-tight">Start your planning journey with confidence.</h1>
          <p className="mt-4 text-white/90">Create your account and start planning your perfect Sri Lankan wedding.</p>
        </div>
        <ul className="relative z-20 space-y-3 text-white/90">
          <li className="flex items-center gap-2"><CheckCircle2 size={18} /> AI-powered recommendations for local vendors</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={18} /> 25 Sri Lankan districts covered</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={18} /> Real-time booking and planning dashboard</li>
        </ul>
      </div>

      <div className="surface-card rounded-3xl p-7 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Gem size={24} />
          </div>
          <div>
            <h2 className="font-heading text-3xl text-primary">Weddify</h2>
            <p className="text-sm text-textSecondary">Create Your Account</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-background p-2">
          <button
            onClick={() => setTab('couple')}
            className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold ${tab === 'couple' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary'}`}
          >
            <Heart size={16} /> Couple
          </button>
          <button
            onClick={() => setTab('vendor')}
            className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold ${tab === 'vendor' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary'}`}
          >
            <Store size={16} /> Vendor
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {tab === 'couple' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Groom's Name</label>
                  <div className={wrap}>
                    <User className="text-textSecondary" size={17} />
                    <input className={inp} placeholder="Full name" {...register('groomName', { required: 'Groom name is required' })} />
                  </div>
                  {errors.groomName && <p className="mt-1 text-xs text-error">{errors.groomName.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Bride's Name</label>
                  <div className={wrap}>
                    <User className="text-textSecondary" size={17} />
                    <input className={inp} placeholder="Full name" {...register('brideName', { required: 'Bride name is required' })} />
                  </div>
                  {errors.brideName && <p className="mt-1 text-xs text-error">{errors.brideName.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <div className={wrap}>
                  <Mail className="text-textSecondary" size={17} />
                  <input className={inp} placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <div className={wrap}>
                  <Lock className="text-textSecondary" size={17} />
                  <input type={showPassword ? 'text' : 'password'} className={inp} placeholder="Min. 8 characters" {...register('password', { required: 'Password is required', minLength: 8 })} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-textSecondary">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${passwordStrength.score}%` }} /></div>
                <p className="mt-1 text-xs text-textSecondary">Strength: {passwordStrength.label}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Confirm Password</label>
                <div className={wrap}>
                  <Lock className="text-textSecondary" size={17} />
                  <input type={showConfirmPassword ? 'text' : 'password'} className={inp} placeholder="Repeat password" {...register('confirmPassword', {
                    required: 'Confirm your password',
                    validate: (v) => v === watch('password') || 'Passwords do not match'
                  })} />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-textSecondary">{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Phone Number</label>
                <div className={wrap}>
                  <Phone className="text-textSecondary" size={17} />
                  <input className={inp} placeholder="0XXXXXXXXX" {...register('phone', { required: 'Phone number required', pattern: { value: /^0\d{9}$/, message: 'Use Sri Lankan format 0XXXXXXXXX' } })} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Wedding Date</label>
                  <div className={wrap}>
                    <Calendar className="text-textSecondary" size={17} />
                    <input type="date" className={inp} {...register('weddingDate', { required: true })} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">District</label>
                  <div className={wrap}>
                    <MapPin className="text-textSecondary" size={17} />
                    <select className={inp} {...register('location', { required: true })}>
                      <option value="">Select district</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Business Name</label>
                <div className={wrap}>
                  <Building2 className="text-textSecondary" size={17} />
                  <input className={inp} placeholder="Your business name" {...register('businessName', { required: true })} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Owner Full Name</label>
                <div className={wrap}>
                  <User className="text-textSecondary" size={17} />
                  <input className={inp} placeholder="Your full name" {...register('ownerName', { required: true })} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <div className={wrap}>
                  <Mail className="text-textSecondary" size={17} />
                  <input className={inp} placeholder="you@example.com" {...register('email', { required: true })} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <div className={wrap}>
                  <Lock className="text-textSecondary" size={17} />
                  <input type={showPassword ? 'text' : 'password'} className={inp} placeholder="Min. 8 characters" {...register('password', { required: true, minLength: 8 })} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-textSecondary">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-background"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${passwordStrength.score}%` }} /></div>
                <p className="mt-1 text-xs text-textSecondary">Strength: {passwordStrength.label}</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Confirm Password</label>
                <div className={wrap}>
                  <Lock className="text-textSecondary" size={17} />
                  <input type={showConfirmPassword ? 'text' : 'password'} className={inp} placeholder="Repeat password" {...register('confirmPassword', {
                    required: true,
                    validate: (v) => v === watch('password') || 'Passwords do not match'
                  })} />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-textSecondary">{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Phone Number</label>
                <div className={wrap}>
                  <Phone className="text-textSecondary" size={17} />
                  <input className={inp} placeholder="0XXXXXXXXX" {...register('phone', { required: true, pattern: /^0\d{9}$/ })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Service Category</label>
                  <div className={wrap}>
                    <Tag className="text-textSecondary" size={17} />
                    <select className={inp} {...register('category', { required: true })}>
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">District</label>
                  <div className={wrap}>
                    <MapPin className="text-textSecondary" size={17} />
                    <select className={inp} {...register('location', { required: true })}>
                      <option value="">Select district</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Years of Experience</label>
                <div className={wrap}>
                  <Award className="text-textSecondary" size={17} />
                  <input type="number" className={inp} placeholder="e.g. 5" {...register('experience', { required: true, min: 0 })} />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Business Description</label>
                <div className="input-shell px-3 py-2">
                  <div className="flex gap-2">
                    <FileText className="mt-0.5 shrink-0 text-textSecondary" size={17} />
                    <textarea rows={3} className="w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary/70" placeholder="Describe your services..." {...register('description', { required: true })} />
                  </div>
                </div>
              </div>

              <p className="rounded-xl bg-warning/15 px-4 py-3 text-sm text-warning">
                Your account will be reviewed by admin within 24 hours before activation.
              </p>
            </>
          )}

          <label className="flex items-start gap-2 text-sm text-textSecondary">
            <input type="checkbox" className="mt-1 accent-primary" {...register('terms', { required: 'Please accept terms and conditions' })} />
            I agree to the terms and conditions and privacy policy.
          </label>

          {Object.values(errors).length > 0 && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">Please review the highlighted fields and try again.</p>
          )}
          {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <button disabled={isSubmitting} className="btn-primary w-full gap-2 py-3 text-sm font-bold disabled:opacity-70">
            {isSubmitting && <Loader2 className="animate-spin" size={16} />} Register
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-textSecondary">
          <div className="h-px flex-1 bg-border" />
          <span>or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-textSecondary">
          Already have an account? <Link href="/login" className="font-semibold text-primary">Login</Link>
        </p>
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </section>
  )
}
