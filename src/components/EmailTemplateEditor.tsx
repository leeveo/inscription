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
    },
    {
      id: 'tech-startup',
      name: 'Tech & Startup',
      subject: '⚡ {{event_name}} - Innovation & Networking',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%); padding: 2px;">
            <div style="background: #0f172a; padding: 40px 30px; text-align: center;">
              <div style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 36px; font-weight: 900; margin-bottom: 15px;">
                {{event_name}}
              </div>
              <p style="color: #94a3b8; font-size: 16px; margin: 0;">{{event_date}} | {{event_location}}</p>
              <div style="display: inline-block; background: rgba(14, 165, 233, 0.1); border: 1px solid #0ea5e9; border-radius: 20px; padding: 8px 20px; margin-top: 15px;">
                <span style="color: #0ea5e9; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Early Access</span>
              </div>
            </div>
          </div>

          <div style="padding: 40px 30px; background: #1e293b;">
            <p style="color: #cbd5e1; font-size: 18px; margin: 0 0 10px 0; font-weight: 600;">Hey {{participant_firstname}}! 👋</p>

            <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Prêt à vivre une expérience tech unique ? <strong style="color: #e2e8f0;">{{event_name}}</strong> réunit les meilleurs innovateurs,
              startups et investisseurs pour deux jours intenses de networking et découvertes.
            </p>

            <div style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1)); border-left: 3px solid #8b5cf6; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #e2e8f0; margin: 0 0 12px 0; font-size: 18px;">🚀 Au programme</h3>
              <div style="color: #cbd5e1; font-size: 15px; line-height: 1.8;">
                <div style="margin-bottom: 8px;">⚡ Keynotes par des CEO de licornes tech</div>
                <div style="margin-bottom: 8px;">💡 Pitchs de startups innovantes</div>
                <div style="margin-bottom: 8px;">🤝 Sessions de networking exclusives</div>
                <div>🎯 Ateliers pratiques & demos live</div>
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 30px rgba(14, 165, 233, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                🎟️ Claim Your Spot
              </a>
            </div>

            <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid #ec4899; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
              <p style="color: #f9a8d4; margin: 0; font-size: 14px; font-weight: 600;">
                ⏰ Places limitées • Premier arrivé, premier servi
              </p>
            </div>

            <p style="color: #64748b; font-size: 13px; margin: 30px 0 0 0; text-align: center; line-height: 1.5;">
              See you there! 🚀<br>
              L'équipe {{event_name}}
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'festival-culturel',
      name: 'Festival Culturel',
      subject: '🎨 {{event_name}} - Réservez votre expérience culturelle',
      html_content: `
        <div style="font-family: 'Georgia', serif; max-width: 650px; margin: 0 auto; background: #fffbf0;">
          <div style="background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: relative; z-index: 1;">
              <h1 style="color: #78350f; margin: 0 0 15px 0; font-size: 38px; font-weight: 700; text-shadow: 2px 2px 4px rgba(255,255,255,0.3);">
                {{event_name}}
              </h1>
              <div style="width: 80px; height: 3px; background: #78350f; margin: 0 auto 20px;"></div>
              <p style="color: #92400e; font-size: 18px; font-style: italic; margin: 0;">Festival des Arts & Culture</p>
              <p style="color: #92400e; font-size: 16px; margin: 10px 0 0 0;">📅 {{event_date}} • 📍 {{event_location}}</p>
            </div>
          </div>

          <div style="padding: 45px 35px; background: white;">
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #78350f; font-size: 20px; margin: 0; font-weight: 600;">
                Bonjour {{participant_firstname}},
              </p>
            </div>

            <p style="color: #92400e; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0; text-align: center;">
              Nous sommes ravis de vous inviter à découvrir <strong>{{event_name}}</strong>,
              un festival exceptionnel célébrant la diversité artistique et culturelle.
            </p>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border: 2px solid #fbbf24;">
              <h3 style="color: #78350f; margin: 0 0 20px 0; font-size: 22px; text-align: center;">🎭 Programmation</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #92400e; font-size: 15px;">
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                  <div style="font-size: 24px; margin-bottom: 5px;">🎨</div>
                  <div style="font-weight: 600;">Expositions</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                  <div style="font-size: 24px; margin-bottom: 5px;">🎵</div>
                  <div style="font-weight: 600;">Concerts Live</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                  <div style="font-size: 24px; margin-bottom: 5px;">🎬</div>
                  <div style="font-weight: 600;">Projections</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px;">
                  <div style="font-size: 24px; margin-bottom: 5px;">👥</div>
                  <div style="font-weight: 600;">Ateliers</div>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                🎟️ Réserver ma place
              </a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
              <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.6; font-style: italic;">
                ✨ <strong>Accès gratuit</strong> sur inscription<br>
                🎁 Choisissez vos activités préférées lors de l'inscription<br>
                🌟 Nombre de places limité par atelier
              </p>
            </div>

            <p style="color: #a16207; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Au plaisir de vous accueillir !<br>
              <strong>L'équipe du {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'formation-pro',
      name: 'Formation Professionnelle',
      subject: '📚 Formation {{event_name}} - Inscription ouverte',
      html_content: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background: white; border: 1px solid #e5e7eb;">
          <div style="background: #059669; color: white; padding: 35px 30px;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin-bottom: 15px;">
              <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Formation Certifiante</span>
            </div>
            <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700;">{{event_name}}</h1>
            <p style="margin: 0; font-size: 16px; opacity: 0.95;">📅 {{event_date}} | 📍 {{event_location}}</p>
          </div>

          <div style="padding: 35px 30px;">
            <p style="color: #374151; font-size: 17px; margin: 0 0 8px 0; font-weight: 600;">
              Bonjour {{participant_firstname}} {{participant_lastname}},
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Nous sommes heureux de vous proposer une place pour la formation
              <strong style="color: #059669;">{{event_name}}</strong>. Cette formation vous permettra
              d'acquérir de nouvelles compétences et d'obtenir une certification reconnue.
            </p>

            <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">
                📋 Détails de la formation
              </h3>
              <table style="width: 100%; color: #374151; font-size: 15px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; width: 40%;">🎯 Objectifs :</td>
                  <td style="padding: 8px 0;">Développement de compétences</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">⏱️ Durée :</td>
                  <td style="padding: 8px 0;">Sessions modulaires</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">📜 Certification :</td>
                  <td style="padding: 8px 0;">Attestation délivrée</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600;">👥 Format :</td>
                  <td style="padding: 8px 0;">Présentiel & Pratique</td>
                </tr>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #065f46; margin: 0 0 12px 0; font-size: 16px;">✅ Étapes d'inscription :</h4>
              <ol style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Consultez le programme détaillé de formation</li>
                <li>Sélectionnez les modules qui vous intéressent</li>
                <li>Confirmez votre participation</li>
                <li>Recevez votre convocation par email</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: #059669; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                📝 S'inscrire à la formation
              </a>
            </div>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
                <strong>Organisme de formation :</strong> {{event_name}}
              </p>
              <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center; line-height: 1.5;">
                Pour toute question : {{participant_email}}<br>
                Lien d'inscription : {{landing_url}}
              </p>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'soiree-gala',
      name: 'Soirée Gala',
      subject: '✨ Invitation Exclusive - Gala {{event_name}}',
      html_content: `
        <div style="font-family: 'Palatino', 'Times New Roman', serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
          <div style="padding: 50px 40px; text-align: center; border-bottom: 3px solid #fbbf24;">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.5);">
              <span style="font-size: 40px;">✨</span>
            </div>
            <div style="color: #fbbf24; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">
              Invitation Exclusive
            </div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 34px; font-weight: 300; letter-spacing: 1px;">
              {{event_name}}
            </h1>
            <div style="width: 60px; height: 2px; background: #fbbf24; margin: 0 auto 20px;"></div>
            <p style="color: #e0e7ff; font-size: 17px; margin: 0; font-style: italic;">
              Soirée de Gala
            </p>
            <p style="color: #c7d2fe; font-size: 15px; margin: 10px 0 0 0;">
              {{event_date}} • {{event_location}}
            </p>
          </div>

          <div style="background: white; padding: 45px 40px;">
            <p style="color: #1e1b4b; font-size: 18px; margin: 0 0 25px 0; text-align: center; font-style: italic;">
              Madame, Monsieur <strong>{{participant_lastname}}</strong>,
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0; text-align: center;">
              C'est avec un immense plaisir que nous vous convions à notre soirée de gala
              <strong style="color: #1e1b4b;">{{event_name}}</strong>.
              Une soirée d'exception vous attend dans un cadre prestigieux.
            </p>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #fbbf24; border-right: 4px solid #fbbf24; padding: 30px; margin: 30px 0; text-align: center;">
              <h3 style="color: #78350f; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                🌟 Programme de la soirée
              </h3>
              <div style="color: #92400e; font-size: 15px; line-height: 2;">
                <div>🥂 <strong>Cocktail de bienvenue</strong> & Networking</div>
                <div>🎭 <strong>Spectacle</strong> & Divertissements</div>
                <div>🍽️ <strong>Dîner gastronomique</strong> 4 services</div>
                <div>🎵 <strong>Soirée dansante</strong> & DJ</div>
              </div>
            </div>

            <div style="background: #f3f4f6; border-radius: 10px; padding: 25px; margin: 30px 0;">
              <div style="text-align: center; margin-bottom: 15px;">
                <span style="background: #1e1b4b; color: white; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Dress Code
                </span>
              </div>
              <p style="color: #374151; margin: 0; text-align: center; font-size: 15px; font-style: italic;">
                Tenue de soirée exigée • Smoking / Robe longue
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 17px; display: inline-block; box-shadow: 0 10px 25px rgba(30, 27, 75, 0.4); text-transform: uppercase; letter-spacing: 1px; border: 2px solid #fbbf24;">
                ✨ Confirmer ma présence
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-style: italic;">
                <strong>RSVP avant le {{event_date}}</strong><br>
                Nombre de places limité
              </p>
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.5;">
                Pour toute information : {{participant_email}}<br>
                Nous vous prions d'agréer nos salutations distinguées.
              </p>
            </div>
          </div>
        </div>
      `
    },
    {
      id: 'webinar-en-ligne',
      name: 'Webinar En Ligne',
      subject: '🎥 Webinar {{event_name}} - Rejoignez-nous en ligne',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px 30px; text-align: center;">
            <div style="background: white; display: inline-block; padding: 12px 24px; border-radius: 30px; margin-bottom: 20px;">
              <span style="background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Webinar Live
              </span>
            </div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 32px; font-weight: 700;">
              {{event_name}}
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 17px; margin: 0;">
              🗓️ {{event_date}} | 🌐 En ligne
            </p>
          </div>

          <div style="padding: 40px 30px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #0ea5e9; padding: 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #0c4a6e; font-size: 16px; margin: 0;">
                <strong>👋 Salut {{participant_firstname}} !</strong><br>
                <span style="color: #075985; margin-top: 8px; display: block;">
                  Préparez-vous pour un webinar interactif et enrichissant !
                </span>
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Nous sommes ravis de vous inviter à notre webinar <strong style="color: #6366f1;">{{event_name}}</strong>.
              Une session en ligne interactive avec des experts, des démonstrations pratiques et une session Q&A.
            </p>

            <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #1f2937; margin: 0 0 18px 0; font-size: 18px; text-align: center;">
                📺 Ce qui vous attend
              </h3>
              <div style="color: #4b5563; font-size: 15px; line-height: 2;">
                <div style="margin-bottom: 10px;">
                  <span style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px;">💡</span>
                  Présentation par des experts reconnus
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px;">🛠️</span>
                  Démonstrations pratiques en direct
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px;">❓</span>
                  Session Questions & Réponses interactive
                </div>
                <div>
                  <span style="display: inline-block; width: 30px; height: 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px;">📥</span>
                  Ressources et support téléchargeables
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                🎥 Réserver ma place
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600;">
                ⚡ Accès gratuit • 🎁 Replay disponible 24h • 📜 Certificat de participation
              </p>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #374151; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                📌 Informations pratiques
              </h4>
              <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                ✅ Connexion 10 minutes avant le début<br>
                ✅ Lien de connexion envoyé 24h avant l'événement<br>
                ✅ Compatible ordinateur, tablette et smartphone<br>
                ✅ Aucune installation requise
              </p>
            </div>

            <p style="color: #9ca3af; font-size: 13px; margin: 30px 0 0 0; text-align: center; line-height: 1.5;">
              À très bientôt en ligne ! 👋<br>
              <strong>L'équipe {{event_name}}</strong><br>
              Lien d'inscription : {{landing_url}}
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'sport-competition',
      name: 'Sport & Compétition',
      subject: '🏆 {{event_name}} - Inscription aux épreuves',
      html_content: `
        <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: 0 auto; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); padding: 45px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(10px);">
              <span style="color: white; font-size: 12px; font-weight: 700; text-transform: uppercase;">Édition 2025</span>
            </div>
            <div style="font-size: 60px; margin-bottom: 15px;">🏆</div>
            <h1 style="color: white; margin: 0 0 10px 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 8px rgba(0,0,0,0.3);">
              {{event_name}}
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 18px; font-weight: 600; margin: 0;">
              📅 {{event_date}} | 📍 {{event_location}}
            </p>
          </div>

          <div style="background: white; padding: 40px 35px;">
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 5px solid #dc2626; padding: 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #7f1d1d; font-size: 18px; margin: 0; font-weight: 700;">
                🎯 Bonjour {{participant_firstname}} {{participant_lastname}} !
              </p>
              <p style="color: #991b1b; font-size: 15px; margin: 8px 0 0 0;">
                Prêt(e) à relever le défi ?
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
              Nous sommes ravis de vous inviter à participer à <strong style="color: #dc2626;">{{event_name}}</strong> !
              Un événement sportif d'envergure qui rassemble les meilleurs athlètes et passionnés.
            </p>

            <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; text-align: center;">
                🏅 Épreuves disponibles
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 18px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">🏃</div>
                  <div style="color: #475569; font-weight: 600; font-size: 14px;">Course 5km</div>
                </div>
                <div style="background: white; padding: 18px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">🏃‍♂️</div>
                  <div style="color: #475569; font-weight: 600; font-size: 14px;">Course 10km</div>
                </div>
                <div style="background: white; padding: 18px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">🚴</div>
                  <div style="color: #475569; font-weight: 600; font-size: 14px;">Cyclisme</div>
                </div>
                <div style="background: white; padding: 18px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;">
                  <div style="font-size: 32px; margin-bottom: 8px;">👨‍👩‍👧‍👦</div>
                  <div style="color: #475569; font-weight: 600; font-size: 14px;">Épreuves Kids</div>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #78350f; margin: 0 0 15px 0; font-size: 17px; font-weight: 700;">
                ⚡ Inscription rapide
              </h4>
              <ol style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 15px;">
                <li>Choisissez vos épreuves</li>
                <li>Remplissez vos informations</li>
                <li>Validez votre inscription</li>
                <li>Recevez votre dossard par email</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 18px 45px; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 17px; display: inline-block; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                🏃 Je m'inscris maintenant
              </a>
            </div>

            <div style="background: #fee2e2; border-radius: 8px; padding: 18px; margin: 25px 0; text-align: center;">
              <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 600;">
                ⏰ Inscriptions limitées • 🎁 Goodies offerts • 🏅 Médaille pour tous les finishers
              </p>
            </div>

            <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Que le meilleur gagne ! 💪<br>
              <strong>L'équipe organisatrice {{event_name}}</strong><br>
              Contact : {{participant_email}}
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'save-the-date',
      name: 'Save The Date',
      subject: '📅 Save The Date - {{event_name}}',
      html_content: `
        <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(180deg, #fef9f3 0%, #ffffff 100%); padding: 50px 30px; text-align: center; border-bottom: 3px solid #d4af37;">
            <div style="font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; font-weight: 600;">
              Save The Date
            </div>
            <h1 style="color: #1f2937; margin: 0 0 25px 0; font-size: 42px; font-weight: 300; line-height: 1.2;">
              {{event_name}}
            </h1>
            <div style="background: #d4af37; width: 80px; height: 2px; margin: 0 auto 30px;"></div>
            <div style="background: white; border: 2px solid #d4af37; padding: 25px 30px; display: inline-block; border-radius: 4px;">
              <div style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Date & Heure</div>
              <div style="color: #1f2937; font-size: 24px; font-weight: 600; margin-bottom: 15px;">{{event_date}}</div>
              <div style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Lieu</div>
              <div style="color: #1f2937; font-size: 18px; font-weight: 500;">{{event_location}}</div>
            </div>
          </div>

          <div style="padding: 45px 35px;">
            <p style="color: #4b5563; font-size: 17px; line-height: 1.8; text-align: center; margin: 0 0 30px 0;">
              Cher(ère) <strong>{{participant_firstname}}</strong>,
            </p>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.8; text-align: center; margin: 0 0 35px 0;">
              Nous avons le plaisir de vous annoncer que <strong style="color: #1f2937;">{{event_name}}</strong>
              aura lieu prochainement. Réservez dès maintenant cette date dans votre agenda !
            </p>

            <div style="background: #fef9f3; border-left: 4px solid #d4af37; padding: 25px; margin: 30px 0;">
              <p style="color: #92400e; font-size: 15px; margin: 0; line-height: 1.7; font-style: italic;">
                ✨ Une invitation formelle avec tous les détails suivra prochainement<br>
                📧 Restez attentif à vos emails<br>
                🗓️ Marquez cette date comme importante
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}"
                 style="background: #1f2937; color: white; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 15px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; border: 2px solid #1f2937;">
                Plus d'informations
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Nous avons hâte de vous retrouver !<br>
              <strong style="color: #6b7280;">L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'countdown-reminder',
      name: 'Rappel Compte à Rebours',
      subject: '⏰ Plus que quelques jours - {{event_name}}',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
            <div style="background: rgba(255,255,255,0.15); border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3);">
              <div style="text-align: center;">
                <div style="color: white; font-size: 36px; font-weight: 900; line-height: 1;">3</div>
                <div style="color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Jours</div>
              </div>
            </div>
            <h1 style="color: white; margin: 0 0 12px 0; font-size: 28px; font-weight: 700;">
              {{event_name}}
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
              📅 {{event_date}} • 📍 {{event_location}}
            </p>
          </div>

          <div style="background: #1e293b; padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #f1f5f9; font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">
                ⏰ Le compte à rebours a commencé !
              </p>
              <p style="color: #cbd5e1; font-size: 15px; margin: 0;">
                Bonjour {{participant_firstname}}, ne manquez pas cet événement !
              </p>
            </div>

            <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
              L'événement <strong style="color: #e2e8f0;">{{event_name}}</strong> commence dans seulement
              <strong style="color: #f97316;">3 jours</strong> ! Assurez-vous d'être prêt(e) et de ne rien manquer.
            </p>

            <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #fca5a5; margin: 0 0 15px 0; font-size: 18px; text-align: center;">
                ✅ Derniers préparatifs
              </h3>
              <div style="color: #cbd5e1; font-size: 15px; line-height: 2;">
                <div>📋 Vérifiez votre inscription et vos sessions</div>
                <div>🎫 Téléchargez votre billet d'entrée</div>
                <div>🗺️ Consultez l'itinéraire vers le lieu</div>
                <div>📱 Activez les notifications de rappel</div>
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 18px 45px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                🎫 Accéder à mon billet
              </a>
            </div>

            <div style="background: rgba(251, 191, 36, 0.1); border-radius: 8px; padding: 18px; margin: 25px 0; text-align: center;">
              <p style="color: #fcd34d; margin: 0; font-size: 14px; font-weight: 600;">
                ⚡ Dernier rappel avant l'événement • On vous attend nombreux !
              </p>
            </div>

            <p style="color: #64748b; font-size: 13px; margin: 30px 0 0 0; text-align: center; line-height: 1.5;">
              À très bientôt ! 🎉<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'speaker-announcement',
      name: 'Annonce Conférenciers',
      subject: '🎤 Découvrez nos intervenants - {{event_name}}',
      html_content: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 45px 30px; text-align: center;">
            <div style="color: rgba(255,255,255,0.9); font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; font-weight: 600;">
              Programme & Intervenants
            </div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 34px; font-weight: 700;">
              {{event_name}}
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
              {{event_date}} • {{event_location}}
            </p>
          </div>

          <div style="padding: 45px 35px; background: #f8fafc;">
            <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
              Bonjour {{participant_firstname}},
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 35px 0; text-align: center;">
              Nous sommes ravis de vous dévoiler la liste complète des intervenants exceptionnels qui prendront part à <strong style="color: #0f172a;">{{event_name}}</strong> !
            </p>

            <div style="background: white; border-radius: 12px; padding: 30px; margin: 30px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
              <h3 style="color: #14b8a6; margin: 0 0 25px 0; font-size: 22px; text-align: center;">
                🎤 Nos Speakers
              </h3>

              <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="background: linear-gradient(135deg, #14b8a6, #06b6d4); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: white; font-size: 24px; font-weight: 700;">1</span>
                  </div>
                  <div>
                    <div style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Speaker Expert</div>
                    <div style="color: #64748b; font-size: 14px; font-style: italic;">Expert en Innovation</div>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="background: linear-gradient(135deg, #14b8a6, #06b6d4); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: white; font-size: 24px; font-weight: 700;">2</span>
                  </div>
                  <div>
                    <div style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Leader Visionnaire</div>
                    <div style="color: #64748b; font-size: 14px; font-style: italic;">CEO & Fondateur</div>
                  </div>
                </div>
              </div>

              <div>
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="background: linear-gradient(135deg, #14b8a6, #06b6d4); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: white; font-size: 24px; font-weight: 700;">3</span>
                  </div>
                  <div>
                    <div style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 5px;">Expert International</div>
                    <div style="color: #64748b; font-size: 14px; font-style: italic;">Conférencier Keynote</div>
                  </div>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #14b8a6, #06b6d4); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 8px 20px rgba(20, 184, 166, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Voir le programme complet
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #ecfdf5, #f0fdfa); border-left: 4px solid #14b8a6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #065f46; margin: 0; font-size: 15px; line-height: 1.7;">
                💡 <strong>Ne manquez aucune session</strong><br>
                Inscrivez-vous dès maintenant aux sessions qui vous intéressent pour garantir votre place !
              </p>
            </div>

            <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              À bientôt pour cet événement exceptionnel !<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'networking-focus',
      name: 'Networking & Rencontres',
      subject: '🤝 Networking à {{event_name}} - Connectez-vous',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #fafafa;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">🤝</div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 32px; font-weight: 700;">
              Networking à {{event_name}}
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
              Connectez-vous avec des professionnels
            </p>
          </div>

          <div style="background: white; padding: 40px 30px;">
            <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
              Bonjour {{participant_firstname}} !
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
              <strong style="color: #2563eb;">{{event_name}}</strong> est l'occasion idéale pour élargir votre réseau professionnel et créer des connexions durables.
            </p>

            <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #1e40af; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                🎯 Opportunités de Networking
              </h3>
              <div style="color: #1e40af; font-size: 15px; line-height: 2.2;">
                <div style="margin-bottom: 12px;">
                  <strong>☕ Sessions Café Networking</strong><br>
                  <span style="color: #3730a3; font-size: 14px;">Rencontres informelles entre sessions</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <strong>🍽️ Déjeuner Networking</strong><br>
                  <span style="color: #3730a3; font-size: 14px;">Tables thématiques par secteur</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <strong>🎤 Speed Networking</strong><br>
                  <span style="color: #3730a3; font-size: 14px;">Rencontrez 20+ professionnels en 1h</span>
                </div>
                <div>
                  <strong>📱 Plateforme Digitale</strong><br>
                  <span style="color: #3730a3; font-size: 14px;">Connectez-vous avant, pendant et après</span>
                </div>
              </div>
            </div>

            <div style="background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 10px; padding: 25px; margin: 30px 0; text-align: center;">
              <div style="color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                Votre profil networking
              </div>
              <div style="color: #1f2937; font-size: 18px; font-weight: 700; margin-bottom: 5px;">
                {{participant_firstname}} {{participant_lastname}}
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                {{participant_email}}
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                🚀 Préparer mon networking
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.7; text-align: center;">
                💡 <strong>Conseil Pro :</strong> Préparez votre pitch et vos cartes de visite pour maximiser vos rencontres !
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Hâte de vous voir networker ! 🎉<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'vip-exclusive',
      name: 'VIP Exclusif',
      subject: '⭐ Accès VIP - {{event_name}} - Invitation Exclusive',
      html_content: `
        <div style="font-family: 'Garamond', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background: #000000;">
          <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 50px 30px; text-align: center; border-bottom: 2px solid #ffd700;">
            <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);">
              <span style="font-size: 45px;">⭐</span>
            </div>
            <div style="color: #ffd700; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px; font-weight: 700;">
              Accès VIP Exclusif
            </div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 36px; font-weight: 300; letter-spacing: 2px;">
              {{event_name}}
            </h1>
            <div style="width: 60px; height: 1px; background: #ffd700; margin: 0 auto 20px;"></div>
            <p style="color: #d4d4d4; font-size: 16px; margin: 0; font-style: italic;">
              {{event_date}} • {{event_location}}
            </p>
          </div>

          <div style="background: #1a1a1a; padding: 45px 35px;">
            <p style="color: #ffd700; font-size: 20px; font-weight: 300; margin: 0 0 25px 0; text-align: center; letter-spacing: 1px;">
              {{participant_firstname}} {{participant_lastname}}
            </p>

            <p style="color: #d4d4d4; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
              Vous avez été sélectionné(e) pour bénéficier d'un <strong style="color: #ffd700;">accès VIP exclusif</strong>
              à notre événement premium <strong style="color: white;">{{event_name}}</strong>.
            </p>

            <div style="background: linear-gradient(135deg, #2a2a2a, #1f1f1f); border: 2px solid #ffd700; border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #ffd700; margin: 0 0 25px 0; font-size: 20px; text-align: center; font-weight: 600;">
                ✨ Privilèges VIP Inclus
              </h3>
              <div style="color: #d4d4d4; font-size: 15px; line-height: 2.2;">
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333;">
                  <strong style="color: #ffd700;">🎫 Accès Prioritaire</strong><br>
                  <span style="color: #a3a3a3; font-size: 14px;">Entrée VIP sans file d'attente</span>
                </div>
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333;">
                  <strong style="color: #ffd700;">🍾 Lounge VIP Privé</strong><br>
                  <span style="color: #a3a3a3; font-size: 14px;">Espace exclusif avec restauration premium</span>
                </div>
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333;">
                  <strong style="color: #ffd700;">🎤 Meet & Greet Speakers</strong><br>
                  <span style="color: #a3a3a3; font-size: 14px;">Session privée avec les intervenants</span>
                </div>
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333;">
                  <strong style="color: #ffd700;">📸 Kit VIP Personnalisé</strong><br>
                  <span style="color: #a3a3a3; font-size: 14px;">Goodies exclusifs et certificat VIP</span>
                </div>
                <div>
                  <strong style="color: #ffd700;">💼 Networking Exclusif</strong><br>
                  <span style="color: #a3a3a3; font-size: 14px;">Accès au réseau VIP fermé</span>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #ffd700, #ffed4e); color: #000000; padding: 18px 45px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4); text-transform: uppercase; letter-spacing: 2px;">
                ⭐ Activer mon accès VIP
              </a>
            </div>

            <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #ffd700; margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                🔐 ACCÈS LIMITÉ • INVITATION STRICTEMENT PERSONNELLE
              </p>
            </div>

            <p style="color: #737373; font-size: 13px; margin: 30px 0 0 0; text-align: center; line-height: 1.6; font-style: italic;">
              Nous sommes honorés de votre présence<br>
              <strong style="color: #a3a3a3;">L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'early-bird',
      name: 'Early Bird Promo',
      subject: '🐦 Early Bird - {{event_name}} - Offre Limitée',
      html_content: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%); padding: 10px; text-align: center;">
            <div style="background: #78350f; color: #fef3c7; display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
              ⚡ Offre Early Bird - Derniers Jours
            </div>
          </div>

          <div style="background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 15px;">🐦</div>
            <h1 style="color: #78350f; margin: 0 0 15px 0; font-size: 34px; font-weight: 700;">
              {{event_name}}
            </h1>
            <p style="color: #92400e; font-size: 17px; margin: 0;">
              📅 {{event_date}} • 📍 {{event_location}}
            </p>
          </div>

          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                Bonjour {{participant_firstname}} !
              </p>
              <p style="color: #4b5563; font-size: 16px; margin: 0;">
                Profitez de notre offre Early Bird avant qu'il ne soit trop tard !
              </p>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 15px; padding: 30px; margin: 30px 0; text-align: center;">
              <div style="color: #78350f; font-size: 16px; font-weight: 600; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">
                Offre Spéciale Early Bird
              </div>
              <div style="color: #92400e; font-size: 48px; font-weight: 900; margin: 15px 0;">
                -30%
              </div>
              <div style="color: #a16207; font-size: 15px; margin-top: 10px;">
                Sur votre inscription
              </div>
              <div style="background: #ef4444; color: white; display: inline-block; padding: 8px 20px; border-radius: 20px; margin-top: 15px; font-size: 13px; font-weight: 700;">
                ⏰ Expire dans 48h
              </div>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 19px; text-align: center;">
                🎁 Inclus dans votre Early Bird
              </h3>
              <div style="color: #4b5563; font-size: 15px; line-height: 2;">
                <div>✅ Accès à toutes les sessions</div>
                <div>✅ Kit participant complet</div>
                <div>✅ Déjeuners & pauses café</div>
                <div>✅ Certificat de participation</div>
                <div>✅ Accès plateforme networking</div>
                <div>✅ Replay des conférences</div>
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; padding: 18px 45px; text-decoration: none; border-radius: 30px; font-weight: 800; font-size: 17px; display: inline-block; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                🐦 Profiter de l'offre
              </a>
            </div>

            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 18px; margin: 30px 0;">
              <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 600;">
                ⚠️ Attention : Places limitées à tarif Early Bird. L'offre expire automatiquement après 48 heures ou épuisement des places.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Ne manquez pas cette opportunité ! 🚀<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'thank-you-confirmation',
      name: 'Merci & Confirmation',
      subject: '✅ Inscription confirmée - {{event_name}}',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 45px 30px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
              <span style="font-size: 45px;">✅</span>
            </div>
            <h1 style="color: white; margin: 0 0 12px 0; font-size: 32px; font-weight: 700;">
              Inscription Confirmée !
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
              Bienvenue à {{event_name}}
            </p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
              Merci {{participant_firstname}} ! 🎉
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
              Votre inscription à <strong style="color: #10b981;">{{event_name}}</strong> a été confirmée avec succès. Nous avons hâte de vous accueillir !
            </p>

            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 18px; text-align: center; font-weight: 700;">
                📋 Récapitulatif de votre inscription
              </h3>
              <table style="width: 100%; color: #047857; font-size: 15px;">
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Participant :</td>
                  <td style="padding: 10px 0; text-align: right;">{{participant_firstname}} {{participant_lastname}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Email :</td>
                  <td style="padding: 10px 0; text-align: right;">{{participant_email}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Événement :</td>
                  <td style="padding: 10px 0; text-align: right;">{{event_name}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Date :</td>
                  <td style="padding: 10px 0; text-align: right;">{{event_date}}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: 600;">Lieu :</td>
                  <td style="padding: 10px 0; text-align: right;">{{event_location}}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f3f4f6; border-radius: 10px; padding: 25px; margin: 30px 0;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 17px; font-weight: 700;">
                📌 Prochaines étapes
              </h4>
              <ol style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 2;">
                <li>Consultez votre email pour accéder à votre billet</li>
                <li>Téléchargez l'application mobile de l'événement</li>
                <li>Sélectionnez vos sessions préférées</li>
                <li>Préparez vos questions pour les speakers</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{ticket_url}}"
                 style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.5px; margin-right: 10px;">
                🎫 Mon Billet
              </a>
              <a href="{{landing_url}}"
                 style="background: white; color: #10b981; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; border: 2px solid #10b981; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Programme
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 8px; padding: 18px; margin: 30px 0; text-align: center;">
              <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">
                💡 Ajoutez l'événement à votre calendrier pour ne rien manquer !
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Des questions ? Contactez-nous à {{participant_email}}<br>
              <strong>À très bientôt ! 🎉</strong><br>
              L'équipe {{event_name}}
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'last-chance',
      name: 'Dernière Chance',
      subject: '⚠️ Dernière chance - {{event_name}} - Places limitées',
      html_content: `
        <div style="font-family: 'Arial Black', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fafafa;">
          <div style="background: #ef4444; padding: 12px; text-align: center;">
            <div style="color: white; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; animation: pulse 2s infinite;">
              ⚠️ ALERTE DERNIÈRE CHANCE ⚠️
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 45px 30px; text-align: center;">
            <div style="color: #fbbf24; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">
              Il ne reste que
            </div>
            <div style="background: #ef4444; color: white; display: inline-block; padding: 20px 40px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5);">
              <div style="font-size: 50px; font-weight: 900; line-height: 1;">12</div>
              <div style="font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Places</div>
            </div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
              {{event_name}}
            </h1>
            <p style="color: #d1d5db; font-size: 16px; margin: 0;">
              📅 {{event_date}} • 📍 {{event_location}}
            </p>
          </div>

          <div style="background: white; padding: 40px 30px;">
            <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border-left: 5px solid #ef4444; padding: 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #7f1d1d; font-size: 18px; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase;">
                ⏰ Urgence {{participant_firstname}} !
              </p>
              <p style="color: #991b1b; font-size: 15px; margin: 0; font-weight: 700;">
                Les inscriptions ferment dans moins de 24 heures !
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; text-align: center;">
              <strong style="color: #ef4444;">{{event_name}}</strong> affiche complet !
              Seulement <strong style="color: #ef4444;">12 places restantes</strong> sur plus de 500 inscrits.
            </p>

            <div style="background: #1f2937; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <div style="color: #fbbf24; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
                ⏳ Compte à Rebours Final
              </div>
              <div style="display: flex; justify-content: center; gap: 15px;">
                <div style="background: #ef4444; color: white; padding: 15px 20px; border-radius: 8px; min-width: 70px;">
                  <div style="font-size: 32px; font-weight: 900;">23</div>
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase;">Heures</div>
                </div>
                <div style="background: #ef4444; color: white; padding: 15px 20px; border-radius: 8px; min-width: 70px;">
                  <div style="font-size: 32px; font-weight: 900;">47</div>
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase;">Minutes</div>
                </div>
                <div style="background: #ef4444; color: white; padding: 15px 20px; border-radius: 8px; min-width: 70px;">
                  <div style="font-size: 32px; font-weight: 900;">32</div>
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase;">Secondes</div>
                </div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 3px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #78350f; margin: 0 0 15px 0; font-size: 18px; font-weight: 900; text-align: center; text-transform: uppercase;">
                ⚡ Ne Ratez Pas
              </h3>
              <div style="color: #92400e; font-size: 15px; font-weight: 700; line-height: 2;">
                <div>✅ 20+ Speakers internationaux</div>
                <div>✅ 40+ Sessions exclusives</div>
                <div>✅ Networking premium</div>
                <div>✅ Kit participant complet</div>
                <div>✅ Certificat officiel</div>
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px 50px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 18px; display: inline-block; box-shadow: 0 15px 35px rgba(239, 68, 68, 0.5); text-transform: uppercase; letter-spacing: 2px; animation: shake 0.5s infinite;">
                🔥 Réserver ma place maintenant
              </a>
            </div>

            <div style="background: #7f1d1d; color: white; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="margin: 0; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
                ⚠️ APRÈS CETTE DATE, IL SERA TROP TARD ! ⚠️
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Ne laissez pas passer cette opportunité unique !<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'post-event-survey',
      name: 'Enquête Post-Événement',
      subject: '📝 Votre avis compte - {{event_name}}',
      html_content: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">💜</div>
            <h1 style="color: white; margin: 0 0 12px 0; font-size: 32px; font-weight: 700;">
              Merci d'avoir participé !
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
              Votre avis nous aide à nous améliorer
            </p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
              Bonjour {{participant_firstname}},
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
              Nous espérons que vous avez apprécié <strong style="color: #8b5cf6;">{{event_name}}</strong> !
              Votre retour d'expérience est précieux pour nous aider à organiser des événements encore meilleurs.
            </p>

            <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
              <h3 style="color: #5b21b6; margin: 0 0 20px 0; font-size: 20px;">
                ⭐ Partagez votre expérience
              </h3>
              <p style="color: #6b21a8; margin: 0 0 25px 0; font-size: 15px; line-height: 1.7;">
                Prenez 2 minutes pour répondre à notre questionnaire de satisfaction.
                Votre avis nous permettra d'améliorer nos futurs événements.
              </p>
              <div style="color: #7c3aed; font-size: 14px; font-weight: 600;">
                ⏱️ Durée estimée : 2 minutes
              </div>
            </div>

            <div style="background: #f9fafb; border-radius: 10px; padding: 25px; margin: 30px 0;">
              <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 17px; font-weight: 700; text-align: center;">
                📊 Thèmes du questionnaire
              </h4>
              <div style="color: #4b5563; font-size: 15px; line-height: 2;">
                <div>✓ Qualité du contenu et des sessions</div>
                <div>✓ Organisation et logistique</div>
                <div>✓ Intervenants et animations</div>
                <div>✓ Opportunités de networking</div>
                <div>✓ Suggestions d'amélioration</div>
              </div>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 18px 45px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                📝 Répondre au questionnaire
              </a>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600; line-height: 1.7;">
                🎁 <strong>Bonus :</strong> En remerciement, vous recevrez un accès prioritaire aux inscriptions pour notre prochain événement !
              </p>
            </div>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 35px; text-align: center;">
              <p style="color: #6b7280; font-size: 15px; margin: 0 0 15px 0; line-height: 1.7;">
                <strong style="color: #1f2937;">Vous souhaitez partager votre expérience ?</strong><br>
                Identifiez-nous sur les réseaux sociaux avec #{{event_name}}
              </p>
              <div style="margin-top: 20px;">
                <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none;">📘 Facebook</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none;">🐦 Twitter</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none;">📸 Instagram</a>
                <a href="#" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none;">💼 LinkedIn</a>
              </div>
            </div>

            <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Merci encore pour votre participation ! 🙏<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
          </div>
        </div>
      `
    },
    {
      id: 'hybrid-event',
      name: 'Événement Hybride',
      subject: '🌐 {{event_name}} - Présentiel & En Ligne',
      html_content: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%); padding: 45px 30px; text-align: center;">
            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px;">
              <div style="background: rgba(255,255,255,0.2); padding: 15px 20px; border-radius: 10px; backdrop-filter: blur(10px);">
                <div style="font-size: 30px; margin-bottom: 5px;">🏢</div>
                <div style="color: white; font-size: 12px; font-weight: 600; text-transform: uppercase;">Présentiel</div>
              </div>
              <div style="color: white; font-size: 30px; align-self: center;">+</div>
              <div style="background: rgba(255,255,255,0.2); padding: 15px 20px; border-radius: 10px; backdrop-filter: blur(10px);">
                <div style="font-size: 30px; margin-bottom: 5px;">💻</div>
                <div style="color: white; font-size: 12px; font-weight: 600; text-transform: uppercase;">En Ligne</div>
              </div>
            </div>
            <div style="color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; font-weight: 700;">
              Événement Hybride
            </div>
            <h1 style="color: white; margin: 0 0 15px 0; font-size: 34px; font-weight: 700;">
              {{event_name}}
            </h1>
            <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 0;">
              📅 {{event_date}} • 📍 {{event_location}} & En ligne
            </p>
          </div>

          <div style="padding: 45px 35px;">
            <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
              Bonjour {{participant_firstname}},
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
              Participez à <strong style="color: #0891b2;">{{event_name}}</strong> selon vos préférences :
              sur place pour une expérience immersive, ou en ligne pour plus de flexibilité !
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #ecfeff, #cffafe); border: 2px solid #06b6d4; border-radius: 12px; padding: 25px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">🏢</div>
                <h3 style="color: #0e7490; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">
                  Présentiel
                </h3>
                <div style="color: #155e75; font-size: 14px; line-height: 1.8;">
                  <div>✓ Networking direct</div>
                  <div>✓ Expérience complète</div>
                  <div>✓ Déjeuner inclus</div>
                  <div>✓ Kit participant</div>
                </div>
                <div style="margin-top: 20px;">
                  <a href="{{landing_url}}"
                     style="background: #0891b2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; font-weight: 700; font-size: 14px; display: inline-block; text-transform: uppercase;">
                    Présentiel
                  </a>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 12px; padding: 25px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">💻</div>
                <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">
                  En Ligne
                </h3>
                <div style="color: #075985; font-size: 14px; line-height: 1.8;">
                  <div>✓ Depuis chez vous</div>
                  <div>✓ Accès flexible</div>
                  <div>✓ Chat interactif</div>
                  <div>✓ Replay 48h</div>
                </div>
                <div style="margin-top: 20px;">
                  <a href="{{landing_url}}"
                     style="background: #0ea5e9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; font-weight: 700; font-size: 14px; display: inline-block; text-transform: uppercase;">
                    En Ligne
                  </a>
                </div>
              </div>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; text-align: center; font-weight: 700;">
                📋 Programme Identique
              </h3>
              <p style="color: #475569; margin: 0 0 20px 0; font-size: 15px; text-align: center; line-height: 1.7;">
                Que vous soyez présent physiquement ou en ligne, vous profiterez du même contenu de qualité et pourrez interagir avec les intervenants.
              </p>
              <div style="color: #64748b; font-size: 14px; line-height: 2; text-align: center;">
                <div>🎤 Conférences en direct</div>
                <div>❓ Sessions Q&A interactives</div>
                <div>🎁 Ressources téléchargeables</div>
                <div>📜 Certificat de participation</div>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.7;">
                💡 <strong>Astuce :</strong> Vous pouvez changer votre mode de participation jusqu'à 48h avant l'événement via votre espace personnel.
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="{{landing_url}}"
                 style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 18px 45px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(6, 182, 212, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                🎯 Choisir mon mode de participation
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0; text-align: center; line-height: 1.6;">
              Quel que soit votre choix, nous serons ravis de vous compter parmi nous ! 🎉<br>
              <strong>L'équipe {{event_name}}</strong>
            </p>
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
