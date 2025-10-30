'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FiPlus, FiEdit, FiEye, FiCheck, FiExternalLink } from 'react-icons/fi';
import type { BuilderPage } from '@/types/builder';

interface PageSelectorProps {
  eventId: string;
  currentPageId?: string | null;
  onPageSelected: (pageId: string | null) => void;
  pageTitle: string;
  pageType: 'landing_page' | 'registration_form';
  allowCreate?: boolean;
}

export default function PageSelector({
  eventId,
  currentPageId,
  onPageSelected,
  pageTitle,
  pageType,
  allowCreate = true,
}: PageSelectorProps) {
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, [eventId, pageType]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('🔍 PageSelector - Fetching pages for type:', pageType);

      // Récupérer toutes les pages du bon type avec les informations du site
      const { data, error } = await supabaseBrowser
        .from('builder_pages')
        .select(`
          *,
          builder_sites!inner(
            id,
            name as site_name,
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
        console.error('❌ PageSelector - Error fetching pages:', error);
        throw error;
      }

      console.log('✅ PageSelector - Pages fetched:', data?.length || 0);
      console.log('📄 PageSelector - Pages details:', data);

      setPages(data || []);
    } catch (err) {
      console.error('❌ PageSelector - Error in fetchPages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBuilder = () => {
    window.open('/admin/pages-builder', '_blank');
  };

  const handleAssignPage = (pageId: string) => {
    console.log('🔗 PageSelector - Assigning page:', pageId, 'to event:', eventId);

    // D'abord, vérifier si la page a déjà un site associé
    const pageToAssign = pages.find(p => p.id === pageId);
    if (!pageToAssign) {
      console.error('❌ PageSelector - Page not found:', pageId);
      return;
    }

    const assignPageToEvent = async () => {
      try {
        console.log('🔄 PageSelector - Assigning page to event...');

        // Si le site n'a pas d'événement assigné, l'assigner
        if (!pageToAssign.builder_sites?.event_id) {
          const { error: updateError } = await supabaseBrowser()
            .from('builder_sites')
            .update({ event_id: eventId })
            .eq('id', pageToAssign.builder_sites.id);

          if (updateError) {
            console.error('❌ PageSelector - Error assigning site to event:', updateError);
            throw updateError;
          }
        }

        console.log('✅ PageSelector - Page assigned successfully');
        onPageSelected(pageId);
        await fetchPages(); // Rafraîchir la liste

      } catch (err) {
        console.error('❌ PageSelector - Error in assignPageToEvent:', err);
        alert('Erreur lors de l\'assignation de la page');
      }
    };

    assignPageToEvent();
  };

  const handlePreviewPage = (pageId: string) => {
    window.open(`/preview/${pageId}`, '_blank');
  };

  const isPageAssignedToEvent = (page: BuilderPage) => {
    console.log('🔍 Checking if page is assigned:', {
      pageId: page.id,
      pageName: page.name,
      siteEventId: page.builder_sites?.event_id,
      currentEventId: eventId,
      isAssigned: page.builder_sites?.event_id === eventId
    });
    return page.builder_sites?.event_id === eventId;
  };

  const unassignedPages = pages.filter(page => !isPageAssignedToEvent(page));
  const assignedPage = pages.find(page => isPageAssignedToEvent(page));

  console.log('📊 PageSelector - Assignment status:', {
    totalPages: pages.length,
    unassignedPages: unassignedPages.length,
    hasAssignedPage: !!assignedPage,
    currentPageId: currentPageId
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
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
            Choisissez une page existante ou créez-en une nouvelle dans le gestionnaire de pages
          </p>
        </div>

        <div className="flex items-center gap-3">
          {allowCreate && (
            <button
              onClick={handleOpenBuilder}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Ouvrir le Gestionnaire
            </button>
          )}
        </div>
      </div>

      {/* Page actuellement assignée */}
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
                  Cette {pageType === 'landing_page' ? 'landing page' : 'formulaire'} est assignée à cet événement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePreviewPage(assignedPage.id)}
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
          <h4 className="text-sm font-medium text-gray-700">Pages disponibles à assigner</h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unassignedPages.map((page) => (
              <div
                key={page.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {page.name || 'Page sans titre'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Créée {new Date(page.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    page.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAssignPage(page.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <FiCheck className="w-3 h-3" />
                    Assigner
                  </button>

                  <button
                    onClick={() => handlePreviewPage(page.id)}
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
            ))}
          </div>
        </div>
      )}

      {/* Aucune page disponible */}
      {!assignedPage && unassignedPages.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <FiPlus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune {pageType === 'landing_page' ? 'landing page' : 'formulaire'} disponible
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Créez votre première {pageType === 'landing_page' ? 'landing page' : 'formulaire'} dans le gestionnaire de pages
          </p>
          <button
            onClick={handleOpenBuilder}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Créer une {pageType === 'landing_page' ? 'Landing Page' : 'Formulaire'}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">💡</div>
          <div>
            <p className="font-medium mb-1">Comment ça marche ?</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Cliquez sur "Ouvrir le Gestionnaire" pour créer de nouvelles pages</li>
              <li>• Toutes les pages sont centralisées dans le gestionnaire de pages</li>
              <li>• Une fois créée, assignez la page à cet événement</li>
              <li>• Vous pouvez modifier les pages à tout moment dans le builder</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}