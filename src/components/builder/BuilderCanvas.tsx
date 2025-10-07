'use client'

import React, { useEffect } from 'react';
import { useEditor, Frame, Element } from '@craftjs/core';
import { Container } from './blocks/Container';
import { useBuilder } from '@/contexts/BuilderContext';

interface BuilderCanvasProps {
  initialTree?: any;
}

export default function BuilderCanvas({ initialTree }: BuilderCanvasProps) {
  const { enabled, actions, query, queryOptions } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const [isTreeLoaded, setIsTreeLoaded] = React.useState(false);
  const { markDirty, savePage } = useBuilder();

  // Debug: Log editor state
  console.log('🎨 Canvas - Editor enabled:', enabled);
  console.log('🎨 Canvas - Initial tree:', initialTree);

  useEffect(() => {
    if (initialTree && Object.keys(initialTree).length > 0) {
      try {
        let dataToDeserialize = null;

        if (initialTree.ROOT) {
          dataToDeserialize = initialTree;
        } else if (initialTree.rootNodeId && initialTree.nodes) {
          dataToDeserialize = initialTree.nodes;
        } else if (typeof initialTree === 'object' && !initialTree.rootNodeId && !initialTree.ROOT) {
          dataToDeserialize = initialTree;
        }

        if (dataToDeserialize) {
          console.log('📄 Deserializing content:', dataToDeserialize);
          actions.deserialize(dataToDeserialize);
        }
        setIsTreeLoaded(true);
      } catch (error) {
        console.error('❌ Error deserializing tree:', error);
        setIsTreeLoaded(true);
      }
    } else {
      console.log('🆕 No initial tree - fresh Canvas');
      setIsTreeLoaded(true);
    }
  }, [initialTree, actions]);

  // Pas d'auto-save dans le Canvas - la Toolbar gère la sauvegarde
  // L'auto-save est géré par la Toolbar (handleSave) qui utilise query.serialize() pour obtenir l'état actuel

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Canvas</h3>
          <p className="text-xs text-gray-500">
            {enabled ? 'Mode édition activé' : 'Mode aperçu'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]">
        <Frame>
          <Element
            is={Container}
            canvas={true}
            background="#ffffff"
            padding={32}
            margin={0}
            className="min-h-[600px]"
          />
        </Frame>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div>Canvas responsive - La mise en page s'adapte automatiquement</div>
        <div>Zoom: 100%</div>
      </div>
    </div>
  );
}
