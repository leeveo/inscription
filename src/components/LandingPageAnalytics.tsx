'use client'

import { useState, useEffect } from 'react'
import { 
  EyeIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalVisits: number
  uniqueVisitors: number
  conversions: number
  conversionRate: number
  visitsByDate: Array<{ date: string; visits: number; conversions: number }>
  topParticipants: Array<{
    participant_name: string
    participant_email: string
    visits: number
    converted: boolean
    last_visit: string
  }>
}

interface LandingPageAnalyticsProps {
  eventId: string
}

export default function LandingPageAnalytics({ eventId }: LandingPageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [eventId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/landing-page?eventId=${eventId}&timeRange=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-20 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Erreur: {error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Landing Page</h3>
          <p className="text-sm text-gray-600">Suivi des performances de vos liens personnalisés</p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
        </select>
      </div>

      {analytics && (
        <>
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <EyeIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Visites totales</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalVisits}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Visiteurs uniques</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.uniqueVisitors}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-900">Conversions</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.conversions}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Taux conversion</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics.conversionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique des visites par date */}
          {analytics.visitsByDate && analytics.visitsByDate.length > 0 && (
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Évolution des visites</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-end justify-between h-32 space-x-2">
                  {analytics.visitsByDate.map((day, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="flex flex-col items-center justify-end h-20 w-full">
                        {day.visits > 0 && (
                          <>
                            <div 
                              className="bg-blue-500 w-full rounded-t"
                              style={{ 
                                height: `${Math.max((day.visits / Math.max(...analytics.visitsByDate.map(d => d.visits))) * 60, 4)}px` 
                              }}
                            ></div>
                            {day.conversions > 0 && (
                              <div 
                                className="bg-green-500 w-full"
                                style={{ 
                                  height: `${Math.max((day.conversions / Math.max(...analytics.visitsByDate.map(d => d.visits))) * 60, 2)}px` 
                                }}
                              ></div>
                            )}
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{formatDate(day.date)}</span>
                      <span className="text-xs font-medium text-gray-900">{day.visits}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span>Visites</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Conversions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top participants */}
          {analytics.topParticipants && analytics.topParticipants.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Participants les plus actifs</h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {analytics.topParticipants.map((participant, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {participant.participant_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {participant.participant_email}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{participant.visits}</div>
                          <div className="text-gray-600">visites</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {participant.converted ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                          <span className={participant.converted ? 'text-green-600' : 'text-gray-600'}>
                            {participant.converted ? 'Converti' : 'En attente'}
                          </span>
                        </div>
                        
                        <div className="text-right text-xs text-gray-500">
                          <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                          {formatDateTime(participant.last_visit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {analytics.totalVisits === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune visite enregistrée pour cette période</p>
              <p className="text-sm mt-2">Les données apparaîtront une fois que les participants visiteront leurs liens personnalisés</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}