'use client'

import React, { useState, useEffect } from 'react'
import { Element, useNode } from '@craftjs/core'
import { CreditCard, Ticket, Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import CheckoutForm from '@/components/billing/CheckoutForm'
import dynamic from 'next/dynamic'

// Import dynamique pour éviter l'import côté serveur
const StripePaymentForm = dynamic(
  () => import('@/components/billing/StripePaymentForm').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
)

interface PaymentWidgetProps {
  eventId?: string
  title?: string
  description?: string
  showEventDetails?: boolean
  showTicketTypes?: boolean
  showCheckout?: boolean
  successMessage?: string
  errorMessage?: string
  className?: string
  width?: string
  horizontalAlign?: string
  backgroundColor?: string
  textColor?: string
  accentColor?: string
}

export const PaymentWidget = React.forwardRef<HTMLDivElement, PaymentWidgetProps>(({
  eventId = '',
  title = "Acheter vos billets",
  description = "Sélectionnez les billets de votre choix et procédez au paiement en toute sécurité",
  showEventDetails = true,
  showTicketTypes = true,
  showCheckout = true,
  successMessage = "Paiement réussi !",
  errorMessage = "Une erreur est survenue lors du paiement.",
  className = "my-4",
  width = '100%',
  horizontalAlign = 'left',
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
  accentColor = '#3b82f6'
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

  // États
  const [currentStep, setCurrentStep] = useState<'selection' | 'payment' | 'confirmation'>('selection')
  const [event, setEvent] = useState<any>(null)
  const [ticketTypes, setTicketTypes] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Charger les données de l'événement et des billets
  useEffect(() => {
    if (eventId) {
      loadData()
    } else {
      // Si pas d'eventId, arrêter le chargement
      setIsLoading(false)
    }
  }, [eventId])

  const loadData = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Charger l'événement
      const eventResponse = await fetch(`/api/events/${eventId}`)
      const eventData = await eventResponse.json()

      if (eventData.success) {
        setEvent(eventData.data)
      } else {
        setError('Événement non trouvé')
        return
      }

      // Charger les types de billets
      const ticketsResponse = await fetch(`/api/ticket-types?evenement_id=${eventId}&visible_only=true`)
      const ticketsData = await ticketsResponse.json()

      if (ticketsData.success) {
        setTicketTypes(ticketsData.data)
      } else {
        setError('Aucun billet disponible pour cet événement')
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckoutSuccess = (order: any) => {
    setSelectedOrder(order)
    setCurrentStep('payment')
  }

  const handlePaymentSuccess = (paymentResult: any) => {
    setCurrentStep('confirmation')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const resetPayment = () => {
    setCurrentStep('selection')
    setSelectedOrder(null)
    setError('')
  }

  // Fonction pour obtenir les couleurs dynamiques
  const getStyle = () => ({
    backgroundColor,
    color: textColor,
    width,
    ...alignStyle,
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div
        ref={ref}
        className={className}
        style={getStyle()}
      >
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div
        ref={ref}
        className={className}
        style={getStyle()}
      >
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Affichage par défaut si aucun eventId n'est fourni (mode édition)
  if (!eventId) {
    return (
      <div
        ref={ref}
        className={className}
        style={getStyle()}
      >
        <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden border-2 border-dashed border-blue-300">
          {/* Header */}
          <div
            className="p-6 border-b"
            style={{ backgroundColor, borderColor: `${accentColor}20` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <CreditCard className="w-6 h-6" style={{ color: accentColor }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: textColor }}>
                  {title}
                </h1>
                <p className="text-gray-600 mt-1">
                  Configurez l'ID de l'événement dans les paramètres pour activer ce widget
                </p>
              </div>
            </div>
          </div>

          {/* Contenu de prévisualisation */}
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Widget de Paiement
              </h3>
              <p className="text-blue-700 mb-4">
                Ce widget affichera le formulaire de sélection de billets et le processus de paiement pour votre événement.
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <p>✅ Configurez l'ID de l'événement dans les paramètres</p>
                <p>✅ Assurez-vous que la billetterie est activée</p>
                <p>✅ Configurez les types de billets disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={className}
      style={getStyle()}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{ backgroundColor, borderColor: `${accentColor}20` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <CreditCard className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: textColor }}>
                {title}
              </h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-6 gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'selection' ? 'opacity-100' : 'opacity-50'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'selection' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: currentStep === 'selection' ? accentColor : '#e5e7eb',
                  color: currentStep === 'selection' ? 'white' : '#6b7280',
                  ringColor: currentStep === 'selection' ? accentColor : undefined
                }}
              >
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Sélection</span>
            </div>

            <div className={`w-12 h-1 rounded ${
              currentStep === 'payment' || currentStep === 'confirmation' ? 'opacity-100' : 'opacity-30'
            }`} style={{ backgroundColor: accentColor }} />

            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'opacity-100' : 'opacity-50'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'payment' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: currentStep === 'payment' ? accentColor : '#e5e7eb',
                  color: currentStep === 'payment' ? 'white' : '#6b7280',
                  ringColor: currentStep === 'payment' ? accentColor : undefined
                }}
              >
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Paiement</span>
            </div>

            <div className={`w-12 h-1 rounded ${
              currentStep === 'confirmation' ? 'opacity-100' : 'opacity-30'
            }`} style={{ backgroundColor: accentColor }} />

            <div className={`flex items-center gap-2 ${currentStep === 'confirmation' ? 'opacity-100' : 'opacity-50'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'confirmation' ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: currentStep === 'confirmation' ? accentColor : '#e5e7eb',
                  color: currentStep === 'confirmation' ? 'white' : '#6b7280',
                  ringColor: currentStep === 'confirmation' ? accentColor : undefined
                }}
              >
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Détails de l'événement */}
        {showEventDetails && event && (
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
              {event.nom}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{formatDate(event.date_debut)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{event.lieu}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{event.places_disponibles || 'Illimité'} places</span>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {currentStep === 'selection' && showTicketTypes && (
            <CheckoutForm
              evenementId={eventId}
              ticketTypes={ticketTypes}
              onSuccess={handleCheckoutSuccess}
              onError={handleError}
            />
          )}

          {currentStep === 'payment' && selectedOrder && (
            <div>
              <StripePaymentForm
                order={selectedOrder}
                onSuccess={handlePaymentSuccess}
                onError={handleError}
                onCancel={resetPayment}
              />
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: accentColor }} />
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {successMessage}
              </h2>
              <p className="text-gray-600 mb-6">
                Votre paiement a été traité avec succès. Vous allez recevoir vos billets par email.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Récapitulatif de la commande</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Numéro de commande:</span>
                    <span className="font-medium">{selectedOrder?.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant total:</span>
                    <span className="font-medium">
                      {selectedOrder ? formatPrice(selectedOrder.montant_total) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{selectedOrder?.acheteur_email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={resetPayment}
                className="mt-6 px-6 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: accentColor,
                  color: 'white'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Nouvel achat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

PaymentWidget.displayName = 'PaymentWidget'

// Configuration Craft.js
export const PaymentWidgetSettings = () => {
  const {
    actions: { setProp },
    eventId,
    title,
    description,
    width,
    horizontalAlign,
    backgroundColor,
    textColor,
    accentColor,
    showEventDetails,
    showTicketTypes,
    showCheckout
  } = useNode((node) => ({
    eventId: node.data.props.eventId,
    title: node.data.props.title,
    description: node.data.props.description,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
    backgroundColor: node.data.props.backgroundColor,
    textColor: node.data.props.textColor,
    accentColor: node.data.props.accentColor,
    showEventDetails: node.data.props.showEventDetails,
    showTicketTypes: node.data.props.showTicketTypes,
    showCheckout: node.data.props.showCheckout,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID de l'événement *
        </label>
        <input
          type="text"
          value={eventId || ''}
          onChange={(e) => setProp((props: PaymentWidgetProps) => (props.eventId = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="UUID de l'événement"
        />
        <p className="text-xs text-gray-500 mt-1">
          L'identifiant unique de l'événement pour lequel vendre des billets
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={title || ''}
          onChange={(e) => setProp((props: PaymentWidgetProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description || ''}
          onChange={(e) => setProp((props: PaymentWidgetProps) => (props.description = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Couleur de fond
          </label>
          <input
            type="color"
            value={backgroundColor || '#ffffff'}
            onChange={(e) => setProp((props: PaymentWidgetProps) => (props.backgroundColor = e.target.value))}
            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Couleur du texte
          </label>
          <input
            type="color"
            value={textColor || '#1f2937'}
            onChange={(e) => setProp((props: PaymentWidgetProps) => (props.textColor = e.target.value))}
            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Couleur d'accent
          </label>
          <input
            type="color"
            value={accentColor || '#3b82f6'}
            onChange={(e) => setProp((props: PaymentWidgetProps) => (props.accentColor = e.target.value))}
            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largeur
        </label>
        <select
          value={width || '100%'}
          onChange={(e) => setProp((props: PaymentWidgetProps) => (props.width = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="100%">100% (pleine largeur)</option>
          <option value="75%">75%</option>
          <option value="66.66%">66.66% (2/3)</option>
          <option value="50%">50% (moitié)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignement horizontal
        </label>
        <select
          value={horizontalAlign || 'left'}
          onChange={(e) => setProp((props: PaymentWidgetProps) => (props.horizontalAlign = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="left">Gauche</option>
          <option value="center">Centre</option>
          <option value="right">Droite</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showEventDetails || false}
            onChange={(e) => setProp((props: PaymentWidgetProps) => (props.showEventDetails = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher les détails de l'événement
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showTicketTypes || false}
            onChange={(e) => setProp((props: PaymentWidgetProps) => (props.showTicketTypes = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher la sélection des billets
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showCheckout || false}
            onChange={(e) => setProp((props: PaymentWidgetProps) => (props.showCheckout = e.target.checked))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher le processus de paiement
          </span>
        </label>
      </div>
    </div>
  );
};

PaymentWidget.craft = {
  displayName: 'PaymentWidget',
  props: {
    eventId: '',
    title: "Acheter vos billets",
    description: "Sélectionnez les billets de votre choix et procédez au paiement en toute sécurité",
    showEventDetails: true,
    showTicketTypes: true,
    showCheckout: true,
    successMessage: "Paiement réussi !",
    errorMessage: "Une erreur est survenue lors du paiement.",
    className: "my-4",
    width: '100%',
    horizontalAlign: 'left',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#3b82f6'
  },
  related: {
    settings: PaymentWidgetSettings,
  },
};