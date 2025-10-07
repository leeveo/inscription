import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BuilderRenderer from '@/components/builder/BuilderRenderer'
import { Metadata } from 'next'

interface PublicPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await supabaseServer()

  const { data: page } = await supabase
    .from('builder_pages')
    .select('name, event_id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!page) {
    return {
      title: 'Page non trouvée',
    }
  }

  // Si la page est liée à un événement, charger ses données pour le SEO
  if (page.event_id) {
    const { data: eventData } = await supabase
      .rpc('get_event_data_for_builder', { event_uuid: page.event_id })

    if (eventData?.event) {
      return {
        title: eventData.event.nom || page.name,
        description: eventData.event.description?.substring(0, 160) || `Page de l'événement ${eventData.event.nom}`,
      }
    }
  }

  return {
    title: page.name,
  }
}

export default async function PublicBuilderPage({ params }: PublicPageProps) {
  const { slug } = await params
  const supabase = await supabaseServer()

  // Récupérer la page par son slug
  // D'abord essayer de trouver une page publiée avec ce slug
  let { data: page, error } = await supabase
    .from('builder_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published') // Seulement les pages publiées
    .order('published_at', { ascending: false }) // Prendre la plus récente
    .limit(1)
    .single()

  // Si aucune page trouvée, retourner 404
  if (error || !page) {
    console.error('Error loading published page:', error)
    notFound()
  }

  // Si la page est liée à un événement, charger les données
  let eventData = null
  if (page.event_id) {
    try {
      const { data: eventResult } = await supabase
        .rpc('get_event_data_for_builder', { event_uuid: page.event_id })

      eventData = eventResult
    } catch (error) {
      console.error('Error loading event data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <BuilderRenderer
        schema={page.tree || page.schema || []}
        eventId={page.event_id}
        eventData={eventData}
        mode="public"
      />
    </div>
  )
}
