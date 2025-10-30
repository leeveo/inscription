'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FiPlus, FiEdit, FiEye, FiTrash2, FiFilter, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import type { BuilderPage } from '@/types/builder';

export default function PagesBuilderHub() {
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'landing_page' | 'registration_form'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('🔍 PagesBuilderHub - Fetching all pages...');

      const { data, error } = await supabaseBrowser()
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
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ PagesBuilderHub - Error fetching pages:', error);
        throw error;
      }

      console.log('✅ PagesBuilderHub - Pages fetched:', data?.length || 0);
      console.log('📄 PagesBuilderHub - Pages details:', data);

      setPages(data || []);
    } catch (err) {
      console.error('❌ PagesBuilderHub - Error in fetchPages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = async (pageType: 'landing_page' | 'registration_form') => {
    try {
      console.log('🆕 PagesBuilderHub - Creating new page:', pageType);

      // Créer un nouveau site sans événement assigné
      const { data: newSite, error: siteError } = await (supabaseBrowser() as any)
        .from('builder_sites')
        .insert({
          name: `Site - ${new Date().toLocaleDateString('fr-FR')}`,
          site_slug: `site-${Date.now()}`,
          status: 'draft',
        })
        .select()
        .single();

      if (siteError) {
        console.error('❌ PagesBuilderHub - Error creating site:', siteError);
        throw siteError;
      }

      console.log('✅ PagesBuilderHub - Site created:', newSite?.id);

      // Créer une nouvelle page
      const { data: newPage, error: pageError } = await (supabaseBrowser() as any)
        .from('builder_pages')
        .insert({
          site_id: newSite?.id,
          name: `${pageType === 'landing_page' ? 'Landing page' : 'Formulaire'} - ${new Date().toLocaleDateString('fr-FR')}`,
          slug: 'home',
          tree: { rootNodeId: '', nodes: {} },
          status: 'draft',
          page_type: pageType,
        })
        .select()
        .single();

      if (pageError) {
        console.error('❌ PagesBuilderHub - Error creating page:', pageError);
        throw pageError;
      }

      console.log('✅ PagesBuilderHub - Page created:', newPage.id);

      // Rediriger vers l'éditeur
      window.location.href = `/admin/builder/${newPage.id}`;
    } catch (err) {
      console.error('❌ PagesBuilderHub - Error creating new page:', err);
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

      await fetchPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('Erreur lors de la suppression de la page');
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || (page as any).page_type === filterType;
    const matchesStatus = filterStatus === 'all' || page.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getEventName = (page: BuilderPage) => {
    console.log('🏷️ Getting event name for page:', {
      pageId: page.id,
      pageName: page.name,
      event_id: (page as any).builder_sites?.event_id,
      event_name: (page as any).builder_sites?.event_name
    });
    return (page as any).builder_sites?.event_name || 'Non assigné';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
          <h1 className="text-2xl font-bold text-gray-900">Gestionnaire de Pages</h1>
          <p className="text-sm text-gray-600 mt-1">
            Créez et gérez toutes vos pages (landing pages et formulaires) depuis cet endroit central
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCreateNewPage('landing_page')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Nouvelle Landing Page
          </button>

          <button
            onClick={() => handleCreateNewPage('registration_form')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Nouveau Formulaire
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="landing_page">Landing Pages</option>
              <option value="registration_form">Formulaires</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillons</option>
            <option value="published">Publiés</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              title="Vue grille"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              title="Vue liste"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <FiGrid className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune page trouvée</h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Essayez de modifier vos filtres de recherche.'
              : 'Commencez par créer votre première page.'}
          </p>
          {!searchQuery && filterType === 'all' && filterStatus === 'all' && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleCreateNewPage('landing_page')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Créer une Landing Page
              </button>
              <button
                onClick={() => handleCreateNewPage('registration_form')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Créer un Formulaire
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-gray-600">
            {filteredPages.length} page{filteredPages.length > 1 ? 's' : ''} trouvée{filteredPages.length > 1 ? 's' : ''}
          </div>

          {/* Pages Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {page.name || 'Page sans titre'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {(page as any).page_type === 'landing_page' ? 'Landing Page' : 'Formulaire'}
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

                    <div className="text-xs text-gray-600">
                      <div>Événement: {getEventName(page)}</div>
                      <div>Modifiée {new Date(page.updated_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPage(page.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <FiEdit className="w-3 h-3" />
                        Modifier
                      </button>

                      <button
                        onClick={() => handlePreviewPage(page.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Aperçu"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modifiée
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {page.name || 'Page sans titre'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (page as any).page_type === 'landing_page'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {(page as any).page_type === 'landing_page' ? 'Landing' : 'Formulaire'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getEventName(page)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {page.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditPage(page.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handlePreviewPage(page.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Aperçu
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}