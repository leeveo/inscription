'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { EditorState, BuilderPage, CraftPage } from '@/types/builder';

interface BuilderContextType {
  // Page state
  currentPage: BuilderPage | null;
  setCurrentPage: (page: BuilderPage | null) => void;

  // Editor state
  editorState: EditorState;
  setEditorState: (state: EditorState | ((prev: EditorState) => EditorState)) => void;

  // History management
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Save/publish
  savePage: (treeData?: any) => Promise<void>;
  publishPage: () => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;

  // Page management
  updatePageName: (name: string) => Promise<void>;

  // Utility
  markDirty: () => void;
  markClean: () => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<BuilderPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [editorState, setEditorState] = useState<EditorState>({
    selectedNodeId: undefined,
    hoveredNodeId: undefined,
    clipboardNode: undefined,
    history: {
      past: [],
      present: { rootNodeId: '', nodes: {} },
      future: [],
    },
    isDirty: false,
    lastSaved: undefined,
  });

  // Sync editor state with current page - DÉSACTIVÉ POUR DÉBOGAGE
  // useEffect(() => {
  //   if (currentPage && currentPage.id) {
  //     setEditorState(prev => ({
  //       ...prev,
  //       history: {
  //         past: [],
  //         present: currentPage.tree,
  //         future: [],
  //       },
  //       isDirty: false,
  //     }));
  //   }
  // }, [currentPage?.id, currentPage?.tree]);

  // History management
  const undo = useCallback(() => {
    setEditorState(prev => {
      if (prev.history.past.length === 0) return prev;

      const previous = prev.history.past[prev.history.past.length - 1];
      const newPast = prev.history.past.slice(0, prev.history.past.length - 1);

      return {
        ...prev,
        history: {
          past: newPast,
          present: previous,
          future: [prev.history.present, ...prev.history.future],
        },
        isDirty: true,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setEditorState(prev => {
      if (prev.history.future.length === 0) return prev;

      const next = prev.history.future[0];
      const newFuture = prev.history.future.slice(1);

      return {
        ...prev,
        history: {
          past: [...prev.history.past, prev.history.present],
          present: next,
          future: newFuture,
        },
        isDirty: true,
      };
    });
  }, []);

  const canUndo = editorState.history.past.length > 0;
  const canRedo = editorState.history.future.length > 0;

  // Save & Publish
  const savePage = useCallback(async (treeData?: any) => {
    if (!currentPage) {
      console.log('🚫 DEBUG - No current page, cannot save');
      return;
    }

    console.log('💾 DEBUG - treeData parameter:', treeData);
    console.log('💾 DEBUG - editorState.history.present:', editorState.history.present);

    const dataToSave = treeData;

    console.log('💾 DEBUG - Saving page:', currentPage.id);
    console.log('💾 DEBUG - Tree to save:', dataToSave);

    setIsSaving(true);
    try {
      const saveData = {
        tree: dataToSave,
        status: currentPage.status,
      };

      console.log('💾 DEBUG - Sending to API:', saveData);

      const response = await fetch(`/api/builder/pages/${currentPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      console.log('💾 DEBUG - API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Save failed:', errorData);
        throw new Error(errorData.message || 'Failed to save page');
      }

      const data = await response.json();
      console.log('✅ DEBUG - Save response:', data);

      if (data.success && data.page) {
        setCurrentPage(data.page);
        setEditorState(prev => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        }));
        console.log('✅ DEBUG - Page saved successfully');
        console.log('🔄 DEBUG - NOT updating history.present to avoid Canvas disruption');
      } else {
        throw new Error(data.message || 'Failed to save page');
      }
    } catch (error) {
      console.error('❌ Error saving page:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentPage, editorState.history.present]);

  const publishPage = useCallback(async () => {
    if (!currentPage) return;

    setIsPublishing(true);
    try {
      // First save
      await savePage();

      // Then publish
      const response = await fetch(`/api/builder/pages/${currentPage.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Publish failed:', errorData);
        throw new Error(errorData.message || 'Failed to publish page');
      }

      const data = await response.json();
      if (data.success && data.page) {
        setCurrentPage(data.page);
      } else {
        throw new Error(data.message || 'Failed to publish page');
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  }, [currentPage, savePage]);

  // Update page name
  const updatePageName = useCallback(async (name: string) => {
    if (!currentPage) {
      console.log('🚫 DEBUG - No current page, cannot update name');
      return;
    }

    console.log('📝 DEBUG - Updating page name:', name);

    try {
      const response = await fetch(`/api/builder/pages/${currentPage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Name update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update page name');
      }

      const data = await response.json();
      console.log('✅ DEBUG - Name update response:', data);

      // Update local state
      setCurrentPage(prev => prev ? { ...prev, name } : null);
    } catch (error) {
      console.error('❌ Error updating page name:', error);
      throw error;
    }
  }, [currentPage]);

  // Utility functions
  const markDirty = useCallback(() => {
    setEditorState(prev => ({ ...prev, isDirty: true }));
  }, []);

  const markClean = useCallback(() => {
    setEditorState(prev => ({ ...prev, isDirty: false }));
  }, []);

  // Auto-save désactivé pour éviter les conflits avec le Canvas
  // useEffect(() => {
  //   if (!editorState.isDirty || !currentPage) return;

  //   const timeout = setTimeout(() => {
  //     savePage().catch(console.error);
  //   }, 3000); // Auto-save after 3 seconds of inactivity

  //   return () => clearTimeout(timeout);
  // }, [editorState.isDirty, currentPage, savePage]);

  const value: BuilderContextType = {
    currentPage,
    setCurrentPage,
    editorState,
    setEditorState,
    undo,
    redo,
    canUndo,
    canRedo,
    savePage,
    publishPage,
    isSaving,
    isPublishing,
    updatePageName,
    markDirty,
    markClean,
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
