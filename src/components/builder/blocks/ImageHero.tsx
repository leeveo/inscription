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
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const ImageHero = ({
  imageUrl = '',
  alt = 'Image hero',
  height = '400px',
  overlay = false,
  overlayOpacity = 30,
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
    actions: state.actions,
  }));

  const handleImageUploaded = (url: string) => {
    console.log('Image uploaded successfully:', url);

    actions.setProp((props: ImageHeroProps) => {
      props.imageUrl = url;
      props.alt = 'Image hero';
    });
  };

  return (
    <div
      ref={isEditing ? (ref) => ref && connect(drag(ref)) : undefined}
      className="relative w-full"
      style={{
        border: isEditing && (selected || hovered) ? '2px dashed #3B82F6' : 'none',
        borderRadius: '8px',
        overflow: 'hidden',
        height,
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Selection Indicator - only show when editor is enabled */}
      {isEditing && (selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-b">
          Image Hero {selected && '• Sélectionné'}
        </div>
      )}

      {/* Image Upload Component - only show when editor is enabled */}
      {isEditing ? (
        <div className="h-full">
          <ImageUpload
            currentImageUrl={imageUrl}
            onImageUploaded={handleImageUploaded}
            className="h-full"
          />
        </div>
      ) : null}

      {/* Image Display */}
      {imageUrl && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={imageUrl}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit,
            }}
          />

          {/* Overlay */}
          {overlay && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity / 100 }}
            />
          )}

          {/* Text Overlay */}
          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
              {title && (
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center drop-shadow-lg">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg md:text-xl text-center drop-shadow-lg">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Settings component
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
      {/* Image URL */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Image</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="text"
              value={imageUrl || ''}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.imageUrl = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte alternatif (alt)
            </label>
            <input
              type="text"
              value={alt || ''}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.alt = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Dimensions</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hauteur
            </label>
            <input
              type="text"
              value={height || '400px'}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.height = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="400px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajustement de l'image
            </label>
            <select
              value={objectFit || 'cover'}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.objectFit = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="cover">Cover (remplit)</option>
              <option value="contain">Contain (contient)</option>
              <option value="fill">Fill (étirer)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Text Overlay */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Texte par-dessus</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Votre titre ici"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-titre
            </label>
            <input
              type="text"
              value={subtitle || ''}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.subtitle = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Votre sous-titre ici"
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Overlay</h4>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={overlay || false}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.overlay = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Activer l'overlay sombre</span>
          </label>

          {overlay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opacité de l'overlay ({overlayOpacity}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={overlayOpacity || 30}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.overlayOpacity = parseInt(e.target.value)))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ImageHero.craft = {
  displayName: 'ImageHero',
  props: {
    imageUrl: '',
    alt: 'Image hero',
    height: '400px',
    overlay: false,
    overlayOpacity: 30,
    title: '',
    subtitle: '',
    objectFit: 'cover',
  },
  related: {
    settings: ImageHeroSettings,
  },
};