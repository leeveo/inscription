'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import SimpleRichTextEditor from './SimpleRichTextEditor'

type TicketTemplate = {
  id: number
  evenement_id: string
  subject: string
  html_content: string
  created_at: string
  updated_at: string
}

type TicketTemplateManagerProps = {
  eventId: string
  onClose: () => void
}

export default function TicketTemplateManager({ eventId, onClose }: TicketTemplateManagerProps) {
  const [template, setTemplate] = useState<TicketTemplate | null>(null)
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'html'>('wysiwyg')
  const [brevoTemplates, setBrevoTemplates] = useState([])
  const [selectedBrevoTemplate, setSelectedBrevoTemplate] = useState<any>(null)
  const [showBrevoSelector, setShowBrevoSelector] = useState(false)
  
  // Référence à l'élément textarea pour l'insertion de variables
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
  
  // Charger le modèle de ticket depuis la base de données
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const supabase = supabaseBrowser()
        
        // D'abord vérifier si la table existe en tentant de la lire
        const { data, error } = await supabase
          .from('inscription_ticket_templates')
          .select('*')
          .eq('evenement_id', eventId)
          .maybeSingle()
        
        if (error) {
          // Si la table n'existe pas, afficher un message d'erreur informatif
          if (error.code === '42P01') {
            setError(`Table des templates non trouvée. Veuillez exécuter le script SQL : sql/create_ticket_tables.sql`)
            console.error('Table inscription_ticket_templates n\'existe pas')
          } else {
            console.error('Error fetching template:', error)
            setError(`Erreur base de données: ${error.message}`)
          }
        } else if (data) {
          // Template existant trouvé
          setTemplate(data as TicketTemplate)
          setSubject(data.subject as string)
          setHtmlContent(data.html_content as string)
          console.log('Template chargé:', data.subject)
        } else {
          // Pas de template existant, charger le template par défaut
          console.log('Aucun template existant, chargement du template par défaut')
          const defaultTemplate = {
            subject: 'Votre ticket pour {{event_name}}',
            html_content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">{{event_name}}</h1>
    <p style="margin: 10px 0; opacity: 0.9;">{{event_date}} • {{event_location}}</p>
  </div>
  
  <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #667eea; margin-top: 0;">Bonjour {{participant_firstname}} {{participant_lastname}}</h2>
    
    <p>Voici votre ticket électronique pour l'événement <strong>{{event_name}}</strong>.</p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Détails de votre inscription</h3>
      <p><strong>Email :</strong> {{participant_email}}</p>
      <p><strong>Téléphone :</strong> {{participant_phone}}</p>
      <p><strong>Profession :</strong> {{participant_profession}}</p>
      <p><strong>Date d'inscription :</strong> {{registration_date}}</p>
    </div>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #059669;">Vos sessions inscrites</h3>
      {{participant_sessions}}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: white; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; display: inline-block;">
        {{qr_code}}
        <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">Scannez ce QR code à l'entrée</p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir mon ticket complet</a>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px;">
    <p style="margin: 0; opacity: 0.8; font-size: 14px;">{{event_description}}</p>
    <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 12px;">© {{event_name}} - Tous droits réservés</p>
  </div>
</div>
            `.trim()
          }
          setSubject(defaultTemplate.subject)
          setHtmlContent(defaultTemplate.html_content)
        }
      } catch (err) {
        console.error('Error fetching ticket template:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du modèle')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTemplate()
  }, [eventId])

  // Charger les templates Brevo
  useEffect(() => {
    const fetchBrevoTemplates = async () => {
      try {
        console.log('Fetching Brevo templates...')
        const response = await fetch('/api/brevo-templates')
        console.log('Brevo API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Brevo templates data:', data)
          setBrevoTemplates(data.templates || [])
        } else {
          console.warn('Failed to fetch Brevo templates:', response.status, response.statusText)
          // Ne pas afficher d'erreur, juste ignorer si les templates ne sont pas disponibles
          setBrevoTemplates([])
        }
      } catch (err) {
        console.error('Error fetching Brevo templates:', err)
        // Ne pas afficher d'erreur, juste ignorer si les templates ne sont pas disponibles
        setBrevoTemplates([])
      }
    }
    
    fetchBrevoTemplates()
  }, [])
  
  // Sauvegarder le modèle
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const supabase = supabaseBrowser()
      
      if (template) {
        // Mise à jour du modèle existant
        const { error } = await supabase
          .from('inscription_ticket_templates')
          .update({
            subject,
            html_content: htmlContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
        
        if (error) {
          if (error.code === '42P01') {
            throw new Error('Table des templates non trouvée. Veuillez exécuter le script SQL.')
          }
          throw error
        }
        
        console.log('Template mis à jour:', template.id)
      } else {
        // Création d'un nouveau modèle
        const { data, error } = await supabase
          .from('inscription_ticket_templates')
          .insert({
            evenement_id: eventId,
            subject,
            html_content: htmlContent
          })
          .select()
        
        if (error) {
          if (error.code === '42P01') {
            throw new Error('Table des templates non trouvée. Veuillez exécuter le script SQL.')
          }
          throw error
        }
        
        if (data && data.length > 0) {
          setTemplate(data[0] as TicketTemplate)
          console.log('Nouveau template créé:', data[0].id)
        }
      }
      
      setSuccessMessage('Modèle de ticket sauvegardé avec succès!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving ticket template:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Insérer une variable dans le contenu HTML
  const insertVariable = (variableCode: string) => {
    if (editorMode === 'html' && textareaRef.current) {
      const textarea = textareaRef.current
      const startPos = textarea.selectionStart
      const endPos = textarea.selectionEnd
      const newContent = htmlContent.substring(0, startPos) + variableCode + htmlContent.substring(endPos)
      setHtmlContent(newContent)
      
      // Repositionner le curseur après l'insertion
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(startPos + variableCode.length, startPos + variableCode.length)
      }, 0)
    } else {
      // En mode WYSIWYG, ajouter à la fin
      setHtmlContent(prevContent => prevContent + variableCode)
    }
  }

  // Charger un template Brevo
  const loadBrevoTemplate = (template: any) => {
    console.log('Loading Brevo template:', template)
    
    // Adapter le format Brevo
    const brevoSubject = template.subject || template.name || 'Votre ticket pour {{event_name}}'
    const brevoContent = template.htmlContent || template.html_content || template.content || ''
    
    setSubject(brevoSubject)
    setHtmlContent(brevoContent)
    setSelectedBrevoTemplate(template)
    setShowBrevoSelector(false)
    setSuccessMessage('Template Brevo chargé avec succès!')
    setTimeout(() => setSuccessMessage(null), 3000)
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Gestion des modèles de tickets
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBrevoSelector(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Templates Brevo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Template Brevo Selector Modal */}
      {showBrevoSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Templates Brevo disponibles</h3>
              <button
                onClick={() => setShowBrevoSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {brevoTemplates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>Aucun template Brevo disponible</p>
                  <p className="text-xs">Vérifiez votre configuration API</p>
                </div>
              ) : (
                brevoTemplates.map((template: any) => (
                  <div key={template.id} className="border rounded p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{template.name || template.subject || `Template ${template.id}`}</h4>
                        <p className="text-sm text-gray-600">
                          {template.subject ? `Sujet: ${template.subject}` : 'Template Brevo'}
                        </p>
                        {template.tag && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                            {template.tag}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => loadBrevoTemplate(template)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Utiliser
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Objet du ticket
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Objet du ticket..."
          />
        </div>
        
        {/* Variables */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variables disponibles
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
            {availableVariables.map((variable, index) => (
              <button
                key={index}
                onClick={() => insertVariable(variable.code)}
                className="text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                title={`Cliquer pour insérer ${variable.code}`}
              >
                <span className="font-mono text-blue-600">{variable.code}</span>
                <br />
                <span className="text-gray-600">{variable.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Editor Mode Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Mode d'édition :</span>
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setEditorMode('wysiwyg')}
              className={`px-3 py-1 text-sm ${
                editorMode === 'wysiwyg'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Éditeur visuel
            </button>
            <button
              onClick={() => setEditorMode('html')}
              className={`px-3 py-1 text-sm ${
                editorMode === 'html'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              HTML
            </button>
          </div>
        </div>
        
        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenu du ticket
          </label>
          
          {editorMode === 'wysiwyg' ? (
            <SimpleRichTextEditor
              value={htmlContent}
              onChange={setHtmlContent}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Contenu HTML du ticket..."
            />
          )}
        </div>
        
        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aperçu du ticket
          </label>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 text-white rounded-md ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}