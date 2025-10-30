'use client'

import React, { useState } from 'react'
import {
  FiEdit3,
  FiSave,
  FiEye,
  FiDownload,
  FiPrinter,
  FiArrowLeft,
  FiSettings,
  FiPlus
} from 'react-icons/fi'
import { BadgeTemplate, BadgeData } from '@/types/badge-templates'
import BadgeTemplateSelector from './BadgeTemplateSelector'
import BadgeEditor from './BadgeEditor'

interface BadgeCustomizationTabProps {
  eventId: string
  eventName?: string
}

export default function BadgeCustomizationTab({ eventId, eventName }: BadgeCustomizationTabProps) {
  const [currentView, setCurrentView] = useState<'selector' | 'editor'>('selector')
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null)
  const [templateData, setTemplateData] = useState<BadgeData>({
    // Event Information
    eventName: eventName || 'CONFÉRENCE TECH 2024',
    eventId: 'fb350c24-7de6-475b-902d-d24ccfb34287',
    eventType: 'CONFERENCE',
    organizerName: 'Tech Events',
    eventDate: '15 Mars 2024',
    eventLocation: 'Paris Expo Porte de Versailles',

    // Attendee Information
    firstName: 'JEAN',
    lastName: 'DUPONT',
    fullName: 'JEAN DUPONT',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    company: 'Tech Company',
    profession: 'Développeur Senior',
    participantId: 'PART-2024-001',
    registrationDate: '01/03/2024',

    // Badge Information
    badgeType: 'STANDARD',
    accessLevel: 'PARTICIPANT',
    role: 'DÉLÉGUÉ',
    permissions: ['Accès conférences', 'Accès exposition', 'Networking'],

    // Security Features
    qrCode: 'QR-BADGE-2024-001-VALID',
    qrUrl: 'https://event-app.com/badge/verify/QR-BADGE-2024-001-VALID',
    badgeNumber: 'BADGE-001',
    validFrom: '15/03/2024 08:00',
    validUntil: '17/03/2024 18:00',

    // Media
    logoUrl: '/logo-placeholder.png',
    photoUrl: '/photo-placeholder.png'
  })

  const handleTemplateSelect = (template: BadgeTemplate) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
  }

  const handleTemplateEdit = (template: BadgeTemplate) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
  }

  const handleTemplateChange = (template: BadgeTemplate) => {
    setSelectedTemplate(template)
  }

  const handleDataChange = (data: BadgeData) => {
    setTemplateData(data)
  }

  const handleSave = async () => {
    if (!selectedTemplate) return

    try {
      // Simuler la sauvegarde - en réalité, appeler une API
      alert('Badge sauvegardé avec succès!')
    } catch (error) {
      console.error('Error saving badge template:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentView === 'editor' && (
            <button
              onClick={() => setCurrentView('selector')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentView === 'selector' ? 'Personnalisation des Badges' : `Édition: ${selectedTemplate?.name || 'Template'}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentView === 'selector'
                ? 'Choisissez et personnalisez des templates de badges pour vos événements'
                : 'Personnalisez les détails de votre template de badge'
              }
            </p>
          </div>
        </div>
        {currentView === 'selector' && (
          <button
            onClick={() => setCurrentView('editor')}
            disabled={!selectedTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <FiEdit3 className="w-4 h-4" />
            Éditer le template
          </button>
        )}
      </div>

      {/* Contenu principal */}
      {currentView === 'selector' && (
        <BadgeTemplateSelector
          eventId={eventId}
          onTemplateSelect={handleTemplateSelect}
          onTemplateEdit={handleTemplateEdit}
          selectedTemplate={selectedTemplate}
        />
      )}

      {currentView === 'editor' && selectedTemplate && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Éditeur principal (2/3 de la largeur) */}
          <div className="xl:col-span-2">
            <BadgeEditor
              template={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              onSave={handleSave}
              data={templateData}
              onDataChange={handleDataChange}
            />
          </div>

          {/* Panneau latéral (1/3 de la largeur) */}
          <div className="space-y-6">
            {/* Données du badge */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                Données du badge
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
                  <input
                    type="text"
                    value={templateData.eventName}
                    onChange={(e) => handleDataChange({ ...templateData, eventName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organisateur</label>
                  <input
                    type="text"
                    value={templateData.organizerName || ''}
                    onChange={(e) => handleDataChange({ ...templateData, organizerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Lieu</label>
                  <textarea
                    value={`${templateData.eventDate}\\n${templateData.eventLocation}`}
                    onChange={(e) => {
                      const [date, location] = e.target.value.split('\\n')
                      handleDataChange({ ...templateData, eventDate: date || '', eventLocation: location || '' })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du participant</label>
                  <input
                    type="text"
                    value={templateData.fullName}
                    onChange={(e) => handleDataChange({ ...templateData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input
                    type="text"
                    value={templateData.company || ''}
                    onChange={(e) => handleDataChange({ ...templateData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    value={templateData.profession || ''}
                    onChange={(e) => handleDataChange({ ...templateData, profession: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de badge</label>
                  <input
                    type="text"
                    value={templateData.badgeType}
                    onChange={(e) => handleDataChange({ ...templateData, badgeType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de badge</label>
                  <input
                    type="text"
                    value={templateData.badgeNumber}
                    onChange={(e) => handleDataChange({ ...templateData, badgeNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const newData = { ...templateData }
                    // Générer un numéro de badge unique
                    newData.badgeNumber = `BADGE-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
                    handleDataChange(newData)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Générer nouveau numéro
                </button>

                <button
                  onClick={() => {
                    const newData = { ...templateData }
                    // Remplacer les données par des exemples
                    newData.fullName = 'MARIE CURIE'
                    newData.company = 'Institut Pasteur'
                    newData.profession = 'Chercheuse'
                    handleDataChange(newData)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                  Utiliser données d'exemple
                </button>
              </div>
            </div>

            {/* Export/Impression */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Impression</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Logique d'export PDF
                    alert('Export PDF en cours de développement...')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Exporter en PDF
                </button>

                <button
                  onClick={() => {
                    // Logique d'impression
                    alert('Impression en cours de développement...')
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FiPrinter className="w-4 h-4" />
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}