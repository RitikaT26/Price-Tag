# 🏷️ Pricetag

> Track product prices from Amazon & Flipkart. Get notified the moment they drop to your target.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

## Features

- 🔐 **Auth** — Email/password signup & login via Supabase Auth
- 🔍 **Price scraping** — Scrapes Amazon & Flipkart product pages (title, price, image)
- 📈 **Price history chart** — See how the price has moved over time
- 🔔 **Price alerts** — Set a target price and get an email when the product drops to it
- ⏱️ **Cron job** — Auto-scrapes all tracked products every 6 hours via Vercel Cron
- 📧 **Email notifications** — Beautiful HTML emails via Resend

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Scraping | Cheerio |
| Emails | Resend |
| Deployment | Vercel + Vercel Cron |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/pricetag.git
cd pricetag
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Set up Resend

1. Go to [resend.com](https://resend.com) and create an account
2. Create an API key
3. Add and verify your sending domain (or use the sandbox for dev)

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=any-random-string
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel → Settings → Environment Variables
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Deploy — Vercel Cron will auto-run `/api/cron` every 6 hours

## Project Structure

```
pricetag/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts     # Supabase auth callback
│   ├── dashboard/
│   │   ├── layout.tsx            # Sidebar layout
│   │   ├── page.tsx              # Watchlist
│   │   └── alerts/page.tsx       # Alerts management
│   └── api/
│       ├── scrape/route.ts       # Scrape product preview
│       ├── track/route.ts        # Add/remove tracked product
│       └── cron/route.ts         # Background price check job
├── components/
│   ├── AddProductForm.tsx
│   ├── ProductCard.tsx
│   └── LogoutButton.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── scraper.ts                # Cheerio-based scraper
│   └── email.ts                  # Resend email templates
├── types/index.ts
├── middleware.ts                 # Auth route protection
├── supabase-schema.sql           # Full DB schema — run in Supabase
└── vercel.json                   # Cron schedule config
```

## License

MIT
