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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des événements</h1>
        <Link 
          href="/admin/evenements/create" 
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          Créer un événement
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : evenements.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-10 text-center">
            <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
            <p className="mt-2 text-gray-400">Créez votre premier événement en cliquant sur le bouton ci-dessus</p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de début
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de fin
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evenements.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.nom}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.lieu}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.date_debut)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.date_fin)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/admin/evenements/${event.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Voir
                      </Link>
                      <Link 
                        href={`/admin/evenements/${event.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(event.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
