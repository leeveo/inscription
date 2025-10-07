'use client'

import React, { createContext, useContext } from 'react'

interface BuilderModeContextType {
  mode: 'editor' | 'preview' | 'public'
  isEditing: boolean
}

const BuilderModeContext = createContext<BuilderModeContextType | undefined>(undefined)

export function BuilderModeProvider({
  children,
  mode = 'public'
}: {
  children: React.ReactNode
  mode?: 'editor' | 'preview' | 'public'
}) {
  const isEditing = mode === 'editor'

  return (
    <BuilderModeContext.Provider value={{ mode, isEditing }}>
      {children}
    </BuilderModeContext.Provider>
  )
}

export function useBuilderMode() {
  const context = useContext(BuilderModeContext)
  if (context === undefined) {
    throw new Error('useBuilderMode must be used within a BuilderModeProvider')
  }
  return context
}