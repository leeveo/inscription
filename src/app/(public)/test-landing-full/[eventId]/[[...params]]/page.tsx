import { Suspense } from 'react'
import { supabaseServer } from '@/lib/supabase/server'

// Test progressif de la landing page pour identifier le crash exact

interface PageProps {
  params: Promise<{
    eventId: string
    params?: string[]
  }>
  searchParams?: Promise<{
    template?: string
    preview?: string
    colors?: string
  }>
}

// Copie exacte de getEventData pour tester
async function getEventData(eventId: string) {
  console.log('🧪 Test getEventData avec eventId:', eventId)
  const supabase = await supabaseServer()
  
  const { data: event, error } = await supabase
    .from('inscription_evenements')
    .select('*')
    .eq('id', eventId)
    .single()

  console.log('📋 Résultat getEventData:', { event: event?.nom, error: error?.message })

  if (error || !event) {
    console.log('❌ Event non trouvé, calling notFound()')
    // Temporairement, ne pas appeler notFound() pour voir si c'est ça le problème
    throw new Error(`Event not found: ${eventId}`)
  }

  return event
}

// Copie exacte de getLandingPageConfig pour tester
async function getLandingPageConfig(eventId: string) {
  console.log('🧪 Test getLandingPageConfig avec eventId:', eventId)
  const supabase = await supabaseServer()
  
  const { data: config } = await supabase
    .from('landing_page_configs')
    .select('*')
    .eq('event_id', eventId)
    .single()

  console.log('📋 Résultat getLandingPageConfig:', { templateId: config?.template_id })

  // Configuration par défaut si aucune configuration n'est trouvée
  return config || {
    template_id: 'modern-gradient',
    customization: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#F8FAFC',
      heroTitle: '',
      heroSubtitle: '',
      ctaButtonText: 'S\'inscrire maintenant',
      logoUrl: '',
      backgroundImage: '',
      customCSS: ''
    }
  }
}

// Copie exacte de getParticipantData pour tester
async function getParticipantData(token: string, eventId: string) {
  console.log('🧪 Test getParticipantData avec token:', token.substring(0, 10) + '...')
  try {
    const supabase = await supabaseServer()
    
    const { data: participant, error } = await supabase
      .from('inscription_participants')
      .select(`
        id,
        nom,
        prenom,
        email,
        telephone,
        profession,
        date_naissance,
        url_linkedin,
        url_facebook,
        url_twitter,
        url_instagram,
        evenement_id,
        token_landing_page
      `)
      .eq('token_landing_page', token)
      .single()

    console.log('📋 Résultat getParticipantData:', { 
      participant: participant ? `${participant.nom} ${participant.prenom}` : 'null', 
      error: error?.message 
    })

    if (error || !participant) {
      console.log('⚠️ Participant non trouvé, retournant null')
      return null
    }

    // Vérifier que l'eventId correspond (sécurité)
    if (eventId && participant.evenement_id !== eventId) {
      console.log('❌ Event ID mismatch:', participant.evenement_id, 'vs', eventId)
      return null
    }

    console.log('✅ Participant trouvé et validé')
    return participant
    
  } catch (error: any) {
    console.error('💥 Erreur dans getParticipantData:', error.message)
    return null
  }
}

export default async function TestLandingPageFull({ params, searchParams }: PageProps) {
  console.log('🚀 Début du rendu TestLandingPageFull')
  
  try {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams || {}
    const { eventId } = resolvedParams
    
    console.log('📋 Paramètres reçus:', { eventId, hasSearchParams: !!resolvedSearchParams })
    
    // Extraire le token des paramètres optionnels
    const token = resolvedParams.params?.[0] || null
    console.log('🎫 Token extrait:', token?.substring(0, 10) + '...' || 'AUCUN')
    
    // Test étape par étape
    console.log('=== ÉTAPE 1: getEventData ===')
    const event = await getEventData(eventId)
    
    console.log('=== ÉTAPE 2: getLandingPageConfig ===')
    const config = await getLandingPageConfig(eventId)
    
    console.log('=== ÉTAPE 3: getParticipantData ===')
    let participantData = null
    if (token) {
      participantData = await getParticipantData(token, eventId)
    }
    
    console.log('✅ Toutes les étapes terminées avec succès!')
    
    return (
      <Suspense fallback={<div>Chargement...</div>}>
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>🧪 Test Landing Page Complète</h1>
          
          <div style={{ backgroundColor: '#e6ffe6', padding: '15px', border: '1px solid #00ff00', marginBottom: '20px' }}>
            <h3>✅ Test réussi - Toutes les fonctions OK</h3>
          </div>
          
          <h2>📊 Résultats :</h2>
          <ul>
            <li><strong>Événement :</strong> {event.nom}</li>
            <li><strong>Template :</strong> {config.template_id}</li>
            <li><strong>Participant :</strong> {participantData ? `${participantData.nom} ${participantData.prenom}` : 'Aucun'}</li>
          </ul>
          
          <p style={{ color: '#666', fontSize: '12px', marginTop: '30px' }}>
            URL: /test-landing-full - Si cette page se charge, le problème est ailleurs !
          </p>
        </div>
      </Suspense>
    )
    
  } catch (error: any) {
    console.error('💥 CRASH dans TestLandingPageFull:', error.message)
    
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>❌ Test Landing Page - Erreur Détectée</h1>
        
        <div style={{ backgroundColor: '#ffe6e6', padding: '15px', border: '1px solid #ff0000', marginBottom: '20px' }}>
          <h3>💥 Crash identifié !</h3>
          <p><strong>Message :</strong> {error.message}</p>
          <details>
            <summary>Stack trace</summary>
            <pre style={{ fontSize: '10px', overflow: 'auto' }}>{error.stack}</pre>
          </details>
        </div>
      </div>
    )
  }
}