'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import { useBuilderMode } from '@/contexts/BuilderModeContext';

// Interface pour la gestion responsive des largeurs
export interface ResponsiveWidth {
  mobile?: string;   // < 640px (sm breakpoint)
  tablet?: string;   // 640px - 1024px (md breakpoint) 
  desktop?: string;  // > 1024px (lg breakpoint)
}

export interface SimpleTextProps {
  text?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  textDecoration?: string;
  showBorder?: boolean;
  padding?: string;
  // Remplacé par le système responsive
  responsiveWidth?: ResponsiveWidth | string; // Compatibilité avec ancien système
  horizontalAlign?: string;
}

export const SimpleText = ({
  text = 'Texte simple',
  fontSize = 16,
  color = '#111827',
  backgroundColor = '#f3f4f6',
  fontWeight = 'normal',
  fontStyle = 'normal',
  textAlign = 'left',
  textDecoration = 'none',
  showBorder = true,
  padding = '16px',
  responsiveWidth = '100%',
  horizontalAlign = 'left',
}: SimpleTextProps) => {
  const { isEditing } = useBuilderMode();
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const { actions } = useNode();

  // Fonction utilitaire pour générer les classes Tailwind responsives
  const generateResponsiveWidthClasses = (responsiveWidth: ResponsiveWidth | string | undefined): string => {
    // Si c'est une string (compatibilité avec l'ancien système)
    if (typeof responsiveWidth === 'string') {
      return getWidthClass(responsiveWidth);
    }
    
    // Si c'est un objet responsive
    if (responsiveWidth && typeof responsiveWidth === 'object') {
      const classes: string[] = [];
      
      // Largeur mobile (base)
      if (responsiveWidth.mobile) {
        classes.push(getWidthClass(responsiveWidth.mobile));
      }
      
      // Largeur tablette (sm: breakpoint)
      if (responsiveWidth.tablet) {
        classes.push(`sm:${getWidthClass(responsiveWidth.tablet)}`);
      }
      
      // Largeur desktop (lg: breakpoint)  
      if (responsiveWidth.desktop) {
        classes.push(`lg:${getWidthClass(responsiveWidth.desktop)}`);
      }
      
      return classes.join(' ');
    }
    
    // Valeur par défaut
    return 'w-full';
  };

  // Fonction pour convertir les valeurs de largeur en classes Tailwind
  const getWidthClass = (width: string): string => {
    switch (width) {
      case '100%':
        return 'w-full';
      case '75%':
        return 'w-3/4';
      case '66.66%':
        return 'w-2/3';
      case '50%':
        return 'w-1/2';
      case '33.33%':
        return 'w-1/3';
      case '25%':
        return 'w-1/4';
      case 'auto':
        return 'w-auto';
      default:
        // Pour les valeurs personnalisées, on utilise un style inline
        return 'w-full';
    }
  };

  // Générer les classes responsives
  const widthClasses = generateResponsiveWidthClasses(responsiveWidth);
  
  // Fonction pour obtenir les styles d'alignement avec flexbox
  const getHorizontalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return { 
          display: 'flex' as const,
          justifyContent: 'center' as const,
          width: '100%'
        };
      case 'right':
        return { 
          display: 'flex' as const,
          justifyContent: 'flex-end' as const,
          width: '100%'
        };
      case 'left':
      default:
        return { 
          display: 'flex' as const,
          justifyContent: 'flex-start' as const,
          width: '100%'
        };
    }
  };

  const containerAlignStyle = getHorizontalAlignStyle(horizontalAlign);
  
  // Debug log pour vérifier les valeurs
  console.log('SimpleText - responsive width:', responsiveWidth, 'classes:', widthClasses, 'horizontalAlign:', horizontalAlign, 'containerAlign:', containerAlignStyle);

  return (
    <div className="w-full my-2" style={containerAlignStyle}>
      <div
        ref={isEditing ? (ref) => { if (ref) connect(drag(ref)); } : undefined}
        className={`${widthClasses} min-w-12`}
        style={{
          border: isEditing && (selected || hovered) ? '2px dashed #3B82F6' : 'none',
          padding: '4px',
          borderRadius: '8px',
          minWidth: '50px',
        }}
      >
      {/* Selection Indicator */}
      {isEditing && (selected || hovered) && (
        <div
          style={{
            position: 'absolute',
            top: '-24px',
            left: '0',
            padding: '2px 8px',
            backgroundColor: '#3B82F6',
            color: 'white',
            fontSize: '10px',
            borderRadius: '4px 4px 0 0',
            zIndex: 50,
          }}
        >
          Texte {selected && '• Sélectionné'}
        </div>
      )}

      <div
        contentEditable={isEditing && selected}
        suppressContentEditableWarning={true}
        onInput={(e) => {
          // Update the text prop when edited
          actions.setProp((props: SimpleTextProps) => {
            props.text = e.currentTarget.textContent || 'Texte simple';
          });
        }}
        style={{
          padding,
          backgroundColor,
          border: showBorder ? '2px solid #d1d5db' : 'none',
          borderRadius: '8px',
          fontSize: `${fontSize}px`,
          color,
          fontWeight,
          fontStyle,
          textAlign: textAlign as any,
          textDecoration,
          outline: isEditing && selected ? '2px solid #3B82F6' : 'none',
          cursor: isEditing && selected ? 'text' : 'default',
          minHeight: '24px',
          boxSizing: 'border-box',
        }}
      >
        {text}
      </div>
      </div>
    </div>
  );
};

// Settings component
export const SimpleTextSettings = () => {
  const {
    actions: { setProp },
    text,
    fontSize,
    color,
    backgroundColor,
    fontWeight,
    fontStyle,
    textAlign,
    textDecoration,
    showBorder,
    padding,
    responsiveWidth,
    horizontalAlign,
  } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    backgroundColor: node.data.props.backgroundColor,
    fontWeight: node.data.props.fontWeight,
    fontStyle: node.data.props.fontStyle,
    textAlign: node.data.props.textAlign,
    textDecoration: node.data.props.textDecoration,
    showBorder: node.data.props.showBorder,
    padding: node.data.props.padding,
    responsiveWidth: node.data.props.responsiveWidth,
    horizontalAlign: node.data.props.horizontalAlign,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte
        </label>
        <textarea
          value={text || ''}
          onChange={(e) => setProp((props: SimpleTextProps) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taille de police (px)
        </label>
        <input
          type="number"
          value={fontSize || 16}
          onChange={(e) => setProp((props: SimpleTextProps) => (props.fontSize = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur du texte
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color || '#111827'}
            onChange={(e) => setProp((props: SimpleTextProps) => (props.color = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={color || '#111827'}
            onChange={(e) => setProp((props: SimpleTextProps) => (props.color = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor || '#f3f4f6'}
            onChange={(e) => setProp((props: SimpleTextProps) => (props.backgroundColor = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={backgroundColor || '#f3f4f6'}
            onChange={(e) => setProp((props: SimpleTextProps) => (props.backgroundColor = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largeur responsive du bloc
        </label>
        
        {/* Presets responsives */}
        <div className="space-y-3 mb-4">
          <div className="text-xs font-medium text-gray-600 mb-2">Presets adaptatifs :</div>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setProp((props: SimpleTextProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '100%', 
                  desktop: '100%'
                };
              })}
              className="px-3 py-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              📱 Pleine largeur sur tous écrans
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 100% • Desktop: 100%</div>
            </button>
            
            <button
              onClick={() => setProp((props: SimpleTextProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '75%',
                  desktop: '66.66%'
                };
              })}
              className="px-3 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              📱💻 Adaptatif recommandé
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 75% • Desktop: 2/3</div>
            </button>
            
            <button
              onClick={() => setProp((props: SimpleTextProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '66.66%',
                  desktop: '50%'
                };
                props.horizontalAlign = 'center'; // 🎯 Ajout de l'alignement center
              })}
              className="px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              🎯 Centré progressif
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 2/3 • Desktop: 50% (centré)</div>
            </button>
            
            <button
              onClick={() => setProp((props: SimpleTextProps) => {
                props.responsiveWidth = {
                  mobile: '100%',
                  tablet: '50%',
                  desktop: '33.33%'
                };
              })}
              className="px-3 py-2 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
            >
              📝 Colonne étroite
              <div className="text-xs text-gray-500 mt-1">Mobile: 100% • Tablette: 50% • Desktop: 1/3</div>
            </button>
          </div>
        </div>

        {/* Configuration manuelle */}
        <div className="border-t pt-3">
          <div className="text-xs font-medium text-gray-600 mb-3">Configuration manuelle :</div>
          
          <div className="space-y-3">
            {/* Mobile */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                📱 Mobile (&lt; 640px)
              </label>
              <select
                value={typeof responsiveWidth === 'object' ? responsiveWidth?.mobile || '100%' : responsiveWidth || '100%'}
                onChange={(e) => {
                  const currentWidth = typeof responsiveWidth === 'object' ? responsiveWidth : { mobile: responsiveWidth || '100%' };
                  setProp((props: SimpleTextProps) => {
                    props.responsiveWidth = {
                      ...currentWidth,
                      mobile: e.target.value
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
                <option value="auto">Auto (contenu)</option>
              </select>
            </div>
            
            {/* Tablette */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                📟 Tablette (640px - 1024px)
              </label>
              <select
                value={typeof responsiveWidth === 'object' ? responsiveWidth?.tablet || '100%' : '100%'}
                onChange={(e) => {
                  const currentWidth = typeof responsiveWidth === 'object' ? responsiveWidth : { mobile: responsiveWidth || '100%' };
                  setProp((props: SimpleTextProps) => {
                    props.responsiveWidth = {
                      mobile: currentWidth.mobile || responsiveWidth || '100%',
                      ...currentWidth,
                      tablet: e.target.value
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
                <option value="auto">Auto (contenu)</option>
              </select>
            </div>
            
            {/* Desktop */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                💻 Desktop (&gt; 1024px)
              </label>
              <select
                value={typeof responsiveWidth === 'object' ? responsiveWidth?.desktop || '100%' : '100%'}
                onChange={(e) => {
                  const currentWidth = typeof responsiveWidth === 'object' ? responsiveWidth : { mobile: responsiveWidth || '100%' };
                  setProp((props: SimpleTextProps) => {
                    props.responsiveWidth = {
                      mobile: currentWidth.mobile || responsiveWidth || '100%',
                      tablet: currentWidth.tablet,
                      ...currentWidth,
                      desktop: e.target.value
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
                <option value="auto">Auto (contenu)</option>
              </select>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            💡 Les largeurs s'adaptent automatiquement selon la taille d'écran pour une expérience optimale
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignement horizontal du bloc
        </label>
        <div className="space-y-2">
          <select
            value={horizontalAlign || 'left'}
            onChange={(e) => setProp((props: SimpleTextProps) => (props.horizontalAlign = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setProp((props: SimpleTextProps) => (props.horizontalAlign = 'left'))}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                horizontalAlign === 'left'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block">⬅️</span>
              Gauche
            </button>
            <button
              onClick={() => setProp((props: SimpleTextProps) => (props.horizontalAlign = 'center'))}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                horizontalAlign === 'center'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block">↔️</span>
              Centre
            </button>
            <button
              onClick={() => setProp((props: SimpleTextProps) => (props.horizontalAlign = 'right'))}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                horizontalAlign === 'right'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="block">➡️</span>
              Droite
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Permet de centrer le bloc entier sur la page (différent de l'alignement du texte à l'intérieur)
          </p>
        </div>
      </div>

      {/* Style du texte */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Style du texte</h4>

        <div className="space-y-3">
          {/* Gras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Graisse de la police
            </label>
            <select
              value={fontWeight || 'normal'}
              onChange={(e) => setProp((props: SimpleTextProps) => (props.fontWeight = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Gras</option>
              <option value="lighter">Plus fin</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
              <option value="900">900</option>
            </select>
          </div>

          {/* Italique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <select
              value={fontStyle || 'normal'}
              onChange={(e) => setProp((props: SimpleTextProps) => (props.fontStyle = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="normal">Normal</option>
              <option value="italic">Italique</option>
              <option value="oblique">Oblique</option>
            </select>
          </div>

          {/* Décoration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Décoration
            </label>
            <select
              value={textDecoration || 'none'}
              onChange={(e) => setProp((props: SimpleTextProps) => (props.textDecoration = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="none">Aucune</option>
              <option value="underline">Souligné</option>
              <option value="overline">Ligne au-dessus</option>
              <option value="line-through">Barré</option>
            </select>
          </div>

          {/* Alignement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignement
            </label>
            <select
              value={textAlign || 'left'}
              onChange={(e) => setProp((props: SimpleTextProps) => (props.textAlign = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="left">Gauche</option>
              <option value="center">Centre</option>
              <option value="right">Droite</option>
              <option value="justify">Justifié</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Apparence</h4>

        <div className="space-y-3">
          {/* Bordure */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBorder !== false}
              onChange={(e) => setProp((props: SimpleTextProps) => (props.showBorder = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher la bordure</span>
          </label>

          {/* Padding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marge intérieure (padding)
            </label>
            <input
              type="text"
              value={padding || '16px'}
              onChange={(e) => setProp((props: SimpleTextProps) => (props.padding = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="16px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

SimpleText.craft = {
  displayName: 'SimpleText',
  props: {
    text: 'Texte simple',
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f3f4f6',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    textDecoration: 'none',
    showBorder: true,
    padding: '16px',
    responsiveWidth: {
      mobile: '100%',
      tablet: '100%',
      desktop: '100%'
    },
    horizontalAlign: 'left',
  },
  related: {
    settings: SimpleTextSettings,
  },
};