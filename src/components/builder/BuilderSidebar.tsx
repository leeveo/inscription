'use client'

import React, { useState } from 'react';
import { useEditor, Element } from '@craftjs/core';
import {
  FiLayout,
  FiType,
  FiImage,
  FiSquare,
  FiGrid,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiHelpCircle,
  FiMessageSquare,
} from 'react-icons/fi';

// Import all block components
import { Container } from './blocks/Container';
import { TextBlock } from './blocks/Text';
import { ButtonBlock } from './blocks/Button';
import { SimpleText } from './blocks/SimpleText';
import { SimpleButton } from './blocks/SimpleButton';
import { Hero } from './blocks/Hero';
import { Countdown } from './blocks/Countdown';
import { Agenda } from './blocks/Agenda';
import { Speakers } from './blocks/Speakers';
import { Map } from './blocks/Map';
import { FAQ } from './blocks/FAQ';
import { Gallery } from './blocks/Gallery';
import { ImageHero } from './blocks/ImageHero';
import { Footer } from './blocks/Footer';
import { EventDetails } from './blocks/EventDetails';
import { RegistrationForm } from './blocks/RegistrationForm';
import { DesignForm } from './blocks/DesignForm';
import { CreativeForm } from './blocks/CreativeForm';
import { CorporateForm } from './blocks/CorporateForm';
import { TechForm } from './blocks/TechForm';
import { Session } from './blocks/Session';

interface BlockCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BlockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  categoryId: string;
  component: React.ComponentType<any>;
  isCanvas?: boolean;
}

const categories: BlockCategory[] = [
  { id: 'layout', label: 'Mise en page', icon: <FiLayout className="w-4 h-4" /> },
  { id: 'content', label: 'Contenu', icon: <FiType className="w-4 h-4" /> },
  { id: 'forms', label: 'Formulaires', icon: <FiMessageSquare className="w-4 h-4" /> },
  { id: 'event', label: 'Événement', icon: <FiCalendar className="w-4 h-4" /> },
  { id: 'session', label: 'Sessions', icon: <FiClock className="w-4 h-4" /> },
  { id: 'media', label: 'Média', icon: <FiImage className="w-4 h-4" /> },
];

const blocks: BlockItem[] = [
  // Layout blocks
  { id: 'container', label: 'Conteneur', icon: <FiSquare />, categoryId: 'layout', component: Container, isCanvas: true },
  { id: 'section', label: 'Section', icon: <FiGrid />, categoryId: 'layout', component: Container, isCanvas: true },

  // Content blocks
  { id: 'simpleText', label: 'Texte Simple', icon: <FiType />, categoryId: 'content', component: SimpleText },
  { id: 'simpleButton', label: 'Bouton Simple', icon: <FiSquare />, categoryId: 'content', component: SimpleButton },
  { id: 'text', label: 'Texte', icon: <FiType />, categoryId: 'content', component: TextBlock },
  { id: 'button', label: 'Bouton', icon: <FiSquare />, categoryId: 'content', component: ButtonBlock },
  { id: 'faq', label: 'FAQ', icon: <FiHelpCircle />, categoryId: 'content', component: FAQ },
  { id: 'footer', label: 'Footer', icon: <FiMessageSquare />, categoryId: 'content', component: Footer },

  // Form blocks
  { id: 'registrationForm', label: 'Formulaire d\'inscription', icon: <FiMessageSquare />, categoryId: 'forms', component: RegistrationForm },
  { id: 'designForm', label: 'Formulaire Design', icon: <FiMessageSquare />, categoryId: 'forms', component: DesignForm },
  { id: 'creativeForm', label: 'Formulaire Créatif 🎨', icon: <FiMessageSquare />, categoryId: 'forms', component: CreativeForm },
  { id: 'corporateForm', label: 'Formulaire Entreprise 💼', icon: <FiMessageSquare />, categoryId: 'forms', component: CorporateForm },
  { id: 'techForm', label: 'Formulaire Tech 💻', icon: <FiMessageSquare />, categoryId: 'forms', component: TechForm },

  // Event blocks (Phase 2)
  { id: 'hero', label: 'Hero', icon: <FiLayout />, categoryId: 'event', component: Hero },
  { id: 'eventDetails', label: 'Détails événement', icon: <FiCalendar />, categoryId: 'event', component: EventDetails },
  { id: 'countdown', label: 'Compte à rebours', icon: <FiClock />, categoryId: 'event', component: Countdown },
  { id: 'agenda', label: 'Agenda', icon: <FiCalendar />, categoryId: 'event', component: Agenda },
  { id: 'speakers', label: 'Intervenants', icon: <FiUsers />, categoryId: 'event', component: Speakers },
  { id: 'map', label: 'Carte', icon: <FiMapPin />, categoryId: 'event', component: Map },

  // Session blocks
  { id: 'session', label: 'Sessions', icon: <FiClock />, categoryId: 'session', component: Session },

  // Media blocks
  { id: 'imageHero', label: 'Image Hero', icon: <FiImage />, categoryId: 'media', component: ImageHero },
  { id: 'gallery', label: 'Galerie', icon: <FiImage />, categoryId: 'media', component: Gallery },
];

export default function BuilderSidebar() {
  const { connectors } = useEditor();
  const [activeCategory, setActiveCategory] = useState<string>('layout');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlocks = blocks.filter(block => {
    const matchesCategory = block.categoryId === activeCategory;
    const matchesSearch = block.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Bibliothèque de blocs</h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher un bloc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Categories */}
        <div className="w-32 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-2 space-y-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors rounded-lg ${
                  activeCategory === category.id
                    ? 'text-blue-600 bg-blue-100 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {category.icon}
                <span className="text-center leading-tight">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Blocks */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {filteredBlocks.map(block => (
              <div
                key={block.id}
                ref={(ref) => {
                  if (ref) {
                    console.log('🔨 Setting up draggable for:', block.label);
                    console.log('🔨 Component type:', block.component.name || 'Unknown');
                    console.log('🔨 Is canvas:', block.isCanvas);

                    try {
                      connectors.create(
                        ref,
                        <Element
                          is={block.component}
                          canvas={block.isCanvas || false}
                        />
                      );
                      console.log('✅ Successfully created draggable element for:', block.label);
                    } catch (error) {
                      console.error('❌ Error creating draggable for', block.label, ':', error);
                    }
                  }
                }}
                onMouseDown={() => console.log('🎯 Drag started for:', block.label)}
                onMouseUp={() => console.log('🎯 Drag ended for:', block.label)}
                onDragStart={() => console.log('🚀 Drag event started for:', block.label)}
                onDragEnd={() => console.log('🏁 Drag event ended for:', block.label)}
                className="group cursor-move bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-blue-100 border border-gray-200 group-hover:border-blue-300 flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors flex-shrink-0">
                    {block.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 leading-tight">
                    {block.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredBlocks.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <FiLayout className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-xs text-gray-500">Aucun bloc trouvé</p>
              <p className="text-xs text-gray-400 mt-1">Essayez une autre recherche</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <div className="mt-0.5">💡</div>
          <div>
            <p className="font-medium mb-1">Glisser-déposer</p>
            <p className="text-gray-500">
              Sélectionnez une catégorie à gauche, puis glissez les blocs sur le canvas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
