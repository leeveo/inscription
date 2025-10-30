'use client'

import { useState, useEffect } from 'react'
import QRScannerLayout from '@/components/QRScannerLayout'

// Types
interface Event {
  id: string
  nom: string
  code_acces: string
  date_debut: string
  lieu?: string
}

interface Session {
  id: string
  nom: string
  date_debut: string
  heure_debut: string
  heure_fin: string
}

interface Participant {
  id: string
  nom: string
  prenom: string
  email: string
  entreprise?: string
  statut_checkin?: boolean
}

type AppState = 'login' | 'session-select' | 'scanner'
type ScannerTab = 'scan' | 'search'

export default function MobileQRScanner() {
  // États principaux
  const [appState, setAppState] = useState<AppState>('login')
  const [scannerTab, setScannerTab] = useState<ScannerTab>('scan')
  
  // Données de connexion
  const [eventCode, setEventCode] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  
  // Recherche de participants
  const [searchQuery, setSearchQuery] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  
  // États UI
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Validation du code événement
  const validateEventCode = async () => {
    if (!eventCode || eventCode.length !== 4) {
      setMessage('Code événement requis (4 chiffres)')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/event-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: eventCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Code invalide')
      }

      setSelectedEvent(data.event)
      setSessions(data.sessions)
      setAppState('session-select')
      setMessage('')
    } catch (error: any) {
      setMessage(error.message || 'Erreur de validation')
    } finally {
      setIsLoading(false)
    }
  }

  // Sélection de session
  const selectSession = (session: Session) => {
    setSelectedSession(session)
    setAppState('scanner')
    loadParticipants(session.id)
  }

  // Chargement des participants
  const loadParticipants = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/event-access?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (response.ok) {
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Erreur chargement participants:', error)
    }
  }

  // Filtrage des participants
  const filteredParticipants = participants.filter(p => 
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check-in manuel
  const handleManualCheckin = async (participantId: string) => {
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          sessionId: selectedSession?.id,
          eventId: selectedEvent?.id
        })
      })

      if (response.ok) {
        setMessage('✅ Check-in effectué avec succès')
        // Recharger les participants
        if (selectedSession) {
          loadParticipants(selectedSession.id)
        }
        // Effacer le message après 3 secondes
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du check-in')
      }
    } catch (error: any) {
      setMessage(error.message || 'Erreur lors du check-in')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Navigation
  const goBack = () => {
    switch (appState) {
      case 'session-select':
        setAppState('login')
        setSelectedEvent(null)
        setSessions([])
        setEventCode('')
        break
      case 'scanner':
        setAppState('session-select')
        setSelectedSession(null)
        setParticipants([])
        setScannerTab('scan')
        setSearchQuery('')
        break
    }
  }

  // Écran de connexion
  const renderLoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">QR Scanner</h1>
          <p className="text-white/80 text-lg">Check-in Mobile</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Code Événement</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              className="w-full p-4 text-center text-3xl font-bold bg-white/20 border-2 border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/50 backdrop-blur-sm"
            />
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 backdrop-blur-sm">
              <p className="text-red-200 text-center font-medium">{message}</p>
            </div>
          )}

          <button
            onClick={validateEventCode}
            disabled={isLoading || !eventCode || eventCode.length !== 4}
            className="w-full py-4 px-6 bg-white text-purple-900 font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-900 mr-3"></div>
                Validation...
              </div>
            ) : (
              'Accéder à l\'événement'
            )}
          </button>
        </div>

        {/* Info */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Entrez le code à 4 chiffres de votre événement
          </p>
        </div>
      </div>
    </div>
  )

  // Écran de sélection de session
  const renderSessionSelect = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={goBack}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedEvent?.nom}</h1>
            <p className="text-gray-600">Sélectionnez une session</p>
          </div>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="p-6">
        <div className="space-y-4">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => selectSession(session)}
              className="w-full bg-white rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-300 transform hover:-translate-y-1"
            >
              <h3 className="font-bold text-gray-900 text-lg mb-2">{session.nom}</h3>
              <div className="flex items-center text-gray-600 text-sm space-x-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(session.date_debut).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.heure_debut} - {session.heure_fin}
                </div>
              </div>
            </button>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session</h3>
            <p className="text-gray-500">Aucune session disponible pour cet événement</p>
          </div>
        )}
      </div>
    </div>
  )

  // Écran du scanner
  const renderScannerScreen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fixe */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div className="text-center">
            <h2 className="font-bold text-gray-900">{selectedSession?.nom}</h2>
            <p className="text-sm text-gray-600">{selectedEvent?.nom}</p>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Onglets */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setScannerTab('scan')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              scannerTab === 'scan'
                ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
              </svg>
              Scanner QR
            </div>
          </button>
          <button
            onClick={() => setScannerTab('search')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              scannerTab === 'search'
                ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </div>
          </button>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex-shrink-0">
          <p className="text-green-700 text-center font-medium">{message}</p>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 p-4 overflow-y-auto">
        {scannerTab === 'scan' ? (
          // Zone de scan QR
          <div className="bg-white rounded-3xl p-8 shadow-sm text-center h-full flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-300 mb-6">
                <div className="text-center">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
                  </svg>
                  <p className="text-gray-500 font-medium">Zone de scan QR</p>
                  <p className="text-sm text-gray-400 mt-2">Caméra à intégrer</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Scanner QR Code</h3>
              <p className="text-gray-600">Positionnez le QR code devant la caméra</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => alert('Fonctionnalité de caméra à intégrer (react-qr-reader ou similaire)')}
                className="w-full py-4 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors duration-300 shadow-lg transform hover:scale-105 active:scale-95"
              >
                Activer la caméra
              </button>
              
              <button
                onClick={() => {
                  const token = prompt('Collez le token QR ou saisissez-le manuellement:')
                  if (token) {
                    alert('Fonction de vérification QR à implémenter avec: ' + token)
                  }
                }}
                className="w-full py-4 px-6 bg-gray-600 text-white font-bold rounded-2xl hover:bg-gray-700 transition-colors duration-300"
              >
                Saisie manuelle
              </button>
            </div>
          </div>
        ) : (
          // Zone de recherche
          <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom, prénom ou email..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Résultats de recherche */}
            <div className="space-y-3">
              {filteredParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                        {participant.prenom} {participant.nom}
                      </h4>
                      <p className="text-gray-600 mb-1">{participant.email}</p>
                      {participant.entreprise && (
                        <p className="text-sm text-gray-500">{participant.entreprise}</p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      {participant.statut_checkin ? (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-medium flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Présent
                        </div>
                      ) : (
                        <button
                          onClick={() => handleManualCheckin(participant.id)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                          Check-in
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Messages informatifs */}
              {searchQuery && filteredParticipants.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant trouvé</h3>
                  <p className="text-gray-500">Aucun participant ne correspond à votre recherche</p>
                </div>
              )}

              {!searchQuery && participants.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h3>
                  <p className="text-gray-500">Aucun participant inscrit à cette session</p>
                </div>
              )}

              {!searchQuery && participants.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                  <p className="text-blue-700 font-medium">
                    💡 Utilisez la barre de recherche pour trouver un participant
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Rendu principal
  return (
    <QRScannerLayout>
      {appState === 'login' && renderLoginScreen()}
      {appState === 'session-select' && renderSessionSelect()}
      {appState === 'scanner' && renderScannerScreen()}
    </QRScannerLayout>
  )
}