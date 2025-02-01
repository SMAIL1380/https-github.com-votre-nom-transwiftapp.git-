import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import NotificationCenter from '@/components/notifications/NotificationCenter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TransWift - Livraison de Colis',
  description: 'Application de transport et livraison de colis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">TransWift</h1>
                <NotificationCenter />
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
