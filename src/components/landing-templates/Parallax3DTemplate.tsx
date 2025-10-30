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

export default function Parallax3DTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const [scrollY, setScrollY] = useState(0)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth - 0.5) * 20)
      setMouseY((e.clientY / window.innerHeight - 0.5) * 20)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const primaryColor = config?.customization?.primaryColor || '#667EEA'
  const secondaryColor = config?.customization?.secondaryColor || '#764BA2'
  const accentColor = config?.customization?.accentColor || '#F093FB'
  const backgroundColor = config?.customization?.backgroundColor || '#0F0F23'

  return (
    <>
      <style jsx>{`
        .parallax-3d {
          background: ${backgroundColor};
          perspective: 1000px;
        }

        .layer-back {
          transform: translateZ(-100px) scale(1.1) translateY(${scrollY * 0.5}px);
        }

        .layer-middle {
          transform: translateZ(0px) translateY(${scrollY * 0.3}px);
        }

        .layer-front {
          transform: translateZ(100px) translateY(${scrollY * 0.1}px);
        }

        .card-3d {
          transform: rotateX(${mouseY * 0.5}deg) rotateY(${mouseX * 0.5}deg);
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }

        .card-3d-inner {
          transform: translateZ(50px);
        }

        .gradient-3d {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor});
        }

        .floating-3d {
          animation: floating-3d 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes floating-3d {
          0%, 100% {
            transform: translateZ(0) translateY(0);
          }
          50% {
            transform: translateZ(50px) translateY(-30px);
          }
        }

        .cube-3d {
          width: 100px;
          height: 100px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate-cube 20s linear infinite;
        }

        @keyframes rotate-cube {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        .cube-face {
          position: absolute;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, ${primaryColor}40, ${secondaryColor}40);
          border: 2px solid ${accentColor}60;
        }

        .cube-front  { transform: translateZ(50px); }
        .cube-back   { transform: translateZ(-50px) rotateY(180deg); }
        .cube-right  { transform: rotateY(90deg) translateZ(50px); }
        .cube-left   { transform: rotateY(-90deg) translateZ(50px); }
        .cube-top    { transform: rotateX(90deg) translateZ(50px); }
        .cube-bottom { transform: rotateX(-90deg) translateZ(50px); }

        .text-3d {
          text-shadow:
            0 1px 0 ${secondaryColor},
            0 2px 0 ${secondaryColor}cc,
            0 3px 0 ${secondaryColor}aa,
            0 4px 0 ${secondaryColor}88,
            0 5px 10px ${primaryColor}40,
            0 10px 20px ${primaryColor}20;
        }

        .glass-morph-3d {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            inset 0 0 20px ${primaryColor}10;
        }

        .depth-shadow {
          box-shadow:
            0 10px 30px ${primaryColor}40,
            0 20px 60px ${secondaryColor}30,
            0 30px 90px ${accentColor}20;
        }

        .geometric-pattern {
          background-image:
            linear-gradient(30deg, ${primaryColor}10 12%, transparent 12.5%, transparent 87%, ${primaryColor}10 87.5%),
            linear-gradient(150deg, ${secondaryColor}10 12%, transparent 12.5%, transparent 87%, ${secondaryColor}10 87.5%),
            linear-gradient(30deg, ${accentColor}10 12%, transparent 12.5%, transparent 87%, ${accentColor}10 87.5%);
          background-size: 80px 140px;
          background-position: 0 0, 40px 70px, 80px 140px;
        }
      `}</style>

      <div className="parallax-3d min-h-screen relative overflow-hidden geometric-pattern">
        {/* Floating 3D cubes */}
        <div className="layer-back fixed inset-0 pointer-events-none">
          <div className="cube-3d absolute top-20 left-10" style={{ animationDelay: '0s' }}>
            <div className="cube-face cube-front"></div>
            <div className="cube-face cube-back"></div>
            <div className="cube-face cube-right"></div>
            <div className="cube-face cube-left"></div>
            <div className="cube-face cube-top"></div>
            <div className="cube-face cube-bottom"></div>
          </div>

          <div className="cube-3d absolute bottom-20 right-20" style={{ animationDelay: '-10s' }}>
            <div className="cube-face cube-front"></div>
            <div className="cube-face cube-back"></div>
            <div className="cube-face cube-right"></div>
            <div className="cube-face cube-left"></div>
            <div className="cube-face cube-top"></div>
            <div className="cube-face cube-bottom"></div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="layer-middle relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-7xl">

            <div className="text-center mb-16">
              <div className="floating-3d inline-block mb-6 px-8 py-3 rounded-full gradient-3d">
                <span className="text-white font-bold uppercase tracking-wider text-sm">
                  Événement 2024
                </span>
              </div>

              <h1 className="text-6xl md:text-9xl font-black text-white text-3d mb-8 leading-tight">
                {config?.customization?.heroTitle || event.nom}
              </h1>

              <div
                className="text-2xl text-white/80 mb-12 leading-relaxed max-w-4xl mx-auto"
                dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

              {/* Left: Info Cards with 3D effect */}
              <div className="space-y-8">
                <div className="card-3d glass-morph-3d rounded-3xl p-8 depth-shadow">
                  <div className="card-3d-inner flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl gradient-3d flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                        Date & Heure
                      </div>
                      <div className="text-white font-bold text-xl">
                        {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        {new Date(event.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-3d glass-morph-3d rounded-3xl p-8 depth-shadow">
                  <div className="card-3d-inner flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl gradient-3d flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                        Localisation
                      </div>
                      <div className="text-white font-bold text-xl">
                        {event.lieu}
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        Centre-ville
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-3d glass-morph-3d rounded-3xl p-8 depth-shadow">
                  <div className="card-3d-inner flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl gradient-3d flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: accentColor }}>
                        Tarif
                      </div>
                      <div className="text-white font-bold text-xl">
                        {event.prix ? `${event.prix}€` : 'Gratuit'}
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        Inscription obligatoire
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration Form with 3D card */}
              <div className="layer-front">
                <div className="card-3d glass-morph-3d rounded-3xl p-10 depth-shadow">
                  <div className="card-3d-inner">
                    <div className="text-center mb-8">
                      <div className="floating-3d w-24 h-24 mx-auto mb-6 rounded-3xl gradient-3d flex items-center justify-center depth-shadow">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>

                      <h3 className="text-4xl font-black text-white mb-3">
                        Inscription
                      </h3>
                      <p className="text-white/70 text-lg">
                        Rejoignez l'aventure en 3D
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

        {/* Features Section */}
        <section className="layer-middle relative z-10 py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-black text-center mb-16 text-white text-3d">
              Une expérience en 3 dimensions
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="card-3d glass-morph-3d rounded-2xl p-8 text-center depth-shadow">
                <div className="card-3d-inner">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-3d flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Immersif</h3>
                  <p className="text-white/70">Plongez dans une expérience unique</p>
                </div>
              </div>

              <div className="card-3d glass-morph-3d rounded-2xl p-8 text-center depth-shadow">
                <div className="card-3d-inner">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-3d flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Interactif</h3>
                  <p className="text-white/70">Échangez et créez des liens</p>
                </div>
              </div>

              <div className="card-3d glass-morph-3d rounded-2xl p-8 text-center depth-shadow">
                <div className="card-3d-inner">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-3d flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Magique</h3>
                  <p className="text-white/70">Des moments inoubliables</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="layer-front relative z-10 py-12 px-4">
          <div className="container mx-auto text-center">
            <div className="glass-morph-3d inline-block rounded-2xl px-10 py-6">
              <p className="text-white/80 font-semibold">
                © {new Date().getFullYear()} - Événement en relief
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
