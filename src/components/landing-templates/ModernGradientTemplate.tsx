'use client'

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

export default function ModernGradientTemplate({ 
  event, 
  config, 
  onRegistrationSuccess, 
  registrationSuccess,
  isPreview = false,
  participantData,
  token
}: LandingTemplateProps) {
  const { customization } = config

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

  const gradientStyle = {
    background: `linear-gradient(135deg, ${customization.primaryColor}22 0%, ${customization.secondaryColor}22 100%)`
  }

  const buttonStyle = {
    backgroundColor: customization.primaryColor,
    borderColor: customization.primaryColor
  }

  const accentStyle = {
    color: customization.primaryColor
  }

  return (
    <div className="min-h-screen" style={gradientStyle}>
      {/* Custom CSS */}
      {customization.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customization.customCSS }} />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {customization.backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${customization.backgroundImage})` }}
          ></div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            {(event.logo_url || customization.logoUrl) && (
              <div className="mb-8">
                <img 
                  src={event.logo_url || customization.logoUrl} 
                  alt={`Logo ${event.nom}`} 
                  className="h-16 mx-auto"
                />
              </div>
            )}

            {/* Hero Content */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {customization.heroTitle || event.nom}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              {customization.heroSubtitle || event.description}
            </p>

            {/* Hero Image */}
            {customization.heroImage && (
              <div className="mb-8">
                <img 
                  src={customization.heroImage} 
                  alt="Event Hero" 
                  className="max-w-2xl mx-auto rounded-lg shadow-2xl"
                />
              </div>
            )}

            {/* Event Details Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <div className="text-2xl mb-2" style={accentStyle}>📅</div>
                <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
                <p className="text-gray-600">{formatDate(event.date_debut)}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <div className="text-2xl mb-2" style={accentStyle}>📍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Lieu</h3>
                <p className="text-gray-600">{event.lieu}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <div className="text-2xl mb-2" style={accentStyle}>💰</div>
                <h3 className="font-semibold text-gray-900 mb-2">Prix</h3>
                <p className="text-gray-600">
                  {event.prix ? `${event.prix}€` : 'Gratuit'}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <a 
              href="#inscription"
              className="inline-block px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
              style={buttonStyle}
            >
              {customization.ctaButtonText || "S'inscrire maintenant"}
            </a>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              À propos de l'événement
            </h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: customization.primaryColor }}></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Info Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations pratiques</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center mr-3" style={{ backgroundColor: customization.primaryColor }}>📍</span>
                  <span><strong>Lieu:</strong> {event.lieu}</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center mr-3" style={{ backgroundColor: customization.primaryColor }}>📅</span>
                  <span><strong>Date:</strong> {formatDate(event.date_debut)}</span>
                </li>
                {event.places_disponibles && (
                  <li className="flex items-center">
                    <span className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center mr-3" style={{ backgroundColor: customization.primaryColor }}>👥</span>
                    <span><strong>Places:</strong> {event.places_disponibles} disponibles</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-3">
                {event.organisateur && (
                  <li className="flex items-center">
                    <span className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center mr-3" style={{ backgroundColor: customization.primaryColor }}>👤</span>
                    <span><strong>Organisateur:</strong> {event.organisateur}</span>
                  </li>
                )}
                {event.email_contact && (
                  <li className="flex items-center">
                    <span className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center mr-3" style={{ backgroundColor: customization.primaryColor }}>✉️</span>
                    <span><strong>Email:</strong> {event.email_contact}</span>
                  </li>
                )}
                {event.telephone_contact && (
                  <li className="flex items-center">
                    <span className="w-6 h-6 rounded-full text-white text-sm flex items-center justify-center mr-3" style={{ backgroundColor: customization.primaryColor }}>📞</span>
                    <span><strong>Téléphone:</strong> {event.telephone_contact}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="inscription" className="py-20" style={gradientStyle}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Inscription
            </h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: customization.primaryColor }}></div>
            <p className="text-lg text-gray-600">
              Remplissez le formulaire ci-dessous pour vous inscrire à l'événement.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            {registrationSuccess ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Inscription confirmée !
                </h3>
                <p className="text-gray-600 mb-6">
                  Merci de votre inscription. Vous recevrez bientôt un email de confirmation avec votre billet.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={buttonStyle}
                >
                  Nouvelle inscription
                </button>
              </div>
            ) : (
              <LandingRegistrationForm 
                eventId={event.id} 
                onSuccess={onRegistrationSuccess}
                customButtonStyle={buttonStyle}
                customAccentColor={customization.primaryColor}
                participantData={participantData}
                token={token}
              />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            {customization.logoUrl && (
              <img 
                src={customization.logoUrl} 
                alt="Logo" 
                className="h-8 mx-auto mb-4 opacity-80"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{event.nom}</h3>
            <p className="text-gray-400">{event.organisateur}</p>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {event.organisateur || 'Event Admin'}. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}