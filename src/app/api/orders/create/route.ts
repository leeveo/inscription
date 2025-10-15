import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { z } from 'zod';
import { Order, OrderItem, CreateOrderResponse } from '@/types/billing';

// Schéma de validation pour la création de commande
const createOrderSchema = z.object({
  evenement_id: z.string().uuid(),
  acheteur_nom: z.string().min(1),
  acheteur_prenom: z.string().min(1),
  acheteur_email: z.string().email(),
  acheteur_telephone: z.string().optional(),
  billets: z.array(z.object({
    ticket_type_id: z.number(),
    quantite: z.number().min(1)
  })).min(1),
  montant_total: z.number().min(0),
  montant_sous_total: z.number().min(0),
  montant_tva: z.number().min(0),
  montant_frais: z.number().min(0),
  code_promo: z.string().optional(),
  accepte_cgv: z.boolean(),
  accepte_newsletter: z.boolean(),
  consentements_rgpd: z.object({
    commercial: z.boolean(),
    analytics: z.boolean(),
    profiling: z.boolean()
  }),
  source_achat: z.string().default('direct'),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const body = await request.json();

    // Validation des données
    const validatedData = createOrderSchema.parse(body);

    // Vérifier que l'événement existe et que la billetterie est active
    const { data: evenement, error: evenementError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, billetterie_active, date_fin_vente')
      .eq('id', validatedData.evenement_id)
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

    // Vérifier que les ventes ne sont pas terminées
    if (evenement.date_fin_vente && new Date(evenement.date_fin_vente) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Les ventes sont terminées pour cet événement' },
        { status: 400 }
      );
    }

    // Récupérer et valider les types de billets
    const ticketTypeIds = validatedData.billets.map(b => b.ticket_type_id);
    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from('inscription_ticket_types')
      .select('*')
      .eq('evenement_id', validatedData.evenement_id)
      .in('id', ticketTypeIds);

    if (ticketTypesError || !ticketTypes || ticketTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Types de billets non trouvés' },
        { status: 404 }
      );
    }

    // Vérifier les quotas et disponibilités pour chaque billet
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

      // Vérifier les quantités min/max
      if (billet.quantite < ticketType.minimum_achat) {
        return NextResponse.json(
          { success: false, error: `Quantité minimale pour "${ticketType.nom}" : ${ticketType.minimum_achat}` },
          { status: 400 }
        );
      }

      if (billet.quantite > ticketType.maximum_achat) {
        return NextResponse.json(
          { success: false, error: `Quantité maximale pour "${ticketType.nom}" : ${ticketType.maximum_achat}` },
          { status: 400 }
        );
      }

      // Vérifier le quota disponible
      if (ticketType.quota_total !== null && (ticketType.quota_disponible ?? 0) < billet.quantite) {
        return NextResponse.json(
          { success: false, error: `Quota insuffisant pour "${ticketType.nom}"` },
          { status: 400 }
        );
      }

      // Vérifier les dates de vente
      const now = new Date();
      if (ticketType.date_debut_vente && new Date(ticketType.date_debut_vente) > now) {
        return NextResponse.json(
          { success: false, error: `Les ventes pour "${ticketType.nom}" n'ont pas encore commencé` },
          { status: 400 }
        );
      }

      if (ticketType.date_fin_vente && new Date(ticketType.date_fin_vente) < now) {
        return NextResponse.json(
          { success: false, error: `Les ventes pour "${ticketType.nom}" sont terminées` },
          { status: 400 }
        );
      }
    }

    // Calculer le total attendu pour validation
    let expectedTotal = 0;
    for (const billet of validatedData.billets) {
      const ticketType = ticketTypes.find(tt => tt.id === billet.ticket_type_id)!;
      expectedTotal += ticketType.prix * billet.quantite;
    }

    // Ajouter les frais
    const frais = 1.00 + (expectedTotal * 0.025);
    expectedTotal += frais;

    // Ajouter la TVA
    let tva = 0;
    for (const billet of validatedData.billets) {
      const ticketType = ticketTypes.find(tt => tt.id === billet.ticket_type_id)!;
      const itemTotal = ticketType.prix * billet.quantite;
      if (ticketType.tva_applicable) {
        tva += itemTotal * ticketType.taux_tva;
      }
    }
    expectedTotal += tva;

    // Appliquer le code promo si présent
    if (validatedData.code_promo) {
      const { data: promoCode, error: promoError } = await supabase
        .from('inscription_promo_codes')
        .select('*')
        .eq('code', validatedData.code_promo)
        .eq('evenement_id', validatedData.evenement_id)
        .eq('actif', true)
        .single();

      if (promoError || !promoCode) {
        return NextResponse.json(
          { success: false, error: 'Code promo invalide' },
          { status: 400 }
        );
      }

      // Vérifier la validité du code promo
      const now = new Date();
      if (promoCode.date_debut && new Date(promoCode.date_debut) > now) {
        return NextResponse.json(
          { success: false, error: 'Code promo non encore valide' },
          { status: 400 }
        );
      }

      if (promoCode.date_fin && new Date(promoCode.date_fin) < now) {
        return NextResponse.json(
          { success: false, error: 'Code promo expiré' },
          { status: 400 }
        );
      }

      if (promoCode.utilisation_maximum && promoCode.utilise_count >= promoCode.utilisation_maximum) {
        return NextResponse.json(
          { success: false, error: 'Code promo épuisé' },
          { status: 400 }
        );
      }

      // Vérifier que le client n'a pas déjà utilisé ce code
      const { data: existingUse, error: useError } = await supabase
        .from('inscription_promo_code_uses')
        .select('id')
        .eq('promo_code_id', promoCode.id)
        .eq('client_email', validatedData.acheteur_email)
        .single();

      if (!useError && existingUse) {
        return NextResponse.json(
          { success: false, error: 'Vous avez déjà utilisé ce code promo' },
          { status: 400 }
        );
      }

      // Appliquer la réduction
      if (promoCode.type_reduction === 'percentage') {
        expectedTotal *= (1 - promoCode.valeur_reduction / 100);
      } else if (promoCode.type_reduction === 'fixed') {
        expectedTotal = Math.max(0, expectedTotal - promoCode.valeur_reduction);
      }
    }

    // Valider le montant total
    if (Math.abs(validatedData.montant_total - expectedTotal) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Incohérence dans le montant total' },
        { status: 400 }
      );
    }

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('inscription_orders')
      .insert({
        evenement_id: validatedData.evenement_id,
        acheteur_nom: validatedData.acheteur_nom,
        acheteur_prenom: validatedData.acheteur_prenom,
        acheteur_email: validatedData.acheteur_email,
        acheteur_telephone: validatedData.acheteur_telephone,
        statut: 'draft',
        montant_total: validatedData.montant_total,
        montant_sous_total: validatedData.montant_sous_total,
        montant_tva: validatedData.montant_tva,
        montant_frais: validatedData.montant_frais,
        source_achat: validatedData.source_achat,
        notes: `CGV acceptées: ${validatedData.accepte_cgv}, Newsletter: ${validatedData.accepte_newsletter}`,
        metadata: {
          ...validatedData.metadata,
          consentements_rgpd: validatedData.consentements_rgpd,
          code_promo: validatedData.code_promo
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
    const orderItems = validatedData.billets.map(billet => {
      const ticketType = ticketTypes.find(tt => tt.id === billet.ticket_type_id)!;
      return {
        order_id: order.id,
        ticket_type_id: billet.ticket_type_id,
        quantite: billet.quantite,
        prix_unitaire: ticketType.prix,
        prix_total: ticketType.prix * billet.quantite
      };
    });

    const { data: createdItems, error: itemsError } = await supabase
      .from('inscription_order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Erreur lors de la création des items de commande:', itemsError);
      // Supprimer la commande en cas d'erreur
      await supabase
        .from('inscription_orders')
        .delete()
        .eq('id', order.id);

      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création des items de commande' },
        { status: 500 }
      );
    }

    // Enregistrer l'utilisation du code promo si applicable
    if (validatedData.code_promo) {
      const { data: promoCode } = await supabase
        .from('inscription_promo_codes')
        .select('id')
        .eq('code', validatedData.code_promo)
        .single();

      if (promoCode) {
        await supabase
          .from('inscription_promo_code_uses')
          .insert({
            promo_code_id: promoCode.id,
            order_id: order.id,
            client_email: validatedData.acheteur_email,
            montant_reduction: validatedData.montant_sous_total + validatedData.montant_tva + validatedData.montant_frais - validatedData.montant_total
          });

        // Mettre à jour le compteur d'utilisations
        await supabase
          .from('inscription_promo_codes')
          .update({ utilise_count: promoCode.utilise_count + 1 })
          .eq('id', promoCode.id);
      }
    }

    // Mettre à jour la date d'expiration de la commande (15 minutes)
    const expirationDate = new Date(Date.now() + 15 * 60 * 1000);
    await supabase
      .from('inscription_orders')
      .update({
        statut: 'pending_payment',
        expired_at: expirationDate.toISOString()
      })
      .eq('id', order.id);

    // Récupérer la commande complète avec ses items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('inscription_orders')
      .select(`
        *,
        order_items:inscription_order_items(
          *,
          ticket_type:inscription_ticket_types(*)
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('Erreur lors de la récupération de la commande complète:', fetchError);
    }

    return NextResponse.json({
      success: true,
      data: {
        order: completeOrder as Order
      },
      message: 'Commande créée avec succès'
    });

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