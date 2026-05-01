'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSignup() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center animate-slide-up">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-display text-2xl font-bold mb-2">Check your inbox</h2>
        <p className="text-ink-300 text-sm font-body mb-6">We sent a confirmation email to <strong className="text-white">{email}</strong>. Click the link to activate your account.</p>
        <Link href="/auth/login" className="btn-secondary w-full block text-center">Back to login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="block text-center font-display font-bold text-2xl mb-8">
          price<span className="text-signal">tag</span>
        </Link>
        <div className="card">
          <h1 className="font-display text-2xl font-bold mb-1">Create account</h1>
          <p className="text-ink-300 text-sm font-body mb-8">Free forever. No credit card needed.</p>

          {error && (
            <div className="bg-signal/10 border border-signal/30 rounded-lg px-4 py-3 mb-6 text-signal text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input className="input" type="text" placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()} />
            </div>
            <button onClick={handleSignup} disabled={loading || !email || !password}
              className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-ink-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-signal hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
