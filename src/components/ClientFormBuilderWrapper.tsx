'use client'

import { useMemo } from 'react'
import BuilderRenderer from '@/components/builder/BuilderRenderer'

interface ClientFormBuilderWrapperProps {
  formTree: string
  eventId: string
  eventName: string
  eventDescription: string
  participantData: any
  token: string | null
}

export default function ClientFormBuilderWrapper({
  formTree,
  eventId,
  eventName,
  eventDescription,
  participantData,
  token
}: ClientFormBuilderWrapperProps) {
  
  // Préparer les données de l'événement pour le contexte
  const eventData = useMemo(() => ({
    id: eventId,
    nom: eventName,
    description: eventDescription,
    // Ajouter d'autres données d'événement si nécessaire
  }), [eventId, eventName, eventDescription])

  // Parser le formTree si c'est une string
  const parsedFormTree = useMemo(() => {
    try {
      return typeof formTree === 'string' ? JSON.parse(formTree) : formTree
    } catch (error) {
      console.error('Erreur de parsing du formTree:', error)
      return null
    }
  }, [formTree])

  // Si le parsing a échoué, afficher une erreur
  if (!parsedFormTree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur de formulaire</div>
          <p className="text-gray-600 mb-4">Le formulaire n'a pas pu être chargé correctement.</p>
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BuilderRenderer
        schema={parsedFormTree}
        eventId={eventId}
        eventData={eventData}
        mode="public"
      />
    </div>
  )
}