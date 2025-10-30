import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { z } from 'zod';
import { PromoCode, ApplyPromoCodeResponse } from '@/types/billing';

// Schéma de validation pour la création de code promo
const promoCodeSchema = z.object({
  evenement_id: z.string().uuid(),
  organization_id: z.string().uuid().optional(),
  code: z.string().min(1, 'Le code est requis').regex(/^[A-Z0-9_-]+$/, 'Code invalide (majuscules, chiffres, underscore, tiret uniquement)'),
  description: z.string().optional(),
  type_reduction: z.enum(['percentage', 'fixed', 'bogo']),
  valeur_reduction: z.number().min(0, 'La valeur de réduction doit être positive'),
  montant_minimum: z.number().min(0).optional(),
  utilisation_maximum: z.number().positive().optional(),
  utilisation_par_client: z.number().min(1).default(1),
  date_debut: z.string().datetime(),
  date_fin: z.string().datetime().optional(),
  ticket_types_applicables: z.array(z.number()).optional(),
  actif: z.boolean().default(true)
});

// Schéma de validation pour l'application d'un code promo
const applyPromoCodeSchema = z.object({
  code: z.string().min(1),
  evenement_id: z.string().uuid(),
  client_email: z.string().email(),
  panier: z.array(z.object({
    ticket_type_id: z.number(),
    quantite: z.number().min(1),
    prix_unitaire: z.number().min(0)
  }))
});

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const { searchParams } = new URL(request.url);
    const evenement_id = searchParams.get('evenement_id');
    const organization_id = searchParams.get('organization_id');
    const actif_only = searchParams.get('actif_only') === 'true';

    let query = supabase
      .from('inscription_promo_codes')
      .select(`
        *,
        evenement:inscription_evenements(id, nom)
      `)
      .order('created_at', { ascending: false });

    if (evenement_id) {
      query = query.eq('evenement_id', evenement_id);
    }

    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    if (actif_only) {
      query = query.eq('actif', true);
    }

    const { data: promoCodes, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des codes promo:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des codes promo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoCodes as PromoCode[]
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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'apply') {
      return await applyPromoCode(supabase, body);
    }

    // Création d'un nouveau code promo
    const validatedData = promoCodeSchema.parse(body);

    // Vérifier que l'événement existe
    const { data: evenement, error: evenementError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, billetterie_active')
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

    // Vérifier que le code n'existe pas déjà
    const { data: existingCode } = await supabase
      .from('inscription_promo_codes')
      .select('id')
      .eq('code', validatedData.code.toUpperCase())
      .single();

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Ce code promo existe déjà' },
        { status: 400 }
      );
    }

    // Validation des dates
    const debut = new Date(validatedData.date_debut);
    if (validatedData.date_fin) {
      const fin = new Date(validatedData.date_fin);
      if (debut >= fin) {
        return NextResponse.json(
          { success: false, error: 'La date de fin doit être postérieure à la date de début' },
          { status: 400 }
        );
      }
    }

    // Insérer le nouveau code promo
    const { data: promoCode, error } = await supabase
      .from('inscription_promo_codes')
      .insert({
        ...validatedData,
        code: validatedData.code.toUpperCase(),
        utilise_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du code promo:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du code promo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoCode as PromoCode,
      message: 'Code promo créé avec succès'
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

async function applyPromoCode(supabase: any, body: any): Promise<NextResponse> {
  try {
    const validatedData = applyPromoCodeSchema.parse(body);

    // Récupérer le code promo
    const { data: promoCode, error: promoError } = await supabase
      .from('inscription_promo_codes')
      .select('*')
      .eq('code', validatedData.code.toUpperCase())
      .eq('evenement_id', validatedData.evenement_id)
      .eq('actif', true)
      .single();

    if (promoError || !promoCode) {
      return NextResponse.json({
        success: false,
        error: 'PROMO_CODE_INVALIDE',
        message: 'Code promo invalide ou inexistant'
      } as ApplyPromoCodeResponse, { status: 400 });
    }

    // Vérifier la validité du code
    const maintenant = new Date();
    const debut = new Date(promoCode.date_debut);
    const fin = promoCode.date_fin ? new Date(promoCode.date_fin) : null;

    if (maintenant < debut) {
      return NextResponse.json({
        success: false,
        error: 'PROMO_CODE_NOT_STARTED',
        message: 'Ce code promo n\'est pas encore actif'
      } as ApplyPromoCodeResponse, { status: 400 });
    }

    if (fin && maintenant > fin) {
      return NextResponse.json({
        success: false,
        error: 'PROMO_CODE_EXPIRE',
        message: 'Ce code promo a expiré'
      } as ApplyPromoCodeResponse, { status: 400 });
    }

    // Vérifier la limite d'utilisation maximale
    if (promoCode.utilisation_maximum && promoCode.utilise_count >= promoCode.utilisation_maximum) {
      return NextResponse.json({
        success: false,
        error: 'PROMO_CODE_LIMIT_REACHED',
        message: 'Ce code promo a atteint sa limite d\'utilisation'
      } as ApplyPromoCodeResponse, { status: 400 });
    }

    // Vérifier si le client a déjà utilisé ce code
    const { data: previousUsage } = await supabase
      .from('inscription_promo_code_uses')
      .select('id')
      .eq('promo_code_id', promoCode.id)
      .eq('client_email', validatedData.client_email)
      .limit(1);

    if (previousUsage && previousUsage.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'PROMO_CODE_ALREADY_USED',
        message: 'Vous avez déjà utilisé ce code promo'
      } as ApplyPromoCodeResponse, { status: 400 });
    }

    // Calculer la réduction
    const sousTotal = validatedData.panier.reduce((total: number, item: any) => total + (item.prix_unitaire * item.quantite), 0);

    // Vérifier le montant minimum
    if (promoCode.montant_minimum && sousTotal < promoCode.montant_minimum) {
      return NextResponse.json({
        success: false,
        error: 'PROMO_CODE_MINIMUM_NOT_REACHED',
        message: `Un minimum de ${promoCode.montant_minimum}€ est requis pour utiliser ce code promo`
      } as ApplyPromoCodeResponse, { status: 400 });
    }

    // Calculer le montant de la réduction
    let montantReduction = 0;
    if (promoCode.type_reduction === 'percentage') {
      montantReduction = sousTotal * (promoCode.valeur_reduction / 100);
    } else if (promoCode.type_reduction === 'fixed') {
      montantReduction = Math.min(promoCode.valeur_reduction, sousTotal);
    }
    // TODO: Implémenter la logique BOGO (Buy One Get One)

    const nouveauTotal = Math.max(0, sousTotal - montantReduction);

    return NextResponse.json({
      success: true,
      data: {
        promo_code: promoCode as PromoCode,
        reduction: montantReduction,
        nouveau_total: nouveauTotal
      },
      message: 'Code promo appliqué avec succès'
    } as ApplyPromoCodeResponse);

  } catch (error) {
    console.error('Erreur lors de l\'application du code promo:', error);

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