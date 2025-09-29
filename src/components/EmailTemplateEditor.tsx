'use client'

import { useState, useEffect, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import BrevoTemplateSelector from './BrevoTemplateSelector'
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
  const [showBrevoTemplateSelector, setShowBrevoTemplateSelector] = useState(false)
  const [showPredefinedTemplateModal, setShowPredefinedTemplateModal] = useState(false)
  const [editorMode, setEditorMode] = useState<'wysiwyg' | 'html'>('wysiwyg')
  const [refreshPreview, setRefreshPreview] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Référence à l'élément textarea pour l'insertion de variables
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Templates d'emails pré-définis
  const predefinedTemplates = [
    {
      id: 'invitation-moderne',
      name: 'Invitation Moderne',
      subject: 'Inscrivez-vous à {{event_name}} - Places limitées !',
      html_content: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <div style="padding: 40px 30px; text-align: center; color: white;">
            <h1 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">{{event_name}}</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">📅 {{event_date}} • 📍 {{event_location}}</p>
          </div>
          
          <div style="background: white; padding: 40px 30px; text-align: center;">
            <h2 style="color: #4a5568; margin: 0 0 20px 0; font-size: 24px;">Bonjour {{participant_firstname}},</h2>
            
            <p style="color: #718096; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Nous avons le plaisir de vous inviter à participer à <strong>{{event_name}}</strong>. 
              Cet événement exceptionnel vous permettra de découvrir des sessions passionnantes et de rencontrer des experts du domaine.
            </p>
            
            <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 16px;">
                🎯 <strong>Inscrivez-vous dès maintenant</strong> aux sessions qui vous intéressent<br>
                ⏰ Places limitées - Réservation conseillée
              </p>
            </div>
            
            <a href="{{landing_url}}" 
               style="display: inline-block; background: linear-gradient(135deg, #4299e1, #3182ce); color: white; padding: 16px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 20px 0; box-shadow: 0 8px 20px rgba(66, 153, 225, 0.3); transition: transform 0.2s;">
              🎉 Je m'inscris maintenant
            </a>
            
            <p style="color: #a0aec0; font-size: 14px; margin: 30px 0 0 0; line-height: 1.5;">
              Si le bouton ne fonctionne pas, copiez ce lien : {{landing_url}}<br>
              Cet email a été envoyé automatiquement.
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'professionnel-elegant',
      name: 'Professionnel Élégant',
      subject: 'Votre invitation à {{event_name}} - Réservez votre place',
      html_content: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #1a202c; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 1px;">{{event_name}}</h1>
            <div style="width: 60px; height: 2px; background: #4299e1; margin: 15px auto;"></div>
            <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">{{event_date}} | {{event_location}}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #4a5568; font-size: 18px; margin: 0 0 15px 0;">Cher/Chère {{participant_firstname}} {{participant_lastname}},</p>
            
            <p style="color: #718096; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              C'est avec grand plaisir que nous vous invitons à participer à notre événement 
              <strong style="color: #4a5568;">{{event_name}}</strong>. Cette occasion unique vous permettra 
              d'accéder à des conférences de haut niveau et de vous inscrire aux sessions qui correspondent à vos intérêts.
            </p>
            
            <div style="border-left: 4px solid #4299e1; background: #f7fafc; padding: 20px; margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">📋 Étapes à suivre :</h3>
              <ul style="color: #4a5568; margin: 10px 0; padding-left: 20px; line-height: 1.6;">
                <li>Cliquez sur le lien d'inscription ci-dessous</li>
                <li>Sélectionnez les sessions qui vous intéressent</li>
                <li>Confirmez votre participation</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}" 
                 style="background: #2d3748; color: white; padding: 14px 35px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; letter-spacing: 0.5px;">
                RÉSERVER MA PLACE
              </a>
            </div>
            
            <p style="color: #a0aec0; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.5; font-style: italic;">
              Cordialement,<br>
              L'équipe organisatrice
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'colore-dynamique',
      name: 'Coloré & Dynamique',
      subject: '🚀 {{event_name}} vous attend - Inscriptions ouvertes !',
      html_content: `
        <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4); padding: 4px; border-radius: 16px;">
          <div style="background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%); padding: 35px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 900; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎪 {{event_name}}</h1>
              <p style="margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">{{event_date}} • {{event_location}}</p>
            </div>
            
            <div style="padding: 40px 30px; background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #2d3748; margin: 0; font-size: 26px; font-weight: 700;">Salut {{participant_firstname}} ! 👋</h2>
              </div>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.7; text-align: center; margin: 0 0 25px 0;">
                Prêt(e) pour une expérience inoubliable ? <strong>{{event_name}}</strong> t'ouvre ses portes ! 
                Des sessions captivantes, des rencontres inspirantes et plein de surprises t'attendent.
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px;">🎁 Inscription gratuite !</h3>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                  Choisis tes sessions préférées et réserve ta place dès maintenant
                </p>
              </div>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="{{landing_url}}" 
                   style="background: linear-gradient(135deg, #ff6b6b, #ff8e8e); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4); transition: transform 0.2s;">
                  🎉 JE M'INSCRIS !
                </a>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #718096; font-size: 14px; margin: 0; font-style: italic;">
                  Pssst... Les places sont limitées ! ⏰
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'minimaliste-chic',
      name: 'Minimaliste Chic',
      subject: 'Invitation à {{event_name}} - Votre place vous attend',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: white;">
          <div style="padding: 50px 40px; border-bottom: 1px solid #e2e8f0;">
            <h1 style="color: #1a202c; font-size: 32px; font-weight: 300; margin: 0 0 8px 0; letter-spacing: -0.5px;">{{event_name}}</h1>
            <p style="color: #718096; font-size: 16px; margin: 0; font-weight: 400;">{{event_date}} — {{event_location}}</p>
          </div>
          
          <div style="padding: 40px;">
            <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
              Bonjour {{participant_firstname}},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
              Vous êtes cordialement invité(e) à participer à <strong>{{event_name}}</strong>. 
              Cet événement vous offre l'opportunité de vous inscrire à des sessions spécialisées 
              et d'enrichir vos connaissances dans un cadre professionnel.
            </p>
            
            <div style="margin: 40px 0; padding: 30px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
              <p style="color: #2d3748; font-size: 16px; margin: 0; text-align: center; font-weight: 500;">
                Sélectionnez vos sessions et confirmez votre participation
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}" 
                 style="background: #2d3748; color: white; padding: 14px 30px; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; display: inline-block;">
                S'inscrire
              </a>
            </div>
            
            <p style="color: #a0aec0; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
              Si vous ne souhaitez plus recevoir ces emails, veuillez nous en informer.<br>
              Lien d'inscription : {{landing_url}}
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'corporatif-premium',
      name: 'Corporatif Premium',
      subject: 'Invitation officielle - {{event_name}} | Réservation requise',
      html_content: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa; padding: 30px;">
          <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 40px; text-align: center;">
              <div style="background: white; color: #2c3e50; padding: 15px 25px; border-radius: 4px; display: inline-block; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">{{event_name}}</h1>
              </div>
              <p style="color: white; margin: 0; font-size: 18px; opacity: 0.9;">Événement professionnel</p>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 16px;">{{event_date}} | {{event_location}}</p>
            </div>
            
            <div style="padding: 45px 40px; background: white;">
              <div style="border-left: 4px solid #3498db; padding-left: 20px; margin-bottom: 30px;">
                <h2 style="color: #2c3e50; margin: 0; font-size: 22px; font-weight: 600;">
                  Madame, Monsieur {{participant_lastname}},
                </h2>
              </div>
              
              <p style="color: #5a6c7d; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                Nous avons l'honneur de vous convier à participer à <strong style="color: #2c3e50;">{{event_name}}</strong>. 
                Cet événement de prestige rassemble les professionnels du secteur autour de conférences exclusives 
                et de sessions de networking de haute qualité.
              </p>
              
              <div style="background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%); border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 5px solid #3498db;">
                <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Programme & Inscription</h3>
                <ul style="color: #5a6c7d; margin: 0; padding-left: 20px; line-height: 1.7;">
                  <li>Consultez le programme détaillé des sessions</li>
                  <li>Sélectionnez les conférences de votre choix</li>
                  <li>Confirmez votre présence avant la date limite</li>
                  <li>Recevez votre badge d'accès personnalisé</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 40px 0; padding: 25px 0; border-top: 2px solid #ecf0f1; border-bottom: 2px solid #ecf0f1;">
                <p style="color: #7f8c8d; margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Réservation obligatoire
                </p>
                <a href="{{landing_url}}" 
                   style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; box-shadow: 0 8px 16px rgba(52, 152, 219, 0.3);">
                  ➤ ACCÉDER À LA RÉSERVATION
                </a>
              </div>
              
              <div style="text-align: center; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                <p style="color: #95a5a6; font-size: 13px; margin: 0; line-height: 1.5;">
                  <strong>Organisé par :</strong> L'équipe {{event_name}}<br>
                  <strong>Contact :</strong> {{participant_email}}<br>
                  <em>Cet email contient des informations importantes concernant votre invitation.</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'conference-academique',
      name: 'Conférence Académique',
      subject: 'Inscription ouverte : {{event_name}} - Programme scientifique',
      html_content: `
        <div style="font-family: 'Times New Roman', Times, serif; max-width: 700px; margin: 0 auto; background: white; border: 1px solid #d2d6dc;">
          <div style="background: #1e3a8a; color: white; padding: 35px 40px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: normal;">{{event_name}}</h1>
            <div style="width: 100px; height: 1px; background: #60a5fa; margin: 15px auto;"></div>
            <p style="margin: 15px 0 0 0; font-size: 16px; font-style: italic; opacity: 0.9;">
              Conférence Scientifique & Sessions Spécialisées
            </p>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.8;">{{event_date}} • {{event_location}}</p>
          </div>
          
          <div style="padding: 40px;">
            <div style="margin-bottom: 30px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 5px 0;">Cher(ère) collègue,</p>
              <p style="color: #4b5563; font-size: 16px; margin: 0; font-weight: 500;">Dr. {{participant_firstname}} {{participant_lastname}}</p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: justify;">
              C'est avec un grand plaisir que nous vous invitons à participer à <em style="color: #1e3a8a; font-weight: 500;">{{event_name}}</em>. 
              Cette conférence de haut niveau réunit la communauté scientifique autour de présentations innovantes, 
              d'ateliers pratiques et de sessions de discussion entre experts.
            </p>
            
            <div style="background: #f3f4f6; border-left: 4px solid #1e3a8a; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📚 Programme de la conférence</h3>
              <p style="color: #4b5563; margin: 0 0 15px 0; line-height: 1.6;">
                • <strong>Sessions plénières</strong> avec conférenciers internationaux<br>
                • <strong>Ateliers thématiques</strong> en petits groupes<br>
                • <strong>Présentations de recherche</strong> et posters scientifiques<br>
                • <strong>Tables rondes</strong> et débats d'experts
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 14px; font-style: italic;">
                L'inscription vous permet de sélectionner les sessions correspondant à vos domaines d'intérêt.
              </p>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <p style="color: #1e40af; margin: 0 0 10px 0; font-size: 15px; font-weight: 600;">
                📋 Modalités d'inscription :
              </p>
              <p style="color: #3730a3; margin: 0; font-size: 14px; line-height: 1.6;">
                1. Cliquez sur le lien d'inscription sécurisé<br>
                2. Consultez le programme détaillé<br>
                3. Sélectionnez vos sessions (places limitées)<br>
                4. Validez votre inscription
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}" 
                 style="background: #1e3a8a; color: white; padding: 15px 35px; text-decoration: none; border-radius: 3px; font-size: 16px; font-weight: 500; display: inline-block; letter-spacing: 0.3px;">
                📝 S'INSCRIRE À LA CONFÉRENCE
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                <strong>Comité d'organisation :</strong> {{event_name}}<br>
                <em>Inscription gratuite - Certificat de participation fourni</em>
              </p>
              <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center; line-height: 1.4;">
                Lien direct : {{landing_url}}<br>
                Pour toute question scientifique, contactez le secrétariat de la conférence.
              </p>
            </div>
          </div>
        </div>
      `
    }
  ]
  
  // Variables disponibles pour l'insertion
  const availableVariables = [
    { name: 'Nom de l\'événement', code: '{{event_name}}' },
    { name: 'Date de l\'événement', code: '{{event_date}}' },
    { name: 'Lieu de l\'événement', code: '{{event_location}}' },
    { name: 'Prénom du participant', code: '{{participant_firstname}}' },
    { name: 'Nom du participant', code: '{{participant_lastname}}' },
    { name: 'Email du participant', code: '{{participant_email}}' },
    { name: 'Lien du billet (admin.waivent.app)', code: '{{ticket_url}}' },
    { name: 'Lien d\'inscription personnalisé (waivent.app)', code: '{{landing_url}}' },
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
  
  // Fonction pour utiliser un template Brevo
  const handleSelectBrevoTemplate = (htmlContent: string) => {
    setHtmlContent(htmlContent)
    setShowBrevoTemplateSelector(false)
  }
  
  // Fonction pour utiliser un template prédéfini
  const handleSelectPredefinedTemplate = (template: typeof predefinedTemplates[0]) => {
    setSubject(template.subject)
    setHtmlContent(template.html_content)
    setShowPredefinedTemplateModal(false)
    // Forcer l'actualisation de l'aperçu
    setTimeout(() => {
      setRefreshPreview(prev => prev + 1)
    }, 100)
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
  
  // Fonction pour remplacer les variables par des données d'exemple pour l'aperçu
  const getPreviewContent = () => {
    return htmlContent
      .replace(/{{event_name}}/g, 'Mon Super Événement')
      .replace(/{{event_date}}/g, '15 décembre 2025 à 14h30')
      .replace(/{{event_location}}/g, 'Paris, Centre de Conférences')
      .replace(/{{participant_firstname}}/g, 'Jean')
      .replace(/{{participant_lastname}}/g, 'Dupont')
      .replace(/{{participant_email}}/g, 'jean.dupont@email.com')
      .replace(/{{ticket_url}}/g, '#ticket-preview')
      .replace(/{{landing_url}}/g, '#landing-preview')
  }
  
  // Fonction pour remplacer le sujet avec des données d'exemple
  const getPreviewSubject = () => {
    return subject
      .replace(/{{event_name}}/g, 'Mon Super Événement')
      .replace(/{{event_date}}/g, '15 décembre 2025')
      .replace(/{{event_location}}/g, 'Paris')
      .replace(/{{participant_firstname}}/g, 'Jean')
      .replace(/{{participant_lastname}}/g, 'Dupont')
      .replace(/{{participant_email}}/g, 'jean.dupont@email.com')
  }
  
  // Fonction pour actualiser l'aperçu
  const refreshPreviewContent = () => {
    setIsRefreshing(true)
    
    // Force un re-render complet avec plusieurs stratégies
    setRefreshPreview(prev => prev + 1)
    
    // Force aussi la mise à jour des fonctions de preview
    setTimeout(() => {
      // Trigger un nouveau render en modifiant légèrement le state
      setRefreshPreview(prev => prev + 1)
      setIsRefreshing(false)
    }, 300)
    
    console.log('Aperçu actualisé:', { subject, contentLength: htmlContent.length })
  }
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Si le sélecteur de templates est affiché, le montrer par-dessus l'éditeur
  if (showBrevoTemplateSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <BrevoTemplateSelector
          onSelectTemplate={handleSelectBrevoTemplate}
          onClose={() => setShowBrevoTemplateSelector(false)}
        />
      </div>
    )
  }

  // Modal pour les templates prédéfinis
  const PredefinedTemplateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Modèles d'email d'inscription</h3>
              <p className="text-sm text-blue-100 mt-1">Choisissez un modèle pour commencer</p>
            </div>
            <button
              onClick={() => setShowPredefinedTemplateModal(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predefinedTemplates.map((template, index) => (
              <div key={template.id} className="group cursor-pointer" onClick={() => handleSelectPredefinedTemplate(template)}>
                <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                  {/* Aperçu miniature */}
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 p-4 text-xs leading-tight">
                      <div dangerouslySetInnerHTML={{ 
                        __html: template.html_content
                          .replace(/{{event_name}}/g, 'Mon Super Événement')
                          .replace(/{{participant_firstname}}/g, 'Jean')
                          .replace(/{{participant_lastname}}/g, 'Dupont')
                          .replace(/{{event_date}}/g, '15 décembre 2025')
                          .replace(/{{event_location}}/g, 'Paris, France')
                          .replace(/{{participant_email}}/g, 'jean.dupont@email.com')
                      }} 
                      style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '333%', height: '333%' }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  
                  {/* Informations du template */}
                  <div className="p-4 bg-white">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {template.subject.replace(/{{event_name}}/g, 'Mon Super Événement')}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">
                        Template #{index + 1}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Sélectionner
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Tous les templates sont personnalisables avec vos variables
            </p>
            <button
              onClick={() => setShowPredefinedTemplateModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  
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
            
            {/* Bouton pour ouvrir le modal des templates */}
            <div>
              <button
                onClick={() => setShowPredefinedTemplateModal(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-medium rounded-md hover:from-blue-200 hover:to-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all text-sm flex items-center justify-center border border-blue-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Choisir un modèle d&apos;email
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
          <div className="lg:w-1/2" key={`preview-${refreshPreview}-${htmlContent.substring(0,50)}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="block text-sm font-medium text-gray-700">
                Aperçu du contenu (avec exemples de données)
              </p>
              <div className="flex gap-2">
                <span className="text-xs text-gray-500 px-2 py-1">v.{refreshPreview}</span>
                <button
                  onClick={refreshPreviewContent}
                  disabled={isRefreshing}
                  className={`px-4 py-2 text-sm ${
                    isRefreshing 
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800'
                  } rounded-md transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md`}
                  title="Actualiser l'aperçu maintenant"
                >
                  <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? 'Actualisation...' : 'Actualiser l\'aperçu'}
                </button>
              </div>
            </div>
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 h-[500px] overflow-auto">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sujet: {getPreviewSubject()}</h3>
              <hr className="mb-3" />
              <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
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

      {/* Modal des templates prédéfinis */}
      {showPredefinedTemplateModal && <PredefinedTemplateModal />}
    </div>
  )
}
