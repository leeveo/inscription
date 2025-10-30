'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import ImageUpload from '@/components/ImageUpload';
import { useBuilderMode } from '@/contexts/BuilderModeContext';

export interface ImageHeroProps {
  imageUrl?: string;
  alt?: string;
  height?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  title?: string;
  subtitle?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const ImageHero = ({
  imageUrl = '',
  alt = 'Image Hero',
  height = '500px',
  overlay = false,
  overlayOpacity = 50,
  title = '',
  subtitle = '',
  objectFit = 'cover',
}: ImageHeroProps) => {
  const { isEditing } = useBuilderMode();
  const {
    connectors: { connect, drag },
    selected,
    hovered,
    actions,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const handleImageUploaded = (url: string) => {
    actions.setProp((props: ImageHeroProps) => {
      props.imageUrl = url;
    });
  };

  console.log('🖼️ ImageHero render:', { imageUrl, isEditing, selected });

  return (
    <div 
      ref={(ref) => connect(drag(ref))}
      className={`relative w-full ${selected ? 'outline-2 outline-blue-500' : ''} ${hovered ? 'outline-1 outline-blue-300' : ''}`}
      style={{ height }}
    >
      {/* DEBUG INFO */}
      {selected && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white px-2 py-1 text-xs z-50">
          ImageHero {imageUrl ? '✅' : '❌'} {isEditing ? 'EDIT' : 'VIEW'}
        </div>
      )}

      {/* AFFICHAGE DE L'IMAGE - VERSION ULTRA SIMPLE */}
      {imageUrl ? (
        <>
          {/* Image principale */}
          <img
            src={imageUrl}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
          />
          
          {/* Overlay sombre */}
          {overlay && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity / 100, zIndex: 2 }}
            />
          )}

          {/* Textes */}
          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white z-10">
              <div className="text-center max-w-4xl">
                {title && (
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xl md:text-2xl drop-shadow-lg opacity-90">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Placeholder quand pas d'image */
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Cliquez pour ajouter une image</p>
          </div>
        </div>
      )}

      {/* CONTRÔLES D'ÉDITION */}
      {isEditing && (
        <div className="absolute inset-0 z-50">
          {imageUrl ? (
            /* Bouton pour changer l'image existante */
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => actions.setProp((props: ImageHeroProps) => (props.imageUrl = ''))}
                className="bg-white/95 hover:bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors border"
              >
                🔄 Changer
              </button>
            </div>
          ) : (
            /* Zone d'upload quand pas d'image */
            <div className="w-full h-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <div className="w-full max-w-md mx-auto p-6">
                <ImageUpload
                  currentImageUrl={imageUrl}
                  onImageUploaded={handleImageUploaded}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Settings component simplifié
export const ImageHeroSettings = () => {
  const {
    actions: { setProp },
    imageUrl,
    alt,
    height,
    overlay,
    overlayOpacity,
    title,
    subtitle,
    objectFit,
  } = useNode((node) => ({
    imageUrl: node.data.props.imageUrl,
    alt: node.data.props.alt,
    height: node.data.props.height,
    overlay: node.data.props.overlay,
    overlayOpacity: node.data.props.overlayOpacity,
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    objectFit: node.data.props.objectFit,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de l'image
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.imageUrl = e.target.value))}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte alternatif
        </label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.alt = e.target.value))}
          placeholder="Description de l'image"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hauteur
        </label>
        <input
          type="text"
          value={height}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.height = e.target.value))}
          placeholder="400px, 50vh, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.title = e.target.value))}
          placeholder="Titre principal"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sous-titre
        </label>
        <textarea
          value={subtitle}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.subtitle = e.target.value))}
          placeholder="Description ou sous-titre"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="overlay"
          checked={overlay}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.overlay = e.target.checked))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="overlay" className="ml-2 block text-sm text-gray-700">
          Overlay sombre
        </label>
      </div>

      {overlay && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opacité de l'overlay ({overlayOpacity}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={overlayOpacity}
            onChange={(e) => setProp((props: ImageHeroProps) => (props.overlayOpacity = parseInt(e.target.value)))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

ImageHero.craft = {
  props: {
    imageUrl: '',
    alt: 'Image Hero',
    height: '500px',
    overlay: false,
    overlayOpacity: 50,
    title: '',
    subtitle: '',
    objectFit: 'cover',
  },
  related: {
    settings: ImageHeroSettings,
  },
};