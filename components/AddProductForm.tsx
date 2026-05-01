'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddProductForm() {
  const [url, setUrl] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [step, setStep] = useState<'url' | 'confirm'>('url')
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handlePreview() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreview(data)
      setStep('confirm')
    } catch (e: any) {
      setError(e.message || 'Could not fetch product')
    } finally {
      setLoading(false)
    }
  }

  async function handleTrack() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, target_price: targetPrice ? parseFloat(targetPrice) : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUrl('')
      setTargetPrice('')
      setPreview(null)
      setStep('url')
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Failed to track product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-signal/30 bg-signal/5">
      {step === 'url' ? (
        <div>
          <p className="label mb-3">Add product to watchlist</p>
          <div className="flex gap-3">
            <input
              className="input flex-1"
              type="url"
              placeholder="Paste Amazon or Flipkart product URL…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePreview()}
            />
            <button onClick={handlePreview} disabled={loading || !url.trim()}
              className="btn-primary px-6 shrink-0 disabled:opacity-50">
              {loading ? '…' : 'Track →'}
            </button>
          </div>
          {error && <p className="text-signal text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <div className="animate-slide-up">
          <p className="label mb-4">Confirm product</p>
          <div className="flex gap-4 mb-5">
            {preview?.image_url && (
              <img src={preview.image_url} alt="" className="w-16 h-16 object-cover rounded-lg bg-ink-700 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-body font-medium text-white text-sm leading-snug mb-1 line-clamp-2">
                {preview?.title || 'Unknown Product'}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-signal">
                  {preview?.price ? `₹${preview.price.toLocaleString()}` : 'Price not found'}
                </span>
                {preview?.original_price && preview.original_price > preview.price && (
                  <span className="text-ink-400 text-sm line-through font-mono">
                    ₹{preview.original_price.toLocaleString()}
                  </span>
                )}
                <span className="tag">{preview?.site_name}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="label">Alert me when price drops to (optional)</label>
              <input
                className="input"
                type="number"
                placeholder={preview?.price ? `e.g. ₹${Math.round(preview.price * 0.8).toLocaleString()}` : 'Target price'}
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
              />
            </div>
            <button onClick={handleTrack} disabled={loading}
              className="btn-primary px-6 py-3 shrink-0 disabled:opacity-50">
              {loading ? '…' : 'Start tracking'}
            </button>
            <button onClick={() => { setStep('url'); setPreview(null); setError('') }}
              className="btn-secondary px-4 py-3 shrink-0">
              Cancel
            </button>
          </div>
          {error && <p className="text-signal text-sm mt-2">{error}</p>}
        </div>
      )}
    </div>
  )
}
