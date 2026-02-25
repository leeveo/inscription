import React from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

interface WizardSelectionProps {
  selectedWizardType: string | null;
  onSelect: (type: string) => void;
  onContinue: () => void;
}

export default function WizardSelection({ selectedWizardType, onSelect, onContinue }: WizardSelectionProps) {
  const wizardTypes = [
    {
      id: 'salon-professionnel',
      title: 'Salon professionnel checkin',
      description: 'Optimisé pour les salons avec système de check-in avancé, gestion des visiteurs et badges numériques',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-blue-600 via-blue-700 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      hoverColor: 'group-hover:text-blue-600',
      tags: ['Check-in QR', 'Badges', 'Analytics'],
      tagColors: ['bg-blue-100 text-blue-700', 'bg-cyan-100 text-cyan-700', 'bg-sky-100 text-sky-700'],
      buttonClass: 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 border-blue-400/30',
      activeBorderClass: 'border-blue-600 ring-blue-300/30',
      checkGradient: 'from-blue-600 via-blue-700 to-cyan-600'
    },
    {
      id: 'conference',
      title: 'Conférence, session et séminaire',
      description: 'Parfait pour conférences, formations, ateliers et séminaires avec gestion complète des sessions, intervenants et participants',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      gradient: 'from-violet-600 via-purple-600 to-indigo-600',
      bgGradient: 'from-violet-50 to-indigo-50',
      borderColor: 'border-violet-200 hover:border-violet-400',
      hoverColor: 'group-hover:text-violet-600',
      tags: ['Sessions', 'Intervenants', 'Agenda', 'Networking'],
      tagColors: ['bg-violet-100 text-violet-700', 'bg-purple-100 text-purple-700', 'bg-indigo-100 text-indigo-700', 'bg-fuchsia-100 text-fuchsia-700'],
      buttonClass: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 border-violet-400/30',
      activeBorderClass: 'border-violet-600 ring-violet-300/30',
      checkGradient: 'from-violet-600 via-purple-600 to-indigo-600'
    },
    {
      id: 'concert-payant',
      title: 'Concert payant',
      description: 'Spécialisé pour événements musicaux avec billetterie, différents tarifs et gestion des places',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      hoverColor: 'group-hover:text-orange-600',
      tags: ['Billetterie', 'Paiements', 'Places numérotées'],
      tagColors: ['bg-orange-100 text-orange-700', 'bg-red-100 text-red-700', 'bg-pink-100 text-pink-700'],
      buttonClass: 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 border-orange-400/30',
      activeBorderClass: 'border-orange-600 ring-orange-300/30',
      checkGradient: 'from-orange-600 via-red-600 to-pink-600'
    }
  ];

  const selectedWizard = wizardTypes.find(w => w.id === selectedWizardType);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Choisissez le type d'événement
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sélectionnez le type d'événement que vous souhaitez créer. Chaque wizard est optimisé pour des fonctionnalités spécifiques.
        </p>
      </div>

      {/* Wizard Type Selection Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {wizardTypes.map((wizard) => (
          <div 
            key={wizard.id}
            onClick={() => onSelect(wizard.id)}
            className={`group cursor-pointer bg-gradient-to-br ${wizard.bgGradient} rounded-2xl p-6 border-2 ${
              selectedWizardType === wizard.id 
                ? `${wizard.activeBorderClass} ring-2 bg-white/50 backdrop-blur-sm` 
                : wizard.borderColor
            } transition-all duration-300 transform hover:scale-105 hover:shadow-xl relative`}
          >
            <div className="flex flex-col items-center text-center">
              {/* Selection Indicator */}
              {selectedWizardType === wizard.id && (
                <div className={`absolute top-4 right-4 w-6 h-6 bg-gradient-to-br ${wizard.checkGradient} rounded-full flex items-center justify-center shadow-lg`}>
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${wizard.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                {wizard.icon}
              </div>
              <h3 className={`text-xl font-bold text-gray-900 mb-2 transition-colors ${wizard.hoverColor}`}>
                {wizard.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {wizard.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {wizard.tags.map((tag, index) => (
                  <span key={tag} className={`px-3 py-1 ${wizard.tagColors[index]} text-xs rounded-full font-medium`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="text-center mt-8">
        {selectedWizardType ? (
          <button 
            onClick={onContinue}
            className={`inline-flex items-center gap-2 px-8 py-3 ${selectedWizard?.buttonClass} text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border backdrop-blur-sm`}
          >
            <span>Continuer avec {selectedWizard?.title}</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-gray-500 font-medium">
            Sélectionnez un type de wizard pour continuer
          </div>
        )}
      </div>
    </div>
  );
}
