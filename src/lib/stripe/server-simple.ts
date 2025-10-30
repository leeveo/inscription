import Stripe from 'stripe';

// Fonction pour initialiser Stripe de manière lazy
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    // Retourner un mock pour éviter les erreurs de build
    return null as any;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
    typescript: true,
  });
}

// Types pour les métadonnées Stripe
export interface StripePaymentMetadata {
  order_id: string;
  evenement_id: string;
  acheteur_email: string;
  source_achat: string;
  promo_code?: string;
  items_count: number;
  items_summary: string;
}

// Export lazy stripe utils
export const stripeUtils = {
  async verifyWebhookSignature(payload: string, signature: string, secret: string) {
    const stripe = getStripe();
    if (!stripe) throw new Error('Stripe not configured');
    return stripe.webhooks.constructEvent(payload, signature, secret);
  },
  
  async createPaymentIntent(amount: number, currency: string = 'eur', metadata: any) {
    const stripe = getStripe();
    if (!stripe) throw new Error('Stripe not configured');
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  },
  
  async retrievePaymentIntent(paymentIntentId: string) {
    const stripe = getStripe();
    if (!stripe) throw new Error('Stripe not configured');
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }
};

export default stripeUtils;