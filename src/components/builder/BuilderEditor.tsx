'use client'

import React, { useState, useEffect } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import type { BuilderPage } from '@/types/builder';
import { useBuilder } from '@/contexts/BuilderContext';
import { BuilderModeProvider } from '@/contexts/BuilderModeContext';

// Components
import BuilderToolbar from './BuilderToolbar';
import BuilderSidebar from './BuilderSidebar';
import BuilderPropertiesPanel from './BuilderPropertiesPanel';
import BuilderCanvas from './BuilderCanvas';

// Basic Blocks
import { Container } from './blocks/Container';
import { TextBlock } from './blocks/Text';
import { ButtonBlock } from './blocks/Button';
import { SimpleText } from './blocks/SimpleText';
import { SimpleButton } from './blocks/SimpleButton';

// Event Blocks (Phase 2)
import { Hero } from './blocks/Hero';
import { Countdown } from './blocks/Countdown';
import { Agenda } from './blocks/Agenda';
import { Speakers } from './blocks/Speakers';
import { Map } from './blocks/Map';
import { FAQ } from './blocks/FAQ';
import { Gallery } from './blocks/Gallery';
import { ImageHero } from './blocks/ImageHero';
import { Footer } from './blocks/Footer';
import { EventDetails } from './blocks/EventDetails';

// Form Blocks
import { RegistrationForm } from './blocks/RegistrationForm';
import { DesignForm } from './blocks/DesignForm';
import { CreativeForm } from './blocks/CreativeForm';
import { CorporateForm } from './blocks/CorporateForm';
import { TechForm } from './blocks/TechForm';

// Session Blocks
import { Session } from './blocks/Session';
import { TwoColumnSection } from './blocks/TwoColumnSection';
import { ParticipantInfo } from './blocks/ParticipantInfo';
import { FormulaireDynamique } from './blocks/FormulaireDynamique';

// Payment Block
import { PaymentWidget } from './blocks/PaymentWidget';

interface BuilderEditorProps {
  initialPage: BuilderPage;
}

// Component to debug Craft.js events
function EditorDebugger() {
  const { query, actions, enabled } = useEditor((state, query) => ({
    enabled: state.options.enabled,
  }));

  useEffect(() => {
    console.log('🛠️ Editor Debugger - Enabled:', enabled);
    console.log('🛠️ Editor Debugger - Query available:', !!query);
    console.log('🛠️ Editor Debugger - Actions available:', !!actions);

    // Log all nodes when they change
    const interval = setInterval(() => {
      try {
        const nodes = query.getNodes();
        const nodeIds = Object.keys(nodes);
        console.log('📊 Current nodes:', nodeIds.length, nodeIds);

        if (nodeIds.length > 1) { // More than just ROOT
          nodeIds.forEach(id => {
            try {
              const node = nodes[id]; // Access directly from nodes object
              if (node && node.data && node.data.displayName) {
                console.log(`📦 Node ${id}:`, node.data.displayName, node.data.name || 'No name');
              }
            } catch (nodeError) {
              console.log(`⚠️ Could not get details for node ${id}`);
            }
          });
        }
      } catch (error) {
        console.log('⚠️ Error getting nodes:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [query, actions, enabled]);

  return null;
}

export default function BuilderEditor({ initialPage }: BuilderEditorProps) {
  const { setCurrentPage } = useBuilder();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCurrentPage(initialPage);
    setIsMounted(true);
  }, [initialPage, setCurrentPage]);

  // Create resolver with only essential components
  const resolverComponents = {
    Container,
    TextBlock,
    ButtonBlock,
    SimpleText,
    SimpleButton,
    Hero,
    EventDetails,
    Countdown,
    Agenda,
    Speakers,
    Map,
    FAQ,
    Gallery,
    ImageHero,
    Footer,
    RegistrationForm,
    DesignForm,
    CreativeForm,
    CorporateForm,
    TechForm,
    Session,
    TwoColumnSection,
    ParticipantInfo,
    FormulaireDynamique,
    PaymentWidget,
  };

  // Show loading state if not mounted
  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  return (
    <BuilderModeProvider mode="editor">
      <Editor
        resolver={resolverComponents}
        enabled={true}
        onRender={({ render }) => {
          // Custom render wrapper if needed
          return <div className="craftjs-renderer">{render}</div>;
        }}
      >
        <EditorDebugger />
        <div className="flex h-screen overflow-hidden bg-gray-50">
          {/* Left Sidebar - Blocks Library */}
          <BuilderSidebar />

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <BuilderToolbar />

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
              <BuilderCanvas initialTree={initialPage.tree} />
            </div>
          </div>

          {/* Right Panel - Properties & Layers */}
          <BuilderPropertiesPanel />
        </div>
      </Editor>
    </BuilderModeProvider>
  );
}
