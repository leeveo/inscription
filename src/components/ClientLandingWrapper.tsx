'use client'

import { useState } from 'react'
import { LandingPageConfig } from '@/types'
import ModernGradientTemplate from '@/components/landing-templates/ModernGradientTemplate'
import MinimalCleanTemplate from '@/components/landing-templates/MinimalCleanTemplate'
import FullscreenVideoTemplate from '@/components/landing-templates/FullscreenVideoTemplate'
import GlassmorphismTemplate from '@/components/landing-templates/GlassmorphismTemplate'
import ClassicBusinessTemplate from '@/components/landing-templates/ClassicBusinessTemplate'
import Parallax3DTemplate from '@/components/landing-templates/Parallax3DTemplate'
import ConferenceProTemplate from '@/components/landing-templates/ConferenceProTemplate'
import CreativeEventTemplate from '@/components/landing-templates/CreativeEventTemplate'
import OnepageScrollTemplate from '@/components/landing-templates/OnepageScrollTemplate'
import NeomorphismTemplate from '@/components/landing-templates/NeomorphismTemplate'
import TechStartupTemplate from '@/components/landing-templates/TechStartupTemplate'
import ElegantGalaTemplate from '@/components/landing-templates/ElegantGalaTemplate'
import FestivalFunTemplate from '@/components/landing-templates/FestivalFunTemplate'
import WorkshopLearningTemplate from '@/components/landing-templates/WorkshopLearningTemplate'

interface ClientLandingWrapperProps {
  templateId: string
  customization: any
  event: any
  participantData: any
  eventId: string
  token: string | null
}

export default function ClientLandingWrapper({
  templateId,
  customization,
  event,
  participantData,
  eventId,
  token
}: ClientLandingWrapperProps) {
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true)
  }

  const config: LandingPageConfig = {
    templateId,
    customization
  }

  // Render the appropriate template component
  switch (templateId) {
    case 'modern-gradient':
      return (
        <ModernGradientTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'minimal-clean':
      return (
        <MinimalCleanTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'fullscreen-video':
      return (
        <FullscreenVideoTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'glassmorphism':
      return (
        <GlassmorphismTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'classic-business':
      return (
        <ClassicBusinessTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'parallax-3d':
      return (
        <Parallax3DTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'conference-pro':
      return (
        <ConferenceProTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'creative-event':
      return (
        <CreativeEventTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'onepage-scroll':
      return (
        <OnepageScrollTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'neomorphism':
      return (
        <NeomorphismTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'tech-startup':
      return (
        <TechStartupTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'elegant-gala':
      return (
        <ElegantGalaTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'festival-fun':
      return (
        <FestivalFunTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    case 'workshop-learning':
      return (
        <WorkshopLearningTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )

    default:
      // Fallback to modern-gradient template for unknown templates
      return (
        <ModernGradientTemplate
          event={event}
          config={config}
          onRegistrationSuccess={handleRegistrationSuccess}
          registrationSuccess={registrationSuccess}
          participantData={participantData}
          token={token}
        />
      )
  }
}
