'use client'

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type SessionStats = {
  id: string;
  titre: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: string;
  max_participants: number | null;
  participant_count: number;
  fill_rate: number;
  intervenant?: string;
  lieu?: string;
};

type ParticipantStats = {
  total: number;
  bySession: { [key: string]: number };
  byType: { [key: string]: number };
  distribution: Array<{ sessionId: string; sessionTitle: string; count: number; percentage: number }>;
};

interface DetailedStatsModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailedStatsModal({ eventId, isOpen, onClose }: DetailedStatsModalProps) {
  const [sessionStats, setSessionStats] = useState<SessionStats[]>([]);
  const [participantStats, setParticipantStats] = useState<ParticipantStats>({
    total: 0,
    bySession: {},
    byType: {},
    distribution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'participants'>('sessions');

  useEffect(() => {
    if (isOpen && eventId) {
      fetchDetailedStats();
    }
  }, [isOpen, eventId]);

  const fetchDetailedStats = async () => {
    try {
      setIsLoading(true);
      const supabase = supabaseBrowser();

      // Récupérer les sessions avec leurs stats
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('inscription_sessions')
        .select('*')
        .eq('evenement_id', eventId)
        .order('date')
        .order('heure_debut');

      if (sessionsError) throw sessionsError;

      // Calculer les stats pour chaque session
      const detailedSessions = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { count } = await supabase
            .from('inscription_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          const participantCount = count || 0;
          const fillRate = session.max_participants ? 
            Math.round((participantCount / Number(session.max_participants)) * 100) : 100;

          return {
            id: session.id,
            titre: session.titre,
            description: session.description,
            date: session.date,
            heure_debut: session.heure_debut,
            heure_fin: session.heure_fin,
            type: session.type,
            intervenant: session.intervenant,
            lieu: session.lieu,
            max_participants: session.max_participants,
            participant_count: participantCount,
            fill_rate: fillRate,
          } as SessionStats;
        })
      );

      setSessionStats(detailedSessions);

      // Calculer les statistiques des participants
      const totalParticipants = detailedSessions.reduce((sum, session) => sum + session.participant_count, 0);
      
      const bySession: { [key: string]: number } = {};
      const byType: { [key: string]: number } = {};
      const distribution: Array<{ sessionId: string; sessionTitle: string; count: number; percentage: number }> = [];

      detailedSessions.forEach(session => {
        bySession[session.id] = session.participant_count;
        byType[session.type] = (byType[session.type] || 0) + session.participant_count;
        
        if (session.participant_count > 0) {
          distribution.push({
            sessionId: session.id,
            sessionTitle: session.titre,
            count: session.participant_count,
            percentage: totalParticipants > 0 ? Math.round((session.participant_count / totalParticipants) * 100) : 0
          });
        }
      });

      // Trier la distribution par nombre de participants
      distribution.sort((a, b) => b.count - a.count);

      setParticipantStats({
        total: totalParticipants,
        bySession,
        byType,
        distribution
      });

    } catch (err) {
      console.error('Error fetching detailed stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  };

  const getSessionTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conférence': return 'text-blue-600 bg-blue-100';
      case 'atelier': return 'text-green-600 bg-green-100';
      case 'pause': return 'text-gray-600 bg-gray-100';
      case 'networking': return 'text-purple-600 bg-purple-100';
      default: return 'text-indigo-600 bg-indigo-100';
    }
  };

  const getFillRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 25) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 overflow-hidden">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Statistiques Détaillées</h2>
                <p className="text-purple-100">Analyse complète des sessions et participants</p>
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
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'sessions'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Sessions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'participants'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Participants</span>
              </div>
            </button>
          </div>

          {/* Content Area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                  onClick={fetchDetailedStats}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Réessayer
                </button>
              </div>
            ) : activeTab === 'sessions' ? (
              // Sessions Tab
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold">{sessionStats.length}</div>
                    <div className="text-blue-100">Sessions totales</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold">
                      {sessionStats.reduce((sum, s) => sum + (s.max_participants || 0), 0)}
                    </div>
                    <div className="text-green-100">Places totales</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold">
                      {sessionStats.reduce((sum, s) => sum + s.participant_count, 0)}
                    </div>
                    <div className="text-purple-100">Inscriptions</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="text-2xl font-bold">
                      {sessionStats.length > 0 ? 
                        Math.round(sessionStats.reduce((sum, s) => sum + s.fill_rate, 0) / sessionStats.length) : 0}%
                    </div>
                    <div className="text-orange-100">Taux moyen</div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                  {sessionStats.map((session) => (
                    <div key={session.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{session.titre}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSessionTypeColor(session.type)}`}>
                              {session.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>{formatDate(session.date)}</span>
                            <span>{formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}</span>
                            {session.lieu && <span>📍 {session.lieu}</span>}
                            {session.intervenant && <span>👤 {session.intervenant}</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{session.participant_count}</div>
                            <div className="text-sm text-gray-500">
                              {session.max_participants ? `/ ${session.max_participants}` : 'illimité'}
                            </div>
                          </div>
                          
                          <div className={`px-4 py-2 rounded-lg font-bold ${getFillRateColor(session.fill_rate)}`}>
                            {session.fill_rate}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {session.max_participants && (
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              session.fill_rate >= 80 ? 'bg-green-500' :
                              session.fill_rate >= 50 ? 'bg-yellow-500' :
                              session.fill_rate >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(session.fill_rate, 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Participants Tab
              <div className="space-y-6">
                {/* Total Participants */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                  <h3 className="text-lg font-semibold mb-2">Total des inscriptions</h3>
                  <div className="text-4xl font-bold">{participantStats.total}</div>
                </div>

                {/* Distribution by Type */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition par type de session</h3>
                  <div className="space-y-3">
                    {Object.entries(participantStats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSessionTypeColor(type)}`}>
                            {type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-bold text-gray-900">{count}</div>
                          <div className="text-sm text-gray-500">
                            ({participantStats.total > 0 ? Math.round((count / participantStats.total) * 100) : 0}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Distribution */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Distribution par session</h3>
                  <div className="space-y-4">
                    {participantStats.distribution.map((item) => (
                      <div key={item.sessionId} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.sessionTitle}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">{item.count}</span>
                            <span className="text-sm text-gray-500">({item.percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}