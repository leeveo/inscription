'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import type { GalleryBlockProps } from '@/types/builder';
import { FiImage } from 'react-icons/fi';

export const Gallery = ({
  title = 'Galerie photos',
  images = [
    {
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      alt: 'Événement 1',
      caption: 'Conférence 2024',
    },
    {
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
      alt: 'Événement 2',
      caption: 'Networking',
    },
    {
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      alt: 'Événement 3',
      caption: 'Workshop',
    },
    {
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
      alt: 'Événement 4',
      caption: 'Panel discussion',
    },
  ],
  layout = 'grid',
  columns = 3,
}: GalleryBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

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
          Galerie {selected && '• Sélectionné'}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Title */}
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}

        {/* Gallery */}
        {layout === 'grid' && (
          <div className={`grid ${gridCols[columns]} gap-6`}>
            {images && images.length > 0 ? (
              images.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow aspect-square"
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white font-medium">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                <FiImage className="w-16 h-16 mb-4" />
                <p>Aucune image dans la galerie</p>
              </div>
            )}
          </div>
        )}

        {layout === 'masonry' && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {images && images.length > 0 ? (
              images.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow break-inside-avoid"
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white font-medium">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiImage className="w-16 h-16 mb-4" />
                <p>Aucune image dans la galerie</p>
              </div>
            )}
          </div>
        )}

        {layout === 'carousel' && (
          <div className="text-center py-16 text-gray-500">
            <p>Le mode carrousel sera disponible prochainement</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings component
export const GallerySettings = () => {
  const {
    actions: { setProp },
    title,
    images,
    layout,
    columns,
  } = useNode((node) => ({
    title: node.data.props.title,
    images: node.data.props.images,
    layout: node.data.props.layout,
    columns: node.data.props.columns,
  }));

  const addImage = () => {
    setProp((props: GalleryBlockProps) => {
      if (!props.images) props.images = [];
      props.images.push({
        url: 'https://via.placeholder.com/800',
        alt: 'Nouvelle image',
        caption: '',
      });
    });
  };

  const removeImage = (index: number) => {
    setProp((props: GalleryBlockProps) => {
      if (props.images) {
        props.images.splice(index, 1);
      }
    });
  };

  const updateImage = (index: number, field: 'url' | 'alt' | 'caption', value: string) => {
    setProp((props: GalleryBlockProps) => {
      if (props.images && props.images[index]) {
        props.images[index][field] = value;
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contenu</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setProp((props: GalleryBlockProps) => (props.title = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
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
              onChange={(e) => setProp((props: GalleryBlockProps) => (props.layout = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="grid">Grille</option>
              <option value="masonry">Masonry</option>
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
                    onClick={() => setProp((props: GalleryBlockProps) => (props.columns = col))}
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

      {/* Images */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Images ({images?.length || 0})</h4>
          <button
            onClick={addImage}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {images && images.map((image, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="text"
                    value={image.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Texte alternatif
                  </label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Légende (optionnelle)
                  </label>
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateImage(index, 'caption', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>

                <button
                  onClick={() => removeImage(index)}
                  className="w-full px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Gallery.craft = {
  displayName: 'Gallery',
  props: {
    title: 'Galerie photos',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        alt: 'Événement 1',
        caption: 'Conférence 2024',
      },
      {
        url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        alt: 'Événement 2',
        caption: 'Networking',
      },
      {
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
        alt: 'Événement 3',
        caption: 'Workshop',
      },
    ],
    layout: 'grid',
    columns: 3,
  },
  related: {
    settings: GallerySettings,
  },
};
