'use client'

import React, { useState, useEffect } from 'react'
import LandingRegistrationForm from '@/components/ParticipantForm'

interface Parallax3DTemplateProps {
  eventData: any
  config: any
}

export default function Parallax3DTemplate({ eventData, config }: Parallax3DTemplateProps) {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      })
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

  return (
    <>
      <style jsx>{`
        .parallax-container {
          perspective: 1000px;
          perspective-origin: 50% 50%;
        }
        
        .parallax-layer {
          transform-style: preserve-3d;
        }
        
        .layer-1 {
          transform: translateZ(${scrollY * 0.1}px) translateY(${scrollY * 0.2}px);
        }
        
        .layer-2 {
          transform: translateZ(${scrollY * 0.2}px) translateY(${scrollY * 0.1}px);
        }
        
        .layer-3 {
          transform: translateZ(${scrollY * 0.3}px) translateY(${scrollY * 0.05}px);
        }
        
        .mouse-parallax {
          transform: translateX(${mousePos.x * 20}px) translateY(${mousePos.y * 10}px);
          transition: transform 0.1s ease-out;
        }
        
        .floating-3d {
          transform: 
            rotateX(${mousePos.y * 5}deg) 
            rotateY(${mousePos.x * 5}deg) 
            translateZ(50px);
          transition: transform 0.2s ease-out;
        }
        
        .gradient-3d {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
        }
        
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        
        .card-3d:hover {
          transform: rotateY(5deg) rotateX(5deg) translateZ(20px);
        }
        
        .text-3d {
          text-shadow: 
            0 1px 0 #ccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25);
        }
        
        .geometric-bg {
          background-image: 
            linear-gradient(30deg, ${primaryColor}20 12%, transparent 12.5%, transparent 87%, ${primaryColor}20 87.5%, ${primaryColor}20),
            linear-gradient(150deg, ${primaryColor}20 12%, transparent 12.5%, transparent 87%, ${primaryColor}20 87.5%, ${primaryColor}20),
            linear-gradient(30deg, ${primaryColor}20 12%, transparent 12.5%, transparent 87%, ${primaryColor}20 87.5%, ${primaryColor}20),
            linear-gradient(150deg, ${primaryColor}20 12%, transparent 12.5%, transparent 87%, ${primaryColor}20 87.5%, ${primaryColor}20);
          background-size: 80px 140px;
          background-position: 0 0, 0 0, 40px 70px, 40px 70px;
        }
      `}</style>

      <div className="min-h-screen parallax-container overflow-hidden">
        {/* Background layers */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 gradient-3d opacity-90"></div>
          <div className="absolute inset-0 geometric-bg opacity-30"></div>
          
          {/* Floating geometric shapes */}
          <div className="layer-1 parallax-layer">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full mouse-parallax"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-white/15 transform rotate-45 mouse-parallax"></div>
            <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-white/20 rounded-full mouse-parallax"></div>
          </div>
          
          <div className="layer-2 parallax-layer">
            <div className="absolute top-60 right-10 w-20 h-20 border-2 border-white/20 rounded-full mouse-parallax"></div>
            <div className="absolute bottom-20 right-1/3 w-28 h-28 border-2 border-white/15 transform rotate-12 mouse-parallax"></div>
          </div>
          
          <div className="layer-3 parallax-layer">
            <div className="absolute top-1/3 left-1/2 w-6 h-6 bg-white/30 rounded-full mouse-parallax"></div>
            <div className="absolute bottom-1/3 left-10 w-12 h-12 border border-white/25 transform rotate-45 mouse-parallax"></div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              
              {/* Main Title with 3D effect */}
              <div className="floating-3d mb-8">
                <h1 className="text-6xl md:text-8xl font-black text-white text-3d leading-tight">
                  {config?.customization?.heroTitle || eventData.nom}
                </h1>
              </div>
              
              {/* Subtitle */}
              <div className="mouse-parallax mb-12">
                <div
                  className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || eventData.description }}
                />
              </div>
              
              {/* Info Cards with 3D hover */}
              <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
                <div className="card-3d bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 gradient-3d rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Date & Heure</h3>
                  <p className="text-white/80">
                    {new Date(eventData.date_debut).toLocaleDateString('fr-FR', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-white/70 text-sm mt-1">
                    {new Date(eventData.date_debut).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                <div className="card-3d bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 gradient-3d rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Localisation</h3>
                  <p className="text-white/80">{eventData.lieu}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Content */}
              <div className="mouse-parallax">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-3d">
                  Rejoignez l'aventure
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Une expérience unique vous attend. Ne manquez pas cette opportunité exceptionnelle de faire partie de quelque chose de grand.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 gradient-3d rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">Inscription gratuite</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 gradient-3d rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">Networking premium</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 gradient-3d rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">Certificat de participation</span>
                  </div>
                </div>
              </div>
              
              {/* Registration Form */}
              <div className="floating-3d">
                <div className="card-3d bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 gradient-3d rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Inscription
                    </h3>
                    <p className="text-gray-600">
                      Réservez votre place maintenant
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

        {/* Details Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white text-3d mb-4">
                Détails de l'événement
              </h2>
              <div className="w-24 h-1 gradient-3d mx-auto rounded-full"></div>
            </div>
            
            <div className="card-3d bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Programme</h3>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm">Début</p>
                      <p className="text-white font-semibold">{new Date(eventData.date_debut).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm">Fin</p>
                      <p className="text-white font-semibold">{new Date(eventData.date_fin).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">À propos</h3>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div
                      className="text-white/80 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: eventData.description }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="card-3d bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/60">
                © {new Date().getFullYear()} - Événement créé avec innovation
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}