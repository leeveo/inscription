'use client'

import React from 'react';
import { useNode } from '@craftjs/core';

export const EventDetailsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Disposition</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={props.layout === 'card'}
              onChange={() => setProp((props: any) => (props.layout = 'card'))}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Carte</span>
              <p className="text-xs text-gray-500">Affichage en carte avec toutes les infos</p>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={props.layout === 'sidebar'}
              onChange={() => setProp((props: any) => (props.layout = 'sidebar'))}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Barre latérale</span>
              <p className="text-xs text-gray-500">Format compact pour sidebar</p>
            </div>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={props.layout === 'full'}
              onChange={() => setProp((props: any) => (props.layout = 'full'))}
              className="text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Pleine largeur</span>
              <p className="text-xs text-gray-500">Grande mise en page centrée</p>
            </div>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Éléments à afficher</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showLogo}
              onChange={(e) => setProp((props: any) => (props.showLogo = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher le logo</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showDescription}
              onChange={(e) => setProp((props: any) => (props.showDescription = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher la description</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showDates}
              onChange={(e) => setProp((props: any) => (props.showDates = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les dates</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showLocation}
              onChange={(e) => setProp((props: any) => (props.showLocation = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher le lieu</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showPrice}
              onChange={(e) => setProp((props: any) => (props.showPrice = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher le prix</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showOrganizer}
              onChange={(e) => setProp((props: any) => (props.showOrganizer = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher l'organisateur</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showContact}
              onChange={(e) => setProp((props: any) => (props.showContact = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les contacts</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={props.showAvailableSeats}
              onChange={(e) => setProp((props: any) => (props.showAvailableSeats = e.target.checked))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Afficher les places disponibles</span>
          </label>
        </div>
      </div>
    </div>
  );
};
