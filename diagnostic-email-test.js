// Script pour diagnostiquer la base de données et les événements disponibles
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://giafkganhfuxvadeiars.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYWZrZ2FuaGZ1eHZhZGVpYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzMyMjUsImV4cCI6MjA0NDc0OTIyNX0.pS7TxrbTiJK1MhiIFJBELx_u9abS3yub1AcDu3Ex1Y8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticDatabase() {
  try {
    console.log('🔍 Diagnostic de la base de données...\n');

    // 1. Vérifier les événements
    console.log('1. Recherche des événements:');
    const { data: events, error: eventsError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, date_evenement, lieu, couleur_header_email, objet_email_inscription')
      .order('created_at', { ascending: false })
      .limit(5);

    if (eventsError) {
      console.error('❌ Erreur événements:', eventsError.message);
      
      // Si les colonnes n'existent pas, essayons sans
      console.log('Tentative sans les nouvelles colonnes...');
      const { data: eventsBasic, error: eventsBasicError } = await supabase
        .from('inscription_evenements')
        .select('id, nom, date_evenement, lieu')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (eventsBasicError) {
        console.error('❌ Erreur événements basiques:', eventsBasicError.message);
        return;
      } else {
        console.log('⚠️  Nouvelles colonnes non disponibles, mais événements trouvés:');
        eventsBasic.forEach(event => {
          console.log(`   ID: ${event.id}, Nom: ${event.nom}, Date: ${event.date_evenement}`);
        });
      }
    } else {
      console.log('✅ Événements trouvés:');
      events.forEach(event => {
        console.log(`   ID: ${event.id}, Nom: ${event.nom}, Date: ${event.date_evenement}`);
        console.log(`       Couleur: ${event.couleur_header_email || 'non définie'}`);
        console.log(`       Objet: ${event.objet_email_inscription || 'non défini'}`);
      });
    }

    // 2. Vérifier si le participant test existe
    console.log('\n2. Recherche du participant test:');
    const { data: participants, error: participantsError } = await supabase
      .from('inscription_participants')
      .select('*')
      .eq('email', 'marcmenu707@gmail.com');

    if (participantsError) {
      console.error('❌ Erreur participants:', participantsError.message);
    } else {
      if (participants.length > 0) {
        console.log('✅ Participant test trouvé:');
        participants.forEach(p => {
          console.log(`   ID: ${p.id}, Nom: ${p.prenom} ${p.nom}, Event: ${p.event_id}`);
        });
      } else {
        console.log('ℹ️  Participant test non trouvé - sera créé lors du test');
      }
    }

    // 3. Vérifier les sessions disponibles
    console.log('\n3. Vérification des sessions:');
    const { data: sessions, error: sessionsError } = await supabase
      .from('inscription_sessions')
      .select('id, nom, date_debut, date_fin, event_id')
      .limit(3);

    if (sessionsError) {
      console.error('❌ Erreur sessions:', sessionsError.message);
    } else {
      if (sessions.length > 0) {
        console.log('✅ Sessions trouvées:');
        sessions.forEach(s => {
          console.log(`   ID: ${s.id}, Nom: ${s.nom}, Event: ${s.event_id}`);
        });
      } else {
        console.log('ℹ️  Aucune session trouvée');
      }
    }

    console.log('\n📋 Résumé:');
    console.log(`- Événements: ${events?.length || 'erreur'}`);
    console.log(`- Participant test: ${participants?.length > 0 ? 'existe' : 'à créer'}`);
    console.log(`- Sessions: ${sessions?.length || 'erreur'}`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

diagnosticDatabase();