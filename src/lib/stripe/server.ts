import Stripe from 'stripe';

// Configuration Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

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

export interface StripeProductMetadata {
  ticket_type_id: number;
  evenement_id: string;
  ticket_name: string;
  ticket_type: string;
  prix: number;
  quantite: number;
}

/**
 * Crée un Payment Intent Stripe pour une commande
 */
export async function createPaymentIntent(
  montantTotal: number,
  orderId: string,
  acheteurEmail: string,
  metadata: StripePaymentMetadata
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montantTotal * 100), // Stripe travaille en centimes
      currency: 'eur',
      metadata,
      receipt_email: acheteurEmail,
      automatic_payment_methods: {
        enabled: true,
      },
      // Configuration pour les méthodes de paiement acceptées
      payment_method_types: ['card'],
      // Options de configuration
      setup_future_usage: 'on_session', // Pour permettre les paiements récurrents si nécessaire
      // Confirmation automatique (à désactiver si on utilise Stripe Elements)
      confirm: false,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de la création du Payment Intent:', error);
    throw error;
  }
}

/**
 * Crée un produit Stripe pour un type de billet
 */
export async function createTicketProduct(
  ticketTypeId: number,
  ticketName: string,
  ticketDescription: string,
  prix: number,
  metadata: StripeProductMetadata
) {
  try {
    const product = await stripe.products.create({
      name: ticketName,
      description: ticketDescription,
      metadata,
      type: 'service',
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(prix * 100),
      currency: 'eur',
      metadata: {
        ticket_type_id: ticketTypeId.toString(),
        evenement_id: metadata.evenement_id,
      },
    });

    return { product, price };
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    throw error;
  }
}

/**
 * Récupère un Payment Intent par son ID
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de la récupération du Payment Intent:', error);
    throw error;
  }
}

/**
 * Met à jour un Payment Intent
 */
export async function updatePaymentIntent(
  paymentIntentId: string,
  updateData: Partial<Stripe.PaymentIntentUpdateParams>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateData);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Payment Intent:', error);
    throw error;
  }
}

/**
 * Annule un Payment Intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de l\'annulation du Payment Intent:', error);
    throw error;
  }
}

/**
 * Crée un refund pour un paiement
 */
export async function createRefund(
  paymentIntentId: string,
  montant?: number,
  reason?: Stripe.RefundCreateParams.Reason,
  metadata?: Record<string, string>
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: montant ? Math.round(montant * 100) : undefined,
      reason,
      metadata,
    });

    return refund;
  } catch (error) {
    console.error('Erreur lors de la création du refund:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'un refund
 */
export async function retrieveRefund(refundId: string) {
  try {
    const refund = await stripe.refunds.retrieve(refundId);
    return refund;
  } catch (error) {
    console.error('Erreur lors de la récupération du refund:', error);
    throw error;
  }
}

/**
 * Vérifie la signature d'un webhook Stripe
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error('Erreur de vérification de signature webhook:', error);
    throw error;
  }
}

/**
 * Crée un Checkout Session pour un paiement rapide
 */
export async function createCheckoutSession(
  orderId: string,
  items: Array<{
    name: string;
    description?: string;
    amount: number;
    quantity: number;
    metadata?: Record<string, string>;
  }>,
  acheteurEmail: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>
) {
  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
          metadata: item.metadata || {},
        },
        unit_amount: Math.round(item.amount * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: acheteurEmail,
      metadata: {
        order_id: orderId,
        ...metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Options de personnalisation
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      // Expérience de paiement optimisée
      allow_promotion_codes: false, // Géré par notre système de codes promo
      // Localisation
      locale: 'fr',
    });

    return session;
  } catch (error) {
    console.error('Erreur lors de la création de la Checkout Session:', error);
    throw error;
  }
}

/**
 * Récupère une Checkout Session
 */
export async function retrieveCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la Checkout Session:', error);
    throw error;
  }
}

/**
 * Export des fonctions utilitaires
 */
export const stripeUtils = {
  createPaymentIntent,
  createTicketProduct,
  retrievePaymentIntent,
  updatePaymentIntent,
  cancelPaymentIntent,
  createRefund,
  retrieveRefund,
  verifyWebhookSignature,
  createCheckoutSession,
  retrieveCheckoutSession,
};

export default stripe;