'use client'

import React from 'react'
import { useNode } from '@craftjs/core'

interface CreativeFormProps {
  eventId?: string
  title?: string
  titleColor?: string
  description?: string
  submitButtonText?: string
  showSessions?: boolean
  showSocialMedia?: boolean
}

export const CreativeForm = ({
  eventId = '',
  title = "Formulaire d'inscription",
  titleColor = '#EC4899',
  description = "Remplissez ce formulaire pour vous inscrire à l'événement",
  submitButtonText = "S'inscrire à l'événement",
  showSessions = true,
  showSocialMedia = true,
}: CreativeFormProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="relative w-full my-4"
      style={{
        border: selected || hovered ? '2px solid #EC4899' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-pink-500 text-white text-xs font-medium">
          🎨 Formulaire Créatif {selected && '• Sélectionné'}
        </div>
      )}

      <div className="bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 rounded-3xl shadow-2xl p-10 relative overflow-hidden">
        <div className="relative bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-purple-200">
          <div className="mb-6">
            <h2
              className="text-4xl font-black text-center transform -rotate-2 mb-4"
              style={{ color: titleColor }}
            >
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 text-center">{description}</p>
            )}
          </div>

          <form className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
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
                  required
                  className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
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
                className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
                placeholder="Votre profession"
              />
            </div>

            {/* Sessions (si activé) */}
            {showSessions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sessions souhaitées
                </label>
                <div className="space-y-2">
                  {['Session 1: 9h00 - 10h30', 'Session 2: 11h00 - 12h30', 'Session 3: 14h00 - 15h30'].map((session, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-700">{session}</span>
                    </label>
                  ))}
                </div>
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
                    className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
                    placeholder="https://linkedin.com/in/votre-profil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
                    placeholder="@votre-compte"
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
                rows={3}
                className="w-full px-4 py-4 border-3 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-purple-50 bg-opacity-50 transition-all"
                placeholder="Un message ou une question..."
              />
            </div>

            {/* Case à cocher */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="consent"
                className="mr-2 w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                required
              />
              <label htmlFor="consent" className="text-sm text-gray-600">
                J'accepte les conditions d'utilisation et la politique de confidentialité *
              </label>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 px-8 rounded-full font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all shadow-lg"
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Settings component
export const CreativeFormSettings = () => {
  const {
    actions: { setProp },
    id,
    title,
    titleColor,
    description,
    submitButtonText,
    showSessions,
    showSocialMedia,
  } = useNode((node) => ({
    id: node.id,
    title: node.data.props.title,
    titleColor: node.data.props.titleColor,
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
      <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
        <p className="text-sm font-medium text-pink-900 mb-1">🎨 Template Créatif</p>
        <p className="text-xs text-pink-700">
          Design coloré avec dégradés rose-violet-indigo, bordures en pointillés et effets animés.
        </p>
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
              onChange={(e) => setProp((props: CreativeFormProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du titre
            </label>
            <input
              type="color"
              value={titleColor || '#EC4899'}
              onChange={(e) => setProp((props: CreativeFormProps) => (props.titleColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description || "Remplissez ce formulaire pour vous inscrire à l'événement"}
              onChange={(e) => setProp((props: CreativeFormProps) => (props.description = e.target.value))}
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
              onChange={(e) => setProp((props: CreativeFormProps) => (props.submitButtonText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              onChange={(e) => setProp((props: CreativeFormProps) => (props.showSessions = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les sessions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSocialMedia || false}
              onChange={(e) => setProp((props: CreativeFormProps) => (props.showSocialMedia = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les réseaux sociaux</span>
          </label>
        </div>
      </div>

          </div>
  );
};

CreativeForm.craft = {
  displayName: 'CreativeForm',
  props: {
    eventId: '',
    title: "Formulaire d'inscription",
    titleColor: '#EC4899',
    description: "Remplissez ce formulaire pour vous inscrire à l'événement",
    submitButtonText: "S'inscrire à l'événement",
    showSessions: true,
    showSocialMedia: true,
  },
  related: {
    settings: CreativeFormSettings,
  },
};