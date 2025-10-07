'use client'

import React, { useEffect, useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { useEventData } from '@/contexts/EventDataContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { DataBinding } from '@/types/builder';
import { FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { EventDetailsSettings } from './EventDetailsSettings';

interface EventDetailsBlockProps {
  title?: string;
  showLogo?: boolean;
  showDescription?: boolean;
  showDates?: boolean;
  showLocation?: boolean;
  showPrice?: boolean;
  showOrganizer?: boolean;
  showContact?: boolean;
  showAvailableSeats?: boolean;
  layout?: 'card' | 'sidebar' | 'full';
  dataBinding?: DataBinding;
}

export const EventDetails = ({
  title = "À propos de l'événement",
  showLogo = true,
  showDescription = true,
  showDates = true,
  showLocation = true,
  showPrice = true,
  showOrganizer = true,
  showContact = true,
  showAvailableSeats = true,
  layout = 'card',
  dataBinding,
}: EventDetailsBlockProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const { eventData } = useEventData();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Priority 1: Use eventData if available
    if (eventData?.event) {
      console.log('EventDetails block - Using eventData.event:', eventData.event);
      setEvent(eventData.event);
      return;
    }

    // Priority 2: Use dataBinding if configured
    if (dataBinding?.table === 'inscription_evenements') {
      setLoading(true);

      const supabase = supabaseBrowser();
      let query = supabase.from(dataBinding.table).select(dataBinding.select.join(','));

      // Apply WHERE clauses
      dataBinding.where?.forEach(clause => {
        query = query[clause.operator](clause.column, clause.value);
      });

      // Apply ORDER BY
      dataBinding.orderBy?.forEach(order => {
        query = query.order(order.column, { ascending: order.ascending });
      });

      // Apply LIMIT
      if (dataBinding.limit) {
        query = query.limit(dataBinding.limit);
      }

      query.single().then(({ data, error }) => {
        if (error) {
          console.error('Error loading event via dataBinding:', error);
        } else {
          setEvent(data);
        }
        setLoading(false);
      }).catch(error => {
        console.error('Error in dataBinding query:', error);
        setLoading(false);
      });
    }
  }, [dataBinding, eventData]);

  if (loading) {
    return (
      <div ref={(ref) => ref && connect(drag(ref))} className="w-full p-8 text-center">
        <div className="animate-pulse">Chargement des détails de l'événement...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div 
        ref={(ref) => ref && connect(drag(ref))} 
        className={`w-full p-8 rounded-lg text-center ${
          enabled ? 'border-2 border-dashed border-gray-300' : 'border-none'
        }`}
      >
        <p className="text-gray-500">Détails de l'événement</p>
        <p className="text-sm text-gray-400 mt-2">Liez ce bloc aux données pour afficher les informations</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {showLogo && event.logo_url && (
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <img
            src={event.logo_url}
            alt={event.nom || event.title}
            className="max-h-32 max-w-xs object-contain"
          />
        </div>
      )}

      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {event.nom || event.title}
          </h2>
          {event.type_evenement && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {event.type_evenement}
            </span>
          )}
        </div>

        {showDescription && event.description && (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showDates && (event.date_debut || event.startDate) && (
            <div className="flex items-start gap-3">
              <FiCalendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date de début</p>
                <p className="text-sm text-gray-600">
                  {formatDate(event.date_debut || event.startDate)}
                </p>
              </div>
            </div>
          )}

          {showDates && (event.date_fin || event.endDate) && (
            <div className="flex items-start gap-3">
              <FiCalendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date de fin</p>
                <p className="text-sm text-gray-600">
                  {formatDate(event.date_fin || event.endDate)}
                </p>
              </div>
            </div>
          )}

          {showLocation && (event.lieu || event.location) && (
            <div className="flex items-start gap-3">
              <FiMapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Lieu</p>
                <p className="text-sm text-gray-600">{event.lieu || event.location}</p>
              </div>
            </div>
          )}

          {showPrice && event.prix !== null && event.prix !== undefined && (
            <div className="flex items-start gap-3">
              <FiDollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Prix</p>
                <p className="text-sm text-gray-600">
                  {event.prix === 0 ? 'Gratuit' : `${event.prix} €`}
                </p>
              </div>
            </div>
          )}

          {showAvailableSeats && (event.places_disponibles || event.availableSeats) && (
            <div className="flex items-start gap-3">
              <FiUsers className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Places disponibles</p>
                <p className="text-sm text-gray-600">
                  {event.places_disponibles || event.availableSeats}
                </p>
              </div>
            </div>
          )}

          {showOrganizer && (event.organisateur || event.organizer) && (
            <div className="flex items-start gap-3">
              <FiUser className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Organisateur</p>
                <p className="text-sm text-gray-600">
                  {event.organisateur || event.organizer}
                </p>
              </div>
            </div>
          )}

          {showContact && (event.email_contact || event.contactEmail) && (
            <div className="flex items-start gap-3">
              <FiMail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">
                  {event.email_contact || event.contactEmail}
                </p>
              </div>
            </div>
          )}

          {showContact && (event.telephone_contact || event.contactPhone) && (
            <div className="flex items-start gap-3">
              <FiPhone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Téléphone</p>
                <p className="text-sm text-gray-600">
                  {event.telephone_contact || event.contactPhone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      {showLogo && event.logo_url && (
        <img
          src={event.logo_url}
          alt={event.nom || event.title}
          className="w-full h-auto rounded-lg"
        />
      )}

      <h3 className="text-xl font-bold text-gray-900">
        {event.nom || event.title}
      </h3>

      <div className="space-y-3">
        {showDates && (event.date_debut || event.startDate) && (
          <div className="flex items-center gap-2 text-sm">
            <FiCalendar className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">
              {formatDate(event.date_debut || event.startDate)}
            </span>
          </div>
        )}

        {showLocation && (event.lieu || event.location) && (
          <div className="flex items-center gap-2 text-sm">
            <FiMapPin className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">{event.lieu || event.location}</span>
          </div>
        )}

        {showPrice && event.prix !== null && event.prix !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <FiDollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">
              {event.prix === 0 ? 'Gratuit' : `${event.prix} €`}
            </span>
          </div>
        )}
      </div>

      {showDescription && event.description && (
        <div
          className="prose prose-sm max-w-none text-gray-600 text-sm"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      )}
    </div>
  );

  const renderFull = () => (
    <div className="w-full space-y-8">
      {showLogo && event.logo_url && (
        <div className="text-center">
          <img
            src={event.logo_url}
            alt={event.nom || event.title}
            className="mx-auto max-h-32 w-auto"
          />
        </div>
      )}

      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {event.nom || event.title}
        </h1>
        {event.type_evenement && (
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {event.type_evenement}
          </span>
        )}
      </div>

      {showDescription && event.description && (
        <div
          className="prose prose-lg max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {showDates && (event.date_debut || event.startDate) && (
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <FiCalendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Date</p>
            <p className="text-sm text-gray-600">
              {new Date(event.date_debut || event.startDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        {showLocation && (event.lieu || event.location) && (
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <FiMapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Lieu</p>
            <p className="text-sm text-gray-600">{event.lieu || event.location}</p>
          </div>
        )}

        {showPrice && event.prix !== null && event.prix !== undefined && (
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <FiDollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Prix</p>
            <p className="text-sm text-gray-600">
              {event.prix === 0 ? 'Gratuit' : `${event.prix} €`}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={(ref) => ref && connect(drag(ref))} className="w-full">
      {layout === 'card' && renderCard()}
      {layout === 'sidebar' && renderSidebar()}
      {layout === 'full' && renderFull()}
    </div>
  );
};

EventDetails.craft = {
  displayName: 'Détails événement',
  props: {
    title: "À propos de l'événement",
    showLogo: true,
    showDescription: true,
    showDates: true,
    showLocation: true,
    showPrice: true,
    showOrganizer: true,
    showContact: true,
    showAvailableSeats: true,
    layout: 'card',
  },
  related: {
    settings: EventDetailsSettings,
  },
};
