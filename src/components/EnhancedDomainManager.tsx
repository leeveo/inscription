'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

interface DomainDiagnostic {
  event_id: string
  event_name: string
  event_status: string
  site_id: string
  page_id: string
  page_slug: string
  page_status: string
  domain_host: string
  domain_type: string
  dns_status: string
  ssl_status: string
  overall_status: string
}

interface EnhancedDomainManagerProps {
  eventId: string
  eventName: string
}

export default function EnhancedDomainManager({ eventId, eventName }: EnhancedDomainManagerProps) {
  const [diagnostic, setDiagnostic] = useState<DomainDiagnostic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadDiagnostic()
  }, [eventId])

  const loadDiagnostic = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: diagError } = await supabaseBrowser()
        .from('v_domain_status')
        .select('*')
        .eq('event_id', eventId)
        .single()

      if (diagError && diagError.code !== 'PGRST116') {
        throw diagError
      }

      setDiagnostic(data || null)
    } catch (err) {
      console.error('Error loading diagnostic:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const createCompleteSetup = async (domainHost: string) => {
    try {
      setIsCreating(true)

      const { data, error } = await supabaseBrowser()
        .rpc('create_complete_domain_chain', {
          p_event_id: eventId,
          p_domain_host: domainHost,
          p_domain_type: 'custom',
          p_page_name: `Page de ${eventName}`
        })

      if (error) throw error

      const result = data[0]
      if (result.success) {
        await loadDiagnostic()
        setShowSetup(false)
        alert('Configuration créée avec succès !')
      } else {
        alert(`Erreur: ${result.message}`)
      }
    } catch (err) {
      console.error('Error creating setup:', err)
      alert('Erreur lors de la création')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-green-600 bg-green-50'
      case 'DNS_ISSUE': return 'text-orange-600 bg-orange-50'
      case 'PAGE_NOT_PUBLISHED': return 'text-blue-600 bg-blue-50'
      case 'EVENT_INACTIVE': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return '✅'
      case 'DNS_ISSUE': return '🔧'
      case 'PAGE_NOT_PUBLISHED': return '📝'
      case 'EVENT_INACTIVE': return '⚠️'
      default: return '❓'
    }
  }

  const getRecommendations = () => {
    if (!diagnostic) return []

    switch (diagnostic.overall_status) {
      case 'DNS_ISSUE':
        return [
          'Configurez les enregistrements DNS de votre domaine',
          'Pointez votre domaine vers admin.waivent.app',
          'Attendez la propagation DNS (peut prendre jusqu\'à 24h)'
        ]
      case 'PAGE_NOT_PUBLISHED':
        return [
          'Accédez au Page Builder',
          'Finalisez le contenu de votre page',
          'Cliquez sur "Publier" pour activer votre page'
        ]
      case 'EVENT_INACTIVE':
        return [
          'Activez votre événement dans l\'onglet Détails',
          'Vérifiez que les dates sont correctes',
          'Passez le statut à "Actif" ou "Publié"'
        ]
      case 'OPERATIONAL':
        return [
          'Votre configuration est opérationnelle ! 🎉',
          'Testez votre domaine personnalisé',
          'Partagez le lien avec vos participants'
        ]
      default:
        return ['Configuration manquante - utilisez le bouton "Configurer un domaine"']
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🌐 Statut de Publication
        </h3>

        {diagnostic ? (
          <div className="space-y-4">
            {/* Global Status */}
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(diagnostic.overall_status)}`}>
              <span className="mr-2">{getStatusIcon(diagnostic.overall_status)}</span>
              {diagnostic.overall_status.replace('_', ' ')}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Informations Générales</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Domaine:</span>
                    <span className="ml-2 font-medium">{diagnostic.domain_host}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Page:</span>
                    <span className="ml-2 font-medium">{diagnostic.page_slug}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status Page:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      diagnostic.page_status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {diagnostic.page_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Status Technique</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">DNS:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      diagnostic.dns_status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {diagnostic.dns_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">SSL:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      diagnostic.ssl_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {diagnostic.ssl_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Événement:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      diagnostic.event_status === 'actif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {diagnostic.event_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t">
              {diagnostic.domain_host && (
                <a
                  href={`https://${diagnostic.domain_host}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔗 Tester le domaine
                </a>
              )}
              
              {diagnostic.page_id && (
                <a
                  href={`/admin/builder/${diagnostic.page_id}/edit`}
                  target="_blank"
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✏️ Éditer la page
                </a>
              )}

              <button
                onClick={loadDiagnostic}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun domaine configuré</h4>
            <p className="text-gray-600 mb-4">
              Configurez un domaine personnalisé pour publier votre événement
            </p>
            <button
              onClick={() => setShowSetup(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Configurer un domaine
            </button>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {diagnostic && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommandations</h3>
          <div className="space-y-2">
            {getRecommendations().map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <DomainSetupModal
          onClose={() => setShowSetup(false)}
          onSubmit={createCompleteSetup}
          isLoading={isCreating}
        />
      )}
    </div>
  )
}

interface DomainSetupModalProps {
  onClose: () => void
  onSubmit: (domain: string) => void
  isLoading: boolean
}

function DomainSetupModal({ onClose, onSubmit, isLoading }: DomainSetupModalProps) {
  const [domain, setDomain] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (domain.trim()) {
      onSubmit(domain.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">🚀 Configuration Rapide</h2>
          <p className="text-sm text-gray-600 mt-1">
            Nous allons créer automatiquement toute la configuration nécessaire
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de domaine
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="mondomaine.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Entrez votre domaine sans http:// ou www.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">✨ Ce qui sera créé :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Un site builder pour votre événement</li>
                <li>• Une page d'accueil publiée</li>
                <li>• La configuration du domaine</li>
                <li>• Les instructions DNS</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!domain.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              )}
              {isLoading ? 'Création...' : '🚀 Créer la configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}