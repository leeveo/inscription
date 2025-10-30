'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import {
  FiMail,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiX,
  FiCheckCircle,
  FiTag,
  FiZap,
  FiSmartphone,
  FiCreditCard,
  FiSend
} from 'react-icons/fi'

type TicketTemplate = {
  id: number
  evenement_id: string
  subject: string
  html_content: string
  created_at: string
  updated_at: string
}

type ParticipantData = {
  id: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  profession?: string
}

type TicketTemplateViewerProps = {
  eventId: string
  onEdit?: () => void // Optionnel pour le mode aperçu seulement
  refreshTrigger?: number // Nouvelle prop pour forcer le refresh
  participantData?: ParticipantData // Données du participant pour l'aperçu personnalisé
  previewOnly?: boolean // Mode aperçu seulement, sans boutons d'édition
  isBadge?: boolean // Pour différencier ticket vs badge
}

export default function TicketTemplateViewer({ eventId, onEdit, refreshTrigger, participantData, previewOnly = false, isBadge = false }: TicketTemplateViewerProps) {
  const [template, setTemplate] = useState<TicketTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(previewOnly) // Force l'aperçu en mode previewOnly

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()

        const { data, error } = await supabase
          .from('inscription_ticket_templates')
          .select('*')
          .eq('evenement_id', eventId)
          .maybeSingle()

        if (error && error.code !== '42P01') {
          console.error('Error fetching template:', error)
        } else if (data) {
          setTemplate(data as TicketTemplate)
        }
      } catch (err) {
        console.error('Error fetching ticket template:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [eventId, refreshTrigger])

  // Remplacer les variables par des données réelles ou des exemples pour l'aperçu
  const getPreviewContent = () => {
    if (!template) return ''

    // Utiliser les données du participant si disponibles, sinon utiliser des exemples
    const firstName = participantData?.prenom || 'Jean'
    const lastName = participantData?.nom || 'Dupont'
    const email = participantData?.email || 'jean.dupont@example.com'
    const phone = participantData?.telephone || '+33 6 12 34 56 78'
    const profession = participantData?.profession || 'Développeur Full Stack'
    const participantId = participantData?.id || '123456'

    return template.html_content
      .replace(/\{\{event_name\}\}/g, 'Conférence Tech Innovation 2025')
      .replace(/\{\{event_date\}\}/g, '15 Mars 2025, 09:00')
      .replace(/\{\{event_location\}\}/g, 'Centre des Congrès, Paris')
      .replace(/\{\{event_description\}\}/g, 'Une journée exceptionnelle dédiée à l\'innovation technologique et au networking.')
      .replace(/\{\{participant_firstname\}\}/g, firstName)
      .replace(/\{\{participant_lastname\}\}/g, lastName)
      .replace(/\{\{participant_email\}\}/g, email)
      .replace(/\{\{participant_phone\}\}/g, phone)
      .replace(/\{\{participant_profession\}\}/g, profession)
      .replace(/\{\{participant_sessions\}\}/g, '<ul style="list-style: none; padding: 0;"><li style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">✅ Keynote: L\'avenir de l\'IA</li><li style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">✅ Atelier: React & Next.js</li><li style="padding: 8px 0;">✅ Table ronde: DevOps en 2025</li></ul>')
      .replace(/\{\{qr_code\}\}/g, `<div style="width: 200px; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: bold; font-size: 16px; margin: 0 auto;">QR CODE<br/>${firstName} ${lastName}<br/>#${participantId}</div>`)
      .replace(/\{\{ticket_url\}\}/g, `https://votre-site.com/ticket/${participantId}`)
      .replace(/\{\{registration_date\}\}/g, '10 Février 2025')
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <FiCreditCard className="w-8 h-8 text-gray-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Aucun template de {isBadge ? 'badge' : 'ticket'} configuré
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Créez un template personnalisé pour vos {isBadge ? 'badges' : 'tickets'} et envoyez-les automatiquement à vos participants avec leur QR code unique !
        </p>

        {/* Features list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <FiMail className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">Email personnalisé</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <FiEdit className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">Design sur mesure</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <FiSmartphone className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700">QR Code unique</div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <FiSend className="w-4 h-4" />
          Créer mon premier template
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            {isBadge ? 'Template de badge configuré' : 'Template de ticket configuré'}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            Dernière modification : {new Date(template.updated_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        {!previewOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              {showPreview ? (
                <>
                  <FiEyeOff className="w-4 h-4" />
                  Masquer aperçu
                </>
              ) : (
                <>
                  <FiEye className="w-4 h-4" />
                  Voir aperçu plein écran
                </>
              )}
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <FiEdit className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>
        )}
      </div>

      {/* Template Info Layout - Single Column */}
      {!previewOnly && (
        <div className="space-y-6">
          {/* Template Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-4">
              <FiMail className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Objet de l'email</div>
                <div className="text-gray-900 font-semibold text-base">{template.subject}</div>
              </div>
            </div>
          </div>

          {/* Variables présentes */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiTag className="w-4 h-4 text-blue-500" />
              <div className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Variables utilisées</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                '{{event_name}}',
                '{{event_date}}',
                '{{event_location}}',
                '{{participant_firstname}}',
                '{{participant_lastname}}',
                '{{participant_email}}',
                '{{qr_code}}',
                '{{ticket_url}}'
              ].filter(variable => template.html_content.includes(variable)).map((variable, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono font-medium"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <FiCheckCircle className="w-5 h-5 text-green-500" />
              <div className="text-sm font-semibold text-green-900 uppercase tracking-wider">Statut</div>
            </div>
            <div className="text-gray-900 font-medium">Prêt à envoyer aux participants</div>
          </div>
        </div>
      )}

      {/* Aperçu complet sans scroll - Section dédiée */}
      <div className={previewOnly ? "mt-0" : "mt-8"}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          {!previewOnly && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FiEye className="w-5 h-5 text-blue-500" />
                <h4 className="text-lg font-semibold text-gray-900">Aperçu complet du template</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <FiEye className="w-4 h-4" />
                  Plein écran
                </button>
              </div>
            </div>
          )}

          {/* Aperçu en taille réelle sans scroll */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
            />
          </div>

          {!previewOnly && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm flex items-center gap-2">
                <FiZap className="w-4 h-4" />
                Cet aperçu utilise des données d'exemple. Le template réel utilisera les vraies informations des participants.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && !previewOnly && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-blue-500" />
                    Aperçu du template
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <FiZap className="w-4 h-4" />
                    Avec données d'exemple
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
