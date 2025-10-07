import { NextResponse } from 'next/server'
import { supabaseApi } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = supabaseApi()

    // Récupérer tous les événements
    const { data: events, error } = await supabase
      .from('inscription_evenements')
      .select(`
        id,
        nom,
        description,
        lieu,
        date_debut,
        date_fin,
        statut,
        type_evenement,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des événements:', error)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      events: events || []
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}