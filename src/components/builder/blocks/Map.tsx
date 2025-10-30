'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import type { MapBlockProps } from '@/types/builder';
import { FiMapPin, FiNavigation } from 'react-icons/fi';

export const Map = ({
  address = '123 Rue de l\'Événement, 75001 Paris',
  latitude,
  longitude,
  zoom = 15,
  height = 400,
  showMarker = true,
}: MapBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  // Simple map placeholder - in production, integrate Google Maps or Mapbox
  const mapUrl = latitude && longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`
    : null;

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="relative w-full"
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          Carte {selected && '• Sélectionné'}
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Map */}
        <div
          className="relative bg-gray-200"
          style={{ height: `${height}px` }}
        >
          {mapUrl ? (
            <iframe
              src={mapUrl}
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FiMapPin className="w-16 h-16 mb-4" />
              <p className="text-sm">Configurez les coordonnées pour afficher la carte</p>
            </div>
          )}
        </div>

        {/* Address Info */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiMapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Lieu de l'événement</h3>
              <p className="text-gray-700 mb-4">{address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FiNavigation className="w-4 h-4" />
                <span>Obtenir l'itinéraire</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings component
export const MapSettings = () => {
  const {
    actions: { setProp },
    address,
    latitude,
    longitude,
    zoom,
    height,
    showMarker,
  } = useNode((node) => ({
    address: node.data.props.address,
    latitude: node.data.props.latitude,
    longitude: node.data.props.longitude,
    zoom: node.data.props.zoom,
    height: node.data.props.height,
    showMarker: node.data.props.showMarker,
  }));

  return (
    <div className="space-y-4">
      {/* Location */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Localisation</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              value={address}
              onChange={(e) => setProp((props: MapBlockProps) => (props.address = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude || ''}
                onChange={(e) => setProp((props: MapBlockProps) => (props.latitude = parseFloat(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="48.8566"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude || ''}
                onChange={(e) => setProp((props: MapBlockProps) => (props.longitude = parseFloat(e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="2.3522"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              💡 Utilisez <a href="https://www.latlong.net/" target="_blank" rel="noopener" className="underline">latlong.net</a> pour trouver les coordonnées
            </p>
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Affichage</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hauteur (px)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setProp((props: MapBlockProps) => (props.height = parseInt(e.target.value)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de zoom
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={zoom}
              onChange={(e) => setProp((props: MapBlockProps) => (props.zoom = parseInt(e.target.value)))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Zoom arrière</span>
              <span>{zoom}</span>
              <span>Zoom avant</span>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showMarker}
              onChange={(e) => setProp((props: MapBlockProps) => (props.showMarker = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher le marqueur</span>
          </label>
        </div>
      </div>
    </div>
  );
};

Map.craft = {
  displayName: 'Map',
  props: {
    address: '123 Rue de l\'Événement, 75001 Paris',
    latitude: undefined,
    longitude: undefined,
    zoom: 15,
    height: 400,
    showMarker: true,
  },
  related: {
    settings: MapSettings,
  },
};
