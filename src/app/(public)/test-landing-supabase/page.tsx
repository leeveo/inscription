import { Suspense } from 'react'

// Version simplifiée de la landing page pour identifier le point de crash
// Ajout progressif des fonctions jusqu'à identifier celle qui pose problème

async function getBasicEventData() {
  // Test 1: Vérifier si on peut importer supabaseServer
  try {
    console.log('🧪 Test 1: Import supabaseServer...')
    const { supabaseServer } = await import('@/lib/supabase/server')
    console.log('✅ Import OK')
    
    // Test 2: Créer une instance Supabase
    console.log('🧪 Test 2: Création instance Supabase...')
    const supabase = await supabaseServer()
    console.log('✅ Instance Supabase OK')
    
    // Test 3: Requête simple
    console.log('🧪 Test 3: Requête simple...')
    const { data, error } = await supabase
      .from('inscription_evenements')
      .select('id, nom')
      .limit(1)
    
    if (error) {
      console.log('❌ Erreur requête:', error)
      return { error: error.message }
    }
    
    console.log('✅ Requête OK, nombre d\'événements:', data?.length || 0)
    return { success: true, events: data?.length || 0 }
    
  } catch (error: any) {
    console.log('❌ Crash dans getBasicEventData:', error.message)
    return { error: error.message, stack: error.stack }
  }
}

export default async function TestLandingPageWithSupabase() {
  console.log('🚀 Début du rendu TestLandingPageWithSupabase')
  
  // Appel progressif pour identifier où ça crash
  const result = await getBasicEventData()
  
  console.log('📋 Résultat:', result)
  
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🧪 Test Landing Page avec Supabase</h1>
        
        <div style={{ 
          backgroundColor: result.error ? '#ffe6e6' : '#e6ffe6', 
          padding: '15px',
          border: `1px solid ${result.error ? '#ff0000' : '#00ff00'}`,
          marginBottom: '20px'
        }}>
          <h3>{result.error ? '❌ Erreur détectée' : '✅ Test réussi'}</h3>
          
          {result.error ? (
            <div>
              <p><strong>Message:</strong> {result.error}</p>
              {result.stack && (
                <details>
                  <summary>Stack trace</summary>
                  <pre style={{ fontSize: '10px', overflow: 'auto' }}>{result.stack}</pre>
                </details>
              )}
            </div>
          ) : (
            <p>Nombre d'événements dans la base: {result.events}</p>
          )}
        </div>
        
        <h2>🔍 Diagnostic :</h2>
        <ul>
          <li>✅ Page se charge (pas de crash de routing)</li>
          <li>{result.error ? '❌' : '✅'} Connexion Supabase</li>
          <li>{result.error ? '❌' : '✅'} Requête base de données</li>
        </ul>
        
        <p style={{ color: '#666', fontSize: '12px', marginTop: '30px' }}>
          URL: /test-landing-supabase - À supprimer après diagnostic
        </p>
      </div>
    </Suspense>
  )
}