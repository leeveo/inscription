import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('Erreur: Signature Stripe manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erreur de signature webhook:', err);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    const supabase = supabaseApi();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent, supabase);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent, supabase);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent, supabase);
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeSucceeded(charge, supabase);
        break;
      }

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeFailed(charge, supabase);
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur dans le webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  try {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
      console.error('Order ID manquant dans le metadata du payment intent');
      return;
    }

    // Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('inscription_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Commande non trouvée:', orderId);
      return;
    }

    // Mettre à jour le statut de la commande
    const { error: updateError } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'paid',
        paid_at: new Date().toISOString(),
        stripe_charge_id: paymentIntent.charges.data[0]?.id
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la commande:', updateError);
      return;
    }

    // Créer l'enregistrement de paiement
    const charge = paymentIntent.charges.data[0];
    if (charge) {
      const { error: paymentError } = await supabase
        .from('inscription_payments')
        .insert({
          order_id: orderId,
          stripe_payment_intent_id: paymentIntent.id,
          stripe_charge_id: charge.id,
          stripe_balance_transaction_id: charge.balance_transaction as string,
          montant: paymentIntent.amount / 100,
          devise: paymentIntent.currency.toUpperCase(),
          payment_method: charge.payment_method_details?.type || 'card',
          statut: 'succeeded',
          card_last4: charge.payment_method_details?.card?.last4,
          card_brand: charge.payment_method_details?.card?.brand,
          card_exp_month: charge.payment_method_details?.card?.exp_month,
          card_exp_year: charge.payment_method_details?.card?.exp_year,
          frais_stripe: (charge.balance_transaction as any)?.fee_details?.reduce((sum: number, fee: any) => sum + fee.amount, 0) / 100 || 0,
          processed_at: new Date().toISOString(),
          metadata: {
            stripe_event_id: paymentIntent.id,
            receipt_url: charge.receipt_url
          }
        });

      if (paymentError) {
        console.error('Erreur lors de la création du paiement:', paymentError);
      }
    }

    // Créer les participants pour chaque item de commande
    const { data: orderItems, error: itemsError } = await supabase
      .from('inscription_order_items')
      .select('*')
      .eq('order_id', orderId);

    if (!itemsError && orderItems) {
      for (const item of orderItems) {
        for (let i = 0; i < item.quantite; i++) {
          // Créer un participant pour chaque billet
          const { error: participantError } = await supabase
            .from('inscription_participants')
            .insert({
              evenement_id: order.evenement_id,
              nom: order.acheteur_nom,
              prenom: order.acheteur_prenom,
              email: order.acheteur_email,
              telephone: order.acheteur_telephone || '',
              order_id: orderId,
              ticket_type_id: item.ticket_type_id,
              order_item_id: item.id,
              source_inscription: 'payante',
              prix_paye: item.prix_unitaire,
              devise_paiement: paymentIntent.currency.toUpperCase(),
              statut_paiement: 'paye',
              date_paiement: new Date().toISOString(),
              checked_in: false,
              ticket_sent: false,
              metadata_billetterie: {
                payment_intent_id: paymentIntent.id,
                quantite: i + 1,
                total_quantite: item.quantite
              }
            });

          if (participantError) {
            console.error('Erreur lors de la création du participant:', participantError);
          }
        }
      }
    }

    // Envoyer les emails de confirmation
    await sendConfirmationEmails(order, supabase);

    console.log(`Paiement réussi pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement du paiement réussi:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  try {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
      console.error('Order ID manquant dans le metadata du payment intent');
      return;
    }

    // Mettre à jour le statut de la commande
    const { error } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'pending_payment' // Garder en attente pour permettre une nouvelle tentative
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
    }

    // Créer ou mettre à jour l'enregistrement de paiement
    const charge = paymentIntent.charges.data[0];
    if (charge) {
      const { error: paymentError } = await supabase
        .from('inscription_payments')
        .upsert({
          order_id: orderId,
          stripe_payment_intent_id: paymentIntent.id,
          stripe_charge_id: charge.id,
          montant: paymentIntent.amount / 100,
          devise: paymentIntent.currency.toUpperCase(),
          payment_method: charge.payment_method_details?.type || 'card',
          statut: 'failed',
          metadata: {
            stripe_event_id: paymentIntent.id,
            failure_reason: charge.failure_message,
            decline_code: charge.outcome?.reason
          }
        });

      if (paymentError) {
        console.error('Erreur lors de la création du paiement:', paymentError);
      }
    }

    console.log(`Paiement échoué pour la commande ${orderId}: ${paymentIntent.last_payment_error?.message}`);

  } catch (error) {
    console.error('Erreur lors du traitement du paiement échoué:', error);
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  try {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
      console.error('Order ID manquant dans le metadata du payment intent');
      return;
    }

    // Mettre à jour le statut de la commande
    const { error } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'cancelled'
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
    }

    console.log(`Paiement annulé pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement du paiement annulé:', error);
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge, supabase: any) {
  try {
    // Mettre à jour les informations de la transaction si nécessaire
    const paymentIntentId = charge.payment_intent as string;

    if (paymentIntentId) {
      const { error } = await supabase
        .from('inscription_payments')
        .update({
          stripe_balance_transaction_id: charge.balance_transaction as string,
          frais_stripe: (charge.balance_transaction as any)?.fee / 100 || 0,
          processed_at: new Date().toISOString(),
          metadata: {
            receipt_url: charge.receipt_url,
            charge_id: charge.id
          }
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (error) {
        console.error('Erreur lors de la mise à jour du paiement:', error);
      }
    }

    console.log(`Charge réussie: ${charge.id}`);

  } catch (error) {
    console.error('Erreur lors du traitement de la charge réussie:', error);
  }
}

async function handleChargeFailed(charge: Stripe.Charge, supabase: any) {
  try {
    const paymentIntentId = charge.payment_intent as string;

    if (paymentIntentId) {
      const { error } = await supabase
        .from('inscription_payments')
        .update({
          statut: 'failed',
          metadata: {
            failure_reason: charge.failure_message,
            decline_code: charge.outcome?.reason,
            charge_id: charge.id
          }
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (error) {
        console.error('Erreur lors de la mise à jour du paiement:', error);
      }
    }

    console.log(`Charge échouée: ${charge.id} - ${charge.failure_message}`);

  } catch (error) {
    console.error('Erreur lors du traitement de la charge échouée:', error);
  }
}

async function sendConfirmationEmails(order: any, supabase: any) {
  try {
    // Récupérer les participants créés pour cette commande
    const { data: participants, error: participantsError } = await supabase
      .from('inscription_participants')
      .select('*')
      .eq('order_id', order.id);

    if (participantsError || !participants || participants.length === 0) {
      console.error('Aucun participant trouvé pour la commande:', order.id);
      return;
    }

    // Envoyer l'email de confirmation de commande
    // TODO: Implémenter l'envoi d'email avec le service configuré (Brevo/MailerSend)

    // Envoyer les billets par email pour chaque participant
    // TODO: Implémenter l'envoi des billets avec génération QR code

    console.log(`Emails de confirmation envoyés pour ${participants.length} participant(s)`);

  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails de confirmation:', error);
  }
}