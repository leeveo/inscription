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
  organisateur: string
  email_contact: string
  telephone_contact?: string
  places_disponibles?: number
  type_evenement: string
  statut: string
  code_acces?: string
  evenement_payant: boolean
  prix: number
  logo_url?: string
  type_localisation: string
  email_template: string
  email_subject: string
  couleur_header_email: string
  created_at: string
  updated_at?: string
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<string>('');
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données spécifiques au salon
  const [exposants, setExposants] = useState<any[]>([]);
  const [intervenants, setIntervenants] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [salonConfig, setSalonConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fonction pour charger toutes les données du salon
  const fetchSalonData = async (eventId: string) => {
    const supabase = supabaseBrowser();

    try {
      // Charger les exposants
      const { data: exposantsData } = await supabase
        .from('salon_exposants')
        .select('*')
        .eq('evenement_id', eventId)
        .order('created_at', { ascending: false });

      setExposants(exposantsData || []);

      // Charger les intervenants
      const { data: intervenantsData } = await supabase
        .from('salon_intervenants')
        .select('*')
        .eq('evenement_id', eventId)
        .order('created_at', { ascending: false });

      setIntervenants(intervenantsData || []);

      // Charger les sessions
      const { data: sessionsData } = await supabase
        .from('inscription_sessions')
        .select('*')
        .eq('evenement_id', eventId)
        .order('date', { ascending: true });

      setSessions(sessionsData || []);

      // Charger les participants
      const { data: participantsData } = await supabase
        .from('inscription_participants')
        .select('*')
        .eq('evenement_id', eventId)
        .order('created_at', { ascending: false });

      setParticipants(participantsData || []);

      // Charger la configuration du salon
      const { data: configData } = await supabase
        .from('salon_configurations')
        .select('*')
        .eq('evenement_id', eventId)
        .single();

      setSalonConfig(configData);

    } catch (error) {
      console.error('Erreur lors du chargement des données du salon:', error);
    }
  };

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
        
        if (!data) {
          throw new Error('Aucun événement trouvé avec cet identifiant');
        }
        
        const eventData = data as Evenement;
        setEvenement(eventData);

        // Si c'est un salon, charger les données associées
        if (eventData.type_evenement === 'salon') {
          await fetchSalonData(eventId);
        }
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
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">
                {evenement.nom}
              </h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                evenement.type_evenement === 'salon'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {evenement.type_evenement === 'salon' ? 'SALON' : evenement.type_evenement?.toUpperCase()}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                evenement.statut === 'publié'
                  ? 'bg-green-100 text-green-800'
                  : evenement.statut === 'brouillon'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {evenement.statut?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg">{evenement.lieu}</span>
              </div>
              {evenement.evenement_payant && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2zm0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-semibold text-green-600">{evenement.prix}€</span>
                </div>
              )}
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
            {evenement.evenement_payant && (
              <Link
                href={`/admin/evenements/${evenement.id}/billetterie`}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2zm0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Billetterie
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            {evenement.type_evenement === 'salon' && (
              <>
                <button
                  onClick={() => setActiveTab('exposants')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'exposants'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Exposants ({exposants.length})
                </button>
                <button
                  onClick={() => setActiveTab('intervenants')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'intervenants'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Intervenants ({intervenants.length})
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sessions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Sessions ({sessions.length})
                </button>
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'participants'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Participants ({participants.length})
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'config'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Configuration
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {/* Onglet Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Organisateur</label>
                      <p className="text-lg font-semibold text-gray-900">{evenement.organisateur}</p>
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

                    {evenement.description && (
                      <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                        <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Description</label>
                        <div
                          className="text-gray-700 whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: evenement.description }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates et tarifs */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b-2 border-indigo-600">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Dates et tarifs</h2>
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

                    <div className="p-5 rounded-xl bg-purple-50 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                      <label className="block text-xs font-bold text-purple-700 mb-2 uppercase tracking-wider">Type de localisation</label>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{evenement.type_localisation}</p>
                    </div>

                    {evenement.places_disponibles && (
                      <div className="p-5 rounded-xl bg-blue-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                        <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider">Places disponibles</label>
                        <p className="text-lg font-semibold text-gray-900">{evenement.places_disponibles}</p>
                      </div>
                    )}

                    {evenement.evenement_payant && (
                      <div className="p-5 rounded-xl bg-green-50 border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-300">
                        <label className="block text-xs font-bold text-green-700 mb-3 uppercase tracking-wider">Prix d'entrée</label>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2zm0 8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-xl font-bold text-green-600">{evenement.prix}€</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact et configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b-2 border-teal-600">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email de contact</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-lg text-gray-800">{evenement.email_contact}</p>
                      </div>
                    </div>

                    {evenement.telephone_contact && (
                      <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Téléphone</label>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <p className="text-lg text-gray-800">{evenement.telephone_contact}</p>
                        </div>
                      </div>
                    )}

                    {evenement.code_acces && (
                      <div className="p-5 rounded-xl bg-yellow-50 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-md transition-all duration-300">
                        <label className="block text-xs font-bold text-yellow-700 mb-2 uppercase tracking-wider">Code d'accès</label>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <p className="text-lg font-mono font-bold text-yellow-800">{evenement.code_acces}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b-2 border-pink-600">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Template email</label>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{evenement.email_template}</p>
                    </div>

                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Couleur en-tête email</label>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-gray-300"
                          style={{ backgroundColor: evenement.couleur_header_email }}
                        ></div>
                        <p className="text-lg font-mono text-gray-800">{evenement.couleur_header_email}</p>
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
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
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
          )}

          {/* Onglet Exposants (uniquement pour les salons) */}
          {activeTab === 'exposants' && evenement.type_evenement === 'salon' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Exposants ({exposants.length})</h2>
                <Link
                  href={`/admin/evenements/${evenement.id}/exposants/new`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter un exposant
                </Link>
              </div>

              {exposants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun exposant</h3>
                  <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des exposants à votre salon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exposants.map((exposant) => (
                    <div key={exposant.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{exposant.entreprise_exposante}</h3>
                      <p className="text-sm text-gray-600 mb-1">Stand: {exposant.numero_stand}</p>
                      <p className="text-sm text-gray-600 mb-1">{exposant.nom_contact} {exposant.prenom_contact}</p>
                      <p className="text-sm text-gray-600 mb-1">{exposant.email_contact}</p>
                      {exposant.secteur_activite && (
                        <p className="text-sm text-gray-500 mb-2">Secteur: {exposant.secteur_activite}</p>
                      )}
                      {exposant.description_entreprise && (
                        <p className="text-sm text-gray-700 line-clamp-3">{exposant.description_entreprise}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Intervenants */}
          {activeTab === 'intervenants' && evenement.type_evenement === 'salon' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Intervenants ({intervenants.length})</h2>
                <Link
                  href={`/admin/evenements/${evenement.id}/intervenants/new`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter un intervenant
                </Link>
              </div>

              {intervenants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun intervenant</h3>
                  <p className="mt-1 text-sm text-gray-500">Ajoutez des intervenants pour animer votre salon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {intervenants.map((intervenant) => (
                    <div key={intervenant.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{intervenant.prenom} {intervenant.nom}</h3>
                      {intervenant.entreprise && (
                        <p className="text-sm text-gray-600 mb-1">{intervenant.entreprise}</p>
                      )}
                      {intervenant.poste && (
                        <p className="text-sm text-gray-600 mb-1">{intervenant.poste}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-1">{intervenant.email}</p>
                      {intervenant.bio && (
                        <p className="text-sm text-gray-700 line-clamp-3 mt-2">{intervenant.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Sessions */}
          {activeTab === 'sessions' && evenement.type_evenement === 'salon' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Sessions ({sessions.length})</h2>
                <Link
                  href={`/admin/evenements/${evenement.id}/sessions/new`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter une session
                </Link>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune session</h3>
                  <p className="mt-1 text-sm text-gray-500">Planifiez des sessions pour votre salon.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.titre}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                            <span>{session.heure_debut} - {session.heure_fin}</span>
                            {session.lieu && <span>{session.lieu}</span>}
                            {session.type && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{session.type}</span>}
                          </div>
                          {session.description && (
                            <p className="text-sm text-gray-700 mt-2">{session.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Participants */}
          {activeTab === 'participants' && evenement.type_evenement === 'salon' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Participants ({participants.length})</h2>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/evenements/${evenement.id}/participants/new`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter un participant
                  </Link>
                  <Link
                    href={`/admin/evenements/${evenement.id}/participants/import`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Importer CSV
                  </Link>
                </div>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun participant</h3>
                  <p className="mt-1 text-sm text-gray-500">Les participants inscrits apparaîtront ici.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Nom</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Entreprise</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Statut</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Date d'inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            {participant.prenom} {participant.nom}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">{participant.email}</td>
                          <td className="border border-gray-200 px-4 py-2">{participant.entreprise || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              participant.participant_type === 'visiteur'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {participant.participant_type === 'visiteur' ? 'Visiteur' : 'Personnel exposant'}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              participant.checked_in
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {participant.checked_in ? 'Présent' : 'Non présent'}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            {participant.date_inscription ? formatDate(participant.date_inscription) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Onglet Configuration */}
          {activeTab === 'config' && evenement.type_evenement === 'salon' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Configuration du salon</h2>

              {salonConfig ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration du check-in</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type de check-in</label>
                          <p className="text-gray-900 capitalize">{salonConfig.checkin_type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Template de badge</label>
                          <p className="text-gray-900 capitalize">{salonConfig.badge_template}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration emails</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Template d'invitation</label>
                          <p className="text-gray-900">{salonConfig.invitation_email_template}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Objet de l'email</label>
                          <p className="text-gray-900">{salonConfig.email_subject}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Couleur d'en-tête</label>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: salonConfig.couleur_header_email }}
                            ></div>
                            <p className="text-gray-900">{salonConfig.couleur_header_email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Configuration non définie</h3>
                  <p className="mt-1 text-sm text-gray-500">La configuration spécifique au salon n'a pas été paramétrée.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
