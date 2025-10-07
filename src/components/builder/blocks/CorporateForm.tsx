'use client'

import React from 'react'
import { useNode } from '@craftjs/core'

interface CorporateFormProps {
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

export const CorporateForm = ({
  eventId = '',
  title = "Formulaire d'inscription",
  titleColor = '#1F2937',
  description = "Remplissez ce formulaire pour vous inscrire à l'événement",
  submitButtonText = "S'inscrire à l'événement",
  showSessions = true,
  showSocialMedia = true,
  width = '100%',
  horizontalAlign = 'left',
}: CorporateFormProps) => {
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
        border: selected || hovered ? '2px solid #2563EB' : '2px solid transparent',
        width,
        ...alignStyle,
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          💼 Formulaire Entreprise {selected && '• Sélectionné'}
        </div>
      )}

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-xl p-12 border-l-8 border-blue-600">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="mb-6">
            <h2
              className="text-3xl font-bold text-gray-900 mb-2 text-left uppercase tracking-wider"
              style={{ color: titleColor }}
            >
              {title}
            </h2>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>

          <form className="space-y-6">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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
                        className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{session}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Réseaux sociaux (si activé) */}
            {showSocialMedia && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="https://linkedin.com/in/votre-profil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter/X
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="@votre-compte"
                  />
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                placeholder="Un message ou une question..."
              />
            </div>

            {/* Case à cocher */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="consent"
                className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="consent" className="text-sm text-gray-600">
                J'accepte les conditions d'utilisation et la politique de confidentialité *
              </label>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-md"
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
export const CorporateFormSettings = () => {
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
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-1">💼 Template Entreprise</p>
        <p className="text-xs text-blue-700">
          Style professionnel corporate avec bordure latérale bleue, design structuré et police majuscule.
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
              onChange={(e) => setProp((props: CorporateFormProps) => (props.title = e.target.value))}
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
              onChange={(e) => setProp((props: CorporateFormProps) => (props.titleColor = e.target.value))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description || "Remplissez ce formulaire pour vous inscrire à l'événement"}
              onChange={(e) => setProp((props: CorporateFormProps) => (props.description = e.target.value))}
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
              onChange={(e) => setProp((props: CorporateFormProps) => (props.submitButtonText = e.target.value))}
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
                onChange={(e) => setProp((props: CorporateFormProps) => (props.width = e.target.value))}
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
                onChange={(e) => setProp((props: CorporateFormProps) => (props.width = e.target.value))}
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
                onChange={(e) => setProp((props: CorporateFormProps) => (props.horizontalAlign = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setProp((props: CorporateFormProps) => (props.horizontalAlign = 'left'))}
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
                  onClick={() => setProp((props: CorporateFormProps) => (props.horizontalAlign = 'center'))}
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
                  onClick={() => setProp((props: CorporateFormProps) => (props.horizontalAlign = 'right'))}
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

      {/* Display Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Options d'affichage</h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSessions || false}
              onChange={(e) => setProp((props: CorporateFormProps) => (props.showSessions = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les sessions</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSocialMedia || false}
              onChange={(e) => setProp((props: CorporateFormProps) => (props.showSocialMedia = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les réseaux sociaux</span>
          </label>
        </div>
      </div>
    </div>
  );
};

CorporateForm.craft = {
  displayName: 'CorporateForm',
  props: {
    eventId: '',
    title: "Formulaire d'inscription",
    titleColor: '#1F2937',
    description: "Remplissez ce formulaire pour vous inscrire à l'événement",
    submitButtonText: "S'inscrire à l'événement",
    showSessions: true,
    showSocialMedia: true,
    width: '100%',
    horizontalAlign: 'left',
  },
  related: {
    settings: CorporateFormSettings,
  },
};