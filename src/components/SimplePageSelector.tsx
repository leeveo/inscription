'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FiPlus, FiEdit, FiEye, FiCheck, FiExternalLink, FiRefreshCw } from 'react-icons/fi';

interface SimplePageSelectorProps {
  eventId: string;
  currentPageId?: string | null;
  onPageSelected: (pageId: string | null) => void;
  pageTitle: string;
  pageType: 'landing_page' | 'registration_form';
}

export default function SimplePageSelector({
  eventId,
  currentPageId,
  onPageSelected,
  pageTitle,
  pageType,
}: SimplePageSelectorProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('🔍 SimplePageSelector - Fetching pages for:', { eventId, pageType });

      const { data, error } = await supabaseBrowser
        .from('builder_pages')
        .select(`
          id,
          name,
          status,
          created_at,
          updated_at,
          page_type,
          builder_sites!inner(
            id,
            event_id,
            inscription_evenements!left(
              id,
              nom as event_name
            )
          )
        `)
        .eq('page_type', pageType)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ SimplePageSelector - Error:', error);
        setPages([]);
        return;
      }

      console.log('✅ SimplePageSelector - Pages fetched:', data?.length || 0);
      console.log('📄 SimplePageSelector - Pages:', data);
      setPages(data || []);

    } catch (err) {
      console.error('❌ SimplePageSelector - Error in fetchPages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [eventId, pageType]);

  const handleAssignPage = async (pageId: string) => {
    console.log('🔗 SimplePageSelector - Assigning page:', pageId, 'to event:', eventId);

    try {
      // Récupérer les détails de la page
      const page = pages.find(p => p.id === pageId);
      if (!page) {
        console.error('❌ SimplePageSelector - Page not found:', pageId);
        return;
      }

      // Assigner le site à l'événement
      if (!page.builder_sites.event_id) {
        const { error: updateError } = await supabaseBrowser()
          .from('builder_sites')
          .update({ event_id: eventId })
          .eq('id', page.builder_sites.id);

        if (updateError) {
          console.error('❌ SimplePageSelector - Update error:', updateError);
          throw updateError;
        }
      }

      console.log('✅ SimplePageSelector - Page assigned successfully');
      onPageSelected(pageId);
      await fetchPages(); // Rafraîchir la liste

    } catch (err) {
      console.error('❌ SimplePageSelector - Error assigning page:', err);
      alert('Erreur lors de l\'assignation de la page');
    }
  };

  const isPageAssignedToEvent = (page: any) => {
    return page.builder_sites?.event_id === eventId;
  };

  const unassignedPages = pages.filter(page => !isPageAssignedToEvent(page));
  const assignedPage = pages.find(page => isPageAssignedToEvent(page));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des pages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{pageTitle}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pages.length > 0
              ? `${pages.length} page${pages.length > 1 ? 's' : ''} trouvée${pages.length > 1 ? 's' : ''}`
              : 'Aucune page trouvée'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPages}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
            title="Rafraîchir la liste"
          >
            <FiRefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>

          <button
            onClick={() => window.open('/admin/pages-builder', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Créer une page
          </button>
        </div>
      </div>

      {/* Page assignée */}
      {assignedPage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiCheck className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">
                  {assignedPage.name || 'Page sans titre'}
                </h4>
                <p className="text-sm text-green-700">
                  Cette page est assignée à cet événement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`/preview/${assignedPage.id}`, '_blank')}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                title="Aperçu"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open(`/admin/builder/${assignedPage.id}`, '_blank')}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                title="Modifier dans le builder"
              >
                <FiEdit className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages disponibles */}
      {unassignedPages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Pages disponibles ({unassignedPages.length})
          </h4>
          <div className="space-y-3">
            {unassignedPages.map((page) => (
              <div
                key={page.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">
                        {page.name || 'Page sans titre'}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {page.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      <span>Créée le {new Date(page.created_at).toLocaleDateString('fr-FR')}</span>
                      {page.updated_at !== page.created_at && (
                        <span> • Modifiée le {new Date(page.updated_at).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleAssignPage(page.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                      Assigner
                    </button>

                    <button
                      onClick={() => window.open(`/preview/${page.id}`, '_blank')}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Aperçu"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => window.open(`/admin/builder/${page.id}`, '_blank')}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier dans le builder"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aucune page disponible */}
      {!assignedPage && unassignedPages.length === 0 && pages.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <FiPlus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune {pageTitle.toLowerCase()} disponible
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Créez votre première {pageTitle.toLowerCase()} dans le gestionnaire de pages
          </p>
          <button
            onClick={() => window.open('/admin/pages-builder', '_blank')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Créer une {pageTitle}
          </button>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">🐛</div>
            <div>
              <p className="font-medium mb-1">Debug Info:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Event ID: {eventId}</li>
                <li>• Page Type: {pageType}</li>
                <li>• Total Pages: {pages.length}</li>
                <li>• Assigned: {assignedPage ? assignedPage.name : 'None'}</li>
                <li>• Available: {unassignedPages.length}</li>
                <li>• Current Page ID: {currentPageId || 'None'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}