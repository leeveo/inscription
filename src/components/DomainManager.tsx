'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import DNSTutorialModal from './DNSTutorialModal'

interface Domain {
  id: string
  site_id: string
  type: 'subdomain' | 'custom'
  host: string
  dns_status: 'pending' | 'verified' | 'failed'
  ssl_status: 'pending' | 'provisioning' | 'active' | 'failed'
  is_primary: boolean
  created_at: string
  verified_at?: string
  dnsVerification?: {
    type: 'CNAME' | 'A'
    name: string
    value: string
    description: string
  }
  sslVerification?: {
    type: 'SSL'
    description: string
    autoProvision: boolean
  }
}

interface DomainManagerProps {
  pageId: string
  currentPage: {
    id: string
    slug: string
    status: 'draft' | 'published'
    saasUrl: string
  }
}

export default function DomainManager({ pageId, currentPage }: DomainManagerProps) {
  const [domains, setDomains] = useState<Domain[]>([])
  const [currentPageData, setCurrentPage] = useState(currentPage)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDNSTutorial, setShowDNSTutorial] = useState(false)
  const [tutorialDomain, setTutorialDomain] = useState<{
    type: 'subdomain' | 'custom'
    name: string
    dnsConfig: any
  } | null>(null)
  const [newDomain, setNewDomain] = useState({
    type: 'subdomain' as 'subdomain' | 'custom',
    host: ''
  })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchDomains()
  }, [pageId])

  const fetchDomains = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/builder/pages/${pageId}/domains?includeVerification=true`)
      if (!response.ok) throw new Error('Failed to fetch domains')

      const data = await response.json()
      if (data.success) {
        setDomains(data.domains || [])
        // Update currentPage with actual page data
        if (data.page) {
          setCurrentPage(data.page)
        }
      }
    } catch (error) {
      console.error('Error fetching domains:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain.host.trim()) return

    try {
      setIsAdding(true)
      const response = await fetch(`/api/builder/pages/${pageId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDomain)
      })

      if (!response.ok) throw new Error('Failed to add domain')

      await fetchDomains()
      setNewDomain({ type: 'subdomain', host: '' })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding domain:', error)
      alert('Erreur lors de l\'ajout du domaine')
    } finally {
      setIsAdding(false)
    }
  }

  const handleVerifyDomain = async (domainId: string) => {
    try {
      setIsVerifying(domainId)
      const response = await fetch(`/api/builder/domains/${domainId}/verify`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to verify domain')

      await fetchDomains()
    } catch (error) {
      console.error('Error verifying domain:', error)
      alert('Erreur lors de la vérification du domaine')
    } finally {
      setIsVerifying(null)
    }
  }

  const handleSetPrimary = async (domainId: string, isPrimary: boolean) => {
    try {
      const response = await fetch(`/api/builder/domains/${domainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_primary: isPrimary })
      })

      if (!response.ok) throw new Error('Failed to update domain')

      await fetchDomains()
    } catch (error) {
      console.error('Error updating domain:', error)
      alert('Erreur lors de la mise à jour du domaine')
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) return

    try {
      const response = await fetch(`/api/builder/domains/${domainId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete domain')

      await fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
      alert('Erreur lors de la suppression du domaine')
    }
  }

  const handlePublishToggle = async () => {
    try {
      const newStatus = currentPageData.status === 'published' ? 'draft' : 'published'

      const response = await fetch(`/api/builder/pages/${pageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update page status')

      await fetchDomains()

      if (newStatus === 'published') {
        alert('✅ Page publiée avec succès ! Elle est maintenant accessible publiquement.')
      } else {
        alert('📝 Page dépubliée. Elle n\'est plus accessible publiquement.')
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      alert('Erreur lors de la mise à jour du statut de publication')
    }
  }

  const getStatusBadge = (status: string, type: 'dns' | 'ssl') => {
    const variants = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Vérifié' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
      provisioning: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Échoué' }
    }

    const variant = variants[status as keyof typeof variants] || variants.pending

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${variant.bg} ${variant.text}`}>
        {type === 'dns' ? 'DNS' : 'SSL'}: {variant.label}
      </span>
    )
  }

  const primaryDomain = domains.find(d => d.is_primary)

  return (
    <div className="space-y-6">
      {/* Current Publication Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Actuelle</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Adresse SaaS</h4>
              <div className="flex items-center space-x-3">
                <a
                  href={currentPageData.saasUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center space-x-1"
                >
                  <span>{currentPageData.saasUrl}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                {currentPageData.status === 'published' && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✅ Publié
                  </span>
                )}
              </div>
              {currentPageData.status === 'draft' && (
                <p className="text-xs text-gray-500 mt-1">
                  Publiez la page pour la rendre accessible
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {currentPageData.status === 'published' ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Open in full screen without admin sidebar for participant view
                      const fullScreenUrl = currentPageData.saasUrl;
                      window.open(fullScreenUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Voir</span>
                  </button>
                  <button
                    onClick={() => handlePublishToggle()}
                    className="px-3 py-1 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8 8-4-4" />
                    </svg>
                    <span>Dépublier</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Brouillon
                  </span>
                  <button
                    onClick={() => {
                      console.log('Preview button clicked - pageId:', pageId);
                      const previewUrl = `/preview/${pageId}`;
                      console.log('Opening preview URL:', previewUrl);
                      window.open(previewUrl, '_blank');
                    }}
                    className="px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Aperçu</span>
                  </button>
                  <button
                    onClick={() => handlePublishToggle()}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Publier</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {primaryDomain && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-medium text-gray-900">Domaine Principal</h4>
                <p className="text-sm text-gray-600">{primaryDomain.host}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Principal
                </span>
                {getStatusBadge(primaryDomain.dns_status, 'dns')}
                {getStatusBadge(primaryDomain.ssl_status, 'ssl')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Domain Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Gestion des Domaines</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDNSTutorial(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Aide DNS</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Ajouter un domaine
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : domains.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun domaine configuré</h4>
            <p className="text-gray-600 mb-4">
              Ajoutez un domaine personnalisé pour rendre votre page accessible via votre propre adresse web.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => (
              <div key={domain.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{domain.host}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        domain.type === 'subdomain'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {domain.type === 'subdomain' ? 'Sous-domaine' : 'Domaine personnalisé'}
                      </span>
                      {domain.is_primary && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Principal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      {getStatusBadge(domain.dns_status, 'dns')}
                      {getStatusBadge(domain.ssl_status, 'ssl')}
                    </div>

                    {domain.dns_status !== 'verified' && domain.dnsVerification && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-yellow-900">Configuration DNS requise</h5>
                          <button
                            onClick={() => {
                              setTutorialDomain({
                                type: domain.type,
                                name: domain.host,
                                dnsConfig: domain.dnsVerification
                              })
                              setShowDNSTutorial(true)
                            }}
                            className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300 transition-colors"
                          >
                            📚 Tutoriel
                          </button>
                        </div>
                        <p className="text-sm text-yellow-800 mb-2">{domain.dnsVerification.description}</p>
                        <div className="font-mono text-xs bg-yellow-100 p-2 rounded">
                          Type: {domain.dnsVerification.type}<br/>
                          Nom: {domain.dnsVerification.name}<br/>
                          Valeur: {domain.dnsVerification.value}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {domain.dns_status !== 'verified' && (
                      <button
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={isVerifying === domain.id}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isVerifying === domain.id ? 'Vérification...' : 'Vérifier'}
                      </button>
                    )}

                    {!domain.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(domain.id, true)}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                      >
                        Définir principal
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Ajouter un domaine</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de domaine
                </label>
                <select
                  value={newDomain.type}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, type: e.target.value as 'subdomain' | 'custom' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="subdomain">Sous-domaine (ex: evenement.votredomaine.com)</option>
                  <option value="custom">Domaine personnalisé (ex: www.monevenement.com)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newDomain.type === 'subdomain' ? 'Sous-domaine' : 'Domaine'}
                </label>
                <input
                  type="text"
                  value={newDomain.host}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, host: e.target.value }))}
                  placeholder={newDomain.type === 'subdomain' ? 'evenement.votredomaine.com' : 'www.monevenement.com'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Important</h4>
                <p className="text-sm text-blue-800">
                  Après avoir ajouté le domaine, vous devrez configurer les enregistrements DNS
                  comme indiqué dans la zone de vérification.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddDomain}
                disabled={!newDomain.host.trim() || isAdding}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Ajout...' : 'Ajouter le domaine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DNS Tutorial Modal */}
      <DNSTutorialModal
        isOpen={showDNSTutorial}
        onClose={() => {
          setShowDNSTutorial(false)
          setTutorialDomain(null)
        }}
        domainType={tutorialDomain?.type || 'subdomain'}
        domainName={tutorialDomain?.name || ''}
        dnsConfig={tutorialDomain?.dnsConfig || {
          type: 'CNAME',
          name: 'exemple.domaine.com',
          value: 'votreserveur.com'
        }}
      />
    </div>
  )
}