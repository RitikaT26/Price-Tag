import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-ink-900 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-ink-700 flex flex-col bg-ink-800/40">
        <div className="px-6 py-5 border-b border-ink-700">
          <Link href="/" className="font-display font-bold text-lg">
            price<span className="text-signal">tag</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/dashboard', icon: '▦', label: 'Watchlist' },
            { href: '/dashboard/alerts', icon: '🔔', label: 'Alerts' },
            { href: '/dashboard/history', icon: '📈', label: 'Price History' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-200 hover:text-white hover:bg-ink-700 transition-colors text-sm font-body">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-ink-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-signal rounded-full flex items-center justify-center text-xs font-bold text-white">
              {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-ink-400 truncate">{profile?.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
