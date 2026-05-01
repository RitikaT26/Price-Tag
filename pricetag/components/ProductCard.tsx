'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrackedProduct } from '@/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function ProductCard({ product }: { product: TrackedProduct }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const history = product.price_history || []
  const chartData = history
    .slice(-14)
    .sort((a, b) => new Date(a.scraped_at).getTime() - new Date(b.scraped_at).getTime())
    .map(h => ({
      date: format(new Date(h.scraped_at), 'MMM d'),
      price: h.price,
    }))

  const lowestPrice = history.length ? Math.min(...history.map(h => h.price)) : null
  const hasAlert = product.price_alerts && product.price_alerts.length > 0
  const activeAlert = product.price_alerts?.find(a => !a.is_triggered)

  const priceDrop = product.original_price && product.current_price
    ? Math.round(((product.original_price - product.current_price) / product.original_price) * 100)
    : null

  async function handleDelete() {
    setDeleting(true)
    await fetch('/api/track', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
    })
    router.refresh()
  }

  return (
    <div className="card group flex flex-col gap-0 p-0 overflow-hidden hover:border-ink-500 transition-colors">
      {/* Product image + basic info */}
      <div className="p-4 flex gap-3">
        <div className="w-14 h-14 bg-ink-700 rounded-lg overflow-hidden shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-body font-medium text-white leading-snug line-clamp-2">
              {product.title || 'Unknown Product'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-display text-lg font-bold text-signal">
              {product.current_price ? `₹${product.current_price.toLocaleString()}` : '—'}
            </span>
            {product.original_price && product.original_price > (product.current_price || 0) && (
              <span className="text-ink-400 text-xs line-through font-mono">
                ₹{product.original_price.toLocaleString()}
              </span>
            )}
            {priceDrop && priceDrop > 0 && (
              <span className="price-badge">↓{priceDrop}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Tags row */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className="tag">{product.site_name || 'Unknown'}</span>
        {activeAlert && (
          <span className="tag text-lime border-lime/30">
            🔔 Alert ₹{activeAlert.target_price.toLocaleString()}
          </span>
        )}
        {lowestPrice && (
          <span className="tag">
            Low ₹{lowestPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Chart (expanded) */}
      {expanded && chartData.length > 1 && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7A7A9A' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7A7A9A' }} tickLine={false} axisLine={false} width={50}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1A1A2E', border: '1px solid #3A3A5C', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Price']}
                />
                <Line type="monotone" dataKey="price" stroke="#FF3D2E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-ink-700 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setExpanded(e => !e)}
            className="text-xs text-ink-400 hover:text-white transition-colors font-mono">
            {expanded ? '▲ Hide chart' : '▼ Price chart'}
          </button>
          <a href={product.url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-ink-400 hover:text-signal transition-colors font-mono">
            View →
          </a>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="text-xs text-ink-600 hover:text-signal transition-colors font-mono disabled:opacity-50">
          {deleting ? '…' : 'Remove'}
        </button>
      </div>
    </div>
  )
}
