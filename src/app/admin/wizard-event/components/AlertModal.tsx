import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export default function AlertModal({ isOpen, onClose, message, title = "Attention", type = 'warning' }: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FiAlertCircle className="w-12 h-12 text-red-500" />;
      case 'success':
        return <FiCheckCircle className="w-12 h-12 text-green-500" />;
      case 'info':
        return <FiInfo className="w-12 h-12 text-blue-500" />;
      default:
        return <FiAlertCircle className="w-12 h-12 text-amber-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'error':
        return 'from-red-50 to-pink-50 border-red-200';
      case 'success':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'info':
        return 'from-blue-50 to-cyan-50 border-blue-200';
      default:
        return 'from-amber-50 to-orange-50 border-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-all duration-300">
      <div 
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white/80 p-6 text-left align-middle shadow-xl transition-all border border-white/50 backdrop-blur-md`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background elements */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-50`} />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/40 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-white rounded-full shadow-lg border border-white/50">
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <button
            type="button"
            className="inline-flex justify-center rounded-xl border border-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 py-3 text-sm font-medium text-white hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={onClose}
          >
            Compris
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Helper icons for other types if needed
import { FiCheckCircle, FiInfo } from 'react-icons/fi';
