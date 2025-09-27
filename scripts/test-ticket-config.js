// Script de test pour vérifier la configuration des tickets
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

async function testTicketConfiguration() {
  console.log('=== Test de Configuration des Tickets ===')
  console.log('')

  // 1. Test de connection Supabase
  console.log('1. Test connection Supabase...')
  try {
    const { data, error } = await supabase
      .from('inscription_evenements')
      .select('id, nom')
      .limit(1)
    
    if (error) {
      console.error('❌ Erreur connection Supabase:', error.message)
      return
    }
    
    console.log('✅ Connection Supabase OK')
    if (data && data.length > 0) {
      console.log(`   Premier événement trouvé: ${data[0].nom}`)
    }
  } catch (err) {
    console.error('❌ Erreur connection:', err)
    return
  }

  // 2. Vérification des variables d'environnement Brevo
  console.log('\n2. Configuration Brevo...')
  const brevoApiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.FROM_EMAIL
  const fromName = process.env.FROM_NAME

  console.log('   BREVO_API_KEY:', brevoApiKey ? '✅ Définie' : '❌ Manquante')
  console.log('   FROM_EMAIL:', fromEmail ? `✅ ${fromEmail}` : '❌ Manquante')
  console.log('   FROM_NAME:', fromName ? `✅ ${fromName}` : '⚠️  Optionnelle (non définie)')

  // 3. Test de la table des templates de tickets
  console.log('\n3. Table des templates de tickets...')
  try {
    const { data, error } = await supabase
      .from('inscription_ticket_templates')
      .select('id, evenement_id, subject')
      .limit(1)
    
    if (error && error.code === '42P01') {
      console.log('❌ Table inscription_ticket_templates n\'existe pas')
      console.log('   → Exécutez le script SQL: sql/create_ticket_tables.sql')
      return
    } else if (error) {
      console.log('❌ Erreur accès table:', error.message)
      return
    }
    
    console.log('✅ Table inscription_ticket_templates accessible')
    console.log(`   Templates existants: ${data ? data.length : 0}`)
  } catch (err) {
    console.log('❌ Erreur table templates:', err)
    return
  }

  // 4. Test des colonnes de tracking
  console.log('\n4. Colonnes de tracking des tickets...')
  try {
    const { data, error } = await supabase
      .from('inscription_participants')
      .select('id, ticket_sent, ticket_sent_at')
      .limit(1)
    
    if (error) {
      console.log('❌ Erreur colonnes tracking:', error.message)
      if (error.message.includes('ticket_sent')) {
        console.log('   → Exécutez le script SQL: sql/create_ticket_tables.sql')
      }
      return
    }
    
    console.log('✅ Colonnes de tracking OK')
  } catch (err) {
    console.log('❌ Erreur tracking:', err)
    return
  }

  // 5. Test API Brevo
  if (brevoApiKey && fromEmail) {
    console.log('\n5. Test API Brevo...')
    try {
      const response = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': brevoApiKey,
          'accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const account = await response.json()
        console.log('✅ API Brevo accessible')
        console.log(`   Compte: ${account.companyName || account.email}`)
      } else {
        console.log('❌ API Brevo non accessible:', response.status)
      }
    } catch (err) {
      console.log('❌ Erreur API Brevo:', err)
    }
  } else {
    console.log('\n5. Test API Brevo... ⏭️ Ignoré (credentials manquantes)')
  }

  console.log('\n=== Fin des Tests ===')
}

// Exporter pour utilisation
if (typeof window === 'undefined') {
  testTicketConfiguration()
}

export default testTicketConfiguration