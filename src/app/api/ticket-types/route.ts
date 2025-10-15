import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { z } from 'zod';
import { TicketType, TicketTypeFormData } from '@/types/billing';

// Schéma de validation pour la création/modification de type de billet
const ticketTypeSchema = z.object({
  evenement_id: z.string().uuid(),
  organization_id: z.string().uuid().optional(),
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  prix: z.number().min(0, 'Le prix doit être positif'),
  type_tarif: z.enum(['early', 'standard', 'late', 'vip']),
  quota_total: z.number().positive().optional(),
  date_debut_vente: z.string().datetime().optional(),
  date_fin_vente: z.string().datetime().optional(),
  visible: z.boolean().default(true),
  vente_en_ligne: z.boolean().default(true),
  minimum_achat: z.number().min(1).default(1),
  maximum_achat: z.number().min(1).default(10),
  tva_applicable: z.boolean().default(true),
  taux_tva: z.number().min(0).max(1).default(0.20)
});

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const { searchParams } = new URL(request.url);
    const evenement_id = searchParams.get('evenement_id');
    const organization_id = searchParams.get('organization_id');
    const visible_only = searchParams.get('visible_only') === 'true';

    let query = supabase
      .from('inscription_ticket_types')
      .select(`
        *,
        evenement:inscription_evenements(
          id, nom, date_debut, date_fin, billetterie_active
        )
      `)
      .order('created_at', { ascending: true });

    // Filtrer par événement si spécifié
    if (evenement_id) {
      query = query.eq('evenement_id', evenement_id);
    }

    // Filtrer par organisation si spécifié
    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    // Filtrer uniquement les types visibles
    if (visible_only) {
      query = query.eq('visible', true);
    }

    const { data: ticketTypes, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des types de billets:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des types de billets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticketTypes as TicketType[]
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
    const validatedData = ticketTypeSchema.parse(body);

    // Vérifier que l'événement existe et que la billetterie est active
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

    // Validation des dates de vente
    if (validatedData.date_debut_vente && validatedData.date_fin_vente) {
      const debut = new Date(validatedData.date_debut_vente);
      const fin = new Date(validatedData.date_fin_vente);
      if (debut >= fin) {
        return NextResponse.json(
          { success: false, error: 'La date de fin de vente doit être postérieure à la date de début' },
          { status: 400 }
        );
      }
    }

    // Insérer le nouveau type de billet
    const { data: ticketType, error } = await supabase
      .from('inscription_ticket_types')
      .insert({
        ...validatedData,
        billets_vendus: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du type de billet:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du type de billet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticketType as TicketType,
      message: 'Type de billet créé avec succès'
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