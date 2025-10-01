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

export default function OnepageScrollTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const sections = ['hero', 'details', 'features', 'register']

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return
      e.preventDefault()

      setIsScrolling(true)

      if (e.deltaY > 0 && currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1)
      } else if (e.deltaY < 0 && currentSection > 0) {
        setCurrentSection(prev => prev - 1)
      }

      setTimeout(() => setIsScrolling(false), 800)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return

      if ((e.key === 'ArrowDown' || e.key === 'PageDown') && currentSection < sections.length - 1) {
        setIsScrolling(true)
        setCurrentSection(prev => prev + 1)
        setTimeout(() => setIsScrolling(false), 800)
      } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && currentSection > 0) {
        setIsScrolling(true)
        setCurrentSection(prev => prev - 1)
        setTimeout(() => setIsScrolling(false), 800)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSection, isScrolling, sections.length])

  const primaryColor = config?.customization?.primaryColor || '#8B5CF6'
  const secondaryColor = config?.customization?.secondaryColor || '#EC4899'
  const accentColor = config?.customization?.accentColor || '#F59E0B'
  const backgroundColor = config?.customization?.backgroundColor || '#1F2937'

  const navigateToSection = (index: number) => {
    if (isScrolling) return
    setIsScrolling(true)
    setCurrentSection(index)
    setTimeout(() => setIsScrolling(false), 800)
  }

  return (
    <>
      <style jsx>{`
        .scroll-container {
          transform: translateY(-${currentSection * 100}vh);
          transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        .section-active {
          animation: section-fade-in 0.8s ease-out forwards;
        }

        @keyframes section-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .gradient-animated {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor});
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .dot-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${backgroundColor};
          border: 2px solid white;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .dot-indicator.active {
          width: 14px;
          height: 14px;
          background: ${primaryColor};
          box-shadow: 0 0 20px ${primaryColor};
        }

        .dot-indicator:hover {
          transform: scale(1.2);
        }

        .fullscreen-section {
          background: ${backgroundColor};
        }

        .section-title {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .glow-card:hover {
          box-shadow: 0 8px 32px ${primaryColor}40;
          transform: translateY(-5px);
        }

        .scroll-indicator {
          animation: bounce-smooth 2s ease-in-out infinite;
        }

        @keyframes bounce-smooth {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        .number-badge {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          box-shadow: 0 4px 15px ${primaryColor}60;
        }

        .progress-circle {
          stroke-dasharray: 339;
          stroke-dashoffset: ${339 - (339 * ((currentSection + 1) / sections.length))};
          transition: stroke-dashoffset 0.8s ease;
        }

        .floating-shapes {
          animation: float-shapes 6s ease-in-out infinite;
        }

        @keyframes float-shapes {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(-10px) rotate(-5deg); }
        }

        .highlight-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px ${accentColor}40; }
          50% { box-shadow: 0 0 40px ${accentColor}80; }
        }
      `}</style>

      <div className="h-screen overflow-hidden relative fullscreen-section">
        {/* Navigation Dots */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-6">
          {sections.map((section, index) => (
            <div key={section} className="flex items-center gap-3">
              <span className={`text-white text-xs font-semibold transition-all ${currentSection === index ? 'opacity-100' : 'opacity-0'}`}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </span>
              <button
                onClick={() => navigateToSection(index)}
                className={`dot-indicator ${currentSection === index ? 'active' : ''}`}
                aria-label={`Go to ${section}`}
              />
            </div>
          ))}
        </div>

        {/* Progress Circle */}
        <div className="fixed top-8 right-8 z-50">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={primaryColor}
              strokeWidth="4"
              fill="none"
              className="progress-circle"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{currentSection + 1}/{sections.length}</span>
          </div>
        </div>

        {/* Sections Container */}
        <div className="scroll-container">

          {/* Section 1: Hero */}
          <section className="h-screen flex items-center justify-center relative overflow-hidden">
            <div className="gradient-animated absolute inset-0 opacity-90"></div>

            {/* Floating shapes */}
            <div className="floating-shapes absolute top-20 left-10 w-32 h-32 rounded-full" style={{ background: `${accentColor}20`, border: `2px solid ${accentColor}` }}></div>
            <div className="floating-shapes absolute bottom-20 right-20 w-40 h-40" style={{ background: `${primaryColor}20`, border: `2px solid ${primaryColor}`, animationDelay: '-2s' }}></div>

            <div className="container mx-auto px-4 text-center relative z-10 section-active">
              <div className="number-badge w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-8">
                01
              </div>

              <h1 className="text-7xl md:text-9xl font-black text-white mb-8 leading-tight">
                {config?.customization?.heroTitle || event.nom}
              </h1>

              <div
                className="text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto"
                dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
              />

              <div className="scroll-indicator">
                <svg className="w-8 h-8 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </section>

          {/* Section 2: Details */}
          <section className="h-screen flex items-center justify-center relative fullscreen-section">
            <div className="container mx-auto px-4 relative z-10 section-active">
              <div className="number-badge w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-12">
                02
              </div>

              <h2 className="text-5xl md:text-7xl font-bold text-center mb-16 section-title">
                Informations essentielles
              </h2>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="glow-card rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl gradient-animated mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Date</h3>
                  <p className="text-white/80 font-semibold text-lg">
                    {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-white/60 mt-2">
                    {new Date(event.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(event.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="glow-card rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl gradient-animated mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Lieu</h3>
                  <p className="text-white/80 font-semibold text-lg">{event.lieu}</p>
                  <p className="text-white/60 mt-2">Accès facile</p>
                </div>

                <div className="glow-card rounded-3xl p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl gradient-animated mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Places</h3>
                  <p className="text-white/80 font-semibold text-lg">
                    {event.places_disponibles || 'Limitées'}
                  </p>
                  <p className="text-white/60 mt-2">Réservation conseillée</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Features */}
          <section className="h-screen flex items-center justify-center relative fullscreen-section">
            <div className="container mx-auto px-4 relative z-10 section-active">
              <div className="number-badge w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-12">
                03
              </div>

              <h2 className="text-5xl md:text-7xl font-bold text-center mb-16 section-title">
                Pourquoi participer ?
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                  { icon: '🎯', title: 'Excellence', desc: 'Contenus de qualité exceptionnelle' },
                  { icon: '💡', title: 'Innovation', desc: 'Découvrez les dernières tendances' },
                  { icon: '🤝', title: 'Réseau', desc: 'Rencontrez des experts du domaine' },
                  { icon: '🎓', title: 'Apprentissage', desc: 'Développez vos compétences' }
                ].map((feature, index) => (
                  <div key={index} className="glow-card rounded-2xl p-8 text-center highlight-pulse">
                    <div className="text-6xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4: Register */}
          <section className="h-screen flex items-center justify-center relative fullscreen-section">
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto section-active">

                <div className="text-white">
                  <div className="number-badge w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-8">
                    04
                  </div>

                  <h2 className="text-5xl md:text-7xl font-black mb-8 section-title">
                    Prêt à démarrer ?
                  </h2>

                  <p className="text-2xl text-white/80 mb-8 leading-relaxed">
                    Rejoignez-nous pour une expérience inoubliable. L'inscription est rapide et simple.
                  </p>

                  <div className="space-y-4">
                    {['Confirmation instantanée', 'Accès prioritaire', 'Support dédié'].map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full gradient-animated flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-white/90 text-lg font-semibold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glow-card rounded-3xl p-10 highlight-pulse">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl gradient-animated mx-auto mb-6 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-2">
                      Inscription
                    </h3>
                    <p className="text-white/70">
                      Votre aventure commence ici
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
          </section>

        </div>
      </div>
    </>
  )
}
