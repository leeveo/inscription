'use client'

import React, { useState, useEffect } from 'react'
import { useNode } from '@craftjs/core'

interface Session {
  id: number
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant?: string
  lieu?: string
  type?: string
  max_participants?: number
}

interface Event {
  id: string
  nom: string
  description?: string
  lieu?: string
  date_debut: string
  date_fin: string
  statut: string
  type_evenement?: string
  created_at: string
}

interface DesignFormProps {
  eventId?: string
  formTemplate?: 'modern' | 'classic' | 'minimal' | 'elegant' | 'creative' | 'corporate' | 'tech'
  fontFamily?: string
  primaryColor?: string
  backgroundColor?: string
  titleColor?: string
  title?: string
  description?: string
  submitButtonText?: string
  // Champs obligatoires (toujours présents)
  showNom?: boolean
  showPrenom?: boolean
  showEmail?: boolean
  // Champs optionnels configurables
  showTelephone?: boolean
  showEntreprise?: boolean
  showProfession?: boolean
  showSiteWeb?: boolean
  showDateNaissance?: boolean
  showUrlLinkedin?: boolean
  showUrlFacebook?: boolean
  showUrlTwitter?: boolean
  showUrlInstagram?: boolean
  showMessage?: boolean
  // Options d'affichage existantes
  showSessions?: boolean
  showSocialMedia?: boolean
  width?: string
  horizontalAlign?: string
}

export const DesignForm = ({
  eventId = '',
  formTemplate = 'modern',
  fontFamily = 'Inter, sans-serif',
  primaryColor = '#3B82F6',
  backgroundColor = '#FFFFFF',
  titleColor = '#1F2937',
  title = "Formulaire d'inscription",
  description = "Remplissez ce formulaire pour vous inscrire à l'événement",
  submitButtonText = "S'inscrire à l'événement",
  // Champs obligatoires (par défaut activés)
  showNom = true,
  showPrenom = true,
  showEmail = true,
  // Champs optionnels (par défaut désactivés)
  showTelephone = true,
  showEntreprise = false,
  showProfession = true,
  showSiteWeb = false,
  showDateNaissance = false,
  showUrlLinkedin = false,
  showUrlFacebook = false,
  showUrlTwitter = false,
  showUrlInstagram = false,
  showMessage = true,
  // Options d'affichage existantes
  showSessions = true,
  showSocialMedia = false,
  width = '100%',
  horizontalAlign = 'left',
}: DesignFormProps) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  // Charger les sessions depuis l'API
  useEffect(() => {
    const fetchSessions = async () => {
      if (!eventId || !showSessions) return

      setLoadingSessions(true)
      try {
        const response = await fetch(`/api/sessions?eventId=${eventId}`)
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error)
      } finally {
        setLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [eventId, showSessions])

  const getTemplateStyles = () => {
    switch (formTemplate) {
      case 'modern':
        return {
          container: 'bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border border-gray-100',
          form: 'bg-white rounded-xl shadow-lg p-6',
          title: 'text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          input: 'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
          button: 'w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105'
        }
      case 'classic':
        return {
          container: 'bg-white border-2 border-gray-300 rounded-lg shadow-md p-8',
          form: 'space-y-6',
          title: 'text-2xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2',
          input: 'w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500',
          button: 'w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors'
        }
      case 'minimal':
        return {
          container: 'bg-gray-50 rounded-lg p-6',
          form: 'space-y-4',
          title: 'text-xl font-light text-gray-900 mb-4',
          input: 'w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 rounded-none',
          button: 'w-full text-left px-0 py-2 text-blue-600 hover:text-blue-700 border-b-2 border-blue-600 hover:border-blue-700 rounded-none bg-transparent'
        }
      case 'elegant':
        return {
          container: 'bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl p-12',
          form: 'bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20',
          title: 'text-4xl font-light text-white mb-2',
          description: 'text-gray-200 mb-8',
          input: 'w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
          button: 'w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-all'
        }
      case 'creative':
        return {
          container: 'bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 rounded-3xl shadow-2xl p-10 relative overflow-hidden',
          form: 'relative bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-purple-200',
          title: 'text-4xl font-black text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent transform -rotate-2',
          input: 'w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all',
          button: 'w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 px-8 rounded-full font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg'
        }
      case 'corporate':
        return {
          container: 'bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-xl p-12 border-l-8 border-blue-600',
          form: 'bg-white rounded-lg shadow-lg p-8 border border-gray-200',
          title: 'text-3xl font-bold text-gray-900 mb-2 text-left uppercase tracking-wider',
          input: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50',
          button: 'w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-md'
        }
      case 'tech':
        return {
          container: 'bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 rounded-2xl shadow-2xl p-10 border border-cyan-500 border-opacity-30',
          form: 'bg-gray-900 bg-opacity-90 backdrop-blur rounded-xl p-8 border border-cyan-500 border-opacity-50 shadow-2xl',
          title: 'text-4xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono uppercase tracking-wider',
          input: 'w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all',
          button: 'w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold font-mono uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg border-2 border-cyan-400'
        }
      default:
        return {
          container: 'bg-white rounded-lg shadow-lg p-6',
          form: 'space-y-4',
          title: 'text-2xl font-bold text-gray-900',
          input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
          button: 'w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700'
        }
    }
  }

  const styles = getTemplateStyles()

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

  // Formater les sessions pour l'affichage
  const formatSessionForDisplay = (session: Session) => {
    const date = new Date(session.date)
    const formattedDate = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    return `${session.titre} - ${formattedDate} de ${session.heure_debut} à ${session.heure_fin}${session.lieu ? ` - ${session.lieu}` : ''}${session.intervenant ? ` - ${session.intervenant}` : ''}`
  }

  const renderForm = () => (
    <div className={styles.form}>
      <div className="mb-6">
        <h2
          className={`${styles.title} ${formTemplate === 'elegant' ? 'mb-2' : 'mb-4'}`}
          style={{
            fontFamily,
            color: formTemplate === 'creative' || formTemplate === 'modern' || formTemplate === 'tech' ? undefined : titleColor
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`${formTemplate === 'elegant' ? styles.description : 'text-gray-600'}`}
            style={{ fontFamily }}
          >
            {description}
          </p>
        )}
      </div>

      <form className={formTemplate === 'classic' ? 'space-y-6' : 'space-y-4'}>
        {/* Champs obligatoires : Nom et Prénom */}
        {(showNom || showPrenom) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showNom && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Votre nom"
                />
              </div>
            )}
            {showPrenom && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Votre prénom"
                />
              </div>
            )}
          </div>
        )}

        {/* Email (obligatoire si activé) */}
        {showEmail && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Email *
            </label>
            <input
              type="email"
              required
              className={styles.input}
              style={{ fontFamily }}
              placeholder="votre@email.com"
            />
          </div>
        )}

        {/* Champs optionnels en grille */}
        {(showTelephone || showEntreprise) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showTelephone && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            )}
            {showEntreprise && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Entreprise
                </label>
                <input
                  type="text"
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Nom de votre entreprise"
                />
              </div>
            )}
          </div>
        )}

        {/* Profession et Site Web */}
        {(showProfession || showSiteWeb) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showProfession && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Profession
                </label>
                <input
                  type="text"
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="Votre profession"
                />
              </div>
            )}
            {showSiteWeb && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                }`} style={{ fontFamily }}>
                  Site Web
                </label>
                <input
                  type="url"
                  className={styles.input}
                  style={{ fontFamily }}
                  placeholder="https://votre-site.com"
                />
              </div>
            )}
          </div>
        )}

        {/* Date de naissance */}
        {showDateNaissance && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Date de naissance
            </label>
            <input
              type="date"
              className={styles.input}
              style={{ fontFamily }}
            />
          </div>
        )}

        {/* Sessions (si activé) */}
        {showSessions && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Sessions souhaitées
            </label>
            <div className="space-y-2">
              {loadingSessions ? (
                <div className={`text-sm ${formTemplate === 'elegant' ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontFamily }}>
                  Chargement des sessions...
                </div>
              ) : sessions.length > 0 ? (
                sessions.map((session) => (
                  <label key={session.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      value={session.id}
                    />
                    <span className={formTemplate === 'elegant' ? 'text-gray-200' : ''} style={{ fontFamily }}>
                      {formatSessionForDisplay(session)}
                    </span>
                  </label>
                ))
              ) : eventId ? (
                <div className={`text-sm ${formTemplate === 'elegant' ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontFamily }}>
                  Aucune session disponible pour cet événement
                </div>
              ) : (
                <div className={`text-sm ${formTemplate === 'elegant' ? 'text-gray-300' : 'text-gray-500'}`} style={{ fontFamily }}>
                  Veuillez spécifier un ID d'événement pour afficher les sessions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Réseaux sociaux configurables */}
        {(showUrlLinkedin || showUrlFacebook || showUrlTwitter || showUrlInstagram) && (
          <div>
            <h4 className={`text-sm font-medium mb-3 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Réseaux sociaux
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showUrlLinkedin && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://linkedin.com/in/votre-profil"
                  />
                </div>
              )}
              {showUrlFacebook && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    Facebook
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://facebook.com/votre-profil"
                  />
                </div>
              )}
              {showUrlTwitter && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://twitter.com/votre-compte"
                  />
                </div>
              )}
              {showUrlInstagram && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
                  }`} style={{ fontFamily }}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    className={styles.input}
                    style={{ fontFamily }}
                    placeholder="https://instagram.com/votre-compte"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message (optionnel et configurable) */}
        {showMessage && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Message (optionnel)
            </label>
            <textarea
              rows={3}
              className={styles.input}
              style={{ fontFamily }}
              placeholder="Un message ou une question..."
            />
          </div>
        )}

        {/* Case à cocher */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="consent"
            className="mr-2"
            required
          />
          <label htmlFor="consent" className={`text-sm ${
            formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-600'
          }`} style={{ fontFamily }}>
            J'accepte les conditions d'utilisation et la politique de confidentialité *
          </label>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4">
          <button
            type="submit"
            className={styles.button}
            style={{ fontFamily }}
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="relative my-4"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
        width,
        ...alignStyle,
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          🎨 Formulaire Design {selected && '• Sélectionné'}
        </div>
      )}

      <div className={styles.container}>
        {renderForm()}
      </div>
    </div>
  );
};

// Settings component
export const DesignFormSettings = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const {
    actions: { setProp },
    id,
    eventId,
    formTemplate,
    fontFamily,
    primaryColor,
    backgroundColor,
    titleColor,
    title,
    description,
    submitButtonText,
    showNom,
    showPrenom,
    showEmail,
    showTelephone,
    showEntreprise,
    showProfession,
    showSiteWeb,
    showDateNaissance,
    showUrlLinkedin,
    showUrlFacebook,
    showUrlTwitter,
    showUrlInstagram,
    showMessage,
    showSessions,
    showSocialMedia,
    width,
    horizontalAlign,
  } = useNode((node) => ({
    id: node.id,
    eventId: node.data.props.eventId,
    formTemplate: node.data.props.formTemplate,
    fontFamily: node.data.props.fontFamily,
    primaryColor: node.data.props.primaryColor,
    backgroundColor: node.data.props.backgroundColor,
    titleColor: node.data.props.titleColor,
    title: node.data.props.title,
    description: node.data.props.description,
    submitButtonText: node.data.props.submitButtonText,
    showNom: node.data.props.showNom,
    showPrenom: node.data.props.showPrenom,
    showEmail: node.data.props.showEmail,
    showTelephone: node.data.props.showTelephone,
    showEntreprise: node.data.props.showEntreprise,
    showProfession: node.data.props.showProfession,
    showSiteWeb: node.data.props.showSiteWeb,
    showDateNaissance: node.data.props.showDateNaissance,
    showUrlLinkedin: node.data.props.showUrlLinkedin,
    showUrlFacebook: node.data.props.showUrlFacebook,
    showUrlTwitter: node.data.props.showUrlTwitter,
    showUrlInstagram: node.data.props.showUrlInstagram,
    showMessage: node.data.props.showMessage,
    showSessions: node.data.props.showSessions,
    showSocialMedia: node.data.props.showSocialMedia,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
  }));



  // Charger les événements depuis l'API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error)
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [])

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Template Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-1">🎨 Formulaire Design</p>
        <p className="text-xs text-blue-700">
          Sélectionnez parmi 7 templates différents et personnalisez tous les aspects du formulaire.
        </p>
      </div>

      {/* Event Configuration */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">📅 Configuration Événement</h4>
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">
            Sélectionner l'événement
          </label>
          {loadingEvents ? (
            <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm text-yellow-600">
              Chargement des événements...
            </div>
          ) : events.length > 0 ? (
            <select
              value={eventId || ''}
              onChange={(e) => setProp((props: DesignFormProps) => (props.eventId = e.target.value))}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm"
            >
              <option value="">Sélectionner un événement...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.nom} - {formatDate(event.date_debut)}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm text-yellow-600">
              Aucun événement trouvé
            </div>
          )}
          <p className="text-xs text-yellow-600 mt-1">
            Sélectionnez l'événement pour charger les sessions réelles depuis la base de données.
          </p>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Template</h4>
        <select
          value={formTemplate || 'modern'}
          onChange={(e) => setProp((props: DesignFormProps) => (props.formTemplate = e.target.value as DesignFormProps['formTemplate']))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="modern">Moderne</option>
          <option value="classic">Classique</option>
          <option value="minimal">Minimal</option>
          <option value="elegant">Élégant</option>
          <option value="creative">Créatif</option>
          <option value="corporate">Entreprise</option>
          <option value="tech">Tech</option>
        </select>
      </div>

      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={title || "Formulaire d'inscription"}
              onChange={(e) => setProp((props: DesignFormProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du titre
            </label>
            <input
              type="color"
              value={titleColor || '#1F2937'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.titleColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description || "Remplissez ce formulaire pour vous inscrire à l'événement"}
              onChange={(e) => setProp((props: DesignFormProps) => (props.description = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={submitButtonText || "S'inscrire à l'événement"}
              onChange={(e) => setProp((props: DesignFormProps) => (props.submitButtonText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Style Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Style</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Police de caractères
            </label>
            <select
              value={fontFamily || 'Inter, sans-serif'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.fontFamily = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Poppins, sans-serif">Poppins</option>
              <option value="Playfair Display, serif">Playfair Display</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Raleway, sans-serif">Raleway</option>
              <option value="Ubuntu, sans-serif">Ubuntu</option>
              <option value="Bebas Neue, cursive">Bebas Neue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur principale
            </label>
            <input
              type="color"
              value={primaryColor || '#3B82F6'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.primaryColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de fond
            </label>
            <input
              type="color"
              value={backgroundColor || '#FFFFFF'}
              onChange={(e) => setProp((props: DesignFormProps) => (props.backgroundColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Width and Alignment */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Largeur et Alignement</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largeur du formulaire
            </label>
            <div className="space-y-2">
              <select
                value={width || '100%'}
                onChange={(e) => setProp((props: DesignFormProps) => (props.width = e.target.value))}
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
                onChange={(e) => setProp((props: DesignFormProps) => (props.width = e.target.value))}
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
                onChange={(e) => setProp((props: DesignFormProps) => (props.horizontalAlign = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setProp((props: DesignFormProps) => (props.horizontalAlign = 'left'))}
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
                  onClick={() => setProp((props: DesignFormProps) => (props.horizontalAlign = 'center'))}
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
                  onClick={() => setProp((props: DesignFormProps) => (props.horizontalAlign = 'right'))}
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
        </div>
      </div>

      {/* Champs du formulaire */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Champs du formulaire</h4>
        
        <div className="space-y-4">
          {/* Champs obligatoires */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-2">Champs obligatoires :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNom || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showNom = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Nom *</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPrenom || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showPrenom = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Prénom *</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEmail || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showEmail = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email *</span>
              </label>
            </div>
          </div>

          {/* Champs optionnels */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Informations complémentaires :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showTelephone || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showTelephone = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Téléphone</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showEntreprise || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showEntreprise = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Entreprise</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showProfession || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showProfession = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Profession</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSiteWeb || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showSiteWeb = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Site Web</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDateNaissance || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showDateNaissance = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Date de naissance</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showMessage || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showMessage = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Message (commentaire)</span>
              </label>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Réseaux sociaux :</p>
            
            <div className="space-y-2 ml-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlLinkedin || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlLinkedin = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">LinkedIn</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlFacebook || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlFacebook = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Facebook</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlTwitter || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlTwitter = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Twitter/X</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUrlInstagram || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showUrlInstagram = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Instagram</span>
              </label>
            </div>
          </div>

          {/* Sessions */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Fonctionnalités spéciales :</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showSessions || false}
                  onChange={(e) => setProp((props: DesignFormProps) => (props.showSessions = e.target.checked))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sélection de sessions</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DesignForm.craft = {
  displayName: 'DesignForm',
  props: {
    eventId: '',
    formTemplate: 'modern',
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    titleColor: '#1F2937',
    title: "Formulaire d'inscription",
    description: "Remplissez ce formulaire pour vous inscrire à l'événement",
    submitButtonText: "S'inscrire à l'événement",
    // Champs obligatoires (par défaut activés)
    showNom: true,
    showPrenom: true,
    showEmail: true,
    // Champs optionnels (par défaut quelques-uns activés)
    showTelephone: true,
    showEntreprise: false,
    showProfession: true,
    showSiteWeb: false,
    showDateNaissance: false,
    showUrlLinkedin: false,
    showUrlFacebook: false,
    showUrlTwitter: false,
    showUrlInstagram: false,
    showMessage: true,
    // Options d'affichage existantes
    showSessions: true,
    showSocialMedia: false,
    width: '100%',
    horizontalAlign: 'left',
  },
  related: {
    settings: DesignFormSettings,
  },
};