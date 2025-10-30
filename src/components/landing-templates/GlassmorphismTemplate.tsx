'use client'

import React, { useState, useEffect } from 'react'
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
  logo_url?: string
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

export default function GlassmorphismTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  const { customization } = config
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const primaryColor = config?.customization?.primaryColor || '#8B5CF6'
  const secondaryColor = config?.customization?.secondaryColor || '#06B6D4'

  return (
    <>
      <style jsx>{`
        .glassmorphism-bg {
          background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}25);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-button {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
        
        .floating-element:nth-child(2) {
          animation-delay: -2s;
        }
        
        .floating-element:nth-child(3) {
          animation-delay: -4s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(2deg); }
          66% { transform: translateY(-10px) rotate(-2deg); }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .parallax-bg {
          transform: translateY(${scrollY * 0.5}px);
        }
        
        .fade-in {
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 50}px);
          transition: all 1s ease-out;
        }
        
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background avec effets */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
          
          {/* Éléments flottants */}
          <div className="floating-element absolute top-20 left-10 w-32 h-32 rounded-full glass-card opacity-20"></div>
          <div className="floating-element absolute top-40 right-20 w-24 h-24 rounded-full glass-card opacity-30"></div>
          <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 rounded-full glass-card opacity-15"></div>
          
          {/* Effet de grille */}
          <div 
            className="parallax-bg absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, ${primaryColor} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Contenu textuel */}
                <div className="text-center lg:text-left">
                  <div className="fade-in stagger-1">
                    <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
                      <span className="gradient-text">
                        {config?.customization?.heroTitle || event.nom}
                      </span>
                    </h1>
                  </div>
                  
                  <div className="fade-in stagger-2">
                    <div
                      className="text-xl md:text-2xl text-white/80 mb-8 font-light"
                      dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || event.description }}
                    />
                  </div>
                  
                  <div className="fade-in stagger-3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center space-x-3 text-white/90">
                        <div className="w-10 h-10 rounded-full glass-button flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm opacity-70">Date</div>
                          <div className="font-semibold">{new Date(event.date_debut).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card rounded-lg p-4">
                      <div className="flex items-center space-x-3 text-white/90">
                        <div className="w-10 h-10 rounded-full glass-button flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm opacity-70">Lieu</div>
                          <div className="font-semibold">{event.lieu}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulaire d'inscription */}
                <div className="fade-in stagger-4">
                  <div className="glass-card rounded-3xl p-8 backdrop-blur-xl">
                    <div className="mb-6 text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Réservez votre place
                      </h3>
                      <p className="text-white/70">
                        Inscription gratuite et sécurisée
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

          {/* Section détails de l'événement */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="glass-card rounded-3xl p-8 md:p-12">
                <h2 className="text-4xl font-bold text-white mb-8 text-center gradient-text">
                  Détails de l'événement
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">📅 Programme</h3>
                    <div className="space-y-2 text-white/80">
                      <p><strong>Début :</strong> {new Date(event.date_debut).toLocaleString('fr-FR')}</p>
                      <p><strong>Fin :</strong> {new Date(event.date_fin).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">📍 Localisation</h3>
                    <p className="text-white/80">{event.lieu}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="glass-card rounded-2xl p-6">
                <p className="text-white/60">
                  © {new Date().getFullYear()} - Événement organisé avec ❤️
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}