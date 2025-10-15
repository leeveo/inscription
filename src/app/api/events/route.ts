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

export async function POST(request: Request) {
  try {
    const supabase = supabaseApi()
    const eventData = await request.json()

    console.log('📝 Données reçues pour création événement:', JSON.stringify(eventData, null, 2));

    // Validation des données obligatoires
    const eventName = eventData.nom;
    const eventStartDate = eventData.dateDebut || eventData.date_debut;
    
    if (!eventName || !eventStartDate) {
      console.error('Données manquantes:', { nom: eventName, dateDebut: eventStartDate, receivedData: eventData });
      return NextResponse.json(
        { success: false, message: 'Le nom et la date de début sont obligatoires' },
        { status: 400 }
      )
    }

    // Préparer les données pour l'événement
    const eventPayload = {
      nom: eventData.nom,
      description: eventData.description,
      lieu: eventData.lieu,
      date_debut: eventData.dateDebut || eventData.date_debut,
      date_fin: eventData.dateFin || eventData.date_fin,
      organisateur: eventData.organisateur,
      email_contact: eventData.emailContact || eventData.email_contact,
      telephone_contact: eventData.telephoneContact || eventData.telephone_contact,
      places_disponibles: eventData.placesDisponibles ? parseInt(eventData.placesDisponibles) : null,
      type_evenement: 'conference',
      statut: 'publié',
      prix: eventData.prix ? parseFloat(eventData.prix) : null,
      couleur_header_email: eventData.couleurHeaderEmail,
      objet_email_inscription: eventData.emailSubject
    }

    // Créer l'événement
    const { data: event, error: eventError } = await supabase
      .from('inscription_evenements')
      .insert([eventPayload])
      .select()
      .single()

    if (eventError) {
      console.error('Erreur lors de la création de l\'événement:', eventError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la création de l\'événement' },
        { status: 500 }
      )
    }

    // Créer les sessions si elles existent
    if (eventData.sessions && eventData.sessions.length > 0) {
      const sessionsPayload = eventData.sessions
        .filter((session: any) => session.titre) // Filtrer les sessions avec un titre
        .map((session: any) => ({
          evenement_id: event.id,
          titre: session.titre,
          description: session.description,
          date: eventData.dateDebut ? eventData.dateDebut.split('T')[0] : new Date().toISOString().split('T')[0], // Utiliser la date de l'événement
          heure_debut: session.heure_debut,
          heure_fin: session.heure_fin,
          lieu: session.lieu_session || eventData.lieu,
          intervenant: session.intervenant,
          type: session.type_session,
          max_participants: session.capacite_max ? parseInt(session.capacite_max) : null
        }))

      if (sessionsPayload.length > 0) {
        const { error: sessionsError } = await supabase
          .from('inscription_sessions')
          .insert(sessionsPayload)

        if (sessionsError) {
          console.error('Erreur lors de la création des sessions:', sessionsError)
        }
      }
    }

    // Créer les participants si ils existent
    if (eventData.participants && eventData.participants.length > 0) {
      const participantsPayload = eventData.participants.map((participant: any) => ({
        evenement_id: event.id,
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email,
        telephone: participant.telephone,
        profession: participant.profession,
        site_web: participant.site_web,
        checked_in: false,
        ticket_sent: false
      }))

      const { data: createdParticipants, error: participantsError } = await supabase
        .from('inscription_participants')
        .insert(participantsPayload)
        .select()

      if (participantsError) {
        console.error('Erreur lors de la création des participants:', participantsError)
      }

      // Retourner les informations de l'événement créé avec les participants
      return NextResponse.json({
        success: true,
        message: 'Événement créé avec succès',
        event: {
          ...event,
          participants: createdParticipants || []
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Événement créé avec succès',
      event
    })

  } catch (error) {
    console.error('Erreur serveur lors de la création:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}