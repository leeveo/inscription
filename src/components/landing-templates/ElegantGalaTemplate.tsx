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

export default function ElegantGalaTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const primaryColor = config?.customization?.primaryColor || '#B8860B'
  const secondaryColor = config?.customization?.secondaryColor || '#2C1810'
  const accentColor = config?.customization?.accentColor || '#FFD700'
  const backgroundColor = config?.customization?.backgroundColor || '#0F0F0F'

  return (
    <>
      <style jsx>{`
        .elegant-gradient {
          background: linear-gradient(180deg, ${backgroundColor} 0%, ${secondaryColor} 100%);
        }

        .gold-shimmer {
          background: linear-gradient(90deg,
            ${primaryColor}00 0%,
            ${accentColor}40 25%,
            ${accentColor}80 50%,
            ${accentColor}40 75%,
            ${primaryColor}00 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .ornate-border {
          border: 2px solid ${primaryColor};
          position: relative;
        }

        .ornate-border::before {
          content: '';
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
          border: 1px solid ${accentColor}40;
          pointer-events: none;
        }

        .luxury-card {
          background: linear-gradient(135deg, ${secondaryColor}90 0%, ${backgroundColor}80 100%);
          border: 1px solid ${primaryColor}40;
          box-shadow:
            0 20px 60px rgba(184, 134, 11, 0.3),
            inset 0 0 30px rgba(255, 215, 0, 0.05);
        }

        .elegant-underline {
          position: relative;
          display: inline-block;
        }

        .elegant-underline::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${accentColor}, transparent);
        }

        .chandelier-light {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(180deg, ${accentColor}80, transparent);
          animation: chandelier 4s ease-in-out infinite;
        }

        @keyframes chandelier {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 0.6; transform: scaleY(1.2); }
        }

        .float-elegant {
          animation: float-elegant 6s ease-in-out infinite;
        }

        @keyframes float-elegant {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        .silk-texture {
          background-image:
            repeating-linear-gradient(45deg, ${primaryColor}03 0px, ${primaryColor}03 2px, transparent 2px, transparent 4px),
            repeating-linear-gradient(-45deg, ${primaryColor}03 0px, ${primaryColor}03 2px, transparent 2px, transparent 4px);
        }
      `}</style>

      <div className="elegant-gradient min-h-screen relative overflow-hidden silk-texture">
        {/* Chandelier lights */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="chandelier-light" style={{ left: '15%', animationDelay: '0s' }}></div>
          <div className="chandelier-light" style={{ left: '35%', animationDelay: '1s' }}></div>
          <div className="chandelier-light" style={{ left: '55%', animationDelay: '2s' }}></div>
          <div className="chandelier-light" style={{ left: '75%', animationDelay: '1.5s' }}></div>
          <div className="chandelier-light" style={{ left: '85%', animationDelay: '0.5s' }}></div>
        </div>

        {/* Floating ornaments */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="float-elegant absolute top-20 right-20 w-24 h-24 opacity-20" style={{ border: `2px solid ${accentColor}` }}>
            <div className="absolute inset-2" style={{ border: `1px solid ${primaryColor}` }}></div>
          </div>
          <div className="float-elegant absolute bottom-32 left-10 w-16 h-16 opacity-20" style={{ border: `2px solid ${accentColor}`, transform: 'rotate(45deg)' }}>
            <div className="absolute inset-2" style={{ border: `1px solid ${primaryColor}` }}></div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-7xl">

            {/* Ornate header decoration */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-8">
                <div className="h-px w-24 gold-shimmer"></div>
                <div className="mx-4 w-3 h-3 rounded-full" style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}` }}></div>
                <div className="h-px w-24 gold-shimmer"></div>
              </div>

              <h1 className="text-6xl md:text-8xl font-serif text-white mb-4 elegant-underline">
                <span style={{ color: accentColor }}>
                  {config?.customization?.heroTitle || event.nom}
                </span>
              </h1>

              <div className="flex items-center justify-center mt-8">
                <div className="h-px w-16 gold-shimmer"></div>
                <svg className="w-6 h-6 mx-3" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="h-px w-16 gold-shimmer"></div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Description */}
              <div>
                <div
                  className="text-lg text-gray-300 mb-8 leading-relaxed text-center lg:text-left"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
                />

                {/* Elegant info cards */}
                <div className="space-y-6 max-w-md mx-auto lg:mx-0">
                  <div className="ornate-border rounded-lg p-6 backdrop-blur-sm" style={{ backgroundColor: `${backgroundColor}80` }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: accentColor }}>Date</div>
                        <div className="text-white font-serif text-lg">
                          {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ornate-border rounded-lg p-6 backdrop-blur-sm" style={{ backgroundColor: `${backgroundColor}80` }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: accentColor }}>Lieu</div>
                        <div className="text-white font-serif text-lg">{event.lieu}</div>
                      </div>
                    </div>
                  </div>

                  <div className="ornate-border rounded-lg p-6 backdrop-blur-sm" style={{ backgroundColor: `${backgroundColor}80` }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: accentColor }}>Heure</div>
                        <div className="text-white font-serif text-lg">
                          {new Date(event.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div>
                <div className="luxury-card rounded-2xl p-8 backdrop-blur-xl">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, boxShadow: `0 10px 30px ${accentColor}40` }}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>

                    <h3 className="text-3xl font-serif mb-2" style={{ color: accentColor }}>
                      Réservation
                    </h3>
                    <div className="flex items-center justify-center mb-2">
                      <div className="h-px w-12 gold-shimmer"></div>
                      <svg className="w-4 h-4 mx-2" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="h-px w-12 gold-shimmer"></div>
                    </div>
                    <p className="text-gray-400 font-serif italic">
                      Un événement d'exception vous attend
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

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-px w-24 gold-shimmer"></div>
              <div className="mx-4 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
              <div className="h-px w-24 gold-shimmer"></div>
            </div>
            <p className="text-gray-500 font-serif italic">
              © {new Date().getFullYear()} - Une soirée inoubliable
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
