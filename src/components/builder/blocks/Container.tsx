'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

export interface ContainerProps {
  background?: string;
  padding?: number;
  margin?: number;
  children?: React.ReactNode;
  className?: string;
}

export const Container = ({
  background = '#ffffff',
  padding = 20,
  margin = 0,
  children,
  className = '',
}: ContainerProps) => {
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

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`relative ${className}`}
      style={{
        background,
        padding: `${padding}px`,
        margin: `${margin}px`,
        minHeight: enabled ? '100px' : 'auto',
        border: enabled 
          ? (selected || hovered ? '2px solid #3B82F6' : '2px dashed #e5e7eb')
          : 'none',
        transition: 'border 0.2s ease',
      }}
    >
      {/* Selection Indicator - Only in edit mode */}
      {enabled && (selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t">
          Conteneur {selected && '• Sélectionné'}
        </div>
      )}

      {/* Empty state - Only in edit mode */}
      {enabled && !children && (
        <div className="flex items-center justify-center h-full min-h-[100px] text-center">
          <div className="text-gray-400 text-sm">
            <div className="mb-2">
              <svg
                className="w-12 h-12 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p>Glissez des blocs ici</p>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

// Settings component for the properties panel
export const ContainerSettings = () => {
  const {
    actions: { setProp },
    background,
    padding,
    margin,
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background}
            onChange={(e) => setProp((props: ContainerProps) => (props.background = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={background}
            onChange={(e) => setProp((props: ContainerProps) => (props.background = e.target.value))}
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
          onChange={(e) => setProp((props: ContainerProps) => (props.padding = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marge extérieure (px)
        </label>
        <input
          type="number"
          value={margin}
          onChange={(e) => setProp((props: ContainerProps) => (props.margin = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    background: '#ffffff',
    padding: 20,
    margin: 0,
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true,
  },
  custom: {
    isCanvas: true,
  },
};
