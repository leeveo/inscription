'use client'

import { useState } from 'react'
import { LandingPageConfig } from '@/types'
import ModernGradientTemplate from '@/components/landing-templates/ModernGradientTemplate'
import MinimalCleanTemplate from '@/components/landing-templates/MinimalCleanTemplate'
import FullscreenVideoTemplate from '@/components/landing-templates/FullscreenVideoTemplate'
import GlassmorphismTemplate from '@/components/landing-templates/GlassmorphismTemplate'
import ClassicBusinessTemplate from '@/components/landing-templates/ClassicBusinessTemplate'

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
