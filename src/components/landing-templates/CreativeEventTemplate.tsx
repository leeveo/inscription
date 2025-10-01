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

export default function CreativeEventTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const primaryColor = config?.customization?.primaryColor || '#9333EA'
  const secondaryColor = config?.customization?.secondaryColor || '#EC4899'
  const accentColor = config?.customization?.accentColor || '#F97316'
  const backgroundColor = config?.customization?.backgroundColor || '#1E1B4B'

  return (
    <>
      <style jsx>{`
        .creative-gradient {
          background: radial-gradient(circle at 20% 30%, ${primaryColor}40, transparent 50%),
                      radial-gradient(circle at 80% 70%, ${secondaryColor}40, transparent 50%),
                      radial-gradient(circle at 50% 50%, ${accentColor}20, transparent 70%),
                      ${backgroundColor};
        }

        .blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: blob-morph 8s ease-in-out infinite;
        }

        @keyframes blob-morph {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; transform: translate(0, 0) scale(1); }
          25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; transform: translate(30px, -50px) scale(1.1); }
          50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; transform: translate(-30px, 20px) scale(0.9); }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; transform: translate(10px, 30px) scale(1.05); }
        }

        .paint-stroke {
          position: absolute;
          background: linear-gradient(90deg, transparent, ${accentColor}60, transparent);
          animation: paint-draw 3s ease-out infinite;
        }

        @keyframes paint-draw {
          0% { transform: translateX(-100%) rotate(-5deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%) rotate(5deg); opacity: 0; }
        }

        .splash-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          transform: rotate(-1deg);
          transition: transform 0.3s ease;
        }

        .splash-card:hover {
          transform: rotate(0deg) scale(1.02);
        }

        .brush-text {
          background: linear-gradient(120deg, ${primaryColor}, ${secondaryColor}, ${accentColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px ${primaryColor}60);
        }

        .ink-splatter {
          position: absolute;
          border-radius: 50%;
          opacity: 0.2;
          animation: splatter 3s ease-in-out infinite;
        }

        @keyframes splatter {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.4; }
        }

        .creative-float {
          animation: creative-float 6s ease-in-out infinite;
        }

        @keyframes creative-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-30px) rotate(5deg); }
          75% { transform: translateY(15px) rotate(-5deg); }
        }
      `}</style>

      <div className="creative-gradient min-h-screen relative overflow-hidden">
        {/* Animated blobs */}
        <div className="blob absolute top-20 left-10 w-72 h-72 opacity-30" style={{ backgroundColor: primaryColor }}></div>
        <div className="blob absolute bottom-20 right-20 w-96 h-96 opacity-20" style={{ backgroundColor: secondaryColor, animationDelay: '-4s' }}></div>
        <div className="blob absolute top-1/2 left-1/3 w-64 h-64 opacity-25" style={{ backgroundColor: accentColor, animationDelay: '-2s' }}></div>

        {/* Paint strokes */}
        <div className="paint-stroke w-full h-2 top-1/4"></div>
        <div className="paint-stroke w-full h-3 bottom-1/3" style={{ animationDelay: '-1.5s' }}></div>

        {/* Ink splatters */}
        <div className="ink-splatter top-32 right-40 w-20 h-20" style={{ backgroundColor: primaryColor }}></div>
        <div className="ink-splatter bottom-40 left-20 w-16 h-16" style={{ backgroundColor: secondaryColor, animationDelay: '-1s' }}></div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left: Title & Description */}
              <div className="text-center lg:text-left">
                <div className="creative-float">
                  <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight brush-text">
                    {config?.customization?.heroTitle || event.nom}
                  </h1>
                </div>

                <div
                  className="text-xl text-white/90 mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
                />

                {/* Event details with creative cards */}
                <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                  <div className="splash-card rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                        🎨
                      </div>
                      <div>
                        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Date</div>
                        <div className="text-white font-bold text-lg">
                          {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="splash-card rounded-2xl p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${accentColor})` }}>
                        📍
                      </div>
                      <div>
                        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Lieu</div>
                        <div className="text-white font-bold text-lg">{event.lieu}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div className="creative-float" style={{ animationDelay: '-1s' }}>
                <div className="splash-card rounded-3xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl creative-float" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor})`, boxShadow: `0 0 40px ${primaryColor}60` }}>
                      ✨
                    </div>

                    <h3 className="text-3xl font-black text-white mb-2 brush-text">
                      Rejoignez-nous !
                    </h3>
                    <p className="text-white/80">
                      Une expérience créative unique
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
            <h2 className="text-5xl font-black text-center mb-12 brush-text">
              Ce qui vous attend
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="splash-card rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4 creative-float">🎭</div>
                <h3 className="text-2xl font-bold text-white mb-3">Expression</h3>
                <p className="text-white/70">Libérez votre créativité</p>
              </div>

              <div className="splash-card rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4 creative-float" style={{ animationDelay: '-1s' }}>🌈</div>
                <h3 className="text-2xl font-bold text-white mb-3">Diversité</h3>
                <p className="text-white/70">Un programme riche et varié</p>
              </div>

              <div className="splash-card rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4 creative-float" style={{ animationDelay: '-2s' }}>🚀</div>
                <h3 className="text-2xl font-bold text-white mb-3">Innovation</h3>
                <p className="text-white/70">Repoussez les limites</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4">
          <div className="container mx-auto text-center">
            <p className="text-white/60">
              © {new Date().getFullYear()} - Créé avec passion et imagination
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}