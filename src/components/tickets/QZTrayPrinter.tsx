'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FiPrinter, FiDownload, FiSettings, FiAlertCircle, FiCheckCircle, FiWifi, FiWifiOff } from 'react-icons/fi'
import { PrintType, PrintJob } from '@/types/ticket'

interface QZTrayPrinterProps {
  onPrintComplete?: (job: PrintJob) => void
  onError?: (error: string) => void
}

declare global {
  interface Window {
    qz: any
  }
}

export default function QZTrayPrinter({ onPrintComplete, onError }: QZTrayPrinterProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [printers, setPrinters] = useState<any[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [qzLoaded, setQzLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Charger QZ Tray
  useEffect(() => {
    loadQZTray()
  }, [])

  const loadQZTray = async () => {
    try {
      // Vérifier si QZ est déjà chargé
      if (window.qz) {
        setQzLoaded(true)
        return
      }

      // Charger le script QZ Tray
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.0/dist/qz-tray.js'
      script.async = true

      script.onload = () => {
        setQzLoaded(true)
        console.log('QZ Tray loaded successfully')
      }

      script.onerror = () => {
        console.error('Failed to load QZ Tray')
        onError?.('Impossible de charger QZ Tray. Veuillez l\'installer manuellement.')
      }

      document.head.appendChild(script)

    } catch (error) {
      console.error('Error loading QZ Tray:', error)
      onError?.('Erreur lors du chargement de QZ Tray')
    }
  }

  // Se connecter à QZ Tray
  const connect = useCallback(async () => {
    if (!qzLoaded || !window.qz) {
      onError?.('QZ Tray n\'est pas chargé')
      return
    }

    try {
      setIsLoading(true)

      // Démarrer la connexion
      await window.qz.websocket.connect()

      // Obtenir la liste des imprimantes
      const availablePrinters = await window.qz.printers.find()
      setPrinters(availablePrinters)

      // Sélectionner l'imprimante par défaut si disponible
      if (availablePrinters.length > 0) {
        setSelectedPrinter(availablePrinters[0])
      }

      setIsConnected(true)
      console.log('Connected to QZ Tray')

    } catch (error) {
      console.error('QZ Tray connection error:', error)
      onError?.('Erreur de connexion à QZ Tray. Assurez-vous que l\'application QZ Tray est démarrée.')
    } finally {
      setIsLoading(false)
    }
  }, [qzLoaded, onError])

  // Se déconnecter de QZ Tray
  const disconnect = useCallback(async () => {
    if (!isConnected || !window.qz) return

    try {
      await window.qz.websocket.disconnect()
      setIsConnected(false)
      setPrinters([])
      setSelectedPrinter('')
      console.log('Disconnected from QZ Tray')
    } catch (error) {
      console.error('QZ Tray disconnect error:', error)
    }
  }, [isConnected])

  // Imprimer avec QZ Tray
  const print = useCallback(async (options: {
    type: PrintType
    data: string | Uint8Array
    config?: any
  }) => {
    if (!isConnected || !selectedPrinter) {
      onError?.('Non connecté à une imprimante')
      return
    }

    try {
      setIsLoading(true)

      let config = {}
      let data = options.data

      // Configuration selon le type d'impression
      if (options.type === 'pdf') {
        config = {
          ...window.qz.configs.toPDF(),
          ...options.config
        }
      } else if (options.type === 'thermal') {
        config = {
          ...window.qz.configs.toRaw(),
          ...options.config
        }
      } else {
        // Impression locale standard
        config = {
          ...window.qz.configs.toPDF(),
          ...options.config
        }
      }

      // Lancer l'impression
      await window.qz.print(config, [data])

      console.log('Print job sent successfully')

    } catch (error) {
      console.error('QZ Tray print error:', error)
      onError?.(`Erreur d'impression: ${error}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, selectedPrinter, onError])

  // Imprimer un ticket
  const printTicket = useCallback(async (ticketInstance: any, printType: PrintType = 'pdf') => {
    try {
      // Préparer les données selon le type
      let data: string | Uint8Array
      let config: any = {}

      if (printType === 'thermal') {
        // Données ESC/POS pour impression thermique
        data = generateESCPOSData(ticketInstance)
        config = {
          ...window.qz.configs.toRaw(),
          altPrinting: true, // Utiliser l'imprimante thermique
          jobName: `Ticket-${ticketInstance.ticket_number}`
        }
      } else {
        // HTML pour impression PDF standard
        data = generateTicketHTML(ticketInstance)
        config = {
          ...window.qz.configs.toPDF(),
          ...{
            orientation: 'portrait',
            size: {
              width: '210mm',
              height: '297mm'
            },
            margins: {
              top: '10mm',
              right: '10mm',
              bottom: '10mm',
              left: '10mm'
            },
            jobName: `Ticket-${ticketInstance.ticket_number}`
          },
          ...(window.qz.configs.toHTML?.({
            pageSize: 'A4',
            margins: '10mm'
          }) || {})
        }
      }

      await print({ type: printType, data, config })

      // Notifier le succès
      onPrintComplete?.({
        id: `local-${Date.now()}`,
        ticket_instance_id: ticketInstance.id,
        print_type: printType,
        printer_name: selectedPrinter,
        print_options: {},
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        file_size: 0,
        print_duration: 0,
        created_by: 'system',
        retry_count: 0
      })

    } catch (error) {
      console.error('Print ticket error:', error)
      throw error
    }
  }, [print, selectedPrinter, onPrintComplete])

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isConnected
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {isConnected ? <FiWifi className="w-5 h-5" /> : <FiWifiOff className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Impression Locale (QZ Tray)</h3>
            <p className="text-sm text-gray-500">
              {isConnected
                ? `Connecté - ${printers.length} imprimante(s) disponible(s)`
                : 'Non connecté'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Paramètres"
          >
            <FiSettings className="w-4 h-4" />
          </button>
          {!qzLoaded && (
            <a
              href="https://qz.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <FiDownload className="w-3 h-3" />
              Télécharger QZ Tray
            </a>
          )}
        </div>
      </div>

      {/* Zone de connexion */}
      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Connexion requise</h4>
              <p className="text-sm text-blue-700 mt-1">
                QZ Tray permet d'imprimer directement depuis votre navigateur vers vos imprimantes locales.
              </p>
              <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
                <li>Téléchargez et installez QZ Tray depuis le site officiel</li>
                <li>Démarrez l'application QZ Tray sur votre ordinateur</li>
                <li>Cliquez sur "Se connecter" ci-dessous</li>
              </ol>
              <button
                onClick={connect}
                disabled={!qzLoaded || isLoading}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <FiWifi className="w-4 h-4" />
                )}
                Se connecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* État connecté */}
      {isConnected && (
        <div className="space-y-4">
          {/* Sélection de l'imprimante */}
          {printers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imprimante sélectionnée
              </label>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {printers.map((printer: any, index: number) => (
                  <option key={index} value={printer}>
                    {printer}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <FiCheckCircle className="w-4 h-4" />
              Prêt pour l'impression
            </div>
            <button
              onClick={disconnect}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Paramètres avancés */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Paramètres avancés</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version QZ Tray</span>
              <span className="text-sm font-mono text-gray-900">
                {window.qz?.version || 'Inconnue'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut WebSocket</span>
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-600' : 'text-gray-500'
              }`}>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Imprimantes détectées</span>
              <span className="text-sm font-medium text-gray-900">
                {printers.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Fonctions utilitaires pour générer les données d'impression

function generateTicketHTML(ticketInstance: any): string {
  // Générer le HTML du ticket (version simplifiée)
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket - ${ticketInstance.ticket_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .ticket {
          max-width: 400px;
          margin: 0 auto;
          border: 2px solid #333;
          padding: 20px;
          text-align: center;
        }
        .event-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .participant-name {
          font-size: 18px;
          margin-bottom: 5px;
        }
        .ticket-number {
          font-size: 14px;
          color: #666;
          margin-top: 20px;
        }
        .qr-code {
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="event-name">${ticketInstance.payload?.event_name || 'Événement'}</div>
        <div class="participant-name">${ticketInstance.payload?.participant_name || 'Participant'}</div>
        <div class="qr-code">
          <img src="${ticketInstance.qr_data || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=='}"
               style="width: 150px; height: 150px;" />
        </div>
        <div class="ticket-number">#${ticketInstance.ticket_number}</div>
      </div>
    </body>
    </html>
  `
}

function generateESCPOSData(ticketInstance: any): Uint8Array {
  // Générer les commandes ESC/POS simplifiées
  const commands = []

  // Initialisation
  commands.push(0x1B, 0x40) // ESC @ - Initialize printer

  // Centrer
  commands.push(0x1B, 0x61, 0x01) // ESC a 1 - Center align

  // Titre
  const title = ticketInstance.payload?.event_name || 'Événement'
  commands.push(...title.split('').map(char => char.charCodeAt(0)))
  commands.push(0x0A, 0x0A) // 2 line feeds

  // Participant
  const participant = ticketInstance.payload?.participant_name || 'Participant'
  commands.push(...participant.split('').map(char => char.charCodeAt(0)))
  commands.push(0x0A)

  // Numéro de ticket
  commands.push(0x0A)
  const ticketNumber = `#${ticketInstance.ticket_number}`
  commands.push(...ticketNumber.split('').map(char => char.charCodeAt(0)))
  commands.push(0x0A, 0x0A)

  // Coupe de papier
  commands.push(0x1D, 0x56, 0x00) // GS V 0 - Paper cut

  return new Uint8Array(commands)
}