/**
 * Test de la landing page en local pour identifier le problème en production
 */
require('dotenv').config({ path: '.env.local' })

async function testLandingPageLocally() {
  console.log('🧪 Test de la landing page en local...\n')
  
  const eventId = '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4'
  const token = 'TIoHD1jVOz8jh1fWei6qs7c3P6bLZp9C'
  
  console.log('📋 Paramètres du test:')
  console.log('- Event ID:', eventId)
  console.log('- Token:', token)
  console.log('- URL locale:', `http://localhost:3002/landing/${eventId}/${token}`)
  console.log('- URL production:', `https://admin.waivent.app/landing/${eventId}/${token}`)
  
  // Test 1: Vérifier les variables d'environnement
  console.log('\n🔍 Variables d\'environnement:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌')  
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
  
  // Test 2: Tester la connexion Supabase avec les mêmes paramètres que la landing page
  try {
    console.log('\n🔗 Test de connexion Supabase...')
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Variables Supabase manquantes!')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test de récupération de l'événement (comme dans getEventData)
    console.log('🏷️  Test récupération événement...')
    const { data: event, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      console.log('❌ Erreur événement:', eventError.message)
    } else {
      console.log('✅ Événement trouvé:', event.nom)
    }
    
    // Test de récupération du participant (comme dans getParticipantData)
    console.log('👤 Test récupération participant...')
    const { data: participant, error: participantError } = await supabase
      .from('inscription_participants')
      .select('id, nom, prenom, token_landing_page, evenement_id')
      .eq('token_landing_page', token)
      .single()
    
    if (participantError) {
      console.log('❌ Erreur participant:', participantError.message)
      
      // Vérifier si le token existe
      console.log('🔍 Recherche du token dans la base...')
      const { data: allTokens } = await supabase
        .from('inscription_participants')
        .select('id, nom, prenom, token_landing_page')
        .not('token_landing_page', 'is', null)
        .limit(5)
      
      console.log('📊 Tokens existants:', allTokens?.map(p => ({
        id: p.id,
        nom: p.nom,
        token: p.token_landing_page?.substring(0, 8) + '...'
      })))
      
    } else {
      console.log('✅ Participant trouvé:', participant.nom, participant.prenom)
      
      // Vérifier la correspondance eventId
      if (participant.evenement_id === eventId) {
        console.log('✅ Event ID correspond')
      } else {
        console.log('❌ Event ID ne correspond pas:', participant.evenement_id, 'vs', eventId)
      }
    }
    
    // Test de récupération de la config landing page
    console.log('⚙️  Test récupération config landing page...')
    const { data: config, error: configError } = await supabase
      .from('landing_page_configs')
      .select('*')
      .eq('event_id', eventId)
      .single()
    
    if (configError) {
      console.log('⚠️  Pas de config landing page (utilisation config par défaut)')
    } else {
      console.log('✅ Config landing page trouvée:', config.template_id)
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message)
  }
}

// Test de l'URL en local si le serveur tourne
async function testLocalUrl() {
  try {
    console.log('\n🌐 Test URL locale...')
    const response = await fetch('http://localhost:3002/landing/533c4f88-f3ed-47b9-8e99-630e5e6bf5b4/TIoHD1jVOz8jh1fWei6qs7c3P6bLZp9C')
    console.log('📊 Status local:', response.status)
    
    if (response.status !== 200) {
      const text = await response.text()
      console.log('📋 Erreur locale:', text.substring(0, 500))
    } else {
      console.log('✅ Landing page locale fonctionne!')
    }
  } catch (error) {
    console.log('ℹ️  Serveur local non démarré ou erreur:', error.message)
  }
}

async function main() {
  await testLandingPageLocally()
  await testLocalUrl()
}

main()