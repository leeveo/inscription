'use client'

import React, { useState, useEffect } from 'react'
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
import { BadgeTemplate } from '@/types/badge'
import { BadgeData, ExtendedBadgeTemplate } from '@/types/badge-templates'
import BadgeTemplateSelector from './BadgeTemplateSelector'
import BadgeEditor from './BadgeEditor'
import BadgePDFGenerator from './BadgePDFGenerator'

interface BadgeCustomizationTabProps {
  eventId: string
  eventName?: string
}

// Type pour les données d'événement
type EventData = {
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  organisateur?: string
  email_contact?: string
  telephone_contact?: string
  nom_lieu?: string
  adresse_evenement?: string
  type_evenement?: string
  prix?: number
  places_disponibles?: number
  nom_organisation?: string
  organisation_telephone?: string
  organisation_site_web?: string
  logo_url?: string
  statut?: string
  code_acces?: string
  organisation_adresse?: string
  organisation_code_postal?: string
  organisation_ville?: string
  organisation_pays?: string
  representant_legal_nom?: string
  representant_legal_prenom?: string
  representant_legal_fonction?: string
  formatted?: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
  }
  statistics?: {
    totalParticipants: number
    totalSessions: number
    checkedInParticipants: number
  }
}

export default function BadgeCustomizationTabNew({ eventId, eventName }: BadgeCustomizationTabProps) {
  const [currentView, setCurrentView] = useState<'selector' | 'editor'>('selector')
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedBadgeTemplate | null>(null)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(false)
  const [templateData, setTemplateData] = useState<BadgeData>({
    // Event Information
    eventName: eventName || 'CONFÉRENCE TECH INNOVATION 2025',
    eventId: 'fb350c24-7de6-475b-902d-d24ccfb34287',
    eventType: 'CONFERENCE',
    organizerName: 'Tech Events Organization',
    organizerContact: {
      email: 'contact@techevents.com',
      phone: '+33 1 42 68 60 00',
      website: 'www.techevents.com'
    },
    venue: {
      name: 'Paris Expo Porte de Versailles',
      address: 'Place de la Porte de Versailles',
      city: 'Paris',
      postalCode: '75015',
      country: 'France',
      capacity: 5000
    },
    schedule: {
      startDate: '15 Mars 2025',
      endDate: '17 Mars 2025',
      doorsOpen: '08:00',
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Europe/Paris'
    },
    description: 'Une conférence technique de 3 jours dédiée aux dernières innovations technologiques et au networking.',
    termsUrl: 'https://techevents.com/terms',
    websiteUrl: 'https://techevents.com',

    // Attendee Information
    firstName: 'JEAN',
    lastName: 'DUPONT',
    fullName: 'JEAN DUPONT',
    email: 'jean.dupont@company.com',
    phone: '+33 6 12 34 56 78',
    address: {
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France'
    },
    company: 'Tech Solutions',
    profession: 'Développeur Full Stack',
    badgeId: 'BADGE-2025-001234',
    registrationDate: '10/02/2025',
    registrationSource: 'Online',
    role: 'DÉLÉGUÉ',
    department: 'Département Technique',

    // Badge Information
    badgeType: 'STANDARD',
    badgeCategory: 'PARTICIPANT',
    accessLevel: 'ACCÈS COMPLET',
    seating: {
      section: 'Zone A',
      table: 'Table 15',
      chair: 'Place 3'
    },
    benefits: ['Accès conférences', 'Accès exposition', 'Coffee breaks', 'Documents numériques'],
    restrictions: ['Zones staff uniquement', 'Backstage interdit'],
    addOns: [
      { name: 'Pack networking', quantity: 1 },
      { name: 'Lunch VIP', quantity: 3 }
    ],

    // Security & Access
    qrCode: 'QR-BADGE-2025-001234-VALID',
    qrUrl: 'https://event-app.com/badge/verify/QR-BADGE-2025-001234-VALID',
    barcode: '12345678901234567890',
    barcodeFormat: 'CODE128',
    badgeNumber: 'BADGE-001234',
    serialNumber: 'BDGCNF2025-001',
    securityFeatures: {
      watermark: true,
      hologram: false,
      uvFeatures: true,
      microtext: false
    },
    validation: {
      validFrom: '15/03/2025 08:00',
      validUntil: '17/03/2025 18:00',
      maxEntries: 999,
      usedEntries: 0
    },

    // Legal Information
    termsAndConditions: 'Ce badge est personnel et incessible. La perte n\'entraîne pas de remplacement gratuit.',
    privacyPolicy: 'Conformément au RGPD, vos données sont protégées et ne seront pas partagées sans consentement.',
    liabilityWaiver: 'L\'organisateur décline toute responsabilité en cas d\'accident ou de vol.',
    ageRestriction: '18+ recommandé pour certaines sessions',
    photoConsent: 'En entrant, vous acceptez d\'être potentiellement photographié.',
    dataProtection: 'Vos données personnelles sont protégées conformément au RGPD.',

    // Layout Options
    format: {
      size: 'standard',
      orientation: 'portrait',
      width: 85,
      height: 55,
      units: 'mm'
    },
    layout: {
      columns: 1,
      rows: 1,
      spacing: 0,
      margins: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      },
      perforation: false,
      folding: false
    },

    // Media
    backgroundImage: '/conference-badge-bg.jpg',
    photoUrl: '/participant-placeholder.jpg',
    logoUrl: '/event-logo.png'
  })

  // Charger les données de l'événement
  useEffect(() => {
    if (!eventId) return

    const fetchEventData = async () => {
      try {
        setIsLoadingEvent(true)
        console.log('🎫 Chargement des données de l\'événement pour badges:', eventId)
        
        const response = await fetch(`/api/builder/event-data/${eventId}`)
        if (response.ok) {
          const result = await response.json()
          const event = result.data
          setEventData(event)
          
          console.log('🎫 Données événement reçues:', event)

          // Récupérer un participant exemple pour les tests
          const participantsResponse = await fetch(`/api/participants?eventId=${eventId}&limit=1`)
          let sampleParticipant = null
          if (participantsResponse.ok) {
            const participantsResult = await participantsResponse.json()
            if (participantsResult.participants && participantsResult.participants.length > 0) {
              sampleParticipant = participantsResult.participants[0]
              console.log('🎫 Participant exemple trouvé:', sampleParticipant)
            }
          }

          // Mettre à jour les données du template avec TOUTES les informations réelles de l'événement
          setTemplateData(prevData => ({
            ...prevData,
            
            // === DONNÉES DE L'ÉVÉNEMENT (RÉELLES depuis inscription_evenements) ===
            eventName: event.nom || eventName || 'Mon Événement',
            eventId: eventId,
            eventType: event.type_evenement?.toUpperCase() || 'CONFERENCE',
            
            // Organisateur - Utiliser seulement les colonnes existantes dans le schéma
            organizerName: event.organisateur || 'Organisation',
            organizerContact: {
              email: event.email_contact || 'contact@event.com',
              phone: event.telephone_contact || '+33 1 23 45 67 89',
              website: 'https://mon-event.com'
            },
            
            // Lieu - Utiliser seulement les colonnes existantes dans le schéma
            venue: {
              name: event.lieu || 'Centre de Conférences',
              address: 'Adresse non renseignée',
              city: 'Ville non renseignée',
              postalCode: 'CP non renseigné',
              country: 'France',
              capacity: event.places_disponibles || 0
            },
            
            // Dates et horaires - Formatage français
            schedule: {
              startDate: event.formatted?.startDate || (event.date_debut ? new Date(event.date_debut).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'Date non renseignée'),
              endDate: event.formatted?.endDate || (event.date_fin ? new Date(event.date_fin).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'Date non renseignée'),
              doorsOpen: '08:00',
              startTime: event.formatted?.startTime || (event.date_debut ? new Date(event.date_debut).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '09:00'),
              endTime: event.formatted?.endTime || (event.date_fin ? new Date(event.date_fin).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '18:00'),
              timezone: 'Europe/Paris'
            },
            
            // Autres informations événement
            description: event.description || 'Description de l\'événement',
            websiteUrl: event.organisation_site_web || 'https://mon-event.com',
            termsUrl: event.organisation_site_web ? `${event.organisation_site_web}/conditions` : undefined,
            
            // === DONNÉES DU PARTICIPANT (exemple ou réel si disponible) ===
            firstName: sampleParticipant?.prenom || 'JEAN',
            lastName: sampleParticipant?.nom || 'DUPONT',
            fullName: sampleParticipant ? `${sampleParticipant.prenom.toUpperCase()} ${sampleParticipant.nom.toUpperCase()}` : 'JEAN DUPONT',
            email: sampleParticipant?.email || 'jean.dupont@company.com',
            phone: sampleParticipant?.telephone || '+33 6 12 34 56 78',
            
            // Adresse participant (structure complète)
            address: {
              street: '123 Avenue des Champs-Élysées',
              city: 'Paris',
              postalCode: '75008',
              country: 'France'
            },
            
            // Informations professionnelles
            company: sampleParticipant?.profession || 'Nom Entreprise', // Note: profession peut servir d'entreprise
            profession: sampleParticipant?.profession || 'Profession',
            department: 'Département',
            role: 'PARTICIPANT',
            
            // === DONNÉES DE BADGE (générées) ===
            badgeId: `BADGE-${eventId.slice(-8)}-${Date.now().toString().slice(-6)}`,
            badgeNumber: `${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            badgeType: 'STANDARD',
            badgeCategory: 'PARTICIPANT',
            accessLevel: 'ACCÈS COMPLET',
            serialNumber: `BDGCNF2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            
            // QR Code et sécurité
            qrCode: `https://event-app.com/checkin/${eventId}/${sampleParticipant?.id || 'demo'}`,
            qrUrl: `https://event-app.com/checkin/${eventId}/${sampleParticipant?.id || 'demo'}`,
            barcode: String(Date.now()).slice(-12),
            barcodeFormat: 'CODE128',
            
            // Dates d'inscription
            registrationDate: sampleParticipant?.created_at ? new Date(sampleParticipant.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
            registrationSource: 'Online',
            
            // === MÉDIAS ET VISUELS ===
            logoUrl: event.logo_url || '/event-logo.png',
            backgroundImage: event.logo_url ? undefined : '/conference-badge-bg.jpg',
            photoUrl: '/participant-placeholder.jpg',
            
            // === OPTIONS DE MISE EN PAGE ===
            format: {
              size: 'standard',
              orientation: 'portrait' as const,
              width: 85,
              height: 55,
              units: 'mm'
            },
            
            // === INFORMATIONS COMPLÉMENTAIRES DEPUIS L'ÉVÉNEMENT ===
            // Prix et places (pour information)
            eventPrice: event.prix || 0,
            eventCapacity: event.places_disponibles || 0,
            
            // Contact organisateur complet
            eventContact: {
              email: event.email_contact || '',
              phone: event.telephone_contact || event.organisation_telephone || '',
              representant: event.representant_legal_nom && event.representant_legal_prenom 
                ? `${event.representant_legal_prenom} ${event.representant_legal_nom}` 
                : '',
              fonction: event.representant_legal_fonction || ''
            }
          }))
          
          console.log('🎫 Données de badge mises à jour avec les données réelles de l\'événement')
        }
      } catch (error) {
        console.error('🎫 Erreur lors du chargement des données événement:', error)
      } finally {
        setIsLoadingEvent(false)
      }
    }

    fetchEventData()
  }, [eventId, eventName])

  const handleTemplateSelect = (template: ExtendedBadgeTemplate) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
  }

  const handleTemplateEdit = (template: ExtendedBadgeTemplate) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
  }

  const handleTemplateChange = (template: ExtendedBadgeTemplate) => {
    setSelectedTemplate(template)
  }

  const handleDataChange = (data: BadgeData) => {
    setTemplateData(data)
  }

  const handleSave = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch('/api/badge-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTemplate.id,
          name: selectedTemplate.name,
          schema: {
            layout: {
              width: selectedTemplate.width,
              height: selectedTemplate.height,
              margins: { top: 5, right: 5, bottom: 5, left: 5 }
            },
            zones: selectedTemplate.zones,
            background: selectedTemplate.background
          },
          styles: selectedTemplate.styles,
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
              background: '#ffffff'
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
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Template de badge sauvegardé avec succès!')
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde')
      }
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

      {/* Notification d'intégration des données réelles */}
      {eventData && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-900">Données réelles intégrées automatiquement</h3>
              <div className="mt-2 text-sm text-green-800">
                <p>✅ <strong>Données réelles de inscription_evenements intégrées :</strong></p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>📅 <strong>Événement :</strong> {eventData.nom}</div>
                  <div>🏢 <strong>Organisateur :</strong> {eventData.nom_organisation || eventData.organisateur || 'Non renseigné'}</div>
                  <div>📍 <strong>Lieu :</strong> {eventData.nom_lieu || eventData.lieu || 'Non renseigné'}</div>
                  <div>🗓️ <strong>Date :</strong> {eventData.formatted?.startDate || (eventData.date_debut ? new Date(eventData.date_debut).toLocaleDateString('fr-FR') : 'Non renseignée')}</div>
                  <div>📧 <strong>Contact :</strong> {eventData.email_contact || 'Non renseigné'}</div>
                  <div>📞 <strong>Tél :</strong> {eventData.telephone_contact || eventData.organisation_telephone || 'Non renseigné'}</div>
                  {eventData.prix && (
                    <div>💰 <strong>Prix :</strong> {eventData.prix}€</div>
                  )}
                  {eventData.places_disponibles && (
                    <div>👥 <strong>Capacité :</strong> {eventData.places_disponibles} places</div>
                  )}
                  {eventData.statistics?.totalParticipants > 0 && (
                    <div>✍️ <strong>Inscrits :</strong> {eventData.statistics.totalParticipants} participants</div>
                  )}
                  {eventData.logo_url && (
                    <div>🖼️ <strong>Logo :</strong> Disponible</div>
                  )}
                </div>
                <div className="mt-2 p-2 bg-green-100 rounded border text-xs">
                  <strong>🔄 Variables automatiques :</strong> Tous les templates de badges utilisent maintenant ces données réelles au lieu de données fictives.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de chargement */}
      {isLoadingEvent && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-900 font-medium">Chargement des données de l'événement...</span>
          </div>
        </div>
      )}

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
            {/* Génération et impression */}
            <BadgePDFGenerator
              template={selectedTemplate}
              data={templateData}
            />

            {/* Données du badge */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                Données du badge
              </h3>

              <div className="space-y-4">
                {/* Section Événement */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">📅 Informations Événement</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'événement</label>
                      <input
                        type="text"
                        value={templateData.eventName}
                        onChange={(e) => handleDataChange({ ...templateData, eventName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Nom de votre événement"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organisateur</label>
                      <input
                        type="text"
                        value={templateData.organizerName || ''}
                        onChange={(e) => handleDataChange({ ...templateData, organizerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Nom de l'organisateur"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                      <input
                        type="text"
                        value={templateData.venue?.name || ''}
                        onChange={(e) => handleDataChange({
                          ...templateData,
                          venue: {
                            ...templateData.venue,
                            name: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Lieu de l'événement"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
                        <input
                          type="text"
                          value={templateData.schedule?.startDate || ''}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-gray-50"
                          placeholder="Date de début"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Heure</label>
                        <input
                          type="text"
                          value={templateData.schedule?.startTime || ''}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-gray-50"
                          placeholder="Heure"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Participant */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 mb-3">👤 Informations Participant</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={templateData.fullName}
                        onChange={(e) => handleDataChange({ ...templateData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-semibold"
                        placeholder="NOM Prénom du participant"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                        <input
                          type="text"
                          value={templateData.firstName}
                          onChange={(e) => handleDataChange({ ...templateData, firstName: e.target.value, fullName: `${e.target.value} ${templateData.lastName}` })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          value={templateData.lastName}
                          onChange={(e) => handleDataChange({ ...templateData, lastName: e.target.value, fullName: `${templateData.firstName} ${e.target.value}` })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                      <input
                        type="text"
                        value={templateData.company || ''}
                        onChange={(e) => handleDataChange({ ...templateData, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="Nom de l'entreprise"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                      <input
                        type="text"
                        value={templateData.profession || ''}
                        onChange={(e) => handleDataChange({ ...templateData, profession: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="Profession du participant"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle sur l'événement</label>
                      <select
                        value={templateData.role || ''}
                        onChange={(e) => handleDataChange({ ...templateData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      >
                        <option value="PARTICIPANT">PARTICIPANT</option>
                        <option value="INTERVENANT">INTERVENANT</option>
                        <option value="ORGANISATEUR">ORGANISATEUR</option>
                        <option value="VIP">VIP</option>
                        <option value="PRESSE">PRESSE</option>
                        <option value="PARTENAIRE">PARTENAIRE</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section Badge */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-purple-900 mb-3">🎫 Informations Badge</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de badge</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={templateData.badgeNumber}
                          onChange={(e) => handleDataChange({ ...templateData, badgeNumber: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                          placeholder="Numéro du badge"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newBadgeNumber = `${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
                            handleDataChange({ ...templateData, badgeNumber: newBadgeNumber })
                          }}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs"
                          title="Générer nouveau numéro"
                        >
                          🔄
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accès</label>
                      <select
                        value={templateData.accessLevel || ''}
                        onChange={(e) => handleDataChange({ ...templateData, accessLevel: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      >
                        <option value="ACCÈS COMPLET">ACCÈS COMPLET</option>
                        <option value="ACCÈS LIMITÉ">ACCÈS LIMITÉ</option>
                        <option value="VIP">ACCÈS VIP</option>
                        <option value="PRESSE ONLY">PRESSE UNIQUEMENT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Code QR</label>
                      <input
                        type="text"
                        value={templateData.qrCode}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-gray-50 font-mono"
                        placeholder="Code QR généré automatiquement"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations en lecture seule */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">📊 Données automatiques</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Email: {templateData.email}</div>
                    <div>Inscription: {templateData.registrationDate}</div>
                    {eventData?.statistics?.totalParticipants && (
                      <div>Total participants: {eventData.statistics.totalParticipants}</div>
                    )}
                  </div>
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
                    newData.firstName = 'MARIE'
                    newData.lastName = 'CURIE'
                    newData.company = 'Institut Pasteur'
                    newData.profession = 'Chercheuse Scientifique'
                    newData.role = 'INTERVENANT'
                    newData.email = 'marie.curie@institut-pasteur.fr'
                    handleDataChange(newData)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                  Utiliser données d'exemple
                </button>

                <button
                  onClick={async () => {
                    try {
                      // Récupérer un participant aléatoire de l'événement
                      const response = await fetch(`/api/participants?eventId=${eventId}&limit=1&offset=${Math.floor(Math.random() * 10)}`)
                      if (response.ok) {
                        const result = await response.json()
                        if (result.participants && result.participants.length > 0) {
                          const participant = result.participants[0]
                          const newData = { 
                            ...templateData,
                            firstName: participant.prenom,
                            lastName: participant.nom,
                            fullName: `${participant.prenom} ${participant.nom}`,
                            email: participant.email,
                            phone: participant.telephone || templateData.phone,
                            company: participant.profession || templateData.company,
                            profession: participant.profession || templateData.profession,
                            badgeNumber: `BADGE-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
                          }
                          handleDataChange(newData)
                          alert(`✅ Données mises à jour avec le participant réel: ${participant.prenom} ${participant.nom}`)
                        } else {
                          alert('⚠️ Aucun participant trouvé pour cet événement')
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching participant:', error)
                      alert('❌ Erreur lors de la récupération des participants')
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Utiliser participant réel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}