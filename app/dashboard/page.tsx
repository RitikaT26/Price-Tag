import { createClient } from '@/lib/supabase/server'
import AddProductForm from '@/components/AddProductForm'
import ProductCard from '@/components/ProductCard'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('tracked_products')
    .select(`
      *,
      price_history (price, scraped_at),
      price_alerts (id, target_price, is_triggered)
    `)
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const totalSaved = products?.reduce((acc, p) => {
    if (p.original_price && p.current_price) return acc + (p.original_price - p.current_price)
    return acc
  }, 0) || 0

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Watchlist</h1>
          <p className="text-ink-300 text-sm font-body">Track prices and never miss a deal</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-ink-400 font-mono uppercase tracking-widest">Tracking</p>
            <p className="font-display text-2xl font-bold">{products?.length || 0}</p>
          </div>
          {totalSaved > 0 && (
            <div className="text-right">
              <p className="text-xs text-ink-400 font-mono uppercase tracking-widest">Saved</p>
              <p className="font-display text-2xl font-bold text-lime">₹{totalSaved.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add product form */}
      <AddProductForm />

      {/* Products grid */}
      {products && products.length > 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <div className="text-6xl mb-4">🏷️</div>
          <h2 className="font-display text-xl font-bold mb-2">No products yet</h2>
          <p className="text-ink-400 text-sm font-body">Paste an Amazon or Flipkart URL above to start tracking</p>
        </div>
      )}
    </div>
  )
}
