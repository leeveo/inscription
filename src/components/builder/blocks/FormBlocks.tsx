'use client'

import React from 'react'
import { Element } from '@craftjs/core'
import { Container } from './Container'
import { RegistrationForm } from './RegistrationForm'

// Conference Form Block
export const ConferenceFormBlock = ({ eventId = '' }) => (
  <Element
    is={Container}
    id="conference-form"
    className="max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border border-gray-100"
  >
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Conférence Innovation 2024</h1>
      <p className="text-lg text-gray-600">Réservez votre place pour notre conférence annuelle sur l'innovation technologique</p>
    </div>
    <RegistrationForm
      eventId={eventId}
      title="Formulaire d'inscription"
      description="Les champs marqués d'un astérisque sont obligatoires"
      showSessions={true}
      showSocialMedia={true}
      requiredFields={['nom', 'prenom', 'email', 'telephone']}
      submitButtonText="Confirmer mon inscription"
      successMessage="Inscription réussie ! Vous recevrez un email de confirmation."
      errorMessage="Une erreur est survenue lors de l'inscription."
      className="space-y-6"
    />
  </Element>
)

// Workshop Form Block
export const WorkshopFormBlock = ({ eventId = '' }) => (
  <Element
    is={Container}
    id="workshop-form"
    className="min-h-screen bg-white"
  >
    <Element
      is={Container}
      id="workshop-header"
      className="text-center text-white py-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-b-3xl"
    >
      <h1 className="text-5xl font-bold mb-4">Workshop Digital Marketing</h1>
      <p className="text-xl opacity-90 max-w-3xl mx-auto">Une journée intensive pour maîtriser les stratégies marketing digitales</p>
    </Element>

    <Element
      is={Container}
      id="workshop-details"
      className="max-w-4xl mx-auto py-16"
    >
      <Element
        is={Container}
        id="workshop-info-grid"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
      >
        <Element
          is={Container}
          id="workshop-date"
          className="bg-gray-50 rounded-xl p-8 text-center"
        >
          <div className="text-4xl mb-4">📅</div>
          <div className="text-gray-700 font-semibold">25 Mars 2024<br />9h00 - 17h00</div>
        </Element>
        <Element
          is={Container}
          id="workshop-location"
          className="bg-gray-50 rounded-xl p-8 text-center"
        >
          <div className="text-4xl mb-4">📍</div>
          <div className="text-gray-700 font-semibold">Espace CoWorking<br />15 Rue de la Paix, Paris</div>
        </Element>
        <Element
          is={Container}
          id="workshop-price"
          className="bg-gray-50 rounded-xl p-8 text-center"
        >
          <div className="text-4xl mb-4">💰</div>
          <div className="text-gray-700 font-semibold">299€ HT<br />Déjeuner inclus</div>
        </Element>
      </Element>

      <Element
        is={Container}
        id="workshop-form-section"
        className="text-center py-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-3xl"
      >
        <h2 className="text-4xl font-bold text-white mb-8">Réservez votre place</h2>
        <Element
          is={Container}
          id="workshop-form-container"
          className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8"
        >
          <RegistrationForm
            eventId={eventId}
            title="Inscription au Workshop"
            description="Les places sont limitées à 20 participants pour garantir une expérience optimale"
            showSessions={false}
            showSocialMedia={false}
            requiredFields={['nom', 'prenom', 'email', 'telephone']}
            submitButtonText="Confirmer mon inscription"
            successMessage="Inscription confirmée ! Vous recevrez un email de confirmation."
            errorMessage="Une erreur est survenue lors de l'inscription."
          />
        </Element>
        <p className="text-white opacity-90 mt-6">Pour toute question, contactez-nous à workshop@marketing.fr</p>
      </Element>
    </Element>
  </Element>
)

// Simple Form Block
export const SimpleFormBlock = ({ eventId = '' }) => (
  <Element
    is={Container}
    id="simple-form"
    className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200"
  >
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Formulaire d'inscription</h2>
      <p className="text-gray-600">Remplissez ce formulaire pour vous inscrire à l'événement</p>
    </div>
    <RegistrationForm
      eventId={eventId}
      title="Inscription"
      description=""
      showSessions={false}
      showSocialMedia={false}
      requiredFields={['nom', 'prenom', 'email', 'telephone']}
      submitButtonText="S'inscrire"
      successMessage="Inscription réussie !"
      errorMessage="Une erreur est survenue."
      className="space-y-6"
    />
  </Element>
)

// Premium Form Block
export const PremiumFormBlock = ({ eventId = '' }) => (
  <Element
    is={Container}
    id="premium-form"
    className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
  >
    <Element
      is={Container}
      id="premium-container"
      className="max-w-6xl mx-auto py-20 px-8"
    >
      <Element
        is={Container}
        id="premium-card"
        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-20 p-12"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">Événement Exclusif 2024</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">Une expérience unique pour les leaders de demain</p>
        </div>

        <Element
          is={Container}
          id="premium-form-container"
          className="bg-white bg-opacity-95 backdrop-blur rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Formulaire d'inscription VIP</h2>
            <p className="text-gray-600">Accès réservé sur invitation uniquement</p>
          </div>
          <RegistrationForm
            eventId={eventId}
            title="Inscription VIP"
            description="Veuillez remplir tous les champs pour valider votre inscription"
            showSessions={true}
            showSocialMedia={true}
            requiredFields={['nom', 'prenom', 'email', 'telephone']}
            submitButtonText="Valider mon inscription VIP"
            successMessage="Inscription VIP confirmée ! Vous recevrez un email avec les détails."
            errorMessage="Une erreur est survenue lors de l'inscription."
            className="space-y-6"
          />
        </Element>
      </Element>
    </Element>
  </Element>
)
// Configuration Craft.js pour les FormBlocks
ConferenceFormBlock.craft = {
  displayName: 'ConferenceFormBlock',
  props: {
    eventId: '',
  },
  related: {},
};

WorkshopFormBlock.craft = {
  displayName: 'WorkshopFormBlock',
  props: {
    eventId: '',
  },
  related: {},
};

SimpleFormBlock.craft = {
  displayName: 'SimpleFormBlock',
  props: {
    eventId: '',
  },
  related: {},
};

PremiumFormBlock.craft = {
  displayName: 'PremiumFormBlock',
  props: {
    eventId: '',
  },
  related: {},
};
