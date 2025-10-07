'use client'

import React, { useEffect } from 'react';
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';

interface DeletePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pageName: string;
  isDeleting?: boolean;
}

export default function DeletePageModal({
  isOpen,
  onClose,
  onConfirm,
  pageName,
  isDeleting = false,
}: DeletePageModalProps) {
  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onClose]);

  // Bloquer le scroll du body quand le modal est ouvert
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop avec blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Container avec glassmorphism */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Background gradient comme la sidebar */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-cyan-400/10 rounded-2xl"></div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"></div>

        {/* Particules décoratives */}
        <div className="absolute inset-0 opacity-40 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-300/15 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Icône d'alerte avec effet glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg"></div>
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                  <FiAlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Supprimer la page</h3>
                <p className="text-sm text-blue-200/70">Cette action est irréversible</p>
              </div>
            </div>

            {/* Bouton fermer */}
            {!isDeleting && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-200/70 hover:text-white"
                aria-label="Fermer"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Message */}
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-blue-100/90 mb-2">
              Êtes-vous sûr de vouloir supprimer cette page ?
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-200/70">Page :</span>
              <span className="font-semibold text-white bg-white/10 px-3 py-1 rounded-lg">
                {pageName}
              </span>
            </div>
          </div>

          {/* Avertissement */}
          <div className="mb-6 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
            <p className="text-sm text-red-200/90 flex items-start gap-2">
              <FiAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Toutes les données de cette page seront définitivement perdues et ne pourront pas être récupérées.
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {/* Bouton Annuler */}
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-blue-100 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>

            {/* Bouton Supprimer */}
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="relative flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 group-hover:from-red-600 group-hover:to-red-700 transition-all"></div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 blur transition-all"></div>

              {/* Content */}
              <span className="relative flex items-center justify-center gap-2">
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-5 h-5" />
                    <span>Supprimer</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
