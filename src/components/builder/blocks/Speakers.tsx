'use client'

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import type { SpeakersBlockProps } from '@/types/builder';
import { FiLinkedin, FiTwitter, FiGlobe, FiAlertCircle } from 'react-icons/fi';
import { fetchBoundDataClient } from '@/lib/builder/data-fetcher-client';
import { useEventData } from '@/contexts/EventDataContext';

// Mock data - used when no data binding is configured
const mockSpeakers = [
  {
    id: '1',
    nom: 'Sophie Martin',
    prenom: 'Dr.',
    profession: 'Directrice Innovation',
    photo: '',
    bio: 'Experte en transformation digitale avec 15 ans d\'expérience',
    url_linkedin: 'https://linkedin.com',
    url_twitter: 'https://twitter.com',
    site_web: 'https://example.com',
  },
  {
    id: '2',
    nom: 'Jean Dupont',
    prenom: '',
    profession: 'CEO TechCorp',
    photo: '',
    bio: 'Entrepreneur et investisseur dans la tech',
    url_linkedin: 'https://linkedin.com',
    url_twitter: '',
    site_web: '',
  },
  {
    id: '3',
    nom: 'Marie Leclerc',
    prenom: '',
    profession: 'Designer UX/UI',
    photo: '',
    bio: 'Passionnée par l\'expérience utilisateur et le design thinking',
    url_linkedin: 'https://linkedin.com',
    url_twitter: 'https://twitter.com',
    site_web: 'https://example.com',
  },
];

interface Speaker {
  id: string | number;
  nom: string;
  prenom?: string;
  profession?: string;
  photo?: string;
  bio?: string;
  url_linkedin?: string;
  url_twitter?: string;
  site_web?: string;
}

export const Speakers = ({
  title = 'Nos intervenants',
  layout = 'grid',
  columns = 3,
  showBio = true,
  showSocial = true,
  dataBinding,
}: SpeakersBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  // Récupérer les données d'événement depuis le Context
  const { eventData } = useEventData();

  const [speakers, setSpeakers] = useState<Speaker[]>(mockSpeakers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when component mounts or dataBinding changes
  useEffect(() => {
    async function loadData() {
      // Priority 1: Use eventData if available (from preview/public pages)
      if (eventData?.speakers && Array.isArray(eventData.speakers)) {
        console.log('Speakers block - Using eventData.speakers:', eventData.speakers);
        // Map eventData speakers to Speaker interface
        const mappedSpeakers = eventData.speakers.map((s: any) => ({
          id: s.id,
          nom: s.lastName || s.nom || '',
          prenom: s.firstName || s.prenom || '',
          profession: s.title || s.titre || '',
          photo: s.photoUrl || s.photo_url || '',
          bio: s.bio || s.biography || s.biographie || '',
          url_linkedin: s.linkedin || s.url_linkedin || '',
          url_twitter: s.twitter || s.url_twitter || '',
          site_web: s.website || s.site_web || '',
        }));
        setSpeakers(mappedSpeakers);
        return;
      }

      // Priority 2: Use dataBinding if configured
      if (!dataBinding || dataBinding.runtime !== 'client') {
        setSpeakers(mockSpeakers);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchBoundDataClient<Speaker>(dataBinding);

      if (fetchError) {
        setError(fetchError);
        setSpeakers(mockSpeakers); // Fallback to mock data
      } else if (data) {
        setSpeakers(data);
      }

      setLoading(false);
    }

    loadData();
  }, [dataBinding, eventData]);

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const SpeakerCard = ({ speaker }: { speaker: Speaker }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
      {/* Photo */}
      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
        {speaker.photo ? (
          <img
            src={speaker.photo}
            alt={`${speaker.prenom || ''} ${speaker.nom}`}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{speaker.prenom?.[0] || speaker.nom[0]}</span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {speaker.prenom && `${speaker.prenom} `}{speaker.nom}
      </h3>

      {/* Title/Profession */}
      {speaker.profession && (
        <p className="text-sm text-blue-600 font-medium mb-3">
          {speaker.profession}
        </p>
      )}

      {/* Bio */}
      {showBio && speaker.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {speaker.bio}
        </p>
      )}

      {/* Social Links */}
      {showSocial && (
        <div className="flex justify-center gap-3">
          {speaker.url_linkedin && (
            <a
              href={speaker.url_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
            >
              <FiLinkedin className="w-4 h-4" />
            </a>
          )}
          {speaker.url_twitter && (
            <a
              href={speaker.url_twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
            >
              <FiTwitter className="w-4 h-4" />
            </a>
          )}
          {speaker.site_web && (
            <a
              href={speaker.site_web}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
            >
              <FiGlobe className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="relative w-full py-12 px-8 bg-white"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          Intervenants {selected && '• Sélectionné'}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Title */}
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-8">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Erreur de chargement</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Speakers Grid/List */}
        {!loading && (
          <>
            {layout === 'grid' ? (
              <div className={`grid ${gridCols[columns]} gap-8`}>
                {speakers.map((speaker) => (
                  <SpeakerCard key={speaker.id} speaker={speaker} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {speakers.map((speaker) => (
                  <SpeakerCard key={speaker.id} speaker={speaker} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

// Settings component
export const SpeakersSettings = () => {
  const {
    actions: { setProp },
    title,
    layout,
    columns,
    showBio,
    showSocial,
  } = useNode((node) => ({
    title: node.data.props.title,
    layout: node.data.props.layout,
    columns: node.data.props.columns,
    showBio: node.data.props.showBio,
    showSocial: node.data.props.showSocial,
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
              onChange={(e) => setProp((props: SpeakersBlockProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Mise en page</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'affichage
            </label>
            <select
              value={layout}
              onChange={(e) => setProp((props: SpeakersBlockProps) => (props.layout = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="grid">Grille</option>
              <option value="list">Liste</option>
              <option value="carousel">Carrousel (à venir)</option>
            </select>
          </div>

          {layout === 'grid' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colonnes
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((col) => (
                  <button
                    key={col}
                    onClick={() => setProp((props: SpeakersBlockProps) => (props.columns = col))}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                      columns === col
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Affichage</h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBio}
              onChange={(e) => setProp((props: SpeakersBlockProps) => (props.showBio = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher la biographie</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSocial}
              onChange={(e) => setProp((props: SpeakersBlockProps) => (props.showSocial = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les réseaux sociaux</span>
          </label>
        </div>
      </div>
    </div>
  );
};

Speakers.craft = {
  displayName: 'Speakers',
  props: {
    title: 'Nos intervenants',
    layout: 'grid',
    columns: 3,
    showBio: true,
    showSocial: true,
  },
  related: {
    settings: SpeakersSettings,
  },
};
