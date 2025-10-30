import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { z } from 'zod';

// Schéma de validation
const validatePromoCodeSchema = z.object({
  code: z.string().min(1),
  evenement_id: z.string().uuid(),
  montant_total: z.number().min(0),
  client_email: z.string().email().optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const body = await request.json();

    // Validation des données
    const validatedData = validatePromoCodeSchema.parse(body);

    // Récupérer le code promo
    const { data: promoCode, error: promoError } = await supabase
      .from('inscription_promo_codes')
      .select('*')
      .eq('code', validatedData.code.toUpperCase())
      .eq('evenement_id', validatedData.evenement_id)
      .eq('actif', true)
      .single();

    if (promoError || !promoCode) {
      return NextResponse.json(
        { success: false, error: 'Code promo invalide' },
        { status: 404 }
      );
    }

    // Vérifier la validité du code promo
    const now = new Date();

    // Vérifier la date de début
    if (promoCode.date_debut && new Date(promoCode.date_debut) > now) {
      return NextResponse.json(
        { success: false, error: 'Ce code promo n\'est pas encore valide' },
        { status: 400 }
      );
    }

    // Vérifier la date de fin
    if (promoCode.date_fin && new Date(promoCode.date_fin) < now) {
      return NextResponse.json(
        { success: false, error: 'Ce code promo a expiré' },
        { status: 400 }
      );
    }

    // Vérifier le nombre maximum d'utilisations
    if (promoCode.utilisation_maximum && promoCode.utilise_count >= promoCode.utilisation_maximum) {
      return NextResponse.json(
        { success: false, error: 'Ce code promo a été entièrement utilisé' },
        { status: 400 }
      );
    }

    // Vérifier l'utilisation par client si l'email est fourni
    if (validatedData.client_email) {
      const { data: existingUse, error: useError } = await supabase
        .from('inscription_promo_code_uses')
        .select('id')
        .eq('promo_code_id', promoCode.id)
        .eq('client_email', validatedData.client_email)
        .single();

      if (!useError && existingUse) {
        return NextResponse.json(
          { success: false, error: 'Vous avez déjà utilisé ce code promo' },
          { status: 400 }
        );
      }
    }

    // Vérifier le montant minimum si spécifié
    if (promoCode.montant_minimum && validatedData.montant_total < promoCode.montant_minimum) {
      return NextResponse.json(
        {
          success: false,
          error: `Un minimum de ${promoCode.montant_minimum.toFixed(2)}€ est requis pour utiliser ce code promo`
        },
        { status: 400 }
      );
    }

    // Calculer la réduction
    let reduction = 0;
    if (promoCode.type_reduction === 'percentage') {
      reduction = validatedData.montant_total * (promoCode.valeur_reduction / 100);
    } else if (promoCode.type_reduction === 'fixed') {
      reduction = Math.min(promoCode.valeur_reduction, validatedData.montant_total);
    } else if (promoCode.type_reduction === 'bogo') {
      // Buy One Get One - 50% de réduction sur le montant total
      reduction = validatedData.montant_total * 0.5;
    }

    // Arrondir la réduction à 2 décimales
    reduction = Math.round(reduction * 100) / 100;

    const nouveauTotal = Math.max(0, validatedData.montant_total - reduction);

    return NextResponse.json({
      success: true,
      data: {
        promo_code: promoCode,
        reduction,
        nouveau_total: nouveauTotal,
        type_reduction: promoCode.type_reduction,
        valeur_reduction: promoCode.valeur_reduction
      },
      message: 'Code promo appliqué avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la validation du code promo:', error);

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