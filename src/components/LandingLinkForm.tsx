'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

interface LandingLinkFormData {
  subject: string
  body: string
  copyToSender: boolean
}

interface LandingLinkFormProps {
  eventId: string
  recipientIds: string[]
  singleRecipient?: { id: string; email: string; name: string } | null
  onSent: () => void
  onCancel: () => void
}

export default function LandingLinkForm({
  eventId,
  recipientIds,
  singleRecipient,
  onSent,
  onCancel,
}: LandingLinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LandingLinkFormData>({
    defaultValues: {
      subject: 'Confirmez votre inscription',
      body: `Bonjour {{participant_firstname}} {{participant_lastname}},

Nous avons le plaisir de vous inviter à confirmer votre inscription à l'événement "{{event_name}}" qui aura lieu le {{event_date}} à {{event_location}}.

Cliquez sur le lien ci-dessous pour accéder à votre page d'inscription personnalisée :

{{landing_url}}

Ce lien vous permettra de :
• Confirmer votre participation
• Consulter les détails de l'événement  
• Vous inscrire aux sessions qui vous intéressent
• Recevoir votre billet d'accès

Ce lien est personnel et unique. Ne le partagez pas.

Cordialement,
L'équipe organisatrice`,
      copyToSender: false
    }
  })

  // Process variables in content for preview
  const processContentWithVariables = (content: string) => {
    return content
      .replace(/{{event_name}}/g, 'Nom de l\'événement')
      .replace(/{{participant_firstname}}/g, 'Prénom')
      .replace(/{{participant_lastname}}/g, 'Nom')
      .replace(/{{event_date}}/g, 'Date de l\'événement')
      .replace(/{{event_location}}/g, 'Lieu de l\'événement')
      .replace(/{{landing_url}}/g, 'https://example.com/landing/event-id/user-token')
      .replace(/{{ticket_url}}/g, 'https://example.com/ticket/123')
  }

  const onSubmit = async (data: LandingLinkFormData) => {
    if (recipientIds.length === 0 && !singleRecipient) {
      setError('Aucun destinataire sélectionné')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const participantIds = singleRecipient ? [singleRecipient.id] : recipientIds

      // Send landing page links using the specialized API
      const response = await fetch('/api/send-landing-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantIds,
          eventId,
          customSubject: data.subject,
          customBody: data.body,
          copyToSender: data.copyToSender
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'envoi')
      }

      // Count successes and failures
      const successes = result.results?.filter((r: any) => r.success).length || 0
      const failures = result.results?.filter((r: any) => !r.success).length || 0

      if (failures > 0) {
        const failedEmails = result.results
          ?.filter((r: any) => !r.success)
          .map((r: any) => r.email)
          .join(', ')
        
        setError(`${successes} emails envoyés avec succès, ${failures} échecs: ${failedEmails}`)
      } else {
        alert(`✅ ${successes} lien(s) d'inscription envoyé(s) avec succès !`)
        onSent()
      }
    } catch (err) {
      console.error('Error sending landing links:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchedBody = watch('body')
  const watchedSubject = watch('subject')

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Aperçu du lien d'inscription</h3>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Retour à l'édition
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Sujet:</h4>
            <p className="text-gray-700 mt-1">{processContentWithVariables(watchedSubject)}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contenu:</h4>
            <div 
              className="text-gray-700 whitespace-pre-line"
              dangerouslySetInnerHTML={{ 
                __html: processContentWithVariables(watchedBody).replace(/\n/g, '<br/>') 
              }}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsPreviewMode(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Modifier
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer les liens d\'inscription'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors de l'envoi
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Envoi de liens d'inscription personnalisés
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Ces liens permettront aux participants de confirmer leur inscription et de s'inscrire aux sessions.</p>
              <p className="mt-1"><strong>Important:</strong> Chaque participant doit avoir un token généré au préalable.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Sujet de l'email
        </label>
        <input
          type="text"
          id="subject"
          {...register('subject', { required: 'Le sujet est requis' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Objet de l'email"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          id="body"
          rows={12}
          {...register('body', { required: 'Le message est requis' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Contenu de l'email..."
        />
        {errors.body && (
          <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="copyToSender"
          type="checkbox"
          {...register('copyToSender')}
          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="copyToSender" className="ml-2 block text-sm text-gray-700">
          M'envoyer une copie de cet email
        </label>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        <p>Variables disponibles pour les liens d'inscription: </p>
        <ul className="list-disc list-inside mt-1">
          <li>{'{{event_name}}'} - Nom de l'événement</li>
          <li>{'{{participant_firstname}}'} - Prénom du participant</li>
          <li>{'{{participant_lastname}}'} - Nom du participant</li>
          <li>{'{{event_date}}'} - Date de l'événement</li>
          <li>{'{{event_location}}'} - Lieu de l'événement</li>
          <li>{'{{landing_url}}'} - Lien personnalisé vers la page d'inscription</li>
          <li>{'{{ticket_url}}'} - Lien vers le billet (disponible après inscription)</li>
        </ul>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => setIsPreviewMode(true)}
          className="px-4 py-2 border border-green-300 bg-green-50 rounded-md text-green-700 hover:bg-green-100"
        >
          Prévisualiser
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {isSubmitting ? 'Envoi des liens...' : 'Envoyer les liens d\'inscription'}
        </button>
      </div>
    </form>
  )
}