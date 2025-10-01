// Script pour vérifier et créer la colonne token manquante
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkAndFixTokenColumn() {
  console.log('🔍 Vérification de la structure de la table inscription_participants...\n')
  
  try {
    // Tenter de sélectionner la colonne token pour voir si elle existe
    const { data, error } = await supabase
      .from('inscription_participants')
      .select('id, nom, prenom, token')
      .limit(1)
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('token')) {
        console.log('❌ PROBLÈME CONFIRMÉ: La colonne "token" n\'existe pas dans inscription_participants')
        console.log('\n📋 Solutions possibles:')
        console.log('1. Ajouter la colonne via l\'interface Supabase')
        console.log('2. Utiliser une migration SQL')
        console.log('3. Vérifier si la colonne a un autre nom')
        
        // Vérifier la structure actuelle
        console.log('\n🔍 Vérification des colonnes existantes...')
        const { data: sample } = await supabase
          .from('inscription_participants') 
          .select('*')
          .limit(1)
        
        if (sample && sample.length > 0) {
          console.log('📊 Colonnes trouvées:', Object.keys(sample[0]).join(', '))
          
          // Vérifier s'il y a une colonne similaire
          const columns = Object.keys(sample[0])
          const tokenLikeColumns = columns.filter(col => 
            col.includes('token') || col.includes('url') || col.includes('link')
          )
          
          if (tokenLikeColumns.length > 0) {
            console.log('🔍 Colonnes pouvant contenir des tokens:', tokenLikeColumns.join(', '))
          }
        }
        
        return false
      } else {
        console.error('❌ Erreur inattendue:', error)
        return false
      }
    } else {
      console.log('✅ La colonne token existe!')
      console.log('📊 Nombre de participants avec token:', data.filter(p => p.token).length)
      return true
    }
    
  } catch (err) {
    console.error('💥 Erreur:', err.message)
    return false
  }
}

checkAndFixTokenColumn()