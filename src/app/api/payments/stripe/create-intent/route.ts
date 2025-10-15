import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const body = await request.json();

    const { order_id, return_url } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de la commande est requis' },
        { status: 400 }
      );
    }

    // Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('inscription_orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la commande est en attente de paiement
    if (order.statut !== 'pending_payment') {
      return NextResponse.json(
        { success: false, error: 'La commande n\'est pas en attente de paiement' },
        { status: 400 }
      );
    }

    // Vérifier que la commande n'est pas expirée
    if (order.expired_at && new Date(order.expired_at) < new Date()) {
      // Marquer la commande comme expirée
      await supabase
        .from('inscription_orders')
        .update({ statut: 'expired' })
        .eq('id', order_id);

      return NextResponse.json(
        { success: false, error: 'La commande a expiré' },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un payment intent pour cette commande
    if (order.payment_intent_id) {
      // Récupérer le payment intent existant
      try {
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);

        if (existingPaymentIntent.status === 'succeeded') {
          // Le paiement a déjà été réussi, mettre à jour la commande
          await supabase
            .from('inscription_orders')
            .update({
              statut: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', order_id);

          return NextResponse.json(
            { success: false, error: 'Cette commande a déjà été payée' },
            { status: 400 }
          );
        }

        // Retourner le payment intent existant s'il n'est pas expiré
        if (existingPaymentIntent.status !== 'canceled') {
          return NextResponse.json({
            success: true,
            data: {
              client_secret: existingPaymentIntent.client_secret,
              payment_intent_id: existingPaymentIntent.id
            }
          });
        }
      } catch (stripeError) {
        console.error('Erreur lors de la récupération du payment intent existant:', stripeError);
      }
    }

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.montant_total * 100), // Convertir en centimes
      currency: 'eur',
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        evenement_id: order.evenement_id,
        acheteur_email: order.acheteur_email
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Configurer les méthodes de paiement acceptées
      payment_method_types: ['card', 'sepa_debit'],
      // Ajouter des informations pour le relevé bancaire
      statement_descriptor: `EVT-${order.order_number.slice(-8)}`,
      // Configurer la confirmation et le retour
      confirmation_method: 'manual',
      confirm: false,
      // Ajouter une URL de retour
      return_url: return_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirmation`,
      // Configurer l'expiration
      expires_at: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    });

    // Mettre à jour la commande avec le payment intent ID
    await supabase
      .from('inscription_orders')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_method: 'card'
      })
      .eq('id', order_id);

    return NextResponse.json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        order_id: order.id,
        order_number: order.order_number,
        amount: order.montant_total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du Payment Intent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur Stripe: ' + error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la création du paiement' },
      { status: 500 }
    );
  }
}