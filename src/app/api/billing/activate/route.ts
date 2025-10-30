import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const { eventId, settings } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de l\'événement est requis' },
        { status: 400 }
      );
    }

    // Paramètres par défaut pour la billetterie
    const defaultSettings = {
      devise: 'EUR',
      langue: 'fr',
      fuseau_horaire: 'Europe/Paris',
      taux_tva_defaut: 0.2000,
      payment_methods_allowed: ['card', 'apple_pay', 'google_pay'],
      tva_applicable: true,
      vente_en_ligne_active: true,
      stripe_connect_id: null,
      organization_id: null,
      ...settings
    };

    // Activer la billetterie pour l'événement
    const { data, error } = await supabase
      .from('inscription_evenements')
      .update({
        billetterie_active: true,
        billetterie_settings: defaultSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select('id, nom, billetterie_active, billetterie_settings')
      .single();

    if (error) {
      console.error('Erreur lors de l\'activation de la billetterie:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        evenement: data,
        message: 'Billetterie activée avec succès'
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseApi();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'L\'ID de l\'événement est requis' },
        { status: 400 }
      );
    }

    // Vérifier le statut de la billetterie
    const { data, error } = await supabase
      .from('inscription_evenements')
      .select('id, nom, billetterie_active, billetterie_settings')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        evenement: data,
        billetterie_active: data?.billetterie_active || false,
        billetterie_settings: data?.billetterie_settings || {}
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}