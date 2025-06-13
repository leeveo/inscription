'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type Participant = {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  created_at: string
}

interface SessionParticipantsListProps {
  sessionId: string
  onClose: () => void
}

export default function SessionParticipantsList({ sessionId, onClose }: SessionParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionTitle, setSessionTitle] = useState('')
  
  // Fetch session participants
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!sessionId) return
      
      try {
        setIsLoading(true)
        setError(null)
        const supabase = supabaseBrowser()
        
        // Get session title
        const { data: sessionData, error: sessionError } = await supabase
          .from('inscription_sessions')
          .select('titre')
          .eq('id', sessionId)
          .single()
        
        if (sessionError) throw sessionError
        if (sessionData) {
          setSessionTitle(sessionData.titre)
        }
        
        // Get participants for this session
        const { data, error } = await supabase
          .from('inscription_session_participants')
          .select(`
            participant_id,
            inscription_participants (
              id,
              nom,
              prenom,
              email,
              telephone,
              created_at
            )
          `)
          .eq('session_id', sessionId)
        
        if (error) throw error
        
        // Process and format data
        const formattedParticipants = data
          ?.filter(item => item.inscription_participants)
          ?.map(item => ({
            id: item.participant_id,
            nom: item.inscription_participants.nom,
            prenom: item.inscription_participants.prenom,
            email: item.inscription_participants.email,
            telephone: item.inscription_participants.telephone,
            created_at: item.inscription_participants.created_at
          })) || []
        
        setParticipants(formattedParticipants)
      } catch (err: unknown) {
        console.error('Error fetching session participants:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des participants')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchParticipants()
  }, [sessionId])
  
  // Handle sending invitation to participant
  const handleSendInvitation = async (participantId: string) => {
    try {
      // Implementation for sending invitation
      alert(`Invitation envoyée au participant ${participantId}`)
    } catch (error) {
      console.error('Error sending invitation:', error)
    }
  }
  
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Participants inscrits à : {sessionTitle}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {participants.length} participant(s) inscrit(s) à cette session
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : participants.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          Aucun participant inscrit à cette session
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d&apos;inscription
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {participant.prenom} {participant.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.telephone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(participant.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleSendInvitation(participant.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Envoyer un rappel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
