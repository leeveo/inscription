'use client'

import React, { useState } from 'react'
import { FiEdit3, FiEye, FiCopy, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi'
import { ExtendedBadgeTemplate, BadgeTemplatePreset, CORPORATE_BADGE_TEMPLATE, CONFERENCE_BADGE_TEMPLATE, VIP_BADGE_TEMPLATE } from '@/types/badge-templates'

interface BadgeTemplateSelectorProps {
  eventId: string
  onTemplateSelect: (template: ExtendedBadgeTemplate) => void
  onTemplateEdit: (template: ExtendedBadgeTemplate) => void
  selectedTemplate?: ExtendedBadgeTemplate
}

export default function BadgeTemplateSelector({ eventId, onTemplateSelect, onTemplateEdit, selectedTemplate }: BadgeTemplateSelectorProps) {
  const [templates, setTemplates] = useState<BadgeTemplatePreset[]>([
    // Template 1: Taylor Swift Concert - Copie exacte du template ticket
    {
      id: 'taylor-swift-badge',
      name: 'Taylor Swift Concert',
      description: 'Template premium concert identique au ticket',
      category: 'concert',
      preview: '',
      template: {
        id: 'taylor-swift-badge',
        event_id: '',
        name: 'Taylor Swift Concert',
        type: 'vip',
        orientation: 'portrait',
        width: 105,
        height: 148,
        schema: {
          layout: {
            width: 105,
            height: 148,
            margins: { top: 5, right: 5, bottom: 5, left: 5 }
          },
          zones: [
            {
              id: 'event-header',
              type: 'shape',
              name: 'En-tête Événement',
              position: { x: 0, y: 0, width: 105, height: 18 },
              content: { text: '' },
              style: {
                background: '#FF1744',
                border_radius: 4,
                borderWidth: 0
              }
            },
            {
              id: 'event-type',
              type: 'text',
              name: 'Type Événement',
              position: { x: 5, y: 2, width: 95, height: 4 },
              content: { text: 'CONCERT', variable: 'eventType' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                font_weight: 'bold',
                text_align: 'center',
                letter_spacing: 0.5
              }
            },
            {
              id: 'event-name',
              type: 'text',
              name: 'Nom Événement',
              position: { x: 5, y: 6, width: 95, height: 8 },
              content: { text: 'TAYLOR SWIFT | THE ERAS TOUR', variable: 'eventName' },
              style: {
                color: '#FFFFFF',
                font_size: 5,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'organizer-name',
              type: 'text',
              name: 'Organisateur',
              position: { x: 5, y: 13, width: 95, height: 4 },
              content: { text: 'Live Nation Entertainment', variable: 'organizerName' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                text_align: 'center',
                opacity: 0.8
              }
            },
            {
              id: 'venue-section',
              type: 'shape',
              name: 'Section Lieu',
              position: { x: 5, y: 20, width: 95, height: 12 },
              content: { text: '' },
              style: {
                background: 'rgba(255,255,255,0.1)',
                border_radius: 2,
                borderWidth: 0,
                border_color: 'rgba(255,255,255,0.2)'
              }
            },
            {
              id: 'venue-name',
              type: 'text',
              name: 'Nom Lieu',
              position: { x: 8, y: 22, width: 89, height: 4 },
              content: { text: 'STADE DE FRANCE', variable: 'venue.name' },
              style: {
                color: '#FFFFFF',
                font_size: 5,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'venue-address',
              type: 'text',
              name: 'Adresse Lieu',
              position: { x: 8, y: 26, width: 89, height: 5 },
              content: { text: 'Saint-Denis, France', variable: 'venue.address' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                text_align: 'center',
                opacity: 0.9
              }
            },
            {
              id: 'date-time-section',
              type: 'shape',
              name: 'Section Date/Heure',
              position: { x: 5, y: 34, width: 95, height: 12 },
              content: { text: '' },
              style: {
                background: 'rgba(255,23,68,0.1)',
                border_radius: 2,
                borderWidth: 0,
                border_color: 'rgba(255,23,68,0.3)'
              }
            },
            {
              id: 'event-date',
              type: 'text',
              name: 'Date Événement',
              position: { x: 8, y: 36, width: 40, height: 4 },
              content: { text: '31 MAI 2024', variable: 'schedule.startDate' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                font_weight: 'bold',
                text_align: 'left'
              }
            },
            {
              id: 'event-time',
              type: 'text',
              name: 'Heure Événement',
              position: { x: 52, y: 36, width: 45, height: 4 },
              content: { text: '20:00', variable: 'schedule.startTime' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                font_weight: 'bold',
                text_align: 'right'
              }
            },
            {
              id: 'doors-open',
              type: 'text',
              name: 'Ouverture Portes',
              position: { x: 8, y: 41, width: 89, height: 4 },
              content: { text: 'Ouverture des portes : 18:30', variable: 'schedule.doorsOpen' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                text_align: 'center',
                opacity: 0.8
              }
            },
            {
              id: 'attendee-section',
              type: 'shape',
              name: 'Section Participant',
              position: { x: 5, y: 48, width: 95, height: 10 },
              content: { text: '' },
              style: {
                background: 'rgba(255,255,255,0.05)',
                border_radius: 2,
                borderWidth: 0,
                border_color: 'rgba(255,255,255,0.1)'
              }
            },
            {
              id: 'attendee-name',
              type: 'text',
              name: 'Nom Participant',
              position: { x: 8, y: 52, width: 89, height: 5 },
              content: { text: 'JOHN DOE', variable: 'fullName' },
              style: {
                color: '#FFFFFF',
                font_size: 5,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'ticket-details',
              type: 'text',
              name: 'Détails Billet',
              position: { x: 8, y: 56, width: 89, height: 3 },
              content: { text: 'CATÉGORIE 1 - PLACEMENT DEBOUT', variable: 'ticketType' },
              style: {
                color: '#FFFFFF',
                font_size: 2,
                text_align: 'center',
                opacity: 0.8
              }
            },
            {
              id: 'seating-info',
              type: 'shape',
              name: 'Infos Placement',
              position: { x: 5, y: 60, width: 95, height: 12 },
              content: { text: '' },
              style: {
                background: '#FF1744',
                border_radius: 2,
                borderWidth: 0
              }
            },
            {
              id: 'seating-label',
              type: 'text',
              name: 'Label Placement',
              position: { x: 8, y: 62, width: 89, height: 3 },
              content: { text: 'VOTRE PLACEMENT' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                font_weight: 'bold',
                text_align: 'center',
                letter_spacing: 0.2
              }
            },
            {
              id: 'seating-details',
              type: 'text',
              name: 'Détails Placement',
              position: { x: 8, y: 66, width: 89, height: 5 },
              content: { text: 'BLOC N3 - RANG 3 - SIÈGE 15', variable: 'seating.section' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'pricing-section',
              type: 'shape',
              name: 'Section Prix',
              position: { x: 5, y: 74, width: 45, height: 9 },
              content: { text: '' },
              style: {
                background: 'rgba(255,255,255,0.1)',
                border_radius: 2,
                borderWidth: 0,
                border_color: 'rgba(255,255,255,0.2)'
              }
            },
            {
              id: 'price-label',
              type: 'text',
              name: 'Label Prix',
              position: { x: 8, y: 75, width: 39, height: 3 },
              content: { text: 'PRIX' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                text_align: 'center',
                opacity: 0.8
              }
            },
            {
              id: 'ticket-price',
              type: 'text',
              name: 'Prix Billet',
              position: { x: 8, y: 79, width: 39, height: 3 },
              content: { text: '125,00 €', variable: 'total' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'security-section',
              type: 'shape',
              name: 'Section Sécurité',
              position: { x: 55, y: 74, width: 45, height: 9 },
              content: { text: '' },
              style: {
                background: 'rgba(0,0,0,0.3)',
                border_radius: 2,
                borderWidth: 0,
                border_color: 'rgba(255,255,255,0.1)'
              }
            },
            {
              id: 'ticket-id',
              type: 'text',
              name: 'ID Billet',
              position: { x: 58, y: 75, width: 39, height: 3 },
              content: { text: 'ID: TS2024-001234', variable: 'ticketId' },
              style: {
                color: '#FFFFFF',
                font_size: 2,
                text_align: 'center',
                opacity: 0.8
              }
            },
            {
              id: 'serial-number',
              type: 'text',
              name: 'Numéro Série',
              position: { x: 58, y: 79, width: 39, height: 3 },
              content: { text: 'S/N: TSERAS2024', variable: 'serialNumber' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'qr-code',
              type: 'qr',
              name: 'QR Code',
              position: { x: 35, y: 86, width: 35, height: 25 },
              content: { variable: 'qrCode' },
              style: {
                background: '#FFFFFF',
                border_radius: 2
              }
            },
            {
              id: 'badge-number',
              type: 'text',
              name: 'Numéro Badge',
              position: { x: 8, y: 113, width: 89, height: 3 },
              content: { text: 'BADGE #VIP-001234', variable: 'badgeNumber' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                text_align: 'center',
                opacity: 0.8
              }
            }
          ],
          background: {
            gradient: {
              start: '#1a1a1a',
              end: '#2d2d2d',
              direction: 'vertical'
            }
          }
        },
        styles: {
          global: {
            font_family: 'Arial',
            primary_color: '#FFFFFF',
            secondary_color: 'rgba(255,255,255,0.8)',
            accent_color: '#FF1744',
            background_color: '#1a1a1a',
            text_color: '#FFFFFF'
          }
        },
        settings: {
          print: {
            dpi: 300,
            quality: 'high',
            duplex: false,
            color: true
          },
          qr: {
            error_correction: 'M',
            size: 150,
            margin: 2,
            foreground: '#000000',
            background: '#FFFFFF'
          },
          security: {
            watermark: false,
            watermark_opacity: 0.1,
            serialize: true
          },
          badge: {
            material: 'plastic',
            lamination: true,
            holder: 'lanyard'
          }
        },
        preview_image: '',
        is_default: false,
        is_active: true,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    // Template 2: Concert Standard - Copie exacte du template ticket
    {
      id: 'concert-standard-badge',
      name: 'Concert Standard',
      description: 'Template concert standard identique au ticket',
      category: 'concert',
      preview: '',
      template: {
        id: 'concert-standard-badge',
        event_id: '',
        name: 'Concert Standard',
        type: 'standard',
        orientation: 'portrait',
        width: 105,
        height: 148,
        schema: {
          layout: {
            width: 105,
            height: 148,
            margins: { top: 5, right: 5, bottom: 5, left: 5 }
          },
          zones: [
            {
              id: 'event-name',
              type: 'text',
              name: 'Nom Événement',
              position: { x: 5, y: 8, width: 95, height: 8 },
              content: { text: 'SUMMER MUSIC FESTIVAL', variable: 'eventName' },
              style: {
                color: '#FFFFFF',
                font_size: 6,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'venue-date',
              type: 'text',
              name: 'Lieu & Date',
              position: { x: 5, y: 18, width: 95, height: 12 },
              content: { text: 'PARIS CONGRESS CENTER\n15 JUIN 2024', variable: 'venue.name' },
              style: {
                color: '#FFFFFF',
                font_size: 5,
                text_align: 'center'
              }
            },
            {
              id: 'seat-info',
              type: 'shape',
              name: 'Infos Siège',
              position: { x: 5, y: 32, width: 95, height: 12 },
              content: { text: '' },
              style: {
                background: 'rgba(255,255,255,0.2)',
                border_radius: 2,
                borderWidth: 0
              }
            },
            {
              id: 'seat-info-text',
              type: 'text',
              name: 'Texte Siège',
              position: { x: 8, y: 36, width: 89, height: 5 },
              content: { text: 'SECTION - RANG - SIÈGE', variable: 'seating.section' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'participant-name',
              type: 'text',
              name: 'Nom Participant',
              position: { x: 5, y: 46, width: 95, height: 6 },
              content: { text: 'NOM DU PARTICIPANT', variable: 'fullName' },
              style: {
                color: '#FFFFFF',
                font_size: 5,
                text_align: 'center'
              }
            },
            {
              id: 'qr-code',
              type: 'qr',
              name: 'QR Code',
              position: { x: 25, y: 54, width: 55, height: 35 },
              content: { variable: 'qrCode' },
              style: {
                background: '#FFFFFF',
                border_radius: 2
              }
            },
            {
              id: 'ticket-number',
              type: 'text',
              name: 'Numéro Ticket',
              position: { x: 5, y: 92, width: 95, height: 5 },
              content: { text: 'N° TICKET', variable: 'ticketNumber' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                text_align: 'center'
              }
            }
          ],
          background: {
            gradient: {
              start: '#6B46C1',
              end: '#EC4899',
              direction: 'diagonal'
            }
          }
        },
        styles: {
          global: {
            font_family: 'Arial',
            primary_color: '#FFFFFF',
            secondary_color: 'rgba(255,255,255,0.8)',
            accent_color: '#6B46C1',
            background_color: '#6B46C1',
            text_color: '#FFFFFF'
          }
        },
        settings: {
          print: {
            dpi: 300,
            quality: 'high',
            duplex: false,
            color: true
          },
          qr: {
            error_correction: 'M',
            size: 150,
            margin: 2,
            foreground: '#000000',
            background: '#FFFFFF'
          },
          security: {
            watermark: false,
            watermark_opacity: 0.1,
            serialize: true
          },
          badge: {
            material: 'plastic',
            lamination: true,
            holder: 'lanyard'
          }
        },
        preview_image: '',
        is_default: false,
        is_active: true,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    // Template 3: Conference Pro - Copie exacte du template ticket
    {
      id: 'conference-pro-badge',
      name: 'Conference Pro',
      description: 'Template conférence pro identique au ticket',
      category: 'conference',
      preview: '',
      template: {
        id: 'conference-pro-badge',
        event_id: '',
        name: 'Conference Pro',
        type: 'speaker',
        orientation: 'portrait',
        width: 105,
        height: 148,
        schema: {
          layout: {
            width: 105,
            height: 148,
            margins: { top: 5, right: 5, bottom: 5, left: 5 }
          },
          zones: [
            {
              id: 'event-header',
              type: 'shape',
              name: 'En-tête Événement',
              position: { x: 0, y: 0, width: 105, height: 25 },
              content: { text: '' },
              style: {
                background: '#1F2937',
                border_radius: 4,
                borderWidth: 0
              }
            },
            {
              id: 'event-name',
              type: 'text',
              name: 'Nom Événement',
              position: { x: 5, y: 5, width: 95, height: 8 },
              content: { text: 'CONFÉRENCE ANNUELLE', variable: 'eventName' },
              style: {
                color: '#FFFFFF',
                font_size: 6,
                font_weight: 'bold',
                text_align: 'center'
              }
            },
            {
              id: 'venue-date',
              type: 'text',
              name: 'Lieu & Date',
              position: { x: 5, y: 15, width: 95, height: 8 },
              content: { text: 'CENTRE DE CONFÉRENCES\n15 JUIN 2024', variable: 'venue.name' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                text_align: 'center'
              }
            },
            {
              id: 'participant-name',
              type: 'text',
              name: 'Nom Participant',
              position: { x: 5, y: 35, width: 95, height: 8 },
              content: { text: 'NOM DU PARTICIPANT', variable: 'fullName' },
              style: {
                color: '#FFFFFF',
                font_size: 6,
                text_align: 'center'
              }
            },
            {
              id: 'barcode',
              type: 'shape',
              name: 'Code-barres',
              position: { x: 15, y: 50, width: 75, height: 20 },
              content: { text: '' },
              style: {
                background: '#FFFFFF',
                border_radius: 2,
                borderWidth: 0
              }
            },
            {
              id: 'barcode-text',
              type: 'text',
              name: 'Texte Code-barres',
              position: { x: 5, y: 73, width: 95, height: 5 },
              content: { text: 'N° BADGE', variable: 'badgeNumber' },
              style: {
                color: '#FFFFFF',
                font_size: 4,
                text_align: 'center',
                opacity: 0.8
              }
            },
            {
              id: 'qr-code',
              type: 'qr',
              name: 'QR Code',
              position: { x: 35, y: 80, width: 35, height: 35 },
              content: { variable: 'qrCode' },
              style: {
                background: '#FFFFFF',
                border_radius: 4,
                border: '2px solid #1F2937'
              }
            },
            {
              id: 'participant-role',
              type: 'text',
              name: 'Rôle',
              position: { x: 5, y: 118, width: 95, height: 5 },
              content: { text: 'SPEAKER • DATA SCIENTIST', variable: 'profession' },
              style: {
                color: '#FFFFFF',
                font_size: 3,
                text_align: 'center',
                opacity: 0.8
              }
            }
          ],
          background: {
            color: '#1F2937'
          }
        },
        styles: {
          global: {
            font_family: 'Arial',
            primary_color: '#FFFFFF',
            secondary_color: 'rgba(255,255,255,0.8)',
            accent_color: '#3B82F6',
            background_color: '#1F2937',
            text_color: '#FFFFFF'
          }
        },
        settings: {
          print: {
            dpi: 300,
            quality: 'high',
            duplex: false,
            color: true
          },
          qr: {
            error_correction: 'M',
            size: 150,
            margin: 2,
            foreground: '#000000',
            background: '#FFFFFF'
          },
          security: {
            watermark: false,
            watermark_opacity: 0.1,
            serialize: true
          },
          badge: {
            material: 'plastic',
            lamination: true,
            holder: 'lanyard'
          }
        },
        preview_image: '',
        is_default: false,
        is_active: true,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  ])

  const [customTemplates, setCustomTemplates] = useState<ExtendedBadgeTemplate[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleSelectTemplate = (template: ExtendedBadgeTemplate) => {
    onTemplateSelect(template)
  }

  const handleEditTemplate = (template: ExtendedBadgeTemplate) => {
    onTemplateEdit(template)
  }

  const handleDuplicateTemplate = (preset: BadgeTemplatePreset) => {
    const newTemplate: ExtendedBadgeTemplate = {
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
                      ? 'bg-red-100 text-red-700'
                      : preset.category === 'corporate'
                      ? 'bg-gray-100 text-gray-700'
                      : preset.category === 'conference'
                      ? 'bg-blue-100 text-blue-700'
                      : preset.category === 'vip'
                      ? 'bg-yellow-100 text-yellow-700'
                      : preset.category === 'speaker'
                      ? 'bg-green-100 text-green-700'
                      : preset.category === 'staff'
                      ? 'bg-orange-100 text-orange-700'
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
          Créez votre propre design de badge à partir de zéro
        </p>
      </div>

      {/* Formulaire de création rapide */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Nouveau template de badge</h3>
            <input
              type="text"
              placeholder="Nom du template"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              id="custom-badge-template-name"
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
                  const name = (document.getElementById('custom-badge-template-name') as HTMLInputElement)?.value
                  if (name) {
                    const newTemplate: ExtendedBadgeTemplate = {
                      id: `custom-${Date.now()}`,
                      event_id: '',
                      name,
                      type: 'standard',
                      orientation: 'portrait',
                      width: 105,
                      height: 148,
                      schema: {
                        layout: {
                          width: 105,
                          height: 148,
                          margins: { top: 5, right: 5, bottom: 5, left: 5 }
                        },
                        zones: [],
                        background: {
                          color: '#FFFFFF'
                        }
                      },
                      styles: {
                        global: {
                          font_family: 'Arial',
                          primary_color: '#000000',
                          secondary_color: '#666666',
                          accent_color: '#3B82F6',
                          background_color: '#FFFFFF',
                          text_color: '#000000'
                        }
                      },
                      settings: {
                        print: {
                          dpi: 300,
                          quality: 'medium',
                          duplex: false,
                          color: true
                        },
                        qr: {
                          error_correction: 'M',
                          size: 150,
                          margin: 2,
                          foreground: '#000000',
                          background: '#FFFFFF'
                        },
                        security: {
                          watermark: false,
                          watermark_opacity: 0.1,
                          serialize: true
                        },
                        badge: {
                          material: 'plastic',
                          lamination: true,
                          holder: 'lanyard'
                        }
                      },
                      preview_image: '',
                      is_default: false,
                      is_active: true,
                      version: 1,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
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