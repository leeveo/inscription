'use client'

import { useMemo } from 'react'
import { Editor, Frame } from '@craftjs/core'
import { EventDataProvider } from '@/contexts/EventDataContext'
import { BuilderModeProvider } from '@/contexts/BuilderModeContext'
import { Container } from './blocks/Container'
import { TextBlock } from './blocks/Text'
import { ButtonBlock } from './blocks/Button'
import { SimpleText } from './blocks/SimpleText'
import { SimpleButton } from './blocks/SimpleButton'
import { Hero } from './blocks/Hero'
import { Countdown } from './blocks/Countdown'
import { Agenda } from './blocks/Agenda'
import { Speakers } from './blocks/Speakers'
import { Map } from './blocks/Map'
import { FAQ } from './blocks/FAQ'
import { Gallery } from './blocks/Gallery'
import { ImageHero } from './blocks/ImageHero'
import { Footer } from './blocks/Footer'
import { EventDetails } from './blocks/EventDetails'
import { RegistrationForm } from './blocks/RegistrationForm'
import { DesignForm } from './blocks/DesignForm'
import { CreativeForm } from './blocks/CreativeForm'
import { CorporateForm } from './blocks/CorporateForm'
import { TechForm } from './blocks/TechForm'
import { SessionWithEventData } from './blocks/SessionWithEventData'
import { TwoColumnSection } from './blocks/TwoColumnSection'
import { ParticipantInfo } from './blocks/ParticipantInfo'
import { FormulaireDynamique } from './blocks/FormulaireDynamique'

interface BuilderRendererProps {
  schema: any
  eventId?: string | null
  eventData?: any
  mode?: 'preview' | 'public'
}

export default function BuilderRenderer({
  schema,
  eventId,
  eventData,
  mode = 'public'
}: BuilderRendererProps) {

  // Parser le schema si c'est une string JSON
  let parsedSchema = schema
  if (typeof schema === 'string') {
    try {
      parsedSchema = JSON.parse(schema)
    } catch (e) {
      console.error('Erreur de parsing du schema:', e)
      parsedSchema = null
    }
  }

  console.log('BuilderRenderer - parsedSchema:', parsedSchema)
  console.log('BuilderRenderer - eventData:', eventData)

  // Si le schema est un objet CraftJS avec ROOT node (format direct Craft.js)
  if (parsedSchema && typeof parsedSchema === 'object' && parsedSchema.ROOT) {
    console.log('✅ Using Craft.js format with ROOT node');
    return (
      <EventDataProvider eventData={eventData} eventId={eventId}>
        <BuilderModeProvider mode={mode}>
          <Editor
            resolver={{
              Container,
              TextBlock,
              ButtonBlock,
              SimpleText,
              SimpleButton,
              Hero,
              EventDetails,
              Countdown,
              Agenda,
              Speakers,
              Map,
              FAQ,
              Gallery,
              ImageHero,
              Footer,
              RegistrationForm,
              DesignForm,
              CreativeForm,
              CorporateForm,
              TechForm,
              Session: SessionWithEventData,
              TwoColumnSection,
              ParticipantInfo,
              FormulaireDynamique,
            }}
            enabled={false}
          >
            <Frame data={JSON.stringify(parsedSchema)}>
              <div>Chargement...</div>
            </Frame>
          </Editor>
        </BuilderModeProvider>
      </EventDataProvider>
    )
  }

  // Si le schema est notre format CraftPage avec rootNodeId et nodes
  if (parsedSchema && typeof parsedSchema === 'object' && 
      'rootNodeId' in parsedSchema && parsedSchema.nodes && 
      typeof parsedSchema.nodes === 'object') {
    console.log('✅ Using CraftPage format, converting to Craft.js');
    console.log('🔍 CraftPage rootNodeId:', parsedSchema.rootNodeId);
    console.log('🔍 CraftPage nodes:', Object.keys(parsedSchema.nodes));
    const craftjsFormat = parsedSchema.nodes;
    return (
      <EventDataProvider eventData={eventData} eventId={eventId}>
        <BuilderModeProvider mode={mode}>
          <Editor
            resolver={{
              Container,
              TextBlock,
              ButtonBlock,
              SimpleText,
              SimpleButton,
              Hero,
              EventDetails,
              Countdown,
              Agenda,
              Speakers,
              Map,
              FAQ,
              Gallery,
              ImageHero,
              Footer,
              RegistrationForm,
              DesignForm,
              CreativeForm,
              CorporateForm,
              TechForm,
              Session: SessionWithEventData,
              TwoColumnSection,
              ParticipantInfo,
              FormulaireDynamique,
            }}
            enabled={false}
          >
            <Frame data={JSON.stringify(craftjsFormat)}>
              <div>Chargement...</div>
            </Frame>
          </Editor>
        </BuilderModeProvider>
      </EventDataProvider>
    )
  }

  // Parser le schéma et rendre les blocs (ancien format)
  const renderedBlocks = useMemo(() => {
    if (!parsedSchema || !Array.isArray(parsedSchema)) {
      return null
    }

    return parsedSchema.map((block, index) => {
      return (
        <div key={block.id || index} className="builder-block">
          {renderBlock(block, eventId, eventData)}
        </div>
      )
    })
  }, [parsedSchema, eventId, eventData])

  return (
    <BuilderModeProvider mode={mode}>
      <div className="builder-renderer">
        {renderedBlocks || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Page vide
              </h2>
              <p className="text-gray-600">
                Cette page n'a pas encore de contenu.
              </p>
            </div>
          </div>
        )}
      </div>
    </BuilderModeProvider>
  )
}

// Fonction helper pour rendre un bloc
function renderBlock(block: any, eventId?: string | null, eventData?: any) {
  const { type, props, children } = block

  switch (type) {
    case 'container':
      return (
        <div
          className="container mx-auto px-4"
          style={props?.style}
        >
          {children?.map((child: any, i: number) => (
            <div key={i}>{renderBlock(child, eventId, eventData)}</div>
          ))}
        </div>
      )

    case 'section':
      return (
        <section
          className="py-12"
          style={props?.style}
        >
          {children?.map((child: any, i: number) => (
            <div key={i}>{renderBlock(child, eventId, eventData)}</div>
          ))}
        </section>
      )

    case 'heading':
      const HeadingTag = props?.level || 'h2'
      return (
        <HeadingTag
          className={`font-bold ${getHeadingClass(props?.level)}`}
          style={props?.style}
        >
          {props?.text || children}
        </HeadingTag>
      )

    case 'text':
    case 'paragraph':
      return (
        <p
          className="text-gray-700"
          style={props?.style}
        >
          {props?.text || children}
        </p>
      )

    case 'button':
      return (
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          style={props?.style}
          onClick={() => props?.onClick?.()}
        >
          {props?.text || children || 'Button'}
        </button>
      )

    case 'image':
      return (
        <img
          src={props?.src || props?.url}
          alt={props?.alt || ''}
          className="max-w-full h-auto"
          style={props?.style}
        />
      )

    case 'hero':
      return (
        <div
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4"
          style={props?.style}
        >
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {props?.title || eventData?.event?.nom || 'Titre'}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {props?.subtitle || eventData?.event?.description?.substring(0, 200) || 'Sous-titre'}
            </p>
            {props?.ctaText && (
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {props.ctaText}
              </button>
            )}
          </div>
        </div>
      )

    case 'event-title':
      return (
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            {eventData?.event?.nom || props?.text || 'Titre de l\'événement'}
          </h1>
        </div>
      )

    case 'event-description':
      return (
        <div
          className="prose prose-lg max-w-none py-8"
          dangerouslySetInnerHTML={{
            __html: eventData?.event?.description || props?.text || '<p>Description de l\'événement</p>'
          }}
        />
      )

    case 'event-logo':
      if (!eventData?.event?.logoUrl && !props?.src) return null
      return (
        <div className="flex justify-center py-8">
          <img
            src={eventData?.event?.logoUrl || props?.src}
            alt={eventData?.event?.nom || 'Logo'}
            className="w-48 h-48 object-contain"
            style={props?.style}
          />
        </div>
      )

    case 'agenda':
    case 'sessions':
      if (!eventData?.sessions?.length) return null
      return (
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Programme</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {eventData.sessions.map((session: any, i: number) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                    {session.speaker && (
                      <p className="text-sm text-gray-600 mt-1">Par {session.speaker}</p>
                    )}
                    {session.description && (
                      <p className="text-gray-700 mt-2">{session.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-blue-600">
                      {new Date(session.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.startTime} - {session.endTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'speakers':
    case 'intervenants':
      if (!eventData?.speakers?.length) return null
      return (
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Intervenants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {eventData.speakers.map((speaker: any, i: number) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {speaker.photoUrl ? (
                  <img
                    src={speaker.photoUrl}
                    alt={speaker.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{speaker.name}</h3>
                  {speaker.title && (
                    <p className="text-blue-600 font-medium">{speaker.title}</p>
                  )}
                  {speaker.company && (
                    <p className="text-gray-600 text-sm">{speaker.company}</p>
                  )}
                  {speaker.bio && (
                    <p className="text-gray-700 mt-3 text-sm line-clamp-3">{speaker.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      // Rendu par défaut pour les types non reconnus
      return (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded">
          <p className="text-sm text-gray-600">
            Bloc de type "{type}" (non implémenté)
          </p>
          {props?.text && <p className="mt-2">{props.text}</p>}
        </div>
      )
  }
}

// Helper pour les classes de heading
function getHeadingClass(level?: string) {
  switch (level) {
    case 'h1':
      return 'text-4xl md:text-6xl'
    case 'h2':
      return 'text-3xl md:text-4xl'
    case 'h3':
      return 'text-2xl md:text-3xl'
    case 'h4':
      return 'text-xl md:text-2xl'
    case 'h5':
      return 'text-lg md:text-xl'
    case 'h6':
      return 'text-base md:text-lg'
    default:
      return 'text-2xl'
  }
}
