'use client';

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  ChevronLeft,
  Settings,
  Ticket,
  BarChart3,
  Tag,
  ShoppingCart,
  FileText,
  Download,
  Eye,
  Power,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Percent,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import TicketTypeManager from '@/components/billing/TicketTypeManager';
import QuotaTracker from '@/components/billing/QuotaTracker';
import { EventWithBilling, TicketType, BillingSettings } from '@/types/billing';

type Evenement = {
  id: string;
  nom: string;
  description: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
  prix?: number;
  places_disponibles?: number;
  statut: string;
  billetterie_active?: boolean;
  billetterie_settings?: Record<string, any>;
  billets_vendus_evenement?: number;
  devise?: string;
  tva_applicable?: boolean;
  taux_tva_defaut?: number;
};

type TabType = 'tickets' | 'quotas' | 'sales' | 'promo' | 'settings';

export default function BilletteriePage({ params }: { params: Promise<{ id: string }> }) {
  const [eventId, setEventId] = useState<string>('');
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [salesStats, setSalesStats] = useState<any>(null);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!eventId) return;
    loadEventAndBillingData();
  }, [eventId]);

  const loadEventAndBillingData = async () => {
    try {
      setIsLoading(true);
      const supabase = supabaseBrowser();

      // Charger les données de l'événement
      const { data: eventData, error: eventError } = await supabase
        .from('inscription_evenements')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const event = eventData as Evenement;
      setEvenement(event);
      setBillingEnabled(event.billetterie_active || false);

      // Charger les types de billets
      const ticketResponse = await fetch(`/api/ticket-types?evenement_id=${eventId}`);
      const ticketResult = await ticketResponse.json();
      if (ticketResult.success) {
        setTicketTypes(ticketResult.data);
      }

      // Charger les statistiques de ventes
      const statsResponse = await fetch(`/api/billing/stats?evenement_id=${eventId}`);
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setSalesStats(statsResult.data);
      }

      // Charger les codes promo
      const promoResponse = await fetch(`/api/promo-codes?evenement_id=${eventId}`);
      const promoResult = await promoResponse.json();
      if (promoResult.success) {
        setPromoCodes(promoResult.data);
      }

      // Charger les paramètres de billetterie
      const settingsResponse = await fetch(`/api/billing/settings?evenement_id=${eventId}`);
      const settingsResult = await settingsResponse.json();
      if (settingsResult.success) {
        setBillingSettings(settingsResult.data);
      }

    } catch (err: Error | unknown) {
      console.error('Erreur lors du chargement:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBilling = async () => {
    try {
      const response = await fetch(`/api/billing/toggle?evenement_id=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !billingEnabled })
      });

      const result = await response.json();
      if (result.success) {
        setBillingEnabled(!billingEnabled);
        if (evenement) {
          setEvenement({
            ...evenement,
            billetterie_active: !billingEnabled
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation/désactivation:', error);
    }
  };

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

  const tabs = [
    {
      id: 'tickets' as TabType,
      label: 'Types de billets',
      icon: Ticket,
      description: 'Configurez les tarifs et options'
    },
    {
      id: 'quotas' as TabType,
      label: 'Suivi des quotas',
      icon: Users,
      description: 'Surveillez les disponibilités'
    },
    {
      id: 'sales' as TabType,
      label: 'Ventes & Analytics',
      icon: BarChart3,
      description: 'Statistiques et performances'
    },
    {
      id: 'promo' as TabType,
      label: 'Codes promo',
      icon: Tag,
      description: 'Gérez les réductions'
    },
    {
      id: 'settings' as TabType,
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration avancée'
    }
  ];

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
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-300">Erreur!</h3>
              <p className="text-red-200/80 mt-1">{error}</p>
              <Link
                href={`/admin/evenements/${eventId}`}
                className="mt-4 inline-flex items-center text-red-300 hover:text-red-200"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour à l'événement
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evenement) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Événement introuvable</h3>
          <Link
            href="/admin/evenements"
            className="text-blue-600 hover:text-blue-700"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* En-tête avec navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/evenements/${eventId}`}
              className="group inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour à l'événement</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {evenement.nom}
            </h1>
            <p className="text-lg text-gray-600">
              Gestion complète de la billetterie
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Statut de la billetterie */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">Billetterie</span>
              <button
                onClick={toggleBilling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {billingEnabled ? (
                  <ToggleRight className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-6" />
                ) : (
                  <ToggleLeft className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-1" />
                )}
              </button>
              <span className={`text-sm font-medium ${
                billingEnabled ? 'text-green-600' : 'text-gray-500'
              }`}>
                {billingEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2">
              <Link
                href={`/inscription/${eventId}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Link>
              <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques rapides */}
      {billingEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Types de billets</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{ticketTypes.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Billets vendus</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {evenement.billets_vendus_evenement || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {salesStats?.chiffre_affaires ? `${salesStats.chiffre_affaires.toFixed(2)}€` : '0€'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Codes promo</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{promoCodes.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transform scale-x-0 transition-transform group-hover:scale-x-20"></div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {!billingEnabled ? (
          <div className="text-center py-12">
            <Power className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Billetterie désactivée
            </h3>
            <p className="text-gray-600 mb-6">
              Activez la billetterie pour commencer à configurer vos types de billets et gérer les ventes.
            </p>
            <button
              onClick={toggleBilling}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Power className="w-5 h-5 mr-2" />
              Activer la billetterie
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'tickets' && (
              <TicketTypeManager
                evenementId={eventId}
                onTicketTypeChange={loadEventAndBillingData}
              />
            )}

            {activeTab === 'quotas' && (
              <QuotaTracker
                evenementId={eventId}
                ticketTypes={ticketTypes}
                showAlerts={true}
                showAnalytics={true}
              />
            )}

            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ventes et Analytics</h2>
                    <p className="text-gray-600 mt-1">
                      Suivez les performances de vos ventes en temps réel
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>30 derniers jours</option>
                      <option>7 derniers jours</option>
                      <option>Aujourd'hui</option>
                      <option>Ce mois</option>
                    </select>
                  </div>
                </div>

                {/* Graphiques et statistiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
                    <div className="h-64 bg-white rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Graphique d'évolution (à implémenter)</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type de billet</h3>
                    <div className="h-64 bg-white rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Graphique circulaire (à implémenter)</p>
                    </div>
                  </div>
                </div>

                {/* Tableau des ventes récentes */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes récentes</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Commande
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Billets
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Les données des ventes seront chargées dynamiquement */}
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            Aucune vente récente
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'promo' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Codes promotionnels</h2>
                    <p className="text-gray-600 mt-1">
                      Créez et gérez des codes de réduction pour stimuler les ventes
                    </p>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <Tag className="w-5 h-5 mr-2" />
                    Nouveau code promo
                  </button>
                </div>

                {promoCodes.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun code promo
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Créez votre premier code promotionnel pour offrir des réductions à vos clients.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      <Tag className="w-5 h-5 mr-2" />
                      Créer un code promo
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {/* Liste des codes promo sera implémentée ici */}
                    {promoCodes.map((promo) => (
                      <div key={promo.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{promo.code}</h4>
                            <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {promo.type_reduction === 'percentage' ? `-${promo.valeur_reduction}%` : `-${promo.valeur_reduction}€`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {promo.utilise_count} utilisations
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres de la billetterie</h2>

                  <div className="space-y-8">
                    {/* Configuration générale */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration générale</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Devise
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            defaultValue={evenement.devise || 'EUR'}
                          >
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">Dollar américain ($)</option>
                            <option value="GBP">Livre sterling (£)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Langue
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fuseau horaire
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="Europe/Paris">Europe/Paris</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="America/New_York">America/New_York</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              defaultChecked={evenement.tva_applicable}
                            />
                            <span className="text-sm text-gray-700">Appliquer la TVA</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Configuration TVA */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration TVA</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Taux de TVA par défaut
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            defaultValue={evenement.taux_tva_defaut || 0.20}
                          >
                            <option value={0}>0% (non applicable)</option>
                            <option value={0.055}>5.5%</option>
                            <option value={0.10}>10%</option>
                            <option value={0.20}>20%</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de TVA (optionnel)
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="FR12345678901"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Méthodes de paiement */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">Carte bancaire</p>
                              <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            defaultChecked
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">Apple Pay & Google Pay</p>
                              <p className="text-sm text-gray-600">Paiements mobiles</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">Virement bancaire</p>
                              <p className="text-sm text-gray-600">Paiement par virement</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Configuration Stripe */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Stripe</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Clé publique Stripe
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="pk_test_..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Compte Stripe Connect (optionnel)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="acct_..."
                              readOnly
                            />
                            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                              Connecter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sauvegarder */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      <button className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        Annuler
                      </button>
                      <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Sauvegarder les paramètres
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}