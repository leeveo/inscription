import { ReactNode } from 'react'

interface QRScannerLayoutProps {
  children: ReactNode
}

export default function QRScannerLayout({ children }: QRScannerLayoutProps) {
  return (
    <div className="qr-scanner-layout relative min-h-screen overflow-hidden">
      {/* Background avec dégradé Web 3.0 - identique à la sidebar */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      
      {/* Effet de particules/mesh moderne */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-6 w-24 h-24 bg-cyan-300/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-8 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-4 w-20 h-20 bg-purple-400/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 right-16 w-28 h-28 bg-blue-300/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Grille subtile en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 179, 237, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 179, 237, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        ></div>
      </div>
      
      {/* Contenu avec z-index élevé */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Styles spéciaux pour le scanner */}
      <style jsx global>{`
        .qr-scanner-layout {
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height pour mobile */
          width: 100%;
          overflow-x: hidden;
        }

        /* Masquer la sidebar et autres éléments de navigation pour cette page */
        .qr-scanner-layout ~ nav,
        .qr-scanner-layout ~ aside,
        .qr-scanner-layout ~ .sidebar {
          display: none !important;
        }

        /* Optimisations mobile */
        @media (max-width: 768px) {
          .qr-scanner-layout {
            /* Masquer la barre d'adresse sur mobile */
            height: 100vh;
            height: 100dvh;
          }
        }

        /* PWA - Mode plein écran */
        @media (display-mode: standalone) {
          .qr-scanner-layout {
            height: 100vh;
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Empêcher le zoom sur les inputs */
        .qr-scanner-layout input {
          font-size: 16px !important;
        }

        /* Désactiver la sélection de texte pour une meilleure UX tactile */
        .qr-scanner-layout {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Permettre la sélection sur les inputs */
        .qr-scanner-layout input,
        .qr-scanner-layout textarea {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* Améliorer les cartes avec effet glassmorphisme */
        .qr-scanner-layout .bg-white {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        }

        /* Améliorer les boutons avec effet Web 3.0 */
        .qr-scanner-layout .bg-blue-500 {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3) !important;
        }

        .qr-scanner-layout .bg-blue-500:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af) !important;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        .qr-scanner-layout .bg-green-500 {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3) !important;
        }

        .qr-scanner-layout .bg-red-500 {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          border: 1px solid rgba(239, 68, 68, 0.3) !important;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3) !important;
        }

        .qr-scanner-layout .bg-gray-500 {
          background: linear-gradient(135deg, #6b7280, #4b5563) !important;
          border: 1px solid rgba(107, 114, 128, 0.3) !important;
          box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2) !important;
        }

        .qr-scanner-layout .bg-yellow-500 {
          background: linear-gradient(135deg, #f59e0b, #d97706) !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3) !important;
        }

        /* Améliorer les zones de statut */
        .qr-scanner-layout .bg-green-50 {
          background: rgba(240, 253, 244, 0.9) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(34, 197, 94, 0.2) !important;
        }

        .qr-scanner-layout .bg-orange-50 {
          background: rgba(255, 251, 235, 0.9) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(251, 146, 60, 0.2) !important;
        }

        .qr-scanner-layout .bg-blue-50 {
          background: rgba(239, 246, 255, 0.9) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </div>
  )
}