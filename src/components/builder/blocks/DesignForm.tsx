'use client'

import React from 'react'
import { useNode } from '@craftjs/core'

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
  showSessions?: boolean
  showSocialMedia?: boolean
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
  showSessions = true,
  showSocialMedia = true,
}: DesignFormProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

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
        {/* Nom et Prénom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Email et Téléphone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Téléphone *
            </label>
            <input
              type="tel"
              required
              className={styles.input}
              style={{ fontFamily }}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>

        {/* Profession */}
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

        {/* Sessions (si activé) */}
        {showSessions && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              formTemplate === 'elegant' ? 'text-gray-200' : 'text-gray-700'
            }`} style={{ fontFamily }}>
              Sessions souhaitées
            </label>
            <div className="space-y-2">
              {['Session 1: 9h00 - 10h30', 'Session 2: 11h00 - 12h30', 'Session 3: 14h00 - 15h30'].map((session, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span className={formTemplate === 'elegant' ? 'text-gray-200' : ''} style={{ fontFamily }}>
                    {session}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Réseaux sociaux (si activé) */}
        {showSocialMedia && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="@votre-compte"
              />
            </div>
          </div>
        )}

        {/* Message */}
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
      ref={(ref) => ref && connect(drag(ref))}
      className="relative w-full my-4"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
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
  const {
    actions: { setProp },
    id,
    formTemplate,
    fontFamily,
    primaryColor,
    backgroundColor,
    titleColor,
    title,
    description,
    submitButtonText,
    showSessions,
    showSocialMedia,
  } = useNode((node) => ({
    id: node.id,
    formTemplate: node.data.props.formTemplate,
    fontFamily: node.data.props.fontFamily,
    primaryColor: node.data.props.primaryColor,
    backgroundColor: node.data.props.backgroundColor,
    titleColor: node.data.props.titleColor,
    title: node.data.props.title,
    description: node.data.props.description,
    submitButtonText: node.data.props.submitButtonText,
    showSessions: node.data.props.showSessions,
    showSocialMedia: node.data.props.showSocialMedia,
  }));

  const { actions } = useNode((state) => ({
    actions: state.actions,
  }));

  return (
    <div className="space-y-4">
      {/* Template Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-1">🎨 Formulaire Design</p>
        <p className="text-xs text-blue-700">
          Sélectionnez parmi 7 templates différents et personnalisez tous les aspects du formulaire.
        </p>
      </div>

      {/* Template Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Template</h4>
        <select
          value={formTemplate || 'modern'}
          onChange={(e) => setProp((props: DesignFormProps) => (props.formTemplate = e.target.value))}
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

      {/* Display Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Options d'affichage</h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSessions || false}
              onChange={(e) => setProp((props: DesignFormProps) => (props.showSessions = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les sessions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSocialMedia || false}
              onChange={(e) => setProp((props: DesignFormProps) => (props.showSocialMedia = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les réseaux sociaux</span>
          </label>
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
    showSessions: true,
    showSocialMedia: true,
  },
  related: {
    settings: DesignFormSettings,
  },
};