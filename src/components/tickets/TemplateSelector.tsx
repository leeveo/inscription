'use client'

import React, { useState } from 'react'
import { FiEdit3, FiEye, FiCopy, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi'
import { TicketTemplate, TicketTemplatePreset, TAYLOR_SWIFT_TEMPLATE, CONCERT_TEMPLATE } from '@/types/ticket-templates'

interface TemplateSelectorProps {
  eventId: string
  onTemplateSelect: (template: TicketTemplate) => void
  onTemplateEdit: (template: TicketTemplate) => void
  selectedTemplate?: TicketTemplate
}

export default function TemplateSelector({ eventId, onTemplateSelect, onTemplateEdit, selectedTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TicketTemplatePreset[]>([
    {
      id: 'concert-pro',
      name: 'Concert Pro',
      description: 'Template professionnel pour concerts et événements',
      category: 'concert',
      preview: '',
      template: TAYLOR_SWIFT_TEMPLATE
    },
    {
      id: 'concert-standard',
      name: 'Concert Standard',
      description: 'Template moderne pour tous types de concerts',
      category: 'concert',
      preview: '',
      template: CONCERT_TEMPLATE
    },
    {
      id: 'conference-pro',
      name: 'Conference Pro',
      description: 'Template professionnel pour conférences',
      category: 'conference',
      preview: '',
      template: {
        id: 'conference-pro',
        name: 'Conference Pro',
        width: 350,
        height: 600,
        background: {
          color: '#1F2937'
        },
        zones: [
          {
            id: 'event-name',
            type: 'text',
            name: 'Nom Événement',
            x: 20,
            y: 30,
            width: 310,
            height: 40,
            content: {
              type: 'dynamic',
              variable: 'eventName',
              placeholder: 'CONFÉRENCE ANNUELLE'
            },
            style: {
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center',
              fontFamily: 'Arial'
            }
          },
          {
            id: 'venue-date',
            type: 'text',
            name: 'Lieu & Date',
            x: 20,
            y: 80,
            width: 310,
            height: 60,
            content: {
              type: 'dynamic',
              variable: 'venue',
              placeholder: 'CENTRE DE CONFÉRENCES\n15 JUIN 2024'
            },
            style: {
              color: '#FFFFFF',
              fontSize: 14,
              textAlign: 'center',
              fontFamily: 'Arial'
            }
          },
          {
            id: 'participant-name',
            type: 'text',
            name: 'Nom Participant',
            x: 20,
            y: 200,
            width: 310,
            height: 30,
            content: {
              type: 'dynamic',
              variable: 'participantName',
              placeholder: 'NOM DU PARTICIPANT'
            },
            style: {
              color: '#FFFFFF',
              fontSize: 16,
              textAlign: 'center',
              fontFamily: 'Arial'
            }
          },
          {
            id: 'barcode',
            type: 'barcode',
            name: 'Code-barres',
            x: 50,
            y: 300,
            width: 250,
            height: 60,
            content: {
              type: 'dynamic',
              variable: 'barcode',
              placeholder: '1234567890123'
            },
            style: {
              backgroundColor: '#FFFFFF',
              borderRadius: 4
            }
          }
        ],
        styles: {
          global: {
            fontFamily: 'Arial',
            color: '#FFFFFF'
          }
        }
      }
    }
  ])

  const [customTemplates, setCustomTemplates] = useState<TicketTemplate[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleSelectTemplate = (template: TicketTemplate) => {
    onTemplateSelect(template)
  }

  const handleEditTemplate = (template: TicketTemplate) => {
    onTemplateEdit(template)
  }

  const handleDuplicateTemplate = (preset: TicketTemplatePreset) => {
    const newTemplate = {
      ...preset.template,
      id: `custom-${Date.now()}`,
      name: `${preset.template.name} (copie)`
    }
    setCustomTemplates([...customTemplates, newTemplate])
  }

  return (
    <div className="space-y-6">
      {/* Templates prédéfinis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates prédéfinis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((preset) => (
            <div
              key={preset.id}
              className={`relative bg-white border rounded-lg overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                selectedTemplate?.id === preset.template.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200'
              }`}
              onClick={() => handleSelectTemplate(preset.template)}
            >
              {/* Aperçu du template */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {preset.preview && (
                  <img
                    src={preset.preview}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {!preset.preview && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Aperçu non disponible</p>
                    </div>
                  </div>
                )}

                {/* Badge catégorie */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    preset.category === 'concert'
                      ? 'bg-pink-100 text-pink-700'
                      : preset.category === 'conference'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {preset.category}
                  </span>
                </div>

                {/* Indicateur de sélection */}
                {selectedTemplate?.id === preset.template.id && (
                  <div className="absolute top-2 left-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Informations du template */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{preset.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{preset.description}</p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectTemplate(preset.template)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <FiEye className="w-3 h-3" />
                      Aperçu
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTemplate(preset.template)
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      Modifier
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicateTemplate(preset)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dupliquer"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates personnalisés */}
      {customTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates personnalisés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => (
              <div
                key={template.id}
                className={`relative bg-white border rounded-lg overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200'
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Template personnalisé</p>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectTemplate(template)
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        <FiEye className="w-3 h-3" />
                        Aperçu
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTemplate(template)
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors"
                      >
                        <FiEdit3 className="w-3 h-3" />
                        Modifier
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCustomTemplates(customTemplates.filter(t => t.id !== template.id))
                      }}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton créer template personnalisé */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <button
          onClick={() => setShowCustomForm(true)}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Créer un template personnalisé
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Créez votre propre design de ticket à partir de zéro
        </p>
      </div>

      {/* Formulaire de création rapide */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Nouveau template personnalisé</h3>
            <input
              type="text"
              placeholder="Nom du template"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              id="custom-template-name"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCustomForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const name = (document.getElementById('custom-template-name') as HTMLInputElement)?.value
                  if (name) {
                    const newTemplate: TicketTemplate = {
                      id: `custom-${Date.now()}`,
                      name,
                      width: 350,
                      height: 600,
                      background: {
                        color: '#FFFFFF'
                      },
                      zones: [],
                      styles: {
                        global: {
                          fontFamily: 'Arial',
                          color: '#000000'
                        }
                      }
                    }
                    setCustomTemplates([...customTemplates, newTemplate])
                    handleSelectTemplate(newTemplate)
                    setShowCustomForm(false)
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}