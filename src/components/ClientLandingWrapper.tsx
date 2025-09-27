'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import LandingRegistrationForm from '@/components/LandingRegistrationForm'
import TemplateWrapper from '@/components/TemplateWrapper'

interface ClientLandingWrapperProps {
  templateId: string;
  customization: any;
  event: any;
  participantData: any;
  eventId: string;
  token: string | null;
}

// Fonction pour rendre le contenu selon le template
function renderTemplateContent(templateId: string, event: any, participantData: any, customization: any, eventId: string, token: string | null) {
  const registrationForm = (
    <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>}>
      <LandingRegistrationForm 
        eventId={eventId} 
        participantData={participantData}
        token={token}
      />
    </Suspense>
  );

  // Titre et sous-titre personnalisés ou par défaut
  const heroTitle = customization.heroTitle || event.nom;
  const heroSubtitle = customization.heroSubtitle || event.description;
  const buttonText = customization.ctaButtonText || 'S\'inscrire maintenant';
  
  // Logo : priorité à l'event.logo_url, puis customization.logoUrl
  const logoUrl = event.logo_url || customization.logoUrl;
  
  // Debug: afficher les données dans la console
  console.log('Event data:', event);
  console.log('Logo URL from event:', event.logo_url);
  console.log('Logo URL from customization:', customization.logoUrl);
  console.log('Final logo URL:', logoUrl);

  switch (templateId) {
    case 'modern-gradient':
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8">
              {logoUrl && (
                <Image 
                  src={logoUrl} 
                  alt="Logo de l'événement" 
                  width={64}
                  height={64}
                  className="mx-auto mb-6 object-contain"
                />
              )}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
                {heroSubtitle}
              </p>
            </div>
            <div className="form-container p-8 mx-auto max-w-2xl">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background avec effets */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm animate-pulse"></div>
            <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm animate-pulse"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl w-full">
            <div className="text-center mb-8">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-6"
                />
              )}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
                {heroSubtitle}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mx-auto max-w-2xl border border-white/30">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'neomorphism':
      return (
        <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-8"
                />
              )}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                {heroSubtitle}
              </p>
            </div>
            <div className="bg-gray-200 rounded-3xl p-8 mx-auto max-w-2xl" style={{
              boxShadow: '20px 20px 60px #d1d5db, -20px -20px 60px #ffffff'
            }}>
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'fullscreen-video':
      return (
        <div className="min-h-screen relative overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-blue-900/70 to-purple-900/70"></div>
          </div>
          
          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-8"
                />
              )}
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-12 drop-shadow-lg">
                {heroSubtitle}
              </p>
              
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 mx-auto max-w-2xl shadow-2xl">
                {registrationForm}
              </div>
            </div>
          </div>
        </div>
      );

    case 'parallax-3d':
      return (
        <div className="min-h-screen relative overflow-hidden" style={{ perspective: '1000px' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
          
          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-6xl w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  {logoUrl && (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-16 mx-auto lg:mx-0 mb-8"
                    />
                  )}
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-xl">
                    {heroTitle}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
                    {heroSubtitle}
                  </p>
                </div>
                
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  {registrationForm}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'onepage-scroll':
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-20 mx-auto mb-8 brightness-0 invert"
                />
              )}
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
                {heroSubtitle}
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 mx-auto max-w-2xl shadow-2xl">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'classic-business':
      return (
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-20 mx-auto mb-8"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-6">
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                {heroSubtitle}
              </p>
            </div>
            <div className="form-container p-10 mx-auto max-w-2xl">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'minimal-clean':
      return (
        <div className="min-h-screen py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-12 mx-auto mb-12"
                />
              )}
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
                {heroTitle}
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-12">
                {heroSubtitle}
              </p>
            </div>
            <div className="form-container p-8 mx-auto max-w-lg">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'creative-event':
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-12">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-20 mx-auto mb-8 drop-shadow-lg"
                />
              )}
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg transform rotate-1">
                {heroTitle}
              </h1>
              <p className="text-xl md:text-3xl text-white/95 mb-10 drop-shadow font-bold">
                {heroSubtitle}
              </p>
            </div>
            <div className="form-container p-10 mx-auto max-w-2xl transform -rotate-1">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'conference-pro':
      return (
        <div className="min-h-screen py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-16 mb-8"
                  />
                )}
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  {heroTitle}
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  {heroSubtitle}
                </p>
                {participantData && (
                  <div className="bg-blue-600/20 p-4 rounded-lg mb-6">
                    <p className="text-white">
                      Bonjour {participantData.prenom} {participantData.nom}! 
                      Votre inscription personnalisée vous attend.
                    </p>
                  </div>
                )}
              </div>
              <div className="form-container p-8">
                {registrationForm}
              </div>
            </div>
          </div>
        </div>
      );

    case 'tech-startup':
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-6xl w-full">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="mb-8">
                  {logoUrl && (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-12 mb-6 brightness-0 invert"
                    />
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono">
                    {heroTitle}
                  </h1>
                  <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-400 mb-6"></div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {heroSubtitle}
                  </p>
                </div>
              </div>
              <div className="form-container p-10">
                {registrationForm}
              </div>
            </div>
          </div>
        </div>
      );

    case 'elegant-gala':
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl w-full text-center">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-20 mx-auto mb-8 brightness-0 invert"
              />
            )}
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-wide">
              {heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 font-serif italic">
              {heroSubtitle}
            </p>
            <div className="form-container p-12 mx-auto max-w-2xl">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'festival-fun':
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl w-full text-center">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-24 mx-auto mb-8 drop-shadow-2xl"
              />
            )}
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 drop-shadow-lg transform hover:scale-105 transition-transform">
              {heroTitle}
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-12 drop-shadow font-bold">
              {heroSubtitle}
            </p>
            <div className="form-container p-12 mx-auto max-w-2xl">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    case 'workshop-learning':
      return (
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-16 mx-auto mb-8"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                {heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {heroSubtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                <div className="text-green-600 text-2xl mb-3">📚</div>
                <h3 className="font-semibold text-gray-800 mb-2">Apprentissage</h3>
                <p className="text-sm text-gray-600">Contenu de qualité et exercices pratiques</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                <div className="text-blue-600 text-2xl mb-3">🤝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Networking</h3>
                <p className="text-sm text-gray-600">Rencontrez des experts et professionnels</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                <div className="text-purple-600 text-2xl mb-3">🏆</div>
                <h3 className="font-semibold text-gray-800 mb-2">Certificat</h3>
                <p className="text-sm text-gray-600">Obtenez votre certificat de participation</p>
              </div>
            </div>
            <div className="form-container p-8 mx-auto max-w-2xl">
              {registrationForm}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{heroTitle}</h1>
              <p className="text-xl text-gray-600 mb-8">{heroSubtitle}</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              {registrationForm}
            </div>
          </div>
        </div>
      );
  }
}

export default function ClientLandingWrapper({ 
  templateId, 
  customization, 
  event, 
  participantData, 
  eventId, 
  token 
}: ClientLandingWrapperProps) {
  // Debug: afficher les props reçues
  console.log('=== ClientLandingWrapper Props ===')
  console.log('participantData:', participantData)
  console.log('token:', token)
  console.log('eventId:', eventId)
  console.log('participantData exists:', !!participantData)
  console.log('=== Fin ClientLandingWrapper Props ===')

  const templateContent = renderTemplateContent(templateId, event, participantData, customization, eventId, token);

  return (
    <TemplateWrapper templateId={templateId} customization={customization}>
      {templateContent}
    </TemplateWrapper>
  );
}
