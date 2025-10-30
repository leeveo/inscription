import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    fetch: fetch
  }
});

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantId, eventId } = body;

    // Validation des paramètres requis
    if (!participantId) {
      return NextResponse.json(
        { error: 'ID du participant requis' },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de l\'événement requis' },
        { status: 400 }
      );
    }

    // Vérifier que le participant existe et appartient à cet événement
    const { data: participantData, error: participantError } = await supabase
      .from('inscription_participants')
      .select('id, nom, prenom, email, evenement_id')
      .eq('id', participantId)
      .eq('evenement_id', eventId)
      .single();

    if (participantError || !participantData) {
      return NextResponse.json(
        { error: 'Participant non trouvé ou n\'appartient pas à cet événement' },
        { status: 404 }
      );
    }

    // Supprimer le participant
    // Grâce aux contraintes CASCADE dans la base de données, cela supprimera automatiquement :
    // - Les inscriptions aux sessions (inscription_session_participants)
    // - Les check-ins (inscription_checkins)  
    // - Les tokens QR (inscription_participant_qr_tokens)
    // - Les visites de landing page (landing_page_visits)
    const { error: deleteError } = await supabase
      .from('inscription_participants')
      .delete()
      .eq('id', participantId)
      .eq('evenement_id', eventId);

    if (deleteError) {
      console.error('Error deleting participant:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du participant', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Participant ${participantData.prenom} ${participantData.nom} supprimé avec succès`,
      deletedParticipant: {
        id: participantData.id,
        nom: participantData.nom,
        prenom: participantData.prenom,
        email: participantData.email
      }
    });

  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur lors de la suppression',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Endpoint pour supprimer plusieurs participants en lot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantIds, eventId } = body;

    // Validation des paramètres requis
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste des IDs de participants requise' },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'ID de l\'événement requis' },
        { status: 400 }
      );
    }

    // Vérifier que tous les participants existent et appartiennent à cet événement
    const { data: participantsData, error: participantsError } = await supabase
      .from('inscription_participants')
      .select('id, nom, prenom, email, evenement_id')
      .in('id', participantIds)
      .eq('evenement_id', eventId);

    if (participantsError) {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des participants', details: participantsError.message },
        { status: 500 }
      );
    }

    if (!participantsData || participantsData.length !== participantIds.length) {
      return NextResponse.json(
        { error: 'Un ou plusieurs participants non trouvés ou n\'appartiennent pas à cet événement' },
        { status: 404 }
      );
    }

    // Supprimer tous les participants sélectionnés
    const { error: deleteError } = await supabase
      .from('inscription_participants')
      .delete()
      .in('id', participantIds)
      .eq('evenement_id', eventId);

    if (deleteError) {
      console.error('Error deleting participants:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des participants', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${participantsData.length} participant(s) supprimé(s) avec succès`,
      deletedCount: participantsData.length,
      deletedParticipants: participantsData.map(p => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        email: p.email
      }))
    });

  } catch (error) {
    console.error('Bulk delete participants error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur lors de la suppression en lot',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}