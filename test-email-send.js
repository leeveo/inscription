// Script de test pour envoyer un email de confirmation à marcmenu707@gmail.com
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://giafkganhfuxvadeiars.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYWZrZ2FuaGZ1eHZhZGVpYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzMyMjUsImV4cCI6MjA0NDc0OTIyNX0.pS7TxrbTiJK1MhiIFJBELx_u9abS3yub1AcDu3Ex1Y8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailSend() {
  try {
    // 1. D'abord, chercher un événement existant
    console.log('Recherche d\'un événement existant...');
    const { data: events, error: eventsError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.error('Erreur lors de la récupération des événements:', eventsError);
      return;
    }

    if (!events || events.length === 0) {
      console.log('Aucun événement trouvé dans la base de données.');
      return;
    }

    const event = events[0];
    console.log('Événement trouvé:', {
      id: event.id,
      nom: event.nom,
      date: event.date_evenement,
      lieu: event.lieu
    });

    // 2. Créer ou récupérer un participant test
    const testParticipant = {
      nom: 'Menu',
      prenom: 'Marc',
      email: 'marcmenu707@gmail.com',
      telephone: '0123456789',
      entreprise: 'Test Company'
    };

    // 3. Vérifier si le participant existe déjà
    let { data: existingParticipant, error: participantError } = await supabase
      .from('inscription_participants')
      .select('*')
      .eq('email', testParticipant.email)
      .eq('event_id', event.id)
      .single();

    if (participantError && participantError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification du participant:', participantError);
      return;
    }

    // 4. Si le participant n'existe pas, l'insérer
    if (!existingParticipant) {
      console.log('Création du participant test...');
      const { data: newParticipant, error: insertError } = await supabase
        .from('inscription_participants')
        .insert([{
          ...testParticipant,
          event_id: event.id,
          statut: 'confirmé'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Erreur lors de la création du participant:', insertError);
        return;
      }
      existingParticipant = newParticipant;
    }

    console.log('Participant:', {
      id: existingParticipant.id,
      nom: existingParticipant.nom,
      prenom: existingParticipant.prenom,
      email: existingParticipant.email
    });

    // 5. Appeler l'API d'envoi d'email
    console.log('Envoi de l\'email de test...');
    const response = await fetch('http://localhost:3000/api/send-inscription-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: event.id,
        participantEmail: testParticipant.email
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email envoyé avec succès!');
      console.log('Détails:', result);
    } else {
      console.error('❌ Erreur lors de l\'envoi de l\'email:');
      console.error('Status:', response.status);
      console.error('Erreur:', result);
    }

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Lancer le test
testEmailSend();