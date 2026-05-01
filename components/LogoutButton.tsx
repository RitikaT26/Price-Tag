'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button onClick={logout}
      className="w-full text-left text-xs text-ink-400 hover:text-signal transition-colors font-mono py-1">
      Sign out
    </button>
  )
}
