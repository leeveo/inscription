import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { stripeUtils } from '@/lib/stripe/server';
import { headers } from 'next/headers';

/**
 * Webhook Stripe pour gérer les événements de paiement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature Stripe manquante' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret Stripe non configuré' },
        { status: 500 }
      );
    }

    const event = stripeUtils.verifyWebhookSignature(body, signature, webhookSecret);

    console.log(`Webhook Stripe reçu: ${event.type}`);

    const supabase = supabaseApi();

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'refund.updated':
        await handleRefundUpdated(event.data.object as Stripe.Refund);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

/**
 * Gère le succès d'un paiement
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = supabaseApi();
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('Order ID manquant dans les métadonnées du Payment Intent');
    return;
  }

  try {
    // Mettre à jour la commande comme payée
    const { data: order, error: orderError } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'paid',
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.charges.data[0]?.id,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      console.error('Erreur lors de la mise à jour de la commande:', orderError);
      return;
    }

    // Créer l'enregistrement de paiement
    const charge = paymentIntent.charges.data[0];
    const { error: paymentError } = await supabase
      .from('inscription_payments')
      .insert({
        order_id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: charge?.id,
        stripe_balance_transaction_id: charge?.balance_transaction as string,
        montant: paymentIntent.amount / 100,
        devise: paymentIntent.currency.toUpperCase(),
        payment_method: charge?.payment_method_details?.type || 'card',
        statut: 'succeeded',
        card_last4: charge?.payment_method_details?.card?.last4,
        card_brand: charge?.payment_method_details?.card?.brand,
        card_exp_month: charge?.payment_method_details?.card?.exp_month,
        card_exp_year: charge?.payment_method_details?.card?.exp_year,
        frais_stripe: (charge?.fee || 0) / 100,
        processed_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('Erreur lors de la création du paiement:', paymentError);
    }

    // Générer les tickets pour les participants
    await generateTicketsForOrder(order);

    console.log(`Paiement réussi pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement du paiement réussi:', error);
  }
}

/**
 * Gère l'échec d'un paiement
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = supabaseApi();
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('Order ID manquant dans les métadonnées du Payment Intent');
    return;
  }

  try {
    // Mettre à jour la commande comme échouée
    const { error } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'cancelled',
        payment_intent_id: paymentIntent.id,
        metadata: {
          ...paymentIntent.metadata,
          payment_failed_reason: paymentIntent.last_payment_error?.message,
          payment_failed_at: new Date().toISOString(),
        }
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return;
    }

    // Libérer les quotas réservés
    await releaseQuotasForOrder(orderId);

    console.log(`Paiement échoué pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement du paiement échoué:', error);
  }
}

/**
 * Gère l'annulation d'un paiement
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('Order ID manquant dans les métadonnées du Payment Intent');
    return;
  }

  try {
    const supabase = supabaseApi();

    // Mettre à jour la commande comme annulée
    const { error } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'cancelled',
        payment_intent_id: paymentIntent.id,
        metadata: {
          ...paymentIntent.metadata,
          canceled_at: new Date().toISOString(),
        }
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return;
    }

    // Libérer les quotas réservés
    await releaseQuotasForOrder(orderId);

    console.log(`Paiement annulé pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement de l\'annulation:', error);
  }
}

/**
 * Gère les paiements nécessitant une action (3D Secure)
 */
async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('Order ID manquant dans les métadonnées du Payment Intent');
    return;
  }

  try {
    const supabase = supabaseApi();

    // Mettre à jour le statut de la commande
    const { error } = await supabase
      .from('inscription_orders')
      .update({
        statut: 'pending_payment',
        payment_intent_id: paymentIntent.id,
        metadata: {
          ...paymentIntent.metadata,
          requires_action: true,
          next_action: paymentIntent.next_action?.type,
        }
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
    }

    console.log(`Paiement requiert une action pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement du paiement nécessitant une action:', error);
  }
}

/**
 * Gère la complétion d'une session checkout
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    console.error('Order ID manquant dans les métadonnées de la session');
    return;
  }

  try {
    const supabase = supabaseApi();

    // Mettre à jour la commande avec les informations de la session
    const { error } = await supabase
      .from('inscription_orders')
      .update({
        payment_intent_id: session.payment_intent as string,
        metadata: {
          ...session.metadata,
          checkout_session_id: session.id,
          customer_email: session.customer_details?.email,
        }
      })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
    }

    console.log(`Session checkout complétée pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors du traitement de la session checkout:', error);
  }
}

/**
 * Gère le succès d'une charge
 */
async function handleChargeSucceeded(charge: Stripe.Charge) {
  // Cette fonction est déjà gérée par payment_intent.succeeded
  // Mais peut être utile pour des logs ou des actions spécifiques
  console.log(`Charge réussie: ${charge.id} - ${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`);
}

/**
 * Gère l'échec d'une charge
 */
async function handleChargeFailed(charge: Stripe.Charge) {
  console.error(`Charge échouée: ${charge.id} - ${charge.failure_message}`);
}

/**
 * Gère la création d'un litige (chargeback)
 */
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  const supabase = supabaseApi();

  try {
    // Trouver la commande associée à la charge
    const { data: payment } = await supabase
      .from('inscription_payments')
      .select('order_id')
      .eq('stripe_charge_id', dispute.charge)
      .single();

    if (payment) {
      // Marquer la commande comme ayant un litige
      await supabase
        .from('inscription_orders')
        .update({
          statut: 'refunded', // ou un nouveau statut 'disputed'
          metadata: {
            dispute_id: dispute.id,
            dispute_reason: dispute.reason,
            dispute_created: new Date().toISOString(),
          }
        })
        .eq('id', payment.order_id);
    }

    console.log(`Litige créé pour la charge ${dispute.charge}: ${dispute.reason}`);

  } catch (error) {
    console.error('Erreur lors du traitement du litige:', error);
  }
}

/**
 * Gère la mise à jour d'un refund
 */
async function handleRefundUpdated(refund: Stripe.Refund) {
  const supabase = supabaseApi();

  try {
    // Trouver le paiement associé au refund
    const { data: payment } = await supabase
      .from('inscription_payments')
      .select('order_id')
      .eq('stripe_charge_id', refund.charge)
      .single();

    if (payment) {
      // Mettre à jour ou créer l'enregistrement de refund
      await supabase
        .from('inscription_refunds')
        .upsert({
          payment_id: payment.id,
          order_id: payment.order_id,
          stripe_refund_id: refund.id,
          montant: refund.amount / 100,
          devise: refund.currency.toUpperCase(),
          statut: refund.status,
          processed_at: refund.created ? new Date(refund.created * 1000).toISOString() : new Date().toISOString(),
        }, {
          onConflict: 'stripe_refund_id'
        });
    }

    console.log(`Refund mis à jour: ${refund.id} - ${(refund.amount / 100).toFixed(2)} ${refund.currency.toUpperCase()}`);

  } catch (error) {
    console.error('Erreur lors du traitement du refund:', error);
  }
}

/**
 * Génère les tickets pour une commande payée
 */
async function generateTicketsForOrder(order: any) {
  const supabase = supabaseApi();

  try {
    // Récupérer les items de la commande
    const { data: orderItems } = await supabase
      .from('inscription_order_items')
      .select('*')
      .eq('order_id', order.id);

    if (!orderItems) return;

    // Pour chaque item, créer les participants et générer les QR codes
    for (const item of orderItems) {
      for (let i = 0; i < item.quantite; i++) {
        // Créer le participant
        const { data: participant } = await supabase
          .from('inscription_participants')
          .insert({
            evenement_id: order.evenement_id,
            nom: order.acheteur_nom,
            prenom: order.acheteur_prenom,
            email: order.acheteur_email,
            telephone: order.acheteur_telephone,
            order_id: order.id,
            ticket_type_id: item.ticket_type_id,
            order_item_id: item.id,
            source_inscription: 'payante',
            prix_paye: item.prix_unitaire,
            devise_paiement: order.devise,
            statut_paiement: 'paye',
            date_paiement: order.paid_at,
          })
          .select()
          .single();

        if (participant) {
          // Générer le QR code pour le participant
          await generateQRCodeForParticipant(participant.id, order.evenement_id);

          // Envoyer l'email de confirmation avec le billet
          // TODO: Implémenter l'envoi d'email
        }
      }
    }

    console.log(`${orderItems.reduce((sum, item) => sum + item.quantite, 0)} tickets générés pour la commande ${order.id}`);

  } catch (error) {
    console.error('Erreur lors de la génération des tickets:', error);
  }
}

/**
 * Génère un QR code pour un participant
 */
async function generateQRCodeForParticipant(participantId: number, eventId: string) {
  const supabase = supabaseApi();

  try {
    // Générer un token unique
    const token = generateRandomToken(32);

    // Créer l'enregistrement du QR token
    await supabase
      .from('inscription_participant_qr_tokens')
      .insert({
        participant_id: participantId,
        evenement_id: eventId,
        qr_token: token,
        ticket_url: `${process.env.NEXT_PUBLIC_APP_URL}/ticket/${participantId}`,
        is_active: true,
      });

  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
  }
}

/**
 * Libère les quotas réservés pour une commande annulée/échouée
 */
async function releaseQuotasForOrder(orderId: string) {
  const supabase = supabaseApi();

  try {
    // Récupérer les items de la commande
    const { data: orderItems } = await supabase
      .from('inscription_order_items')
      .select('ticket_type_id, quantite')
      .eq('order_id', orderId);

    if (!orderItems) return;

    // Libérer les quotas pour chaque item
    for (const item of orderItems) {
      await supabase.rpc('decrement_ticket_quota', {
        p_ticket_type_id: item.ticket_type_id,
        p_quantity: item.quantite
      });
    }

    console.log(`Quotas libérés pour la commande ${orderId}`);

  } catch (error) {
    console.error('Erreur lors de la libération des quotas:', error);
  }
}

/**
 * Génère un token aléatoire
 */
function generateRandomToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}