import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from './hooks/useCart'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShopAbell - Transform Your Live Selling Business',
  description: 'The all-in-one platform that helps social media sellers turn live streams into sales. Join in 30 seconds via WhatsApp and start selling.',
  keywords: 'live selling, social commerce, facebook live, instagram live, whatsapp business, ecommerce platform',
  authors: [{ name: 'ShopAbell' }],
  openGraph: {
    title: 'ShopAbell - Transform Your Live Selling Business',
    description: 'The all-in-one platform that helps social media sellers turn live streams into sales',
    url: 'https://shopabell.com',
    siteName: 'ShopAbell',
    images: [
      {
        url: 'https://shopabell.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopAbell - Transform Your Live Selling Business',
    description: 'The all-in-one platform that helps social media sellers turn live streams into sales',
    images: ['https://shopabell.com/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}