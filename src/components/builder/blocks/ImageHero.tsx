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
  width?: string;
  horizontalAlign?: string;
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
  width = '100%',
  horizontalAlign = 'left',
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

  // Fonction pour obtenir le style d'alignement horizontal
  const getHorizontalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return { marginLeft: 'auto', marginRight: 'auto', display: 'block' };
      case 'right':
        return { marginLeft: 'auto', marginRight: '0', display: 'block' };
      case 'left':
      default:
        return { marginLeft: '0', marginRight: '0', display: 'block' };
    }
  };

  const alignStyle = getHorizontalAlignStyle(horizontalAlign);

  return (
    <div
      ref={isEditing ? (ref) => ref && connect(drag(ref)) : undefined}
      className="relative my-4"
      style={{
        border: isEditing && (selected || hovered) ? '2px dashed #3B82F6' : 'none',
        borderRadius: '8px',
        overflow: 'hidden',
        height,
        width,
        ...alignStyle,
        backgroundColor: '#ffffff',
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

      {/* Placeholder when no image in preview/public mode */}
      {!imageUrl && !isEditing && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image Hero</p>
          </div>
        </div>
      )}

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
    width,
    horizontalAlign,
  } = useNode((node) => ({
    imageUrl: node.data.props.imageUrl,
    alt: node.data.props.alt,
    height: node.data.props.height,
    overlay: node.data.props.overlay,
    overlayOpacity: node.data.props.overlayOpacity,
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    objectFit: node.data.props.objectFit,
    width: node.data.props.width,
    horizontalAlign: node.data.props.horizontalAlign,
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largeur du bloc
            </label>
            <div className="space-y-2">
              <select
                value={width || '100%'}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.width = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="100%">100% (pleine largeur)</option>
                <option value="75%">75%</option>
                <option value="66.66%">66.66% (2/3)</option>
                <option value="50%">50% (moitié)</option>
                <option value="33.33%">33.33% (1/3)</option>
                <option value="25%">25%</option>
              </select>
              <input
                type="text"
                value={width || '100%'}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.width = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="100%, 500px, 20rem, etc."
              />
              <p className="text-xs text-gray-500">
                Utilisez les valeurs prédéfinies ou entrez une valeur personnalisée (px, %, rem, etc.)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignement horizontal du bloc
            </label>
            <div className="space-y-2">
              <select
                value={horizontalAlign || 'left'}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.horizontalAlign = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setProp((props: ImageHeroProps) => (props.horizontalAlign = 'left'))}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    horizontalAlign === 'left'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">⬅️</span>
                  Gauche
                </button>
                <button
                  onClick={() => setProp((props: ImageHeroProps) => (props.horizontalAlign = 'center'))}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    horizontalAlign === 'center'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">↔️</span>
                  Centre
                </button>
                <button
                  onClick={() => setProp((props: ImageHeroProps) => (props.horizontalAlign = 'right'))}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    horizontalAlign === 'right'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">➡️</span>
                  Droite
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Permet de centrer le bloc image sur la page
              </p>
            </div>
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
    width: '100%',
    horizontalAlign: 'left',
  },
  related: {
    settings: ImageHeroSettings,
  },
};