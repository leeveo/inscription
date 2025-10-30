'use client'

import { useState, useRef, useEffect } from 'react'

interface Participant {
  id: string
  nom: string
  prenom: string
  email: string
  isCheckedIn?: boolean
}

interface Session {
  id: string
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
  lieu?: string
}

interface Event {
  id: string
  nom: string
}

interface QRScanResult {
  success: boolean
  data?: {
    token: string
    participant: Participant
    event: Event
    sessions: Session[]
    totalSessions: number
    checkedInSessions: number
  }
  error?: string
}

interface EventData {
  event: Event
  sessions: Session[]
  stats: {
    totalSessions: number
    totalParticipants: number
  }
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

interface RecentCheckin {
  participant?: Participant
}

type AppState = 'login' | 'session-select' | 'scanner' | 'participant-search'

export default function QRScannerPage() {
  // État de l'application
  const [appState, setAppState] = useState<AppState>('login')
  const [eventCode, setEventCode] = useState('')
  const [hostessName, setHostessName] = useState('')
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  
  // État du scanner
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<QRScanResult | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  
  // État des recherches
  const [participantSearch, setParticipantSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Participant[]>([])
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([])

  // Charger le nom de l'hôtesse depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hostess-name')
    if (saved) {
      setHostessName(saved)
    }
  }, [])

  // Fonction pour sauvegarder le nom de l'hôtesse
  const saveHostessName = (name: string) => {
    setHostessName(name)
    localStorage.setItem('hostess-name', name)
  }

  // Fonction pour afficher un message
  const showMessage = (type: Message['type'], text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // Validation du code événement
  const validateEventCode = async () => {
    if (!eventCode || eventCode.length !== 4 || !hostessName.trim()) return
    
    setIsProcessing(true)
    try {
      const response = await fetch('/api/event-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: eventCode })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setEventData(result.data)
        setAppState('session-select')
        showMessage('success', `Connecté à l'événement: ${result.data.event.nom}`)
      } else {
        showMessage('error', result.error || 'Code événement invalide')
      }
    } catch (error) {
      console.error('Erreur validation:', error)
      showMessage('error', 'Erreur de connexion')
    } finally {
      setIsProcessing(false)
    }
  }

  // Sélection d'une session
  const selectSession = (session: Session) => {
    setSelectedSession(session)
    setAppState('scanner')
    showMessage('info', `Session sélectionnée: ${session.titre}`)
  }

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setMediaStream(stream)
        setIsScanning(true)
        
        // Démarrer la détection QR après un court délai
        setTimeout(detectQRCode, 500)
      }
    } catch (error) {
      console.error('Erreur caméra:', error)
      showMessage('error', 'Impossible d\'accéder à la caméra')
    }
  }

  // Arrêter la caméra
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setIsScanning(false)
  }

  // Détection QR Code (simulation simplifiée)
  const detectQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return
    
    // Dans une vraie implémentation, on utiliserait une bibliothèque comme jsQR
    // Ici on simule la détection
    setTimeout(detectQRCode, 100)
  }

  // Scanner manuel
  const manualScan = () => {
    const token = prompt('Entrez le token QR manuellement:')
    if (token) {
      processQRToken(token)
    }
  }

  // Traitement du token QR
  const processQRToken = async (token: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/verify-qr/${token}`)
      const result = await response.json()
      
      if (result.success) {
        setScannedData(result)
        showMessage('success', 'QR Code valide!')
        stopCamera()
      } else {
        showMessage('error', result.error || 'QR Code invalide')
      }
    } catch (error) {
      console.error('Erreur traitement QR:', error)
      showMessage('error', 'Erreur lors du traitement du QR Code')
    } finally {
      setIsProcessing(false)
    }
  }

  // Check-in du participant
  const performCheckin = async () => {
    if (!scannedData?.data || !selectedSession) return
    
    setIsProcessing(true)
    try {
      const checkinData = {
        participantId: scannedData.data.participant.id,
        sessionId: selectedSession.id,
        eventId: eventData?.event.id,
        hostessName,
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          type: 'mobile_scanner'
        }
      }
      
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkinData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Ajouter aux check-ins récents
        setRecentCheckins(prev => [
          { participant: scannedData.data!.participant },
          ...prev.slice(0, 4)
        ])
        
        showMessage('success', `✅ Check-in confirmé pour ${scannedData.data.participant.prenom} ${scannedData.data.participant.nom}`)
        reset()
      } else {
        showMessage('error', result.error || 'Erreur lors du check-in')
      }
    } catch (error) {
      console.error('Erreur check-in:', error)
      showMessage('error', 'Erreur lors du check-in')
    } finally {
      setIsProcessing(false)
    }
  }

  // Recherche de participants
  const searchParticipants = async () => {
    if (!participantSearch.trim() || !eventData) return
    
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/event-access?eventId=${eventData.event.id}&search=${participantSearch}`)
      const result = await response.json()
      
      if (result.success) {
        setSearchResults(result.participants || [])
        if (result.participants?.length === 0) {
          showMessage('info', 'Aucun participant trouvé')
        }
      } else {
        showMessage('error', 'Erreur lors de la recherche')
      }
    } catch (error) {
      console.error('Erreur recherche:', error)
      showMessage('error', 'Erreur lors de la recherche')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset de l'application
  const resetApp = () => {
    setAppState('login')
    setEventCode('')
    setEventData(null)
    setSelectedSession(null)
    setScannedData(null)
    setMessage(null)
    setParticipantSearch('')
    setSearchResults([])
    stopCamera()
  }

  // Reset vers la sélection de session
  const resetToSessionSelect = () => {
    setAppState('session-select')
    setSelectedSession(null)
    setScannedData(null)
    setMessage(null)
    stopCamera()
  }

  // Reset du scanner
  const reset = () => {
    setScannedData(null)
    setMessage(null)
  }

  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 overflow-hidden">
      {/* Styles PWA et mobile */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-size: 16px;
        }
        
        /* Masquer les barres de défilement */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* PWA - Mode plein écran */
        @media (display-mode: standalone) {
          .qr-app {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      <div className="qr-app min-h-screen flex flex-col">
        {/* Messages */}
        {message && (
          <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg ${
            message.type === 'success' ? 'bg-green-500 text-white' :
            message.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Écran de connexion */}
        {appState === 'login' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner Check-in</h1>
                <p className="text-gray-600">Entrez le code événement pour commencer</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Code événement (4 chiffres)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-5 text-center text-3xl font-bold border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nom de l'hôtesse
                  </label>
                  <input
                    type="text"
                    value={hostessName}
                    onChange={(e) => saveHostessName(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom..."
                  />
                </div>

                <button
                  onClick={validateEventCode}
                  disabled={!eventCode || eventCode.length !== 4 || !hostessName.trim() || isProcessing}
                  className="w-full py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Validation...
                    </div>
                  ) : (
                    'Accéder à l\'événement'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sélection de session */}
        {appState === 'session-select' && eventData && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{eventData.event.nom}</h1>
                <p className="text-gray-600 mt-2">Sélectionnez une session</p>
                <div className="text-sm text-gray-500 mt-1">
                  {eventData.stats.totalSessions} sessions • {eventData.stats.totalParticipants} participants
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {eventData.sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{session.titre}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(session.date).toLocaleDateString('fr-FR')} • {session.heure_debut} - {session.heure_fin}
                    </div>
                    {session.lieu && (
                      <div className="text-sm text-gray-500">📍 {session.lieu}</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setAppState('participant-search')}
                  className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600"
                >
                  🔍 Recherche participant
                </button>
                <button
                  onClick={resetApp}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600"
                >
                  ← Retour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scanner */}
        {appState === 'scanner' && selectedSession && (
          <div className="flex-1 flex flex-col">
            <div className="bg-white/10 backdrop-blur-sm text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold">{selectedSession.titre}</h2>
                <button
                  onClick={resetToSessionSelect}
                  className="text-white/80 hover:text-white"
                >
                  ← Sessions
                </button>
              </div>
              <div className="text-sm opacity-80">
                Hôtesse: {hostessName}
              </div>
            </div>

            {!scannedData ? (
              <div className="flex-1 p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto h-full">
                  {isScanning ? (
                    <div className="space-y-4">
                      <video
                        ref={videoRef}
                        className="w-full rounded-2xl"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <button
                        onClick={stopCamera}
                        className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600"
                      >
                        Arrêter le scan
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="bg-gray-200 h-64 rounded-2xl flex items-center justify-center">
                        <div>
                          <div className="text-6xl mb-4">📷</div>
                          <p className="text-gray-600">Prêt à scanner</p>
                        </div>
                      </div>
                      <button
                        onClick={startCamera}
                        className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600"
                      >
                        Démarrer le scan
                      </button>
                      <button
                        onClick={manualScan}
                        disabled={isProcessing}
                        className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50"
                      >
                        {isProcessing ? 'Traitement...' : 'Saisie manuelle'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto space-y-6">
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <h3 className="font-bold text-blue-800">Participant trouvé</h3>
                    <p className="font-semibold text-lg">{scannedData.data?.participant.prenom} {scannedData.data?.participant.nom}</p>
                    <p className="text-sm text-gray-600">{scannedData.data?.participant.email}</p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={performCheckin}
                      disabled={isProcessing}
                      className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50"
                    >
                      {isProcessing ? 'Check-in...' : 'Confirmer Check-in'}
                    </button>
                    <button
                      onClick={reset}
                      className="px-6 bg-gray-500 text-white py-4 rounded-xl font-semibold hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {recentCheckins.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm text-white p-4">
                <h3 className="text-sm font-semibold mb-2">Derniers check-ins:</h3>
                {recentCheckins.slice(0, 3).map((checkin, index) => (
                  <div key={index} className="text-xs bg-white/20 rounded-lg p-2 mb-1">
                    ✅ {checkin?.participant?.prenom} {checkin?.participant?.nom}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recherche participants */}
        {appState === 'participant-search' && selectedSession && (
          <div className="flex-1 p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedSession.titre}</h2>
                <p className="text-gray-600">Recherche participant</p>
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  placeholder="Email du participant..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={searchParticipants}
                  disabled={!participantSearch.trim() || isProcessing}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                  {isProcessing ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3 mb-6">
                  {searchResults.map(participant => (
                    <div key={participant.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{participant.prenom} {participant.nom}</div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                          {participant.isCheckedIn && (
                            <div className="text-xs text-green-600 mt-1">✅ Déjà enregistré</div>
                          )}
                        </div>
                        {!participant.isCheckedIn && (
                          <button
                            onClick={() => {
                              // Simuler un scan pour ce participant
                              setScannedData({
                                success: true,
                                data: {
                                  token: `manual_${participant.id}`,
                                  participant: participant,
                                  event: eventData!.event,
                                  sessions: [],
                                  totalSessions: 0,
                                  checkedInSessions: 0
                                }
                              })
                              setAppState('scanner')
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={resetToSessionSelect}
                className="w-full py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600"
              >
                ← Retour aux sessions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}