'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import { useBuilderMode } from '@/contexts/BuilderModeContext';

export interface SimpleButtonProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  borderRadius?: number;
  padding?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  showBorder?: boolean;
  hoverColor?: string;
  border?: string;
  width?: string;
  horizontalAlign?: string;
}

export const SimpleButton = ({
  text = 'Bouton simple',
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
  fontSize = 16,
  borderRadius = 6,
  padding = '12px 24px',
  fontWeight = '500',
  fontStyle = 'normal',
  textDecoration = 'none',
  showBorder = false,
  hoverColor = '#2563eb',
  border = 'none',
  width = 'auto',
  horizontalAlign = 'left',
}: SimpleButtonProps) => {
  const { isEditing } = useBuilderMode();
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  // Fonction pour obtenir le style d'alignement horizontal
  const getHorizontalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return { marginLeft: 'auto', marginRight: 'auto', display: 'block' };
      case 'right':
        return { marginLeft: 'auto', marginRight: '0', display: 'block' };
      case 'left':
      default:
        return { marginLeft: '0', marginRight: '0', display: 'inline-block' };
    }
  };

  const alignStyle = getHorizontalAlignStyle(horizontalAlign);

  return (
    <div
      ref={isEditing ? (ref) => ref && connect(drag(ref)) : undefined}
      style={{
        border: isEditing && (selected || hovered) ? '2px dashed #3B82F6' : 'none',
        padding: '4px',
        borderRadius: '8px',
        margin: '8px 0',
        width,
        minWidth: width === 'auto' ? 'auto' : '80px',
        ...alignStyle,
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
          Bouton {selected && '• Sélectionné'}
        </div>
      )}

      <button
        style={{
          padding,
          backgroundColor,
          color: textColor,
          border: showBorder ? border : 'none',
          borderRadius: `${borderRadius}px`,
          fontSize: `${fontSize}px`,
          cursor: 'pointer',
          fontWeight,
          fontStyle,
          textDecoration,
          transition: 'all 0.2s ease',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hoverColor;
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = backgroundColor;
          e.currentTarget.style.opacity = '1';
        }}
      >
        {text}
      </button>
    </div>
  );
};

// Settings component
export const SimpleButtonSettings = () => {
  const {
    actions: { setProp },
    text,
    backgroundColor,
    textColor,
    fontSize,
    borderRadius,
    padding,
    fontWeight,
    fontStyle,
    textDecoration,
    showBorder,
    hoverColor,
    border,
    width,
    horizontalAlign,
  } = useNode((node) => ({
    text: node.data.props.text,
    backgroundColor: node.data.props.backgroundColor,
    textColor: node.data.props.textColor,
    fontSize: node.data.props.fontSize,
    borderRadius: node.data.props.borderRadius,
    padding: node.data.props.padding,
    fontWeight: node.data.props.fontWeight,
    fontStyle: node.data.props.fontStyle,
    textDecoration: node.data.props.textDecoration,
    showBorder: node.data.props.showBorder,
    hoverColor: node.data.props.hoverColor,
    border: node.data.props.border,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={text || ''}
          onChange={(e) => setProp((props: SimpleButtonProps) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taille de police (px)
        </label>
        <input
          type="number"
          value={fontSize || 16}
          onChange={(e) => setProp((props: SimpleButtonProps) => (props.fontSize = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largeur du bouton
        </label>
        <div className="space-y-2">
          <select
            value={width || 'auto'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.width = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="auto">Auto (contenu)</option>
            <option value="100%">100% (pleine largeur)</option>
            <option value="75%">75%</option>
            <option value="66.66%">66.66% (2/3)</option>
            <option value="50%">50% (moitié)</option>
            <option value="33.33%">33.33% (1/3)</option>
            <option value="25%">25%</option>
          </select>
          <input
            type="text"
            value={width || 'auto'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.width = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="auto, 100%, 200px, etc."
          />
          <p className="text-xs text-gray-500">
            Auto = s'adapte au texte | Utilisez % ou px pour une largeur fixe
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignement horizontal du bouton
        </label>
        <div className="space-y-2">
          <select
            value={horizontalAlign || 'left'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.horizontalAlign = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setProp((props: SimpleButtonProps) => (props.horizontalAlign = 'left'))}
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
              onClick={() => setProp((props: SimpleButtonProps) => (props.horizontalAlign = 'center'))}
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
              onClick={() => setProp((props: SimpleButtonProps) => (props.horizontalAlign = 'right'))}
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
            Permet de centrer le bouton sur la page
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor || '#3b82f6'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.backgroundColor = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={backgroundColor || '#3b82f6'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.backgroundColor = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur du texte
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textColor || '#ffffff'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.textColor = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={textColor || '#ffffff'}
            onChange={(e) => setProp((props: SimpleButtonProps) => (props.textColor = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Arrondi (px)
        </label>
        <input
          type="number"
          value={borderRadius || 6}
          onChange={(e) => setProp((props: SimpleButtonProps) => (props.borderRadius = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Padding
        </label>
        <input
          type="text"
          value={padding || '12px 24px'}
          onChange={(e) => setProp((props: SimpleButtonProps) => (props.padding = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="12px 24px"
        />
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
              value={fontWeight || '500'}
              onChange={(e) => setProp((props: SimpleButtonProps) => (props.fontWeight = e.target.value))}
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
              onChange={(e) => setProp((props: SimpleButtonProps) => (props.fontStyle = e.target.value))}
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
              onChange={(e) => setProp((props: SimpleButtonProps) => (props.textDecoration = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="none">Aucune</option>
              <option value="underline">Souligné</option>
              <option value="overline">Ligne au-dessus</option>
              <option value="line-through">Barré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Apparence</h4>

        <div className="space-y-3">
          {/* Bordure */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={showBorder || false}
                onChange={(e) => setProp((props: SimpleButtonProps) => (props.showBorder = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Afficher la bordure</span>
            </label>

            {showBorder && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style de bordure
                </label>
                <input
                  type="text"
                  value={border || '2px solid #3b82f6'}
                  onChange={(e) => setProp((props: SimpleButtonProps) => (props.border = e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="2px solid #3b82f6"
                />
              </div>
            )}
          </div>

          {/* Couleur au survol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur au survol
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hoverColor || '#2563eb'}
                onChange={(e) => setProp((props: SimpleButtonProps) => (props.hoverColor = e.target.value))}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={hoverColor || '#2563eb'}
                onChange={(e) => setProp((props: SimpleButtonProps) => (props.hoverColor = e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SimpleButton.craft = {
  displayName: 'SimpleButton',
  props: {
    text: 'Bouton simple',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    fontSize: 16,
    borderRadius: 6,
    padding: '12px 24px',
    fontWeight: '500',
    fontStyle: 'normal',
    textDecoration: 'none',
    showBorder: false,
    hoverColor: '#2563eb',
    border: 'none',
    width: 'auto',
    horizontalAlign: 'left',
  },
  related: {
    settings: SimpleButtonSettings,
  },
};