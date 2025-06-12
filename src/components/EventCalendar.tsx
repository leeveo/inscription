'use client'

import { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fr'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useRouter } from 'next/navigation'

// Set up localizer for French dates
moment.locale('fr')
const localizer = momentLocalizer(moment)

type Event = {
  id: number
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  type_participation?: 'présentiel' | 'virtuel' | 'hybride'
  statut?: 'brouillon' | 'publié' | 'archivé'
}

interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: unknown
}

interface EventCalendarProps {
  events: Event[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const router = useRouter()

  // Convert events to calendar format
  useEffect(() => {
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.nom,
      start: new Date(event.date_debut),
      end: new Date(event.date_fin),
      resource: event
    }))
    
    setCalendarEvents(formattedEvents)
  }, [events])

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/admin/evenements/${event.id}`)
  }

  // Custom styling for events based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    const resource = event.resource || {}
    let backgroundColor = '#3788d8' // Default blue
    
    if (resource.statut === 'publié') {
      backgroundColor = '#10b981' // Green
    } else if (resource.statut === 'archivé') {
      backgroundColor = '#6b7280' // Gray
    } else if (resource.statut === 'brouillon') {
      backgroundColor = '#f59e0b' // Yellow
    }
    
    // Different color based on type
    if (resource.type_participation === 'virtuel') {
      backgroundColor = '#8b5cf6' // Purple
    } else if (resource.type_participation === 'hybride') {
      backgroundColor = '#ec4899' // Pink
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block'
      }
    }
  }

  return (
    <div className="h-full">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          date: "Date",
          time: "Heure",
          event: "Événement",
          noEventsInRange: "Aucun événement dans cette période"
        }}
      />
    </div>
  )
}
