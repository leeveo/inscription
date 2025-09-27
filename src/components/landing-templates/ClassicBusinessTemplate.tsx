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

export default function ClassicBusinessTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {(event.logo_url || customization.logoUrl) && (
              <img 
                src={event.logo_url || customization.logoUrl} 
                alt={`Logo ${event.nom}`} 
                className="h-12"
              />
            )}
            {!event.logo_url && !customization.logoUrl && (
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold" style={{ color: customization.primaryColor }}>
                  {event.nom}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {customization.heroTitle || event.nom}
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              {customization.heroSubtitle || event.description}
            </p>
            
            {/* Event details */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-lg">
              <div className="flex items-center">
                <span className="font-semibold text-gray-800">📅 {formatDate(event.date_debut)}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-800">📍 {event.lieu}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-800">
                  💰 {event.prix ? `${event.prix}€` : 'Gratuit'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {registrationSuccess ? (
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Inscription confirmée !</h3>
                <p className="text-gray-600">
                  Merci pour votre inscription à {event.nom}. Vous recevrez un email de confirmation.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                  {customization.ctaButtonText || "S'inscrire maintenant"}
                </h2>
                <LandingRegistrationForm 
                  eventId={event.id} 
                  onSuccess={onRegistrationSuccess}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}