'use client'

import React, { useState, useEffect } from 'react'
import LandingRegistrationForm from '@/components/ParticipantForm'

interface NeomorphismTemplateProps {
  eventData: any
  config: any
}

export default function NeomorphismTemplate({ eventData, config }: NeomorphismTemplateProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const primaryColor = config?.customization?.primaryColor || '#E2E8F0'
  const secondaryColor = config?.customization?.secondaryColor || '#94A3B8'

  return (
    <>
      <style jsx>{`
        .neo-bg {
          background: linear-gradient(145deg, #f0f4f8, #e2e8f0);
        }
        
        .neo-card {
          background: #f1f5f9;
          border-radius: 20px;
          box-shadow: 
            20px 20px 60px #d1d5db,
            -20px -20px 60px #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        
        .neo-inset {
          background: #f1f5f9;
          border-radius: 15px;
          box-shadow: 
            inset 8px 8px 16px #d1d5db,
            inset -8px -8px 16px #ffffff;
        }
        
        .neo-button {
          background: linear-gradient(145deg, ${primaryColor}, ${secondaryColor});
          border-radius: 15px;
          box-shadow: 
            8px 8px 16px #d1d5db,
            -8px -8px 16px #ffffff;
          border: none;
          transition: all 0.3s ease;
          color: #1e293b;
          font-weight: 600;
        }
        
        .neo-button:hover {
          box-shadow: 
            4px 4px 8px #d1d5db,
            -4px -4px 8px #ffffff;
          transform: translateY(2px);
        }
        
        .neo-button:active {
          box-shadow: 
            inset 4px 4px 8px #d1d5db,
            inset -4px -4px 8px #ffffff;
        }
        
        .floating-icon {
          animation: float-soft 4s ease-in-out infinite;
        }
        
        .floating-icon:nth-child(2) {
          animation-delay: -1s;
        }
        
        .floating-icon:nth-child(3) {
          animation-delay: -2s;
        }
        
        @keyframes float-soft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .fade-in {
          opacity: ${isVisible ? 1 : 0};
          transform: translateY(${isVisible ? 0 : 30}px);
          transition: all 0.8s ease-out;
        }
        
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        
        .gradient-text {
          background: linear-gradient(135deg, #1e293b, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="min-h-screen neo-bg">
        {/* Éléments flottants décoratifs */}
        <div className="floating-icon fixed top-20 right-20 w-16 h-16 neo-card flex items-center justify-center opacity-60">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="floating-icon fixed top-40 left-10 w-12 h-12 neo-card flex items-center justify-center opacity-40">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        
        <div className="floating-icon fixed bottom-32 right-10 w-14 h-14 neo-card flex items-center justify-center opacity-50">
          <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        {/* Contenu principal */}
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Contenu textuel */}
                <div className="text-center lg:text-left">
                  <div className="fade-in stagger-1">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text leading-tight">
                      {config?.customization?.heroTitle || eventData.nom}
                    </h1>
                  </div>
                  
                  <div className="fade-in stagger-2">
                    <div
                      className="text-xl text-slate-600 mb-8 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: config?.customization?.heroSubtitle || eventData.description }}
                    />
                  </div>
                  
                  <div className="fade-in stagger-3 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="neo-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="neo-inset w-12 h-12 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-medium">Date</div>
                          <div className="text-slate-700 font-semibold">{new Date(eventData.date_debut).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="neo-card p-6">
                      <div className="flex items-center space-x-4">
                        <div className="neo-inset w-12 h-12 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-medium">Lieu</div>
                          <div className="text-slate-700 font-semibold">{eventData.lieu}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulaire d'inscription */}
                <div className="fade-in stagger-4">
                  <div className="neo-card p-8">
                    <div className="mb-6 text-center">
                      <div className="neo-inset w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-700 mb-2">
                        Inscription
                      </h3>
                      <p className="text-slate-500">
                        Rejoignez-nous pour cet événement unique
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

          {/* Section informations */}
          <section className="py-20">
            <div className="max-w-4xl mx-auto">
              <div className="fade-in text-center mb-12">
                <h2 className="text-4xl font-bold gradient-text mb-4">
                  Informations détaillées
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-slate-400 to-slate-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="neo-card p-8">
                  <div className="neo-inset w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Horaires</h3>
                  <div className="space-y-3">
                    <div className="neo-inset p-4 rounded-xl">
                      <p className="text-sm text-slate-500">Début</p>
                      <p className="font-semibold text-slate-700">{new Date(eventData.date_debut).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="neo-inset p-4 rounded-xl">
                      <p className="text-sm text-slate-500">Fin</p>
                      <p className="font-semibold text-slate-700">{new Date(eventData.date_fin).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="neo-card p-8">
                  <div className="neo-inset w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-4 text-center">Localisation</h3>
                  <div className="neo-inset p-6 rounded-xl text-center">
                    <p className="text-slate-600 leading-relaxed">{eventData.lieu}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 neo-card p-8">
                <div className="neo-inset w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-6 text-center">À propos de l'événement</h3>
                <div className="neo-inset p-6 rounded-xl">
                  <div
                    className="text-slate-600 leading-relaxed text-center"
                    dangerouslySetInnerHTML={{ __html: eventData.description }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 text-center">
            <div className="neo-card p-6 max-w-md mx-auto">
              <p className="text-slate-500">
                © {new Date().getFullYear()} - Événement organisé avec passion
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}