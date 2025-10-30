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
  id: string | number
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  type_participation?: 'présentiel' | 'virtuel' | 'hybride'
  statut?: 'brouillon' | 'publié' | 'archivé'
}

type CalendarEvent = {
  id: string | number
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: Event
  status: string
  statut: string
  type_participation: string
}

interface EventCalendarProps {
  events: Event[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  // Convert events to calendar format
  useEffect(() => {
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.nom,
      start: new Date(event.date_debut),
      end: new Date(event.date_fin),
      resource: event,
      statut: event.statut || '', // Remplacez `status` par `statut`
      type_participation: event.type_participation || '',
      status: event.statut || '', // Ajoutez cette propriété pour respecter le type CalendarEvent
    }))

    setCalendarEvents(formattedEvents)
  }, [events])

  // Handle navigation between months/weeks/days
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/admin/evenements/${event.id}`)
  }

  // Custom styling for events based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    const resource = event.resource || {}
    let backgroundColor = '#3788d8' // Default blue
    
    if ('statut' in resource && resource.statut === 'publié') {
      backgroundColor = '#10b981' // Green
    } else if ('statut' in resource && resource.statut === 'archivé') {
      backgroundColor = '#6b7280' // Gray
    } else if ('statut' in resource && resource.statut === 'brouillon') {
      backgroundColor = '#f59e0b' // Yellow
    }
    
    if ('type_participation' in resource && resource.type_participation === 'virtuel') {
      backgroundColor = '#8b5cf6' // Purple
    } else if ('type_participation' in resource && resource.type_participation === 'hybride') {
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
      <style jsx global>{`
        /* Modern Calendar Styling */
        .rbc-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Toolbar styling */
        .rbc-toolbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .rbc-toolbar button {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .rbc-toolbar button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .rbc-toolbar button:active,
        .rbc-toolbar button.rbc-active {
          background: rgba(255, 255, 255, 0.4);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .rbc-toolbar-label {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Month view */
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .rbc-header {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
          padding: 1rem;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .rbc-day-bg {
          background: white;
          transition: background-color 0.2s;
        }

        .rbc-day-bg:hover {
          background: #f9fafb;
        }

        .rbc-today {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
        }

        .rbc-off-range-bg {
          background: #f9fafb;
        }

        .rbc-date-cell {
          padding: 0.5rem;
          text-align: right;
        }

        .rbc-button-link {
          color: #374151;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .rbc-today .rbc-button-link {
          color: #92400e;
          font-weight: 700;
        }

        /* Event styling */
        .rbc-event {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .rbc-event-label {
          font-size: 0.75rem;
        }

        .rbc-event-content {
          font-weight: 500;
        }

        /* Selected event */
        .rbc-selected {
          background-color: #2563eb !important;
        }

        /* Week/Day view */
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .rbc-time-header {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
        }

        .rbc-time-content {
          border-top: 2px solid #e5e7eb;
        }

        .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }

        /* Agenda view */
        .rbc-agenda-view {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .rbc-agenda-table {
          border: none;
        }

        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
          font-weight: 600;
          padding: 1rem;
        }

        .rbc-agenda-event-cell {
          padding: 1rem;
        }

        /* Scrollbar styling */
        .rbc-time-content::-webkit-scrollbar {
          width: 8px;
        }

        .rbc-time-content::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .rbc-time-content::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }

        .rbc-time-content::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
        onNavigate={handleNavigate}
        date={currentDate}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        selectable
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
