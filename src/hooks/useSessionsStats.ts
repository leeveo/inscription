import { useState, useEffect, useCallback } from 'react';

interface SessionStats {
  sessionId: string;
  participantCount: number;
  maxParticipants: number | null;
  fillRate: number;
}

interface SessionsStatsData {
  totalSessions: number;
  totalParticipantsInscriptions: number;
  totalCapacity: number;
  fillRate: number;
  sessionStats: SessionStats[];
}

interface UseSessionsStatsReturn {
  data: SessionsStatsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSessionsStats(eventId: string): UseSessionsStatsReturn {
  const [data, setData] = useState<SessionsStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!eventId) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/sessions/stats?eventId=${eventId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching sessions stats:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    // Ne faire l'appel que si on a un eventId valide
    if (eventId) {
      fetchStats();
    }
  }, [fetchStats]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats
  };
}