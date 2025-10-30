'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Users, Euro, AlertCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { EventWithBilling, TicketType, PromoCode } from '@/types/billing';
import TicketTypeManager from './TicketTypeManager';
import PromoCodeManager from './PromoCodeManager';

interface BillingEventAdminProps {
  evenement: EventWithBilling;
  onEventUpdate?: () => void;
}

const BillingEventAdmin: React.FC<BillingEventAdminProps> = ({
  evenement,
  onEventUpdate
}) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'promos' | 'settings'>('overview');
  const [billingStats, setBillingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de billetterie
  useEffect(() => {
    loadBillingData();
  }, [evenement.id]);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      // Charger les types de billets
      const ticketTypesResponse = await fetch(`/api/ticket-types?evenement_id=${evenement.id}`);
      const ticketTypesResult = await ticketTypesResponse.json();
      if (ticketTypesResult.success) {
        setTicketTypes(ticketTypesResult.data);
      }

      // Charger les codes promo
      const promoCodesResponse = await fetch(`/api/promo-codes?evenement_id=${evenement.id}`);
      const promoCodesResult = await promoCodesResponse.json();
      if (promoCodesResult.success) {
        setPromoCodes(promoCodesResult.data);
      }

      // Charger les statistiques
      const statsResponse = await fetch(`/api/events/${evenement.id}/billing-stats`);
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setBillingStats(statsResult.data);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données de billetterie:', error);
    } finally {
      setLoading(false);
    }
  };

  // Activer/désactiver la billetterie
  const toggleBilling = async () => {
    try {
      const response = await fetch(`/api/events/${evenement.id}/billing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billetterie_active: !evenement.billetterie_active
        })
      });

      if (response.ok) {
        onEventUpdate?.();
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la billetterie:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billetterie</h1>
          <p className="text-gray-600 mt-1">Gestion de la billetterie pour "{evenement.nom}"</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleBilling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              evenement.billetterie_active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {evenement.billetterie_active ? (
              <>
                <Eye className="w-4 h-4" />
                Billetterie active
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Billetterie inactive
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertes */}
      {!evenement.billetterie_active && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Billetterie désactivée
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                La billetterie est actuellement inactive. Les clients ne peuvent pas acheter de billets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'tickets', label: 'Types de billets', icon: CreditCard },
            { id: 'promos', label: 'Codes promo', icon: Euro },
            { id: 'settings', label: 'Paramètres', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total des ventes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(billingStats?.total_ventes || 0)}
                  </p>
                </div>
                <Euro className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Billets vendus</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {billingStats?.total_participants || 0}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Types de billets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ticketTypes.length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Codes promo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {promoCodes.length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Billets par type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ventes par type de billet</h3>
            {billingStats?.billets_par_type?.length > 0 ? (
              <div className="space-y-4">
                {billingStats.billets_par_type.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.nom}</h4>
                      <p className="text-sm text-gray-600">{item.quantite_vendue} billets</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.chiffre_affaires)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.chiffre_affaires / item.quantite_vendue)} / billet
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune vente enregistrée
              </p>
            )}
          </div>

          {/* Ventes récentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Commandes récentes</h3>
            {/* TODO: Afficher les commandes récentes */}
            <p className="text-gray-500 text-center py-8">
              Aucune commande récente
            </p>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <TicketTypeManager
          evenementId={evenement.id}
          onTicketTypeChange={loadBillingData}
        />
      )}

      {activeTab === 'promos' && (
        <PromoCodeManager
          evenementId={evenement.id}
          onPromoCodeChange={loadBillingData}
        />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Paramètres généraux */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={evenement.devise || 'EUR'}
                  onChange={(e) => {
                    // TODO: Implémenter la mise à jour
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de TVA par défaut
                </label>
                <select
                  value={evenement.taux_tva_defaut || 0.20}
                  onChange={(e) => {
                    // TODO: Implémenter la mise à jour
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>0% (non applicable)</option>
                  <option value={0.055}>5.5%</option>
                  <option value={0.10}>10%</option>
                  <option value={0.20}>20%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin des ventes
                </label>
                <input
                  type="datetime-local"
                  value={evenement.date_fin_vente ? new Date(evenement.date_fin_vente).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    // TODO: Implémenter la mise à jour
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Laissez vide pour ne pas limiter la date de fin des ventes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité maximale de l'événement
                </label>
                <input
                  type="number"
                  min="1"
                  value={evenement.capacite_max_evenement || ''}
                  onChange={(e) => {
                    // TODO: Implémenter la mise à jour
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Illimité"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Limite le nombre total de billets vendus (tous types confondus)
                </p>
              </div>
            </div>
          </div>

          {/* Paramètres de paiement */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement</h3>

            <div className="space-y-3">
              {['card', 'apple_pay', 'google_pay'].map((method) => (
                <label key={method} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={evenement.payment_methods_allowed?.includes(method) || false}
                    onChange={(e) => {
                      // TODO: Implémenter la mise à jour
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {method === 'card' ? 'Carte de crédit/débit' :
                     method === 'apple_pay' ? 'Apple Pay' :
                     method === 'google_pay' ? 'Google Pay' : method}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Configuration Stripe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Stripe</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clé publique Stripe
                </label>
                <input
                  type="text"
                  value={evenement.settings_avances?.stripe_publishable_key || ''}
                  onChange={(e) => {
                    // TODO: Implémenter la mise à jour
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Connect Stripe (pour organisations)
                </label>
                <input
                  type="text"
                  value={evenement.stripe_connect_id || ''}
                  onChange={(e) => {
                    // TODO: Implémenter la mise à jour
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="acct_..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                // TODO: Implémenter la sauvegarde
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sauvegarder les paramètres
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingEventAdmin;