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

export default function CreativeEventTemplate({ event, config, onRegistrationSuccess, registrationSuccess, isPreview = false, participantData, token }: LandingTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Template Créatif - En développement
        </h1>
        <p className="text-center text-white mb-8">
          {event.nom}
        </p>
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <LandingRegistrationForm 
            eventId={event.id} 
            onSuccess={onRegistrationSuccess}
            participantData={participantData}
            token={token}
          />
        </div>
      </div>
    </div>
  )
}