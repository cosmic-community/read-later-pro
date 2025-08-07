import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Read Later Pro',
  description: 'Save articles, schedule emails, and manage your reading workflow',
  keywords: 'read later, articles, email digest, productivity, reading list',
  authors: [{ name: 'Read Later Pro' }],
  creator: 'Read Later Pro',
  publisher: 'Read Later Pro',
  robots: 'index, follow',
  openGraph: {
    title: 'Read Later Pro',
    description: 'Save articles, schedule emails, and manage your reading workflow',
    type: 'website',
    url: 'https://readlater.example.com',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop&auto=format',
        width: 1200,
        height: 630,
        alt: 'Read Later Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Read Later Pro',
    description: 'Save articles, schedule emails, and manage your reading workflow',
    images: ['https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop&auto=format'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Access environment variable on server side
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* Pass bucket slug as prop to client component */}
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  )
}