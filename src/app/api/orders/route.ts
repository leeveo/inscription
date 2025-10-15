import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { z } from 'zod';
import { Order, CreateOrderResponse, OrderStatus, PaymentMethod } from '@/types/billing';

// Schéma de validation pour la création de commande
const createOrderSchema = z.object({
  acheteur_nom: z.string().min(1, 'Le nom est requis'),
  acheteur_prenom: z.string().min(1, 'Le prénom est requis'),
  acheteur_email: z.string().email('Email invalide'),
  acheteur_telephone: z.string().optional(),
  billets: z.array(z.object({
    ticket_type_id: z.number(),
    quantite: z.number().min(1)
  })).min(1, 'Au moins un billet est requis'),
  code_promo: z.string().optional(),
  source_achat: z.string().default('direct'),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  affiliate_id: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const { searchParams } = new URL(request.url);
    const evenement_id = searchParams.get('evenement_id');
    const organization_id = searchParams.get('organization_id');
    const statut = searchParams.get('statut');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let query = supabase
      .from('inscription_orders')
      .select(`
        *,
        items:inscription_order_items(
          *,
          ticket_type:inscription_ticket_types(id, nom, prix, type_tarif)
        ),
        evenement:inscription_evenements(id, nom, date_debut, date_fin)
      `)
      .order('created_at', { ascending: false });

    if (evenement_id) {
      query = query.eq('evenement_id', evenement_id);
    }

    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    if (statut) {
      query = query.eq('statut', statut);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders as Order[]
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const body = await request.json();

    // Validation des données
    const validatedData = createOrderSchema.parse(body);

    // Vérifier que l'événement existe
    const { data: evenement, error: evenementError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, billetterie_active, devise')
      .eq('id', validatedData.billets[0].ticket_type_id.toString()) // TODO: Récupérer l'ID d'événement depuis le type de billet
      .single();

    if (evenementError || !evenement) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (!evenement.billetterie_active) {
      return NextResponse.json(
        { success: false, error: 'La billetterie n\'est pas active pour cet événement' },
        { status: 400 }
      );
    }

    // Récupérer tous les types de billets et vérifier les quotas
    const ticketTypeIds = validatedData.billets.map(b => b.ticket_type_id);
    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from('inscription_ticket_types')
      .select('*')
      .in('id', ticketTypeIds);

    if (ticketTypesError || !ticketTypes) {
      return NextResponse.json(
        { success: false, error: 'Types de billets non trouvés' },
        { status: 404 }
      );
    }

    // Vérifier les quotas et calculer le total
    let montantSousTotal = 0;
    let montantTVA = 0;
    let itemsData: any[] = [];

    for (const billet of validatedData.billets) {
      const ticketType = ticketTypes.find(tt => tt.id === billet.ticket_type_id);
      if (!ticketType) {
        return NextResponse.json(
          { success: false, error: `Type de billet ${billet.ticket_type_id} non trouvé` },
          { status: 404 }
        );
      }

      // Vérifier que le billet est visible et en vente
      if (!ticketType.visible || !ticketType.vente_en_ligne) {
        return NextResponse.json(
          { success: false, error: `Le billet "${ticketType.nom}" n'est pas en vente` },
          { status: 400 }
        );
      }

      // Vérifier les dates de vente
      const now = new Date();
      const debut = ticketType.date_debut_vente ? new Date(ticketType.date_debut_vente) : null;
      const fin = ticketType.date_fin_vente ? new Date(ticketType.date_fin_vente) : null;

      if (debut && now < debut) {
        return NextResponse.json(
          { success: false, error: `La vente du billet "${ticketType.nom}" n'a pas encore commencé` },
          { status: 400 }
        );
      }

      if (fin && now > fin) {
        return NextResponse.json(
          { success: false, error: `La vente du billet "${ticketType.nom}" est terminée` },
          { status: 400 }
        );
      }

      // Vérifier les limites d'achat
      if (billet.quantite < ticketType.minimum_achat) {
        return NextResponse.json(
          { success: false, error: `Quantité minimale pour ${ticketType.nom}: ${ticketType.minimum_achat}` },
          { status: 400 }
        );
      }

      if (billet.quantite > ticketType.maximum_achat) {
        return NextResponse.json(
          { success: false, error: `Quantité maximale pour ${ticketType.nom}: ${ticketType.maximum_achat}` },
          { status: 400 }
        );
      }

      // Vérifier le quota disponible
      if (ticketType.quota_disponible !== null && billet.quantite > ticketType.quota_disponible) {
        return NextResponse.json(
          { success: false, error: `Plus assez de billets "${ticketType.nom}" disponibles` },
          { status: 400 }
        );
      }

      const itemTotal = ticketType.prix * billet.quantite;
      const itemTVA = ticketType.tva_applicable ? itemTotal * ticketType.taux_tva : 0;

      montantSousTotal += itemTotal;
      montantTVA += itemTVA;

      itemsData.push({
        ticket_type_id: billet.ticket_type_id,
        quantite: billet.quantite,
        prix_unitaire: ticketType.prix,
        prix_total: itemTotal
      });
    }

    // Appliquer le code promo si fourni
    let reduction = 0;
    if (validatedData.code_promo) {
      const promoResponse = await fetch('/api/promo-codes?action=apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: validatedData.code_promo,
          evenement_id: ticketTypes[0].evenement_id, // TODO: Récupérer l'ID d'événement correct
          client_email: validatedData.acheteur_email,
          panier: itemsData.map(item => ({
            ticket_type_id: item.ticket_type_id,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire
          }))
        })
      });

      const promoResult = await promoResponse.json();
      if (promoResult.success) {
        reduction = promoResult.data.reduction;
      }
    }

    // Calculer les montants finaux
    const montantTotal = Math.max(0, montantSousTotal + 1.5 - reduction); // Frais de traitement de 1.5€

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('inscription_orders')
      .insert({
        evenement_id: ticketTypes[0].evenement_id, // TODO: Récupérer l'ID d'événement correct
        acheteur_nom: validatedData.acheteur_nom,
        acheteur_prenom: validatedData.acheteur_prenom,
        acheteur_email: validatedData.acheteur_email,
        acheteur_telephone: validatedData.acheteur_telephone,
        statut: montantTotal > 0 ? 'pending_payment' : 'paid',
        montant_sous_total: montantSousTotal,
        montant_tva: montantTVA,
        montant_frais: 1.5,
        montant_total: montantTotal,
        devise: evenement.devise || 'EUR',
        source_achat: validatedData.source_achat,
        utm_source: validatedData.utm_source,
        utm_medium: validatedData.utm_medium,
        utm_campaign: validatedData.utm_campaign,
        affiliate_id: validatedData.affiliate_id,
        metadata: {
          promo_code_used: validatedData.code_promo ? true : false,
          promo_code: validatedData.code_promo,
          reduction_amount: reduction
        }
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Erreur lors de la création de la commande:', orderError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      );
    }

    // Créer les items de commande
    const { error: itemsError } = await supabase
      .from('inscription_order_items')
      .insert(
        itemsData.map(item => ({
          ...item,
          order_id: order.id
        }))
      );

    if (itemsError) {
      console.error('Erreur lors de la création des items:', itemsError);
      // Annuler la commande si les items ne peuvent pas être créés
      await supabase.from('inscription_orders').delete().eq('id', order.id);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création des items de commande' },
        { status: 500 }
      );
    }

    // Enregistrer l'utilisation du code promo si applicable
    if (validatedData.code_promo && reduction > 0) {
      // Récupérer l'ID du code promo
      const { data: promoCode } = await supabase
        .from('inscription_promo_codes')
        .select('id')
        .eq('code', validatedData.code_promo.toUpperCase())
        .single();

      if (promoCode) {
        await supabase
          .from('inscription_promo_code_uses')
          .insert({
            promo_code_id: promoCode.id,
            order_id: order.id,
            client_email: validatedData.acheteur_email,
            montant_reduction: reduction
          });

        // Mettre à jour le compteur d'utilisation
        await supabase.rpc('increment_promo_uses', { promo_code_id: promoCode.id });
      }
    }

    // Si le montant est 0, marquer comme payée immédiatement
    if (montantTotal === 0) {
      await supabase
        .from('inscription_orders')
        .update({
          statut: 'paid' as OrderStatus,
          paid_at: new Date().toISOString()
        })
        .eq('id', order.id);

      // Créer l'enregistrement de paiement pour les commandes gratuites
      await supabase
        .from('inscription_payments')
        .insert({
          order_id: order.id,
          montant: 0,
          devise: evenement.devise || 'EUR',
          payment_method: 'other' as PaymentMethod,
          statut: 'succeeded' as const,
          processed_at: new Date().toISOString()
        });
    }

    // Créer les participants pour les billets nominatifs
    // TODO: Implémenter la création des participants

    // Si paiement requis, créer un Payment Intent Stripe
    let paymentIntent = null;
    if (montantTotal > 0) {
      // TODO: Intégration Stripe à implémenter
      // Pour l'instant, on simule
      paymentIntent = {
        client_secret: `pi_${order.id}_simulated_secret`,
        payment_intent_id: `pi_${order.id}`
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        order: order as Order,
        payment_intent
      },
      message: 'Commande créée avec succès'
    } as CreateOrderResponse);

  } catch (error) {
    console.error('Erreur serveur:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de validation',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}