'use client'

import React, { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

type Participant = {
  id: number
  evenement_id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  site_web?: string
  created_at: string
  checked_in: boolean
  check_in_time?: string
}

type Event = {
  id: string
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  created_at: string
}

type Session = {
  id: string
  evenement_id: string
  titre: string
  description: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant: string
  lieu: string
  type: string
  created_at?: string
  participant_count?: number
  is_registered?: boolean
}

export default function TicketPage() {
  const pathname = usePathname()
  const participantId = pathname.split('/').pop()
  
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkInUrl, setCheckInUrl] = useState<string>('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [groupedSessions, setGroupedSessions] = useState<Record<string, Session[]>>({}); // Ajustez le type ici
  
  useEffect(() => {
    const fetchParticipantAndEvent = async () => {
      if (!participantId) return
      
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()
        
        // Fetch participant
        const { data: participantData, error: participantError } = await supabase
          .from('inscription_participants')
          .select('*')
          .eq('id', participantId)
          .single()
        
        if (participantError) throw participantError
        if (!participantData) throw new Error('Participant not found')
        
        // Add a type assertion to fix the type error
        setParticipant(participantData as unknown as Participant)
        
        // Fetch event details
        const { data: eventData, /* error */ } = await supabase
          .from('inscription_evenements')
          .select('*')
          .eq('id', (participantData as any).evenement_id as string)
          .single()
        
        // Add a two-step type assertion to fix the type error
        setEvent(eventData as unknown as Event)
        
        // if (eventError) throw eventError
        if (!eventData) throw new Error('Event not found')
        
        setEvent(eventData as unknown as Event)
        
        // Fetch sessions for this event
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('inscription_sessions')
          .select('*')
          .eq('evenement_id', (participantData as any).evenement_id)
          .order('date')
          .order('heure_debut')
        
        if (sessionsError) throw sessionsError
        
        // Fetch registrations for this participant
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('inscription_session_participants')
          .select('session_id')
          .eq('participant_id', participantId)
        
        if (registrationsError) throw registrationsError
        
        // Get registered session IDs
        const registeredSessionIds = (registrationsData as any[])?.map((reg: any) => reg.session_id) || []
        
        // Fetch participant count for each session
        const sessionsWithRegistrations = await Promise.all(
          (sessionsData as any[])?.map(async (session: any) => {
            const { count, /* error */ } = await supabase
              .from('inscription_session_participants')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)
            
            return {
              ...session,
              participant_count: count || 0,
              is_registered: registeredSessionIds.includes(session.id)
            }
          }) || []
        )
        
        // Assurez-vous que chaque session inclut les propriétés requises par le type Session
        const validatedSessions = sessionsWithRegistrations.map(session => ({
          id: 'id' in session ? String(session.id) : '', // Vérifiez si la propriété existe
          evenement_id: 'evenement_id' in session ? String(session.evenement_id) : '',
          titre: 'titre' in session ? String(session.titre) : '',
          description: 'description' in session ? String(session.description) : '',
          date: 'date' in session ? String(session.date) : '',
          heure_debut: 'heure_debut' in session ? String(session.heure_debut) : '',
          heure_fin: 'heure_fin' in session ? String(session.heure_fin) : '',
          participant_count: session.participant_count || 0,
          is_registered: session.is_registered || false,
          intervenant: 'intervenant' in session ? String(session.intervenant) : '',
          lieu: 'lieu' in session ? String(session.lieu) : '',
          type: 'type' in session ? String(session.type) : '',
        }));

        setSessions(validatedSessions)
        
        // Group sessions by date
        const grouped = validatedSessions.reduce((acc: Record<string, Session[]>, session) => {
          const date = new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        
          if (!acc[date]) {
            acc[date] = []; // Initialisez avec un tableau vide de type Session[]
          }
          acc[date].push(session); // Ajoutez la session au tableau
          return acc;
        }, {})
        
        setGroupedSessions(grouped) // Le type est maintenant compatible
        
        // Generate check-in URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
        const checkIn = `${baseUrl}/admin/check-in/${(participantData as any).evenement_id}/${participantId}`
        setCheckInUrl(checkIn)
        
      } catch (err: Error | unknown) {
        console.error('Error fetching data:', err)
        // Use type narrowing for safer error handling
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchParticipantAndEvent()
  }, [participantId])
  
  const handleSessionRegistration = async (sessionId: string, isRegistered: boolean) => {
    if (!participant) return
    
    try {
      setIsRegistering(true)
      const supabase = supabaseBrowser()
      
      if (isRegistered) {
        // Unregister from session
        const { error } = await supabase
          .from('inscription_session_participants')
          .delete()
          .eq('session_id', sessionId)
          .eq('participant_id', Number(participant.id)) // Convertir en nombre car participant.id est stocké comme integer
      
        if (error) throw error
      } else {
        // Register to session
        const { error } = await (supabase as any)
          .from('inscription_session_participants')
          .insert({
            session_id: sessionId,
            participant_id: Number(participant.id) // Convertir en nombre car participant.id est stocké comme integer
          })
      
        if (error) throw error
      }
      
      // Update sessions state
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              is_registered: !isRegistered,
              participant_count: isRegistered 
                ? (session.participant_count || 0) - 1 
                : (session.participant_count || 0) + 1
            } 
          : session
      ))
      
      // Update grouped sessions
      const newGroupedSessions = { ...groupedSessions }
      Object.keys(newGroupedSessions).forEach(date => {
        newGroupedSessions[date] = newGroupedSessions[date].map(session => 
          session.id === sessionId 
            ? { 
                ...session, 
                is_registered: !isRegistered,
                participant_count: isRegistered 
                  ? (session.participant_count || 0) - 1 
                  : (session.participant_count || 0) + 1
              } 
            : session
        )
      })
      setGroupedSessions(newGroupedSessions)
      
    } catch (err: unknown) {
      console.error('Error updating session registration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsRegistering(false)
    }
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getSessionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conférence':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'atelier':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pause':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'networking':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !participant || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error || 'Participant or event not found'}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 mb-8">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-xl font-bold">{event.nom}</h1>
          <p className="mt-1 text-sm opacity-90">{formatDate(event.date_debut)}</p>
          <p className="mt-1 text-sm opacity-90">{event.lieu}</p>
        </div>
        
        {/* Ticket Info */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {participant.prenom} {participant.nom}
          </h2>
          <p className="text-gray-600">{participant.email}</p>
          
          {participant.checked_in && (
            <div className="mt-4 bg-green-50 text-green-800 px-3 py-2 rounded-md text-sm font-medium">
              ✓ Checked in at {participant.check_in_time && 
                new Date(participant.check_in_time).toLocaleTimeString('fr-FR')}
            </div>
          )}
          
          {/* QR Code */}
          <div className="mt-6 flex justify-center">
            <div className="p-4 bg-white border border-gray-200 rounded-md">
              {checkInUrl ? (
                <QRCodeSVG 
                  value={checkInUrl}
                  size={250}
                  level="H" // High error correction capability
                  includeMargin={true}
                />
              ) : (
                <div className="w-[250px] h-[250px] bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">QR code unavailable</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Scannez ce QR code à l&apos;entrée de l&apos;événement</p>
          </div>
        </div>
      </div>
      
      {/* Sessions Section */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <h2 className="text-lg font-semibold">Sessions de l&apos;événement</h2>
          <p className="text-sm opacity-90">Sélectionnez les sessions auxquelles vous souhaitez participer</p>
        </div>
        
        <div className="p-4">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune session n&apos;est disponible pour cet événement.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <div key={date} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="text-md font-medium text-gray-800 mb-3 bg-gray-50 p-2 rounded">
                    {date}
                  </h3>
                  
                  <div className="space-y-3">
                    {dateSessions.map(session => (
                      <div key={session.id} className={`border rounded-md p-3 ${
                        session.is_registered 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-2 text-sm">
                                {session.heure_debut} - {session.heure_fin}
                              </span>
                              <h4 className="text-base font-medium text-gray-900">{session.titre}</h4>
                            </div>
                            
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                                {session.type}
                              </span>
                              {session.lieu && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {session.lieu}
                                </span>
                              )}
                              {session.intervenant && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {session.intervenant}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {session.participant_count || 0} participant{(session.participant_count || 0) > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {session.description && (
                              <p className="mt-1 text-xs text-gray-600">{session.description}</p>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleSessionRegistration(session.id, session.is_registered || false)}
                            disabled={isRegistering}
                            className={`px-3 py-1 text-sm rounded-md ${
                              session.is_registered
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {session.is_registered ? 'Se désinscrire' : 'S\'inscrire'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-500 mb-4">
          Ce ticket est votre preuve d&apos;inscription à l&apos;événement.
        </p>
        
        <a
          href={checkInUrl}
          download={`${participant.prenom}_${participant.nom}_ticket.png`}
          className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700"
        >
          Télécharger mon ticket
        </a>
        
        <p className="text-sm text-gray-600 mt-1">
          Partagez l&apos;événement sur les réseaux sociaux
        </p>
        
        {/* Social media share buttons (placeholders) */}
        <div className="flex justify-center gap-4 mt-2">
          <button className="px-3 py-1 text-sm rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200">
            Facebook
          </button>
          <button className="px-3 py-1 text-sm rounded-md bg-twitter-100 text-twitter-700 hover:bg-twitter-200">
            Twitter
          </button>
          <button className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200">
            Google
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 border-t border-gray-200 pt-4 text-center">
        <p className="text-sm text-gray-500">
          Pour toute question, contactez-nous à l&apos;adresse email suivante :{' '}
          <a href="mailto:support@evenement.com" className="text-blue-600 hover:underline">
            support@evenement.com
          </a>
        </p>
        
        <p className="text-sm text-gray-500 mt-2">
          © {new Date().getFullYear()} Événement Inc. Tous droits réservés.
        </p>
        
        <p className="text-sm text-gray-500 mt-2">
          L&apos;équipe organisatrice
        </p>
      </div>
    </div>
  )
}
