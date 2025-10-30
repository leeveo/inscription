#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseDatabase() {
  try {
    console.log('🔍 Diagnostic de la base de données...\n');

    // Test de connexion
    console.log('📡 Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion réussie\n');

    // Vérification des tables principales
    console.log('📊 Vérification des données:');
    
    // Comptage des utilisateurs
    const userCount = await prisma.user.count();
    console.log(`👥 Utilisateurs: ${userCount}`);

    // Comptage des événements
    const eventCount = await prisma.evenement.count();
    console.log(`📅 Événements: ${eventCount}`);

    // Comptage des sessions
    try {
      const sessionCount = await prisma.session.count();
      console.log(`🎯 Sessions: ${sessionCount}`);
    } catch (error) {
      console.log('🎯 Sessions: Table non trouvée ou inaccessible');
    }

    // Comptage des inscriptions événements
    try {
      const eventInscriptionCount = await prisma.inscription.count();
      console.log(`📝 Inscriptions événements: ${eventInscriptionCount}`);
    } catch (error) {
      console.log('📝 Inscriptions événements: Table non trouvée ou inaccessible');
    }

    // Comptage des inscriptions sessions
    try {
      const sessionInscriptionCount = await prisma.inscriptionSession.count();
      console.log(`📋 Inscriptions sessions: ${sessionInscriptionCount}`);
    } catch (error) {
      console.log('📋 Inscriptions sessions: Table non trouvée ou inaccessible');
    }

    // Exemple d'utilisateur
    console.log('\n👤 Exemple d\'utilisateur:');
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        created_at: true
      }
    });
    
    if (sampleUser) {
      console.log(`   ID: ${sampleUser.id}`);
      console.log(`   Nom: ${sampleUser.prenom} ${sampleUser.nom}`);
      console.log(`   Email: ${sampleUser.email}`);
      console.log(`   Créé le: ${new Date(sampleUser.created_at).toLocaleDateString('fr-FR')}`);
    } else {
      console.log('   Aucun utilisateur trouvé');
    }

    // Exemple d'événement
    console.log('\n📅 Exemple d\'événement:');
    const sampleEvent = await prisma.evenement.findFirst({
      select: {
        id: true,
        titre: true,
        date_debut: true,
        lieu: true
      }
    });
    
    if (sampleEvent) {
      console.log(`   ID: ${sampleEvent.id}`);
      console.log(`   Titre: ${sampleEvent.titre}`);
      console.log(`   Date: ${new Date(sampleEvent.date_debut).toLocaleDateString('fr-FR')}`);
      console.log(`   Lieu: ${sampleEvent.lieu || 'Non spécifié'}`);
    } else {
      console.log('   Aucun événement trouvé');
    }

    console.log('\n✅ Diagnostic terminé avec succès!');
    console.log('\n💡 Vous pouvez maintenant lancer l\'export des participants avec:');
    console.log('   node get-all-participants.js');
    console.log('   ou');
    console.log('   .\\export-participants.ps1');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez que la base de données est accessible');
    console.log('2. Vérifiez la configuration Prisma dans .env');
    console.log('3. Lancez: npx prisma generate');
    console.log('4. Lancez: npx prisma db push');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  diagnoseDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

module.exports = diagnoseDatabase;