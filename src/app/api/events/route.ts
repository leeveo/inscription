import { NextResponse } from 'next/server'
import { supabaseAuthenticatedApi } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await supabaseAuthenticatedApi()

    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer uniquement les événements de cet administrateur
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
      .eq('admin_id', user.id)
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
    const supabase = await supabaseAuthenticatedApi()
    const eventData = await request.json()

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      )
    }

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
      objet_email_inscription: eventData.emailSubject,
      // Nouveaux champs du wizard
      type_localisation: eventData.typeLocalisation,
      invitation_email_template: eventData.invitationEmailTemplate,
      registration_form_type: eventData.registrationFormType,
      secteur_activite: eventData.secteurActivite,
      ouverture_portes: eventData.ouverturePortes || null,
      // Mapping intelligent pour l'édition
      nom_lieu: eventData.typeLocalisation === 'lieu' ? eventData.lieu : null,
      nom_organisation: eventData.organisateur,
      admin_id: user.id
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

    // 1. Créer les types de billets (Concert)
    if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
      const ticketsToInsert = eventData.ticketTypes.map((t: any) => ({
        evenement_id: event.id,
        nom: t.nom,
        description: t.description,
        prix: parseFloat(t.prix),
        quantite_totale: t.quantite_totale ? parseInt(t.quantite_totale) : null,
        emplacement: t.emplacement
      }));

      const { error: ticketsError } = await supabase
        .from('inscription_ticket_types')
        .insert(ticketsToInsert);

      if (ticketsError) {
        console.error('Erreur lors de la création des types de billets:', ticketsError);
      }
    }

    // Map pour stocker la correspondance entre ID temporaire (frontend) et ID réel (DB)
    const intervenantIdMap = new Map<number, string>();
    const sessionIdMap = new Map<number, string>();

    // 2. Créer les intervenants
    if (eventData.intervenants && eventData.intervenants.length > 0) {
      const intervenantsToInsert = eventData.intervenants.map((i: any) => ({
        evenement_id: event.id,
        nom: i.nom,
        prenom: i.prenom,
        email: i.email,
        telephone: i.telephone,
        entreprise: i.entreprise,
        poste: i.poste,
        bio: i.bio,
        photo_url: i.photo_url,
        linkedin: i.linkedin,
        twitter: i.twitter
      }));

      const { data: createdIntervenants, error: intervenantsError } = await supabase
        .from('inscription_intervenants')
        .insert(intervenantsToInsert)
        .select();

      if (intervenantsError) {
        console.error('Erreur lors de la création des intervenants:', intervenantsError);
      } else if (createdIntervenants) {
        // Remplir la map des IDs
        createdIntervenants.forEach((createdIntervenant, index) => {
          const originalId = eventData.intervenants[index].id;
          intervenantIdMap.set(originalId, createdIntervenant.id);
        });
      }
    }

    // 3. Créer les sessions
    if (eventData.sessions && eventData.sessions.length > 0) {
      const sessionsToInsert = eventData.sessions
        .filter((session: any) => session.titre)
        .map((session: any) => ({
          evenement_id: event.id,
          titre: session.titre,
          description: session.description,
          date: session.date || (eventData.dateDebut ? eventData.dateDebut.split('T')[0] : new Date().toISOString().split('T')[0]),
          heure_debut: session.heure_debut,
          heure_fin: session.heure_fin,
          lieu: session.lieu_session || eventData.lieu,
          type: session.type_session,
          max_participants: session.capacite_max ? parseInt(session.capacite_max) : null
        }));

      const { data: createdSessions, error: sessionsError } = await supabase
        .from('inscription_sessions')
        .insert(sessionsToInsert)
        .select();

      if (sessionsError) {
        console.error('Erreur lors de la création des sessions:', sessionsError);
      } else if (createdSessions) {
        // Remplir la map des IDs
        // Attention: on a filtré les sessions, il faut s'assurer de mapper correctement
        let createdIndex = 0;
        eventData.sessions.forEach((session: any) => {
          if (session.titre) {
            if (createdSessions[createdIndex]) {
              sessionIdMap.set(session.id, createdSessions[createdIndex].id);
              createdIndex++;
            }
          }
        });

        // 3. Lier les intervenants aux sessions
        const sessionIntervenantsLinks: any[] = [];
        
        eventData.sessions.forEach((session: any) => {
          if (session.titre && session.intervenant_ids && session.intervenant_ids.length > 0) {
            const realSessionId = sessionIdMap.get(session.id);
            
            if (realSessionId) {
              session.intervenant_ids.forEach((tempIntervenantId: number) => {
                const realIntervenantId = intervenantIdMap.get(tempIntervenantId);
                
                if (realIntervenantId) {
                  sessionIntervenantsLinks.push({
                    session_id: realSessionId,
                    intervenant_id: realIntervenantId
                  });
                }
              });
            }
          }
        });

        if (sessionIntervenantsLinks.length > 0) {
          const { error: linksError } = await supabase
            .from('inscription_session_intervenants')
            .insert(sessionIntervenantsLinks);

          if (linksError) {
            console.error('Erreur lors de la liaison sessions-intervenants:', linksError);
          }
        }
      }
    }

    // 4. Créer les exposants (Salon)
    if (eventData.exposants && eventData.exposants.length > 0) {
      const exposantsToInsert = eventData.exposants.map((e: any) => ({
        evenement_id: event.id,
        nom_societe: e.nom,
        description: e.activite,
        secteur_activite: e.categorie,
        site_web: e.site_web,
        email_contact: e.email,
        telephone_contact: e.telephone,
        adresse: e.adresse,
        ville: e.ville,
        code_postal: e.code_postal,
        pays: e.pays,
        nom_representant: e.nom_representant,
        prenom_representant: e.prenom_representant,
        fonction_representant: e.fonction_representant,
        email_representant: e.email_representant,
        telephone_representant: e.telephone_representant,
        stand_emplacement: e.stand_emplacement,
        stand_taille: e.stand_taille,
        besoins_electriques: e.besoins_electriques,
        besoins_internet: e.besoins_internet,
        statut: 'confirmé' // Par défaut
      }));

      const { error: exposantsError } = await supabase
        .from('inscription_exposants')
        .insert(exposantsToInsert);

      if (exposantsError) {
        console.error('Erreur lors de la création des exposants:', exposantsError);
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
        entreprise: participant.entreprise,
        commentaires: participant.commentaires,
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