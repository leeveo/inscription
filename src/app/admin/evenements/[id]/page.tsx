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
      <div className="min-h-screen flex justify-center items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-red-500/10 via-red-600/10 to-pink-500/10 border border-red-400/30 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-pink-400/5 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-300">Erreur!</h3>
                <p className="text-red-200/80 mt-1">{error}</p>
              </div>
            </div>
            <Link
              href="/admin/evenements"
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 font-medium rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!evenement) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 via-orange-600/10 to-amber-500/10 border border-yellow-400/30 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-300">Événement introuvable!</h3>
                <p className="text-yellow-200/80 mt-1">L'événement avec l'ID {eventId} n'existe pas.</p>
              </div>
            </div>
            <Link
              href="/admin/evenements"
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-200 font-medium rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* En-tête avec boutons d'action */}
      <div className="mb-8">
        <Link
          href="/admin/evenements"
          className="group inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-all duration-300"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Retour à la liste des événements</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {evenement.nom}
            </h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg">{evenement.lieu}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/evenements/${evenement.id}/edit`}
              className="group inline-flex items-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier l'événement
            </Link>
            <Link
              href={`/inscription/${evenement.id}`}
              className="group inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              target="_blank"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Page d'inscription
            </Link>
          </div>
        </div>
      </div>

      {/* Détails de l'événement */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Informations générales */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b-2 border-blue-600">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Informations générales</h2>
              </div>

              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nom de l'événement</label>
                  <p className="text-xl font-semibold text-gray-900">{evenement.nom}</p>
                </div>

                <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Lieu</label>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-lg text-gray-800 mt-1">{evenement.lieu}</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Description</label>
                  <div
                    className="text-gray-700 whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: evenement.description }}
                  />
                </div>
              </div>
            </div>

            {/* Dates et horaires */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b-2 border-indigo-600">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Dates et horaires</h2>
              </div>

              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-green-50 border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300">
                  <label className="block text-xs font-bold text-green-700 mb-3 uppercase tracking-wider">Date de début</label>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatDate(evenement.date_debut)}</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-orange-50 border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all duration-300">
                  <label className="block text-xs font-bold text-orange-700 mb-3 uppercase tracking-wider">Date de fin</label>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{formatDate(evenement.date_fin)}</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Créé le</label>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base text-gray-600">{formatDate(evenement.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ID de l'événement */}
          <div className="mt-10 pt-8 border-t-2 border-gray-200">
            <div className="flex items-center space-x-4 p-5 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wider">Identifiant unique</label>
                <p className="text-sm text-gray-800 font-mono bg-white px-4 py-2 rounded-lg border border-indigo-200 inline-block">{evenement.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
