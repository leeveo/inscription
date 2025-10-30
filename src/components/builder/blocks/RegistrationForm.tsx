'use client'

import React, { useState } from 'react'
import { Element, useNode } from '@craftjs/core'
import { supabaseBrowser } from '@/lib/supabase/client'

// Composant pour les sessions dynamiques
const DynamicSessions = ({ eventId, selectedSessions, onSessionChange }: {
  eventId: string
  selectedSessions: string[]
  onSessionChange: (sessionId: string, checked: boolean) => void
}) => {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (eventId) {
      loadSessions()
    }
  }, [eventId])

  const loadSessions = async () => {
    console.log(`📚 Chargement des sessions pour l'événement ${eventId}...`)
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      console.log('🔌 Client Supabase initialisé pour le chargement des sessions')

      const { data, error } = await supabase
        .from('inscription_sessions')
        .select('*')
        .eq('evenement_id', eventId)
        .order('date', { ascending: true })
        .order('heure_debut', { ascending: true })

      if (error) {
        console.error('❌ Erreur lors de la requête des sessions:', error)
        throw error
      }

      console.log(`✅ ${data?.length || 0} sessions récupérées pour l'événement ${eventId}:`, data)
      setSessions(data || [])
    } catch (error) {
      console.error('💥 Erreur lors du chargement des sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Chargement des sessions...</p>
  }

  if (sessions.length === 0) {
    return <p className="text-sm text-gray-500">Aucune session disponible pour cet événement.</p>
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <label key={session.id} className="flex items-center">
          <input
            type="checkbox"
            checked={selectedSessions.includes(session.id.toString())}
            onChange={(e) => onSessionChange(session.id.toString(), e.target.checked)}
            className="mr-2"
          />
          <span>
            {session.titre} - {new Date(session.date).toLocaleDateString('fr-FR')} {session.heure_debut} - {session.heure_fin}
            {session.lieu && <span className="text-gray-500"> • {session.lieu}</span>}
            {session.intervenant && <span className="text-gray-500"> • {session.intervenant}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

interface RegistrationFormProps {
  eventId?: string
  title?: string
  description?: string
  showSessions?: boolean
  showSocialMedia?: boolean
  requiredFields?: string[]
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
  className?: string
  width?: string
  horizontalAlign?: string
  recipientEmail?: string
  autoSelectEvent?: boolean
}

export const RegistrationForm = React.forwardRef<HTMLDivElement, RegistrationFormProps>(({
  eventId = '',
  title = "Formulaire d'inscription",
  description = "Remplissez ce formulaire pour vous inscrire à l'événement",
  showSessions = true,
  showSocialMedia = true,
  requiredFields = ['nom', 'prenom', 'email', 'telephone'],
  submitButtonText = "S'inscrire à l'événement",
  successMessage = "Inscription réussie !",
  errorMessage = "Une erreur est survenue lors de l'inscription.",
  className = "my-4",
  width = '100%',
  horizontalAlign = 'left',
  recipientEmail = '',
  autoSelectEvent = false
}, ref) => {
  // Fonction pour obtenir le style d'alignement horizontal
  const getHorizontalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return { marginLeft: 'auto', marginRight: 'auto', display: 'block' };
      case 'right':
        return { marginLeft: 'auto', marginRight: '0', display: 'block' };
      case 'left':
      default:
        return { marginLeft: '0', marginRight: '0', display: 'block' };
    }
  };

  const alignStyle = getHorizontalAlignStyle(horizontalAlign);

  // Log initialisation du composant
  React.useEffect(() => {
    console.log('🎨 RegistrationForm initialisé avec les props:', {
      eventId,
      autoSelectEvent,
      recipientEmail,
      showSessions,
      showSocialMedia
    })
  }, [])

  // États pour la gestion du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [availableEvents, setAvailableEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState(eventId || '')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    url_linkedin: '',
    url_facebook: '',
    url_twitter: '',
    url_instagram: '',
    message: '',
    consent: false,
    sessions: [] as string[]
  })

  // Charger les événements disponibles si autoSelectEvent est activé
  React.useEffect(() => {
    if (autoSelectEvent) {
      loadAvailableEvents()
    }
  }, [autoSelectEvent])

  const loadAvailableEvents = async () => {
    console.log('📅 Chargement des événements disponibles...')
    try {
      const supabase = supabaseBrowser()
      console.log('🔌 Client Supabase initialisé pour le chargement des événements')

      const { data, error } = await supabase
        .from('inscription_evenements')
        .select('id, nom, date_debut, lieu')
        .eq('statut', 'publié')
        .order('date_debut', { ascending: true })

      if (error) {
        console.error('❌ Erreur lors de la requête des événements:', error)
        throw error
      }

      console.log('✅ Événements récupérés:', data)
      setAvailableEvents(data || [])

      // Si aucun événement n'est sélectionné et qu'il y a des événements, sélectionner le premier
      if (!selectedEventId && data && data.length > 0) {
        console.log('🎯 Auto-sélection du premier événement:', data[0].id)
        setSelectedEventId(data[0].id)
      } else if (data && data.length === 0) {
        console.log('⚠️ Aucun événement publié trouvé')
      }
    } catch (error) {
      console.error('💥 Erreur lors du chargement des événements:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSessionChange = (sessionId: string, checked: boolean) => {
    console.log(`🔄 Session ${sessionId} ${checked ? 'ajoutée' : 'retirée'} des sélections`)
    setFormData(prev => ({
      ...prev,
      sessions: checked
        ? [...prev.sessions, sessionId]
        : prev.sessions.filter(id => id !== sessionId)
    }))
    console.log('📚 Sessions actuelles:', checked
      ? [...formData.sessions, sessionId]
      : formData.sessions.filter(id => id !== sessionId)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🚀 Début de la soumission du formulaire')
    console.log('📋 Données du formulaire:', formData)
    console.log('🎯 Événement sélectionné:', selectedEventId)
    console.log('📧 Email destinataire:', recipientEmail)

    if (!selectedEventId) {
      console.log('❌ Aucun événement sélectionné')
      setSubmitStatus('error')
      setSubmitMessage('Veuillez sélectionner un événement')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const supabase = supabaseBrowser()
      console.log('🔌 Client Supabase initialisé')

      // Créer le participant
      const participantData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        profession: formData.profession || null,
        url_linkedin: formData.url_linkedin || null,
        url_facebook: formData.url_facebook || null,
        url_twitter: formData.url_twitter || null,
        url_instagram: formData.url_instagram || null,
        evenement_id: selectedEventId
      }

      console.log('👤 Données du participant à insérer:', participantData)

      const { data: newParticipant, error: participantError } = await supabase
        .from('inscription_participants')
        .insert(participantData)
        .select()
        .single()

      if (participantError) {
        console.error('❌ Erreur lors de la création du participant:', participantError)
        throw participantError
      }

      console.log('✅ Participant créé avec succès:', newParticipant)

      // Générer un token pour la landing page
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      console.log('🎟️ Token QR généré:', token)

      const tokenData = {
        participant_id: newParticipant.id,
        evenement_id: selectedEventId,
        qr_token: token,
        ticket_url: `${window.location.origin}/ticket/${newParticipant.id}`,
        is_active: true
      }

      console.log('🎫 Données du token QR à insérer:', tokenData)

      const { error: tokenError } = await supabase
        .from('inscription_participant_qr_tokens')
        .insert(tokenData)

      if (tokenError) {
        console.error('❌ Erreur lors de la création du token QR:', tokenError)
        throw tokenError
      }

      console.log('✅ Token QR créé avec succès')

      // Inscrire aux sessions si sélectionnées
      if (formData.sessions.length > 0) {
        console.log('📚 Sessions sélectionnées:', formData.sessions)

        const sessionEnrollments = formData.sessions.map(sessionId => ({
          session_id: parseInt(sessionId),
          participant_id: newParticipant.id
        }))

        console.log('📝 Inscriptions aux sessions à créer:', sessionEnrollments)

        const { error: sessionError } = await supabase
          .from('inscription_session_participants')
          .insert(sessionEnrollments)

        if (sessionError) {
          console.error('❌ Erreur lors de l\'inscription aux sessions:', sessionError)
          throw sessionError
        }

        console.log('✅ Inscriptions aux sessions créées avec succès')
      } else {
        console.log('ℹ️ Aucune session sélectionnée')
      }

      // Envoyer un email de notification si destinataire configuré
      if (recipientEmail) {
        console.log('📧 Envoi de l\'email de notification à:', recipientEmail)

        try {
          const emailPayload = {
            participant: newParticipant,
            eventData: availableEvents.find(e => e.id === selectedEventId),
            selectedSessions: formData.sessions,
            recipientEmail,
            message: formData.message
          }

          console.log('📨 Payload email:', emailPayload)

          const emailResponse = await fetch('/api/builder-form-submission', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload)
          })

          if (emailResponse.ok) {
            console.log('✅ Email envoyé avec succès')
          } else {
            console.error('❌ Erreur lors de l\'envoi de l\'email:', emailResponse.statusText)
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError)
          // Ne pas échouer toute la soumission si l'email échoue
        }
      } else {
        console.log('ℹ️ Aucun email destinataire configuré')
      }

      console.log('🎉 Soumission terminée avec succès!')
      setSubmitStatus('success')
      setSubmitMessage(successMessage)

      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        profession: '',
        url_linkedin: '',
        url_facebook: '',
        url_twitter: '',
        url_instagram: '',
        message: '',
        consent: false,
        sessions: []
      })

    } catch (error) {
      console.error('💥 Erreur lors de la soumission:', error)
      setSubmitStatus('error')
      setSubmitMessage(`${errorMessage}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width,
        ...alignStyle,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection de l'événement */}
          {autoSelectEvent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuration Événement
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  console.log('🎯 Changement d\'événement sélectionné:', e.target.value)
                  setSelectedEventId(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner l'événement</option>
                {availableEvents.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom} - {new Date(event.date_debut).toLocaleDateString('fr-FR')} - {event.lieu}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required={requiredFields?.includes('nom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required={requiredFields?.includes('prenom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre prénom"
              />
            </div>
          </div>

          {/* Email et Téléphone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required={requiredFields?.includes('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                required={requiredFields?.includes('telephone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre profession"
            />
          </div>

          {/* Sessions dynamiques (si activé) */}
          {showSessions && selectedEventId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sessions souhaitées
              </label>
              <DynamicSessions
                eventId={selectedEventId}
                selectedSessions={formData.sessions}
                onSessionChange={handleSessionChange}
              />
            </div>
          )}

          {/* Réseaux sociaux (si activé) */}
          {showSocialMedia && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="url_linkedin"
                  value={formData.url_linkedin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/votre-profil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter/X
                </label>
                <input
                  type="url"
                  name="url_twitter"
                  value={formData.url_twitter}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@votre-compte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  name="url_facebook"
                  value={formData.url_facebook}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://facebook.com/votre-profil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="url"
                  name="url_instagram"
                  value={formData.url_instagram}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/votre-compte"
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optionnel)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Un message ou une question..."
            />
          </div>

          {/* Case à cocher */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              id="consent"
              className="mr-2"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-600">
              J'accepte les conditions d'utilisation et la politique de confidentialité *
            </label>
          </div>

          {/* Messages de statut */}
          {submitStatus !== 'idle' && (
            <div className={`p-4 rounded-lg ${
              submitStatus === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              <p>{submitMessage}</p>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Inscription en cours...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
})

RegistrationForm.displayName = 'RegistrationForm'

// Configuration Craft.js
// Settings component pour RegistrationForm
export const RegistrationFormSettings = () => {
  const {
    actions: { setProp },
    title,
    description,
    width,
    horizontalAlign,
    recipientEmail,
    autoSelectEvent,
  } = useNode((node) => ({
    title: node.data.props.title,
    description: node.data.props.description,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
    recipientEmail: node.data.props.recipientEmail,
    autoSelectEvent: node.data.props.autoSelectEvent,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre du formulaire
        </label>
        <input
          type="text"
          value={title || ''}
          onChange={(e) => setProp((props: RegistrationFormProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description || ''}
          onChange={(e) => setProp((props: RegistrationFormProps) => (props.description = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largeur du formulaire
        </label>
        <div className="space-y-2">
          <select
            value={width || '100%'}
            onChange={(e) => setProp((props: RegistrationFormProps) => (props.width = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="100%">100% (pleine largeur)</option>
            <option value="75%">75%</option>
            <option value="66.66%">66.66% (2/3)</option>
            <option value="50%">50% (moitié)</option>
            <option value="33.33%">33.33% (1/3)</option>
            <option value="25%">25%</option>
          </select>
          <input
            type="text"
            value={width || '100%'}
            onChange={(e) => setProp((props: RegistrationFormProps) => (props.width = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="100%, 500px, 20rem, etc."
          />
          <p className="text-xs text-gray-500">
            Utilisez les valeurs prédéfinies ou entrez une valeur personnalisée (px, %, rem, etc.)
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignement horizontal du formulaire
        </label>
        <div className="space-y-2">
          <select
            value={horizontalAlign || 'left'}
            onChange={(e) => setProp((props: RegistrationFormProps) => (props.horizontalAlign = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setProp((props: RegistrationFormProps) => (props.horizontalAlign = 'left'))}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                horizontalAlign === 'left'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block">⬅️</span>
              Gauche
            </button>
            <button
              onClick={() => setProp((props: RegistrationFormProps) => (props.horizontalAlign = 'center'))}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                horizontalAlign === 'center'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block">↔️</span>
              Centre
            </button>
            <button
              onClick={() => setProp((props: RegistrationFormProps) => (props.horizontalAlign = 'right'))}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                horizontalAlign === 'right'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block">➡️</span>
              Droite
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Permet de centrer le formulaire sur la page
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email de destination des soumissions
        </label>
        <input
          type="email"
          value={recipientEmail || ''}
          onChange={(e) => setProp((props: RegistrationFormProps) => (props.recipientEmail = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="email@exemple.com"
        />
        <p className="text-xs text-gray-500">
          Les soumissions de formulaire seront envoyées à cette adresse email
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoSelectEvent || false}
            onChange={(e) => setProp((props: RegistrationFormProps) => (props.autoSelectEvent = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Activer la sélection d'événement
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Affiche une liste déroulante pour permettre aux utilisateurs de choisir un événement
        </p>
      </div>
    </div>
  );
};

RegistrationForm.craft = {
  displayName: 'RegistrationForm',
  props: {
    eventId: '',
    title: "Formulaire d'inscription",
    description: "Remplissez ce formulaire pour vous inscrire à l'événement",
    showSessions: true,
    showSocialMedia: true,
    requiredFields: ['nom', 'prenom', 'email', 'telephone'],
    submitButtonText: "S'inscrire à l'événement",
    successMessage: "Inscription réussie !",
    errorMessage: "Une erreur est survenue lors de l'inscription.",
    className: "my-4",
    width: '100%',
    horizontalAlign: 'left',
    recipientEmail: '',
    autoSelectEvent: false
  },
  related: {
    settings: RegistrationFormSettings,
  },
};