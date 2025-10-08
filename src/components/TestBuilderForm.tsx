'use client'

import React from 'react'
import { RegistrationForm } from '@/components/builder/blocks/RegistrationForm'

export default function TestBuilderForm() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test du Formulaire Builder
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Instructions de Test
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Ouvrez la console du navigateur (F12)</li>
            <li>Remplissez le formulaire ci-dessous</li>
            <li>Vérifiez les logs dans la console pour suivre le processus</li>
            <li>Les logs montrent chaque étape de la soumission</li>
            <li>Vérifiez la base de données après la soumission</li>
          </ul>
        </div>

        <RegistrationForm
          eventId=""
          title="Formulaire de Test Builder"
          description="Ce formulaire est utilisé pour tester la fonctionnalité du builder"
          showSessions={true}
          showSocialMedia={true}
          requiredFields={['nom', 'prenom', 'email', 'telephone']}
          submitButtonText="S'inscrire à l'événement"
          successMessage="Inscription réussie ! Les données ont été enregistrées."
          errorMessage="Une erreur est survenue lors de l'inscription."
          className="my-4"
          width="100%"
          horizontalAlign="center"
          recipientEmail="test@example.com"
          autoSelectEvent={true}
        />
      </div>
    </div>
  )
}