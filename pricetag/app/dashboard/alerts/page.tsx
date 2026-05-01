import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'

export default async function AlertsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: alerts } = await supabase
    .from('price_alerts')
    .select(`
      *,
      tracked_products (title, current_price, url, image_url)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const active = alerts?.filter(a => !a.is_triggered) || []
  const triggered = alerts?.filter(a => a.is_triggered) || []

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Price Alerts</h1>
        <p className="text-ink-300 text-sm font-body">
          {active.length} active · {triggered.length} triggered
        </p>
      </div>

      {/* Active alerts */}
      {active.length > 0 && (
        <section className="mb-10">
          <p className="label mb-4">Active</p>
          <div className="space-y-3">
            {active.map(alert => (
              <div key={alert.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 bg-ink-700 rounded-lg overflow-hidden shrink-0">
                  {alert.tracked_products?.image_url ? (
                    <img src={alert.tracked_products.image_url} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-white truncate">
                    {alert.tracked_products?.title || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Set {formatDistanceToNow(new Date(alert.created_at))} ago
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ink-400 font-mono uppercase">Target</p>
                  <p className="font-display font-bold text-lime">₹{alert.target_price.toLocaleString()}</p>
                  {alert.tracked_products?.current_price && (
                    <p className="text-xs text-ink-400 font-mono">
                      Now ₹{alert.tracked_products.current_price.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 bg-lime rounded-full animate-pulse-dot" />
                  <span className="text-xs font-mono text-lime">Watching</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Triggered alerts */}
      {triggered.length > 0 && (
        <section>
          <p className="label mb-4">Triggered</p>
          <div className="space-y-3">
            {triggered.map(alert => (
              <div key={alert.id} className="card flex items-center gap-4 opacity-60">
                <div className="w-10 h-10 bg-ink-700 rounded-lg shrink-0 flex items-center justify-center text-xl">✅</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-white truncate">
                    {alert.tracked_products?.title || 'Unknown Product'}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    Triggered {alert.triggered_at ? formatDistanceToNow(new Date(alert.triggered_at)) + ' ago' : '—'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-ink-200">₹{alert.target_price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {alerts?.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="font-display text-xl font-bold mb-2">No alerts yet</h2>
          <p className="text-ink-400 text-sm">Add a product to your watchlist and set a target price</p>
        </div>
      )}
    </div>
  )
}
