import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Event Admin - Inscriptions',
  description: 'Gestion des inscriptions aux événements',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Si c'est une route landing ou QR scanner, utiliser un layout simplifié
  const isLandingPage = pathname.includes('/landing/')
  const isQRScannerPage = pathname.includes('/qr-scanner') || pathname.includes('/scanner')
  
  if (isLandingPage || isQRScannerPage) {
    return (
      <html lang="fr">
        <body className={`${inter.className} min-h-screen bg-gray-50`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="fr">
      <body className={`${inter.className} flex h-screen bg-gray-50`}>
        {/* Sidebar - fixed on desktop, sliding on mobile */}
        <div className="hidden md:block md:w-64 shrink-0">
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Mobile header with menu button */}
          <header className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-700">Event Admin</h1>
            <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </header>
          
          {/* Page content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
