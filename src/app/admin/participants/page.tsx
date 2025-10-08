'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'
import TicketTemplateViewer from '@/components/TicketTemplateViewer'
import TicketTemplateModal from '@/components/TicketTemplateModal'

type Participant = {
  id: number
  evenement_id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  site_web?: string
  checked_in: boolean
  checked_in_at?: string  // Ajout du nouveau champ
  created_at: string
  // Nouveaux champs
  profession?: string
  date_naissance?: string
  url_linkedin?: string
  url_facebook?: string
  url_twitter?: string
  url_instagram?: string
  evenement?: {
    id: number
    nom: string
    date_debut: string
  }
}

type Evenement = {
  id: number
  nom: string
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [events, setEvents] = useState<Evenement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [checkedInCount, setCheckedInCount] = useState(0)
  const [lastRegistrationDate, setLastRegistrationDate] = useState<string | null>(null)
  const [isTicketTemplateModalOpen, setIsTicketTemplateModalOpen] = useState(false)
  const itemsPerPage = 20
  
  // Fetch participants and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const supabase = supabaseBrowser()
        
        // Fetch events for filter dropdown
        const { data: eventsData, error: eventsError } = await supabase
          .from('inscription_evenements')
          .select('id, nom')
          .order('date_debut', { ascending: false })
        
        if (eventsError) throw eventsError
        // Add a two-step type assertion to fix the type error
        setEvents(eventsData as unknown as Evenement[])
        
        // Reset participants before new fetch
        setParticipants([])
        
        // Debug the current filter
        console.log('Current filter - Event ID:', selectedEvent, 'Type:', typeof selectedEvent)
        
        // Build the participants query with explicit type handling
        let query = supabase
          .from('inscription_participants')
          .select(`
            *,
            evenement:evenement_id (
              id,
              nom,
              date_debut
            )
          `, { count: 'exact' })
        
        // Apply event filter if selected - no need to convert strings
        if (selectedEvent !== null) {
          console.log(`Filtering by event ID: ${selectedEvent}`)
          query = query.eq('evenement_id', selectedEvent)
        }
        
        // Apply search filter if provided
        if (searchTerm) {
          query = query.or(`nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        }
        
        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        
        query = query.range(from, to).order('created_at', { ascending: false })
        
        // Execute the query
        const { data, error, count } = await query
        
        if (error) throw error
        
        console.log(`Fetched ${data?.length || 0} participants${selectedEvent !== null ? ` for event ${selectedEvent}` : ''}`)
        
        // Verify the event_id of fetched participants for debugging
        if (data && selectedEvent !== null) {
          const eventIds = (data as any[]).map((p: any) => p.evenement_id);
          console.log('Event IDs in fetched participants:', eventIds);
          
          // Check if all participants belong to the selected event
          const allMatch = eventIds.every(id => id === Number(selectedEvent));
          console.log('All participants match selected event:', allMatch);
        }
        
        // Add a two-step type assertion to fix the type error
        setParticipants(data as unknown as Participant[] || [])
        setTotalCount(count || 0)
        
        // Fetch total checked-in count
        let checkedInQuery = supabase
          .from('inscription_participants')
          .select('*', { count: 'exact' })
          .eq('checked_in', true);

        // Apply event filter if selected
        if (selectedEvent !== null) {
          checkedInQuery = checkedInQuery.eq('evenement_id', selectedEvent);
        }

        const { count: checkedCount } = await checkedInQuery;

        setCheckedInCount(checkedCount || 0)
        
        // Get most recent registration date
        if (data && data.length > 0) {
          // Sort by created_at in descending order
          const sortedData = [...(data as any[])].sort((a: any, b: any) =>
            new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
          );
          
          // Fix the type error by asserting created_at as string
          setLastRegistrationDate((sortedData[0]?.created_at as string) || null);
        } else {
          setLastRegistrationDate(null);
        }
        
      } catch (err: Error | unknown) {
        console.error('Error fetching participants:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [currentPage, selectedEvent, searchTerm]) // These dependencies trigger re-fetch

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }
  
  // Handle event filter change with proper UUID string handling
  const handleEventFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    console.log('Event filter changed to:', value, 'Type:', typeof value)
    
    // Set to null when empty, otherwise keep as string (don't convert to number)
    const eventId = value === '' ? null : value
    console.log('Setting selectedEvent to:', eventId, 'Type:', typeof eventId)
    
    setSelectedEvent(eventId)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  // Clear filter function with explicit null
  const clearFilter = () => {
    console.log('Clearing event filter')
    setSelectedEvent(null)
    setCurrentPage(1)
  }
  
  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const paginationRange = () => {
    const range = []
    const maxPagesToShow = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1
    
    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i)
    }
    
    return range
  }
  
  // Get check-in percentage
  const checkInPercentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Format recent registration
  const formatRecentRegistration = () => {
    if (!lastRegistrationDate) return 'Aucune inscription';
    
    const now = new Date();
    const registrationDate = new Date(lastRegistrationDate);
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  };

  // Add the missing simpleDateFormat function
  const simpleDateFormat = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tous les participants</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gestion de tous les participants à travers les événements
        </p>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white shadow-lg rounded-xl mb-8 p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Event filter */}
          <div>
            <label htmlFor="event-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par événement
            </label>
            <select
              id="event-filter"
              value={selectedEvent === null ? '' : selectedEvent}
              onChange={handleEventFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
            >
              <option value="">Tous les événements</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.nom}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search field */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher un participant
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Nom, prénom ou email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-10 shadow-sm transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Template Viewer - Afficher le template validé */}
        {selectedEvent && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <TicketTemplateViewer
              eventId={String(selectedEvent)}
              onEdit={() => setIsTicketTemplateModalOpen(true)}
            />
          </div>
        )}

        {/* Actions section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsTicketTemplateModalOpen(true)}
              disabled={!selectedEvent}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                selectedEvent
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              title={!selectedEvent ? "Sélectionnez un événement pour gérer les templates" : ""}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Gérer les templates de tickets
            </button>

            {selectedEvent && (
              <div className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Templates pour l'événement sélectionné
              </div>
            )}
          </div>
        </div>
        
        {/* Stats with debugging info */}
        <div className="mt-5 flex flex-col space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">{totalCount}</span> participants trouvés
              {selectedEvent !== null && (
                <span className="ml-2 text-blue-600">
                  (filtrés par événement ID: {selectedEvent})
                </span>
              )}
            </div>
            
            {selectedEvent !== null && (
              <button
                onClick={clearFilter}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Réinitialiser les filtres
              </button>
            )}
          </div>
          
          {/* Stats panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {/* Total participants */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow border border-blue-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Participants</p>
                  <p className="text-2xl font-bold text-blue-900">{totalCount}</p>
                </div>
              </div>
            </div>
            
            {/* Checked in participants */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow border border-green-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Participants enregistrés</p>
                  <div className="flex items-end">
                    <p className="text-2xl font-bold text-green-900">{checkedInCount}</p>
                    <p className="text-sm ml-2 text-green-700">({checkInPercentage}%)</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full" 
                      style={{ width: `${checkInPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent registration */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 shadow border border-purple-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 mr-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">Dernière inscription</p>
                  <p className="text-xl font-bold text-purple-900">{formatRecentRegistration()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Participants cards */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-red-50 rounded-xl shadow-md">
          <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg font-medium text-red-800">{error}</p>
        </div>
      ) : participants.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-xl shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-xl font-medium text-gray-600">Aucun participant trouvé</p>
          <p className="mt-2 text-gray-500">Modifiez vos critères de recherche ou ajoutez de nouveaux participants</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants.map((participant) => (
              <div 
                key={participant.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {participant.prenom} {participant.nom}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{participant.profession || 'Profession non précisée'}</p>
                    </div>
                    <div>
                      {participant.checked_in ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Checked In
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 truncate">{participant.email}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700">{participant.telephone}</span>
                    </div>
                    
                    <div className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <span className="text-gray-700">Inscrit le {simpleDateFormat(participant.created_at)}</span>
                        {participant.evenement && (
                          <Link 
                            href={`/admin/evenements/${participant.evenement.id}`}
                            className="block text-blue-600 hover:text-blue-800 mt-1 text-sm"
                          >
                            {participant.evenement.nom}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                    <Link
                      href={`/ticket/${participant.id}`}
                      target="_blank"
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors duration-200"
                      title="Voir le billet"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/evenements/${participant.evenement_id}?editParticipant=${participant.id}`}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      title="Modifier"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/participants/details/${participant.id}`}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                      title="Voir détails"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {paginationRange().map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
          
          {/* Results summary */}
          <div className="flex justify-center mt-2">
            <p className="text-sm text-gray-500">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalCount)}
              </span>{' '}
              sur <span className="font-medium">{totalCount}</span> résultats
            </p>
          </div>
        </div>
      )}
      
      {/* Modal for ticket template management */}
      {selectedEvent && (
        <TicketTemplateModal
          eventId={String(selectedEvent)}
          isOpen={isTicketTemplateModalOpen}
          onClose={() => setIsTicketTemplateModalOpen(false)}
        />
      )}
    </div>
  )
}
