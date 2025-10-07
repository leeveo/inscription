import './globals.css'
import { Inter, Roboto, Poppins, Playfair_Display, Montserrat, Lato, Open_Sans, Raleway, Ubuntu, Bebas_Neue } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-roboto' })
const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-poppins' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-playfair' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-montserrat' })
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-lato' })
const opensans = Open_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-opensans' })
const raleway = Raleway({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-raleway' })
const ubuntu = Ubuntu({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-ubuntu' })
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' })

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

  // Debug logging
  console.log('RootLayout - pathname:', pathname)

  // Routes qui ne doivent pas avoir la sidebar
  const isLandingPage = pathname.includes('/landing')
  const isQRScannerPage = pathname.includes('/qr-scanner') || pathname.includes('/scanner')
  const isAuthPage = pathname.startsWith('/auth')
  const isHomePage = pathname === '/'
  const isTicketPage = pathname.includes('/ticket')
  const isInscriptionPage = pathname.includes('/inscription')
  const isCheckinPage = pathname.includes('/checkin')
  // Match builder editor pages (with pageId) but not the library page
  // Check for any UUID pattern in /admin/builder/... path
  const isBuilderEditorPage = /^\/admin\/builder\/[a-f0-9-]{36}/i.test(pathname)
  const isPreviewPage = pathname.startsWith('/preview/') || pathname.startsWith('/p/')

  console.log('RootLayout - isBuilderEditorPage:', isBuilderEditorPage, 'pathname:', pathname)

  // Utiliser un layout simplifié pour ces pages
  if (isLandingPage || isQRScannerPage || isAuthPage || isHomePage || isTicketPage || isInscriptionPage || isCheckinPage || isBuilderEditorPage || isPreviewPage) {
    return (
      <html lang="fr" className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${playfair.variable} ${montserrat.variable} ${lato.variable} ${opensans.variable} ${raleway.variable} ${ubuntu.variable} ${bebas.variable}`}>
        <body className={`${inter.className} min-h-screen`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="fr" className={`${inter.variable} ${roboto.variable} ${poppins.variable} ${playfair.variable} ${montserrat.variable} ${lato.variable} ${opensans.variable} ${raleway.variable} ${ubuntu.variable} ${bebas.variable}`}>
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
