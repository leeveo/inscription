'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Session {
  id: string
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  lieu?: string
  intervenant?: string
  isCheckedIn?: boolean
  checkedInAt?: string
  checkedBy?: string
}

interface Participant {
  id: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  profession?: string
}

interface Event {
  id: string
  nom: string
  date_debut: string
  lieu?: string
}

export default function CheckinPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/verify-qr/${token}`)
      const result = await response.json()
      
      if (result.success) {
        setParticipant(result.data.participant)
        setEvent(result.data.event)
        setSessions(result.data.sessions)
      } else {
        setError(result.message || 'Token invalide')
      }
    } catch (err) {
      console.error('Erreur vérification token:', err)
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du ticket...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Ticket invalide</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header avec info événement */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <h1 className="text-2xl font-bold">{event?.nom}</h1>
            <div className="flex items-center mt-2 text-blue-100">
              <span>📅 {event?.date_debut ? new Date(event.date_debut).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}</span>
              {event?.lieu && <span className="ml-4">📍 {event.lieu}</span>}
            </div>
          </div>
          
          {/* Info participant */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Informations participant</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800">{participant?.prenom} {participant?.nom}</h3>
              <p className="text-blue-600">{participant?.email}</p>
              {participant?.telephone && (
                <p className="text-blue-600">{participant.telephone}</p>
              )}
              {participant?.profession && (
                <p className="text-sm text-gray-600 mt-1">{participant.profession}</p>
              )}
            </div>
          </div>
          
          {/* Statut check-in */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Sessions inscrites</h2>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {sessions.filter(s => s.isCheckedIn).length} / {sessions.length} check-ins
              </div>
            </div>
            
            {sessions.length === 0 ? (
              <p className="text-gray-500 italic">Aucune session inscrite</p>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div 
                    key={session.id}
                    className={`p-4 border-2 rounded-lg ${
                      session.isCheckedIn 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{session.titre}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span>📅 {new Date(session.date).toLocaleDateString('fr-FR')}</span>
                          <span className="ml-4">⏰ {session.heure_debut} - {session.heure_fin}</span>
                          {session.lieu && <span className="ml-4">📍 {session.lieu}</span>}
                        </div>
                        {session.intervenant && (
                          <p className="text-sm text-gray-600 mt-1">👤 {session.intervenant}</p>
                        )}
                        {session.description && (
                          <p className="text-sm text-gray-600 mt-2">{session.description}</p>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        {session.isCheckedIn ? (
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ Check-in fait
                          </div>
                        ) : (
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            ⏳ En attente
                          </div>
                        )}
                        {session.isCheckedIn && session.checkedInAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.checkedInAt).toLocaleString('fr-FR')}
                          </p>
                        )}
                        {session.checkedBy && (
                          <p className="text-xs text-gray-500">Par: {session.checkedBy}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h2>
          <div className="space-y-2 text-gray-600">
            <p className="flex items-start">
              <span className="text-blue-500 mr-2">1.</span>
              Présentez ce QR code à l'entrée de chaque session
            </p>
            <p className="flex items-start">
              <span className="text-blue-500 mr-2">2.</span>
              L'hôtesse scannera votre code pour confirmer votre présence
            </p>
            <p className="flex items-start">
              <span className="text-blue-500 mr-2">3.</span>
              Le statut de check-in sera mis à jour automatiquement
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-blue-800 font-medium">💡 Conseil</p>
            <p className="text-blue-700 text-sm mt-1">
              Gardez cette page ouverte ou ajoutez-la à vos favoris pour suivre vos check-ins en temps réel.
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push(`/ticket/${participant?.id}`)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mr-4"
          >
            Voir mon ticket complet
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  )
}