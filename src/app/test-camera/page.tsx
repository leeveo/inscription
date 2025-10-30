'use client'

import { useState, useRef, useEffect } from 'react'

export default function TestCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      console.log('🔍 Tentative d\'accès à la caméra...')
      setError(null)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Caméra arrière sur mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      console.log('✅ Caméra accessible!')
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setIsScanning(true)
        console.log('✅ Vidéo démarrée!')
      }
      
    } catch (err) {
      console.error('❌ Erreur caméra:', err)
      setError(`Erreur d'accès à la caméra: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
    console.log('📷 Caméra arrêtée')
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Test Caméra</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erreur:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          {!isScanning ? (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📷</div>
                  <p className="text-gray-600">Caméra éteinte</p>
                </div>
              </div>
              
              <button
                onClick={startCamera}
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Démarrer la caméra
              </button>
            </div>
          ) : (
            <div className="text-center">
              <video
                ref={videoRef}
                className="w-full max-w-sm mx-auto rounded-lg border-4 border-green-500"
                autoPlay
                playsInline
                muted
              />
              
              <button
                onClick={stopCamera}
                className="w-full mt-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Arrêter la caméra
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <ul className="space-y-1">
            <li>• Caméra active: {isScanning ? '✅ Oui' : '❌ Non'}</li>
            <li>• Stream: {stream ? '✅ Connecté' : '❌ Déconnecté'}</li>
            <li>• Vidéo ref: {videoRef.current ? '✅ OK' : '❌ Null'}</li>
            <li>• User Agent: {typeof navigator !== 'undefined' ? 'Disponible' : 'Indisponible'}</li>
            <li>• HTTPS: {typeof window !== 'undefined' && window.location.protocol === 'https:' ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <p className="font-bold text-yellow-800">💡 Notes importantes:</p>
          <ul className="text-yellow-700 mt-1 space-y-1">
            <li>• La caméra nécessite HTTPS (sauf sur localhost)</li>
            <li>• Vérifiez les permissions dans le navigateur</li>
            <li>• Ouvrez la console (F12) pour voir les logs détaillés</li>
          </ul>
        </div>
      </div>
    </div>
  )
}