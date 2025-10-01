/**
 * Script pour obtenir et tester la clé service role Supabase
 * 
 * Instructions:
 * 1. Allez sur https://supabase.com/dashboard/project/gyohqmahwntkmebayeej/settings/api
 * 2. Copiez la "service_role" key (pas la anon/public key)
 * 3. Elle devrait commencer par "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." 
 * 4. Et contenir "service_role" dans le payload (pas "anon")
 * 
 * Pour vérifier le contenu d'un JWT token:
 * - Allez sur https://jwt.io
 * - Collez votre token
 * - Vérifiez que "role" est "service_role" (pas "anon")
 */

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Testeur de clé Supabase
function testSupabaseKey() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔍 Test de la configuration Supabase...\n')
    
    // Vérifier les variables
    console.log('URL:', url ? '✅ Défini' : '❌ Manquant')
    console.log('Service Key:', serviceKey ? '✅ Défini' : '❌ Manquant')
    
    if (!url || !serviceKey) {
        console.log('\n❌ Variables manquantes!')
        return false
    }
    
    // Analyser le token JWT
    try {
        const parts = serviceKey.split('.')
        if (parts.length !== 3) {
            console.log('\n❌ Format JWT invalide (doit avoir 3 parties séparées par des points)')
            return false
        }
        
        // Décoder le payload
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        console.log('\n📋 Contenu du token:')
        console.log('- Role:', payload.role)
        console.log('- Ref:', payload.ref)
        console.log('- Iss:', payload.iss)
        
        if (payload.role !== 'service_role') {
            console.log('\n❌ ERREUR: Ce token a le rôle "' + payload.role + '" au lieu de "service_role"')
            console.log('📖 Vous devez utiliser la clé "service_role" depuis le dashboard Supabase')
            return false
        }
        
        if (payload.ref !== 'gyohqmahwntkmebayeej') {
            console.log('\n⚠️  ATTENTION: Ce token est pour le projet "' + payload.ref + '" au lieu de "gyohqmahwntkmebayeej"')
        }
        
        console.log('\n✅ Token valide!')
        
    } catch (error) {
        console.log('\n❌ Erreur lors de l\'analyse du token:', error.message)
        return false
    }
    
    // Tester la connexion
    try {
        const supabase = createClient(url, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })
        
        console.log('\n🔗 Test de connexion Supabase...')
        
        // Test simple: lister les tables (nécessite service_role)
        supabase
            .from('inscription_participants')
            .select('count', { count: 'exact', head: true })
            .then(({ count, error }) => {
                if (error) {
                    console.log('❌ Erreur de connexion:', error.message)
                } else {
                    console.log('✅ Connexion réussie! Nombre de participants:', count)
                }
            })
            .catch(err => {
                console.log('❌ Erreur:', err.message)
            })
            
    } catch (error) {
        console.log('\n❌ Erreur de création du client:', error.message)
        return false
    }
    
    return true
}

// Exporter pour utilisation dans d'autres scripts
if (require.main === module) {
    testSupabaseKey()
}

module.exports = { testSupabaseKey }