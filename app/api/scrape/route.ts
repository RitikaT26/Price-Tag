import { NextRequest, NextResponse } from 'next/server'
import { scrapeProduct } from '@/lib/scraper'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const result = await scrapeProduct(url)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Scrape error:', err)
    return NextResponse.json({ error: err.message || 'Scrape failed' }, { status: 500 })
  }
}
