'use client'

import { LandingPageConfig } from '@/types'
import LandingRegistrationForm from '@/components/LandingRegistrationForm'

interface Event {
  id: string
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  prix?: number
  places_disponibles?: number
  organisateur?: string
  email_contact?: string
  telephone_contact?: string
  image_url?: string
  statut?: string
  type_evenement?: string
}

interface LandingTemplateProps {
  event: Event
  config: LandingPageConfig
  onRegistrationSuccess: () => void
  registrationSuccess: boolean
  isPreview?: boolean
  participantData?: any
  token?: string | null
}

export default function WorkshopLearningTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const primaryColor = config?.customization?.primaryColor || '#2563EB'
  const secondaryColor = config?.customization?.secondaryColor || '#7C3AED'
  const accentColor = config?.customization?.accentColor || '#059669'
  const backgroundColor = config?.customization?.backgroundColor || '#F8FAFC'

  return (
    <>
      <style jsx>{`
        .notebook-bg {
          background-color: ${backgroundColor};
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 35px,
              ${primaryColor}15 35px,
              ${primaryColor}15 37px
            ),
            linear-gradient(90deg, ${accentColor}30 0px, ${accentColor}30 1px, transparent 1px);
          background-size: 100% 100%, 40px 100%;
          background-position: 0 0, 40px 0;
        }

        .paper-card {
          background: white;
          box-shadow:
            2px 2px 0 rgba(0,0,0,0.05),
            4px 4px 0 rgba(0,0,0,0.03),
            6px 6px 0 rgba(0,0,0,0.02);
          border-left: 3px solid ${accentColor};
          position: relative;
        }

        .paper-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            repeating-linear-gradient(
              transparent 0,
              transparent 34px,
              ${primaryColor}08 34px,
              ${primaryColor}08 36px
            );
          pointer-events: none;
        }

        .highlight-marker {
          background: linear-gradient(180deg, transparent 60%, ${accentColor}40 60%);
          padding: 0 4px;
        }

        .sketch-underline {
          position: relative;
          display: inline-block;
        }

        .sketch-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 3px;
          background: ${primaryColor};
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          animation: sketch-draw 1s ease-out forwards;
        }

        @keyframes sketch-draw {
          to { transform: scaleX(1); }
        }

        .book-stack {
          position: relative;
        }

        .book-stack::before,
        .book-stack::after {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          height: 100%;
          border-radius: inherit;
          z-index: -1;
        }

        .book-stack::before {
          background: ${secondaryColor}30;
          top: -8px;
        }

        .book-stack::after {
          background: ${primaryColor}20;
          top: -16px;
        }

        .pencil-icon {
          animation: pencil-write 2s ease-in-out infinite;
        }

        @keyframes pencil-write {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(-5deg); }
          75% { transform: translateY(5px) rotate(5deg); }
        }

        .check-animation {
          animation: check-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        @keyframes check-pop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .progress-bar {
          height: 8px;
          background: ${backgroundColor};
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor});
          border-radius: 4px;
          animation: progress-fill 2s ease-out forwards;
        }

        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 85%; }
        }

        .sticky-note {
          background: #FFFACD;
          box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
          transform: rotate(-2deg);
          transition: transform 0.3s ease;
        }

        .sticky-note:hover {
          transform: rotate(0deg) scale(1.05);
        }

        .dashed-circle {
          border: 3px dashed ${primaryColor};
          border-radius: 50%;
          animation: rotate-dashed 20s linear infinite;
        }

        @keyframes rotate-dashed {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="notebook-bg min-h-screen relative">

        {/* Floating educational icons */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="pencil-icon absolute top-20 right-10 text-4xl">✏️</div>
          <div className="pencil-icon absolute top-40 left-20 text-3xl" style={{ animationDelay: '0.5s' }}>📚</div>
          <div className="pencil-icon absolute bottom-32 right-1/4 text-3xl" style={{ animationDelay: '1s' }}>💡</div>
          <div className="pencil-icon absolute top-1/2 left-10 text-4xl" style={{ animationDelay: '1.5s' }}>🎓</div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-7xl">

            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Content */}
              <div>
                {/* Category badge */}
                <div className="inline-block mb-6 px-6 py-2 rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                  <span className="flex items-center gap-2">
                    <span>📖</span>
                    <span>Formation & Apprentissage</span>
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: primaryColor }}>
                  <span className="sketch-underline">
                    {config?.customization?.heroTitle || event.nom}
                  </span>
                </h1>

                <div
                  className="text-xl text-gray-700 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
                />

                {/* Learning objectives */}
                <div className="paper-card rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: secondaryColor }}>
                    <span>🎯</span>
                    <span className="highlight-marker">Objectifs d'apprentissage</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mt-1" style={{ backgroundColor: accentColor }}>
                        ✓
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Acquérir de nouvelles compétences</div>
                        <div className="text-sm text-gray-600">Méthodes pratiques et éprouvées</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mt-1" style={{ backgroundColor: accentColor }}>
                        ✓
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Pratiquer en temps réel</div>
                        <div className="text-sm text-gray-600">Exercices interactifs et cas pratiques</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white mt-1" style={{ backgroundColor: accentColor }}>
                        ✓
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Obtenir une certification</div>
                        <div className="text-sm text-gray-600">Certificat de participation délivré</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold" style={{ color: primaryColor }}>Places disponibles</span>
                    <span className="font-bold" style={{ color: secondaryColor }}>85%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inscrivez-vous vite, les places sont limitées !</p>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="paper-card rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)` }}>
                        📅
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold">Date</div>
                        <div className="font-bold text-gray-800">{new Date(event.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                  </div>

                  <div className="paper-card rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `linear-gradient(135deg, ${secondaryColor}20, ${accentColor}20)` }}>
                        📍
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold">Lieu</div>
                        <div className="font-bold text-gray-800 text-sm truncate">{event.lieu}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div>
                <div className="book-stack paper-card rounded-2xl p-8">
                  <div className="text-center mb-6">
                    {/* Icon with rotating dashed circle */}
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="dashed-circle absolute inset-0"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                          ✍️
                        </div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
                      <span className="highlight-marker">Inscription</span>
                    </h3>
                    <p className="text-gray-600">
                      Réservez votre place pour cette formation
                    </p>
                  </div>

                  <LandingRegistrationForm
                    eventId={event.id}
                    onSuccess={onRegistrationSuccess}
                    participantData={participantData}
                    token={token}
                  />
                </div>

                {/* Sticky note */}
                <div className="sticky-note p-4 mt-6 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">💡</span>
                    <div>
                      <div className="font-bold text-gray-800 mb-1">Bon à savoir</div>
                      <p className="text-sm text-gray-700">
                        Support de cours inclus + accès aux ressources en ligne pendant 3 mois
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-center mb-12" style={{ color: primaryColor }}>
              <span className="highlight-marker">Ce que vous allez apprendre</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="paper-card rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)` }}>
                  📊
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: secondaryColor }}>Théorie</h3>
                <p className="text-gray-600 text-sm">Concepts fondamentaux expliqués simplement</p>
              </div>

              <div className="paper-card rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${secondaryColor}20, ${accentColor}20)` }}>
                  🛠️
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: secondaryColor }}>Pratique</h3>
                <p className="text-gray-600 text-sm">Exercices concrets et mises en situation</p>
              </div>

              <div className="paper-card rounded-xl p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${accentColor}20, ${primaryColor}20)` }}>
                  🎓
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: secondaryColor }}>Certification</h3>
                <p className="text-gray-600 text-sm">Attestation reconnue à la fin du workshop</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4 border-t-2" style={{ borderColor: `${primaryColor}20` }}>
          <div className="container mx-auto text-center">
            <p className="text-gray-600 font-semibold">
              © {new Date().getFullYear()} - Apprendre, pratiquer, réussir 🎓
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
