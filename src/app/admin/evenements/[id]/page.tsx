'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';

// Type pour les événements
type Evenement = {
  id: string
  nom: string
  description: string
  lieu: string
  date_debut: string
  date_fin: string
  created_at: string
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<string>('');
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvenement = async () => {
      try {
        setIsLoading(true);
        const supabase = supabaseBrowser();
        
        console.log('Fetching event with ID:', eventId);
        const { data, error } = await supabase
          .from('inscription_evenements')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Event fetched successfully:', data);
        setEvenement(data as Evenement);
      } catch (err: Error | unknown) {
        console.error('Erreur lors du chargement de l\'événement:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement de l\'événement');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvenement();
  }, [eventId]);

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Link 
          href="/admin/evenements" 
          className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  if (!evenement) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Événement introuvable!</strong>
          <span className="block sm:inline"> L'événement avec l'ID {eventId} n'existe pas.</span>
        </div>
        <Link 
          href="/admin/evenements" 
          className="mt-4 inline-block px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* En-tête avec boutons d'action */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link 
            href="/admin/evenements" 
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Retour à la liste des événements
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{evenement.nom}</h1>
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/admin/evenements/${evenement.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Modifier
          </Link>
          <Link 
            href={`/inscription/${evenement.id}`}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            target="_blank"
          >
            Voir page d'inscription
          </Link>
        </div>
      </div>

      {/* Détails de l'événement */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations générales */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom de l'événement</label>
                  <p className="mt-1 text-lg text-gray-900">{evenement.nom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Lieu</label>
                  <p className="mt-1 text-lg text-gray-900">{evenement.lieu}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{evenement.description}</p>
                </div>
              </div>
            </div>

            {/* Dates et horaires */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dates et horaires</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date de début</label>
                  <p className="mt-1 text-lg text-gray-900">{formatDate(evenement.date_debut)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date de fin</label>
                  <p className="mt-1 text-lg text-gray-900">{formatDate(evenement.date_fin)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Créé le</label>
                  <p className="mt-1 text-sm text-gray-600">{formatDate(evenement.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ID de l'événement */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-500">ID de l'événement</label>
            <p className="mt-1 text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded">{evenement.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
