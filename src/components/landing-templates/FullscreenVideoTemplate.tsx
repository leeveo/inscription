'use client'

import React, { useState, useEffect } from 'react'
import LandingRegistrationForm from '@/components/ParticipantForm'

interface FullscreenVideoTemplateProps {
  eventData: any
  config: any
}

export default function FullscreenVideoTemplate({ eventData, config }: FullscreenVideoTemplateProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const primaryColor = config?.customization?.primaryColor || '#FF6B6B'
  const secondaryColor = config?.customization?.secondaryColor || '#4ECDC4'

  return (
    <>
      <style jsx>{`
        .video-overlay {
          background: linear-gradient(45deg, ${primaryColor}aa, ${secondaryColor}aa);
        }
        
        .cinematic-button {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .cinematic-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .modal-backdrop {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .fade-in {
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 50}px);
          transition: all 1.2s ease-out;
        }
        
        .stagger-1 { transition-delay: 0.2s; }
        .stagger-2 { transition-delay: 0.4s; }
        .stagger-3 { transition-delay: 0.6s; }
        .stagger-4 { transition-delay: 0.8s; }
        
        .text-shadow {
          text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.7);
        }
        
        .pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px ${primaryColor}66;
          }
          50% { 
            box-shadow: 0 0 40px ${primaryColor}99, 0 0 60px ${secondaryColor}66;
          }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Video Background */}
        <div className="fixed inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 video-overlay"></div>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              
              {/* Logo ou icône */}
              <div className="fade-in mb-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center pulse-glow">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
              </div>
              
              {/* Titre principal */}
              <div className="fade-in stagger-1 mb-6">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white text-shadow leading-tight">
                  {config?.customization?.heroTitle || eventData.nom}
                </h1>
              </div>
              
              {/* Sous-titre */}
              <div className="fade-in stagger-2 mb-12">
                <p className="text-xl md:text-2xl text-white/90 text-shadow max-w-3xl mx-auto leading-relaxed">
                  {config?.customization?.heroSubtitle || eventData.description}
                </p>
              </div>
              
              {/* Informations clés */}
              <div className="fade-in stagger-3 mb-12">
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                    <div className="flex items-center space-x-3 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold">{new Date(eventData.date_debut).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                    <div className="flex items-center space-x-3 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold">{eventData.lieu}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA Principal */}
              <div className="fade-in stagger-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="cinematic-button text-white font-bold text-xl px-12 py-6 rounded-full transition-all duration-300 hover:scale-105"
                >
                  {config?.customization?.ctaButtonText || "S'inscrire maintenant"}
                </button>
                
                <p className="text-white/80 mt-4 text-sm">
                  ✨ Inscription gratuite • Places limitées
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>

        {/* Modal d'inscription */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 modal-backdrop" onClick={() => setShowModal(false)}></div>
            
            <div className="relative bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Inscription
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <LandingRegistrationForm 
                eventId={eventData.id}
                onParticipantAdded={() => {
                  setShowModal(false)
                  // Optionally show success message
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
        
        {/* Section d'informations détaillées */}
        <div className="relative z-10 bg-gradient-to-b from-transparent to-black/90 py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Durée</h4>
                <p className="text-white/80">
                  Du {new Date(eventData.date_debut).toLocaleDateString('fr-FR')} au {new Date(eventData.date_fin).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Communauté</h4>
                <p className="text-white/80">
                  Rejoignez des passionnés du secteur
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Innovation</h4>
                <p className="text-white/80">
                  Découvrez les dernières tendances
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}