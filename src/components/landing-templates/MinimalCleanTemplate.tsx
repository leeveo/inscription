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
  image_url?: string
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

export default function MinimalCleanTemplate({
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

  const accentStyle = {
    color: customization.primaryColor
  }

  const buttonStyle = {
    backgroundColor: customization.primaryColor
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Custom CSS */}
      {customization.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customization.customCSS }} />
      )}

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Column - Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16">
          <div className="max-w-xl w-full">
            {/* Logo */}
            {(event.logo_url || customization.logoUrl) && (
              <div className="mb-12">
                <img
                  src={event.logo_url || customization.logoUrl}
                  alt={`Logo ${event.nom}`}
                  className="h-12"
                />
              </div>
            )}

            {/* Hero Title */}
            <div className="mb-8">
              <div className="inline-block mb-4">
                <span
                  className="text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${customization.primaryColor}15`,
                    color: customization.primaryColor
                  }}
                >
                  {event.type_evenement || 'Événement'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {customization.heroTitle || event.nom}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {customization.heroSubtitle || event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="space-y-6 mb-12">
              {/* Date */}
              <div className="flex items-start space-x-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${customization.primaryColor}10` }}
                >
                  <svg
                    className="w-6 h-6"
                    style={accentStyle}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base font-semibold text-gray-900">{formatDate(event.date_debut)}</p>
                  {event.date_fin && event.date_fin !== event.date_debut && (
                    <p className="text-sm text-gray-600">au {formatDate(event.date_fin)}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.lieu && (
                <div className="flex items-start space-x-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${customization.primaryColor}10` }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={accentStyle}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Lieu</p>
                    <p className="text-base font-semibold text-gray-900">{event.lieu}</p>
                  </div>
                </div>
              )}

              {/* Price */}
              {event.prix !== undefined && event.prix !== null && (
                <div className="flex items-start space-x-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${customization.primaryColor}10` }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={accentStyle}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tarif</p>
                    <p className="text-base font-semibold text-gray-900">
                      {event.prix === 0 ? 'Gratuit' : `${event.prix} €`}
                    </p>
                  </div>
                </div>
              )}

              {/* Available Seats */}
              {event.places_disponibles && event.places_disponibles > 0 && (
                <div className="flex items-start space-x-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${customization.primaryColor}10` }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={accentStyle}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Places disponibles</p>
                    <p className="text-base font-semibold text-gray-900">{event.places_disponibles} places</p>
                  </div>
                </div>
              )}
            </div>

            {/* Organizer Info */}
            {event.organisateur && (
              <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Organisé par</p>
                <p className="text-lg font-semibold text-gray-900">{event.organisateur}</p>
                {event.email_contact && (
                  <a
                    href={`mailto:${event.email_contact}`}
                    className="text-sm hover:underline mt-1 inline-block"
                    style={accentStyle}
                  >
                    {event.email_contact}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center px-8 py-12 lg:px-16">
          <div className="max-w-md w-full">
            {!registrationSuccess ? (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {customization.ctaButtonText || "S'inscrire à l'événement"}
                </h2>
                <p className="text-sm text-gray-600 mb-8">
                  Remplissez le formulaire pour confirmer votre participation
                </p>

                <LandingRegistrationForm
                  eventId={event.id}
                  onSuccess={onRegistrationSuccess}
                  isPreview={isPreview}
                  participantData={participantData}
                  token={token}
                  buttonStyle={buttonStyle}
                  accentColor={customization.primaryColor}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: `${customization.primaryColor}15` }}
                >
                  <svg
                    className="w-8 h-8"
                    style={accentStyle}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Inscription confirmée !
                </h3>
                <p className="text-gray-600">
                  Vous recevrez un email de confirmation avec tous les détails de l'événement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}