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

type TicketTemplateViewerProps = {
  eventId: string
  onEdit: () => void
}

export default function TicketTemplateViewer({ eventId, onEdit }: TicketTemplateViewerProps) {
  const [template, setTemplate] = useState<TicketTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

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
  }, [eventId])

  // Remplacer les variables par des exemples pour l'aperçu
  const getPreviewContent = () => {
    if (!template) return ''

    return template.html_content
      .replace(/\{\{event_name\}\}/g, 'Conférence Tech Innovation 2025')
      .replace(/\{\{event_date\}\}/g, '15 Mars 2025, 09:00')
      .replace(/\{\{event_location\}\}/g, 'Centre des Congrès, Paris')
      .replace(/\{\{event_description\}\}/g, 'Une journée exceptionnelle dédiée à l\'innovation technologique et au networking.')
      .replace(/\{\{participant_firstname\}\}/g, 'Jean')
      .replace(/\{\{participant_lastname\}\}/g, 'Dupont')
      .replace(/\{\{participant_email\}\}/g, 'jean.dupont@example.com')
      .replace(/\{\{participant_phone\}\}/g, '+33 6 12 34 56 78')
      .replace(/\{\{participant_profession\}\}/g, 'Développeur Full Stack')
      .replace(/\{\{participant_sessions\}\}/g, '<ul style="list-style: none; padding: 0;"><li style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">✅ Keynote: L\'avenir de l\'IA</li><li style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">✅ Atelier: React & Next.js</li><li style="padding: 8px 0;">✅ Table ronde: DevOps en 2025</li></ul>')
      .replace(/\{\{qr_code\}\}/g, '<div style="width: 200px; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 12px; color: white; font-weight: bold; font-size: 16px; margin: 0 auto;">QR CODE<br/>PREVIEW</div>')
      .replace(/\{\{ticket_url\}\}/g, 'https://votre-site.com/ticket/123456')
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
      <div className="relative overflow-hidden rounded-2xl p-8 shadow-2xl border-2 border-blue-400/30">
        {/* Background avec dégradé Web 3.0 - même que sidebar */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>

        {/* Effet de particules/mesh moderne */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-300/15 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 text-center py-12">
          {/* Icon with animation */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full flex items-center justify-center border-4 border-cyan-400/50 shadow-lg animate-bounce">
            <FiCreditCard className="w-12 h-12 text-cyan-300" />
          </div>

          {/* Title with gradient */}
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
            Aucun template de ticket configuré
          </h3>

          {/* Description with better visibility */}
          <p className="text-white text-lg font-semibold mb-8 max-w-2xl mx-auto leading-relaxed flex items-center justify-center gap-2">
            <FiZap className="w-5 h-5 text-cyan-400" />
            Créez un template personnalisé pour vos tickets et envoyez-les automatiquement à vos participants avec leur QR code unique !
          </p>

          {/* Features list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
              <FiMail className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Email personnalisé</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
              <FiEdit className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">Design sur mesure</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
              <FiSmartphone className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-white text-sm font-medium">QR Code unique</div>
            </div>
          </div>

          {/* CTA Button with pulse animation */}
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-lg font-bold rounded-xl transition-all shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 border-2 border-white/30 animate-pulse"
          >
            <FiSend className="w-5 h-5" />
            Créer mon premier template
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-2xl border-2 border-blue-400/30">
      {/* Background avec dégradé Web 3.0 - même que sidebar */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Effet de particules/mesh moderne */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-300/15 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-1 flex items-center gap-2">
            <FiCheckCircle className="w-7 h-7 text-green-400" />
            Template de ticket configuré
          </h3>
          <p className="text-blue-200/70 text-sm flex items-center gap-2">
            <FiZap className="w-4 h-4" />
            Dernière modification : {new Date(template.updated_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-500 border border-purple-400/50 text-white rounded-xl transition-all text-sm font-bold backdrop-blur-sm shadow-lg"
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
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-2 border-white/30 text-white rounded-xl transition-all text-sm font-bold backdrop-blur-sm shadow-lg"
          >
            <FiEdit className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Grid Layout: Info + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Template Info */}
        <div className="space-y-4">
          {/* Template Info */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <FiMail className="w-8 h-8 text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-blue-200/60 mb-2 uppercase tracking-wider">Objet de l'email</div>
                <div className="text-white font-bold text-lg">{template.subject}</div>
              </div>
            </div>
          </div>

          {/* Variables présentes */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiTag className="w-5 h-5 text-blue-400" />
              <div className="text-sm font-bold text-white uppercase tracking-wider">Variables utilisées</div>
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
                  className="px-3 py-1.5 bg-cyan-500/30 border border-cyan-400/50 text-cyan-100 rounded-lg text-xs font-mono font-bold"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <FiCheckCircle className="w-6 h-6 text-green-400" />
              <div className="text-sm font-bold text-green-200 uppercase tracking-wider">Statut</div>
            </div>
            <div className="text-white font-semibold">Prêt à envoyer aux participants</div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiEye className="w-5 h-5 text-purple-400" />
            <div className="text-sm font-bold text-white uppercase tracking-wider">Aperçu du template</div>
          </div>
          <div className="bg-white rounded-xl p-4 max-h-[400px] overflow-y-auto shadow-inner">
            <div
              className="text-sm"
              style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142%' }}
              dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
            />
          </div>
        </div>
      </div>

      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-cyan-400" />
                    Aperçu du template
                  </h3>
                  <p className="text-blue-200/70 text-sm flex items-center gap-2 mt-1">
                    <FiZap className="w-4 h-4" />
                    Avec données d'exemple
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 backdrop-blur-sm text-white transition-all duration-300 flex items-center justify-center"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-white/30">
                <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
