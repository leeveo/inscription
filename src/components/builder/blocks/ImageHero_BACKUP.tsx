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
    console.log('Image uploaded successfully:', url);

    actions.setProp((props: ImageHeroProps) => {
      props.imageUrl = url;
      props.alt = 'Image hero';
    });
  };

  // Fonction pour obtenir les classes de hauteur responsives anti-crop
  const getHeightClasses = (preset: string, customHeight?: string) => {
    switch (preset) {
      case 'small':
        return preserveAspectRatio ? 'min-h-48 sm:min-h-56 md:min-h-64' : 'h-48 sm:h-56 md:h-64';
      case 'medium':
        return preserveAspectRatio ? 'min-h-64 sm:min-h-72 md:min-h-80 lg:min-h-96' : 'h-64 sm:h-72 md:h-80 lg:h-96';
      case 'large':
        return preserveAspectRatio ? 'min-h-80 sm:min-h-96 md:min-h-[400px] lg:min-h-[500px]' : 'h-80 sm:h-96 md:h-[400px] lg:h-[500px]';
      case 'xl':
        return preserveAspectRatio ? 'min-h-96 sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px]' : 'h-96 sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]';
      case 'auto':
        return 'min-h-[200px]'; // Hauteur minimale, s'adapte au contenu
      case 'custom':
        return '';
      default:
        return preserveAspectRatio ? 'min-h-64 sm:min-h-72 md:min-h-80 lg:min-h-96' : 'h-64 sm:h-72 md:h-80 lg:h-96';
    }
  };

  // Fonction pour obtenir les classes d'aspect ratio
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

  // Fonction pour obtenir le style d'alignement horizontal
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

  // Fonction pour obtenir les classes de largeur responsives
  const getWidthClasses = (width: string) => {
    switch (width) {
      case '100%':
        return 'w-full';
      case '75%':
        return 'w-full lg:w-3/4';
      case '66.66%':
        return 'w-full md:w-2/3';
      case '50%':
        return 'w-full sm:w-1/2';
      case '33.33%':
        return 'w-full sm:w-1/3';
      case '25%':
        return 'w-full sm:w-1/4';
      default:
        return 'w-full';
    }
  };

  const heightClasses = getHeightClasses(heightPreset, height);
  const aspectRatioClasses = getAspectRatioClasses(aspectRatio);
  const alignmentClasses = getHorizontalAlignStyle(horizontalAlign);
  const widthClasses = width?.includes('%') ? getWidthClasses(width) : '';
  
  // Styles personnalisés
  const customHeightStyle = heightPreset === 'custom' ? { height } : {};
  const customWidthStyle = width !== '100%' && !width?.includes('%') ? { width } : {};
  const maxHeightStyle = maxHeight !== 'none' ? { maxHeight } : {};
  const minHeightStyle = minHeight ? { minHeight } : {};
  
  // Logique pour éviter le cropping
  const shouldUseFlexibleHeight = heightPreset === 'auto' || preserveAspectRatio;
  const containerClasses = aspectRatio !== 'auto' && aspectRatio !== 'custom' ? aspectRatioClasses : heightClasses;

  // Debug pour vérifier que les images s'affichent
  console.log('🖼️ ImageHero Debug:', {
    isEditing,
    imageUrl: imageUrl ? 'PRÉSENT' : 'ABSENT',
    shouldUseFlexibleHeight,
    preserveAspectRatio,
  });

  return (
    <div
      ref={isEditing ? (ref) => {
        if (ref) {
          connect(drag(ref));
        }
      } : undefined}
      className={`relative my-4 ${containerClasses} ${widthClasses} ${alignmentClasses} ${shouldUseFlexibleHeight ? 'flex flex-col' : ''} overflow-hidden rounded-lg bg-white`}
      style={{
        border: isEditing && (selected || hovered) ? '2px dashed #3B82F6' : 'none',
        ...customHeightStyle,
        ...customWidthStyle,
        ...maxHeightStyle,
        ...minHeightStyle,
      }}
      data-debug-imagehero={imageUrl ? 'has-image' : 'no-image'}
      data-debug-mode={isEditing ? 'editing' : 'preview'}
    >
      {/* Selection Indicator - only show when editor is enabled */}
      {isEditing && (selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-b">
          Image Hero {selected && '• Sélectionné'}
        </div>
      )}

      {/* Gestion du mode édition vs preview */}
      {isEditing ? (
        // MODE ÉDITION : Preview + Upload overlay
        <div className="h-full w-full relative">
          {imageUrl ? (
            // Si image existe : montrer preview avec overlay d'édition
            <>
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay des textes en mode preview */}
              {overlay && (
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}
              
              {/* Text Overlay en mode preview */}
              {(title || subtitle) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white pointer-events-none">
                  <div className="max-w-4xl mx-auto text-center">
                    {title && (
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-center drop-shadow-lg leading-tight">
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-center drop-shadow-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Overlay d'édition au survol */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center group">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ImageUpload
                    currentImageUrl={imageUrl}
                    onImageUploaded={handleImageUploaded}
                    className="w-32 h-10 text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            // Si pas d'image : zone d'upload classique
            <div className="h-full w-full bg-gray-50 flex items-center justify-center">
              <ImageUpload
                currentImageUrl={imageUrl}
                onImageUploaded={handleImageUploaded}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      ) : (
        // MODE PREVIEW/PUBLIC : Afficher l'image ou placeholder
        <>
          {!imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Image Hero</p>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Image Display - Seulement en mode PREVIEW/PUBLIC */}
      {!isEditing && imageUrl && (
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

      {/* Mode d'affichage anti-crop */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">🚫 Mode anti-crop</h4>

        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preserveAspectRatio || false}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.preserveAspectRatio = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Préserver l'image complète (anti-crop)</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              Empêche le découpage de l'image. L'image s'affiche entièrement mais peut laisser des espaces vides.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ratio d'aspect
            </label>
            <select
              value={aspectRatio || 'auto'}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.aspectRatio = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
            >
              <option value="auto">🔄 Automatique (s'adapte à l'image)</option>
              <option value="16/9">📺 16:9 (format vidéo)</option>
              <option value="4/3">🖼️ 4:3 (format photo classique)</option>
              <option value="3/2">📷 3:2 (format photo DSLR)</option>
              <option value="1/1">⬜ 1:1 (format carré)</option>
            </select>
            <p className="text-xs text-gray-500">
              Le ratio automatique s'adapte parfaitement à votre image
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de hauteur
            </label>
            <select
              value={heightPreset || 'auto'}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.heightPreset = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
            >
              <option value="auto">🎯 Auto (hauteur parfaite, pas de crop)</option>
              <option value="small">📱 Petite (responsive 48-64px)</option>
              <option value="medium">💻 Moyenne (responsive 64-96px)</option>
              <option value="large">🖥️ Grande (responsive 80-500px)</option>
              <option value="xl">📱 Très grande (responsive 96-700px)</option>
              <option value="custom">⚙️ Personnalisée</option>
            </select>
            
            {heightPreset === 'custom' && (
              <input
                type="text"
                value={height || '400px'}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.height = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="400px, 50vh, 300px, etc."
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hauteur min
              </label>
              <input
                type="text"
                value={minHeight || '200px'}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.minHeight = e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="200px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hauteur max
              </label>
              <input
                type="text"
                value={maxHeight || ''}
                onChange={(e) => setProp((props: ImageHeroProps) => (props.maxHeight = e.target.value || 'none'))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajustement de l'image
            </label>
            <select
              value={objectFit || 'contain'}
              onChange={(e) => setProp((props: ImageHeroProps) => (props.objectFit = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={preserveAspectRatio}
            >
              <option value="contain">🔒 Contain (pas de crop, image entière visible)</option>
              <option value="cover">✂️ Cover (remplit mais peut couper)</option>
              <option value="fill">↔️ Fill (étirer, peut déformer)</option>
              <option value="scale-down">⬇️ Scale-down (réduit si nécessaire)</option>
              <option value="none">📐 None (taille originale)</option>
            </select>
            {preserveAspectRatio && (
              <p className="text-xs text-yellow-600 mt-1">
                ℹ️ Désactivé en mode anti-crop (utilise automatiquement "contain")
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              <strong>Contain</strong> = image entière visible, pas de crop
            </p>
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
    objectFit: 'contain', // Pas de crop par défaut
    width: '100%',
    horizontalAlign: 'left',
    heightPreset: 'auto', // Hauteur automatique par défaut
    maxHeight: 'none',
    aspectRatio: 'auto', // Ratio automatique par défaut
    preserveAspectRatio: true, // Mode anti-crop activé par défaut
    minHeight: '200px',
  },
  related: {
    settings: ImageHeroSettings,
  },
};