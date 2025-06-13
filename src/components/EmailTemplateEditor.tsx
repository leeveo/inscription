'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import MailerSendTemplateSelector from './MailerSendTemplateSelector'
import SimpleRichTextEditor from './SimpleRichTextEditor'

type EmailTemplate = {
  id: number
  evenement_id: string
  subject: string
  html_content: string
  created_at: string
  updated_at: string
}

type EmailTemplateEditorProps = {
  eventId: string
  onClose: () => void
}

export default function EmailTemplateEditor({ eventId, onClose }: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'html'>('wysiwyg')
  
  // Référence à l'élément textarea pour l'insertion de variables
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Variables disponibles pour l'insertion
  const availableVariables = [
    { name: 'Nom de l\'événement', code: '{{event_name}}' },
    { name: 'Date de l\'événement', code: '{{event_date}}' },
    { name: 'Lieu de l\'événement', code: '{{event_location}}' },
    { name: 'Prénom du participant', code: '{{participant_firstname}}' },
    { name: 'Nom du participant', code: '{{participant_lastname}}' },
    { name: 'Email du participant', code: '{{participant_email}}' },
    { name: 'Lien du billet', code: '{{ticket_url}}' },
  ]
  
  // Charger le modèle depuis la base de données
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const supabase = supabaseBrowser()
        
        // Vérifier si un modèle existe pour cet événement
        const { data, error } = await supabase
          .from('inscription_email_templates')
          .select('*')
          .eq('evenement_id', eventId)
          .maybeSingle()
        
        if (error) throw error
        
        if (data) {
          // Un modèle existe, l'utiliser
          setTemplate({
            id: 'id' in data ? Number(data.id) : 0,
            evenement_id: 'evenement_id' in data ? String(data.evenement_id) : '',
            subject: 'subject' in data ? String(data.subject) : '',
            html_content: 'html_content' in data ? String(data.html_content) : '',
            created_at: 'created_at' in data ? String(data.created_at) : '',
            updated_at: 'updated_at' in data ? String(data.updated_at) : '',
          });
          setSubject('subject' in data && typeof data.subject === 'string' ? data.subject : ''); // Vérifiez si c'est une chaîne
          setHtmlContent('html_content' in data && typeof data.html_content === 'string' ? data.html_content : ''); // Vérifiez si c'est une chaîne
        } else {
          // Créer un modèle par défaut
          const { data: eventData, error: eventError } = await supabase
            .from('inscription_evenements')
            .select('nom')
            .eq('id', eventId)
            .single()
            
          if (eventError) throw eventError
          
          const defaultSubject = `Votre billet pour ${eventData.nom}`
          const defaultHtmlContent = `
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
          `
          
          setSubject(defaultSubject)
          setHtmlContent(defaultHtmlContent)
        }
      } catch (error: Error | unknown) {
        console.error('Error loading template:', error);
        setError(error instanceof Error ? error.message : 'Failed to load template')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTemplate()
  }, [eventId])
  
  // Insérer une variable à la position du curseur
  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd
    
    const newContent = 
      htmlContent.substring(0, selectionStart) + 
      variable + 
      htmlContent.substring(selectionEnd)
    
    setHtmlContent(newContent)
    
    // Focus et positionnez le curseur après la variable insérée
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        selectionStart + variable.length,
        selectionStart + variable.length
      )
    }, 10)
  }
  
  // Sauvegarder le modèle
  const saveTemplate = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      const supabase = supabaseBrowser()
      
      if (template?.id) {
        // Mettre à jour un modèle existant
        const { error } = await supabase
          .from('inscription_email_templates')
          .update({
            subject,
            html_content: htmlContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
        
        if (error) throw error
      } else {
        // Créer un nouveau modèle
        const { error } = await supabase
          .from('inscription_email_templates')
          .insert({
            evenement_id: eventId,
            subject,
            html_content: htmlContent
          })
        
        if (error) throw error
      }
      
      setSuccessMessage('Modèle d\'email sauvegardé avec succès')
      
      // Fermer la fenêtre après une courte pause pour que l'utilisateur puisse voir le message de succès
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error: Error | unknown) {
      console.error('Error saving template:', error)
      setError(error instanceof Error ? error.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Fonction pour utiliser un template MailerSend
  const handleSelectMailerSendTemplate = (htmlContent: string) => {
    setHtmlContent(htmlContent)
    setShowTemplateSelector(false)
  }
  
  // Insertion de variable dans l'éditeur
  const insertVariableToEditor = (variable: string) => {
    if (editorMode === 'html') {
      insertVariable(variable)
    } else {
      // For the simple editor, just append to current content
      setHtmlContent(prev => prev + ' ' + variable)
    }
  }
  
  // Basculer entre l'éditeur WYSIWYG et le code HTML
  const toggleEditorMode = () => {
    setEditorMode(prev => prev === 'wysiwyg' ? 'html' : 'wysiwyg')
  }
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Si le sélecteur de templates est affiché, le montrer par-dessus l'éditeur
  if (showTemplateSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <MailerSendTemplateSelector
          onSelectTemplate={handleSelectMailerSendTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-6 text-white">
        <h2 className="text-xl font-bold">Personnaliser le modèle d&apos;email</h2>
        <p className="mt-1 text-sm text-blue-100">
          Personnalisez le modèle d&apos;email qui sera envoyé aux participants
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 my-2">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-4 my-2">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      <div className="flex-grow overflow-auto p-4">
        <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
          {/* Colonne de gauche: Édition */}
          <div className="lg:w-1/2 space-y-6">
            {/* Sujet de l'email */}
            <div>
              <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet de l&apos;email
              </label>
              <input
                id="email-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Bouton pour utiliser un template MailerSend */}
            <div>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="w-full px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all text-sm flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Utiliser un modèle MailerSend
              </button>
            </div>
            
            {/* Variables disponibles */}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Variables disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable.code}
                    type="button"
                    onClick={() => insertVariableToEditor(variable.code)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                    title={`Insérer ${variable.name}`}
                  >
                    {variable.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Toggle entre WYSIWYG et HTML */}
            <div className="flex justify-end">
              <button 
                onClick={toggleEditorMode}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {editorMode === 'wysiwyg' ? 'Éditer le code HTML' : 'Utiliser l\'éditeur visuel'}
              </button>
            </div>
            
            {/* Éditeur de contenu */}
            <div className="flex-grow">
              <label htmlFor="email-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenu de l&apos;email {editorMode === 'html' ? '(HTML)' : ''}
              </label>
              
              {editorMode === 'wysiwyg' ? (
                <SimpleRichTextEditor 
                  value={htmlContent}
                  onChange={setHtmlContent}
                  height="400px"
                />
              ) : (
                <textarea
                  id="email-content"
                  ref={textareaRef}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={15}
                  className="w-full h-[400px] px-4 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
              )}
            </div>
          </div>
          
          {/* Colonne de droite: Aperçu */}
          <div className="lg:w-1/2">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Aperçu
            </p>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 h-[500px] overflow-auto">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sujet: {subject}</h3>
              <hr className="mb-3" />
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre d'actions */}
      <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={saveTemplate}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-md hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors w-full sm:w-auto"
        >
          {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
