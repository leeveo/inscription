'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import { useBuilderMode } from '@/contexts/BuilderModeContext';

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
}: SimpleTextProps) => {
  const { isEditing } = useBuilderMode();
  const {
    connectors: { connect, drag },
    selected,
    hovered,
    actions,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
    actions: state.actions,
  }));

  return (
    <div
      ref={isEditing ? (ref) => ref && connect(drag(ref)) : undefined}
      style={{
        border: isEditing && (selected || hovered) ? '2px dashed #3B82F6' : 'none',
        padding: '4px',
        borderRadius: '8px',
        margin: '8px 0',
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
          textAlign,
          textDecoration,
          outline: isEditing && selected ? '2px solid #3B82F6' : 'none',
          cursor: isEditing && selected ? 'text' : 'default',
          minHeight: '24px',
        }}
      >
        {text}
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
  },
  related: {
    settings: SimpleTextSettings,
  },
};