// Vérifier les événements existants
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkEvents() {
  try {
    console.log('🏷️  Vérification des événements existants...\n')
    
    const { data: events, error } = await supabase
      .from('inscription_evenements')
      .select('id, nom')
    
    if (error) {
      console.log('❌ Erreur:', error.message)
      return
    }
    
    console.log(`✅ ${events.length} événement(s) trouvé(s):\n`)
    events.forEach(e => {
      console.log(`📅 ${e.nom}`)
      console.log(`   ID: ${e.id}\n`)
    })
    
    // Vérifier l'ID spécifique qui pose problème
    const problematicId = '40937bdf-97e9-4ec1-9d9b-003eab31ec70'
    const eventExists = events.some(e => e.id === problematicId)
    
    console.log('🔍 Vérification ID problématique:')
    console.log(`   ID testé: ${problematicId}`)
    console.log(`   Existe: ${eventExists ? '✅ OUI' : '❌ NON'}`)
    
    if (!eventExists) {
      console.log('\n💡 SOLUTION:')
      console.log('L\'eventId dans l\'URL n\'existe pas dans la base !')
      console.log('Utilisez un de ces URLs valides:')
      events.forEach(e => {
        console.log(`📎 https://admin.waivent.app/landing/${e.id}/[TOKEN]`)
      })
    }
    
  } catch (error) {
    console.log('💥 Erreur:', error.message)
  }
}

checkEvents()