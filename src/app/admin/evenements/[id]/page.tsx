'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Modal from '@/components/Modal'
import ParticipantForm from '@/components/ParticipantForm'
import SessionAgenda from '@/components/SessionAgenda'
import SessionForm from '@/components/SessionForm'

// Update the Event type definition to include client information properties
type Event = {
  id: string;
  nom: string;
  description: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  type_evenement: string; // Add type_evenement property
  type_participation: string; // Add type_participation property
  adresse_evenement?: string; // Add adresse_evenement property (optional)
  capacite?: number | string; // Add capacite property (optional, could be number or string)
  nom_client?: string;      // Add nom_client property
  adresse_client?: string;  // Add adresse_client property
  notes?: string; // Add notes property (optional)
  // ...other properties
};

// Create a consistent Participant type that works for all usages
interface Participant {
  id: string; // Use string type for ID to ensure compatibility
  evenement_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession?: string;
  created_at: string;
  // ...other properties
}

type Session = {
  id: string // Changé de number à string car c'est un UUID
  evenement_id: string // Changé de number à string car c'est un UUID
  titre: string
  description: string
  date: string
  heure_debut: string
  heure_fin: string
  intervenant: string
  lieu: string
  type: string
  created_at?: string
}

export default function EventDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extract ID directly from the URL path - SANS CONVERSION EN ENTIER
  const pathSegments = pathname?.split('/') || []
  const eventId = pathSegments[pathSegments.length - 1]
  
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'agenda'>('details')
  
  // Modal states
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError("ID d'événement manquant")
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()
        
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('inscription_evenements')
          .select('*')
          .eq('id', eventId)
          .single()
        
        if (eventError) throw eventError
        
        setEvent(eventData as Event)
        
        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from('inscription_participants')
          .select('*')
          .eq('evenement_id', eventId)
          .order('created_at', { ascending: false })
        
        if (participantsError) throw participantsError
        
        // Convert participant IDs to strings when needed
        setParticipants(participantsData.map(p => ({
          ...p,
          id: String(p.id) // Ensure ID is a string
        })) as Participant[] || [])
      } catch (err: Error | unknown) {
        console.error('Error fetching event details:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEventDetails()
  }, [eventId])
  
  const handleDeleteEvent = async () => {
    if (!event) return
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.nom}" ?`)) {
      return
    }
    
    try {
      setIsLoading(true)
      const supabase = supabaseBrowser()
      
      // Delete the event
      const { error } = await supabase
        .from('inscription_evenements')
        .delete()
        .eq('id', event.id)
      
      if (error) throw error
      
      // Redirect to events list
      router.push('/admin/evenements')
    } catch (err: Error | unknown) {
      console.error('Error deleting event:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression')
      setIsLoading(false)
    }
  }
  
  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
      return
    }
    
    try {
      const supabase = supabaseBrowser()
      
      const { error } = await supabase
        .from('inscription_participants')
        .delete()
        .eq('id', participantId)
      
      if (error) throw error
      
      // Update participants list
      // Fix the comparison by converting types to match
      setParticipants(participants.filter(p => p.id !== participantId))
      
      // Alternatively, if p.id is a string and participantId is a number:
      // setParticipants(participants.filter(p => Number(p.id) !== participantId))
      
      // Or if you prefer string comparison:
      // setParticipants(participants.filter(p => String(p.id) !== participantId))
    } catch (err: Error | unknown) {
      console.error('Error deleting participant:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression')
    }
  }
  
  const handleParticipantAdded = (participant: Participant) => {
    if (selectedParticipant) {
      // Update existing participant in the list
      setParticipants(participants.map(p => 
        p.id === participant.id ? participant : p
      ))
    } else {
      // Add new participant to the list
      setParticipants([participant, ...participants])
    }
    
    // Close modal
    setIsParticipantModalOpen(false)
    setSelectedParticipant(null)
  }
  
  const handleAddParticipant = () => {
    setSelectedParticipant(null)
    setIsParticipantModalOpen(true)
  }
  
  const handleEditParticipant = (participant: Participant) => {
    setSelectedParticipant(participant)
    setIsParticipantModalOpen(true)
  }
  
  const handleAddSession = () => {
    setSelectedSession(null)
    setIsSessionModalOpen(true)
  }
  
  const handleEditSession = (session: Session) => {
    setSelectedSession(session)
    setIsSessionModalOpen(true)
  }
  
  // Remove unused 'session' parameter or use it
  const handleSessionSaved = () => {
    // Close modal
    setIsSessionModalOpen(false)
    setSelectedSession(null)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>{error || "Événement non trouvé"}</p>
          <Link href="/admin/evenements" className="mt-2 inline-block text-red-700 underline">
            Retour à la liste des événements
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link 
            href="/admin/evenements"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la liste
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{event.nom}</h1>
          <div className="mt-1 flex items-center">
            <span className="mr-2 text-sm text-gray-500">
              {formatDate(event.date_debut)} - {formatDate(event.date_fin)}
            </span>
            {event.statut && (
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${event.statut === 'publié' ? 'bg-green-100 text-green-800' : 
                  event.statut === 'archivé' ? 'bg-gray-100 text-gray-800' : 
                  'bg-yellow-100 text-yellow-800'}`}
              >
                {event.statut}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/admin/evenements/${event.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Modifier
          </Link>
          <button
            onClick={handleDeleteEvent}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            Supprimer
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex flex-wrap border-b">
            <button
              className={`flex items-center py-4 px-6 font-medium text-sm transition-all duration-200 ease-in-out ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('details')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Détails
            </button>
            <button
              className={`flex items-center py-4 px-6 font-medium text-sm transition-all duration-200 ease-in-out ${
                activeTab === 'agenda'
                  ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('agenda')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agenda
            </button>
            <button
              className={`flex items-center py-4 px-6 font-medium text-sm transition-all duration-200 ease-in-out ${
                activeTab === 'participants'
                  ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('participants')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Participants
              <span className="ml-2 px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {participants.length}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {activeTab === 'details' && (
          <div className="p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">Informations de l&apos;événement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{event.description}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4">Type d&apos;événement</h3>
                <p className="mt-1 text-gray-900">{event.type_evenement || 'Non spécifié'}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4">Type de participation</h3>
                <p className="mt-1 text-gray-900">{event.type_participation || 'Non spécifié'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                <p className="mt-1 text-gray-900">{event.lieu}</p>
                
                {event.adresse_evenement && (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 mt-4">Adresse détaillée</h3>
                    <p className="mt-1 text-gray-900">{event.adresse_evenement}</p>
                  </>
                )}
                
                <h3 className="text-sm font-medium text-gray-500 mt-4">Date et heure</h3>
                <p className="mt-1 text-gray-900">
                  Du {formatDate(event.date_debut)} à {formatTime(event.date_debut)}
                  <br />
                  Au {formatDate(event.date_fin)} à {formatTime(event.date_fin)}
                </p>
                
                {event.capacite && (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 mt-4">Capacité</h3>
                    <p className="mt-1 text-gray-900">{event.capacite} participants</p>
                  </>
                )}
              </div>
            </div>
            
            {(event.nom_client || event.adresse_client) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations client</h2>
                
                {event.nom_client && (
                  <>
                    <h3 className="text-sm font-medium text-gray-500">Nom du client</h3>
                    <p className="mt-1 text-gray-900">{event.nom_client}</p>
                  </>
                )}
                
                {event.adresse_client && (
                  <>
                    <h3 className="text-sm font-medium text-gray-500 mt-4">Adresse du client</h3>
                    <p className="mt-1 text-gray-900">{event.adresse_client}</p>
                  </>
                )}
              </div>
            )}
            
            {event.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes additionnelles</h2>
                <p className="text-gray-900">{event.notes}</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'agenda' && (
          <div className="animate-fadeIn">
            <SessionAgenda 
              eventId={event.id} 
              onAddSession={handleAddSession}
              onEditSession={handleEditSession}
            />
          </div>
        )}
        
        {activeTab === 'participants' && (
          <div className="animate-fadeIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-purple-500 pl-3">Liste des participants</h2>
                <button
                  onClick={handleAddParticipant}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Ajouter un participant
                  </span>
                </button>
              </div>
              
              {participants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun participant</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucun participant n&apos;a encore été ajouté à cet événement.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddParticipant}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Ajouter votre premier participant
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom complet
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Téléphone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profession
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date d&apos;inscription
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((participant) => (
                        <tr key={participant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.prenom} {participant.nom}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{participant.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{participant.telephone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{participant.profession || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(participant.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditParticipant(participant)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(String(participant.id))}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Participant Modal */}
      <Modal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        title={selectedParticipant ? "Modifier le participant" : "Ajouter un participant"}
        size="lg"
      >
        <ParticipantForm
          eventId={event.id}
          participant={selectedParticipant}
          onParticipantAdded={handleParticipantAdded}
          onCancel={() => setIsParticipantModalOpen(false)}
        />
      </Modal>
      
      {/* Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title={selectedSession ? "Modifier la session" : "Ajouter une session"}
        size="lg"
      >
        <SessionForm
          eventId={event.id}
          session={selectedSession}
          onSessionSaved={handleSessionSaved}
          onCancel={() => setIsSessionModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
