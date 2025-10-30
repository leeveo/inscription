'use client'

import React, { createContext, useContext } from 'react';

interface EventDataContextType {
  eventData?: any;
  eventId?: string | null;
}

const EventDataContext = createContext<EventDataContextType>({});

export function EventDataProvider({
  children,
  eventData,
  eventId,
}: {
  children: React.ReactNode;
  eventData?: any;
  eventId?: string | null;
}) {
  return (
    <EventDataContext.Provider value={{ eventData, eventId }}>
      {children}
    </EventDataContext.Provider>
  );
}

export function useEventData() {
  return useContext(EventDataContext);
}
