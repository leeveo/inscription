// Test direct de l'API participant-tokens
// Utilise le fetch natif de Node.js 18+

async function testParticipantTokensAPI() {
  try {
    console.log('🧪 Test de l\'API /api/participant-tokens...\n')
    
    const response = await fetch('http://localhost:3002/api/participant-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        participantId: 'test-participant-id',
        action: 'generate'
      })
    })
    
    console.log('📊 Status:', response.status)
    console.log('📊 Status Text:', response.statusText)
    
    const responseText = await response.text()
    console.log('📋 Response Body:', responseText)
    
    if (!response.ok) {
      console.log('❌ Erreur HTTP:', response.status)
    } else {
      console.log('✅ Succès!')
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message)
  }
}

testParticipantTokensAPI()