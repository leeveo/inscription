'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

// Import original Session component
import { Session as OriginalSession, SessionProps, SessionSettings } from './Session';

export const SessionWrapper = (props: SessionProps) => {
  // Vérifier si nous sommes dans un contexte Craft.js valide
  const [isInCraftContext, setIsInCraftContext] = React.useState(false);
  
  React.useEffect(() => {
    try {
      // Test simple pour voir si le contexte Craft.js est disponible
      setIsInCraftContext(true);
    } catch (error) {
      console.warn('SessionWrapper: Not in Craft context:', error);
      setIsInCraftContext(false);
    }
  }, []);

  // Si pas dans un contexte Craft.js valide, rendre une version statique
  if (!isInCraftContext) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Sessions</h3>
        <p className="text-gray-600 text-sm">Chargement des sessions...</p>
      </div>
    );
  }

  // Sinon, utiliser le composant original
  try {
    return <OriginalSession {...props} />;
  } catch (error) {
    console.error('SessionWrapper error:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-2">Erreur Session</h3>
        <p className="text-red-600 text-sm">Impossible de charger le composant Session</p>
      </div>
    );
  }
};

SessionWrapper.craft = {
  displayName: 'Sessions',
  props: {
    layout: 'cards',
    showDate: true,
    showTime: true,
    showLocation: true,
    showSpeakers: true,
    showDescription: true,
    maxSessions: 4,
    background: '#ffffff',
    padding: 24,
    margin: 0,
  },
  related: {
    settings: SessionSettings,
  },
};

export { SessionWrapper as Session };