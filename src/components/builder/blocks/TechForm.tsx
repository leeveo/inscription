'use client'

import React from 'react'
import { useNode } from '@craftjs/core'

interface TechFormProps {
  eventId?: string
  title?: string
  titleColor?: string
  description?: string
  submitButtonText?: string
  showSessions?: boolean
  showSocialMedia?: boolean
  width?: string
  horizontalAlign?: string
}

export const TechForm = ({
  eventId = '',
  title = "Formulaire d'inscription",
  titleColor = '#00FFFF',
  description = "Remplissez ce formulaire pour vous inscrire à l'événement",
  submitButtonText = "S'inscrire à l'événement",
  showSessions = true,
  showSocialMedia = true,
  width = '100%',
  horizontalAlign = 'left',
}: TechFormProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

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

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="relative my-4"
      style={{
        border: selected || hovered ? '2px solid #06B6D4' : '2px solid transparent',
        width,
        ...alignStyle,
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-cyan-600 text-white text-xs font-medium">
          💻 Formulaire Tech {selected && '• Sélectionné'}
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 rounded-2xl shadow-2xl p-10 border border-cyan-500 border-opacity-30">
        <div className="bg-gray-900 bg-opacity-90 backdrop-blur rounded-xl p-8 border border-cyan-500 border-opacity-50 shadow-2xl">
          <div className="mb-6">
            <h2
              className="text-4xl font-bold text-center mb-4 font-mono uppercase tracking-wider"
              style={{ color: titleColor }}
            >
              {title}
            </h2>
            {description && (
              <p className="text-gray-200 text-center">{description}</p>
            )}
          </div>

          <form className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                  NOM *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                  placeholder="VOTRE_NOM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                  PRÉNOM *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                  placeholder="VOTRE_PRÉNOM"
                />
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                  placeholder="EMAIL@DOMAIN.COM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                  TÉLÉPHONE *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                  placeholder="+33612345678"
                />
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                PROFESSION
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                placeholder="DÉVELOPPEUR"
              />
            </div>

            {/* Sessions (si activé) */}
            {showSessions && (
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2 font-mono">
                  SESSIONS_SOUHAITÉES
                </label>
                <div className="space-y-2">
                  {['SESSION_1: 09:00-10:30', 'SESSION_2: 11:00-12:30', 'SESSION_3: 14:00-15:30'].map((session, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4 text-cyan-500 bg-gray-800 border-cyan-500 rounded focus:ring-cyan-400 focus:ring-2"
                      />
                      <span className="text-cyan-200 font-mono text-sm">{session}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Réseaux sociaux (si activé) */}
            {showSocialMedia && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                    LINKEDIN
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                    placeholder="HTTPS://LINKEDIN.COM/IN/PROFILE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                    TWITTER/X
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                    placeholder="@USERNAME"
                  />
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-1 font-mono">
                MESSAGE_OPTIONNEL
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 border-opacity-50 rounded-lg text-white placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 font-mono transition-all"
                placeholder="VOTRE_MESSAGE_ICI..."
              />
            </div>

            {/* Case à cocher */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="consent"
                className="mr-2 w-4 h-4 text-cyan-500 bg-gray-800 border-cyan-500 rounded focus:ring-cyan-400 focus:ring-2"
                required
              />
              <label htmlFor="consent" className="text-sm text-cyan-200 font-mono">
                J'ACCEPTE_LES_CONDITIONS_ET_LA_POLITIQUE_DE_CONFIDENTIALITÉ *
              </label>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-bold font-mono uppercase tracking-wider hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg border-2 border-cyan-400"
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
export const TechFormSettings = () => {
  const {
    actions: { setProp },
    id,
    title,
    titleColor,
    description,
    submitButtonText,
    showSessions,
    showSocialMedia,
    width,
    horizontalAlign,
  } = useNode((node) => ({
    id: node.id,
    title: node.data.props.title,
    titleColor: node.data.props.titleColor,
    description: node.data.props.description,
    submitButtonText: node.data.props.submitButtonText,
    showSessions: node.data.props.showSessions,
    showSocialMedia: node.data.props.showSocialMedia,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
  }));

  const { actions } = useNode((state) => ({
    actions: state.actions,
  }));

  return (
    <div className="space-y-4">
      {/* Template Info */}
      <div className="p-3 bg-gray-900 text-white rounded-lg border border-cyan-500">
        <p className="text-sm font-medium mb-1">💻 Template Tech</p>
        <p className="text-xs text-cyan-300">
          Design futuriste avec fond sombre, police monospace et effets néon cyan/bleu.
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
              onChange={(e) => setProp((props: TechFormProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du titre
            </label>
            <input
              type="color"
              value={titleColor || '#00FFFF'}
              onChange={(e) => setProp((props: TechFormProps) => (props.titleColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description || "Remplissez ce formulaire pour vous inscrire à l'événement"}
              onChange={(e) => setProp((props: TechFormProps) => (props.description = e.target.value))}
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
              onChange={(e) => setProp((props: TechFormProps) => (props.submitButtonText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                onChange={(e) => setProp((props: TechFormProps) => (props.width = e.target.value))}
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
                onChange={(e) => setProp((props: TechFormProps) => (props.width = e.target.value))}
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
                onChange={(e) => setProp((props: TechFormProps) => (props.horizontalAlign = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setProp((props: TechFormProps) => (props.horizontalAlign = 'left'))}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    horizontalAlign === 'left'
                      ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">⬅️</span>
                  Gauche
                </button>
                <button
                  onClick={() => setProp((props: TechFormProps) => (props.horizontalAlign = 'center'))}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    horizontalAlign === 'center'
                      ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">↔️</span>
                  Centre
                </button>
                <button
                  onClick={() => setProp((props: TechFormProps) => (props.horizontalAlign = 'right'))}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    horizontalAlign === 'right'
                      ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
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

      {/* Display Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Options d'affichage</h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSessions || false}
              onChange={(e) => setProp((props: TechFormProps) => (props.showSessions = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les sessions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSocialMedia || false}
              onChange={(e) => setProp((props: TechFormProps) => (props.showSocialMedia = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les réseaux sociaux</span>
          </label>
        </div>
      </div>
    </div>
  );
};

TechForm.craft = {
  displayName: 'TechForm',
  props: {
    eventId: '',
    title: "Formulaire d'inscription",
    titleColor: '#00FFFF',
    description: "Remplissez ce formulaire pour vous inscrire à l'événement",
    submitButtonText: "S'inscrire à l'événement",
    showSessions: true,
    showSocialMedia: true,
    width: '100%',
    horizontalAlign: 'left',
  },
  related: {
    settings: TechFormSettings,
  },
};