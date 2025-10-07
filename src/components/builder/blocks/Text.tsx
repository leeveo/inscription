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
}

export const TextBlock = ({
  text = 'Cliquez pour éditer',
  fontSize = 16,
  fontWeight = '400',
  color = '#000000',
  textAlign = 'left',
  margin = 0,
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

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="relative my-2"
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

      <p
        contentEditable={enabled}
        suppressContentEditableWarning={true}
        onInput={(e) => {
          setProp((props: TextProps) => (props.text = e.currentTarget.textContent || ''));
        }}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          color,
          textAlign,
          outline: 'none',
          cursor: enabled ? 'text' : 'default',
          minHeight: '24px',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: enabled ? '#FFFFFF' : 'transparent',
          border: enabled ? '1px solid #E5E7EB' : 'none',
        }}
      >
        {text}
      </p>
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
  } = useNode((node) => ({
    text: node.data.props.text,
    fontSize: node.data.props.fontSize,
    fontWeight: node.data.props.fontWeight,
    color: node.data.props.color,
    textAlign: node.data.props.textAlign,
    margin: node.data.props.margin,
  }));

  return (
    <div className="space-y-4">
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
