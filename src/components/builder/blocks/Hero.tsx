'use client'

import React from 'react';
import { useNode } from '@craftjs/core';
import type { HeroBlockProps } from '@/types/builder';

export const Hero = ({
  title = 'Titre de votre événement',
  subtitle = 'Une expérience inoubliable vous attend',
  backgroundImage = '',
  ctaText = 'S\'inscrire maintenant',
  ctaLink = '#inscription',
  alignment = 'center',
  height = 'large',
  overlay = true,
  overlayOpacity = 50,
}: HeroBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }));

  const heightClasses = {
    small: 'h-64',
    medium: 'h-96',
    large: 'h-[500px]',
    fullscreen: 'h-screen',
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={`relative w-full ${heightClasses[height]} overflow-hidden`}
      style={{
        border: selected || hovered ? '2px solid #3B82F6' : '2px solid transparent',
      }}
    >
      {/* Selection Indicator */}
      {(selected || hovered) && (
        <div className="absolute top-0 left-0 z-50 px-3 py-1 bg-blue-600 text-white text-xs font-medium">
          Hero {selected && '• Sélectionné'}
        </div>
      )}

      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-16 ${alignmentClasses[alignment]}`}>
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-2xl text-white/90 mb-8">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <a
              href={ctaLink}
              className="inline-block px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>

      {/* Default background if no image */}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
      )}
    </div>
  );
};

// Settings component
export const HeroSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    backgroundImage,
    ctaText,
    ctaLink,
    alignment,
    height,
    overlay,
    overlayOpacity,
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    backgroundImage: node.data.props.backgroundImage,
    ctaText: node.data.props.ctaText,
    ctaLink: node.data.props.ctaLink,
    alignment: node.data.props.alignment,
    height: node.data.props.height,
    overlay: node.data.props.overlay,
    overlayOpacity: node.data.props.overlayOpacity,
  }));

  return (
    <div className="space-y-4">
      {/* Content Tab */}
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
              onChange={(e) => setProp((props: HeroBlockProps) => (props.title = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sous-titre
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setProp((props: HeroBlockProps) => (props.subtitle = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setProp((props: HeroBlockProps) => (props.ctaText = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien du bouton
            </label>
            <input
              type="text"
              value={ctaLink}
              onChange={(e) => setProp((props: HeroBlockProps) => (props.ctaLink = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#inscription"
            />
          </div>
        </div>
      </div>

      {/* Layout Tab */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Mise en page</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hauteur
            </label>
            <select
              value={height}
              onChange={(e) => setProp((props: HeroBlockProps) => (props.height = e.target.value as any))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
              <option value="fullscreen">Plein écran</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setProp((props: HeroBlockProps) => (props.alignment = align))}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                    alignment === align
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {align === 'left' && 'Gauche'}
                  {align === 'center' && 'Centre'}
                  {align === 'right' && 'Droite'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Tab */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Apparence</h4>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image de fond (URL)
            </label>
            <input
              type="text"
              value={backgroundImage}
              onChange={(e) => setProp((props: HeroBlockProps) => (props.backgroundImage = e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={overlay}
                onChange={(e) => setProp((props: HeroBlockProps) => (props.overlay = e.target.checked))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Overlay sombre
              </span>
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
                onChange={(e) => setProp((props: HeroBlockProps) => (props.overlayOpacity = parseInt(e.target.value)))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Hero.craft = {
  displayName: 'Hero',
  props: {
    title: 'Titre de votre événement',
    subtitle: 'Une expérience inoubliable vous attend',
    backgroundImage: '',
    ctaText: 'S\'inscrire maintenant',
    ctaLink: '#inscription',
    alignment: 'center',
    height: 'large',
    overlay: true,
    overlayOpacity: 50,
  },
  related: {
    settings: HeroSettings,
  },
};
