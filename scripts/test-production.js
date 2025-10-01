/**
 * Test de l'API et landing page en production
 * Maintenant que les variables sont configurées, identifions le vrai problème
 */

async function testProductionAPI() {
  console.log('🧪 TEST EN PRODUCTION - API et Landing Page\n')
  
  // Test 1: API participant-tokens (génération d'URL)
  console.log('1️⃣  Test API participant-tokens...')
  try {
    const response = await fetch('https://admin.waivent.app/api/participant-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: 3, // ID du participant "menu marc"
        action: 'generate'
      })
    })
    
    console.log('📊 Status API:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API fonctionne!')
      console.log('🔗 URL générée:', data.landingUrl)
      
      // Test 2: Tester l'URL générée immédiatement
      console.log('\n2️⃣  Test de l\'URL générée...')
      const landingResponse = await fetch(data.landingUrl)
      console.log('📊 Status Landing:', landingResponse.status)
      
      if (landingResponse.ok) {
        console.log('✅ Landing page fonctionne avec la nouvelle URL!')
      } else {
        console.log('❌ Landing page échoue même avec nouvelle URL')
        const errorText = await landingResponse.text()
        console.log('📋 Erreur:', errorText.substring(0, 200))
      }
    } else {
      console.log('❌ API échoue encore')
      const errorText = await response.text()
      console.log('📋 Erreur API:', errorText)
    }
    
  } catch (error) {
    console.log('💥 Erreur réseau:', error.message)
  }
  
  // Test 3: Tester l'URL problématique spécifique
  console.log('\n3️⃣  Test de l\'URL problématique spécifique...')
  const problematicUrl = 'https://admin.waivent.app/landing/533c4f88-f3ed-47b9-8e99-630e5e6bf5b4/TIoHD1jVOz8jh1fWei6qs7c3P6bLZp9C'
  
  try {
    const response = await fetch(problematicUrl)
    console.log('📊 Status URL problématique:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('📋 Contenu erreur:', errorText.substring(0, 300))
      
      // Analyser si c'est un problème de token invalide
      console.log('\n🔍 Vérification du token...')
      console.log('- Event ID: 533c4f88-f3ed-47b9-8e99-630e5e6bf5b4')
      console.log('- Token: TIoHD1jVOz8jh1fWei6qs7c3P6bLZp9C')
      console.log('📝 Hypothèses:')
      console.log('  1. Token invalide ou expiré')
      console.log('  2. Event ID incorrect')
      console.log('  3. Problème de routing Next.js en production')
    } else {
      console.log('✅ URL problématique fonctionne maintenant!')
    }
    
  } catch (error) {
    console.log('💥 Erreur réseau URL problématique:', error.message)
  }
  
  // Test 4: Vérifier les participants existants via API
  console.log('\n4️⃣  Vérification des participants dans la base...')
  try {
    // Nous ne pouvons pas accéder directement à Supabase depuis ce script
    // mais nous pouvons tester avec l'API debug
    const debugResponse = await fetch('https://admin.waivent.app/api/debug-env')
    if (debugResponse.ok) {
      console.log('✅ API debug accessible - infrastructure OK')
    }
  } catch (error) {
    console.log('💥 Problème infrastructure:', error.message)
  }
}

// Exécuter les tests
testProductionAPI()