'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="block text-center font-display font-bold text-2xl mb-8">
          price<span className="text-signal">tag</span>
        </Link>
        <div className="card">
          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-ink-300 text-sm font-body mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-signal/10 border border-signal/30 rounded-lg px-4 py-3 mb-6 text-signal text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-ink-400">
            No account?{' '}
            <Link href="/auth/signup" className="text-signal hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
