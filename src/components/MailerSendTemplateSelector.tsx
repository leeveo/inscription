'use client'

import { useState, useEffect } from 'react'

type Template = {
  id: string
  name: string
  type: string
  image_path: string
  created_at: string
}

type MailerSendTemplateSelectorProps = {
  onSelectTemplate: (htmlContent: string) => void
  onClose: () => void
}

export default function MailerSendTemplateSelector({ onSelectTemplate, onClose }: MailerSendTemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateHtml, setTemplateHtml] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load demo templates since the API might not be working
  useEffect(() => {
    // Instead of trying to fetch from the API, we'll just use demo templates
    const demoTemplates = [
      {
        id: 'template1',
        name: 'Template Simple',
        type: 'html',
        image_path: 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=Template+Simple',
        created_at: new Date().toISOString()
      },
      {
        id: 'template2',
        name: 'Template Professionnel',
        type: 'html',
        image_path: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=Template+Pro',
        created_at: new Date().toISOString()
      },
      {
        id: 'template3',
        name: 'Template Minimaliste',
        type: 'html',
        image_path: 'https://via.placeholder.com/300x200/0ea5e9/ffffff?text=Template+Minimal',
        created_at: new Date().toISOString()
      },
      {
        id: 'template4',
        name: 'Template Coloré',
        type: 'html',
        image_path: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Template+Coloré',
        created_at: new Date().toISOString()
      },
      {
        id: 'template5',
        name: 'Template Marketing',
        type: 'html',
        image_path: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Template+Marketing',
        created_at: new Date().toISOString()
      },
      {
        id: 'template6',
        name: 'Template Événement',
        type: 'html',
        image_path: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Template+Événement',
        created_at: new Date().toISOString()
      }
    ]
    
    setTemplates(demoTemplates)
  }, [])
  
  // Load template HTML when a template is selected
  useEffect(() => {
    if (!selectedTemplate) return
    
    setIsLoading(true)
    
    // Generate template HTML based on the selected template
    let html = ''
    
    if (selectedTemplate.id === 'template1') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">Votre billet pour {{event_name}}</h2>
          <p>Bonjour {{participant_firstname}} {{participant_lastname}},</p>
          <p>Voici votre billet pour l'événement "{{event_name}}" qui aura lieu le {{event_date}} à {{event_location}}.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="{{ticket_url}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Voir mon billet
            </a>
          </div>
          <p>N'oubliez pas de présenter votre QR code à l'entrée de l'événement.</p>
          <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `
    } else if (selectedTemplate.id === 'template2') {
      html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 10px;">Votre Billet pour {{event_name}}</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">{{event_date}} | {{event_location}}</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
            <p style="font-size: 16px; color: #111827; margin-top: 0;">Cher(e) <strong>{{participant_firstname}} {{participant_lastname}}</strong>,</p>
            <p style="font-size: 16px; color: #111827; margin-bottom: 20px;">Nous sommes ravis de vous confirmer votre inscription à l'événement "{{event_name}}".</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{ticket_url}}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; transition: background-color 0.3s;">
                Accéder à mon billet
              </a>
            </div>
            
            <p style="font-size: 16px; color: #111827;">Veuillez présenter le QR code de votre billet lors de votre arrivée à l'événement.</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #6b7280; font-size: 14px;">Des questions? Contactez-nous par email.</p>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 15px;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    } else if (selectedTemplate.id === 'template3') {
      html = `
        <div style="font-family: 'Arial', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="font-size: 20px; font-weight: normal; color: #0ea5e9; margin-bottom: 20px;">Billet pour {{event_name}}</h1>
          
          <p>{{participant_firstname}},</p>
          <p>Voici votre billet pour l'événement du {{event_date}}.</p>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="{{ticket_url}}" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Voir le billet
            </a>
          </div>
          
          <p style="font-size: 13px; color: #666; margin-top: 30px;">
            {{event_location}} | {{event_date}}
          </p>
        </div>
      `
    } else if (selectedTemplate.id === 'template4') {
      html = `
        <div style="font-family: 'Trebuchet MS', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdf2f8; border-radius: 12px;">
          <div style="background: linear-gradient(to right, #ec4899, #8b5cf6); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; font-size: 26px; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">✨ Votre Invitation ✨</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">{{event_name}}</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333;">Bonjour {{participant_firstname}},</p>
            <p style="font-size: 16px; color: #333;">Nous sommes heureux de vous accueillir à notre événement qui aura lieu le <strong style="color: #ec4899;">{{event_date}}</strong> à <strong style="color: #8b5cf6;">{{event_location}}</strong>.</p>
            
            <div style="margin: 25px 0; text-align: center;">
              <a href="{{ticket_url}}" style="background: linear-gradient(to right, #ec4899, #8b5cf6); color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.25);">
                Voir mon billet
              </a>
            </div>
          </div>
          
          <p style="text-align: center; font-size: 14px; color: #ec4899;">
            N'oubliez pas de présenter votre QR code à l'entrée!
          </p>
        </div>
      `
    } else if (selectedTemplate.id === 'template5') {
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #8b5cf6; padding-bottom: 20px;">
            <h1 style="color: #8b5cf6; font-size: 28px; margin-bottom: 5px;">{{event_name}}</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">Votre inscription est confirmée</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
            <p style="font-size: 17px; color: #374151; line-height: 1.5;">
              Bonjour <strong>{{participant_firstname}}</strong>,
            </p>
            <p style="font-size: 17px; color: #374151; line-height: 1.5;">
              Nous avons le plaisir de vous confirmer votre inscription à notre événement "{{event_name}}".
            </p>
            <p style="font-size: 17px; color: #374151; line-height: 1.5;">
              <strong>Date:</strong> {{event_date}}<br>
              <strong>Lieu:</strong> {{event_location}}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{ticket_url}}" style="background-color: #8b5cf6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Télécharger mon billet
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
            <p>Cet email est envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      `
    } else if (selectedTemplate.id === 'template6') {
      html = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #b45309; font-size: 26px; margin-bottom: 0;">{{event_name}}</h1>
            <p style="color: #92400e; font-style: italic; margin-top: 5px;">{{event_date}} - {{event_location}}</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 25px; margin-bottom: 25px; border: 1px solid #f59e0b;">
            <p style="font-size: 16px; color: #422006; line-height: 1.6;">
              Cher/Chère {{participant_firstname}} {{participant_lastname}},
            </p>
            <p style="font-size: 16px; color: #422006; line-height: 1.6;">
              Nous sommes ravis de vous compter parmi nos participants à l'événement "{{event_name}}".
            </p>
            
            <div style="text-align: center; margin: 30px 0; background-color: #fef3c7; padding: 15px; border-radius: 8px;">
              <a href="{{ticket_url}}" style="background-color: #f59e0b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                Accéder à mon billet
              </a>
              <p style="margin-top: 10px; font-size: 14px; color: #92400e;">
                Veuillez présenter ce billet lors de votre arrivée
              </p>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 14px; color: #92400e;">
            <p>Nous sommes impatients de vous retrouver!</p>
            <p style="margin-top: 15px; font-size: 12px;">
              Email automatique, merci de ne pas répondre.
            </p>
          </div>
        </div>
      `
    } else {
      // Default template
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1e3a8a; margin-bottom: 16px;">Votre billet pour {{event_name}}</h2>
          <p>Bonjour {{participant_firstname}} {{participant_lastname}},</p>
          <p>Voici votre billet pour l'événement "{{event_name}}" qui aura lieu le {{event_date}} à {{event_location}}.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="{{ticket_url}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Voir mon billet
            </a>
          </div>
          <p>Vous pouvez accéder à votre billet à tout moment en utilisant le lien ci-dessus. N'oubliez pas de présenter votre billet (QR code) lors de votre arrivée à l'événement.</p>
          <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `
    }
    
    setTemplateHtml(html)
    setIsLoading(false)
  }, [selectedTemplate])
  
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
  }
  
  const handleUseTemplate = () => {
    if (templateHtml) {
      onSelectTemplate(templateHtml)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 md:p-6 text-white">
        <h2 className="text-xl font-bold">Modèles d'email disponibles</h2>
        <p className="mt-1 text-sm text-blue-100">
          Choisissez un modèle pour votre email de billet
        </p>
      </div>
      
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800">{selectedTemplate.name}</h3>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Retour à la liste
                  </button>
                </div>
                
                <div className="border rounded-md p-4 bg-gray-50 h-[400px] overflow-auto">
                  {templateHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: templateHtml }} />
                  ) : (
                    <p>Aucun contenu disponible pour ce modèle</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUseTemplate}
                    disabled={!templateHtml}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-md hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Utiliser ce modèle
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-md overflow-hidden hover:shadow-md cursor-pointer transition-shadow"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <img
                          src={template.image_path}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800 truncate">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Modèle d'email
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
