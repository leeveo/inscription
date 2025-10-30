'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BuilderPage, BuilderTemplate } from '@/types/builder';
import DeletePageModal from './DeletePageModal';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiEye,
  FiClock,
  FiLayout,
  FiSearch,
} from 'react-icons/fi';

interface BuilderLibraryProps {
  initialPages: BuilderPage[];
  initialTemplates: BuilderTemplate[];
  isModal?: boolean;
}

export default function BuilderLibrary({
  initialPages,
  initialTemplates,
  isModal = false,
}: BuilderLibraryProps) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-pages' | 'templates'>('my-pages');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; pageId: string; pageName: string }>({
    isOpen: false,
    pageId: '',
    pageName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = async () => {
    try {
      const response = await fetch('/api/builder/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nouvelle page',
          slug: `page-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.message || 'Failed to create page');
      }

      router.push(`/admin/builder/${data.page.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      alert('Erreur lors de la création de la page: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/builder/pages/${pageId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to duplicate page');

      const { page } = await response.json();
      setPages([page, ...pages]);
    } catch (error) {
      console.error('Error duplicating page:', error);
      alert('Erreur lors de la duplication de la page');
    }
  };

  const openDeleteModal = (pageId: string, pageName: string) => {
    setDeleteModal({ isOpen: true, pageId, pageName });
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, pageId: '', pageName: '' });
    }
  };

  const handleDeletePage = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/builder/pages/${deleteModal.pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete page');

      setPages(pages.filter(p => p.id !== deleteModal.pageId));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Erreur lors de la suppression de la page');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateFromTemplate = async (template: BuilderTemplate) => {
    try {
      const response = await fetch('/api/builder/pages/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          name: `Nouvelle page - ${template.label}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to create page from template');

      const { page } = await response.json();
      router.push(`/admin/builder/${page.id}`);
    } catch (error) {
      console.error('Error creating page from template:', error);
      alert('Erreur lors de la création de la page depuis le template');
    }
  };

  return (
    <div className={isModal ? 'bg-gray-50' : 'min-h-screen bg-gray-50'}>
      {/* Header - Hidden in modal mode */}
      {!isModal && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Page Builder</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Créez et gérez vos pages web avec le builder visuel
                </p>
              </div>

              <button
                onClick={handleCreatePage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <FiPlus className="w-5 h-5" />
                <span className="font-medium">Nouvelle page</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs with Create Button in Modal Mode */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('my-pages')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'my-pages'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes pages ({pages.length})
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Templates ({initialTemplates.length})
            </button>
          </div>

          {/* Create Button in Modal Mode */}
          {isModal && (
            <button
              onClick={handleCreatePage}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm mb-2"
            >
              <FiPlus className="w-5 h-5" />
              <span className="font-medium">Nouvelle page</span>
            </button>
          )}
        </div>

        {/* Search */}
        {activeTab === 'my-pages' && (
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* My Pages */}
        {activeTab === 'my-pages' && (
          <div>
            {filteredPages.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <FiLayout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Aucune page trouvée' : 'Aucune page créée'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery
                    ? 'Essayez une autre recherche'
                    : 'Créez votre première page pour commencer'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreatePage}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Créer une page</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    {/* Preview */}
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <FiLayout className="w-16 h-16 text-blue-300" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate flex-1">
                          {page.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            page.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {page.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                        <FiClock className="w-3 h-3" />
                        <span>
                          Modifié {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/builder/${page.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                          <span>Éditer</span>
                        </Link>

                        <button
                          onClick={() => handleDuplicatePage(page.id)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                          title="Dupliquer"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openDeleteModal(page.id, page.name)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Supprimer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <div>
            {initialTemplates.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <FiLayout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun template disponible
                </h3>
                <p className="text-sm text-gray-500">
                  Exécutez le script SQL insert_starter_templates.sql pour charger les templates
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    {/* Preview */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden group/preview">
                      {template.preview_image ? (
                        <>
                          <img
                            src={template.preview_image}
                            alt={template.label}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/preview:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover/preview:bg-black/30 transition-colors" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FiLayout className="w-20 h-20 text-purple-200" />
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          template.category === 'event'
                            ? 'bg-blue-500 text-white'
                            : template.category === 'marketing'
                            ? 'bg-purple-500 text-white'
                            : template.category === 'portfolio'
                            ? 'bg-pink-500 text-white'
                            : template.category === 'contact'
                            ? 'bg-green-500 text-white'
                            : template.category === 'support'
                            ? 'bg-yellow-500 text-white'
                            : template.category === 'online'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {template.category === 'event' ? 'Événement' :
                           template.category === 'marketing' ? 'Marketing' :
                           template.category === 'portfolio' ? 'Portfolio' :
                           template.category === 'contact' ? 'Contact' :
                           template.category === 'support' ? 'Support' :
                           template.category === 'online' ? 'En ligne' : 'Autre'}
                        </span>
                      </div>
                      {/* System Badge */}
                      {template.is_system && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-white/90 text-purple-700 shadow-sm">
                            ⭐ Officiel
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">
                        {template.label}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      {/* Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateFromTemplate(template)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>Utiliser</span>
                        </button>

                        {/* Preview Button - Future Enhancement */}
                        <button
                          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                          title="Aperçu (prochainement)"
                          disabled
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Page Modal */}
      <DeletePageModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeletePage}
        pageName={deleteModal.pageName}
        isDeleting={isDeleting}
      />
    </div>
  );
}
