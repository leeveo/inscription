'use client'

import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Layers } from '@craftjs/layers';
import { FiSettings, FiLayers, FiDatabase } from 'react-icons/fi';
import DataBindingPanel from './DataBindingPanel';

type PanelTab = 'properties' | 'layers' | 'data';

export default function BuilderPropertiesPanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>('properties');
  const { selected, actions } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').first();
    return {
      selected: currentNodeId ? {
        id: currentNodeId,
        name: state.nodes[currentNodeId]?.data?.displayName || state.nodes[currentNodeId]?.data?.name || 'Element',
        settings: state.nodes[currentNodeId]?.related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
        props: state.nodes[currentNodeId]?.data?.props || {},
      } : null,
    };
  });

  const tabs = [
    { id: 'properties' as PanelTab, label: 'Propriétés', icon: <FiSettings className="w-4 h-4" /> },
    { id: 'layers' as PanelTab, label: 'Arborescence', icon: <FiLayers className="w-4 h-4" /> },
    { id: 'data' as PanelTab, label: 'Données', icon: <FiDatabase className="w-4 h-4" /> },
  ];

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'properties' && (
          <div className="p-4">
            {selected ? (
              <div>
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-1">{selected.name}</h3>
                  <p className="text-xs text-gray-500">ID: {selected.id.substring(0, 8)}...</p>
                </div>

                {/* Settings Component */}
                {selected.settings && React.createElement(selected.settings)}

                {/* Delete Button */}
                {selected.isDeletable && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => actions.delete(selected.id)}
                      className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                    >
                      Supprimer cet élément
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiSettings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucun élément sélectionné</p>
                <p className="text-xs text-gray-400 mt-1">
                  Cliquez sur un élément du canvas pour voir ses propriétés
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Arborescence</h3>
              <p className="text-xs text-gray-500">Structure de votre page</p>
            </div>
            <Layers />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Liaison de données</h3>
              <p className="text-xs text-gray-500">Connectez vos blocs aux données Supabase</p>
            </div>

            {selected ? (
              <div className="space-y-4">
                {/* Info Panel */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-900">
                    💡 Configurez la source de données pour charger du contenu dynamique depuis Supabase
                  </p>
                </div>

                {/* Data Binding Panel */}
                <DataBindingPanel
                  nodeProps={selected.props}
                  setProp={(cb) => actions.setProp(selected.id, cb)}
                />

                {/* Help */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-700 font-medium mb-1">Blocs supportés:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Agenda → inscription_sessions</li>
                    <li>• Speakers → inscription_participants</li>
                    <li>• Gallery → (créez votre table)</li>
                    <li>• FAQ → (créez votre table)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiDatabase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucun élément sélectionné</p>
                <p className="text-xs text-gray-400 mt-1">
                  Sélectionnez un bloc pour configurer ses données
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
