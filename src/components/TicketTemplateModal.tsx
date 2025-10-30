'use client'

import { useState } from 'react'
import TicketTemplateWizard from './TicketTemplateWizard'

type TicketTemplateModalProps = {
  eventId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void // Nouveau callback pour notifier le succès
}

export default function TicketTemplateModal({ eventId, isOpen, onClose, onSuccess }: TicketTemplateModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
        <TicketTemplateWizard
          eventId={eventId}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  )
}
