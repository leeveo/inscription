'use client'

import React, { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Modal from '@/components/Modal'
import SessionParticipantsList from '@/components/SessionParticipantsList'
import ConfirmationModal from '@/components/ConfirmationModal'

type SessionParticipant = {
  nom: string;
  prenom: string;
  email: string;
};

type Session = {
  id: string;
  evenement_id: string;
  titre: string;
  description: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  participant_count: number;
  participants: SessionParticipant[];
  is_registered?: boolean;
}

interface SessionAgendaProps {
  eventId: string;
  onAddSession: () => void;
  onEditSession: (session: Session) => void; 
}

type ParticipantData = {
  participant_id: string;
  inscription_participants?: {
    nom: string;
    prenom: string;
    email: string;
  };
};

export default function SessionAgenda({ eventId, onAddSession, onEditSession }: SessionAgendaProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [groupedSessions, setGroupedSessions] = useState<Record<string, Session>>({})

  // Add state for participant list modal
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Add state for confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  
  const isValidParticipant = (participant: any): participant is ParticipantData => {
    return (
      participant &&
      typeof participant.participant_id === 'string' &&
      participant.inscription_participants &&
      typeof participant.inscription_participants.nom === 'string' &&
      typeof participant.inscription_participants.prenom === 'string' &&
      typeof participant.inscription_participants.email === 'string'
    );
  };

  const isValidSession = (session: any): session is Session => {
    return (
      session &&
      typeof session.id === 'string' &&
      typeof session.evenement_id === 'string' &&
      typeof session.titre === 'string' &&
      typeof session.description === 'string' &&
      typeof session.date === 'string' &&
      typeof session.heure_debut === 'string' &&
      typeof session.heure_fin === 'string' &&
      typeof session.participant_count === 'number' &&
      Array.isArray(session.participants) &&
      session.participants.every(isValidParticipant)
    );
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();

        const { data, error } = await supabase
          .from('inscription_sessions')
          .select('*')
          .eq('evenement_id', eventId)
          .order('date')
          .order('heure_debut');

        if (error && error.code === '42P01') {
          console.error('Error fetching sessions:', error);
          setTableExists(false);
          setError("La table des sessions n'existe pas encore dans la base de données.");
          return;
        }

        if (error) throw error;

        const sessionsWithParticipants = await Promise.all(
          (data || []).map(async (session) => {
            const { count, error: countError } = await supabase
              .from('inscription_session_participants')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id);

            if (countError) console.error("Error counting participants:", countError);

            const { data: participants, error: participantsError } = await supabase
              .from('inscription_session_participants')
              .select(`
                participant_id,
                inscription_participants (
                  nom, prenom, email
                )
              `)
              .eq('session_id', session.id);

            if (participantsError) {
              console.error("Error fetching participants:", participantsError);
              return null;
            }

            const formattedParticipants = (participants as any[])
              ?.filter(isValidParticipant)
              ?.map(p => ({
                nom: p.inscription_participants.nom,
                prenom: p.inscription_participants.prenom,
                email: p.inscription_participants.email,
              })) || [];

            return {
              id: String(session.id),
              evenement_id: String(session.evenement_id),
              titre: String(session.titre),
              description: String(session.description || ''),
              date: String(session.date),
              heure_debut: String(session.heure_debut),
              heure_fin: String(session.heure_fin),
              participant_count: Number(count || 0),
              participants: formattedParticipants,
              is_registered: Boolean(session.is_registered),
            };
          })
        );

        // Filter out invalid sessions using the refined type predicate
        const validSessions = sessionsWithParticipants.filter(isValidSession);

        setSessions(validSessions);

        const grouped = validSessions.reduce((acc: Record<string, Session[]>, session) => {
          const date = new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(session);
          return acc;
        }, {});

        setGroupedSessions(grouped);
      } catch (err: unknown) {
        console.error('Error fetching sessions:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des sessions');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSessions()
  }, [eventId])
  
  // New function to format time for display
  const formatTimeDisplay = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  };

  // Calculate session duration in minutes
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  // Determine session type color
  const getSessionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conférence': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'atelier': return 'bg-green-100 border-green-300 text-green-800';
      case 'pause': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'networking': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    }
  };

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
    setSessionToDelete(sessionId)
    setDeleteConfirmOpen(true)
  }
  
  // New function to actually delete after confirmation
  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return
    
    try {
      const supabase = supabaseBrowser()
      
      const { error } = await supabase
        .from('inscription_sessions')
        .delete()
        .eq('id', sessionToDelete)
      
      if (error) throw error
      
      // Update state after successful deletion
      setSessions(sessions.filter(session => session.id !== sessionToDelete))
      
      // Update grouped sessions
      setGroupedSessions(Object.fromEntries(
        Object.entries(groupedSessions).map(([date, dateSessions]) => [
          date, 
          dateSessions.filter(session => session.id !== sessionToDelete)
        ]).filter(([, dateSessions]) => dateSessions.length > 0)
      ))
      
      // Show toast notification if you have one
      // setToast({ message: "Session supprimée avec succès", type: "success" })
      
    } catch (err: Error | unknown) {
      console.error('Error deleting session:', err)
      alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Une erreur inconnue'}`)
    } finally {
      // Close the confirmation modal
      setDeleteConfirmOpen(false)
      setSessionToDelete(null)
    }
  }
  
  // Function to view participants for a session
  const handleViewParticipants = (session: Session) => {
    setSelectedSessionId(session.id)
    setIsParticipantListOpen(true)
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Agenda des sessions</h2>
        <button
          onClick={onAddSession}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter une session
        </button>
      </div>
      
      {/* Error message if present */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Modern calendar view */}
      {Object.keys(groupedSessions).length === 0 ? (
        <div className="text-center py-10">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mt-4">Aucune session trouvée pour cet événement.</p>
          <button
            onClick={onAddSession}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Créer votre première session
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([date, dateSessions], i) => {
            // Sort sessions by start time
            const sortedSessions = [...dateSessions].sort((a, b) => 
              a.heure_debut.localeCompare(b.heure_debut)
            );
            
            // Fix the Invalid Date error with proper date formatting
            const sessionDate = new Date(dateSessions[0]?.date);
            const isValidDate = !isNaN(sessionDate.getTime());
            
            // Format date elements safely
            const formattedDay = isValidDate ? sessionDate.toLocaleDateString('fr-FR', { day: 'numeric' }) : '--';
            const formattedMonth = isValidDate ? sessionDate.toLocaleDateString('fr-FR', { month: 'short' }) : '--';
            const formattedWeekday = isValidDate ? sessionDate.toLocaleDateString('fr-FR', { weekday: 'long' }) : 'Date non définie';
            
            return (
              <div key={date || i} className="rounded-lg border border-gray-200 overflow-hidden">
                {/* Day header */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="mr-4 bg-white p-2 rounded-lg border border-indigo-200 text-center w-14 h-14 flex flex-col justify-center">
                      <span className="text-xs text-gray-500">{formattedMonth}</span>
                      <span className="text-xl font-bold text-indigo-700">{formattedDay}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {formattedWeekday}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sortedSessions.length} session{sortedSessions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Day timeline */}
                <div className="p-4 bg-white">
                  <div className="relative pl-8">
                    {/* Time axis */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 border-r border-gray-200">
                      {sortedSessions.map((session, index) => (
                        <div key={`time-${session.id}`} className="absolute flex items-center -translate-y-1/2" style={{ top: `${index * 120 + 60}px` }}>
                          <span className="text-xs font-medium text-gray-500 -translate-x-1/2">
                            {formatTimeDisplay(session.heure_debut)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Sessions */}
                    <div className="space-y-4">
                      {sortedSessions.map((session, sessionIndex) => {
                        const duration = calculateDuration(session.heure_debut, session.heure_fin);
                        const typeColor = getSessionTypeColor(session.type);
                        
                        return (
                          <div 
                            key={session.id}
                            className={`ml-2 rounded-lg p-4 border ${typeColor} relative`}
                            style={{ 
                              minHeight: `${Math.max(duration/4, 90)}px` 
                            }}
                          >
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{session.titre}</h4>
                                <div className="flex items-center mt-1 text-sm">
                                  <span className="text-gray-700">
                                    {formatTimeDisplay(session.heure_debut)} - {formatTimeDisplay(session.heure_fin)}
                                  </span>
                                  {session.lieu && (
                                    <>
                                      <span className="mx-2 text-gray-400">•</span>
                                      <span className="text-gray-700">{session.lieu}</span>
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
                                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{session.description}</p>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end justify-between">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleViewParticipants(session)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                                    title="Voir les participants"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => onEditSession(session)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                    title="Modifier la session"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                    title="Supprimer la session"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                                
                                <div className="flex items-center mt-2">
                                  <span className="bg-white text-xs font-medium px-2 py-1 rounded-full border border-current">
                                    {session.participant_count} inscrit{session.participant_count !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Confirmation modal for deletion */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteSession}
        title="Supprimer la session"
        message="Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible et supprimera également toutes les inscriptions associées."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        type="danger"
      />
      
      {/* Participant list modal - keep existing code */}
      {isParticipantListOpen && selectedSessionId && (
        <Modal
          isOpen={isParticipantListOpen}
          onClose={() => setIsParticipantListOpen(false)}
          title="Participants inscrits"
          size="lg"
        >
          <SessionParticipantsList
            sessionId={selectedSessionId}
            onClose={() => setIsParticipantListOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}
