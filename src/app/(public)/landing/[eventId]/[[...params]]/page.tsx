import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import ClientLandingWrapper from '@/components/ClientLandingWrapper'
import ClientFormBuilderWrapper from '@/components/ClientFormBuilderWrapper'

// Force dynamic rendering pour éviter les erreurs 500 en production
// Ces pages doivent être rendues à la demande car elles dépendent de tokens dynamiques
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

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
  console.log('=== Landing Page ===')
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams || {}
  const { eventId } = resolvedParams
  console.log('eventId:', eventId)
  console.log('resolvedSearchParams:', resolvedSearchParams)

  // Extraire le token des paramètres optionnels
  const token = resolvedParams.params?.[0] || null
  console.log('token:', token)

  // Récupération des données de l'événement
  const event = await getEventData(eventId)
  console.log('event.registration_form_builder_id:', event.registration_form_builder_id)

  // Récupération des données du participant si un token est fourni
  let participantData = null
  if (token) {
    participantData = await getParticipantData(token, eventId)
  }

  // Vérifier si on utilise le formBuilder (via URL ou événement)
  const formBuilderIdFromUrl = resolvedSearchParams.formBuilder
  const useFormBuilder = formBuilderIdFromUrl || event.registration_form_builder_id
  console.log('formBuilderIdFromUrl:', formBuilderIdFromUrl)
  console.log('useFormBuilder:', useFormBuilder)

  // Forcer l'utilisation du form builder si disponible
  if (useFormBuilder) {
    // Mode Form Builder
    const formBuilder = await getRegistrationFormBuilder(useFormBuilder)

    if (formBuilder) {
      return (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <ClientFormBuilderWrapper
            formTree={JSON.stringify(formBuilder.tree)}
            eventId={eventId}
            eventName={event.nom}
            eventDescription={event.description}
            participantData={participantData}
            token={token}
          />
        </Suspense>
      )
    } else {
      // Si le form builder n'existe pas, afficher une erreur
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">❌ Formulaire non trouvé</div>
            <p className="text-gray-600 mb-4">Le formulaire d'inscription sélectionné n'existe pas.</p>
            <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Retour à l'accueil
            </a>
          </div>
        </div>
      )
    }
  }

  // Mode Template classique (rétrocompatibilité)
  const config = await getLandingPageConfig(eventId)

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

// Ne pas générer de paramètres statiques
// Cette fonction est supprimée car nous utilisons dynamic = 'force-dynamic'

// Métadonnées dynamiques
export async function generateMetadata({ params }: PageProps) {
  try {
    const resolvedParams = await params

    return {
      title: 'Formulaire d\'inscription',
      description: 'Remplissez le formulaire d\'inscription pour participer à l\'événement',
      openGraph: {
        title: 'Formulaire d\'inscription',
        description: 'Remplissez le formulaire d\'inscription pour participer à l\'événement',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Formulaire d\'inscription',
        description: 'Remplissez le formulaire d\'inscription pour participer à l\'événement',
      },
    }
  } catch {
    return {
      title: 'Formulaire d\'inscription',
      description: 'Remplissez le formulaire d\'inscription pour participer à l\'événement',
    }
  }
}