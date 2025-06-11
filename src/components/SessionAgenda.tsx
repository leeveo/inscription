'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'

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
  participants?: { 
    nom: string;
    prenom: string;
    email: string;
  }[]
}

interface SessionAgendaProps {
  eventId: string
  onAddSession: () => void
  onEditSession: (session: Session) => void
}

export default function SessionAgenda({ eventId, onAddSession, onEditSession }: SessionAgendaProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [groupedSessions, setGroupedSessions] = useState<Record<string, Session[]>>({})
  // Nouveaux états pour le pop-up des participants
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()
        
        const { data, error } = await supabase
          .from('inscription_sessions')
          .select('*')
          .eq('evenement_id', eventId)
          .order('date')
          .order('heure_debut')
        
        // Vérifier si l'erreur indique que la table n'existe pas
        if (error && error.code === '42P01') {
          console.error('Error fetching sessions:', error)
          setTableExists(false)
          setError("La table des sessions n'existe pas encore dans la base de données.")
          return
        }
        
        if (error) throw error
        
        // Get participant counts and details for each session
        const sessionsWithParticipants = await Promise.all(
          (data || []).map(async (session) => {
            // Get count of participants
            const { count, error: countError } = await supabase
              .from('inscription_session_participants')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)
            
            if (countError) console.error("Error counting participants:", countError)
            
            // Get participant details for this session
            const { data: participants, error: participantsError } = await supabase
              .from('inscription_session_participants')
              .select(`
                participant_id,
                inscription_participants!inner(
                  nom, prenom, email
                )
              `)
              .eq('session_id', session.id)
            
            if (participantsError) console.error("Error fetching participants:", participantsError)
            
            const formattedParticipants = participants?.map(p => ({
              nom: p.inscription_participants.nom,
              prenom: p.inscription_participants.prenom,
              email: p.inscription_participants.email
            })) || []
            
            return {
              ...session,
              participant_count: count || 0,
              participants: formattedParticipants
            }
          })
        )
        
        setSessions(sessionsWithParticipants)
        
        // Group sessions by date
        const grouped = (data || []).reduce((acc: Record<string, Session[]>, session) => {
          const date = new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          
          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(session)
          return acc
        }, {})
        
        setGroupedSessions(grouped)
      } catch (err: any) {
        console.error('Error fetching sessions:', err)
        setError(err.message || 'Une erreur est survenue lors du chargement des sessions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSessions()
  }, [eventId])
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!tableExists) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Agenda des sessions</h2>
          <button
            onClick={onAddSession}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Ajouter une session
          </button>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                La table des sessions n'existe pas encore dans la base de données. Veuillez suivre les instructions pour la créer.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Instructions pour créer la table des sessions</h3>
          <p className="mb-4 text-gray-600">Vous devez créer une table nommée <code className="bg-gray-100 px-1 py-0.5 rounded">inscription_sessions</code> dans votre base de données Supabase avec les colonnes suivantes :</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">id</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">uuid</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Primary Key, Default: uuid_generate_v4()</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">evenement_id</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">uuid</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Foreign Key référençant inscription_evenements.id</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">titre</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">text</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Non-null</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">description</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">text</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nullable</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">date</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">date</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Non-null</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">heure_debut</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">time</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Non-null</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">heure_fin</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">time</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Non-null</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">intervenant</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">text</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nullable</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">lieu</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">text</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nullable</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">type</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">text</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Non-null</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">created_at</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">timestamp with time zone</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Default: now()</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">SQL pour créer la table des sessions :</h4>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
              {`CREATE TABLE public.inscription_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  evenement_id uuid REFERENCES public.inscription_evenements(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  date date NOT NULL,
  heure_debut time NOT NULL,
  heure_fin time NOT NULL,
  intervenant text,
  lieu text,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);`}
            </pre>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">SQL pour créer la table des inscriptions aux sessions :</h4>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
              {`CREATE TABLE public.inscription_session_participants (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id uuid REFERENCES public.inscription_sessions(id) ON DELETE CASCADE,
  participant_id integer REFERENCES public.inscription_participants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, participant_id)
);`}
            </pre>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-600">Une fois la table créée, actualisez cette page pour utiliser la fonctionnalité d'agenda.</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (error && tableExists) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    )
  }
  
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return
    
    try {
      const supabase = supabaseBrowser()
      
      const { error } = await supabase
        .from('inscription_sessions')
        .delete()
        .eq('id', sessionId)
      
      if (error) throw error
      
      // Update state after successful deletion
      setSessions(sessions.filter(session => session.id !== sessionId))
      
      // Update grouped sessions
      setGroupedSessions(Object.fromEntries(
        Object.entries(groupedSessions).map(([date, dateSessions]) => [
          date, 
          dateSessions.filter(session => session.id !== sessionId)
        ]).filter(([_, dateSessions]) => dateSessions.length > 0)
      ))
      
    } catch (err: any) {
      console.error('Error deleting session:', err)
      alert(`Erreur lors de la suppression: ${err.message}`)
    }
  }
  
  const getSessionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conférence':
        return 'bg-blue-100 text-blue-800'
      case 'atelier':
        return 'bg-green-100 text-green-800'
      case 'pause':
        return 'bg-gray-100 text-gray-800'
      case 'networking':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  // Nouvel handler pour ouvrir le modal des participants
  const handleShowParticipants = (session: Session) => {
    setSelectedSession(session)
    setIsParticipantsModalOpen(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Agenda des sessions</h2>
        <button
          onClick={onAddSession}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Ajouter une session
        </button>
      </div>
      
      {Object.keys(groupedSessions).length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            Aucune session n'a encore été ajoutée à cet événement.
          </p>
          <button
            onClick={onAddSession}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Ajouter votre première session
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-800 mb-4 bg-gray-50 p-2 rounded">
                {date}
              </h3>
              
              <div className="space-y-4">
                {dateSessions.map(session => (
                  <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-4">
                            {session.heure_debut} - {session.heure_fin}
                          </span>
                          <h4 className="text-lg font-medium text-gray-900">{session.titre}</h4>
                        </div>
                        
                        <div className="mt-2 flex items-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                            {session.type}
                          </span>
                          {session.lieu && (
                            <span className="ml-3 text-sm text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {session.lieu}
                            </span>
                          )}
                          {session.intervenant && (
                            <span className="ml-3 text-sm text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {session.intervenant}
                            </span>
                          )}
                          <button
                            onClick={() => handleShowParticipants(session)}
                            className="ml-3 text-sm text-gray-500 flex items-center hover:text-blue-600 hover:underline cursor-pointer"
                            title="Voir les participants"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {session.participant_count || 0} participant{(session.participant_count || 0) > 1 ? 's' : ''}
                          </button>
                        </div>
                        
                        {session.description && (
                          <p className="mt-2 text-sm text-gray-600">{session.description}</p>
                        )}
                        
                        {/* Show participants */}
                        {session.participants && session.participants.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Participants inscrits:</p>
                            <div className="flex flex-wrap gap-1">
                              {session.participants.map((p, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {p.prenom} {p.nom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditSession(session)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal pour afficher les participants */}
      {isParticipantsModalOpen && selectedSession && (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay de fond gris */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsParticipantsModalOpen(false)}></div>

            {/* Centre le modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Contenu du modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex justify-between" id="modal-title">
                      Participants à la session "{selectedSession.titre}"
                      <button
                        onClick={() => setIsParticipantsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </h3>
                    <div className="mt-4">
                      {selectedSession.participants && selectedSession.participants.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Nom
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedSession.participants.map((participant, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {participant.prenom} {participant.nom}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {participant.email}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">
                            Aucun participant n'est inscrit à cette session
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsParticipantsModalOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
