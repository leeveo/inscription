'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import Link from 'next/link'

interface BuilderPage {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  updated_at: string
}

interface PageBuilderSelectorProps {
  eventId: string
  currentPageId?: string | null
  onPageSelected?: (pageId: string | null) => void
}

export default function PageBuilderSelector({
  eventId,
  currentPageId,
  onPageSelected
}: PageBuilderSelectorProps) {
  const [pages, setPages] = useState<BuilderPage[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string | null>(currentPageId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setIsLoading(true)
      const supabase = supabaseBrowser()

      const { data, error } = await supabase
        .from('builder_pages')
        .select('id, name, slug, status, updated_at')
        .order('updated_at', { ascending: false })

      if (error) throw error

      setPages(data || [])
    } catch (error) {
      console.error('Error fetching builder pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssociatePage = async (pageId: string | null) => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/events/${eventId}/builder-page`, {
        method: pageId ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: pageId ? JSON.stringify({ pageId }) : undefined,
      })

      if (!response.ok) {
        throw new Error('Failed to update builder page association')
      }

      setSelectedPageId(pageId)
      setShowModal(false)

      if (onPageSelected) {
        onPageSelected(pageId)
      }

      // Afficher un message de succès (vous pouvez utiliser un toast ici)
      alert(pageId ? 'Page builder associée avec succès !' : 'Page builder dissociée avec succès !')
    } catch (error) {
      console.error('Error associating page:', error)
      alert('Erreur lors de l\'association de la page')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedPage = pages.find(p => p.id === selectedPageId)

  return (
    <div className="space-y-4">
      {/* Affichage de la page actuelle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Page Builder associée
            </h3>
            {selectedPage ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 font-medium">
                    {selectedPage.name}
                  </span>
                  {selectedPage.status === 'published' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Publié
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Brouillon
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/admin/builder/${selectedPage.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ✏️ Modifier la page →
                  </Link>
                  {selectedPage.status === 'published' && (
                    <Link
                      href={`/p/${selectedPage.slug}`}
                      target="_blank"
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Voir la page publiée ↗
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Aucune page builder associée
              </p>
            )}
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {selectedPage ? 'Changer' : 'Choisir une page'}
            </button>
            {selectedPage && (
              <button
                onClick={() => handleAssociatePage(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Dissocier
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de sélection */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Choisir une page builder
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Aucune page builder disponible</p>
                  <Link
                    href="/admin/builder/library"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Créer une nouvelle page →
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPageId === page.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPageId(page.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {page.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            /{page.slug}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {page.status === 'published' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Brouillon
                            </span>
                          )}
                          {selectedPageId === page.id && (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => selectedPageId && handleAssociatePage(selectedPageId)}
                disabled={!selectedPageId || isSaving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Association...' : 'Associer cette page'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
