'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FiPlus, FiEdit, FiEye, FiTrash2, FiCheck, FiX, FiLayout } from 'react-icons/fi';
import type { BuilderPage } from '@/types/builder';

interface BuilderPageSelectorProps {
  eventId: string;
  currentPageId?: string | null;
  onPageSelected: (pageId: string | null) => void;
  pageTitle?: string;
  pageType?: 'landing_page' | 'registration_form' | 'all';
  allowCreate?: boolean;
  allowEdit?: boolean;
  showPreview?: boolean;
}

export default function BuilderPageSelector({
  eventId,
  currentPageId,
  onPageSelected,
  pageTitle = "Page Builder",
  pageType = 'all',
  allowCreate = true,
  allowEdit = true,
  showPreview = true,
}: BuilderPageSelectorProps) {
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, [eventId, pageType]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseBrowser()
        .from('builder_pages')
        .select(`
          *,
          builder_sites!inner(
            id,
            name,
            event_id
          )
        `);

      // Filtrer par type de page si nécessaire
      if (pageType !== 'all') {
        query = query.eq('page_type', pageType);
      }

      // Récupérer les pages de cet événement + quelques pages orphelines
      const { data: eventPages, error: eventError } = await query
        .eq('builder_sites.event_id', eventId)
        .order('updated_at', { ascending: false });

      if (eventError) throw eventError;

      // Récupérer quelques pages orphelines (max 5) pour pouvoir les assigner
      const { data: orphanPages, error: orphanError } = await supabaseBrowser()
        .from('builder_pages')
        .select(`
          *,
          builder_sites!inner(
            id,
            name,
            event_id
          )
        `)
        .is('builder_sites.event_id', null)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (orphanError) throw orphanError;

      // Combiner les résultats
      const allPages = [...(eventPages || []), ...(orphanPages || [])];
      setPages(allPages);

    } catch (err) {
      console.error('Error fetching builder pages:', err);
      setError('Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = async () => {
    try {
      // Créer un nouveau site pour cet événement
      const { data: newSite, error: siteError } = await supabaseBrowser()
        .from('builder_sites')
        .insert({
          event_id: eventId,
          name: `Site - ${new Date().toLocaleDateString('fr-FR')}`,
          site_slug: `event-${eventId}-${Date.now()}`,
          status: 'draft',
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Créer une nouvelle page pour ce site
      const { data: newPage, error: pageError } = await supabaseBrowser()
        .from('builder_pages')
        .insert({
          site_id: newSite.id,
          name: `${pageTitle} - ${new Date().toLocaleDateString('fr-FR')}`,
          slug: 'home',
          tree: { rootNodeId: '', nodes: {} },
          status: 'draft',
          page_type: pageType === 'all' ? 'landing_page' : pageType,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // Rediriger vers l'éditeur
      window.location.href = `/admin/builder/${newPage.id}`;
    } catch (err) {
      console.error('Error creating new page:', err);
      alert('Erreur lors de la création de la page');
    }
  };

  const handleEditPage = (pageId: string) => {
    window.location.href = `/admin/builder/${pageId}`;
  };

  const handlePreviewPage = (pageId: string) => {
    window.open(`/preview/${pageId}`, '_blank');
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { error } = await supabaseBrowser()
        .from('builder_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      // Si c'était la page sélectionnée, désélectionner
      if (currentPageId === pageId) {
        onPageSelected(null);
      }

      // Rafraîchir la liste
      await fetchPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('Erreur lors de la suppression de la page');
    }
  };

  const handleAssignPage = async (pageId: string) => {
    try {
      // Récupérer la page et son site
      const { data: page, error: pageError } = await supabaseBrowser()
        .from('builder_pages')
        .select(`
          *,
          builder_sites!inner(*)
        `)
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;

      // Si le site n'est pas associé à cet événement, l'associer
      if (page.builder_sites.event_id !== eventId) {
        const { error: updateError } = await supabaseBrowser()
          .from('builder_sites')
          .update({ event_id: eventId })
          .eq('id', page.site_id);

        if (updateError) throw updateError;
      }

      onPageSelected(pageId);
      await fetchPages();
    } catch (err) {
      console.error('Error assigning page:', err);
      alert('Erreur lors de l\'assignation de la page');
    }
  };

  const isPageAssignedToEvent = (page: BuilderPage) => {
    return page.builder_sites?.event_id === eventId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <button
          onClick={fetchPages}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Pages disponibles</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choisissez une page existante ou créez-en une nouvelle
          </p>
        </div>

        {allowCreate && (
          <button
            onClick={handleCreateNewPage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Nouvelle page
          </button>
        )}
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FiLayout className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune page créée</h3>
          <p className="text-sm text-gray-600 mb-6">
            Commencez par créer votre première page avec le Page Builder
          </p>
          {allowCreate && (
            <button
              onClick={handleCreateNewPage}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Créer ma première page
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => {
            const isAssigned = isPageAssignedToEvent(page);
            const isSelected = currentPageId === page.id;

            return (
              <div
                key={page.id}
                className={`relative border rounded-lg p-4 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isAssigned
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Status badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    page.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>

                  {isAssigned && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <FiCheck className="w-3 h-3 mr-1" />
                      Assigné
                    </span>
                  )}
                </div>

                {/* Page Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1 truncate">
                    {page.name || 'Page sans titre'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Type: {page.page_type === 'landing_page' ? 'Landing' : 'Formulaire'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Modifiée {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <div className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      <FiCheck className="w-4 h-4 mr-1" />
                      Sélectionné
                    </div>
                  ) : (
                    <button
                      onClick={() => onPageSelected(page.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {!isAssigned ? 'Assigner et' : ''} Sélectionner
                    </button>
                  )}

                  {showPreview && (
                    <button
                      onClick={() => handlePreviewPage(page.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Aperçu"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}

                  {allowEdit && (
                    <button
                      onClick={() => handleEditPage(page.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5">💡</div>
          <div>
            <p className="font-medium mb-1">Comment fonctionne le Page Builder ?</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Créez des pages avec le glisser-déposer de blocs</li>
              <li>• Une page peut être assignée à un seul événement</li>
              <li>• Les pages publiées sont visibles publiquement</li>
              <li>• Vous pouvez créer des landing pages ou des formulaires d'inscription</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}