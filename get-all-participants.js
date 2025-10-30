#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function getAllParticipants() {
  try {
    console.log('🔍 Récupération de tous les participants...\n');

    // Participants aux événements
    console.log('📅 Récupération des participants aux événements...');
    const eventParticipants = await prisma.inscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            created_at: true
          }
        },
        evenement: {
          select: {
            id: true,
            titre: true,
            date_debut: true,
            date_fin: true,
            lieu: true
          }
        }
      }
    });

    // Participants aux sessions
    console.log('🎯 Récupération des participants aux sessions...');
    const sessionParticipants = await prisma.inscriptionSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            created_at: true
          }
        },
        session: {
          include: {
            evenement: {
              select: {
                id: true,
                titre: true,
                date_debut: true,
                date_fin: true
              }
            }
          }
        }
      }
    });

    // Formatage des données pour les événements
    const formattedEventParticipants = eventParticipants.map(inscription => ({
      type: 'EVENEMENT',
      participant_id: inscription.user.id,
      nom: inscription.user.nom,
      prenom: inscription.user.prenom,
      email: inscription.user.email,
      telephone: inscription.user.telephone,
      date_inscription: inscription.created_at,
      evenement_id: inscription.evenement.id,
      evenement_titre: inscription.evenement.titre,
      evenement_debut: inscription.evenement.date_debut,
      evenement_fin: inscription.evenement.date_fin,
      evenement_lieu: inscription.evenement.lieu,
      session_id: null,
      session_titre: null,
      statut: inscription.statut || 'confirme'
    }));

    // Formatage des données pour les sessions
    const formattedSessionParticipants = sessionParticipants.map(inscription => ({
      type: 'SESSION',
      participant_id: inscription.user.id,
      nom: inscription.user.nom,
      prenom: inscription.user.prenom,
      email: inscription.user.email,
      telephone: inscription.user.telephone,
      date_inscription: inscription.created_at,
      evenement_id: inscription.session.evenement.id,
      evenement_titre: inscription.session.evenement.titre,
      evenement_debut: inscription.session.evenement.date_debut,
      evenement_fin: inscription.session.evenement.date_fin,
      evenement_lieu: null,
      session_id: inscription.session.id,
      session_titre: inscription.session.titre,
      statut: inscription.statut || 'confirme'
    }));

    // Combine tous les participants
    const allParticipants = [
      ...formattedEventParticipants,
      ...formattedSessionParticipants
    ];

    // Affichage des statistiques
    console.log('\n📊 STATISTIQUES:');
    console.log(`Total participants événements: ${formattedEventParticipants.length}`);
    console.log(`Total participants sessions: ${formattedSessionParticipants.length}`);
    console.log(`Total général: ${allParticipants.length}`);

    // Participants uniques
    const uniqueParticipants = new Set();
    allParticipants.forEach(p => uniqueParticipants.add(p.participant_id));
    console.log(`Participants uniques: ${uniqueParticipants.size}`);

    // Affichage des premiers résultats
    console.log('\n📋 APERÇU DES PARTICIPANTS:');
    console.log('─'.repeat(120));
    console.log(
      'Type'.padEnd(12) + 
      'Nom'.padEnd(20) + 
      'Email'.padEnd(30) + 
      'Événement/Session'.padEnd(40) + 
      'Date inscription'
    );
    console.log('─'.repeat(120));

    allParticipants.slice(0, 10).forEach(participant => {
      const eventOrSession = participant.type === 'EVENEMENT' 
        ? participant.evenement_titre 
        : `${participant.evenement_titre} - ${participant.session_titre}`;
      
      console.log(
        participant.type.padEnd(12) + 
        `${participant.prenom} ${participant.nom}`.padEnd(20).substring(0, 20) + 
        participant.email.padEnd(30).substring(0, 30) + 
        eventOrSession.padEnd(40).substring(0, 40) + 
        new Date(participant.date_inscription).toLocaleDateString('fr-FR')
      );
    });

    if (allParticipants.length > 10) {
      console.log(`... et ${allParticipants.length - 10} autres participants`);
    }

    // Génération du fichier CSV
    const csvContent = [
      // En-tête
      'Type,ID_Participant,Nom,Prenom,Email,Telephone,Date_Inscription,ID_Evenement,Titre_Evenement,Debut_Evenement,Fin_Evenement,Lieu_Evenement,ID_Session,Titre_Session,Statut',
      // Données
      ...allParticipants.map(p => [
        p.type,
        p.participant_id,
        `"${p.nom || ''}"`,
        `"${p.prenom || ''}"`,
        p.email,
        p.telephone || '',
        p.date_inscription ? new Date(p.date_inscription).toISOString() : '',
        p.evenement_id,
        `"${p.evenement_titre || ''}"`,
        p.evenement_debut ? new Date(p.evenement_debut).toISOString() : '',
        p.evenement_fin ? new Date(p.evenement_fin).toISOString() : '',
        `"${p.evenement_lieu || ''}"`,
        p.session_id || '',
        `"${p.session_titre || ''}"`,
        p.statut
      ].join(','))
    ].join('\n');

    // Sauvegarde du fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `participants_export_${timestamp}.csv`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, csvContent, 'utf8');
    
    console.log('\n💾 EXPORT RÉUSSI:');
    console.log(`Fichier sauvegardé: ${filepath}`);
    console.log(`Taille: ${Buffer.from(csvContent).length} octets`);

    // Génération du résumé JSON
    const summary = {
      export_date: new Date().toISOString(),
      statistics: {
        total_participants: allParticipants.length,
        event_participants: formattedEventParticipants.length,
        session_participants: formattedSessionParticipants.length,
        unique_participants: uniqueParticipants.size
      },
      events: [...new Set(allParticipants.map(p => p.evenement_titre))],
      sessions: [...new Set(allParticipants.filter(p => p.session_titre).map(p => p.session_titre))]
    };

    const summaryFilepath = path.join(__dirname, `participants_summary_${timestamp}.json`);
    fs.writeFileSync(summaryFilepath, JSON.stringify(summary, null, 2), 'utf8');
    
    console.log(`Résumé JSON: ${summaryFilepath}`);

    return {
      participants: allParticipants,
      statistics: summary.statistics,
      files: {
        csv: filepath,
        summary: summaryFilepath
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des participants:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  getAllParticipants()
    .then((result) => {
      console.log('\n✅ Export terminé avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error.message);
      process.exit(1);
    });
}

module.exports = getAllParticipants;