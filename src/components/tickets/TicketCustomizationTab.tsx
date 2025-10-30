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
import { TicketTemplate, TicketData } from '@/types/ticket-templates'
import TemplateSelector from './TemplateSelector'
import TicketEditor from './TicketEditor'
import TicketPDFGenerator from './TicketPDFGenerator'

interface TicketCustomizationTabProps {
  eventId: string
  eventName?: string
}

// Type pour les données d'événement (selon schéma exact de inscription_evenements)
type EventData = {
  id: string
  nom: string
  description?: string
  lieu?: string
  date_debut: string
  date_fin?: string
  prix?: number
  places_disponibles?: number
  organisateur?: string
  email_contact?: string
  telephone_contact?: string
  logo_url?: string
  statut?: string
  type_evenement?: string
  code_acces?: string
  created_at: string
  // Données calculées ajoutées par l'API
  sessions?: any[]
  participant_count?: number
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

export default function TicketCustomizationTab({ eventId, eventName }: TicketCustomizationTabProps) {
  const [currentView, setCurrentView] = useState<'selector' | 'editor'>('selector')
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [isLoadingEvent, setIsLoadingEvent] = useState(false)
  const [templateData, setTemplateData] = useState<TicketData>({
    // Event Information - Données par défaut, sera remplacé par les vraies données
    eventName: eventName || 'Mon Événement',
    eventId: eventId,
    eventType: 'CONFERENCE',
    organizerName: 'Organisation',
    organizerContact: {
      email: 'contact@event.com',
      phone: '+33 1 23 45 67 89',
      website: 'https://mon-event.com'
    },
    venue: {
      name: 'Centre de Conférences',
      address: 'Adresse non renseignée',
      city: 'Ville non renseignée',
      postalCode: 'CP non renseigné',
      country: 'France',
      capacity: 0
    },
    schedule: {
      startDate: 'Date non renseignée',
      endDate: 'Date non renseignée',
      doorsOpen: '18:30',
      startTime: '20:00',
      endTime: '23:00',
      timezone: 'Europe/Paris'
    },
    description: 'Taylor Swift | The Eras Tour est une tournée de concerts de la chanteuse américaine Taylor Swift.',
    termsUrl: 'https://livenation.fr/terms',
    websiteUrl: 'https://www.taylorswift.com',

    // Attendee Information
    firstName: 'JOHN',
    lastName: 'DOE',
    fullName: 'JOHN DOE',
    email: 'john.doe@email.com',
    phone: '+33 6 12 34 56 78',
    address: {
      street: '123 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    profession: 'Développeur',
    company: 'Tech Company',
    ticketId: 'TK-2024-001234',
    registrationDate: '15/03/2024',
    registrationSource: 'Online',

    // Product Information
    ticketType: 'CATÉGORIE 1 - PLACEMENT DEBOUT',
    ticketCategory: 'VIP',
    accessLevel: 'TOUT ACCÈS',
    seating: {
      section: 'BLOC N3',
      row: 'RANG 3',
      seat: 'SIÈGE 15',
      entrance: 'PORTE A'
    },
    benefits: ['Accès VIP', 'Bar privé', 'Vue optimale'],
    restrictions: ['Interdiction photo professionnelle', 'Caméras interdites'],
    addOns: [
      { name: 'VIP Pack', quantity: 1 },
      { name: 'T-shirt exclusif', quantity: 2 }
    ],

    // Pricing Information
    currency: 'EUR',
    price: 125.00,
    fees: 12.50,
    tax: 24.50,
    total: 162.00,

    // Security Features
    qrCode: 'QR-TS2024-001234-VALID',
    qrUrl: 'https://event-app.com/verify/QR-TS2024-001234-VALID',
    barcode: '12345678901234567890',
    barcodeFormat: 'CODE128',
    ticketNumber: 'N° 001234',
    serialNumber: 'TSERAS2024-001',
    securityFeatures: {
      watermark: true,
      hologram: true,
      uvFeatures: true,
      microtext: false
    },
    validation: {
      validFrom: '31/05/2024 18:00',
      validUntil: '31/05/2024 23:59',
      maxEntries: 1,
      usedEntries: 0
    },

    // Legal Information
    termsAndConditions: 'Ce billet est personnel et incessible. La vente est définitive. Aucun remboursement. Annulation possible jusqu\'à 48h avant l\'événement.',
    privacyPolicy: 'Conformément au RGPD, vos données sont protégées et ne seront pas partagées sans consentement.',
    liabilityWaiver: 'L\'organisateur décline toute responsabilité en cas d\'accident ou de vol.',
    cancelationPolicy: 'Annulation possible jusqu\'à 48h avant l\'événement avec remboursement de 80%.',
    ageRestriction: 'Interdit aux moins de 16 ans sauf accompagnés.',
    photoConsent: 'En entrant, vous acceptez d\'être potentiellement photographié.',
    dataProtection: 'Vos données personnelles sont protégées conformément au RGPD.',

    // Layout Options
    format: {
      size: 'custom',
      orientation: 'portrait',
      width: 350,
      height: 800,
      units: 'pixels'
    },
    layout: {
      columns: 1,
      rows: 1,
      spacing: 0,
      margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      perforation: false,
      folding: false
    },

    // Media
    backgroundImage: '/téléchargement.png',
    artistImage: '/téléchargement.png',
    sponsorLogos: []
  })

  // Charger les données de l'événement
  // Charger les données de l'événement
  useEffect(() => {
    if (!eventId) return

    const fetchEventData = async () => {
      try {
        setIsLoadingEvent(true)
        console.log('🎫 Chargement des données de l\'événement pour tickets:', eventId)
        
        const response = await fetch(`/api/builder/event-data/${eventId}`)
        if (response.ok) {
          const result = await response.json()
          const event = result.data
          setEventData(event)
          
          console.log('🎫 Données événement reçues:', event)
          console.log('🏢 event.organisateur:', event.organisateur)
          console.log('📍 event.lieu:', event.lieu) 
          console.log('📧 event.email_contact:', event.email_contact)
          console.log('📞 event.telephone_contact:', event.telephone_contact)
          console.log('💰 event.prix:', event.prix)
          
          // Log des données mappées
          const lieuParts = event.lieu ? event.lieu.split(' - ') : []
          console.log('🎯 Lieu séparé - nom:', lieuParts[0])
          console.log('🎯 Lieu séparé - adresse:', lieuParts.length > 1 ? lieuParts.slice(1).join(' - ') : 'Non renseigné')

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
              name: (() => {
                if (!event.lieu) return 'Centre de Conférences'
                // Si le lieu contient " - ", séparer en nom et ville
                const parts = event.lieu.split(' - ')
                return parts[0] || event.lieu
              })(),
              address: (() => {
                if (!event.lieu) return 'Adresse non renseignée'
                // Si le lieu contient " - ", utiliser la partie après comme adresse
                const parts = event.lieu.split(' - ')
                return parts.length > 1 ? parts.slice(1).join(' - ') : 'Adresse non renseignée'
              })(),
              city: (() => {
                if (!event.lieu) return 'Ville non renseignée'
                const parts = event.lieu.split(' - ')
                return parts.length > 1 ? parts[parts.length - 1] : 'Ville non renseignée'
              })(),
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
            dateOfBirth: sampleParticipant?.date_naissance || undefined,
            profession: sampleParticipant?.profession || 'Profession',
            company: sampleParticipant?.profession || 'Nom Entreprise',
            
            // === DONNÉES DE TICKET (générées) ===
            ticketId: `TICKET-${eventId.slice(-8)}-${Date.now().toString().slice(-6)}`,
            registrationDate: sampleParticipant?.created_at ? new Date(sampleParticipant.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
            registrationSource: 'Online',
            ticketType: 'STANDARD',
            ticketCategory: 'PARTICIPANT',
            accessLevel: 'ACCÈS COMPLET',
            
            // Informations siège
            seating: {
              section: 'SECTION A',
              row: 'RANG 1',
              seat: 'SIÈGE 42',
              entrance: 'ENTRÉE PRINCIPALE'
            },
            
            // Avantages et restrictions
            benefits: ['Accès conférence', 'Networking', 'Déjeuner inclus'],
            restrictions: ['Interdiction de photographier'],
            addOns: [],
            
            // Prix et monnaie
            currency: 'EUR',
            price: event.prix || 0,
            fees: 0,
            tax: 0,
            total: event.prix || 0,
            
            // QR Code et sécurité
            qrCode: `https://event-app.com/checkin/${eventId}/${sampleParticipant?.id || 'demo'}`,
            qrUrl: `https://event-app.com/checkin/${eventId}/${sampleParticipant?.id || 'demo'}`,
            barcode: String(Date.now()).slice(-12),
            barcodeFormat: 'CODE128',
            ticketNumber: `TICKET-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            serialNumber: `TKT2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            
            // Fonctionnalités de sécurité
            securityFeatures: {
              watermark: true,
              hologram: false,
              uvFeatures: false,
              microtext: true
            },
            
            // Validation
            validation: {
              validFrom: event.date_debut || new Date().toISOString(),
              validUntil: event.date_fin || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              maxEntries: 1,
              usedEntries: 0
            },
            
            // Conditions légales
            termsAndConditions: 'Conditions générales d\'utilisation',
            privacyPolicy: 'Politique de confidentialité',
            liabilityWaiver: 'Décharge de responsabilité',
            cancelationPolicy: 'Politique d\'annulation',
            ageRestriction: 'Aucune restriction d\'âge',
            photoConsent: 'Autorisation de prise de photos',
            dataProtection: 'Protection des données RGPD',
            
            // Format et mise en page
            format: {
              size: 'A4' as const,
              orientation: 'portrait' as const,
              width: 210,
              height: 297,
              units: 'mm' as const
            },
            
            // Layout
            layout: {
              columns: 1,
              rows: 1,
              spacing: 10,
              margins: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
              },
              perforation: true,
              folding: false
            },
            
            // Images et médias
            backgroundImage: undefined,
            artistImage: undefined,
            sponsorLogos: [],
            customFields: {}
          }))
          
          console.log('🎫 ===== DONNÉES RÉELLES INTÉGRÉES DANS TICKETS =====')
          console.log('📅 Événement :', event.nom)
          console.log('� Organisateur :', event.organisateur)
          console.log('📍 Lieu :', event.lieu)
          console.log('🗓️ Date :', event.date_debut ? new Date(event.date_debut).toLocaleDateString('fr-FR') : 'Non définie')
          console.log('📧 Contact :', event.email_contact)
          console.log('📞 Tél :', event.telephone_contact)
          console.log('💰 Prix :', event.prix + '€')
          console.log('👥 Capacité :', event.places_disponibles + ' places')
          console.log('🔄 Variables automatiques : Tous les templates de tickets utilisent maintenant ces données réelles au lieu de données fictives.')
        }
      } catch (error) {
        console.error('Error fetching event data:', error)
      } finally {
        setIsLoadingEvent(false)
      }
    }

    fetchEventData()
  }, [eventId, eventName])

  const handleTemplateSelect = (template: TicketTemplate) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
  }

  const handleTemplateEdit = (template: TicketTemplate) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
  }

  const handleTemplateChange = (template: TicketTemplate) => {
    setSelectedTemplate(template)
  }

  const handleDataChange = (data: TicketData) => {
    setTemplateData(data)
  }

  const handleSave = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch('/api/ticket-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTemplate.id,
          name: selectedTemplate.name,
          schema: {
            layout: {
              width: selectedTemplate.width,
              height: selectedTemplate.height,
              margins: { top: 10, right: 10, bottom: 10, left: 10 }
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
              size: 200,
              margin: 2,
              foreground: '#000000',
              background: '#ffffff'
            },
            barcode: {
              format: 'CODE128',
              width: 2,
              height: 100,
              show_text: true
            },
            security: {
              watermark: false,
              watermark_opacity: 0.1,
              serialize: true
            }
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Template sauvegardé avec succès!')
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving template:', error)
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
              {currentView === 'selector' ? 'Personnalisation des Tickets' : `Édition: ${selectedTemplate?.name || 'Template'}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentView === 'selector'
                ? 'Choisissez et personnalisez des templates de tickets pour vos événements'
                : 'Personnalisez les détails de votre template de ticket'
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

      {/* Affichage des données réelles intégrées */}
      {eventData && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-3">
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
                  <div>🏢 <strong>Organisateur :</strong> {eventData.organisateur || 'Non renseigné'}</div>
                  <div>📍 <strong>Lieu :</strong> {eventData.lieu || 'Non renseigné'}</div>
                  <div>🗓️ <strong>Date :</strong> {eventData.date_debut ? new Date(eventData.date_debut).toLocaleDateString('fr-FR') : 'Non renseignée'}</div>
                  <div>📧 <strong>Contact :</strong> {eventData.email_contact || 'Non renseigné'}</div>
                  <div>📞 <strong>Tél :</strong> {eventData.telephone_contact || 'Non renseigné'}</div>
                  {eventData.prix !== undefined && (
                    <div>💰 <strong>Prix :</strong> {eventData.prix}€</div>
                  )}
                  {eventData.places_disponibles && (
                    <div>👥 <strong>Capacité :</strong> {eventData.places_disponibles} places</div>
                  )}
                </div>
                <div className="mt-2 p-2 bg-green-100 rounded border text-xs">
                  <strong>🔄 Variables automatiques :</strong> Tous les templates de tickets utilisent maintenant ces données réelles au lieu de données fictives.
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
        <TemplateSelector
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
            <TicketEditor
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
            <TicketPDFGenerator
              template={selectedTemplate}
              data={templateData}
            />

            {/* Données du ticket */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiSettings className="w-5 h-5" />
                Données du ticket
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
                    value={templateData.organizerName}
                    onChange={(e) => handleDataChange({ ...templateData, organizerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du lieu</label>
                  <input
                    type="text"
                    value={templateData.venue.name}
                    onChange={(e) => handleDataChange({ ...templateData, venue: {...templateData.venue, name: e.target.value} })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse du lieu</label>
                  <input
                    type="text"
                    value={templateData.venue.address}
                    onChange={(e) => handleDataChange({ ...templateData, venue: {...templateData.venue, address: e.target.value} })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du participant</label>
                  <input
                    type="text"
                    value={templateData.fullName || ''}
                    onChange={(e) => handleDataChange({ ...templateData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Informations siège</label>
                  <input
                    type="text"
                    value={templateData.seating?.section || ''}
                    onChange={(e) => handleDataChange({ 
                      ...templateData, 
                      seating: { 
                        ...templateData.seating, 
                        section: e.target.value 
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                  <input
                    type="number"
                    value={templateData.price || 0}
                    onChange={(e) => handleDataChange({ ...templateData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de ticket</label>
                  <input
                    type="text"
                    value={templateData.ticketNumber}
                    onChange={(e) => handleDataChange({ ...templateData, ticketNumber: e.target.value })}
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
                    // Générer un numéro de ticket unique
                    newData.ticketNumber = `N° ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
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
                    newData.seating = { ...newData.seating, section: 'BLOC A - RANG 1 - SIÈGE 42' }
                    handleDataChange(newData)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                  Utiliser données d'exemple
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}