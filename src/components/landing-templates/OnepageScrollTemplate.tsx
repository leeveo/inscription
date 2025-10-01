'use client'

import React, { useState, useEffect } from 'react'
import LandingRegistrationForm from '@/components/ParticipantForm'

interface OnepageScrollTemplateProps {
  eventData: any
  config: any
}

export default function OnepageScrollTemplate({ eventData, config }: OnepageScrollTemplateProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const sections = ['hero', 'about', 'details', 'register']
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      if (isScrolling) return
      
      setIsScrolling(true)
      
      if (e.deltaY > 0 && currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1)
      } else if (e.deltaY < 0 && currentSection > 0) {
        setCurrentSection(currentSection - 1)
      }
      
      setTimeout(() => setIsScrolling(false), 1000)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return
      
      if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
        setIsScrolling(true)
        setCurrentSection(currentSection + 1)
        setTimeout(() => setIsScrolling(false), 1000)
      } else if (e.key === 'ArrowUp' && currentSection > 0) {
        setIsScrolling(true)
        setCurrentSection(currentSection - 1)
        setTimeout(() => setIsScrolling(false), 1000)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSection, isScrolling, sections.length])

  const primaryColor = config?.customization?.primaryColor || '#6366F1'
  const secondaryColor = config?.customization?.secondaryColor || '#EC4899'

  const navigateToSection = (index: number) => {
    if (isScrolling) return
    setIsScrolling(true)
    setCurrentSection(index)
    setTimeout(() => setIsScrolling(false), 1000)
  }

  return (
    <>
      <style jsx>{`
        .scroll-container {
          transform: translateY(-${currentSection * 100}vh);
          transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .gradient-primary {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
        }
        
        .gradient-secondary {
          background: linear-gradient(45deg, ${secondaryColor}, ${primaryColor});
        }
        
        .animate-float {
          animation: float-smooth 3s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-smooth 3s ease-in-out infinite;
          animation-delay: -1.5s;
        }
        
        @keyframes float-smooth {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        .section-enter {
          animation: sectionEnter 0.8s ease-out forwards;
        }
        
        @keyframes sectionEnter {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        
        .typewriter {
          overflow: hidden;
          border-right: 3px solid;
          white-space: nowrap;
          animation: 
            typewriter 3s steps(40) 1s forwards,
            blink 1s infinite;
        }
        
        @keyframes typewriter {
          from { width: 0 }
          to { width: 100% }
        }
        
        @keyframes blink {
          0%, 50% { border-color: transparent }
          51%, 100% { border-color: white }
        }
      `}</style>

      <div className="h-screen overflow-hidden relative">
        {/* Navigation dots */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => navigateToSection(index)}
                className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                  currentSection === index 
                    ? 'bg-white scale-150' 
                    : 'bg-transparent hover:bg-white/50'
                }`}
                title={section}
              />
            ))}
          </div>
        </div>

        {/* Sections container */}
        <div className="scroll-container">
          
          {/* Hero Section */}
          <section className="h-screen flex items-center justify-center gradient-primary relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="animate-float absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="animate-float-delay absolute top-40 right-32 w-24 h-24 bg-white/20 rounded-full"></div>
              <div className="animate-float absolute bottom-32 left-1/3 w-16 h-16 bg-white/15 rounded-full"></div>
            </div>
            
            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="section-enter">
                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 typewriter">
                  {config?.customization?.heroTitle || eventData.nom}
                </h1>
                <div
                  className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || eventData.description }}
                />
                
                {/* Animated arrow */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="pulse-ring absolute inset-0 w-8 h-8 bg-white/30 rounded-full"></div>
                    <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mt-2">Faites défiler</p>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="section-enter">
                  <h2 className="text-5xl font-bold text-white mb-8">
                    À propos de l'événement
                  </h2>
                  <div
                    className="text-xl text-white/80 leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: eventData.description }}
                  />
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Innovation</h3>
                        <p className="text-white/70">Découvrez les dernières tendances</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Networking</h3>
                        <p className="text-white/70">Rencontrez des professionnels</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Inspiration</h3>
                        <p className="text-white/70">Repartez avec de nouvelles idées</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="section-enter">
                  <div className="relative">
                    <div className="w-80 h-80 gradient-primary rounded-full mx-auto opacity-20 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 gradient-secondary rounded-full mx-auto mb-4 flex items-center justify-center animate-float">
                          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z" />
                          </svg>
                        </div>
                        <p className="text-white/60">Expérience immersive</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Details Section */}
          <section className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 section-enter">
                <h2 className="text-5xl font-bold text-white mb-4">
                  Informations pratiques
                </h2>
                <div className="w-24 h-1 gradient-primary mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="section-enter bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center">
                  <div className="w-20 h-20 gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Date & Heure</h3>
                  <div className="space-y-2">
                    <p className="text-white/90 font-semibold">
                      {new Date(eventData.date_debut).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-white/70">
                      De {new Date(eventData.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      à {new Date(eventData.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className="section-enter bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center">
                  <div className="w-20 h-20 gradient-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Lieu</h3>
                  <p className="text-white/90">{eventData.lieu}</p>
                </div>
                
                <div className="section-enter bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center">
                  <div className="w-20 h-20 gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Tarif</h3>
                  <p className="text-2xl font-bold text-white mb-2">Gratuit</p>
                  <p className="text-white/70 text-sm">Inscription obligatoire</p>
                </div>
              </div>
            </div>
          </section>

          {/* Registration Section */}
          <section className="h-screen flex items-center justify-center gradient-secondary relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="animate-float absolute top-32 right-20 w-40 h-40 bg-white/5 rounded-full"></div>
              <div className="animate-float-delay absolute bottom-40 left-32 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                
                <div className="section-enter text-center lg:text-left">
                  <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
                    Prêt à nous rejoindre ?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    L'inscription ne prend que quelques minutes. Rejoignez une communauté passionnée et vivez une expérience inoubliable.
                  </p>
                  
                  <div className="flex items-center justify-center lg:justify-start space-x-8 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">100+</div>
                      <div className="text-white/70 text-sm">Participants</div>
                    </div>
                    <div className="w-px h-12 bg-white/30"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">5★</div>
                      <div className="text-white/70 text-sm">Satisfaction</div>
                    </div>
                    <div className="w-px h-12 bg-white/30"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">Gratuit</div>
                      <div className="text-white/70 text-sm">Inscription</div>
                    </div>
                  </div>
                </div>
                
                <div className="section-enter">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Inscription gratuite
                      </h3>
                      <p className="text-gray-600">
                        Quelques informations suffisent
                      </p>
                    </div>
                    
                    <LandingRegistrationForm 
                      eventId={eventData.id}
                      onParticipantAdded={() => {}}
                      onCancel={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}