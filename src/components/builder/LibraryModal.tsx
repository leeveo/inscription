'use client'

import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import BuilderLibrary from './BuilderLibrary';
import type { BuilderPage, BuilderTemplate } from '@/types/builder';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: BuilderPage[];
  templates: BuilderTemplate[];
}

export default function LibraryModal({
  isOpen,
  onClose,
  pages,
  templates,
}: LibraryModalProps) {
  // Debug log
  useEffect(() => {
    console.log('🔴 LibraryModal - isOpen:', isOpen, 'pages:', pages.length, 'templates:', templates.length);
  }, [isOpen, pages, templates]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Rendu conditionnel au lieu d'early return pour éviter l'erreur de hooks
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ma Bibliothèque</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez vos pages et choisissez des templates
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Fermer (Esc)"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <BuilderLibrary
            initialPages={pages}
            initialTemplates={templates}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
}
