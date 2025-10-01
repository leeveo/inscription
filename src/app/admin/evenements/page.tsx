'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'

// Type pour les événements
type Evenement = {
  id: number
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  created_at: string
}

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        setIsLoading(true)
        const supabase = supabaseBrowser()
        
        console.log('Fetching events...')
        const { data, error } = await supabase
          .from('inscription_evenements')
          .select('*')
          .order('date_debut', { ascending: false })
          
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        console.log('Events fetched successfully:', data)
        // Add a type assertion to fix the type error
        setEvenements(data as Evenement[] || [])
      } catch (err: Error | unknown) {
        console.error('Erreur lors du chargement des événements:', err)
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des événements')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvenements()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return
    }
    
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase
        .from('inscription_evenements')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Mettre à jour la liste des événements
      setEvenements(prev => prev.filter(event => event.id !== id))
    } catch (err: Error | unknown) {
      console.error('Erreur lors de la suppression:', err)
      alert('Erreur lors de la suppression: ' + (err instanceof Error ? err.message : 'Une erreur inconnue'))
    }
  }

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
          <p className="mt-2 text-sm text-gray-500">
            Créez et gérez vos événements
          </p>
        </div>
        <Link 
          href="/admin/evenements/create" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Créer un événement
        </Link>
      </div>
      
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
      ) : evenements.length === 0 ? (
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
        <div className="space-y-6">
          {evenements.map((event, index) => {
            const eventDate = new Date(event.date_debut)
            const endDate = new Date(event.date_fin)
            const now = new Date()
            const isUpcoming = eventDate > now
            const isPast = endDate < now
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
                            {formatDate(event.date_debut)}
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.lieu}
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Fin: {formatDate(event.date_fin)}
                          </div>
                        </div>
                        
                        {event.description && (
                          <div
                            className="text-gray-600 text-sm line-clamp-2 mb-3"
                            dangerouslySetInnerHTML={{ __html: event.description }}
                          />
                        )}
                        
                        {/* Status badge */}
                        <div className="flex items-center space-x-3">
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
                          
                          {/* Time indicator for upcoming events */}
                          {isUpcoming && (
                            <span className="text-xs text-gray-500">
                              dans {Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jour{Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                            </span>
                          )}
                          
                          <span className="text-xs text-gray-500">
                            Créé le {new Date(event.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/admin/evenements/${event.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir
                      </Link>
                      
                      <Link 
                        href={`/admin/evenements/${event.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </Link>
                      
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-xl transition-all duration-300 pointer-events-none"></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
