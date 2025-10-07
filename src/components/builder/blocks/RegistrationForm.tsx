'use client'

import React from 'react'
import { Element } from '@craftjs/core'

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
  className = "my-4"
}, ref) => {
  return (
    <div ref={ref} className={className}>
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
    className: "my-4"
  },
  related: {
    // Pas de settings panel personnalisé pour le moment
  },
};