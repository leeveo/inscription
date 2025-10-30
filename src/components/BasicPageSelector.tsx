'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FiPlus, FiEdit, FiEye, FiCheck } from 'react-icons/fi';
import Toast from './Toast';

interface BasicPageSelectorProps {
  eventId: string;
  currentPageId?: string | null;
  onPageSelected: (pageId: string | null) => void;
  pageTitle: string;
  pageType: 'landing_page' | 'registration_form';
}

interface PageItem {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  page_type: string;
  builder_sites?: {
    id: string;
    event_id?: string;
    name: string;
  };
}

export default function BasicPageSelector({
  eventId,
  currentPageId,
  onPageSelected,
  pageTitle,
  pageType,
}: BasicPageSelectorProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 BasicPageSelector - Fetching pages for:', { eventId, pageType });

      // Query with site information to check event assignment
      const { data, error } = await supabaseBrowser()
        .from('builder_pages')
        .select(`
          *,
          builder_sites (
            id,
            event_id,
            name
          )
        `)
        .eq('page_type', pageType)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ BasicPageSelector - Error:', error);
        setError('Erreur lors du chargement');
        return;
      }

      console.log('✅ BasicPageSelector - Pages fetched:', data?.length || 0);
      setPages(data || []);

    } catch (err) {
      console.error('❌ BasicPageSelector - Error in fetchPages:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [eventId, pageType]);

  const handleAssignPage = async (pageId: string) => {
    console.log('🔗 BasicPageSelector - Assigning page:', pageId, 'to event:', eventId);

    try {
      const page = pages.find(p => p.id === pageId);
      if (!page) {
        console.error('❌ BasicPageSelector - Page not found:', pageId);
        return;
      }

      // Use the API endpoint to properly set builder_page_id in inscription_evenements
      const response = await fetch(`/api/events/${eventId}/builder-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ BasicPageSelector - API Error:', errorData);
        throw new Error(errorData.error || 'Failed to assign page');
      }

      console.log('✅ BasicPageSelector - Page assigned successfully');
      onPageSelected(pageId);

      // Show success toast
      setToast({
        show: true,
        message: 'Page assignée avec succès !',
        type: 'success'
      });
      fetchPages(); // Refresh

    } catch (err) {
      console.error('❌ BasicPageSelector - Error assigning page:', err);
      setToast({
        show: true,
        message: 'Erreur lors de l\'assignation de la page',
        type: 'error'
      });
    }
  };

  const handleUnassignPage = async () => {
    if (!currentPageId) return;

    const confirmed = window.confirm('Êtes-vous sûr de vouloir dissocier cette page de l\'événement ?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/events/${eventId}/builder-page`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ BasicPageSelector - API Error:', errorData);
        throw new Error(errorData.error || 'Failed to unassign page');
      }

      console.log('✅ BasicPageSelector - Page unassigned successfully');
      onPageSelected(null);

      // Show success toast
      setToast({
        show: true,
        message: 'Page dissociée avec succès !',
        type: 'success'
      });
      fetchPages(); // Refresh

    } catch (err) {
      console.error('❌ BasicPageSelector - Error unassigning page:', err);
      setToast({
        show: true,
        message: 'Erreur lors de la dissociation de la page',
        type: 'error'
      });
    }
  };

  const isPageAssignedToEvent = (page: PageItem) => {
    return page.id === currentPageId;
  };

  const unassignedPages = pages.filter(page => !isPageAssignedToEvent(page));
  const assignedPage = pages.find(page => isPageAssignedToEvent(page));

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button
          onClick={fetchPages}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{pageTitle}</h3>
        <button
          onClick={() => window.open('/admin/pages-builder', '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <FiPlus className="w-4 h-4" />
          Créer une page
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
        <p>📊 Debug: {pages.length} page(s) trouvée(s) • Type: {pageType} • Event: {eventId}</p>
      </div>

      {/* Page assignée */}
      {assignedPage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheck className="text-green-600 w-5 h-5" />
              <div>
                <p className="font-medium text-green-900">{assignedPage.name}</p>
                <p className="text-sm text-green-700">Assignée à cet événement</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/preview/${assignedPage.id}`, '_blank')}
                className="p-2 text-green-600 hover:text-green-800"
                title="Aperçu"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open(`/admin/builder/${assignedPage.id}`, '_blank')}
                className="p-2 text-green-600 hover:text-green-800"
                title="Modifier"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={handleUnassignPage}
                className="p-2 text-red-600 hover:text-red-800"
                title="Dissocier"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages disponibles */}
      {unassignedPages.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">
            Pages disponibles ({unassignedPages.length})
          </h4>
          <div className="space-y-2">
            {unassignedPages.map((page) => (
              <div
                key={page.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{page.name}</h4>
                    <p className="text-sm text-gray-600">
                      Créée le {new Date(page.created_at).toLocaleDateString('fr-FR')}
                      {page.status === 'published' && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Publié
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAssignPage(page.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Assigner
                    </button>
                    <button
                      onClick={() => window.open(`/preview/${page.id}`, '_blank')}
                      className="p-1 text-gray-600 hover:text-gray-800"
                      title="Aperçu"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(`/admin/builder/${page.id}`, '_blank')}
                      className="p-1 text-gray-600 hover:text-gray-800"
                      title="Modifier"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aucune page */}
      {!assignedPage && unassignedPages.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-400 mb-4">
            <FiPlus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune {pageTitle.toLowerCase()} disponible
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Créez votre première page dans le gestionnaire
          </p>
          <button
            onClick={() => window.open('/admin/pages-builder', '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Créer une {pageTitle}
          </button>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}