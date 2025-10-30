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
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  width?: string;
  horizontalAlign?: string;
  heightPreset?: 'small' | 'medium' | 'large' | 'xl' | 'auto' | 'custom';
  maxHeight?: string;
  aspectRatio?: 'auto' | '16/9' | '4/3' | '3/2' | '1/1' | 'custom';
  preserveAspectRatio?: boolean;
  minHeight?: string;
}

export const ImageHero = ({
  imageUrl = '',
  alt = 'Image hero',
  height = '400px',
  overlay = false,
  overlayOpacity = 30,
  title = '',
  subtitle = '',
  objectFit = 'contain',
  width = '100%',
  horizontalAlign = 'left',
  heightPreset = 'auto',
  maxHeight = 'none',
  aspectRatio = 'auto',
  preserveAspectRatio = true,
  minHeight = '200px',
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

  // Fonctions utilitaires pour le responsive (restaurées depuis la sauvegarde)
  const shouldUseFlexibleHeight = heightPreset === 'auto';
  
  const getHeightClasses = () => {
    switch (heightPreset) {
      case 'small':
        return 'h-48 sm:h-56 md:h-64';
      case 'medium':
        return 'h-64 sm:h-72 md:h-80 lg:h-96';
      case 'large':
        return 'h-80 sm:h-96 md:h-[32rem] lg:h-[40rem]';
      case 'xl':
        return 'h-96 sm:h-[32rem] md:h-[40rem] lg:h-[48rem] xl:h-[56rem]';
      case 'custom':
        return '';
      case 'auto':
      default:
        return 'min-h-[200px]';
    }
  };

  const getAspectRatioClasses = (ratio: string) => {
    switch (ratio) {
      case '16/9':
        return 'aspect-video';
      case '4/3':
        return 'aspect-[4/3]';
      case '3/2':
        return 'aspect-[3/2]';
      case '1/1':
        return 'aspect-square';
      case 'auto':
      case 'custom':
      default:
        return '';
    }
  };

  const getWidthClasses = (width: string) => {
    switch (width) {
      case '100%':
        return 'w-full';
      case '75%':
        return 'w-full lg:w-3/4';
      case '50%':
        return 'w-full md:w-1/2';
      case '25%':
        return 'w-full sm:w-1/4';
      default:
        return 'w-full';
    }
  };

  const getHorizontalAlignStyle = (align: string) => {
    switch (align) {
      case 'center':
        return 'mx-auto';
      case 'right':
        return 'ml-auto mr-0';
      case 'left':
      default:
        return 'ml-0 mr-0';
    }
  };

  // Classes et styles combinés
  const containerClasses = `
    relative
    ${getWidthClasses(width)}
    ${getHorizontalAlignStyle(horizontalAlign)}
    ${shouldUseFlexibleHeight ? getAspectRatioClasses(aspectRatio) : getHeightClasses()}
    ${selected ? 'outline-2 outline-blue-500' : ''} 
    ${hovered ? 'outline-1 outline-blue-300' : ''}
  `.trim();

  const containerStyle = {
    ...(heightPreset === 'custom' ? { height } : {}),
    ...(minHeight && shouldUseFlexibleHeight ? { minHeight } : {}),
    ...(maxHeight && maxHeight !== 'none' ? { maxHeight } : {}),
  };

  console.log('🖼️ ImageHero render:', { imageUrl, isEditing, selected, shouldUseFlexibleHeight });

  return (
    <div 
      ref={(ref: any) => ref && connect(drag(ref))}
      className={containerClasses}
      style={containerStyle}
    >
      {/* DEBUG INFO */}
      {selected && (
        <div className="absolute top-0 left-0 bg-blue-500 text-white px-2 py-1 text-xs z-50">
          ImageHero {imageUrl ? '✅' : '❌'} {isEditing ? 'EDIT' : 'VIEW'} {shouldUseFlexibleHeight ? 'FLEX' : 'FIXED'}
        </div>
      )}

      {/* ========== AFFICHAGE PRINCIPAL DE L'IMAGE - VERSION RESPONSIVE ========== */}
      {imageUrl && (
        <div 
          className={`${shouldUseFlexibleHeight ? 'flex-1 flex items-center justify-center' : 'absolute inset-0'} w-full ${shouldUseFlexibleHeight ? 'min-h-0' : 'h-full'}`}
        >
          {shouldUseFlexibleHeight ? (
            // Mode flexible : l'image définit la hauteur du conteneur
            <div className="w-full relative">
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-auto transition-all duration-300 block"
                style={{
                  objectFit: preserveAspectRatio ? 'scale-down' : objectFit,
                  maxWidth: '100%',
                }}
                loading="lazy"
              />
              
              {/* Overlay pour mode flexible */}
              {overlay && (
                <div
                  className="absolute inset-0 bg-black transition-opacity duration-300"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}

              {/* Text Overlay pour mode flexible */}
              {(title || subtitle) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white z-10">
                  <div className="max-w-4xl mx-auto text-center">
                    {title && (
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 text-center drop-shadow-lg leading-tight">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center drop-shadow-lg opacity-90 max-w-3xl mx-auto leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Mode fixe : hauteur définie par le conteneur
            <>
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-full transition-all duration-300 block"
                style={{
                  objectFit: preserveAspectRatio ? 'contain' : objectFit,
                }}
                loading="lazy"
              />

              {/* Overlay pour mode fixe */}
              {overlay && (
                <div
                  className="absolute inset-0 bg-black transition-opacity duration-300"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}

              {/* Text Overlay pour mode fixe */}
              {(title || subtitle) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white z-10">
                  <div className="max-w-4xl mx-auto text-center">
                    {title && (
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 text-center drop-shadow-lg leading-tight">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center drop-shadow-lg opacity-90 max-w-3xl mx-auto leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========== CONTRÔLES D'ÉDITION SIMPLIFIÉS ========== */}
      {isEditing && (
        <div className="absolute inset-0 z-50">
          {imageUrl ? (
            /* Bouton pour changer l'image existante */
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => actions.setProp((props: ImageHeroProps) => (props.imageUrl = ''))}
                className="bg-white/95 hover:bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors border border-gray-200"
              >
                🔄 Changer l'image
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

      {/* ========== PLACEHOLDER QUAND PAS D'IMAGE ========== */}
      {!imageUrl && !isEditing && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image Hero</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings component complet (restauré depuis la sauvegarde)
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
    heightPreset,
    maxHeight,
    aspectRatio,
    preserveAspectRatio,
    minHeight,
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
    heightPreset: node.data.props.heightPreset,
    maxHeight: node.data.props.maxHeight,
    aspectRatio: node.data.props.aspectRatio,
    preserveAspectRatio: node.data.props.preserveAspectRatio,
    minHeight: node.data.props.minHeight,
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

      {/* Anti-crop System */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="preserveAspectRatio"
            checked={preserveAspectRatio}
            onChange={(e) => setProp((props: ImageHeroProps) => (props.preserveAspectRatio = e.target.checked))}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="preserveAspectRatio" className="ml-2 block text-sm text-green-800 font-medium">
            🛡️ Anti-Crop Protection
          </label>
        </div>
        <p className="text-xs text-green-600">
          Empêche le recadrage de l'image sur différentes tailles d'écran
        </p>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ratio d'aspect
        </label>
        <select
          value={aspectRatio}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.aspectRatio = e.target.value as any))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="auto">Automatique</option>
          <option value="16/9">16:9 (Paysage)</option>
          <option value="4/3">4:3 (Standard)</option>
          <option value="3/2">3:2 (Photo)</option>
          <option value="1/1">1:1 (Carré)</option>
          <option value="custom">Personnalisé</option>
        </select>
      </div>

      {/* Height Preset */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Taille prédéfinie
        </label>
        <select
          value={heightPreset}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.heightPreset = e.target.value as any))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="auto">Hauteur automatique</option>
          <option value="small">Petite (192-256px)</option>
          <option value="medium">Moyenne (256-384px)</option>
          <option value="large">Grande (320-640px)</option>
          <option value="xl">Très grande (384-896px)</option>
          <option value="custom">Personnalisée</option>
        </select>
      </div>

      {/* Custom Height */}
      {heightPreset === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hauteur personnalisée
          </label>
          <input
            type="text"
            value={height}
            onChange={(e) => setProp((props: ImageHeroProps) => (props.height = e.target.value))}
            placeholder="400px, 50vh, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Min Height */}
      {heightPreset === 'auto' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hauteur minimale
          </label>
          <input
            type="text"
            value={minHeight}
            onChange={(e) => setProp((props: ImageHeroProps) => (props.minHeight = e.target.value))}
            placeholder="200px"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Max Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hauteur maximale
        </label>
        <input
          type="text"
          value={maxHeight === 'none' ? '' : maxHeight}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.maxHeight = e.target.value || 'none'))}
          placeholder="Laisser vide pour aucune limite"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Object Fit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ajustement de l'image
        </label>
        <select
          value={objectFit}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.objectFit = e.target.value as any))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cover">Couvrir (crop si nécessaire)</option>
          <option value="contain">Contenir (image entière visible)</option>
          <option value="fill">Remplir (déformation possible)</option>
          <option value="scale-down">Réduire si nécessaire</option>
          <option value="none">Taille originale</option>
        </select>
      </div>

      {/* Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Largeur responsive
        </label>
        <div className="space-y-2">
          <select
            value={width}
            onChange={(e) => setProp((props: ImageHeroProps) => (props.width = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="100%">100% (Pleine largeur)</option>
            <option value="75%">75% (Large sur desktop)</option>
            <option value="50%">50% (Moitié sur desktop)</option>
            <option value="25%">25% (Quart sur desktop)</option>
          </select>
        </div>
      </div>

      {/* Horizontal Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alignement horizontal
        </label>
        <select
          value={horizontalAlign}
          onChange={(e) => setProp((props: ImageHeroProps) => (props.horizontalAlign = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">À gauche</option>
          <option value="center">Centré</option>
          <option value="right">À droite</option>
        </select>

        <div className="flex mt-2 space-x-1">
          <button
            type="button"
            className={`flex-1 py-2 px-3 text-sm rounded ${horizontalAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setProp((props: ImageHeroProps) => (props.horizontalAlign = 'left'))}
          >
            ←
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 text-sm rounded ${horizontalAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setProp((props: ImageHeroProps) => (props.horizontalAlign = 'center'))}
          >
            ↔
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 text-sm rounded ${horizontalAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setProp((props: ImageHeroProps) => (props.horizontalAlign = 'right'))}
          >
            →
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-3">Contenu textuel</h3>
        
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

        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            id="overlay"
            checked={overlay}
            onChange={(e) => setProp((props: ImageHeroProps) => (props.overlay = e.target.checked))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="overlay" className="ml-2 block text-sm text-gray-700">
            Overlay sombre sur l'image
          </label>
        </div>

        {overlay && (
          <div className="mt-2">
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
    </div>
  );
};

ImageHero.craft = {
  props: {
    imageUrl: '',
    alt: 'Image hero',
    height: '400px',
    overlay: false,
    overlayOpacity: 30,
    title: '',
    subtitle: '',
    objectFit: 'contain',
    width: '100%',
    horizontalAlign: 'left',
    heightPreset: 'auto',
    maxHeight: 'none',
    aspectRatio: 'auto',
    preserveAspectRatio: true,
    minHeight: '200px',
  },
  related: {
    settings: ImageHeroSettings,
  },
};