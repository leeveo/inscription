'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Session = {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  intervenant?: string;
  lieu?: string;
  max_participants?: number | null;
  participant_count: number;
};

interface FullAgendaModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FullAgendaModal({ eventId, isOpen, onClose }: FullAgendaModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  useEffect(() => {
    if (isOpen && eventId) {
      fetchSessions();
    }
  }, [isOpen, eventId]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const supabase = supabaseBrowser();

      const { data, error } = await supabase
        .from('inscription_sessions')
        .select('*')
        .eq('evenement_id', eventId)
        .order('date')
        .order('heure_debut');

      if (error) throw error;

      const sessionsWithParticipants = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from('inscription_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            participant_count: count || 0,
          };
        })
      );

      setSessions(sessionsWithParticipants as Session[]);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  };

  const getSessionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conférence': return 'bg-blue-500 border-blue-600';
      case 'atelier': return 'bg-green-500 border-green-600';
      case 'pause': return 'bg-gray-500 border-gray-600';
      case 'networking': return 'bg-purple-500 border-purple-600';
      default: return 'bg-indigo-500 border-indigo-600';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conférence':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'atelier':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'networking':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // Grouper les sessions par date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 left-8 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-4 right-12 w-12 h-12 bg-cyan-300/20 rounded-full blur-lg animate-pulse delay-150"></div>
            <div className="absolute bottom-2 left-16 w-20 h-20 bg-purple-300/20 rounded-full blur-2xl animate-pulse delay-300"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between p-6 h-full">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Agenda Complet</h2>
                <p className="text-blue-100">Vue d'ensemble de toutes les sessions</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md 
                       border border-white/30 flex items-center justify-center transition-all duration-200
                       hover:scale-110 shadow-lg"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'timeline'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Timeline</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Grille</span>
                </div>
              </button>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} au total
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={fetchSessions}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Réessayer
                </button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Aucune session programmée</p>
              </div>
            ) : viewMode === 'timeline' ? (
              // Timeline View
              <div className="space-y-8">
                {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
                  <div key={date} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-4">
                      {dateSessions
                        .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
                        .map((session) => (
                        <div key={session.id} className={`relative overflow-hidden rounded-xl p-4 text-white ${getSessionTypeColor(session.type)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {getSessionTypeIcon(session.type)}
                                <h4 className="font-bold text-lg">{session.titre}</h4>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                  {session.type}
                                </span>
                              </div>
                              <p className="text-white/90 mb-3">{session.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-white/80">
                                <span>⏰ {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}</span>
                                {session.lieu && <span>📍 {session.lieu}</span>}
                                {session.intervenant && <span>👤 {session.intervenant}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                <div className="text-2xl font-bold">{session.participant_count}</div>
                                <div className="text-sm text-white/80">
                                  {session.max_participants ? `/ ${session.max_participants}` : 'illimité'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${getSessionTypeColor(session.type)}`}>
                        {getSessionTypeIcon(session.type)}
                      </div>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {session.type}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{session.titre}</h4>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(session.date)}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                      </div>
                      {session.lieu && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {session.lieu}
                        </div>
                      )}
                      {session.intervenant && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {session.intervenant}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {session.participant_count} participant{session.participant_count !== 1 ? 's' : ''}
                      </div>
                      {session.max_participants && (
                        <div className="text-xs text-gray-500">
                          / {session.max_participants} max
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}