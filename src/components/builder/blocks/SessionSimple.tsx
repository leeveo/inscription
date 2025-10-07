'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export interface SessionSimpleProps {
  layout?: 'cards' | 'list' | 'grid';
  background?: string;
  padding?: number;
  margin?: number;
  className?: string;
}

export const SessionSimple = ({
  layout = 'cards',
  background = '#ffffff',
  padding = 24,
  margin = 0,
  className = '',
}: SessionSimpleProps) => {
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

  // Mock session simple
  const session = {
    title: 'Keynote d\'ouverture',
    time: '09:00 - 10:30',
    location: 'Amphithéâtre A',
    speaker: 'Dr. Marie Dupont'
  };

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
        minHeight: enabled ? '120px' : 'auto',
        border: enabled 
          ? (selected || hovered ? '2px solid #3B82F6' : '2px dashed #e5e7eb')
          : 'none',
      }}
    >
      {/* Selection Indicator */}
      {enabled && (selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t">
          Session {selected && '• Sélectionné'}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{session.title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {session.time}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {session.location}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            {session.speaker}
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings component
export const SessionSimpleSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mise en page
        </label>
        <select
          value={props.layout || 'cards'}
          onChange={(e) => setProp((props: SessionSimpleProps) => (props.layout = e.target.value as any))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="cards">Cartes</option>
          <option value="list">Liste</option>
          <option value="grid">Grille</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <input
          type="color"
          value={props.background || '#ffffff'}
          onChange={(e) => setProp((props: SessionSimpleProps) => (props.background = e.target.value))}
          className="w-full h-10 rounded border"
        />
      </div>
    </div>
  );
};

SessionSimple.craft = {
  displayName: 'Session Simple',
  props: {
    layout: 'cards',
    background: '#ffffff',
    padding: 24,
    margin: 0,
  },
  related: {
    settings: SessionSimpleSettings,
  },
};