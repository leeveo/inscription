'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements, PaymentElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CreditCard, AlertCircle, CheckCircle, Lock } from 'lucide-react';

// Configuration Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentElementProps {
  clientSecret: string;
  montant: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const PaymentElementForm: React.FC<{
  clientSecret: string;
  montant: number;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}> = ({ clientSecret, montant, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) return;

    const handleChange = (event: any) => {
      setIsComplete(event.complete);
      if (event.error) {
        setMessage(event.error.message);
      } else {
        setMessage('');
      }
    };

    // Écouter les changements sur l'élément de paiement
    const paymentElement = elements.getElement('payment');
    if (paymentElement) {
      paymentElement.on('change', handleChange);
    }

    return () => {
      if (paymentElement) {
        paymentElement.off('change', handleChange);
      }
    };
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError?.('Stripe n\'est pas encore chargé');
      return;
    }

    if (!isComplete) {
      onError?.('Veuillez compléter les informations de paiement');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required', // Ne rediriger que si nécessaire (ex: 3D Secure)
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'Une erreur est survenue');
          onError?.(error.message || 'Erreur de paiement');
        } else {
          setMessage('Une erreur inattendue est survenue');
          onError?.('Erreur de paiement inattendue');
        }
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setMessage('Paiement réussi !');
          onSuccess?.(paymentIntent.id);
        } else if (paymentIntent.status === 'requires_action') {
          setMessage('Authentification supplémentaire requise');
          // Stripe gérera automatiquement la redirection
        } else {
          setMessage(`Statut du paiement: ${paymentIntent.status}`);
          onError?.(`Paiement en attente: ${paymentIntent.status}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setMessage('Une erreur est survenue lors du traitement du paiement');
      onError?.('Erreur de traitement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Élément de paiement Stripe */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            }}
          />
        </div>

        {/* Message d'erreur ou de succès */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            message.includes('réussi') || message.includes('succès')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.includes('réussi') || message.includes('succès') ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}
      </div>

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading || !isComplete}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Traitement en cours...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Payer {formatPrice(montant)}</span>
          </>
        )}
      </button>

      {/* Informations de sécurité */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-500">
          Paiement sécurisé via Stripe • Vos informations bancaires ne sont jamais stockées
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>SSL 256-bit</span>
          <span>•</span>
          <span>Conformité PCI DSS</span>
          <span>•</span>
          <span>3D Secure</span>
        </div>
      </div>
    </form>
  );
};

// Hook pour utiliser Stripe
const useStripe = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').then(setStripe);
  }, []);

  return stripe;
};

// Hook pour utiliser Elements
const useElements = (): StripeElements | null => {
  // Dans une vraie implémentation, cela viendrait du contexte Elements
  return null;
};

const StripePaymentElement: React.FC<StripePaymentElementProps> = ({
  clientSecret,
  montant,
  onSuccess,
  onError,
  className = ''
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').then(setStripe);
  }, []);

  if (!clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">
            Secret client Stripe manquant
          </span>
        </div>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        fontSizeBase: '16px',
      },
      rules: {
        '.Block': {
          padding: '12px',
        },
        '.Input': {
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '16px',
        },
        '.Input:focus': {
          borderColor: '#2563eb',
          boxShadow: '0 0 0 1px #2563eb',
        },
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '8px',
        },
        '.Tab': {
          padding: '12px 16px',
          fontWeight: '500',
        },
        '.Tab--selected': {
          borderColor: '#2563eb',
          color: '#2563eb',
        },
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header du paiement */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Finaliser votre paiement
        </h3>
        <p className="text-gray-600">
          Montant à payer : <span className="font-semibold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(montant)}
          </span>
        </p>
      </div>

      {/* Formulaire de paiement Stripe */}
      <Elements stripe={stripePromise} options={options}>
        <PaymentElementForm
          clientSecret={clientSecret}
          montant={montant}
          onSuccess={(paymentIntentId) => {
            setError(null);
            onSuccess?.(paymentIntentId);
          }}
          onError={(errorMessage) => {
            setError(errorMessage);
            onError?.(errorMessage);
          }}
        />
      </Elements>

      {/* Affichage des erreurs globales */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">
              Erreur de paiement
            </span>
          </div>
          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Méthodes de paiement acceptées */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CreditCard className="w-4 h-4" />
          <span>Cartes acceptées :</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Icônes des cartes */}
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
            VISA
          </div>
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
            MC
          </div>
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">
            🍎
          </div>
          <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">
            G
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentElement;