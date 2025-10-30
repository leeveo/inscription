'use client'

import { LandingPageConfig } from '@/types'
import LandingRegistrationForm from '@/components/LandingRegistrationForm'
import { useState, useEffect } from 'react'

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

export default function FestivalFunTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2
    }))
    setConfetti(pieces)
  }, [])

  const primaryColor = config?.customization?.primaryColor || '#FF6B35'
  const secondaryColor = config?.customization?.secondaryColor || '#F7931E'
  const accentColor = config?.customization?.accentColor || '#FF1744'
  const backgroundColor = config?.customization?.backgroundColor || '#FFF8F0'

  return (
    <>
      <style jsx>{`
        .festival-bg {
          background: linear-gradient(180deg, ${backgroundColor} 0%, #FFF4E6 50%, #FFE8CC 100%);
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: ${primaryColor};
          animation: confetti-fall linear infinite;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        .bounce-fun {
          animation: bounce-fun 2s ease-in-out infinite;
        }

        @keyframes bounce-fun {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        .rainbow-text {
          background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${accentColor}, ${primaryColor});
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbow-flow 3s linear infinite;
        }

        @keyframes rainbow-flow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .pop-in {
          animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes pop-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .festival-card {
          background: white;
          border: 4px solid ${primaryColor};
          box-shadow:
            8px 8px 0 ${secondaryColor},
            12px 12px 0 ${accentColor};
          transform: rotate(-2deg);
          transition: all 0.3s ease;
        }

        .festival-card:hover {
          transform: rotate(0deg) scale(1.05);
        }

        .zigzag-top {
          background:
            linear-gradient(135deg, ${backgroundColor} 25%, transparent 25%) -10px 0,
            linear-gradient(225deg, ${backgroundColor} 25%, transparent 25%) -10px 0,
            linear-gradient(315deg, ${backgroundColor} 25%, transparent 25%),
            linear-gradient(45deg, ${backgroundColor} 25%, transparent 25%);
          background-size: 20px 20px;
          background-color: ${primaryColor};
        }

        .music-note {
          animation: music-float 3s ease-in-out infinite;
        }

        @keyframes music-float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(10deg); }
          50% { transform: translateY(-10px) translateX(-10px) rotate(-10deg); }
          75% { transform: translateY(-30px) translateX(5px) rotate(5deg); }
        }

        .pulse-ring-fun {
          animation: pulse-ring-fun 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        @keyframes pulse-ring-fun {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          80%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <div className="festival-bg min-h-screen relative overflow-hidden">
        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="confetti"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                backgroundColor: [primaryColor, secondaryColor, accentColor, '#FFC107', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>

        {/* Floating music notes */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="music-note absolute top-20 left-10 text-4xl" style={{ color: primaryColor }}>♪</div>
          <div className="music-note absolute top-40 right-20 text-5xl" style={{ color: secondaryColor, animationDelay: '1s' }}>♫</div>
          <div className="music-note absolute bottom-32 left-1/4 text-3xl" style={{ color: accentColor, animationDelay: '2s' }}>♪</div>
          <div className="music-note absolute top-1/2 right-10 text-4xl" style={{ color: '#FFC107', animationDelay: '1.5s' }}>♫</div>
        </div>

        {/* Top zigzag decoration */}
        <div className="zigzag-top h-5 w-full"></div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-7xl">

            <div className="text-center mb-12">
              {/* Animated badge */}
              <div className="inline-block pop-in mb-6 px-6 py-3 rounded-full font-black text-white wiggle" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, boxShadow: `0 4px 15px ${primaryColor}60` }}>
                🎉 FESTIVAL 2024 🎉
              </div>

              <h1 className="text-6xl md:text-9xl font-black mb-6 rainbow-text leading-tight">
                {config?.customization?.heroTitle || event.nom}
              </h1>

              <div className="bounce-fun inline-block">
                <div className="text-3xl mb-6">🎪 🎨 🎵 🎭</div>
              </div>

              <div
                className="text-2xl md:text-3xl font-bold mb-8 leading-relaxed"
                style={{ color: secondaryColor }}
                dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">

              {/* Left: Features */}
              <div className="space-y-6">
                <div className="festival-card rounded-3xl p-6 pop-in">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                      📅
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: accentColor }}>
                        Quand ?
                      </div>
                      <div className="text-xl font-bold" style={{ color: secondaryColor }}>
                        {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="festival-card rounded-3xl p-6 pop-in" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${accentColor})` }}>
                      📍
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: accentColor }}>
                        Où ?
                      </div>
                      <div className="text-xl font-bold" style={{ color: secondaryColor }}>
                        {event.lieu}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="festival-card rounded-3xl p-6 pop-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})` }}>
                      🎫
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: accentColor }}>
                        Tarif
                      </div>
                      <div className="text-xl font-bold" style={{ color: secondaryColor }}>
                        Entrée libre !
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fun stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-4xl font-black rainbow-text">50+</div>
                    <div className="text-sm font-bold" style={{ color: secondaryColor }}>Artistes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black rainbow-text">10+</div>
                    <div className="text-sm font-bold" style={{ color: secondaryColor }}>Scènes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black rainbow-text">∞</div>
                    <div className="text-sm font-bold" style={{ color: secondaryColor }}>Fun</div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form */}
              <div className="pop-in" style={{ animationDelay: '0.3s' }}>
                <div className="relative">
                  {/* Pulse ring behind card */}
                  <div className="absolute inset-0 pulse-ring-fun rounded-3xl" style={{ backgroundColor: primaryColor, opacity: 0.3 }}></div>

                  <div className="festival-card rounded-3xl p-8 relative bg-white">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl bounce-fun" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, boxShadow: `0 10px 30px ${primaryColor}60` }}>
                        🎉
                      </div>

                      <h3 className="text-3xl font-black mb-2 rainbow-text">
                        Rejoins-nous !
                      </h3>
                      <p className="font-bold" style={{ color: secondaryColor }}>
                        L'aventure commence ici 🚀
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
          </div>
        </section>

        {/* Fun Features Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-black text-center mb-12 rainbow-text">
              Au programme ! 🎊
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center pop-in">
                <div className="text-6xl mb-4 bounce-fun">🎵</div>
                <h3 className="text-2xl font-black mb-2" style={{ color: primaryColor }}>Musique Live</h3>
                <p style={{ color: secondaryColor }}>Les meilleurs artistes de la scène</p>
              </div>

              <div className="text-center pop-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-6xl mb-4 bounce-fun" style={{ animationDelay: '0.5s' }}>🍔</div>
                <h3 className="text-2xl font-black mb-2" style={{ color: secondaryColor }}>Food Trucks</h3>
                <p style={{ color: primaryColor }}>Cuisine du monde entier</p>
              </div>

              <div className="text-center pop-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-6xl mb-4 bounce-fun" style={{ animationDelay: '1s' }}>🎨</div>
                <h3 className="text-2xl font-black mb-2" style={{ color: accentColor }}>Art & Créativité</h3>
                <p style={{ color: secondaryColor }}>Expositions et ateliers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4">
          <div className="zigzag-top h-5 w-full mb-8"></div>
          <div className="container mx-auto text-center">
            <p className="text-2xl font-black rainbow-text mb-2">
              On se voit là-bas ! 🎉
            </p>
            <p className="text-sm" style={{ color: secondaryColor }}>
              © {new Date().getFullYear()} - Made with ❤️ and 🎵
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
