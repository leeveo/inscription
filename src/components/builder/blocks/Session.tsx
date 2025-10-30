'use client'

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';

export interface SessionProps {
  eventId?: string;
  layout?: 'grid' | 'list' | 'cards';
  showDate?: boolean;
  showTime?: boolean;
  showLocation?: boolean;
  showSpeakers?: boolean;
  showDescription?: boolean;
  maxSessions?: number;
  background?: string;
  padding?: number;
  margin?: number;
  className?: string;
  // Prop optionnelle pour passer les données d'événement directement (pour le builder)
  eventData?: any;
}

// Mock data for sessions - in real app, this would come from the database
const mockSessions = [
  {
    id: '1',
    title: 'Keynote d\'ouverture',
    description: 'Présentation des enjeux et tendances du secteur',
    startTime: '09:00',
    endTime: '10:30',
    date: '2024-03-15',
    location: 'Amphithéâtre A',
    speakers: ['Dr. Marie Dupont', 'Prof. Jean Martin'],
    type: 'keynote'
  },
  {
    id: '2',
    title: 'Workshop: Innovation Digitale',
    description: 'Atelier pratique sur les nouvelles technologies',
    startTime: '11:00',
    endTime: '12:30',
    date: '2024-03-15',
    location: 'Salle Workshop 1',
    speakers: ['Alex Johnson'],
    type: 'workshop'
  },
  {
    id: '3',
    title: 'Table Ronde: Avenir du Secteur',
    description: 'Débat avec les experts du domaine',
    startTime: '14:00',
    endTime: '15:30',
    date: '2024-03-15',
    location: 'Salle Conférence B',
    speakers: ['Sophie Bernard', 'Marc Rousseau', 'Julie Chen'],
    type: 'panel'
  },
  {
    id: '4',
    title: 'Présentation Produit',
    description: 'Démonstration des nouvelles fonctionnalités',
    startTime: '16:00',
    endTime: '17:00',
    date: '2024-03-15',
    location: 'Espace Démo',
    speakers: ['Thomas Leroy'],
    type: 'presentation'
  }
];

const getSessionTypeColor = (type: string) => {
  const colors = {
    keynote: 'bg-purple-100 text-purple-800 border-purple-200',
    workshop: 'bg-blue-100 text-blue-800 border-blue-200',
    panel: 'bg-green-100 text-green-800 border-green-200',
    presentation: 'bg-orange-100 text-orange-800 border-orange-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[type as keyof typeof colors] || colors.default;
};

export const Session = ({
  eventId,
  layout = 'cards',
  showDate = true,
  showTime = true,
  showLocation = true,
  showSpeakers = true,
  showDescription = true,
  maxSessions = 4,
  background = '#ffffff',
  padding = 24,
  margin = 0,
  className = '',
  eventData: propEventData,
}: SessionProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state?.events?.selected || false,
    hovered: state?.events?.hovered || false,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state?.options?.enabled || false,
  }));

  // Utiliser eventData depuis les props, sinon données mock pour le builder
  const eventData = propEventData;
  
  // Utiliser les vraies sessions ou les données mock si pas disponibles
  const eventSessions = eventData?.sessions || [];
  const sessions = eventSessions.length > 0 
    ? eventSessions.slice(0, maxSessions)
    : mockSessions.slice(0, maxSessions);

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sessions.map((session, index) => (
        <div
          key={session.id || index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 text-lg">
              {session.title || session.nom || session.name || 'Session sans titre'}
            </h3>
            {(session.type || session.categorie) && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSessionTypeColor(session.type || session.categorie || 'default')}`}>
                {session.type || session.categorie}
              </span>
            )}
          </div>
          
          {showDescription && (session.description || session.resume) && (
            <p className="text-gray-600 text-sm mb-4">
              {session.description || session.resume}
            </p>
          )}

          <div className="space-y-2">
            {showTime && (session.startTime || session.heure_debut) && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {session.startTime || session.heure_debut} 
                {(session.endTime || session.heure_fin) && ` - ${session.endTime || session.heure_fin}`}
              </div>
            )}
            
            {showDate && (session.date || session.date_session) && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(session.date || session.date_session).toLocaleDateString('fr-FR')}
              </div>
            )}
            
            {showLocation && (session.location || session.lieu) && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {session.location || session.lieu}
              </div>
            )}
            
            {showSpeakers && (session.speakers || session.intervenants || session.speaker) && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {Array.isArray(session.speakers) 
                  ? session.speakers.join(', ')
                  : Array.isArray(session.intervenants)
                  ? session.intervenants.map((i: any) => i.nom || i.name).join(', ')
                  : session.speaker || session.intervenant || 'Intervenant non défini'
                }
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <div
          key={session.id || index}
          className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900">
                {session.title || session.nom || session.name || 'Session sans titre'}
              </h3>
              {(session.type || session.categorie) && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSessionTypeColor(session.type || session.categorie || 'default')}`}>
                  {session.type || session.categorie}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {showTime && (session.startTime || session.heure_debut) && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {session.startTime || session.heure_debut} 
                  {(session.endTime || session.heure_fin) && ` - ${session.endTime || session.heure_fin}`}
                </span>
              )}
              {showLocation && (session.location || session.lieu) && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {session.location || session.lieu}
                </span>
              )}
              {showSpeakers && (session.speakers || session.intervenants || session.speaker) && (
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {Array.isArray(session.speakers) 
                    ? session.speakers.join(', ')
                    : Array.isArray(session.intervenants)
                    ? session.intervenants.map((i: any) => i.nom || i.name).join(', ')
                    : session.speaker || session.intervenant || 'Intervenant'
                  }
                </span>
              )}
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      ))}
    </div>
  );

  const renderCardsLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session, index) => (
        <div
          key={session.id || index}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            {(session.type || session.categorie) && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSessionTypeColor(session.type || session.categorie || 'default')}`}>
                {session.type || session.categorie}
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 text-sm mb-2">
            {session.title || session.nom || session.name || 'Session sans titre'}
          </h3>
          
          {showDescription && (session.description || session.resume) && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {session.description || session.resume}
            </p>
          )}

          <div className="space-y-1">
            {showTime && (session.startTime || session.heure_debut) && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                {session.startTime || session.heure_debut} 
                {(session.endTime || session.heure_fin) && ` - ${session.endTime || session.heure_fin}`}
              </div>
            )}
            
            {showLocation && (session.location || session.lieu) && (
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-1" />
                {session.location || session.lieu}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (layout) {
      case 'grid':
        return renderGridLayout();
      case 'list':
        return renderListLayout();
      case 'cards':
      default:
        return renderCardsLayout();
    }
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
        minHeight: enabled ? '200px' : 'auto',
        border: enabled 
          ? (selected || hovered ? '2px solid #3B82F6' : '2px dashed #e5e7eb')
          : 'none',
        transition: 'border 0.2s ease',
      }}
    >
      {/* Selection Indicator - Only in edit mode */}
      {enabled && (selected || hovered) && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-t">
          Sessions {selected && '• Sélectionné'}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Programme des Sessions
        </h2>
        <p className="text-gray-600">
          {eventSessions.length > 0 
            ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} programmée${sessions.length > 1 ? 's' : ''}`
            : 'Découvrez toutes les sessions de l\'événement'
          }
        </p>
        {eventSessions.length === 0 && enabled && (
          <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            ⚠️ Mode aperçu : données d'exemple affichées
          </div>
        )}
      </div>

      {/* Sessions Content */}
      {renderContent()}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="flex items-center justify-center h-40 text-center">
          <div className="text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2" />
            {eventSessions.length === 0 ? (
              <>
                <p className="text-sm">Aucune session dans cet événement</p>
                <p className="text-xs">Ajoutez des sessions à votre événement pour les voir ici</p>
              </>
            ) : (
              <>
                <p className="text-sm">Aucune session à afficher</p>
                <p className="text-xs">Vérifiez le nombre maximum de sessions dans les paramètres</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Settings component for the properties panel
export const SessionSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node?.data?.props || {}
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mise en page
        </label>
        <select
          value={props.layout || 'cards'}
          onChange={(e) => setProp((props: SessionProps) => (props.layout = e.target.value as 'grid' | 'list' | 'cards'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="cards">Cartes</option>
          <option value="grid">Grille</option>
          <option value="list">Liste</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre maximum de sessions
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={props.maxSessions || 4}
          onChange={(e) => setProp((props: SessionProps) => (props.maxSessions = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Éléments à afficher
        </label>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.showDate ?? true}
              onChange={(e) => setProp((props: SessionProps) => (props.showDate = e.target.checked))}
              className="mr-2"
            />
            <span className="text-sm">Date</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.showTime ?? true}
              onChange={(e) => setProp((props: SessionProps) => (props.showTime = e.target.checked))}
              className="mr-2"
            />
            <span className="text-sm">Heure</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.showLocation ?? true}
              onChange={(e) => setProp((props: SessionProps) => (props.showLocation = e.target.checked))}
              className="mr-2"
            />
            <span className="text-sm">Lieu</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.showSpeakers ?? true}
              onChange={(e) => setProp((props: SessionProps) => (props.showSpeakers = e.target.checked))}
              className="mr-2"
            />
            <span className="text-sm">Intervenants</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={props.showDescription ?? true}
              onChange={(e) => setProp((props: SessionProps) => (props.showDescription = e.target.checked))}
              className="mr-2"
            />
            <span className="text-sm">Description</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={props.background || '#ffffff'}
            onChange={(e) => setProp((props: SessionProps) => (props.background = e.target.value))}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={props.background || '#ffffff'}
            onChange={(e) => setProp((props: SessionProps) => (props.background = e.target.value))}
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
          value={props.padding || 24}
          onChange={(e) => setProp((props: SessionProps) => (props.padding = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marge extérieure (px)
        </label>
        <input
          type="number"
          value={props.margin || 0}
          onChange={(e) => setProp((props: SessionProps) => (props.margin = parseInt(e.target.value)))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
};



Session.craft = {
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