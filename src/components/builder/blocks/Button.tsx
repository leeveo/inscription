'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ButtonProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: number;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
}

export const ButtonBlock = ({
  text = 'Cliquez ici',
  backgroundColor = '#3B82F6',
  textColor = '#ffffff',
  padding = '12px 24px',
  borderRadius = 8,
  href = '#',
  size = 'md',
  variant = 'solid',
}: ButtonProps) => {
  console.log('🔘 ButtonBlock rendered with text:', text);
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const sizeStyles = {
    sm: { fontSize: '14px', padding: '8px 16px' },
    md: { fontSize: '16px', padding: '12px 24px' },
    lg: { fontSize: '18px', padding: '16px 32px' },
  };

  const variantStyles = {
    solid: {
      background: backgroundColor,
      color: textColor,
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: backgroundColor,
      border: `2px solid ${backgroundColor}`,
    },
    ghost: {
      background: 'transparent',
      color: backgroundColor,
      border: 'none',
    },
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="relative inline-block my-2"
      style={{
        border: enabled
          ? (selected || hovered ? '2px dashed #3B82F6' : '2px dashed transparent')
          : 'none',
        padding: enabled ? '6px' : '0',
        borderRadius: '8px',
        backgroundColor: enabled ? (selected || hovered ? '#EFF6FF' : 'transparent') : 'transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t text-[10px] whitespace-nowrap z-50">
          Bouton {selected && '• Sélectionné'}
        </div>
      )}

      <button
        style={{
          ...variantStyles[variant],
          ...sizeStyles[size],
          borderRadius: `${borderRadius}px`,
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          if (variant === 'solid') {
            e.currentTarget.style.opacity = '0.9';
          } else {
            e.currentTarget.style.background = backgroundColor;
            e.currentTarget.style.color = textColor;
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'solid') {
            e.currentTarget.style.opacity = '1';
          } else {
            Object.assign(e.currentTarget.style, variantStyles[variant]);
          }
        }}
      >
        {text}
      </button>
    </div>
  );
};

// Settings component
export const ButtonSettings = () => {
  const {
    actions: { setProp },
    text,
    backgroundColor,
    textColor,
    borderRadius,
    href,
    size,
    variant,
  } = useNode((node) => ({
    text: node.data.props.text,
    backgroundColor: node.data.props.backgroundColor,
    textColor: node.data.props.textColor,
    borderRadius: node.data.props.borderRadius,
    href: node.data.props.href,
    size: node.data.props.size,
    variant: node.data.props.variant,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setProp((props: ButtonProps) => (props.text = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lien
        </label>
        <input
          type="text"
          value={href}
          onChange={(e) => setProp((props: ButtonProps) => (props.href = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variant
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['solid', 'outline', 'ghost'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setProp((props: ButtonProps) => (props.variant = v))}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                variant === v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {v === 'solid' && 'Plein'}
              {v === 'outline' && 'Contour'}
              {v === 'ghost' && 'Fantôme'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taille
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setProp((props: ButtonProps) => (props.size = s))}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                size === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setProp((props: ButtonProps) => (props.backgroundColor = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setProp((props: ButtonProps) => (props.backgroundColor = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="#3B82F6"
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
            value={textColor}
            onChange={(e) => setProp((props: ButtonProps) => (props.textColor = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setProp((props: ButtonProps) => (props.textColor = e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Arrondi (px)
        </label>
        <input
          type="number"
          value={borderRadius}
          onChange={(e) => setProp((props: ButtonProps) => (props.borderRadius = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
};

ButtonBlock.craft = {
  displayName: 'ButtonBlock',
  props: {
    text: 'Cliquez ici',
    backgroundColor: '#3B82F6',
    textColor: '#ffffff',
    padding: '12px 24px',
    borderRadius: 8,
    href: '#',
    size: 'md',
    variant: 'solid',
  },
  related: {
    settings: ButtonSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false,
    canMoveIn: () => false,
    canMoveOut: () => false,
  },
};
