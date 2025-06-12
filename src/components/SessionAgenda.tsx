'use client'

import React, { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

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
  eventId: string;
  onAddSession: () => void;
  onEditSession: (session: Session) => void; 
}

export default function SessionAgenda({ eventId, onAddSession, onEditSession }: SessionAgendaProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [groupedSessions, setGroupedSessions] = useState<Record<string, Session[]>>({})

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
          setError("La table des sessions n&apos;existe pas encore dans la base de données.")
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
      } catch (err: Error | unknown) {
        console.error('Error fetching sessions:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des sessions')
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
                La table des sessions n&apos;existe pas encore dans la base de données.
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
            <p className="text-gray-600">Une fois la table créée, actualisez cette page pour utiliser la fonctionnalité d&apos;agenda.</p>
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
  
  // For functions that appear unused but might be used in JSX:
  // Either:
  // 1. Start using them where they should be used
  // 2. Or remove them if truly not needed
  // 3. Or add a comment to disable ESLint for those specific lines if you're sure they're needed

  // Example:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteSession = async (sessionId: string) => {
    // Fix the unescaped apostrophe
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
        ]).filter(([, dateSessions]) => dateSessions.length > 0)
      ))
      
    } catch (err: Error | unknown) {
      console.error('Error deleting session:', err)
      alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Une erreur inconnue'}`)
    }
  }

  return React.createElement(
    'div',
    { className: "bg-white rounded-lg shadow-md p-6" },
    [
      // Header with title and add button
      React.createElement(
        'div',
        { className: "flex justify-between items-center mb-6", key: "header" },
        [
          React.createElement('h2', { className: "text-xl font-semibold text-gray-800", key: "title" }, "Agenda des sessions"),
          React.createElement('button', {
            onClick: onAddSession,
            className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            key: "add-button"
          }, "Ajouter une session")
        ]
      ),
      
      // Error message if present
      error && React.createElement(
        'div', 
        { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4", key: "error" },
        React.createElement('p', null, error)
      ),
      
      // Sessions content
      Object.keys(groupedSessions).length === 0 
        ? React.createElement('div', { className: "text-center py-10", key: "empty" }, 
            React.createElement('p', { className: "text-gray-500" }, "Aucune session trouvée pour cet événement.")
          )
        : Object.entries(groupedSessions).map(([date, dateSessions], i) => 
            React.createElement('div', { key: date || i, className: "mb-8" }, 
              // Use dateSessions in child elements
              React.createElement('h3', { className: "text-lg font-semibold", key: "date-header" }, date),
              // Generate session items with edit button that uses onEditSession
              React.createElement('div', { className: "space-y-2", key: "session-list" },
                dateSessions.map(session => 
                  React.createElement('div', { key: session.id, className: "flex justify-between items-center" },
                    React.createElement('span', null, `${session.titre} (${session.heure_debut}-${session.heure_fin})`),
                    React.createElement('button', {
                      onClick: () => onEditSession(session),
                      className: "text-blue-600"
                    }, "Modifier")
                  )
                )
              )
            )
          )
    ]
  );
}
