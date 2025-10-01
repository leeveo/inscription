// Récupérer un participant réel pour tester l'API
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function getRealParticipantId() {
  try {
    const { data: participants, error } = await supabase
      .from('inscription_participants')
      .select('id, nom, prenom, token_landing_page')
      .limit(5)
    
    if (error) {
      console.error('❌ Erreur:', error)
      return
    }
    
    console.log('👥 Participants disponibles:')
    participants.forEach(p => {
      console.log(`- ID: ${p.id}, Nom: ${p.nom} ${p.prenom}, Token: ${p.token_landing_page || 'AUCUN'}`)
    })
    
    if (participants.length > 0) {
      const firstId = participants[0].id
      console.log(`\n🧪 Test avec l'ID: ${firstId}`)
      
      // Tester l'API avec un vrai ID
      const response = await fetch('http://localhost:3002/api/participant-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: firstId,
          action: 'generate'
        })
      })
      
      console.log('📊 Status:', response.status)
      const responseText = await response.text()
      console.log('📋 Response:', responseText)
      
      if (response.ok) {
        console.log('✅ SUCCÈS! L\'API fonctionne maintenant!')
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error.message)
  }
}

getRealParticipantId()