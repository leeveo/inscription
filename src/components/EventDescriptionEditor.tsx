'use client'

import React, { useState } from 'react'
import SimpleRichTextEditor from './SimpleRichTextEditor'

interface EventDescriptionEditorProps {
  value: string
  onChange: (html: string) => void
  className?: string
  placeholder?: string
}

export default function EventDescriptionEditor({ 
  value, 
  onChange, 
  className = '',
  placeholder = "Décrivez votre événement en détail. Vous pouvez utiliser du formatage pour mettre en valeur les informations importantes."
}: EventDescriptionEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split')
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Description de l'événement
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500">
            Éditeur avec formatage avancé
          </span>
          
          {/* Boutons de mode d'affichage */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'editor'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              Éditeur
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'split'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              Divisé
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              Aperçu
            </button>
          </div>
        </div>
      </div>

      {/* Vue éditeur seul */}
      {activeTab === 'editor' && (
        <div className="border border-gray-300 rounded-lg">
          <SimpleRichTextEditor
            value={value}
            onChange={onChange}
            height="400px"
          />
        </div>
      )}

      {/* Vue aperçu seul */}
      {activeTab === 'preview' && (
        <div className="border border-gray-300 rounded-lg bg-white min-h-[400px]">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-lg">
            <span className="text-sm font-medium text-gray-700">Aperçu de la description</span>
          </div>
          <div className="p-4">
            <div 
              className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              dangerouslySetInnerHTML={{ 
                __html: value || '<p class="text-gray-400 italic">Aucun contenu à afficher...</p>' 
              }}
              style={{
                fontFamily: 'inherit',
                lineHeight: '1.6'
              }}
            />
          </div>
        </div>
      )}

      {/* Vue divisée : éditeur et aperçu côte à côte */}
      {activeTab === 'split' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Panneau éditeur */}
          <div className="border border-gray-300 rounded-lg">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-lg">
              <span className="text-sm font-medium text-gray-700">✏️ Éditeur</span>
            </div>
            <SimpleRichTextEditor
              value={value}
              onChange={onChange}
              height="350px"
            />
          </div>
          
          {/* Panneau aperçu */}
          <div className="border border-gray-300 rounded-lg bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-lg">
              <span className="text-sm font-medium text-gray-700">👁️ Aperçu en temps réel</span>
            </div>
            <div className="p-4 min-h-[350px] overflow-y-auto">
              <div 
                className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                dangerouslySetInnerHTML={{ 
                  __html: value || '<p class="text-gray-400 italic">Commencez à taper pour voir l\'aperçu...</p>' 
                }}
                style={{
                  fontFamily: 'inherit',
                  lineHeight: '1.6'
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Conseils d'utilisation (seulement si pas de contenu) */}
      {!value && activeTab !== 'preview' && (
        <div className="text-sm text-gray-500 mt-2 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="font-medium mb-1 text-blue-800">💡 Conseils pour une bonne description :</p>
          <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
            <li>Décrivez clairement le contenu et les objectifs de votre événement</li>
            <li>Mentionnez les intervenants, le programme ou les activités prévues</li>
            <li>Précisez le public cible et les prérequis éventuels</li>
            <li>Ajoutez des informations pratiques (dress code, matériel à apporter, etc.)</li>
            <li>Utilisez le formatage (gras, listes) pour structurer l'information</li>
          </ul>
        </div>
      )}
      
      <div className="text-xs text-gray-500 flex justify-between">
        <span>Cette description apparaîtra sur la page d'inscription publique</span>
        <span>
          Caractères: {value.replace(/<[^>]*>/g, '').length} • 
          Mots: {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
        </span>
      </div>
    </div>
  )
}