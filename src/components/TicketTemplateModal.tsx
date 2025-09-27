'use client'

import { useState } from 'react'
import TicketTemplateManager from './TicketTemplateManager'
import Modal from './Modal'

type TicketTemplateModalProps = {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export default function TicketTemplateModal({ eventId, isOpen, onClose }: TicketTemplateModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestion des modèles de tickets"
      size="3xl"
    >
      <TicketTemplateManager
        eventId={eventId}
        onClose={onClose}
      />
    </Modal>
  )
}