'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, Check } from 'lucide-react';
import { Order } from '@/types/billing';

// Initialiser Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  order: Order;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const PaymentFormContent: React.FC<{
  order: Order;
  onSuccess?: (paymentResult: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  clientSecret: string;
}> = ({ order, onSuccess, onError, onCancel, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) return;

    // Écouter les changements du PaymentElement
    const paymentElement = elements.getElement('payment');
    if (paymentElement) {
      paymentElement.on('change', (event) => {
        setIsComplete(event.complete);
        if (event.error) {
          setMessage(event.error.message || '');
        } else {
          setMessage('');
        }
      });
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError?.('Stripe n\'est pas encore chargé');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              name: `${order.acheteur_prenom} ${order.acheteur_nom}`,
              email: order.acheteur_email,
              phone: order.acheteur_telephone || undefined
            }
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'Une erreur est survenue');
        } else {
          setMessage('Une erreur est survenue lors du paiement');
        }
        onError?.(error.message || 'Erreur lors du paiement');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setMessage('Paiement réussi !');
          setIsComplete(true);
          onSuccess?.({
            paymentIntent,
            order
          });
        } else if (paymentIntent.status === 'processing') {
          setMessage('Paiement en cours de traitement...');
        } else if (paymentIntent.status === 'requires_payment_method') {
          setMessage('Paiement nécessite une méthode de paiement supplémentaire');
        } else {
          setMessage(`Statut du paiement: ${paymentIntent.status}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setMessage('Une erreur technique est survenue');
      onError?.('Erreur technique lors du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Paiement sécurisé</h2>
            <p className="text-sm text-gray-600">Commande {order.order_number}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Récapitulatif de la commande */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Récapitulatif</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total :</span>
              <span>{formatAmount(order.montant_sous_total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TVA :</span>
              <span>{formatAmount(order.montant_tva)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frais de service :</span>
              <span>{formatAmount(order.montant_frais)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total :</span>
              <span className="text-blue-600">{formatAmount(order.montant_total)}</span>
            </div>
          </div>
        </div>

        {/* Informations de paiement */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Informations de paiement</h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Titulaire :</span>
              <span className="font-medium">
                {order.acheteur_prenom} {order.acheteur_nom}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email :</span>
              <span className="font-medium">{order.acheteur_email}</span>
            </div>
            {order.acheteur_telephone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone :</span>
                <span className="font-medium">{order.acheteur_telephone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de paiement Stripe */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Coordonnées bancaires</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <PaymentElement
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    name: 'never',
                    email: 'never',
                    phone: 'never'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            isComplete
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {isComplete ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Badge de sécurité */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Paiement 100% sécurisé par Stripe</span>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !stripe || !elements || !isComplete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Payer {formatAmount(order.montant_total)}
              </>
            )}
          </button>
        </div>

        {/* Mentions légales */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            En validant ce paiement, vous acceptez les conditions générales de vente.
          </p>
          <p className="mt-1">
            Le paiement sera traité par Stripe (RCS Luxembourg B 180 437).
          </p>
        </div>
      </form>
    </div>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  order,
  onSuccess,
  onError,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Créer le Payment Intent
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/payments/stripe/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            return_url: `${window.location.origin}/payment/return`
          })
        });

        const result = await response.json();

        if (result.success) {
          setClientSecret(result.data.client_secret);
        } else {
          setError(result.error || 'Erreur lors de la préparation du paiement');
          onError?.(result.error || 'Erreur lors de la préparation du paiement');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur technique lors de la préparation du paiement');
        onError?.('Erreur technique lors de la préparation du paiement');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [order.id, onError]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de paiement</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Session expirée</h3>
          <p className="text-gray-600 mb-6">La session de paiement a expiré. Veuillez recommencer.</p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Recommencer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: 'system-ui, sans-serif',
            fontSizeBase: '16px'
          }
        }
      }}
    >
      <PaymentFormContent
        order={order}
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentForm;