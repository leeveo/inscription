import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Récupérer un événement spécifique
      const { data, error } = await supabase
        .from('inscription_evenements')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement de l événement:', error)
        return NextResponse.json(
          { error: 'Événement non trouvé', details: error.message },
          { status: 404 }
        )
      }

      return NextResponse.json({ data })
    } else {
      // Récupérer tous les événements
      const { data, error } = await supabase
        .from('inscription_evenements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement des événements:', error)
        return NextResponse.json(
          { error: 'Erreur lors du chargement', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ data })
    }
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const eventData = await request.json()

    // Validation des données requises
    const requiredFields = ['nom', 'date_debut', 'date_fin', 'lieu', 'organisateur', 'email_contact']
    const missingFields = requiredFields.filter(field => !eventData[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Champs obligatoires manquants',
          missingFields,
          required: requiredFields
        },
        { status: 400 }
      )
    }

    // Créer l'événement
    const { data, error } = await supabase
      .from('inscription_evenements')
      .insert([{
        nom: eventData.nom,
        description: eventData.description || '',
        date_debut: eventData.date_debut,
        date_fin: eventData.date_fin,
        lieu: eventData.lieu,
        organisateur: eventData.organisateur,
        email_contact: eventData.email_contact,
        telephone_contact: eventData.telephone_contact || null,
        places_disponibles: eventData.places_disponibles ? parseInt(eventData.places_disponibles) : null,
        prix: eventData.prix ? parseFloat(eventData.prix) : 0,
        code_acces: eventData.codeAcces || null,
        evenement_payant: eventData.evenementPayant || false,
        logo_url: eventData.logoUrl || null,
        type_evenement: eventData.type_evenement || 'salon',
        statut: eventData.statut || 'brouillon',
        type_localisation: eventData.typeLocalisation || 'lieu',
        email_template: eventData.emailTemplate || 'professional',
        email_subject: eventData.emailSubject || 'Confirmation d\'inscription au Salon - {{event_name}}',
        couleur_header_email: eventData.couleurHeaderEmail || '#3b82f6'
      }])
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'événement', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Événement créé avec succès'
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'événement requis' },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    // Mettre à jour l'événement
    const { data, error } = await supabase
      .from('inscription_evenements')
      .update({
        nom: updateData.nom,
        description: updateData.description,
        date_debut: updateData.date_debut,
        date_fin: updateData.date_fin,
        lieu: updateData.lieu,
        organisateur: updateData.organisateur,
        email_contact: updateData.email_contact,
        telephone_contact: updateData.telephone_contact,
        places_disponibles: updateData.places_disponibles ? parseInt(updateData.places_disponibles) : null,
        prix: updateData.prix ? parseFloat(updateData.prix) : 0,
        code_acces: updateData.codeAcces,
        evenement_payant: updateData.evenementPayant,
        logo_url: updateData.logoUrl,
        type_evenement: updateData.typeEvenement,
        statut: updateData.statut,
        type_localisation: updateData.typeLocalisation,
        email_template: updateData.emailTemplate,
        email_subject: updateData.emailSubject,
        couleur_header_email: updateData.couleurHeaderEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Événement mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de l\'événement requis' },
        { status: 400 }
      )
    }

    // Supprimer l'événement (suppression en cascade des données liées)
    const { error } = await supabase
      .from('inscription_evenements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Événement supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne', details: error.message },
      { status: 500 }
    )
  }
}