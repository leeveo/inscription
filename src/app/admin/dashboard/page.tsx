'use client'

import React, { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import EventCalendar from '@/components/EventCalendar'
import Link from 'next/link'

// Rename your Event type to something more specific to avoid collision with DOM Event
type EventData = {
  id: string;
  nom: string;
  description: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  statut: string; // Add the missing statut property
  // ...other properties
}

export default function DashboardPage() {
  // Move useState inside the component function
  const [events, setEvents] = useState<EventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalParticipants: 0,
    participantsThisMonth: 0
  })

  useEffect(() => {
    const fetchEventsAndStats = async () => {
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()
        
        // Fetch all events
        const { data: eventsData, error: eventsError } = await supabase
          .from('inscription_evenements')
          .select('*')
          .order('date_debut', { ascending: true })
        
        if (eventsError) throw eventsError
        
        setEvents((eventsData as EventData[]) || [])

        // Or use a mapping function if needed:
        // setEvents((eventsData?.map(event => ({
        //   id: event.id,
        //   nom: event.nom,
        //   description: event.description,
        //   lieu: event.lieu,
        //   date_debut: event.date_debut,
        //   date_fin: event.date_fin,
        //   // ...map other required fields
        // })) as Event[]) || [])
        
        // Calculate stats
        const now = new Date()
        const typedEventsData = eventsData as EventData[] || [];
        const upcomingEvents = typedEventsData.filter(event => new Date(event.date_debut) >= now);
        
        // Fetch participant stats
        const { count: totalParticipants, error: countError } = await supabase
          .from('inscription_participants')
          .select('*', { count: 'exact', head: true })
        
        if (countError) throw countError
        
        // Get this month's participants
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const { count: monthParticipants, error: monthCountError } = await supabase
          .from('inscription_participants')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth)
        
        if (monthCountError) throw monthCountError
        
        setStats({
          totalEvents: eventsData?.length || 0,
          upcomingEvents: upcomingEvents.length,
          totalParticipants: totalParticipants || 0,
          participantsThisMonth: monthParticipants || 0
        })
        
      } catch (err: Error | unknown) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEventsAndStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">Aperçu de vos événements et statistiques</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Total Événements</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Événements à venir</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.upcomingEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Total Participants</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalParticipants}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500">Inscriptions ce mois</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.participantsThisMonth}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/evenements/create"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Créer un événement</h3>
              <p className="text-sm text-gray-500">Ajouter un nouvel événement</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/evenements"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Gérer les événements</h3>
              <p className="text-sm text-gray-500">Voir la liste des événements</p>
            </div>
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Campagne d&apos;emails</h3>
              <p className="text-sm text-gray-500">Envoyer des communications</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Calendrier des événements</h2>
          <Link 
            href="/admin/evenements" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Voir tous les événements
          </Link>
        </div>
        
        <div className="h-[600px]">
          <EventCalendar 
            events={events.map(event => ({
              id: Number(event.id), // Convert string ID to number if needed
              title: event.nom,
              nom: event.nom,
              description: event.description,
              lieu: event.lieu,
              date_debut: event.date_debut,
              date_fin: event.date_fin,
              // Add any other properties required by the Event type
            }))} 
          />
        </div>
      </div>
      
      {/* Recent Events Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Événements récents</h2>
        </div>
        
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun événement disponible</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.slice(0, 5).map((event) => {
                  const eventDate = new Date(event.date_debut)
                  const now = new Date()
                  const isUpcoming = eventDate > now
                  
                  return (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.date_debut).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.lieu}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.statut ? (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${event.statut === 'publié' ? 'bg-green-100 text-green-800' : 
                              event.statut === 'archivé' ? 'bg-gray-100 text-gray-800' : 
                              'bg-yellow-100 text-yellow-800'}`}
                          >
                            {event.statut}
                          </span>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${isUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {isUpcoming ? 'À venir' : 'Terminé'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/evenements/${event.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Détails
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
