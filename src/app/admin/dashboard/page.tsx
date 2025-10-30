'use client'

import React, { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import EventCalendar from '@/components/EventCalendar'
import EventCodesManager from '@/components/EventCodesManager'
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Link 
            href="/admin/documentation"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M12 4v16m0 0H3m9 0a9 9 0 100-18 9 9 0 000 18z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Documentation</h3>
              <p className="text-sm text-gray-500">Guide d&apos;utilisation du SaaS</p>
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

          <Link 
            href="/scanner"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Scanner QR Mobile</h3>
              <p className="text-sm text-gray-500">Check-in des participants (Plein écran)</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Event Codes Management Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Codes d&apos;accès événements</h2>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <EventCodesManager />
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
              id: event.id,
              title: event.nom,
              nom: event.nom,
              description: event.description,
              lieu: event.lieu,
              date_debut: event.date_debut,
              date_fin: event.date_fin,
              statut: event.statut as 'brouillon' | 'publié' | 'archivé',
            }))}
          />
        </div>
      </div>
      
      {/* Recent Events Section - Modern Design */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Événements récents</h2>
              <p className="text-blue-100 mt-1">Aperçu de vos derniers événements</p>
            </div>
            <Link 
              href="/admin/evenements"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>Voir tout</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement</h3>
              <p className="text-gray-500 mb-4">Commencez par créer votre premier événement</p>
              <Link 
                href="/admin/evenements/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer un événement
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event, index) => {
                const eventDate = new Date(event.date_debut)
                const now = new Date()
                const isUpcoming = eventDate > now
                const isPast = eventDate < now
                const isToday = eventDate.toDateString() === now.toDateString()
                
                return (
                  <div 
                    key={event.id}
                    className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Event number badge */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4">
                          {/* Date circle */}
                          <div className="flex-shrink-0">
                            <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center text-center ${
                              isToday ? 'bg-orange-500 border-orange-300 text-white' :
                              isUpcoming ? 'bg-blue-500 border-blue-300 text-white' :
                              'bg-gray-400 border-gray-300 text-white'
                            }`}>
                              <span className="text-xs font-medium">
                                {eventDate.toLocaleDateString('fr-FR', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold">
                                {eventDate.getDate()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Event details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                              {event.nom}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {eventDate.toLocaleDateString('fr-FR', { 
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.lieu}
                              </div>
                            </div>
                            
                            {event.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {event.description}
                              </p>
                            )}
                            
                            {/* Status badge */}
                            <div className="flex items-center space-x-3">
                              {event.statut ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                  event.statut === 'publié' ? 'bg-green-50 text-green-700 border-green-200' :
                                  event.statut === 'archivé' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    event.statut === 'publié' ? 'bg-green-400' :
                                    event.statut === 'archivé' ? 'bg-gray-400' :
                                    'bg-yellow-400'
                                  }`}></div>
                                  {event.statut.charAt(0).toUpperCase() + event.statut.slice(1)}
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                  isToday ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  isUpcoming ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                    isToday ? 'bg-orange-400' :
                                    isUpcoming ? 'bg-blue-400' : 'bg-gray-400'
                                  }`}></div>
                                  {isToday ? "Aujourd'hui" : isUpcoming ? 'À venir' : 'Terminé'}
                                </span>
                              )}
                              
                              {/* Time indicator for upcoming events */}
                              {isUpcoming && (
                                <span className="text-xs text-gray-500">
                                  dans {Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jour{Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/admin/evenements/${event.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Détails
                          </Link>
                          
                          <Link 
                            href={`/admin/evenements/${event.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
                  </div>
                )
              })}
              
              {events.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <Link 
                    href="/admin/evenements"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0l-4-4m4 4l-4 4" />
                    </svg>
                    Voir tous les événements ({events.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
