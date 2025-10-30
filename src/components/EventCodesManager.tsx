'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

interface Event {
  id: string
  nom: string
  date_debut: string
  lieu?: string
  code_acces: string
  created_at: string
}

export default function EventCodesManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Charger les événements avec leurs codes
  const loadEvents = async () => {
    try {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('inscription_evenements')
        .select('id, nom, date_debut, lieu, code_acces, created_at')
        .order('date_debut', { ascending: false })

      if (error) {
        throw error
      }

      setEvents((data as Event[]) || [])
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des événements' })
    } finally {
      setIsLoading(false)
    }
  }

  // Générer un nouveau code pour un événement
  const generateNewCode = async (eventId: string) => {
    setIsGenerating(true)
    try {
      const supabase = supabaseBrowser()
      // Générer un nouveau code aléatoire
      const newCode = Math.floor(Math.random() * 9000 + 1000).toString()

      // Vérifier que le code n'existe pas déjà
      const { data: existingEvent } = await supabase
        .from('inscription_evenements')
        .select('id')
        .eq('code_acces', newCode)
        .single()

      if (existingEvent) {
        // Si le code existe, réessayer récursivement
        return await generateNewCode(eventId)
      }

      // Mettre à jour l'événement avec le nouveau code
      const { error } = await supabase
        .from('inscription_evenements')
        .update({ code_acces: newCode })
        .eq('id', eventId)

      if (error) {
        throw error
      }

      // Recharger la liste
      await loadEvents()
      setMessage({ type: 'success', text: `Nouveau code généré: ${newCode}` })
    } catch (error) {
      console.error('Erreur lors de la génération du code:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la génération du code' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Copier le code dans le presse-papiers
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setMessage({ type: 'success', text: `Code ${code} copié dans le presse-papiers` })
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Codes d'accès événements</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les codes à 4 chiffres pour l'accès au scanner QR
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadEvents}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h3 className="font-medium text-blue-900 mb-2">Instructions d'utilisation</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Les hôtesses utilisent ces codes pour accéder au scanner QR</li>
            <li>• Chaque événement a un code unique à 4 chiffres</li>
            <li>• Cliquez sur un code pour le copier dans le presse-papiers</li>
            <li>• Vous pouvez générer un nouveau code si nécessaire</li>
          </ul>
        </div>

        {/* Liste des événements */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement</h3>
            <p className="text-gray-600">Créez d'abord des événements pour voir leurs codes d'accès</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code d'accès
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.nom}</div>
                      <div className="text-sm text-gray-500">ID: {event.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.lieu || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.code_acces ? (
                        <button
                          onClick={() => copyCode(event.code_acces)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                          title="Cliquer pour copier"
                        >
                          {event.code_acces}
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Aucun code
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => generateNewCode(event.id)}
                        disabled={isGenerating}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isGenerating ? 'Génération...' : 'Nouveau code'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">{events.length}</h3>
              <p className="text-sm text-blue-600">Total événements</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">
                {events.filter(e => e.code_acces).length}
              </h3>
              <p className="text-sm text-green-600">Avec codes d'accès</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">
                {events.filter(e => new Date(e.date_debut) > new Date()).length}
              </h3>
              <p className="text-sm text-purple-600">Événements à venir</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}