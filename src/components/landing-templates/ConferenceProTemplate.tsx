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

export default function ConferenceProTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const primaryColor = config?.customization?.primaryColor || '#1E40AF'
  const secondaryColor = config?.customization?.secondaryColor || '#0F172A'
  const accentColor = config?.customization?.accentColor || '#3B82F6'
  const backgroundColor = config?.customization?.backgroundColor || '#F8FAFC'

  return (
    <>
      <style jsx>{`
        .corporate-gradient {
          background: linear-gradient(180deg, ${backgroundColor} 0%, #E2E8F0 100%);
        }

        .professional-header {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .corporate-card {
          background: white;
          border: 1px solid #E2E8F0;
          box-shadow:
            0 4px 6px -1px rgba(0,0,0,0.05),
            0 2px 4px -1px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }

        .corporate-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 25px -5px rgba(0,0,0,0.08),
            0 10px 10px -5px rgba(0,0,0,0.04);
        }

        .accent-line {
          background: linear-gradient(90deg, ${primaryColor}, ${accentColor});
          height: 4px;
        }

        .professional-badge {
          background: linear-gradient(135deg, ${primaryColor}20, ${accentColor}20);
          border: 2px solid ${primaryColor}40;
          color: ${secondaryColor};
          font-weight: 600;
          padding: 8px 24px;
          border-radius: 30px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .statistic-card {
          position: relative;
          overflow: hidden;
        }

        .statistic-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, ${primaryColor}, ${accentColor});
        }

        .professional-icon-box {
          background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
          border-radius: 12px;
          padding: 16px;
          display: inline-flex;
          box-shadow: 0 10px 20px ${primaryColor}30;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accentColor};
          border: 4px solid white;
          box-shadow: 0 0 0 2px ${primaryColor};
        }

        .corporate-button {
          background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
          color: white;
          font-weight: 600;
          padding: 12px 32px;
          border-radius: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px ${primaryColor}40;
        }

        .corporate-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px ${primaryColor}60;
        }

        .professional-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, ${primaryColor}40, transparent);
        }
      `}</style>

      <div className="corporate-gradient min-h-screen">
        {/* Professional Header */}
        <header className="professional-header py-3 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="text-white text-sm font-semibold">
                {event.organisateur || 'Professional Conference'}
              </div>
              <div className="text-white/80 text-xs">
                {new Date(event.date_debut).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">

            {/* Category badge */}
            <div className="text-center mb-8">
              <div className="professional-badge">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Conférence Professionnelle</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Content */}
              <div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: secondaryColor }}>
                  {config?.customization?.heroTitle || event.nom}
                </h1>

                <div className="accent-line w-24 mb-6"></div>

                <div
                  className="text-xl text-gray-700 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
                />

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="statistic-card corporate-card rounded-lg p-4 pl-6">
                    <div className="text-3xl font-bold mb-1" style={{ color: primaryColor }}>500+</div>
                    <div className="text-xs text-gray-600 uppercase">Participants</div>
                  </div>
                  <div className="statistic-card corporate-card rounded-lg p-4 pl-6">
                    <div className="text-3xl font-bold mb-1" style={{ color: primaryColor }}>50+</div>
                    <div className="text-xs text-gray-600 uppercase">Speakers</div>
                  </div>
                  <div className="statistic-card corporate-card rounded-lg p-4 pl-6">
                    <div className="text-3xl font-bold mb-1" style={{ color: primaryColor }}>2</div>
                    <div className="text-xs text-gray-600 uppercase">Jours</div>
                  </div>
                </div>

                {/* Key Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="professional-icon-box">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Date & Horaire</div>
                      <div className="font-bold text-gray-800">
                        {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(event.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="professional-icon-box">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Lieu</div>
                      <div className="font-bold text-gray-800">{event.lieu}</div>
                      <div className="text-sm text-gray-600">Centre de conférences</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div>
                <div className="corporate-card rounded-2xl p-8">
                  <div className="mb-6">
                    <div className="professional-icon-box w-16 h-16 mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <h3 className="text-3xl font-bold mb-2" style={{ color: secondaryColor }}>
                      Inscription
                    </h3>
                    <p className="text-gray-600">
                      Réservez votre place dès maintenant
                    </p>
                  </div>

                  <div className="accent-line w-16 mb-6"></div>

                  <LandingRegistrationForm
                    eventId={event.id}
                    onSuccess={onRegistrationSuccess}
                    participantData={participantData}
                    token={token}
                  />

                  <div className="professional-divider my-6"></div>

                  <div className="text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-4 h-4" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Confirmation immédiate</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Badge d'accès inclus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: secondaryColor }}>
                Pourquoi participer ?
              </h2>
              <div className="accent-line w-24 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="corporate-card rounded-xl p-8">
                <div className="professional-icon-box w-14 h-14 mb-6 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: secondaryColor }}>Expertise</h3>
                <p className="text-gray-600">Intervenants reconnus et leaders d'industrie</p>
              </div>

              <div className="corporate-card rounded-xl p-8">
                <div className="professional-icon-box w-14 h-14 mb-6 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: secondaryColor }}>Networking</h3>
                <p className="text-gray-600">Rencontrez des professionnels de votre secteur</p>
              </div>

              <div className="corporate-card rounded-xl p-8">
                <div className="professional-icon-box w-14 h-14 mb-6 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: secondaryColor }}>Certification</h3>
                <p className="text-gray-600">Certificat de participation officiel</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-gray-200">
          <div className="container mx-auto text-center">
            <p className="text-gray-600">
              © {new Date().getFullYear()} - Conférence Professionnelle
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
