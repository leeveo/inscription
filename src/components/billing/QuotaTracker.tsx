'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Users, Ticket, Clock, RefreshCw } from 'lucide-react';
import { TicketType } from '@/types/billing';

interface QuotaInfo {
  ticket_type_id: number;
  ticket_nom: string;
  quota_total: number | null;
  billets_vendus: number;
  quota_disponible: number | null;
  pourcentage_vendu: number;
  statut: 'disponible' | 'bientot_epuise' | 'epuise' | 'illimite';
  ventes_recentes: number;
  taux_conversion_recent: number;
  estimation_epuisement: string | null;
}

interface QuotaTrackerProps {
  evenementId: string;
  ticketTypes: TicketType[];
  refreshInterval?: number; // en secondes
  showAlerts?: boolean;
  showAnalytics?: boolean;
  compact?: boolean;
}

const QuotaTracker: React.FC<QuotaTrackerProps> = ({
  evenementId,
  ticketTypes,
  refreshInterval = 30,
  showAlerts = true,
  showAnalytics = true,
  compact = false
}) => {
  const [quotaData, setQuotaData] = useState<QuotaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  // Charger les données de quotas
  const loadQuotaData = async () => {
    try {
      const response = await fetch(`/api/ticket-types/quota-status?evenement_id=${evenementId}`);
      const result = await response.json();

      if (result.success) {
        setQuotaData(result.data);
        setLastUpdate(new Date());
        setError('');
      } else {
        setError(result.error || 'Erreur lors du chargement des quotas');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur technique');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données initiales et mettre en place le rafraîchissement
  useEffect(() => {
    loadQuotaData();

    if (refreshInterval > 0) {
      const interval = setInterval(loadQuotaData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [evenementId, refreshInterval]);

  // Calculer le statut d'un quota
  const getQuotaStatus = (quota: QuotaInfo): QuotaInfo['statut'] => {
    if (quota.quota_total === null) return 'illimite';
    if (quota.quota_disponible === null || quota.quota_disponible <= 0) return 'epuise';
    if (quota.quota_disponible <= quota.quota_total * 0.1) return 'bientot_epuise';
    return 'disponible';
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: QuotaInfo['statut']) => {
    switch (status) {
      case 'disponible': return 'text-green-600 bg-green-50 border-green-200';
      case 'bientot_epuise': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'epuise': return 'text-red-600 bg-red-50 border-red-200';
      case 'illimite': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Formater l'estimation d'épuisement
  const formatEpuisementEstimation = (estimation: string | null) => {
    if (!estimation) return null;

    try {
      const date = new Date(estimation);
      const now = new Date();
      const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 1) {
        return 'Moins d\'une heure';
      } else if (diffHours < 24) {
        return `${Math.floor(diffHours)}h`;
      } else {
        return `${Math.floor(diffHours / 24)}j`;
      }
    } catch {
      return null;
    }
  };

  // Vérifier s'il y des alertes critiques
  const hasCriticalAlerts = quotaData.some(q =>
    q.statut === 'epuise' || (q.statut === 'bientot_epuise' && q.quota_disponible !== null && q.quota_disponible < 5)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span>Chargement des quotas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Quotas en temps réel
          </h3>
          <span className="text-xs text-gray-500">
            Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        </div>

        <div className="space-y-2">
          {quotaData.map((quota) => (
            <div key={quota.ticket_type_id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{quota.ticket_nom}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      quota.statut === 'epuise' ? 'bg-red-500' :
                      quota.statut === 'bientot_epuise' ? 'bg-orange-500' :
                      quota.statut === 'illimite' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(quota.pourcentage_vendu, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 min-w-[60px] text-right">
                  {quota.quota_total === null ? 'Illimité' :
                   `${quota.quota_disponible}/${quota.quota_total}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {hasCriticalAlerts && showAlerts && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Certains billets sont bientôt épuisés !
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Suivi des quotas en temps réel
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Surveillance des disponibilités et tendances de vente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadQuotaData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">
              {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Alertes critiques */}
      {hasCriticalAlerts && showAlerts && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Alerte critique</h3>
              <p className="text-sm text-red-700">
                {quotaData.filter(q => q.statut === 'epuise').length > 0 &&
                  `${quotaData.filter(q => q.statut === 'epuise').length} type(s) de billet épuisé(s)`
                }
                {quotaData.filter(q => q.statut === 'bientot_epuise' && q.quota_disponible !== null && q.quota_disponible < 5).length > 0 &&
                  ` • ${quotaData.filter(q => q.statut === 'bientot_epuise' && q.quota_disponible !== null && q.quota_disponible < 5).length} bientôt épuisé(s)`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="p-6">
        <div className="grid gap-6">
          {quotaData.map((quota) => (
            <div key={quota.ticket_type_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    {quota.ticket_nom}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quota.statut)}`}>
                      {quota.statut === 'disponible' ? 'Disponible' :
                       quota.statut === 'bientot_epuise' ? 'Bientôt épuisé' :
                       quota.statut === 'epuise' ? 'Épuisé' : 'Illimité'}
                    </span>
                    <span>{quota.billets_vendus} billet{quota.billets_vendus > 1 ? 's' : ''} vendu{quota.billets_vendus > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {quota.estimation_epuisement && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Épuisement estimé</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatEpuisementEstimation(quota.estimation_epuisement)}
                    </span>
                  </div>
                )}
              </div>

              {/* Barre de progression */}
              {quota.quota_total !== null && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression des ventes</span>
                    <span>{quota.pourcentage_vendu.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        quota.statut === 'epuise' ? 'bg-red-500' :
                        quota.statut === 'bientot_epuise' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(quota.pourcentage_vendu, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">
                    {quota.quota_total === null ? 'Illimité' : quota.quota_disponible}
                  </div>
                  <div className="text-gray-600">Disponibles</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{quota.billets_vendus}</div>
                  <div className="text-gray-600">Vendus</div>
                </div>
                {showAnalytics && (
                  <>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{quota.ventes_recentes}</div>
                      <div className="text-gray-600">Dernière heure</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">
                        {quota.taux_conversion_recent.toFixed(1)}%
                      </div>
                      <div className="text-gray-600">Conversion</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {showAnalytics && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Analyse basée sur les dernières 24 heures</span>
            </div>
            <span className="text-gray-500">
              Actualisation automatique toutes les {refreshInterval}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotaTracker;