'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type Session = {
  id: string
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant?: string
  lieu?: string
  type: string
}

type Participant = {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  profession?: string
  created_at: string
  token_landing_page?: string | null
  evenement_id: string
}

interface ParticipantDetailsModalProps {
  participant: Participant | null
  isOpen: boolean
  onClose: () => void
}

export default function ParticipantDetailsModal({ 
  participant, 
  isOpen, 
  onClose 
}: ParticipantDetailsModalProps) {
  const [participantSessions, setParticipantSessions] = useState<Session[]>([])
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && participant) {
      fetchParticipantSessions()
    }
  }, [isOpen, participant])

  const fetchParticipantSessions = async () => {
    if (!participant) return

    try {
      setIsLoading(true)
      setError(null)
      const supabase = supabaseBrowser()

      // Récupérer toutes les sessions de l'événement
      const { data: sessions, error: sessionsError } = await supabase
        .from('inscription_sessions')
        .select('*')
        .eq('evenement_id', participant.evenement_id)
        .order('date')
        .order('heure_debut')

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
        setAllSessions([])
      } else {
        const formattedSessions = (sessions || []).map(session => ({
          id: String(session.id),
          titre: String(session.titre),
          description: session.description ? String(session.description) : undefined,
          date: String(session.date),
          heure_debut: String(session.heure_debut),
          heure_fin: String(session.heure_fin),
          intervenant: session.intervenant ? String(session.intervenant) : undefined,
          lieu: session.lieu ? String(session.lieu) : undefined,
          type: String(session.type)
        }))
        setAllSessions(formattedSessions)
      }

      // Récupérer les sessions auxquelles le participant est inscrit
      const { data: participantSessionIds, error: participantSessionsError } = await supabase
        .from('inscription_session_participants')
        .select('session_id')
        .eq('participant_id', participant.id)

      if (participantSessionsError) {
        console.error('Error fetching participant sessions:', participantSessionsError)
        setParticipantSessions([])
      } else {
        // Récupérer les détails des sessions inscrites
        const sessionIds = (participantSessionIds || []).map(item => item.session_id)
        
        if (sessionIds.length > 0) {
          const { data: sessionDetails, error: sessionDetailsError } = await supabase
            .from('inscription_sessions')
            .select('*')
            .in('id', sessionIds)

          if (sessionDetailsError) {
            console.error('Error fetching session details:', sessionDetailsError)
            setParticipantSessions([])
          } else {
            const formattedParticipantSessions = (sessionDetails || []).map(session => ({
              id: String(session.id),
              titre: String(session.titre),
              description: session.description ? String(session.description) : undefined,
              date: String(session.date),
              heure_debut: String(session.heure_debut),
              heure_fin: String(session.heure_fin),
              intervenant: session.intervenant ? String(session.intervenant) : undefined,
              lieu: session.lieu ? String(session.lieu) : undefined,
              type: String(session.type)
            }))
            setParticipantSessions(formattedParticipantSessions)
          }
        } else {
          setParticipantSessions([])
        }
      }
    } catch (err) {
      console.error('Error loading participant sessions:', err)
      setError('Erreur lors du chargement des sessions du participant')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    return `${hours}h${minutes !== '00' ? minutes : ''}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSessionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conférence': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'atelier': return 'bg-green-100 border-green-300 text-green-800'
      case 'pause': return 'bg-gray-100 border-gray-300 text-gray-800'
      case 'networking': return 'bg-purple-100 border-purple-300 text-purple-800'
      default: return 'bg-indigo-100 border-indigo-300 text-indigo-800'
    }
  }

  if (!isOpen || !participant) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {participant.prenom} {participant.nom}
              </h2>
              <p className="text-gray-600 mt-1">{participant.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Informations du participant */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du participant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Nom complet :</span>
                <p className="text-gray-900">{participant.prenom} {participant.nom}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email :</span>
                <p className="text-gray-900">{participant.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Téléphone :</span>
                <p className="text-gray-900">{participant.telephone}</p>
              </div>
              {participant.profession && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Profession :</span>
                  <p className="text-gray-900">{participant.profession}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Date d'inscription :</span>
                <p className="text-gray-900">
                  {new Date(participant.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Token personnalisé :</span>
                <p className="text-gray-900 font-mono text-sm">
                  {participant.token_landing_page ? (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {participant.token_landing_page.substring(0, 8)}...
                    </span>
                  ) : (
                    <span className="text-gray-400">Non généré</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sessions inscrites */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sessions inscrites
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({participantSessions.length} sur {allSessions.length} disponibles)
                </span>
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <p>{error}</p>
              </div>
            ) : participantSessions.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 mt-2">Ce participant n'est inscrit à aucune session</p>
                {allSessions.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {allSessions.length} session{allSessions.length > 1 ? 's' : ''} disponible{allSessions.length > 1 ? 's' : ''} pour cet événement
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Grouper par date */}
                {Object.entries(
                  participantSessions.reduce((acc: Record<string, Session[]>, session) => {
                    const dateKey = formatDate(session.date)
                    if (!acc[dateKey]) acc[dateKey] = []
                    acc[dateKey].push(session)
                    return acc
                  }, {})
                ).map(([date, dateSessions]) => (
                  <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-800">{date}</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {dateSessions
                        .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
                        .map(session => (
                          <div key={session.id} className="flex items-start space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">{session.titre}</h5>
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                                    {session.lieu && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {session.lieu}
                                      </>
                                    )}
                                  </div>
                                  {session.intervenant && (
                                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {session.intervenant}
                                    </div>
                                  )}
                                  {session.description && (
                                    <p className="mt-2 text-sm text-gray-600">{session.description}</p>
                                  )}
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                                    {session.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistiques */}
          {allSessions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Statistiques de participation</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {participantSessions.length}
                  </div>
                  <div className="text-sm text-gray-500">Sessions inscrites</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {allSessions.length}
                  </div>
                  <div className="text-sm text-gray-500">Sessions disponibles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {allSessions.length > 0 ? Math.round((participantSessions.length / allSessions.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Taux de participation</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}