'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type EmailPreviewModalProps = {
  eventId: string
  participant: {
    id: string  // Changé de number à string
    prenom: string
    nom: string
    email: string
    token_landing_page?: string
  }
  event: {
    nom: string
    date_debut: string
    lieu: string
  }
  template: {
    subject: string
    html_content: string
  }
  onClose: () => void
  onSendEmail?: (participantId: string) => void  // Changé de number à string
}

export default function EmailPreviewModal({
  eventId,
  participant,
  event,
  template,
  onClose,
  onSendEmail
}: EmailPreviewModalProps) {
  const [processedSubject, setProcessedSubject] = useState('')
  const [processedContent, setProcessedContent] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')

  useEffect(() => {
    // Générer l'URL du billet personnalisé
    const generateTicketUrl = () => {
      const baseUrl = window.location.origin
      if (participant.token_landing_page) {
        return `${baseUrl}/ticket/${participant.id}?token=${participant.token_landing_page}`
      } else {
        return `${baseUrl}/ticket/${participant.id}`
      }
    }

    const generatedTicketUrl = generateTicketUrl()
    setTicketUrl(generatedTicketUrl)

    // Remplacer les variables dans le sujet et le contenu
    const variables = {
      '{{event_name}}': event.nom,
      '{{event_date}}': new Date(event.date_debut).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      '{{event_location}}': event.lieu,
      '{{participant_firstname}}': participant.prenom,
      '{{participant_lastname}}': participant.nom,
      '{{participant_email}}': participant.email,
      '{{ticket_url}}': generatedTicketUrl,
    }

    let newSubject = template.subject
    let newContent = template.html_content

    Object.entries(variables).forEach(([placeholder, value]) => {
      newSubject = newSubject.replace(new RegExp(placeholder, 'g'), value)
      newContent = newContent.replace(new RegExp(placeholder, 'g'), value)
    })

    setProcessedSubject(newSubject)
    setProcessedContent(newContent)
  }, [eventId, participant, event, template])

  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail(participant.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <h2 className="text-xl font-bold">Aperçu de l'email</h2>
          <p className="mt-1 text-sm text-blue-100">
            Email pour {participant.prenom} {participant.nom}
          </p>
        </div>

        <div className="flex-grow overflow-auto p-6">
          <div className="space-y-6">
            {/* Informations du destinataire */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Destinataire</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nom :</strong> {participant.prenom} {participant.nom}</p>
                <p><strong>Email :</strong> {participant.email}</p>
                <p><strong>Lien du billet :</strong> 
                  <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1 break-all">
                    {ticketUrl}
                  </a>
                </p>
              </div>
            </div>

            {/* Sujet de l'email */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sujet</h3>
              <div className="bg-white border border-gray-300 rounded-md p-3">
                <p className="text-gray-900 font-medium">{processedSubject}</p>
              </div>
            </div>

            {/* Contenu de l'email */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Contenu</h3>
              <div className="bg-white border border-gray-300 rounded-md p-4 max-h-96 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Fermer
          </button>
          
          <button
            type="button"
            onClick={() => window.open(ticketUrl, '_blank')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors w-full sm:w-auto"
          >
            Tester le lien du billet
          </button>
          
          {onSendEmail && (
            <button
              type="button"
              onClick={handleSendEmail}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-md hover:from-green-700 hover:to-green-800 transition-colors w-full sm:w-auto"
            >
              Envoyer cet email
            </button>
          )}
        </div>
      </div>
    </div>
  )
}