'use client'

import { useState, useEffect } from 'react'
import { Button } from '@headlessui/react'
import { 
  LinkIcon, 
  ClipboardDocumentIcon, 
  CheckIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

interface Participant {
  id: string
  nom: string
  prenom: string
  email: string
  token_landing_page?: string | null
}

interface ParticipantUrlGeneratorProps {
  eventId: string
  participants: Participant[]
  onTokenGenerated: (participantId: string, token: string, url: string) => void
}

export default function ParticipantUrlGenerator({ 
  eventId, 
  participants, 
  onTokenGenerated 
}: ParticipantUrlGeneratorProps) {
  const [loadingTokens, setLoadingTokens] = useState<Set<string>>(new Set())
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set())
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    // Initialiser les URLs déjà générées
    const initialUrls: Record<string, string> = {}
    participants.forEach(participant => {
      if (participant.token_landing_page) {
        const baseUrl = window.location.origin
        initialUrls[participant.id] = `${baseUrl}/landing/${eventId}/${participant.token_landing_page}`
      }
    })
    setGeneratedUrls(initialUrls)
  }, [participants, eventId])

  const generateToken = async (participantId: string) => {
    setLoadingTokens(prev => new Set([...prev, participantId]))
    
    try {
      const response = await fetch('/api/participant-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          participantId,
          action: 'generate'
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du token')
      }

      const data = await response.json()
      
      setGeneratedUrls(prev => ({
        ...prev,
        [participantId]: data.landingUrl
      }))

      onTokenGenerated(participantId, data.token, data.landingUrl)
      
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setLoadingTokens(prev => {
        const newSet = new Set(prev)
        newSet.delete(participantId)
        return newSet
      })
    }
  }

  const copyToClipboard = async (url: string, participantId: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrls(prev => new Set([...prev, participantId]))
      
      // Retirer l'indication de copie après 2 secondes
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev)
          newSet.delete(participantId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      alert('Erreur lors de la copie')
    }
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const generateAllTokens = async () => {
    const participantsWithoutTokens = participants.filter(p => !p.token_landing_page)
    
    if (participantsWithoutTokens.length === 0) {
      alert('Tous les participants ont déjà un token généré')
      return
    }

    const confirmGeneration = confirm(
      `Générer des URLs personnalisées pour ${participantsWithoutTokens.length} participants ?`
    )

    if (!confirmGeneration) return

    // Générer les tokens un par un pour éviter la surcharge
    for (const participant of participantsWithoutTokens) {
      await generateToken(participant.id)
      // Petite pause entre chaque génération
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-end items-center mb-6">
        <Button
          onClick={generateAllTokens}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Générer tout</span>
        </Button>
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <LinkIcon className="w-16 h-16 mx-auto text-gray-300" />
          </div>
          <p className="text-lg font-medium mb-2">Aucun participant inscrit pour cet événement</p>
          <p className="text-sm">Les URLs personnalisées apparaîtront ici une fois que des participants seront inscrits.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL Personnalisée
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant) => {
                const hasToken = participant.token_landing_page || generatedUrls[participant.id]
                const isLoading = loadingTokens.has(participant.id)
                const isCopied = copiedUrls.has(participant.id)
                const url = generatedUrls[participant.id]

                return (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.prenom} {participant.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {participant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {url ? (
                        <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded break-all max-w-xs">
                          {url}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Pas encore généré
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center space-x-1">
                        {!hasToken ? (
                          <button
                            onClick={() => generateToken(participant.id)}
                            disabled={isLoading}
                            title={isLoading ? 'Génération...' : 'Générer le lien'}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => copyToClipboard(url, participant.id)}
                              title={isCopied ? 'Copié!' : 'Copier le lien'}
                              className={`p-2 rounded-full transition-colors ${
                                isCopied 
                                  ? 'text-green-600 bg-green-100' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              {isCopied ? (
                                <CheckIcon className="w-4 h-4" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => openUrl(url)}
                              title="Voir la page"
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {participants.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Comment utiliser les URLs personnalisées</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chaque participant reçoit un lien unique pour confirmer sa participation</li>
            <li>• Les informations sont pré-remplies automatiquement</li>
            <li>• Les visites et conversions sont trackées pour vos campagnes</li>
            <li>• Parfait pour les campagnes email marketing personnalisées</li>
          </ul>
        </div>
      )}
    </div>
  )
}