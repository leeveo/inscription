'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type EmailTemplatePreviewProps = {
  eventId: string
  eventName: string
  onEditTemplate: () => void
  refreshTrigger?: number
}

type EmailTemplate = {
  subject: string
  html_content: string
  updated_at: string
}

export default function EmailTemplatePreview({ eventId, eventName, onEditTemplate, refreshTrigger }: EmailTemplatePreviewProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const supabase = supabaseBrowser()
        
        const { data, error } = await supabase
          .from('inscription_email_templates')
          .select('subject, html_content, updated_at')
          .eq('evenement_id', eventId)
          .maybeSingle()
        
        if (error) throw error
        
        if (data) {
          setTemplate({
            subject: typeof data.subject === 'string' ? data.subject : '',
            html_content: typeof data.html_content === 'string' ? data.html_content : '',
            updated_at: typeof data.updated_at === 'string' ? data.updated_at : ''
          })
        } else {
          // Template par défaut si aucun n'existe
          setTemplate({
            subject: `Votre billet pour ${eventName}`,
            html_content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #1e3a8a; margin-bottom: 16px;">Votre billet pour {{event_name}}</h2>
                
                <p>Bonjour {{participant_firstname}} {{participant_lastname}},</p>
                
                <p>Voici votre billet pour l'événement "{{event_name}}" qui aura lieu le {{event_date}} à {{event_location}}.</p>
                
                <div style="margin: 24px 0; text-align: center;">
                  <a href="{{ticket_url}}" 
                    style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Voir mon billet
                  </a>
                </div>
                
                <p>Vous pouvez accéder à votre billet à tout moment en utilisant le lien ci-dessus. N'oubliez pas de présenter votre billet (QR code) lors de votre arrivée à l'événement.</p>
                
                <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                  Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
              </div>
            `,
            updated_at: ''
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
  }, [eventId, eventName, refreshTrigger])

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Chargement du modèle...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800 mb-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Erreur</span>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={onEditTemplate}
          className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
        >
          Créer un modèle
        </button>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">Aucun modèle d'email configuré</p>
        <button
          onClick={onEditTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Créer un modèle
        </button>
      </div>
    )
  }

  // Exemple de données pour la prévisualisation
  const previewData = {
    '{{event_name}}': eventName,
    '{{event_date}}': 'Vendredi 15 novembre 2024 à 14:00',
    '{{event_location}}': 'Centre de Conférences, Paris',
    '{{participant_firstname}}': 'Jean',
    '{{participant_lastname}}': 'Dupont',
    '{{participant_email}}': 'jean.dupont@email.com',
    '{{ticket_url}}': '#lien-personnalise'
  }

  // Remplacer les variables pour la prévisualisation
  let previewSubject = template.subject
  let previewContent = template.html_content

  Object.entries(previewData).forEach(([placeholder, value]) => {
    previewSubject = previewSubject.replace(new RegExp(placeholder, 'g'), value)
    previewContent = previewContent.replace(new RegExp(placeholder, 'g'), value)
  })

  return (
    <div className="space-y-6">
      {/* Informations sur le modèle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Modèle d'email actuel</h3>
            <p className="text-sm text-blue-700 mt-1">
              {template.updated_at 
                ? `Dernière modification : ${new Date(template.updated_at).toLocaleDateString('fr-FR')}`
                : 'Modèle par défaut (non sauvegardé)'
              }
            </p>
          </div>
          <button
            onClick={onEditTemplate}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>

      {/* Aperçu du sujet */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sujet de l'email</h3>
        <div className="bg-white border border-gray-300 rounded-md p-3">
          <p className="text-gray-900 font-medium">{previewSubject}</p>
        </div>
      </div>

      {/* Aperçu du contenu */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu du contenu (avec exemples de données)</h3>
        <div className="bg-white border border-gray-300 rounded-md p-4 max-h-96 overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        </div>
      </div>

      {/* Variables disponibles */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Variables disponibles dans le modèle</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.keys(previewData).map((variable) => (
            <div key={variable} className="flex items-center space-x-2 text-xs">
              <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">{variable}</code>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Ces variables sont automatiquement remplacées par les vraies données lors de l'envoi.
        </p>
      </div>
    </div>
  )
}