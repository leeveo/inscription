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

export default function NeomorphismTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const primaryColor = config?.customization?.primaryColor || '#E0E5EC'
  const secondaryColor = config?.customization?.secondaryColor || '#94A3B8'
  const accentColor = config?.customization?.accentColor || '#6366F1'
  const backgroundColor = config?.customization?.backgroundColor || '#EFF3F6'

  return (
    <>
      <style jsx>{`
        .neo-background {
          background: ${backgroundColor};
        }

        .neo-raised {
          background: ${backgroundColor};
          border-radius: 24px;
          box-shadow:
            12px 12px 24px #b8c2cc,
            -12px -12px 24px #ffffff;
          transition: all 0.3s ease;
        }

        .neo-raised:hover {
          box-shadow:
            16px 16px 32px #b8c2cc,
            -16px -16px 32px #ffffff;
        }

        .neo-pressed {
          background: ${backgroundColor};
          border-radius: 20px;
          box-shadow:
            inset 8px 8px 16px #b8c2cc,
            inset -8px -8px 16px #ffffff;
        }

        .neo-flat {
          background: linear-gradient(145deg, ${primaryColor}, ${secondaryColor});
          border-radius: 16px;
          box-shadow:
            8px 8px 16px #b8c2cc,
            -8px -8px 16px #ffffff;
        }

        .neo-button {
          background: linear-gradient(145deg, ${accentColor}, ${secondaryColor});
          border-radius: 12px;
          box-shadow:
            6px 6px 12px #b8c2cc,
            -6px -6px 12px #ffffff;
          border: none;
          transition: all 0.2s ease;
          color: white;
          font-weight: 600;
          padding: 12px 32px;
        }

        .neo-button:hover {
          transform: translateY(-2px);
          box-shadow:
            8px 8px 16px #b8c2cc,
            -8px -8px 16px #ffffff;
        }

        .neo-button:active {
          transform: translateY(0);
          box-shadow:
            inset 4px 4px 8px #b8c2cc,
            inset -4px -4px 8px #ffffff;
        }

        .soft-pulse {
          animation: soft-pulse 3s ease-in-out infinite;
        }

        @keyframes soft-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        .text-gradient {
          background: linear-gradient(135deg, ${accentColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .icon-raised {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${backgroundColor};
          box-shadow:
            6px 6px 12px #b8c2cc,
            -6px -6px 12px #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-soft {
          animation: floating-soft 4s ease-in-out infinite;
        }

        @keyframes floating-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      <div className="neo-background min-h-screen relative overflow-hidden">
        {/* Soft floating shapes */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="floating-soft soft-pulse absolute top-20 left-10 w-32 h-32 rounded-full" style={{ background: `linear-gradient(135deg, ${accentColor}20, ${secondaryColor}20)`, boxShadow: '8px 8px 16px #b8c2cc, -8px -8px 16px #ffffff' }}></div>
          <div className="floating-soft soft-pulse absolute bottom-32 right-20 w-40 h-40 rounded-full" style={{ background: `linear-gradient(135deg, ${primaryColor}30, ${accentColor}20)`, boxShadow: '8px 8px 16px #b8c2cc, -8px -8px 16px #ffffff', animationDelay: '1s' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-7xl">

            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <div className="neo-flat px-8 py-3 text-sm font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                  {event.type_evenement || 'Événement'}
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-6 text-gradient leading-tight">
                {config?.customization?.heroTitle || event.nom}
              </h1>

              <div
                className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Info Cards */}
              <div className="space-y-6">
                <div className="neo-raised p-8">
                  <div className="flex items-center space-x-6">
                    <div className="icon-raised">
                      <svg className="w-7 h-7" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                        Date de l'événement
                      </div>
                      <div className="text-slate-800 font-bold text-xl">
                        {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {new Date(event.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(event.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="neo-raised p-8">
                  <div className="flex items-center space-x-6">
                    <div className="icon-raised">
                      <svg className="w-7 h-7" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                        Lieu
                      </div>
                      <div className="text-slate-800 font-bold text-xl">
                        {event.lieu}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Accessible à tous
                      </div>
                    </div>
                  </div>
                </div>

                <div className="neo-raised p-8">
                  <div className="flex items-center space-x-6">
                    <div className="icon-raised">
                      <svg className="w-7 h-7" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                        Places disponibles
                      </div>
                      <div className="text-slate-800 font-bold text-xl">
                        {event.places_disponibles || 'Limitées'}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Inscription recommandée
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div>
                <div className="neo-raised p-10">
                  <div className="text-center mb-8">
                    <div className="neo-pressed w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-10 h-10" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>

                    <h3 className="text-3xl font-bold text-slate-800 mb-2">
                      S'inscrire
                    </h3>
                    <p className="text-slate-600">
                      Réservez votre place dès maintenant
                    </p>
                  </div>

                  <LandingRegistrationForm
                    eventId={event.id}
                    onSuccess={onRegistrationSuccess}
                    participantData={participantData}
                    token={token}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-gradient">
              Pourquoi participer ?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="neo-raised p-8 text-center">
                <div className="neo-pressed w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Innovation</h3>
                <p className="text-slate-600">Découvrez les dernières tendances</p>
              </div>

              <div className="neo-raised p-8 text-center">
                <div className="neo-pressed w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Networking</h3>
                <p className="text-slate-600">Rencontrez des passionnés</p>
              </div>

              <div className="neo-raised p-8 text-center">
                <div className="neo-pressed w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Expérience</h3>
                <p className="text-slate-600">Moments inoubliables garantis</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4">
          <div className="container mx-auto text-center">
            <div className="neo-flat inline-block px-8 py-4 rounded-xl">
              <p className="text-slate-700 font-semibold">
                © {new Date().getFullYear()} - Un événement inoubliable
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
