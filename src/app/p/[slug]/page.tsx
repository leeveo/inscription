import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
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

  // Récupérer les headers pour détecter si c'est une requête proxy
  const requestHeaders = headers()
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const originalHost = requestHeaders.get('x-original-host')
  const isProxyRequest = !!(forwardedHost || originalHost)

  console.log(`🌐 Page request: slug=${slug}, isProxy=${isProxyRequest}, host=${forwardedHost || originalHost || 'direct'}`)

  let page = null
  let error = null

  // Si c'est une requête proxy, essayer de trouver la page par domaine
  if (isProxyRequest) {
    const domain = (forwardedHost || originalHost)?.replace(/^www\./, '')

    if (domain) {
      console.log(`🔍 Looking for page by domain: ${domain}`)

      // Chercher le domaine dans builder_domains
      const { data: domainRecord } = await supabase
        .from('builder_domains')
        .select('site_id')
        .eq('host', domain)
        .single()

      if (domainRecord) {
        // Chercher la page publiée pour ce site
        const { data: domainPage, error: domainError } = await supabase
          .from('builder_pages')
          .select('*')
          .eq('site_id', domainRecord.site_id)
          .eq('status', 'published')
          .single()

        if (!domainError && domainPage) {
          page = domainPage
          console.log(`✅ Found page by domain: ${domain} -> ${page.name} (${page.slug})`)
        }
      }
    }
  }

  // Si aucune page trouvée par domaine, essayer par slug (méthode normale)
  if (!page) {
    const { data: slugPage, error: slugError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    page = slugPage
    error = slugError
  }

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
