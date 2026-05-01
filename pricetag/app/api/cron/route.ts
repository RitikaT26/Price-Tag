import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct } from '@/lib/scraper'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPriceAlertEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all active products
  const { data: products } = await supabase
    .from('tracked_products')
    .select('*')
    .eq('is_active', true)

  if (!products?.length) return NextResponse.json({ message: 'No products to scrape' })

  let updated = 0
  let alertsSent = 0

  for (const product of products) {
    try {
      const scraped = await scrapeProduct(product.url)
      if (!scraped.price) continue

      // Update product price
      await supabase.from('tracked_products').update({
        current_price: scraped.price,
        last_scraped_at: new Date().toISOString(),
      }).eq('id', product.id)

      // Insert price history
      await supabase.from('price_history').insert({
        product_id: product.id,
        price: scraped.price,
      })

      updated++

      // Check untriggered alerts for this product
      const { data: alerts } = await supabase
        .from('price_alerts')
        .select('*, profiles(email)')
        .eq('product_id', product.id)
        .eq('is_triggered', false)
        .lte('target_price', scraped.price + 1) // within ₹1 of target

      for (const alert of (alerts || [])) {
        if (scraped.price <= alert.target_price) {
          // Send email
          const email = (alert.profiles as any)?.email
          if (email) {
            await sendPriceAlertEmail(email, product, alert, scraped.price)
            alertsSent++
          }
          // Mark as triggered
          await supabase.from('price_alerts').update({
            is_triggered: true,
            triggered_at: new Date().toISOString(),
          }).eq('id', alert.id)
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      console.error(`Failed to scrape ${product.url}:`, err)
    }
  }

  return NextResponse.json({ updated, alertsSent, total: products.length })
}
