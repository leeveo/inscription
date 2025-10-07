import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BuilderRenderer from '@/components/builder/BuilderRenderer'

interface PreviewPageProps {
  params: Promise<{
    pageId: string
  }>
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { pageId } = await params

  const supabase = await supabaseServer()

  // Charger la page
  const { data: page, error } = await supabase
    .from('builder_pages')
    .select('*')
    .eq('id', pageId)
    .single()

  if (error || !page) {
    console.error('Error loading page for preview:', error)
    notFound()
  }

  // Si la page est liée à un événement, charger les données
  let eventData = null
  if (page.event_id) {
    try {
      const { data: eventResult, error: eventError } = await supabase
        .rpc('get_event_data_for_builder', { event_uuid: page.event_id })

      if (eventError) {
        console.error('Error calling get_event_data_for_builder:', eventError)
      } else {
        console.log('Event data loaded successfully:', eventResult)
        eventData = eventResult
      }
    } catch (error) {
      console.error('Error loading event data:', error)
    }
  }

  console.log('Preview page - event_id:', page.event_id)
  console.log('Preview page - eventData:', eventData)

  // Pour l'instant, considérer toutes les pages comme des landing pages
  const pageType = 'landing_page'
  const isRegistrationForm = false
  const typeIcon = '👁️'
  const typeTitle = 'Mode Prévisualisation'

  return (
    <div className="min-h-screen bg-white">
      {/* Header de prévisualisation */}
      <div className={`${isRegistrationForm ? 'bg-green-600' : 'bg-blue-600'} text-white px-6 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <span className="text-xl">{typeIcon}</span>
          <div>
            <h1 className="font-bold">{typeTitle}</h1>
            <p className="text-sm opacity-90">{page.name}</p>
            <p className="text-xs opacity-75">
              {isRegistrationForm ? 'Formulaire d\'inscription' : 'Landing page'}
            </p>
          </div>
        </div>
        <a
          href={`/admin/builder/${pageId}`}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
        >
          ← Retour à l'éditeur
        </a>
      </div>

      {/* Contenu de la page */}
      <BuilderRenderer
        schema={page.tree || page.schema || []}
        eventId={page.event_id}
        eventData={eventData}
        mode="preview"
      />
    </div>
  )
}
