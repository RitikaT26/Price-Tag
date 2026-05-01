import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Pricetag — Track prices. Buy at the right time.',
  description: 'Track product prices from Amazon & Flipkart. Get notified when prices drop to your target.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Pricetag',
    description: 'Track prices. Buy at the right time.',
    type: 'website',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} font-body bg-ink-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
