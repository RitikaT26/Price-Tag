export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface TrackedProduct {
  id: string
  user_id: string
  url: string
  title: string | null
  image_url: string | null
  site_name: string | null
  current_price: number | null
  original_price: number | null
  currency: string
  last_scraped_at: string | null
  created_at: string
  is_active: boolean
  price_history?: PriceHistory[]
  price_alerts?: PriceAlert[]
}

export interface PriceHistory {
  id: string
  product_id: string
  price: number
  scraped_at: string
}

export interface PriceAlert {
  id: string
  product_id: string
  user_id: string
  target_price: number
  is_triggered: boolean
  triggered_at: string | null
  created_at: string
}

export interface ScrapeResult {
  title: string | null
  price: number | null
  image_url: string | null
  site_name: string | null
  currency: string
  original_price: number | null
}
