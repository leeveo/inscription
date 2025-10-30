import React from 'react'
import { CalendarIcon, MapPinIcon, ClockIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'

interface TemplateProps {
  event: any
  customization: any
  participantData?: any
  registrationForm: React.ReactNode
}

export default function ModernGradientTemplate({
  event,
  customization,
  participantData,
  registrationForm
}: TemplateProps) {
  const primaryColor = customization.primaryColor || '#3B82F6'
  const secondaryColor = customization.secondaryColor || '#1E40AF'
  const backgroundColor = customization.backgroundColor || '#F8FAFC'
  const textColor = customization.textColor || '#1F2937'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit'
    return `${price}€`
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Hero Section avec gradient */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {event.nom}
            </h1>
            
            {event.description && (
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                {event.description}
              </p>
            )}
            
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              <span className="text-sm font-medium">
                {participantData ? `Bienvenue ${participantData.prenom}` : 'Inscription ouverte'}
              </span>
              {!participantData && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white bg-opacity-10 rounded-full"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Event Details */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
                Détails de l'événement
              </h2>
              
              <div className="space-y-6">
                {event.date_debut && (
                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <CalendarIcon className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Date de début</h3>
                      <p className="text-gray-600">{formatDate(event.date_debut)}</p>
                    </div>
                  </div>
                )}

                {event.date_fin && event.date_fin !== event.date_debut && (
                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <ClockIcon className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Date de fin</h3>
                      <p className="text-gray-600">{formatDate(event.date_fin)}</p>
                    </div>
                  </div>
                )}

                {event.lieu && (
                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <MapPinIcon className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Lieu</h3>
                      <p className="text-gray-600">{event.lieu}</p>
                    </div>
                  </div>
                )}

                {typeof event.prix !== 'undefined' && (
                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <CurrencyEuroIcon className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Prix</h3>
                      <p className="text-gray-600 text-xl font-bold">{formatPrice(event.prix)}</p>
                    </div>
                  </div>
                )}

                {event.organisateur && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900">Organisé par</h3>
                    <p className="text-gray-600">{event.organisateur}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pourquoi participer ?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Networking avec des professionnels</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Contenu exclusif et expertise</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Opportunités de collaboration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700">Certificat de participation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
                  {participantData ? 'Confirmer votre participation' : 'Inscription'}
                </h2>
                <p className="text-gray-600">
                  {participantData 
                    ? 'Vos informations sont pré-remplies, cliquez pour confirmer'
                    : 'Réservez votre place dès maintenant'
                  }
                </p>
              </div>

              {registrationForm}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Une question ?</h3>
            <p className="text-gray-400 mb-4">
              Contactez notre équipe pour plus d'informations
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:contact@exemple.com" className="text-blue-400 hover:text-blue-300">
                Email
              </a>
              <a href="tel:+33123456789" className="text-blue-400 hover:text-blue-300">
                Téléphone
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}