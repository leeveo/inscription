'use client'

import React from 'react'
import { Element, useNode } from '@craftjs/core'

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
  horizontalAlign = 'left'
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

        <form className="space-y-4">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Session 1: 9h00 - 10h30</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Session 2: 11h00 - 12h30</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Session 3: 14h00 - 15h30</span>
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor="consent" className="text-sm text-gray-600">
              J'accepte les conditions d'utilisation et la politique de confidentialité *
            </label>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {submitButtonText}
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
  } = useNode((node) => ({
    title: node.data.props.title,
    description: node.data.props.description,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
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
    horizontalAlign: 'left'
  },
  related: {
    settings: RegistrationFormSettings,
  },
};