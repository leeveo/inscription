import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import ClientLandingWrapper from '@/components/ClientLandingWrapper'

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

async function getEventData(eventId: string) {
  const supabase = await supabaseServer()
  
  const { data: event, error } = await supabase
    .from('inscription_evenements')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    notFound()
  }

  return event
}

async function getLandingPageConfig(eventId: string) {
  const supabase = await supabaseServer()
  
  const { data: config } = await supabase
    .from('landing_page_configs')
    .select('*')
    .eq('event_id', eventId)
    .single()

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

async function getParticipantData(token: string, eventId: string) {
  try {
    console.log('=== getParticipantData (Direct Supabase) ===')
    console.log('token:', token)
    console.log('eventId:', eventId)
    
    const supabase = await supabaseServer()
    
    // Récupérer les informations du participant directement via Supabase
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

    if (error || !participant) {
      console.log('Error or no participant found:', error)
      return null
    }

    // Vérifier que l'eventId correspond (sécurité)
    if (eventId && participant.evenement_id !== eventId) {
      console.log('Event ID mismatch')
      return null
    }

    console.log('Participant data found:', participant)
    console.log('=== Fin getParticipantData ===')
    
    return participant
  } catch (error) {
    console.error('Error fetching participant data:', error)
    return null
  }
}

export default async function LandingPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams || {}
  const { eventId } = resolvedParams
  
  // Extraire le token des paramètres optionnels
  const token = resolvedParams.params?.[0] || null
  
  // Récupération des données de l'événement et de la configuration
  const [event, config] = await Promise.all([
    getEventData(eventId),
    getLandingPageConfig(eventId)
  ])

  // Récupération des données du participant si un token est fourni
  let participantData = null
  if (token) {
    participantData = await getParticipantData(token, eventId)
  }

  // Gestion des paramètres de prévisualisation
  let templateId = config.template_id
  let customization = config.customization

  // Override pour la prévisualisation
  if (resolvedSearchParams.preview === 'true') {
    if (resolvedSearchParams.template) {
      templateId = resolvedSearchParams.template
    }
    if (resolvedSearchParams.colors) {
      try {
        const previewColors = JSON.parse(decodeURIComponent(resolvedSearchParams.colors))
        customization = { ...customization, ...previewColors }
      } catch (error) {
        console.error('Error parsing preview colors:', error)
      }
    }
  }

  // Override avec le paramètre template dans l'URL
  if (resolvedSearchParams.template && !resolvedSearchParams.preview) {
    templateId = resolvedSearchParams.template
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ClientLandingWrapper
        templateId={templateId}
        customization={customization}
        event={event}
        participantData={participantData}
        eventId={eventId}
        token={token}
      />
    </Suspense>
  );
}

// Générer les paramètres statiques pour l'optimisation
export async function generateStaticParams() {
  // En production, vous pourriez vouloir générer statiquement certaines pages
  return []
}

// Métadonnées dynamiques
export async function generateMetadata({ params }: PageProps) {
  try {
    const resolvedParams = await params
    const event = await getEventData(resolvedParams.eventId)
    
    return {
      title: `${event.nom} - Inscription`,
      description: event.description || `Inscrivez-vous à ${event.nom}`,
      openGraph: {
        title: `${event.nom} - Inscription`,
        description: event.description || `Inscrivez-vous à ${event.nom}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${event.nom} - Inscription`,
        description: event.description || `Inscrivez-vous à ${event.nom}`,
      },
    }
  } catch {
    return {
      title: 'Inscription à l\'événement',
      description: 'Inscrivez-vous à cet événement',
    }
  }
}