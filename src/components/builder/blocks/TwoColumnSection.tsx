'use client'

import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';

export interface TwoColumnSectionProps {
  background?: string;
  padding?: number;
  margin?: number;
  gap?: number;
  leftColumnWidth?: string;
  rightColumnWidth?: string;
  verticalAlign?: string;
  sectionWidth?: string;
  horizontalAlign?: 'left' | 'center' | 'right';
  className?: string;
  responsiveMode?: 'always-columns' | 'stack-mobile' | 'stack-tablet' | 'always-stack';
  mobileGap?: number;
}

export const TwoColumnSection = ({
  background = '#ffffff',
  padding = 20,
  margin = 0,
  gap = 20,
  leftColumnWidth = '50%',
  rightColumnWidth = '50%',
  verticalAlign = 'top',
  sectionWidth = '100%',
  horizontalAlign = 'left',
  className = '',
  responsiveMode = 'stack-mobile',
  mobileGap = 10,
}: TwoColumnSectionProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
    id,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
    id: state.id,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const getVerticalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return { alignItems: 'center' };
      case 'bottom':
        return { alignItems: 'flex-end' };
      case 'top':
      default:
        return { alignItems: 'flex-start' };
    }
  };

  const verticalAlignStyle = getVerticalAlignStyle(verticalAlign);

  const getHorizontalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return { marginLeft: 'auto', marginRight: 'auto' };
      case 'right':
        return { marginLeft: 'auto', marginRight: '0' };
      case 'left':
      default:
        return { marginLeft: '0', marginRight: 'auto' };
    }
  };

  // Fonction pour gérer les classes de responsivité
  const getResponsiveClasses = (mode: string) => {
    switch (mode) {
      case 'always-columns':
        return 'flex flex-row'; // Toujours en colonnes
      case 'stack-mobile':
        return 'flex flex-col sm:flex-row'; // Stack sur mobile, colonnes sur tablet+
      case 'stack-tablet':
        return 'flex flex-col lg:flex-row'; // Stack sur mobile/tablet, colonnes sur desktop
      case 'always-stack':
        return 'flex flex-col'; // Toujours en stack
      default:
        return 'flex flex-col sm:flex-row';
    }
  };

  // 🔥 Fonction pour les classes de largeur responsive des colonnes
  const getColumnWidthClasses = (width: string, isLeft: boolean = true) => {
    // Sur mobile : toujours 100%
    // Sur desktop : largeur configurée
    const baseClasses = 'w-full'; // 100% par défaut (mobile)
    
    // Ajout des breakpoints pour desktop
    switch (responsiveMode) {
      case 'always-columns':
        return `${baseClasses}`; // Pas de responsive, géré par style
      case 'stack-mobile':
        // w-full sur mobile, largeur configurée sur sm+
        return `${baseClasses} sm:flex-none`; 
      case 'stack-tablet':
        // w-full sur mobile/tablet, largeur configurée sur lg+
        return `${baseClasses} lg:flex-none`;
      case 'always-stack':
        return baseClasses; // Toujours 100%
      default:
        return `${baseClasses} sm:flex-none`;
    }
  };

  const horizontalAlignStyle = getHorizontalAlignStyle(horizontalAlign);
  const responsiveClasses = getResponsiveClasses(responsiveMode);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`relative ${className} ${!enabled ? 'twocolumn-preview-mode' : ''}`}
      style={{
        background,
        padding: `${padding}px`,
        margin: `${margin}px`,
        width: sectionWidth,
        maxWidth: sectionWidth,
        ...horizontalAlignStyle,
        border: enabled
          ? (selected || hovered ? '2px solid #3B82F6' : '2px dashed #e5e7eb')
          : 'none',
        transition: 'border 0.2s ease',
      }}
    >
      {/* CSS RESPONSIVE + Hide Craft.js formatting elements in preview mode + ImageHero compatibility */}
      <style jsx global>{`
        /* 🔥 CSS RESPONSIVE SIMPLE ET SÛR */
        
        /* Sur mobile : toujours 100% (flex-col force déjà ça) */
        .two-column-left,
        .two-column-right {
          width: 100%;
        }

        /* Sur desktop EN MODE FLEX-ROW seulement : largeurs configurées */
        @media (min-width: 640px) {
          .flex-row .two-column-left {
            flex: 0 0 ${leftColumnWidth};
            width: ${leftColumnWidth};
            max-width: ${leftColumnWidth};
          }
          .flex-row .two-column-right {
            flex: 0 0 ${rightColumnWidth};
            width: ${rightColumnWidth};
            max-width: ${rightColumnWidth};
          }
        }

        /* Preview mode styles */
        .twocolumn-preview-mode [data-canvas="true"] {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          outline: none !important;
          min-height: auto !important;
          width: 100% !important;
          display: block !important;
        }
        .twocolumn-preview-mode [data-canvas="true"] > div {
          border: none !important;
          background: transparent !important;
          width: 100% !important;
        }
        
        /* Masquer les éléments de l'éditeur */
        .twocolumn-preview-mode .m-auto {
          display: none !important;
        }
        .twocolumn-preview-mode svg {
          display: none !important;
        }
        .twocolumn-preview-mode .flex.items-center.justify-center {
          display: none !important;
        }
        .twocolumn-preview-mode .bg-blue-100,
        .twocolumn-preview-mode .bg-green-100 {
          display: none !important;
        }
        .twocolumn-preview-mode .text-blue-700,
        .twocolumn-preview-mode .text-green-700 {
          display: none !important;
        }
        .twocolumn-preview-mode .border-dashed,
        .twocolumn-preview-mode .border-blue-200,
        .twocolumn-preview-mode .border-green-200,
        .twocolumn-preview-mode .border-2 {
          border: none !important;
        }
        .twocolumn-preview-mode .min-h-\\[100px\\] {
          border: none !important;
          min-height: auto !important;
        }
        .twocolumn-preview-mode .flex.items-center.justify-center.h-full {
          display: none !important;
        }
        .twocolumn-preview-mode .text-gray-400 {
          display: none !important;
        }
        
        /* Améliorer la compatibilité avec ImageHero */
        .twocolumn-preview-mode .relative {
          position: relative !important;
        }
        .twocolumn-preview-mode img {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
        }
        .twocolumn-preview-mode .aspect-video,
        .twocolumn-preview-mode .aspect-square,
        .twocolumn-preview-mode [class*="aspect-"] {
          width: 100% !important;
        }
        `}</style>

      {/* Selection Indicator - Only in edit mode */}
      {enabled && (selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-t z-10">
          📊 Section 2 Colonnes {selected && '• Sélectionné'}
        </div>
      )}

      {/* Content - Responsive Two columns layout */}
      <div 
        className={`${responsiveClasses} w-full gap-4 sm:gap-6 md:gap-8`} 
        style={{ 
          gap: responsiveMode === 'always-stack' || responsiveMode === 'stack-mobile' ? `${mobileGap}px` : `${gap}px`,
          ...verticalAlignStyle 
        }}
      >
        {/* Left Column */}
        <div 
          className="two-column-left"
        >
          {enabled && (
            <div className="mb-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded border border-blue-300 text-center">
              📱 Colonne Gauche (responsive)
            </div>
          )}

          {/* Element container avec meilleure gestion pour ImageHero */}
          <Element
            id={`${id}-left-column`}
            is="div"
            canvas={true}
            className={enabled ? 'min-h-[100px] border-2 border-dashed border-blue-200 rounded-lg p-3' : 'w-full'}
            style={{
              minHeight: enabled ? '100px' : 'auto',
              border: enabled ? '2px dashed #3b82f6' : 'none',
              borderRadius: enabled ? '8px' : '0',
              padding: enabled ? '12px' : '0',
              backgroundColor: enabled ? 'transparent' : 'transparent',
              width: '100%',
              display: 'block', // Améliore la compatibilité avec ImageHero
            }}
          >
          </Element>
        </div>

        {/* Right Column */}
        <div 
          className="two-column-right"
        >
          {enabled && (
            <div className="mb-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded border border-green-300 text-center">
              📱 Colonne Droite (responsive)
            </div>
          )}

          {/* Element container avec meilleure gestion pour ImageHero */}
          <Element
            id={`${id}-right-column`}
            is="div"
            canvas={true}
            className={enabled ? 'min-h-[100px] border-2 border-dashed border-green-200 rounded-lg p-3' : 'w-full'}
            style={{
              minHeight: enabled ? '100px' : 'auto',
              border: enabled ? '2px dashed #10b981' : 'none',
              borderRadius: enabled ? '8px' : '0',
              padding: enabled ? '12px' : '0',
              backgroundColor: enabled ? 'transparent' : 'transparent',
              width: '100%',
              display: 'block', // Améliore la compatibilité avec ImageHero
            }}
          >
          </Element>
        </div>
      </div>

      {/* Empty state in edit mode when no children */}
      {enabled && (
        <div className="flex flex-col items-center justify-center min-h-[150px] text-center text-gray-400">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </div>
          <p className="font-medium text-gray-600">Section 2 Colonnes</p>
          <p className="text-sm text-gray-500 mt-1">Glissez des blocs dans les colonnes ci-dessus</p>
        </div>
      )}
    </div>
  );
};

// Settings component for the properties panel
export const TwoColumnSectionSettings = () => {
  const {
    actions: { setProp },
    background,
    padding,
    margin,
    gap,
    leftColumnWidth,
    rightColumnWidth,
    verticalAlign,
    sectionWidth,
    horizontalAlign,
    responsiveMode,
    mobileGap,
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    gap: node.data.props.gap,
    leftColumnWidth: node.data.props.leftColumnWidth,
    rightColumnWidth: node.data.props.rightColumnWidth,
    verticalAlign: node.data.props.verticalAlign,
    sectionWidth: node.data.props.sectionWidth,
    horizontalAlign: node.data.props.horizontalAlign,
    responsiveMode: node.data.props.responsiveMode,
    mobileGap: node.data.props.mobileGap,
  }));

  return (
    <div className="space-y-4">
      {/* Section Info */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm font-medium text-purple-900 mb-1">📊 Section 2 Colonnes Responsive</p>
        <p className="text-xs text-purple-700">
          Mise en page adaptative : 2 colonnes sur desktop, 2 lignes sur mobile/tablette.
          Compatible avec tous les blocs, y compris ImageHero.
        </p>
      </div>

      {/* Responsiveness */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">📱 Responsivité</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode responsive
            </label>
            <select
              value={responsiveMode || 'stack-mobile'}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.responsiveMode = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="stack-mobile">📱 Stack sur mobile (recommandé)</option>
              <option value="stack-tablet">📱💻 Stack sur mobile + tablette</option>
              <option value="always-columns">🖥️ Toujours en colonnes</option>
              <option value="always-stack">📋 Toujours en lignes</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Le mode "Stack sur mobile" transforme automatiquement les 2 colonnes en 2 lignes sur smartphone
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espacement mobile (px)
            </label>
            <input
              type="number"
              value={mobileGap || 10}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.mobileGap = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
            <p className="text-xs text-gray-500">
              Espacement entre les éléments quand ils sont empilés sur mobile
            </p>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Mise en page</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espacement entre colonnes (px)
            </label>
            <input
              type="number"
              value={gap}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.gap = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignement vertical
            </label>
            <select
              value={verticalAlign}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.verticalAlign = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="top">En haut</option>
              <option value="center">Au centre</option>
              <option value="bottom">En bas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section Width */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Largeur de la section</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largeur globale de la section
            </label>
            <div className="space-y-2">
              <select
                value={sectionWidth}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.sectionWidth = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="90%">90%</option>
                <option value="80%">80%</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="60%">60%</option>
                <option value="50%">50% (moitié)</option>
                <option value="1200px">1200px (max-width)</option>
                <option value="1024px">1024px (max-width)</option>
                <option value="768px">768px (max-width)</option>
              </select>
              <input
                type="text"
                value={sectionWidth}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.sectionWidth = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="100%, 800px, etc."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Alignment */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Alignement horizontal</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position de la section
            </label>
            <select
              value={horizontalAlign}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.horizontalAlign = e.target.value as 'left' | 'center' | 'right'))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="left">À gauche</option>
              <option value="center">Au centre</option>
              <option value="right">À droite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Column Widths */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Largeur des colonnes</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colonne de gauche
            </label>
            <div className="space-y-2">
              <select
                value={leftColumnWidth}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.leftColumnWidth = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="25%">25%</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="40%">40%</option>
                <option value="50%">50% (moitié)</option>
                <option value="60%">60%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="75%">75%</option>
              </select>
              <input
                type="text"
                value={leftColumnWidth}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.leftColumnWidth = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="50%, 300px, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colonne de droite
            </label>
            <div className="space-y-2">
              <select
                value={rightColumnWidth}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.rightColumnWidth = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="25%">25%</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="40%">40%</option>
                <option value="50%">50% (moitié)</option>
                <option value="60%">60%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="75%">75%</option>
              </select>
              <input
                type="text"
                value={rightColumnWidth}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.rightColumnWidth = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="50%, 300px, etc."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Style */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Style</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur de fond
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.background = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={background}
                onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.background = e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espacement intérieur (px)
            </label>
            <input
              type="number"
              value={padding}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.padding = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marge extérieure (px)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setProp((props: TwoColumnSectionProps) => (props.margin = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min="0"
              max="50"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Instructions d'utilisation</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>✅ Compatible avec ImageHero :</strong> Les images s'affichent parfaitement dans les colonnes</p>
          <p><strong>📱 Responsive :</strong> 2 colonnes sur desktop → 2 lignes sur mobile automatiquement</p>
          <p><strong>🎯 Glisser-déposer :</strong> Glissez des blocs directement dans les colonnes</p>
          <p><strong>🔄 Flexible :</strong> Les blocs peuvent être déplacés entre les colonnes</p>
          <p><strong>⚙️ Personnalisable :</strong> Largeur de chaque colonne configurable</p>
        </div>
        
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <p className="text-blue-800 font-medium">🔧 Dépannage ImageHero :</p>
          <p className="text-blue-700">Si les images ne s'affichent pas, vérifiez que le mode "Préserver l'image complète" est activé dans les paramètres ImageHero.</p>
        </div>
      </div>
    </div>
  );
};

TwoColumnSection.craft = {
  displayName: 'TwoColumnSection',
  props: {
    background: '#ffffff',
    padding: 20,
    margin: 0,
    gap: 20,
    leftColumnWidth: '50%',
    rightColumnWidth: '50%',
    verticalAlign: 'top',
    sectionWidth: '100%',
    horizontalAlign: 'left',
    responsiveMode: 'stack-mobile', // Responsive par défaut
    mobileGap: 10,
  },
  related: {
    settings: TwoColumnSectionSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: (incomingNodes, currentNode) => {
      // Allow any elements to be dropped, especially ImageHero
      return true;
    },
    canMoveOut: () => true,
  },
  custom: {
    isCanvas: true,
  },
};