'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import SimpleRichTextEditor from './SimpleRichTextEditor'
import { ticketEmailTemplates, TicketEmailTemplate } from './TicketEmailLibrary'

type TicketTemplate = {
  id: number
  evenement_id: string
  subject: string
  html_content: string
  created_at: string
  updated_at: string
}

type TicketTemplateWizardProps = {
  eventId: string
  onClose: () => void
  onSuccess?: () => void
}

type Step = 1 | 2 | 3

export default function TicketTemplateWizard({ eventId, onClose, onSuccess }: TicketTemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [template, setTemplate] = useState<TicketTemplate | null>(null)
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'html'>('wysiwyg')
  const [selectedLibraryTemplate, setSelectedLibraryTemplate] = useState<TicketEmailTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Variables disponibles pour l'insertion dans les tickets
  const availableVariables = [
    { name: 'Nom de l\'événement', code: '{{event_name}}' },
    { name: 'Date de l\'événement', code: '{{event_date}}' },
    { name: 'Lieu de l\'événement', code: '{{event_location}}' },
    { name: 'Description de l\'événement', code: '{{event_description}}' },
    { name: 'Prénom du participant', code: '{{participant_firstname}}' },
    { name: 'Nom du participant', code: '{{participant_lastname}}' },
    { name: 'Email du participant', code: '{{participant_email}}' },
    { name: 'Téléphone du participant', code: '{{participant_phone}}' },
    { name: 'Profession du participant', code: '{{participant_profession}}' },
    { name: 'Liste des sessions inscrites', code: '{{participant_sessions}}' },
    { name: 'QR Code pour check-in', code: '{{qr_code}}' },
    { name: 'URL du ticket', code: '{{ticket_url}}' },
    { name: 'Date d\'inscription', code: '{{registration_date}}' },
  ]

  const categories = [
    { id: 'all', name: 'Tous', icon: '⬡' },
    { id: 'business', name: 'Business', icon: '◊' },
    { id: 'modern', name: 'Moderne', icon: '◈' },
    { id: 'creative', name: 'Créatif', icon: '◉' },
    { id: 'minimal', name: 'Minimal', icon: '○' }
  ]

  // Charger le modèle existant
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        setError(null)
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
          setSubject(data.subject as string)
          setHtmlContent(data.html_content as string)
        }
      } catch (err) {
        console.error('Error fetching ticket template:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [eventId])

  // Sauvegarder le modèle
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const supabase = supabaseBrowser()

      if (template) {
        const { error } = await supabase
          .from('inscription_ticket_templates')
          .update({
            subject,
            html_content: htmlContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('inscription_ticket_templates')
          .insert({
            evenement_id: eventId,
            subject,
            html_content: htmlContent
          })
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setTemplate(data[0] as TicketTemplate)
        }
      }

      setSuccessMessage('✅ Template sauvegardé avec succès!')
      
      // Appeler le callback onSuccess si fourni
      if (onSuccess) {
        onSuccess()
      }
      
      // Fermer immédiatement après la sauvegarde
      onClose()
    } catch (err) {
      console.error('Error saving ticket template:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  // Sélectionner un template de la bibliothèque
  const handleSelectTemplate = (template: TicketEmailTemplate) => {
    setSelectedLibraryTemplate(template)
    setSubject(template.subject)
    setHtmlContent(template.htmlContent)
    setCurrentStep(2)
  }

  // Insérer une variable
  const insertVariable = (variableCode: string) => {
    if (editorMode === 'html' && textareaRef.current) {
      const textarea = textareaRef.current
      const startPos = textarea.selectionStart
      const endPos = textarea.selectionEnd
      const newContent = htmlContent.substring(0, startPos) + variableCode + htmlContent.substring(endPos)
      setHtmlContent(newContent)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(startPos + variableCode.length, startPos + variableCode.length)
      }, 0)
    } else {
      setHtmlContent(prevContent => prevContent + variableCode)
    }
  }

  // Navigation entre étapes
  const goToStep = (step: Step) => {
    if (step === 2 && !htmlContent) {
      setError('Veuillez d\'abord sélectionner un template')
      return
    }
    setCurrentStep(step)
    setError(null)
  }

  // Filtrer les templates
  const filteredTemplates = ticketEmailTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Remplacer les variables par des exemples pour l'aperçu
  const getPreviewContent = () => {
    return htmlContent
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
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-400"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header avec glassmorphism style sidebar - FIXE */}
      <div className="relative overflow-hidden flex-shrink-0">
        {/* Background avec dégradé Web 3.0 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>

        {/* Effet de particules/mesh moderne */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-5 left-10 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-5 right-10 w-20 h-20 bg-cyan-300/15 rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-1">
                Gestion des Templates
              </h2>
              <p className="text-blue-200/80 text-xs">Créez des tickets personnalisés en 3 étapes</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 backdrop-blur-sm text-white transition-all duration-300 flex items-center justify-center font-bold text-lg"
            >
              ✕
            </button>
          </div>

          {/* Stepper glassmorphism */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => goToStep(step as Step)}
                  disabled={step === 2 && !htmlContent}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    currentStep === step
                      ? 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white border border-blue-400/30 shadow-lg backdrop-blur-sm'
                      : currentStep > step
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm cursor-pointer'
                      : 'bg-white/5 text-blue-200/50 border border-white/10 backdrop-blur-sm cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    currentStep === step
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md text-white'
                      : currentStep > step
                      ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white'
                      : 'bg-white/10 text-blue-200/50'
                  }`}>
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className="text-xs font-medium">
                    {step === 1 && 'Template'}
                    {step === 2 && 'Édition'}
                    {step === 3 && 'Aperçu'}
                  </span>
                </button>
                {step < 3 && (
                  <div className={`w-6 h-0.5 mx-1 rounded ${
                    currentStep > step ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-shrink-0">
        {error && (
          <div className="mx-6 mt-3 bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm">
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-3 bg-green-500/10 border border-green-400/30 text-green-200 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm">
            {successMessage}
          </div>
        )}
      </div>

      {/* Contenu selon l'étape - SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">

        {/* ÉTAPE 1: Choix du template */}
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un template..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 text-white placeholder-blue-200/60 font-medium"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/40 shadow-lg backdrop-blur-sm'
                        : 'bg-white/10 text-blue-100/80 hover:bg-white/20 hover:text-white border border-white/10 hover:border-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-blue-200/60 text-lg font-medium">Aucun template trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`relative overflow-hidden bg-white/10 backdrop-blur-md border rounded-2xl transition-all duration-300 cursor-pointer group hover:scale-105 ${
                      selectedLibraryTemplate?.id === template.id
                        ? 'border-cyan-400/50 shadow-xl shadow-cyan-500/20'
                        : 'border-white/20 hover:border-white/30 hover:bg-white/20'
                    }`}
                  >
                    {/* Preview avec screenshot simulé */}
                    <div className="h-48 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 flex items-center justify-center relative p-4 overflow-hidden">
                      {/* Simuler un screenshot de ticket */}
                      <div className="w-full h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 transform group-hover:scale-105 transition-transform duration-300">
                        <div className="space-y-2">
                          <div className="h-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded w-3/4"></div>
                          <div className="h-1.5 bg-white/30 rounded w-1/2"></div>
                          <div className="h-1.5 bg-white/20 rounded w-2/3"></div>
                          <div className="mt-3 flex gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/40 to-blue-600/40 rounded"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-1 bg-white/30 rounded w-full"></div>
                              <div className="h-1 bg-white/20 rounded w-3/4"></div>
                            </div>
                          </div>
                          <div className="mt-2 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded border border-white/10"></div>
                        </div>
                      </div>
                      {template.isPrintable && (
                        <span className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-bold border border-green-400/30">
                          Imprimable
                        </span>
                      )}
                      {selectedLibraryTemplate?.id === template.id && (
                        <span className="absolute top-2 left-2 bg-cyan-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-bold border border-cyan-400/30">
                          ✓ Sélectionné
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-base text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-blue-200/70 mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Action Button */}
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-400/40 hover:to-blue-400/40 border border-cyan-400/30 text-white py-2 px-4 rounded-xl transition-all font-medium backdrop-blur-sm"
                      >
                        Sélectionner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 2: Modification - LAYOUT 2 COLONNES */}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* COLONNE GAUCHE - Objet et Variables */}
            <div className="overflow-y-auto pr-4 space-y-5">
              {/* Subject */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl">
                <label htmlFor="subject" className="block text-sm font-bold text-white mb-3">
                  📧 Objet de l'email
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 text-white placeholder-blue-200/60 font-medium"
                  placeholder="Ex: Votre ticket pour {{event_name}}"
                />
              </div>

              {/* Variables */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl">
                <label className="block text-sm font-bold text-white mb-3">
                  🏷️ Variables (cliquez pour insérer)
                </label>
                <p className="text-xs text-blue-200/70 mb-3">
                  Cliquez sur une variable pour l'insérer dans l'éditeur
                </p>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {availableVariables.map((variable, index) => (
                    <button
                      key={index}
                      onClick={() => insertVariable(variable.code)}
                      className="w-full text-left px-3 py-2.5 bg-white/10 hover:bg-cyan-500/20 rounded-lg border border-white/20 hover:border-cyan-400/50 transition-all backdrop-blur-sm group"
                    >
                      <div className="font-mono text-cyan-300 font-bold text-sm group-hover:text-cyan-200">
                        {variable.code}
                      </div>
                      <div className="text-blue-200/70 text-xs mt-1">
                        {variable.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLONNE DROITE - Éditeur */}
            <div className="overflow-y-auto pl-4 border-l border-white/20">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">📝 Éditeur</span>
                  <div className="flex rounded-xl overflow-hidden border border-white/20">
                    <button
                      onClick={() => setEditorMode('wysiwyg')}
                      className={`px-4 py-2 text-xs font-bold transition-all ${
                        editorMode === 'wysiwyg'
                          ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white backdrop-blur-sm'
                          : 'bg-white/10 text-blue-200 hover:bg-white/20 backdrop-blur-sm'
                      }`}
                    >
                      ✨ Visuel
                    </button>
                    <button
                      onClick={() => setEditorMode('html')}
                      className={`px-4 py-2 text-xs font-bold transition-all ${
                        editorMode === 'html'
                          ? 'bg-gradient-to-r from-cyan-500/40 to-blue-500/40 text-white backdrop-blur-sm'
                          : 'bg-white/10 text-blue-200 hover:bg-white/20 backdrop-blur-sm'
                      }`}
                    >
                      💻 HTML
                    </button>
                  </div>
                </div>

                {editorMode === 'wysiwyg' ? (
                  <div className="bg-white rounded-xl p-2">
                    <SimpleRichTextEditor
                      value={htmlContent}
                      onChange={setHtmlContent}
                    />
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    rows={25}
                    className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-white font-mono text-sm"
                    placeholder="Code HTML..."
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3: Prévisualisation */}
        {currentStep === 3 && (
          <div>
            <div className="mb-4 bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 rounded-xl p-3">
              <p className="text-xs text-cyan-100 font-medium">
                <strong>Aperçu avec données d'exemple</strong> - Les variables ont été remplacées par des données fictives pour la démonstration.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border-2 border-white/30">
              <div className="max-h-[550px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer glassmorphism - FIXE */}
      <div className="relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"></div>
        <div className="absolute inset-0 border-t border-white/10"></div>

        <div className="relative z-10 p-4 flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep((currentStep - 1) as Step)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl transition-all text-sm font-medium backdrop-blur-sm"
              >
                ← Retour
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < 3 ? (
              <button
                onClick={() => goToStep((currentStep + 1) as Step)}
                disabled={currentStep === 1 && !htmlContent}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-400/40 hover:to-blue-400/40 border border-cyan-400/30 text-white rounded-xl transition-all text-sm font-bold backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-5 py-2 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-sm ${
                  isSaving
                    ? 'bg-gray-500/30 border border-gray-400/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-400/40 hover:to-emerald-400/40 border border-green-400/30'
                }`}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    business: '◊',
    modern: '◈',
    creative: '◉',
    minimal: '○'
  }
  return icons[category] || '⬡'
}
