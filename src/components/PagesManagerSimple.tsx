'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface PagesManagerProps {
  eventId?: string;
  className?: string;
}

export default function PagesManager({ eventId, className = '' }: PagesManagerProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, [eventId]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 PagesManager - Début de récupération des pages...');

      // Test de connection Supabase d'abord
      const { data: testData, error: testError } = await supabaseBrowser()
        .from('builder_pages')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ Test connection échoué:', testError);
        throw new Error(`Erreur de connection: ${testError.message}`);
      }

      console.log('✅ Connection Supabase OK');

      // Requête simplifiée pour débugger
      const { data, error } = await supabaseBrowser()
        .from('builder_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur requête pages:', error);
        throw error;
      }

      console.log('✅ Pages récupérées:', data?.length || 0, 'pages');
      console.log('📄 Détails des pages:', data);

      setPages(data || []);
    } catch (err: any) {
      console.error('❌ Erreur dans fetchPages:', err);
      setError(err.message || 'Erreur inconnue');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = async (pageType: 'landing_page' | 'registration_form') => {
    try {
      console.log('🆕 Création d\'une nouvelle page:', pageType);
      alert(`Fonction de création de ${pageType === 'landing_page' ? 'Landing Page' : 'Formulaire'} à implémenter`);
    } catch (err) {
      console.error('❌ Erreur création page:', err);
      alert('Erreur lors de la création de la page');
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <span className="text-gray-600">Chargement des pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <h3 className="text-red-800 font-medium mb-2">Erreur de chargement</h3>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={fetchPages}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">Debug Info</h3>
        <p className="text-blue-700 text-sm">
          • EventId: {eventId || 'Non défini'}<br/>
          • Nombre de pages trouvées: {pages.length}<br/>
          • Statut: {loading ? 'Chargement...' : 'Chargé'}
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">
            Créez et gérez toutes vos pages (landing pages et formulaires)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleCreateNewPage('landing_page')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle Landing Page
          </button>

          <button
            onClick={() => handleCreateNewPage('registration_form')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau Formulaire
          </button>
        </div>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune page trouvée</h3>
          <p className="text-sm text-gray-600 mb-6">
            Aucune page n'a été trouvée dans la base de données. Commencez par créer votre première page.
          </p>
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
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-gray-600">
            {pages.length} page{pages.length > 1 ? 's' : ''} trouvée{pages.length > 1 ? 's' : ''}
          </div>

          {/* Pages Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
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
                        {page.page_type === 'landing_page' ? 'Landing Page' : 'Formulaire'}
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
                    <div>Site ID: {page.site_id}</div>
                    <div>Modifiée {new Date(page.updated_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Éditer la page ${page.id}`)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>

                    <button
                      onClick={() => alert(`Aperçu de la page ${page.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Aperçu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la page "${page.name}" ?`)) {
                          alert(`Supprimer la page ${page.id}`)
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}