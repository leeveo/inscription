'use client'

import React from 'react';
import { useEventData } from '@/contexts/EventDataContext';
import { Session, SessionProps } from './Session';

// Wrapper du composant Session qui utilise le contexte EventData
// À utiliser seulement dans BuilderRenderer où le contexte est disponible
export const SessionWithEventData = (props: SessionProps) => {
  const { eventData } = useEventData();
  
  return <Session {...props} eventData={eventData} />;
};

// Export de la version craft pour le rendu dans le contexte EventData
SessionWithEventData.craft = Session.craft;