import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';
import { z } from 'zod';
import { TicketType } from '@/types/billing';

// Schéma de validation pour la mise à jour
const updateTicketTypeSchema = z.object({
  nom: z.string().min(1).optional(),
  description: z.string().optional(),
  prix: z.number().min(0).optional(),
  type_tarif: z.enum(['early', 'standard', 'late', 'vip']).optional(),
  quota_total: z.number().positive().optional(),
  date_debut_vente: z.string().datetime().optional(),
  date_fin_vente: z.string().datetime().optional(),
  visible: z.boolean().optional(),
  vente_en_ligne: z.boolean().optional(),
  minimum_achat: z.number().min(1).optional(),
  maximum_achat: z.number().min(1).optional(),
  tva_applicable: z.boolean().optional(),
  taux_tva: z.number().min(0).max(1).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseApi();
    const ticketTypeId = params.id;

    // Vérifier que le type de billet existe
    const { data: ticketType, error } = await supabase
      .from('inscription_ticket_types')
      .select(`
        *,
        evenement:inscription_evenements(
          id, nom, date_debut, date_fin, billetterie_active
        )
      `)
      .eq('id', ticketTypeId)
      .single();

    if (error || !ticketType) {
      return NextResponse.json(
        { success: false, error: 'Type de billet non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticketType as TicketType
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseApi();
    const ticketTypeId = params.id;
    const body = await request.json();

    // Validation des données
    const validatedData = updateTicketTypeSchema.parse(body);

    // Vérifier que le type de billet existe
    const { data: existingTicketType, error: fetchError } = await supabase
      .from('inscription_ticket_types')
      .select('id, evenement_id, billets_vendus')
      .eq('id', ticketTypeId)
      .single();

    if (fetchError || !existingTicketType) {
      return NextResponse.json(
        { success: false, error: 'Type de billet non trouvé' },
        { status: 404 }
      );
    }

    // Validation : ne pas permettre de réduire le quota en dessous des billets déjà vendus
    if (validatedData.quota_total !== undefined &&
        existingTicketType.billets_vendus > validatedData.quota_total) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de réduire le quota à ${validatedData.quota_total} car ${existingTicketType.billets_vendus} billets ont déjà été vendus`
        },
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

    // Mettre à jour le type de billet
    const { data: updatedTicketType, error } = await supabase
      .from('inscription_ticket_types')
      .update(validatedData)
      .eq('id', ticketTypeId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du type de billet:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du type de billet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTicketType as TicketType,
      message: 'Type de billet mis à jour avec succès'
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseApi();
    const ticketTypeId = params.id;

    // Vérifier que le type de billet existe
    const { data: existingTicketType, error: fetchError } = await supabase
      .from('inscription_ticket_types')
      .select('id, billets_vendus')
      .eq('id', ticketTypeId)
      .single();

    if (fetchError || !existingTicketType) {
      return NextResponse.json(
        { success: false, error: 'Type de billet non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier qu'aucun billet n'a été vendu
    if (existingTicketType.billets_vendus > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer ce type de billet car ${existingTicketType.billets_vendus} billets ont déjà été vendus`
        },
        { status: 400 }
      );
    }

    // Supprimer le type de billet
    const { error } = await supabase
      .from('inscription_ticket_types')
      .delete()
      .eq('id', ticketTypeId);

    if (error) {
      console.error('Erreur lors de la suppression du type de billet:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression du type de billet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Type de billet supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}