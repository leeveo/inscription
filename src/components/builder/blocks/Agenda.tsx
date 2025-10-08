'use client'

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import type { AgendaBlockProps } from '@/types/builder';
import { FiClock, FiMapPin, FiUser, FiAlertCircle } from 'react-icons/fi';
import { fetchBoundDataClient } from '@/lib/builder/data-fetcher-client';

// Mock data for demo - used when no data binding is configured
const mockSessions = [
  {
    id: '1',
    titre: 'Keynote d\'ouverture',
    description: 'Présentation des tendances 2025',
    date: '2025-03-15',
    heure_debut: '09:00',
    heure_fin: '10:00',
    intervenant: 'Dr. Sophie Martin',
    lieu: 'Salle principale',
    type: 'keynote',
  },
  {
    id: '2',
    titre: 'Atelier pratique',
    description: 'Hands-on avec les nouvelles technologies',
    date: '2025-03-15',
    heure_debut: '10:30',
    heure_fin: '12:00',
    intervenant: 'Jean Dupont',
    lieu: 'Salle A',
    type: 'atelier',
  },
  {
    id: '3',
    titre: 'Table ronde',
    description: 'Discussions sur l\'avenir du secteur',
    date: '2025-03-15',
    heure_debut: '14:00',
    heure_fin: '15:30',
    intervenant: 'Panel d\'experts',
    lieu: 'Salle principale',
    type: 'panel',
  },
];

interface Session {
  id: string | number;
  titre: string;
  description?: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  intervenant?: string;
  lieu?: string;
  type?: string;
}

export const Agenda = ({
  title = 'Programme de l\'événement',
  groupBy = 'day',
  showSpeakers = true,
  allowEnrollment = false,
  dataBinding,
}: AgendaBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts or dataBinding changes
  useEffect(() => {
    async function loadData() {
      // Only fetch if dataBinding is configured and runtime is 'client'
      if (!dataBinding || dataBinding.runtime !== 'client') {
        setSessions(mockSessions);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchBoundDataClient<Session>(dataBinding);

      if (fetchError) {
        setError(fetchError);
        setSessions(mockSessions); // Fallback to mock data
      } else if (data) {
        setSessions(data);
      }

      setLoading(false);
    }

    loadData();
  }, [dataBinding]);

  const SessionCard = ({ session }: { session: Session }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Time & Location */}
      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FiClock className="w-4 h-4" />
          <span>{session.heure_debut} - {session.heure_fin}</span>
        </div>
        {session.lieu && (
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4" />
            <span>{session.lieu}</span>
          </div>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {session.titre}
      </h3>
      {session.description && (
        <p className="text-sm text-gray-600 mb-3">
          {session.description}
        </p>
      )}

      {/* Speaker */}
      {showSpeakers && session.intervenant && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FiUser className="w-4 h-4" />
          <span className="font-medium">{session.intervenant}</span>
        </div>
      )}

      {/* Enrollment Button */}
      {allowEnrollment && (
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          S'inscrire à cette session
        </button>
      )}

      {/* Type Badge */}
      {session.type && (
        <div className="mt-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {session.type}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={(ref: HTMLDivElement | null) => { if (ref) connect(drag(ref)) }}
      className="relative w-full py-12 px-8 bg-gray-50"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          Agenda {selected && '• Sélectionné'}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Title */}
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Erreur de chargement</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

        {/* Data Binding Status */}
        {!loading && !error && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-900">
              {dataBinding && dataBinding.runtime === 'client'
                ? `✅ ${sessions.length} session(s) chargée(s) depuis ${dataBinding.table}`
                : '📊 Utilisez l\'onglet "Données" pour configurer la liaison avec Supabase'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings component
export const AgendaSettings = () => {
  const {
    actions: { setProp },
    title,
    groupBy,
    showSpeakers,
    allowEnrollment,
  } = useNode((node) => ({
    title: node.data.props.title,
    groupBy: node.data.props.groupBy,
    showSpeakers: node.data.props.showSpeakers,
    allowEnrollment: node.data.props.allowEnrollment,
  }));

  return (
    <div className="space-y-4">
      {/* Content */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setProp((props: AgendaBlockProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grouper par
            </label>
            <select
              value={groupBy}
              onChange={(e) => setProp((props: AgendaBlockProps) => (props.groupBy = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="day">Jour</option>
              <option value="track">Piste</option>
              <option value="room">Salle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Options</h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSpeakers}
              onChange={(e) => setProp((props: AgendaBlockProps) => (props.showSpeakers = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les intervenants</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowEnrollment}
              onChange={(e) => setProp((props: AgendaBlockProps) => (props.allowEnrollment = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Permettre l'inscription aux sessions</span>
          </label>
        </div>
      </div>

      {/* Data Binding Notice */}
      <div className="pt-4 border-t border-gray-200">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            💡 La liaison de données sera configurée dans l'onglet "Données"
          </p>
        </div>
      </div>
    </div>
  );
};

Agenda.craft = {
  displayName: 'Agenda',
  props: {
    title: 'Programme de l\'événement',
    groupBy: 'day',
    showSpeakers: true,
    allowEnrollment: false,
  },
  related: {
    settings: AgendaSettings,
  },
};
