'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
// import ContentEditable from 'react-contenteditable';

export interface TextProps {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  margin?: number;
  width?: string;
  horizontalAlign?: 'left' | 'center' | 'right';
}

export const TextBlock = ({
  text = 'Cliquez pour éditer',
  fontSize = 16,
  fontWeight = '400',
  color = '#000000',
  textAlign = 'left',
  margin = 0,
  width = '100%',
  horizontalAlign = 'left',
}: TextProps) => {
  console.log('🎨 TextBlock rendered with text:', text);
  const {
    connectors: { connect, drag },
    selected,
    hovered,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // 🎯 RESPONSIVE SIMPLE - FORCE 100% sur mobile avec max-width
  const getWidthClasses = (width: string) => {
    // Utilise max-width responsive pour forcer 100% sur petits écrans
    switch (width) {
      case '100%':
        return 'w-full';
      case '75%':
        return 'w-full max-w-full lg:max-w-[75%]';
      case '66%':
        return 'w-full max-w-full lg:max-w-[66.666667%]';
      case '50%':
        return 'w-full max-w-full lg:max-w-[50%]';
      case '33%':
        return 'w-full max-w-full lg:max-w-[33.333333%]';
      case '25%':
        return 'w-full max-w-full lg:max-w-[25%]';
      default:
        return 'w-full';
    }
  };

  const getHorizontalAlignClasses = (align: string) => {
    switch (align) {
      case 'center':
        return 'mx-auto';
      case 'right':
        return 'ml-auto mr-0';
      case 'left':
      default:
        return 'ml-0 mr-0';
    }
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`relative my-2 ${getWidthClasses(width)} ${getHorizontalAlignClasses(horizontalAlign)}`}
      style={{
        margin: `${margin}px`,
        border: enabled
          ? (selected || hovered ? '2px dashed #3B82F6' : '2px dashed transparent')
          : 'none',
        padding: enabled ? '6px' : '4px',
        borderRadius: '8px',
        backgroundColor: enabled ? (selected || hovered ? '#EFF6FF' : 'transparent') : 'transparent',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t text-[10px] z-50">
          Texte {selected && '• Sélectionné'}
        </div>
      )}

      {/* 🔥 AFFICHAGE CANVAS : Toujours en mode preview avec retours à la ligne */}
      <div
        onClick={() => {
          // Permet de cliquer pour sélectionner le bloc
          if (enabled) {
            console.log('Texte sélectionné pour édition dans le panneau');
          }
        }}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          color,
          textAlign,
          minHeight: '24px',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: enabled ? '#FFFFFF' : 'transparent',
          border: enabled ? '1px solid #E5E7EB' : 'none',
          cursor: enabled ? 'pointer' : 'default',
          // 🔥 CSS ESSENTIEL pour retours à la ligne
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          lineHeight: '1.5',
        }}
      >
        {text || 'Cliquez pour éditer'}
      </div>
    </div>
  );
};

// Settings component
export const TextSettings = () => {
  const {
    actions: { setProp },
    text,
    fontSize,
    fontWeight,
    color,
    textAlign,
    margin,
    width,
    horizontalAlign,
  } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    fontWeight: node.data.props.fontWeight,
    color: node.data.props.color,
    textAlign: node.data.props.textAlign,
    margin: node.data.props.margin,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
  }));

  return (
    <div className="space-y-4">
      {/* 🔥 CHAMP TEXTE MANQUANT - AJOUTÉ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenu du texte
        </label>
        <textarea
          value={text || ''}
          onChange={(e) => setProp((props: TextProps) => (props.text = e.target.value))}
          placeholder="Tapez votre texte ici..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-vertical"
          style={{ 
            fontFamily: 'inherit',
            lineHeight: '1.5' 
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Appuyez sur Entrée pour créer des retours à la ligne
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taille de police (px)
        </label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setProp((props: TextProps) => (props.fontSize = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Graisse
        </label>
        <select
          value={fontWeight}
          onChange={(e) => setProp((props: TextProps) => (props.fontWeight = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="300">Light</option>
          <option value="400">Normal</option>
          <option value="500">Medium</option>
          <option value="600">Semi-Bold</option>
          <option value="700">Bold</option>
          <option value="800">Extra-Bold</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setProp((props: TextProps) => (props.color = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setProp((props: TextProps) => (props.color = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignement
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => setProp((props: TextProps) => (props.textAlign = align))}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                textAlign === align
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {align === 'left' && 'Gauche'}
              {align === 'center' && 'Centre'}
              {align === 'right' && 'Droite'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marge (px)
        </label>
        <input
          type="number"
          value={margin}
          onChange={(e) => setProp((props: TextProps) => (props.margin = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium text-gray-900 mb-3">📱 Responsive</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Largeur responsive
          </label>
          <select
            value={width}
            onChange={(e) => setProp((props: TextProps) => (props.width = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="100%">100% (Pleine largeur)</option>
            <option value="75%">75% (Large sur desktop)</option>
            <option value="66%">66% (2/3 sur desktop)</option>
            <option value="50%">50% (Moitié sur desktop)</option>
            <option value="33%">33% (1/3 sur desktop)</option>
            <option value="25%">25% (Quart sur desktop)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Sur mobile/tablette, toujours 100% de largeur
          </p>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alignement horizontal
          </label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => setProp((props: TextProps) => (props.horizontalAlign = align))}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  horizontalAlign === align
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {align === 'left' && '← Gauche'}
                {align === 'center' && '↔ Centre'}
                {align === 'right' && 'Droite →'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

TextBlock.craft = {
  displayName: 'TextBlock',
  props: {
    text: 'Cliquez pour éditer',
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'left',
    margin: 0,
    width: '100%',
    horizontalAlign: 'left',
  },
  related: {
    settings: TextSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false,
    canMoveIn: () => false,
    canMoveOut: () => false,
  },
};
