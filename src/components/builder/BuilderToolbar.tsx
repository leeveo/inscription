'use client'

import React, { useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import { useBuilder } from '@/contexts/BuilderContext';
import {
  FiSave,
  FiUpload,
  FiRotateCcw,
  FiRotateCw,
  FiEye,
  FiMonitor,
  FiSmartphone,
  FiTablet,
} from 'react-icons/fi';

interface BuilderToolbarProps {
  // Props interface - currently no props needed
}

export default function BuilderToolbar({}: BuilderToolbarProps) {
  const { actions, query, canUndo, canRedo, enabled } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
    enabled: state.options.enabled,
  }));

  const {
    currentPage,
    savePage,
    publishPage,
    isSaving,
    isPublishing,
    editorState,
    markDirty,
    updatePageName,
  } = useBuilder();

  const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [autoSaveTimeout, setAutoSaveTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState('');
  const [isSavingManual, setIsSavingManual] = React.useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);

  // Initialize tempName when currentPage changes
  useEffect(() => {
    if (currentPage && !isEditingName) {
      setTempName(currentPage.name || 'Sans titre');
    }
  }, [currentPage, isEditingName]);

  // TOUS LES AUTO-SAVES DÉSACTIVÉS POUR DÉBOGAGE
// Seulement la sauvegarde manuelle fonctionne pour l'instant

// Auto-save uniquement sur les changements d'historique (DÉSACTIVÉ)
// useEffect(() => {
//   if (!enabled || (!canUndo && !canRedo)) return;
//   markDirty();
//   if (autoSaveTimeout) {
//     clearTimeout(autoSaveTimeout);
//   }
//   const timeout = setTimeout(() => {
//     handleSave();
//   }, 2000);
//   setAutoSaveTimeout(timeout);
//   return () => {
//     if (timeout) clearTimeout(timeout);
//   };
// }, [canUndo, canRedo, enabled]);

// Détecter les changements via les clics (DÉSACTIVÉ)
// useEffect(() => {
//   const handleUserInteraction = () => {
//     if (enabled) {
//       markDirty();
//       if (autoSaveTimeout) {
//         clearTimeout(autoSaveTimeout);
//       }
//       const timeout = setTimeout(() => {
//         console.log('💾 Auto-saving after user inactivity...');
//         handleSave();
//       }, 3000);
//       setAutoSaveTimeout(timeout);
//     }
//   };
//   document.addEventListener('click', handleUserInteraction);
//   return () => {
//     document.removeEventListener('click', handleUserInteraction);
//   };
// }, [enabled, markDirty, handleSave]);

  const handlePreview = () => {
    if (currentPage) {
      window.open(`/preview/${currentPage.id}`, '_blank');
    }
  };

  const handleSave = async () => {
    try {
      console.log('💾 STARTING SAVE - NO INTERRUPTIONS');
      setIsSavingManual(true); // Activer l'état de chargement

      // Récupérer l'état courant et le sauvegarder directement
      const craftState = query.serialize();

      let treeData;
      if (typeof craftState === 'string') {
        treeData = JSON.parse(craftState);
      } else {
        treeData = craftState;
      }

      console.log('💾 ABOUT TO SAVE DATA WITH', Object.keys(treeData || {}).length, 'keys');

      // Appel direct à l'API sans passer par savePage du contexte
      if (!currentPage) {
        console.error('❌ No current page to save to');
        setIsSavingManual(false);
        return;
      }

      const response = await fetch(`/api/builder/pages/${currentPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tree: treeData,
          status: currentPage.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save page');
      }

      const data = await response.json();
      console.log('✅ DIRECT SAVE COMPLETED');

      // Feedback visuel de succès
      setIsSavingManual(false);
      setShowSaveSuccess(true);
      console.log('✨ Save complete - UI updated');

      // Cacher l'indicateur de succès après 2 secondes
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Save failed:', error);
      setIsSavingManual(false);
      throw error;
    }
  };

  const handleStartEditingName = () => {
    setTempName(currentPage?.name || 'Sans titre');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (tempName.trim() && tempName !== currentPage?.name) {
      try {
        await updatePageName(tempName.trim());
        console.log('✅ Name updated successfully');
      } catch (error) {
        console.error('❌ Error updating name:', error);
        // Reset to original name on error
        setTempName(currentPage?.name || 'Sans titre');
      }
    }
    setIsEditingName(false);
  };

  const handleCancelEditingName = () => {
    setTempName(currentPage?.name || 'Sans titre');
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditingName();
    }
  };

  const handleUndo = () => {
    actions.history.undo();
  };

  const handleRedo = () => {
    actions.history.redo();
  };

  
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left Section - Page Info */}
      <div className="flex items-center gap-4">
        <div>
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleNameKeyPress}
              className="font-semibold text-gray-900 bg-transparent border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 min-w-[200px]"
              autoFocus
              placeholder="Nom de la page..."
            />
          ) : (
            <h2 
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" 
              onClick={handleStartEditingName}
              title="Cliquer pour modifier le nom"
            >
              {currentPage?.name || 'Sans titre'}
            </h2>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded-full ${
              currentPage?.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {currentPage?.status === 'published' ? 'Publié' : 'Brouillon'}
            </span>
            {editorState.isDirty && (
              <span className="text-orange-600">• Non enregistré</span>
            )}
            {editorState.lastSaved && !editorState.isDirty && (
              <span>
                Enregistré {new Date(editorState.lastSaved).toLocaleTimeString('fr-FR')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Annuler (Ctrl+Z)"
        >
          <FiRotateCcw className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Refaire (Ctrl+Y)"
        >
          <FiRotateCw className="w-5 h-5 text-gray-700" />
        </button>

        <div className="h-8 w-px bg-gray-300 mx-2"></div>

        {/* Viewport Selection */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded transition-colors ${
              viewport === 'desktop'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vue Desktop"
          >
            <FiMonitor className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded transition-colors ${
              viewport === 'tablet'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vue Tablette"
          >
            <FiTablet className="w-4 h-4" />
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded transition-colors ${
              viewport === 'mobile'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vue Mobile"
          >
            <FiSmartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300 mx-2"></div>

        {/* Preview */}
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <FiEye className="w-4 h-4" />
          <span className="text-sm font-medium">Aperçu</span>
        </button>
      </div>

      {/* Right Section - Save & Publish */}
      <div className="flex items-center gap-3">
        {/* Indicateur de succès */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-500 ${
          showSaveSuccess
            ? 'bg-green-100 text-green-800 border border-green-200 opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}>
          <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span>Enregistré</span>
        </div>

        <button
          onClick={handleSave}
          disabled={isSavingManual || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
            isSavingManual || isSaving
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          } disabled:cursor-not-allowed`}
        >
          {isSavingManual || isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                {isSavingManual ? 'Enregistrement...' : 'Sauvegarde...'}
              </span>
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              <span className="text-sm font-medium">Enregistrer</span>
            </>
          )}
        </button>

        <button
          onClick={() => publishPage()}
          disabled={isPublishing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <FiUpload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isPublishing ? 'Publication...' : 'Publier'}
          </span>
        </button>
      </div>
    </div>
  );
}
