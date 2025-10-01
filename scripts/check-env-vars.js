#!/usr/bin/env node

/**
 * Script de vérification des variables d'environnement requises
 * À exécuter avant le déploiement pour s'assurer que toutes les variables sont définies
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const optionalEnvVars = [
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_PUBLIC_BASE_URL',
  'BREVO_API_KEY',
  'MAILERSEND_API_TOKEN'
]

console.log('🔍 Vérification des variables d\'environnement...\n')

let hasError = false

// Vérification des variables requises
console.log('📋 Variables requises:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: MANQUANT`)
    hasError = true
  } else {
    const displayValue = varName.includes('KEY') || varName.includes('TOKEN') 
      ? `${value.substring(0, 8)}...` 
      : value
    console.log(`✅ ${varName}: ${displayValue}`)
  }
})

// Vérification des variables optionnelles
console.log('\n📋 Variables optionnelles:')
optionalEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`⚠️  ${varName}: non défini`)
  } else {
    const displayValue = varName.includes('KEY') || varName.includes('TOKEN') 
      ? `${value.substring(0, 8)}...` 
      : value
    console.log(`✅ ${varName}: ${displayValue}`)
  }
})

console.log('\n' + '='.repeat(50))

if (hasError) {
  console.log('❌ Erreur: Des variables d\'environnement requises sont manquantes!')
  console.log('\n📖 Pour configurer ces variables sur Vercel:')
  console.log('1. Allez sur https://vercel.com/dashboard')
  console.log('2. Sélectionnez votre projet')
  console.log('3. Allez dans Settings > Environment Variables')
  console.log('4. Ajoutez les variables manquantes')
  console.log('5. Redéployez votre application')
  
  console.log('\n🔐 Variables sensibles requises:')
  console.log('- SUPABASE_SERVICE_ROLE_KEY: Clé de service Supabase (trouvable dans Settings > API)')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY: Clé publique Supabase (trouvable dans Settings > API)')
  
  process.exit(1)
} else {
  console.log('✅ Toutes les variables requises sont définies!')
  process.exit(0)
}