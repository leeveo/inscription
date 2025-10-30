'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Session {
  id: string
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
  lieu?: string
  intervenant?: string
}

interface Participant {
  id: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  profession?: string
}

interface CheckinDetail {
  checkin_id: string
  checked_in_at: string
  checked_by: string
  notes?: string
  participant_id: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  session_id: string
  session_titre: string
  session_date: string
  heure_debut: string
  heure_fin: string
  session_lieu?: string
  intervenant?: string
}

interface CheckinStats {
  total: number
  bySession: Record<string, number>
}

interface CheckinManagerProps {
  eventId: string
  eventName: string
}

export default function CheckinManager({ eventId, eventName }: CheckinManagerProps) {
  const [checkins, setCheckins] = useState<CheckinDetail[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<CheckinStats>({ total: 0, bySession: {} })
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Fetch sessions pour le filtre
  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/sessions/participants?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    }
  }

  // Fetch check-ins
  const fetchCheckins = async () => {
    try {
      const url = selectedSessionId === 'all' 
        ? `/api/checkin?eventId=${eventId}`
        : `/api/checkin?eventId=${eventId}&sessionId=${selectedSessionId}`
        
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCheckins(data.data.checkins || [])
        setStats(data.data.stats || { total: 0, bySession: {} })
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Erreur lors du chargement des check-ins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchSessions()
    fetchCheckins()
  }, [eventId, selectedSessionId])

  // Auto refresh
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCheckins()
      }, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh, selectedSessionId])

  // Filter checkins by search term
  const filteredCheckins = checkins.filter(checkin =>
    `${checkin.prenom} ${checkin.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkin.session_titre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group checkins by session
  const checkinsBySession = filteredCheckins.reduce((acc, checkin) => {
    const sessionTitle = checkin.session_titre
    if (!acc[sessionTitle]) {
      acc[sessionTitle] = []
    }
    acc[sessionTitle].push(checkin)
    return acc
  }, {} as Record<string, CheckinDetail[]>)

  // Export CSV function
  const exportToCSV = () => {
    const csvContent = [
      ['Nom', 'Prénom', 'Email', 'Téléphone', 'Session', 'Date', 'Heure début', 'Check-in', 'Enregistré par'],
      ...filteredCheckins.map(checkin => [
        checkin.nom,
        checkin.prenom,
        checkin.email,
        checkin.telephone || '',
        checkin.session_titre,
        new Date(checkin.session_date).toLocaleDateString('fr-FR'),
        checkin.heure_debut,
        new Date(checkin.checked_in_at).toLocaleString('fr-FR'),
        checkin.checked_by
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `checkins-${eventName}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
            <h2 className="text-xl font-semibold text-gray-900">Check-ins en temps réel</h2>
            <p className="text-sm text-gray-600 mt-1">
              Suivez les participants qui se sont enregistrés • 
              Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Lien vers le scanner */}
            <Link 
              href="/qr-scanner"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
              </svg>
              Scanner QR
            </Link>

            {/* Export CSV */}
            <button
              onClick={exportToCSV}
              disabled={filteredCheckins.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50"
              title="Exporter les check-ins en CSV"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exporter CSV ({filteredCheckins.length})
            </button>

            {/* Auto refresh */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-actualisation</span>
            </label>

            {/* Manual refresh */}
            <button
              onClick={fetchCheckins}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">{stats.total}</h3>
            <p className="text-sm text-blue-600">Total check-ins</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">{Object.keys(checkinsBySession).length}</h3>
            <p className="text-sm text-green-600">Sessions actives</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">{new Set(filteredCheckins.map(c => c.participant_id)).size}</h3>
            <p className="text-sm text-purple-600">Participants uniques</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800">{Object.keys(stats.bySession).length}</h3>
            <p className="text-sm text-orange-600">Sessions avec check-ins</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un participant ou une session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les sessions</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.titre} ({stats.bySession[session.titre] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des check-ins */}
        {filteredCheckins.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun check-in</h3>
            <p className="text-gray-600">
              {searchTerm || selectedSessionId !== 'all' 
                ? 'Aucun check-in ne correspond aux critères de recherche'
                : 'Aucun participant ne s\'est encore enregistré'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(checkinsBySession).map(([sessionTitle, sessionCheckins]) => (
              <div key={sessionTitle} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-900">{sessionTitle}</h3>
                  <p className="text-sm text-gray-600">{sessionCheckins.length} participant(s) enregistré(s)</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enregistré par
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionCheckins.map(checkin => (
                        <tr key={checkin.checkin_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {checkin.prenom} {checkin.nom}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{checkin.email}</div>
                            {checkin.telephone && (
                              <div className="text-sm text-gray-500">{checkin.telephone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(checkin.checked_in_at).toLocaleString('fr-FR')}
                            </div>
                            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✅ Présent
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {checkin.checked_by}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}