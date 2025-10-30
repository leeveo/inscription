'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

// Types locaux pour éviter les dépendances
interface BuilderPage {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  tree: any;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

// Icônes SVG simples
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

interface PagesManagerProps {
  eventId?: string;
  className?: string;
}

export default function PagesManager({ eventId, className = '' }: PagesManagerProps) {
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'landing_page' | 'registration_form'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPages();
  }, [eventId]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      console.log('🔍 PagesManager - Fetching all pages...');

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
        console.error('❌ PagesManager - Error fetching pages:', error);
        throw error;
      }

      console.log('✅ PagesManager - Pages fetched:', data?.length || 0);
      setPages(data || []);
    } catch (err) {
      console.error('❌ PagesManager - Error in fetchPages:', err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = async (pageType: 'landing_page' | 'registration_form') => {
    try {
      console.log('🆕 PagesManager - Creating new page:', pageType);

      // Créer un nouveau site avec l'événement assigné si disponible
      const { data: newSite, error: siteError } = await (supabaseBrowser() as any)
        .from('builder_sites')
        .insert({
          name: `Site - ${new Date().toLocaleDateString('fr-FR')}`,
          site_slug: `site-${Date.now()}`,
          status: 'draft',
          event_id: eventId || null,
        })
        .select()
        .single();

      if (siteError) {
        console.error('❌ PagesManager - Error creating site:', siteError);
        throw siteError;
      }

      console.log('✅ PagesManager - Site created:', newSite?.id);

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
        console.error('❌ PagesManager - Error creating page:', pageError);
        throw pageError;
      }

      console.log('✅ PagesManager - Page created:', newPage.id);

      // Rediriger vers l'éditeur dans un nouvel onglet
      window.open(`/admin/builder/${newPage.id}`, '_blank');
      
      // Recharger la liste
      await fetchPages();
    } catch (err) {
      console.error('❌ PagesManager - Error creating new page:', err);
      alert('Erreur lors de la création de la page');
    }
  };

  const handleEditPage = (pageId: string) => {
    window.open(`/admin/builder/${pageId}`, '_blank');
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
    return (page as any).builder_sites?.inscription_evenements?.nom || 
           (page as any).builder_sites?.event_name || 
           'Non assigné';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des pages...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">
            Créez et gérez toutes vos pages (landing pages et formulaires) depuis cet encart intégré
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleCreateNewPage('landing_page')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm"
          >
            <PlusIcon />
            Nouvelle Landing Page
          </button>

          <button
            onClick={() => handleCreateNewPage('registration_form')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm text-sm"
          >
            <PlusIcon />
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
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
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
            <FilterIcon />
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
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              title="Vue liste"
            >
              <ListIcon />
            </button>
          </div>
        </div>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Créer une Landing Page
              </button>
              <button
                onClick={() => handleCreateNewPage('registration_form')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
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
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handlePreviewPage(page.id)}
                            className="text-gray-600 hover:text-gray-900 text-sm"
                          >
                            Aperçu
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
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