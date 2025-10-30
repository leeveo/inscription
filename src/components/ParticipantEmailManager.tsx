'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import EmailPreviewModal from './EmailPreviewModal'

type Participant = {
  id: string  // Changé de number à string pour correspondre à la base de données
  prenom: string
  nom: string
  email: string
  token_landing_page?: string
}

type Event = {
  id: string
  nom: string
  date_debut: string
  lieu: string
  description?: string
}

type EmailTemplate = {
  subject: string
  html_content: string
}

type ParticipantEmailManagerProps = {
  eventId: string
  participants: Participant[]
  event: Event
  onClose: () => void
}

export default function ParticipantEmailManager({
  eventId,
  participants,
  event,
  onClose
}: ParticipantEmailManagerProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()

        const { data, error } = await supabase
          .from('inscription_email_templates')
          .select('subject, html_content')
          .eq('evenement_id', eventId)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setTemplate({
            subject: typeof data.subject === 'string' ? data.subject : '',
            html_content: typeof data.html_content === 'string' ? data.html_content : ''
          })
        } else {
          // Template par défaut si aucun n'existe
          setTemplate({
            subject: `Votre billet pour ${event.nom}`,
            html_content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e3a8a;">Bonjour {{participant_firstname}} {{participant_lastname}} !</h2>
                <p>Voici votre billet pour <strong>{{event_name}}</strong></p>
                <p><strong>Date :</strong> {{event_date}}</p>
                <p><strong>Lieu :</strong> {{event_location}}</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="{{ticket_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    Voir mon billet
                  </a>
                </div>
              </div>
            `
          })
        }
      } catch (err) {
        console.error('Error fetching template:', err)
        setError('Erreur lors du chargement du modèle')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [eventId, event.nom])

  const handlePreviewEmail = (participant: Participant) => {
    setSelectedParticipant(participant)
    setShowPreview(true)
  }

  const handleSendEmail = async (participantId: string) => {
    try {
      setIsSending(true)
      
      // Ici, vous pouvez implémenter l'envoi réel de l'email
      // Par exemple, appeler une API route qui utilise MailerSend
      const response = await fetch('/api/send-participant-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          participantId,
          template
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email')
      }

      setSentEmails(prev => new Set(prev).add(participantId))
      setShowPreview(false)
    } catch (err) {
      console.error('Error sending email:', err)
      setError('Erreur lors de l\'envoi de l\'email')
    } finally {
      setIsSending(false)
    }
  }

  // Gestion de la sélection des participants
  const handleSelectParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      const newSet = new Set(prev)
      if (newSet.has(participantId)) {
        newSet.delete(participantId)
      } else {
        newSet.add(participantId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedParticipants.size === participants.length) {
      // Désélectionner tous
      setSelectedParticipants(new Set())
    } else {
      // Sélectionner tous
      setSelectedParticipants(new Set(participants.map(p => p.id)))
    }
  }

  const selectedCount = selectedParticipants.size
  const isAllSelected = selectedCount === participants.length
  const isPartiallySelected = selectedCount > 0 && selectedCount < participants.length

  const handleSendAllEmails = async () => {
    const participantsToSend = participants.filter(p => selectedParticipants.has(p.id))
    
    if (participantsToSend.length === 0) {
      setError('Aucun participant sélectionné')
      return
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir envoyer l'email aux ${participantsToSend.length} participants sélectionnés ?`
    )
    
    if (!confirmed) return

    try {
      setIsSending(true)
      setError(null)
      
      for (const participant of participantsToSend) {
        if (!sentEmails.has(participant.id)) {
          await handleSendEmail(participant.id)
          // Petite pause entre chaque envoi
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    } catch (err) {
      console.error('Error sending bulk emails:', err)
      setError('Erreur lors de l\'envoi des emails en masse')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span>Chargement du modèle d'email...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
            <h2 className="text-xl font-bold">Envoyer des emails aux participants</h2>
            <p className="mt-1 text-sm text-blue-100">
              {participants.length} participants inscrits à {event.nom}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 my-2">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex-grow overflow-auto p-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Liste des participants</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Sélectionnez les participants pour l'envoi d'email</p>
                  {selectedCount > 0 && (
                    <p className="text-blue-600 font-medium">
                      {selectedCount} participant{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {isAllSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
                <button
                  onClick={handleSendAllEmails}
                  disabled={isSending || selectedCount === 0}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-colors"
                >
                  {isSending 
                    ? 'Envoi en cours...' 
                    : selectedCount === 0 
                      ? 'Sélectionner des participants'
                      : `Envoyer aux ${selectedCount} sélectionnés`
                  }
                </button>
              </div>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isPartiallySelected
                        }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => {
                    // Générer l'URL de la page d'inscription (landing page) au lieu du ticket
                    const landingUrl = participant.token_landing_page 
                      ? `${window.location.origin}/landing/${eventId}/${participant.token_landing_page}`
                      : `${window.location.origin}/ticket/${participant.id}` // Fallback si pas de token
                    
                    const isSent = sentEmails.has(participant.id)
                    const isSelected = selectedParticipants.has(participant.id)

                    return (
                      <tr 
                        key={participant.id} 
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectParticipant(participant.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {participant.prenom} {participant.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isSent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Envoyé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⏳ En attente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handlePreviewEmail(participant)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              👁 Aperçu
                            </button>
                            <button
                              onClick={() => window.open(landingUrl, '_blank')}
                              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                            >
                              🔗 Tester
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'aperçu */}
      {showPreview && selectedParticipant && template && (
        <EmailPreviewModal
          eventId={eventId}
          participant={selectedParticipant}
          event={event}
          template={template}
          onClose={() => setShowPreview(false)}
          onSendEmail={handleSendEmail}
        />
      )}
    </>
  )
}