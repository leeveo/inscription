'use client'

import { useState, useEffect, useRef } from 'react'
import QRScannerLayout from '@/components/QRScannerLayout'
import { BrowserQRCodeReader } from '@zxing/library'

// Types
interface Session {
  id: string
  titre: string
  description?: string
  date: string
  heure_debut: string
  heure_fin: string
  lieu?: string
  intervenant?: string
  type?: string
}

interface Event {
  id: string
  nom: string
  date_debut: string
  date_fin?: string
  lieu?: string
  description?: string
}

interface Participant {
  id: string
  prenom: string
  nom: string
  email: string
  telephone?: string
  profession?: string
  isCheckedIn?: boolean
  checkedInAt?: string
  checkedBy?: string
}

interface EventAccessData {
  event: Event
  sessions: Session[]
  stats: {
    totalSessions: number
    totalParticipants: number
  }
}

type AppState = 'login' | 'session-select' | 'scanner' | 'participant-search'
type ScannerTab = 'scan' | 'search'

export default function QRScannerApp() {
  // État principal
  const [appState, setAppState] = useState<AppState>('login')
  const [scannerTab, setScannerTab] = useState<ScannerTab>('scan')
  const [eventCode, setEventCode] = useState('')
  const [eventData, setEventData] = useState<EventAccessData | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [hostessName, setHostessName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  // Participants search
  const [participantSearch, setParticipantSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Participant[]>([])
  const [allParticipants, setAllParticipants] = useState<Participant[]>([])
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])

  // Scanner
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [codeReader, setCodeReader] = useState<BrowserQRCodeReader | null>(null)

  useEffect(() => {
    // Initialiser le lecteur QR
    const initializeQRReader = async () => {
      try {
        const reader = new BrowserQRCodeReader()
        setCodeReader(reader)
        console.log('✅ [QR-SCANNER] Lecteur QR initialisé')
      } catch (error) {
        console.error('❌ [QR-SCANNER] Erreur initialisation lecteur QR:', error)
        // Continue sans le lecteur QR, la caméra fonctionnera quand même
      }
    }
    
    initializeQRReader()

    return () => {
      console.log('🧹 [QR-SCANNER] Nettoyage des ressources...')
      // Nettoyer les ressources
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    const savedName = localStorage.getItem('hostess_name')
    if (savedName) {
      setHostessName(savedName)
    } else {
      // Définir un nom par défaut
      setHostessName('Hôtesse')
      localStorage.setItem('hostess_name', 'Hôtesse')
    }
  }, [])

  const saveHostessName = (name: string) => {
    setHostessName(name || 'Hôtesse')
    localStorage.setItem('hostess_name', name || 'Hôtesse')
  }

  const validateEventCode = async () => {
    console.log(`🔍 [QR-SCANNER] Validation du code événement: "${eventCode}"`)
    
    if (!eventCode) {
      console.log(`❌ [QR-SCANNER] Code événement vide`)
      setMessage({ type: 'error', text: 'Veuillez saisir un code événement' })
      return
    }

    const codeStr = String(eventCode).trim()
    if (codeStr.length < 3) {
      console.log(`❌ [QR-SCANNER] Code trop court: ${codeStr.length} caractères`)
      setMessage({ type: 'error', text: 'Veuillez saisir un code à au moins 3 chiffres' })
      return
    }

    setIsProcessing(true)
    try {
      console.log(`🌐 [QR-SCANNER] Appel API avec le code: "${codeStr}"`)
      const response = await fetch('/api/event-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventCode: codeStr })
      })

      console.log(`🌐 [QR-SCANNER] Réponse API status: ${response.status}`)
      const result = await response.json()
      console.log(`🌐 [QR-SCANNER] Données reçues:`, result)

      if (result.success) {
        console.log(`✅ [QR-SCANNER] Accès autorisé à l'événement: ${result.data.event.nom}`)
        console.log(`✅ [QR-SCANNER] Sessions trouvées: ${result.data.sessions.length}`)
        console.log(`✅ [QR-SCANNER] Participants: ${result.data.stats.totalParticipants}`)
        
        setEventData(result.data)
        setMessage({ type: 'success', text: result.message })
        setAppState('session-select')
      } else {
        console.log(`❌ [QR-SCANNER] Accès refusé: ${result.message}`)
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      console.error('❌ [QR-SCANNER] Erreur de connexion:', error)
      setMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectSession = (session: Session) => {
    setSelectedSession(session)
    setAppState('scanner')
    // Charger tous les participants de cette session
    loadAllParticipants(session.id)
  }

  // Charger tous les participants d'une session
  const loadAllParticipants = async (sessionId: string) => {
    if (!eventCode) return

    setIsProcessing(true)
    try {
      console.log(`🔍 [QR-SCANNER] Chargement participants session: ${sessionId}`)
      const response = await fetch(`/api/event-access?sessionId=${sessionId}&eventCode=${eventCode}`)
      const result = await response.json()

      if (result.success) {
        console.log(`✅ [QR-SCANNER] ${result.data.participants?.length || 0} participants trouvés`)
        setAllParticipants(result.data.participants || [])
        setSearchResults(result.data.participants || [])
      } else {
        console.log(`❌ [QR-SCANNER] Erreur chargement participants: ${result.message}`)
        setAllParticipants([])
        setSearchResults([])
      }
    } catch (error) {
      console.error('❌ [QR-SCANNER] Erreur chargement participants:', error)
      setAllParticipants([])
      setSearchResults([])
    } finally {
      setIsProcessing(false)
    }
  }

  const searchParticipants = async (searchTerm = participantSearch) => {
    if (!allParticipants.length) {
      // Si pas de participants chargés, charger d'abord
      if (selectedSession) {
        await loadAllParticipants(selectedSession.id)
      }
      return
    }

    // Filtrer localement les participants déjà chargés
    if (!searchTerm.trim()) {
      setSearchResults(allParticipants)
      return
    }

    const filtered = allParticipants.filter(participant => 
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.telephone?.includes(searchTerm) ||
      participant.profession?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    console.log(`🔍 [QR-SCANNER] Recherche "${searchTerm}": ${filtered.length} résultats`)
    setSearchResults(filtered)
  }

  const performManualCheckin = async (participant: Participant) => {
    if (!selectedSession || !hostessName.trim()) return

    setIsProcessing(true)
    try {
      // Créer un token temporaire pour le check-in manuel
      const tempToken = `manual_${participant.id}_${Date.now()}`
      
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: tempToken,
          sessionId: selectedSession.id,
          checkedBy: `${hostessName} (manuel)`,
          deviceInfo: { type: 'manual_checkin' }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: `✅ Check-in manuel réussi !` })
        setRecentCheckins(prev => [{ participant, session: selectedSession }, ...prev.slice(0, 4)])
        
        // Refresh search results
        await searchParticipants()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du check-in manuel' })
    } finally {
      setIsProcessing(false)
    }
  }

  const resetApp = () => {
    stopScanning() // Arrêter le scan avant de reset
    setAppState('login')
    setEventData(null)
    setSelectedSession(null)
    setMessage(null)
    setEventCode('')
  }

  const startScanning = async () => {
    console.log('🔍 [QR-SCANNER] Tentative de démarrage du scan...')
    
    if (!videoRef.current) {
      console.error('❌ [QR-SCANNER] Référence vidéo non trouvée')
      setMessage({ type: 'error', text: 'Erreur: élément vidéo non trouvé' })
      return
    }

    try {
      console.log('📷 [QR-SCANNER] Demande d\'accès à la caméra...')
      setIsScanning(true)
      setMessage({ type: 'info', text: 'Démarrage de la caméra...' })

      // Demander l'accès à la caméra
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      console.log('✅ [QR-SCANNER] Caméra accessible')
      setStream(mediaStream)
      
      // Connecter le stream à la vidéo
      videoRef.current.srcObject = mediaStream
      await videoRef.current.play()

      console.log('✅ [QR-SCANNER] Vidéo démarrée')
      setMessage({ type: 'success', text: 'Scanner actif' })

      // Si ZXing est disponible, utiliser le scanner QR
      if (codeReader) {
        console.log('🔍 [QR-SCANNER] Activation du scanner QR...')
        
        const result = await codeReader.decodeFromVideoDevice(
          undefined, // Utiliser la caméra par défaut
          videoRef.current,
          (result, error) => {
            if (result) {
              console.log('🎯 [QR-SCANNER] QR Code détecté:', result.getText())
              handleQRCodeDetected(result.getText())
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('❌ [QR-SCANNER] Erreur de scan:', error)
            }
          }
        )
      } else {
        console.log('⚠️ [QR-SCANNER] Scanner QR non disponible, caméra seulement')
        setMessage({ type: 'info', text: 'Caméra active - Scanner QR en cours d\'initialisation...' })
      }

    } catch (error) {
      console.error('❌ [QR-SCANNER] Erreur démarrage caméra:', error)
      setMessage({ 
        type: 'error', 
        text: `Impossible d'accéder à la caméra: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      })
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    console.log('📷 [QR-SCANNER] Arrêt du scan...')
    
    // Arrêter le stream média
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('� [QR-SCANNER] Track arrêté:', track.kind)
      })
      setStream(null)
    }
    
    // Réinitialiser la vidéo
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Arrêter le lecteur QR
    if (codeReader) {
      codeReader.reset()
    }
    
    setIsScanning(false)
    setMessage(null)
    console.log('✅ [QR-SCANNER] Scanner arrêté')
  }

  const handleQRCodeDetected = async (qrData: string) => {
    console.log('🔍 [QR-SCANNER] Traitement QR Code:', qrData)
    
    // Arrêter le scan temporairement
    stopScanning()
    
    try {
      // Extraire le token du QR code (format attendu: URL avec token)
      const url = new URL(qrData)
      const token = url.searchParams.get('token')
      
      if (!token || !selectedSession) {
        setMessage({ type: 'error', text: 'QR Code invalide ou session non sélectionnée' })
        return
      }

      console.log('🎫 [QR-SCANNER] Token extrait:', token)
      setMessage({ type: 'info', text: 'Vérification en cours...' })

      // Appeler l'API de check-in
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: token,
          sessionId: selectedSession.id,
          checkedBy: hostessName,
          deviceInfo: { 
            type: 'qr_scan',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: `✅ ${result.message}` })
        
        // Ajouter aux check-ins récents
        if (result.participant) {
          setRecentCheckins(prev => [
            { participant: result.participant, session: selectedSession },
            ...prev.slice(0, 4)
          ])
        }
      } else {
        setMessage({ type: 'error', text: result.message })
      }

    } catch (error) {
      console.error('❌ [QR-SCANNER] Erreur traitement QR:', error)
      setMessage({ type: 'error', text: 'QR Code invalide ou erreur de traitement' })
    }

    // Redémarrer le scan après 3 secondes
    setTimeout(() => {
      if (videoRef.current && codeReader) {
        startScanning()
      }
    }, 3000)
  }

  return (
    <QRScannerLayout>
      <div className="min-h-screen flex flex-col">
        {/* Messages */}
        {message && (
          <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white text-center ${
            message.type === 'success' ? 'bg-green-500' :
            message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {message.text}
          </div>
        )}

        {/* Écran de connexion */}
        {appState === 'login' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400/80 to-purple-500/80 backdrop-blur-lg rounded-full mx-auto mb-3 flex items-center justify-center border border-white/30 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M8 16l2-2m0 0h2m-2 0v2m0-2H8m4 2v2" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white drop-shadow-lg">Scanner Check-in</h1>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3 text-center">
                    Code événement
                  </label>
                  
                  {/* Affichage du code saisi */}
                  <div className="mb-3">
                    <div className="w-full p-3 text-center text-xl font-bold bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl text-white min-h-[50px] flex items-center justify-center">
                      {eventCode || "----"}
                    </div>
                  </div>

                  {/* Digicode numérique */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => {
                          if (eventCode.length < 10) {
                            setEventCode(eventCode + digit.toString())
                          }
                        }}
                        className="aspect-square bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl text-white text-lg font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-lg active:scale-95"
                      >
                        {digit}
                      </button>
                    ))}
                    
                    {/* Bouton Effacer */}
                    <button
                      onClick={() => setEventCode(eventCode.slice(0, -1))}
                      className="aspect-square bg-red-500/20 backdrop-blur-lg border border-red-400/30 rounded-xl text-red-200 text-sm font-bold hover:bg-red-500/30 hover:scale-105 transition-all duration-300 hover:shadow-lg active:scale-95"
                    >
                      ⌫
                    </button>
                    
                    {/* Bouton 0 */}
                    <button
                      onClick={() => {
                        if (eventCode.length < 10) {
                          setEventCode(eventCode + "0")
                        }
                      }}
                      className="aspect-square bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl text-white text-lg font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-lg active:scale-95"
                    >
                      0
                    </button>
                    
                    {/* Bouton Tout effacer */}
                    <button
                      onClick={() => setEventCode('')}
                      className="aspect-square bg-orange-500/20 backdrop-blur-lg border border-orange-400/30 rounded-xl text-orange-200 text-xs font-bold hover:bg-orange-500/30 hover:scale-105 transition-all duration-300 hover:shadow-lg active:scale-95"
                    >
                      C
                    </button>
                  </div>

                  <p className="text-xs text-white/60 text-center">
                    Code à 4 chiffres ou ID numérique
                  </p>
                </div>

                <button
                  onClick={validateEventCode}
                  disabled={!eventCode || eventCode.length !== 4 || isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 active:scale-95"
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
          <div className="flex-1 p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{eventData.event.nom}</h1>
                <p className="text-white/80">
                  {eventData.sessions.length} session{eventData.sessions.length > 1 ? 's' : ''} disponible{eventData.sessions.length > 1 ? 's' : ''}
                </p>
                {eventData.stats.totalParticipants > 0 && (
                  <p className="text-sm text-blue-300 mt-1">
                    {eventData.stats.totalParticipants} participant{eventData.stats.totalParticipants > 1 ? 's' : ''} inscrit{eventData.stats.totalParticipants > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {eventData.sessions.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {eventData.sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => selectSession(session)}
                      className="p-4 bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl hover:border-blue-400/50 hover:bg-white/10 cursor-pointer transition-all duration-300 active:scale-95 hover:shadow-xl hover:shadow-blue-500/10"
                    >
                      <h3 className="font-semibold text-white">{session.titre}</h3>
                      <div className="text-sm text-white/70 mt-1">
                        <p>📅 {new Date(session.date).toLocaleDateString('fr-FR')}</p>
                        <p>⏰ {session.heure_debut} - {session.heure_fin}</p>
                        {session.lieu && <p>📍 {session.lieu}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune session trouvée</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Cet événement ne contient aucune session pour l'instant.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 font-medium mb-1">💡 Suggestions :</p>
                    <ul className="text-blue-700 text-left space-y-1">
                      <li>• Vérifiez que l'événement ID <strong>{eventData.event.id}</strong> est correct</li>
                      <li>• Les sessions sont peut-être dans un autre événement</li>
                      <li>• Contactez l'administrateur pour créer des sessions</li>
                    </ul>
                  </div>
                </div>
              )}

              <button
                onClick={resetApp}
                className="w-full py-3 bg-white/10 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                ← Retour
              </button>
            </div>
          </div>
        )}

        {/* Interface principale avec onglets */}
        {appState === 'scanner' && selectedSession && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="font-bold text-white drop-shadow-lg">{selectedSession.titre}</h1>
                  <p className="text-sm text-white/70">{eventData?.event.nom}</p>
                </div>
                <button
                  onClick={() => setAppState('session-select')}
                  className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all duration-300 hover:shadow-lg"
                >
                  ← Sessions
                </button>
              </div>

              {/* Navigation onglets */}
              <div className="flex bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-1">
                <button
                  onClick={() => setScannerTab('scan')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    scannerTab === 'scan' 
                      ? 'bg-white/20 backdrop-blur-lg text-white shadow-lg border border-white/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📷 Scanner QR
                </button>
                <button
                  onClick={() => setScannerTab('search')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    scannerTab === 'search' 
                      ? 'bg-white/20 backdrop-blur-lg text-white shadow-lg border border-white/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  🔍 Rechercher
                </button>
              </div>
            </div>

            {/* Zone Scanner QR */}
            <div className="flex-1 p-4">
              {scannerTab === 'scan' && (
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <h2 className="text-lg font-semibold mb-4">Scanner QR Code</h2>
                  
                  {/* Vidéo toujours présente mais cachée si pas en cours de scan */}
                  <div className="relative">
                    <video 
                      ref={videoRef} 
                      className={`w-full max-w-sm mx-auto rounded-xl border-4 ${isScanning ? 'border-green-500' : 'border-gray-300'}`} 
                      style={{ 
                        maxHeight: '300px',
                        display: isScanning ? 'block' : 'none'
                      }}
                      autoPlay 
                      playsInline 
                      muted
                    />
                    
                    {/* Overlay quand caméra non active */}
                    {!isScanning && (
                      <div className="w-full max-w-sm mx-auto h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-2">📷</div>
                          <p className="text-gray-600">Caméra désactivée</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Animation de scan quand actif */}
                    {isScanning && (
                      <div className="absolute inset-0 border-2 border-red-500 border-dashed rounded-xl pointer-events-none animate-pulse"></div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {!isScanning ? (
                      <>
                        <button
                          onClick={() => {
                            console.log('🔘 [QR-SCANNER] Bouton "Démarrer le scan" cliqué')
                            console.log('🔍 [QR-SCANNER] État:', { 
                              codeReader: !!codeReader, 
                              videoRef: !!videoRef.current,
                              isScanning 
                            })
                            startScanning()
                          }}
                          className="w-full py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl hover:from-blue-400/90 hover:to-purple-500/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                        >
                          Démarrer le scan
                        </button>
                        
                        <button
                          onClick={() => {
                            const qrData = prompt('Collez l\'URL du QR code ou le token:')
                            if (qrData) {
                              handleQRCodeDetected(qrData)
                            }
                          }}
                          className="w-full py-3 bg-white/10 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                        >
                          Saisie manuelle
                        </button>
                        
                        {/* Bouton de test caméra */}
                        <button
                          onClick={async () => {
                            console.log('🧪 [QR-SCANNER] Test caméra...')
                            try {
                              const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                              console.log('✅ [QR-SCANNER] Caméra accessible pour le test')
                              stream.getTracks().forEach(track => track.stop())
                              setMessage({ type: 'success', text: 'Test caméra réussi !' })
                            } catch (error) {
                              console.error('❌ [QR-SCANNER] Test caméra échoué:', error)
                              setMessage({ type: 'error', text: `Test caméra échoué: ${error instanceof Error ? error.message : 'Erreur inconnue'}` })
                            }
                          }}
                          className="w-full py-2 bg-yellow-500/70 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl hover:bg-yellow-400/80 transition-all duration-300 hover:scale-105 text-sm"
                        >
                          🧪 Test caméra (debug)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={stopScanning}
                          className="w-full py-3 bg-red-500/80 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl hover:bg-red-400/90 transition-all duration-300 hover:scale-105"
                        >
                          Arrêter le scan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Recherche participants */}
              {scannerTab === 'search' && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white drop-shadow-lg">Participants de la session</h2>
                    <span className="bg-blue-500/20 backdrop-blur-lg border border-white/30 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {searchResults.length} participant{searchResults.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Barre de recherche */}
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={participantSearch}
                      onChange={(e) => {
                        setParticipantSearch(e.target.value)
                        searchParticipants(e.target.value)
                      }}
                      placeholder="Rechercher par nom, email, téléphone..."
                      className="flex-1 p-3 bg-white/10 backdrop-blur-lg border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/60"
                    />
                    <button
                      onClick={() => {
                        setParticipantSearch('')
                        searchParticipants('')
                      }}
                      className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                      title="Effacer la recherche"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Statistiques rapides */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-green-500/20 backdrop-blur-lg border border-green-400/30 rounded-lg p-3 text-center">
                      <div className="text-green-200 font-bold text-lg">
                        {searchResults.filter(p => p.isCheckedIn).length}
                      </div>
                      <div className="text-green-300">Présents</div>
                    </div>
                    <div className="bg-orange-500/20 backdrop-blur-lg border border-orange-400/30 rounded-lg p-3 text-center">
                      <div className="text-orange-200 font-bold text-lg">
                        {searchResults.filter(p => !p.isCheckedIn).length}
                      </div>
                      <div className="text-orange-300">Absents</div>
                    </div>
                  </div>

                  {/* Message de chargement */}
                  {isProcessing && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-white/80">Chargement des participants...</p>
                    </div>
                  )}

                  {/* Liste des participants */}
                  {!isProcessing && searchResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map(participant => (
                        <div
                          key={participant.id}
                          className={`p-4 border rounded-xl backdrop-blur-lg transition-all duration-300 ${
                            participant.isCheckedIn 
                              ? 'border-green-400/50 bg-green-500/10' 
                              : 'border-white/20 bg-white/5 hover:border-blue-400/50 hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white drop-shadow-lg">
                                {participant.prenom} {participant.nom}
                              </h3>
                              <div className="text-sm space-y-1 mt-1">
                                <p className="text-blue-200 font-medium">📧 {participant.email}</p>
                                {participant.telephone && (
                                  <p className="text-green-200 font-medium">📱 {participant.telephone}</p>
                                )}
                                {participant.profession && (
                                  <p className="text-yellow-200 font-medium">💼 {participant.profession}</p>
                                )}
                              </div>
                              {participant.isCheckedIn && participant.checkedInAt && (
                                <div className="text-xs text-green-300 mt-2 font-semibold bg-green-500/20 px-2 py-1 rounded">
                                  ✅ Présent depuis {new Date(participant.checkedInAt).toLocaleTimeString('fr-FR')}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              {participant.isCheckedIn ? (
                                <div className="bg-green-500/30 backdrop-blur-lg border border-green-400/50 text-green-200 px-4 py-2 rounded-full text-sm font-medium">
                                  ✅ Présent
                                </div>
                              ) : (
                                <button
                                  onClick={() => performManualCheckin(participant)}
                                  disabled={isProcessing}
                                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                                >
                                  ➕ Check-in
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message si aucun participant */}
                  {!isProcessing && searchResults.length === 0 && allParticipants.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">Aucun participant</h3>
                      <p className="text-white/80 text-sm">
                        Cette session ne contient aucun participant inscrit.
                      </p>
                    </div>
                  )}

                  {/* Message si recherche sans résultat */}
                  {!isProcessing && searchResults.length === 0 && allParticipants.length > 0 && participantSearch.trim() && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-white mb-2 drop-shadow-lg">Aucun résultat</h3>
                      <p className="text-white/80 text-sm">
                        Aucun participant trouvé pour "{participantSearch}"
                      </p>
                      <button
                        onClick={() => {
                          setParticipantSearch('')
                          searchParticipants('')
                        }}
                        className="mt-3 px-4 py-2 bg-blue-500/80 backdrop-blur-lg border border-white/30 text-white rounded-lg hover:bg-blue-400/90 transition-all duration-300 hover:scale-105"
                      >
                        Afficher tous les participants
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Check-ins récents */}
        {recentCheckins.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-4">
            <h3 className="text-sm font-semibold mb-2 text-white">Check-ins récents :</h3>
            <div className="space-y-1">
              {recentCheckins.slice(0, 3).map((checkin, index) => (
                <div key={index} className="text-xs bg-green-500/20 backdrop-blur-lg border border-green-400/30 p-2 rounded text-green-200">
                  ✅ {checkin?.participant?.prenom} {checkin?.participant?.nom}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </QRScannerLayout>
  )
}