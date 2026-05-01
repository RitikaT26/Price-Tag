import * as cheerio from 'cheerio'
import { ScrapeResult } from '@/types'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xhtml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
}

function cleanPrice(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function detectSite(url: string): string {
  if (url.includes('amazon.in') || url.includes('amazon.com')) return 'Amazon'
  if (url.includes('flipkart.com')) return 'Flipkart'
  if (url.includes('myntra.com')) return 'Myntra'
  if (url.includes('meesho.com')) return 'Meesho'
  return 'Unknown'
}

async function scrapeAmazon($: cheerio.CheerioAPI): Promise<Partial<ScrapeResult>> {
  const title = $('#productTitle').text().trim() ||
    $('h1.a-size-large').text().trim() || null

  const priceWhole = $('.a-price-whole').first().text().trim()
  const priceFraction = $('.a-price-fraction').first().text().trim()
  const priceRaw = priceWhole ? `${priceWhole}${priceFraction}` : null
  const price = priceRaw ? cleanPrice(priceRaw) : null

  const originalRaw = $('.a-text-price .a-offscreen').first().text().trim()
  const original_price = originalRaw ? cleanPrice(originalRaw) : null

  const image_url = $('#landingImage').attr('src') ||
    $('#imgBlkFront').attr('src') || null

  return { title, price, image_url, original_price, currency: 'INR' }
}

async function scrapeFlipkart($: cheerio.CheerioAPI): Promise<Partial<ScrapeResult>> {
  const title = $('span.B_NuCI').text().trim() ||
    $('h1._6EBuvT').text().trim() ||
    $('h1').first().text().trim() || null

  const priceRaw = $('div._30jeq3._16Jk6d').text().trim() ||
    $('div._30jeq3').text().trim() || null
  const price = priceRaw ? cleanPrice(priceRaw) : null

  const originalRaw = $('div._3I9_wc._2p6lqe').text().trim() ||
    $('div._3I9_wc').text().trim() || null
  const original_price = originalRaw ? cleanPrice(originalRaw) : null

  const image_url = $('img._396cs4._2amPTt._3qGmMb').attr('src') ||
    $('img._396cs4').attr('src') || null

  return { title, price, image_url, original_price, currency: 'INR' }
}

async function scrapeGeneric($: cheerio.CheerioAPI): Promise<Partial<ScrapeResult>> {
  const title = $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') || null

  // Try common price selectors
  const priceSelectors = [
    '[itemprop="price"]',
    '.price', '#price', '.product-price',
    '[class*="price"]', '[class*="Price"]',
    'meta[property="product:price:amount"]',
  ]
  let price: number | null = null
  for (const sel of priceSelectors) {
    const el = $(sel).first()
    const text = el.attr('content') || el.text()
    if (text) {
      const p = cleanPrice(text)
      if (p && p > 0 && p < 10000000) { price = p; break }
    }
  }

  const image_url = $('meta[property="og:image"]').attr('content') ||
    $('img').first().attr('src') || null

  return { title, price, image_url, original_price: null, currency: 'INR' }
}

export async function scrapeProduct(url: string): Promise<ScrapeResult> {
  const site = detectSite(url)

  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 0 },
  })

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  let result: Partial<ScrapeResult> = {}

  if (site === 'Amazon') result = await scrapeAmazon($)
  else if (site === 'Flipkart') result = await scrapeFlipkart($)
  else result = await scrapeGeneric($)

  return {
    title: result.title || 'Unknown Product',
    price: result.price || null,
    image_url: result.image_url || null,
    site_name: site,
    currency: result.currency || 'INR',
    original_price: result.original_price || null,
  }
}
