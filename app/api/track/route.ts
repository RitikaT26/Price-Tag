import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct } from '@/lib/scraper'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, target_price } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // Scrape product
  const scraped = await scrapeProduct(url)

  // Upsert product
  const { data: product, error: productError } = await supabase
    .from('tracked_products')
    .upsert({
      user_id: user.id,
      url,
      title: scraped.title,
      image_url: scraped.image_url,
      site_name: scraped.site_name,
      current_price: scraped.price,
      original_price: scraped.original_price,
      currency: scraped.currency,
      last_scraped_at: new Date().toISOString(),
      is_active: true,
    }, { onConflict: 'user_id,url' })
    .select()
    .single()

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })

  // Save first price history entry
  if (scraped.price) {
    await supabase.from('price_history').insert({
      product_id: product.id,
      price: scraped.price,
    })
  }

  // Save price alert if target set
  if (target_price && target_price > 0) {
    await supabase.from('price_alerts').insert({
      product_id: product.id,
      user_id: user.id,
      target_price,
    })
  }

  return NextResponse.json({ product, scraped })
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await request.json()
  await supabase.from('tracked_products')
    .update({ is_active: false })
    .eq('id', product_id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
