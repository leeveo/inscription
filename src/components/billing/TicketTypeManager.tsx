'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Euro, Calendar, Tag } from 'lucide-react';
import { TicketType, TicketTypeFormData, TicketTypeTarif } from '@/types/billing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schéma de validation
const ticketTypeFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  prix: z.number().min(0, 'Le prix doit être positif'),
  type_tarif: z.enum(['early', 'standard', 'late', 'vip']),
  quota_total: z.number().positive().optional(),
  date_debut_vente: z.string().optional(),
  date_fin_vente: z.string().optional(),
  visible: z.boolean().default(true),
  vente_en_ligne: z.boolean().default(true),
  minimum_achat: z.number().min(1).default(1),
  maximum_achat: z.number().min(1).default(10),
  tva_applicable: z.boolean().default(true),
  taux_tva: z.number().min(0).max(1).default(0.20)
});

type TicketTypeFormData = z.infer<typeof ticketTypeFormSchema>;

interface TicketTypeManagerProps {
  evenementId: string;
  onTicketTypeChange?: () => void;
}

const TicketTypeManager: React.FC<TicketTypeManagerProps> = ({
  evenementId,
  onTicketTypeChange
}) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
  const [deletingTicketType, setDeletingTicketType] = useState<TicketType | null>(null);

  const form = useForm<TicketTypeFormData>({
    resolver: zodResolver(ticketTypeFormSchema),
    defaultValues: {
      nom: '',
      description: '',
      prix: 0,
      type_tarif: 'standard',
      quota_total: undefined,
      date_debut_vente: '',
      date_fin_vente: '',
      visible: true,
      vente_en_ligne: true,
      minimum_achat: 1,
      maximum_achat: 10,
      tva_applicable: true,
      taux_tva: 0.20
    }
  });

  // Charger les types de billets
  useEffect(() => {
    loadTicketTypes();
  }, [evenementId]);

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ticket-types?evenement_id=${evenementId}`);
      const result = await response.json();

      if (result.success) {
        setTicketTypes(result.data);
      } else {
        console.error('Erreur lors du chargement des types de billets:', result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data: TicketTypeFormData) => {
    try {
      const payload = {
        ...data,
        evenement_id: evenementId
      };

      let response;
      if (editingTicketType) {
        response = await fetch(`/api/ticket-types/${editingTicketType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/ticket-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (result.success) {
        await loadTicketTypes();
        setIsModalOpen(false);
        setEditingTicketType(null);
        form.reset();
        onTicketTypeChange?.();
      } else {
        console.error('Erreur:', result.error);
        // Afficher l'erreur à l'utilisateur
        if (result.details) {
          result.details.forEach((detail: any) => {
            form.setError(detail.field as any, { message: detail.message });
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Modifier un type de billet
  const handleEdit = (ticketType: TicketType) => {
    setEditingTicketType(ticketType);
    form.reset({
      nom: ticketType.nom,
      description: ticketType.description || '',
      prix: ticketType.prix,
      type_tarif: ticketType.type_tarif,
      quota_total: ticketType.quota_total || undefined,
      date_debut_vente: ticketType.date_debut_vente ? new Date(ticketType.date_debut_vente).toISOString().slice(0, 16) : '',
      date_fin_vente: ticketType.date_fin_vente ? new Date(ticketType.date_fin_vente).toISOString().slice(0, 16) : '',
      visible: ticketType.visible,
      vente_en_ligne: ticketType.vente_en_ligne,
      minimum_achat: ticketType.minimum_achat,
      maximum_achat: ticketType.maximum_achat,
      tva_applicable: ticketType.tva_applicable,
      taux_tva: ticketType.taux_tva
    });
    setIsModalOpen(true);
  };

  // Supprimer un type de billet
  const handleDelete = async (ticketType: TicketType) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${ticketType.nom}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ticket-types/${ticketType.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await loadTicketTypes();
        setDeletingTicketType(null);
        onTicketTypeChange?.();
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Basculer la visibilité
  const toggleVisibility = async (ticketType: TicketType) => {
    try {
      const response = await fetch(`/api/ticket-types/${ticketType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !ticketType.visible })
      });

      if (response.ok) {
        await loadTicketTypes();
        onTicketTypeChange?.();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getTypeTarifColor = (type: TicketTypeTarif) => {
    switch (type) {
      case 'early': return 'bg-green-100 text-green-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'late': return 'bg-orange-100 text-orange-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeTarifLabel = (type: TicketTypeTarif) => {
    switch (type) {
      case 'early': return 'Early Bird';
      case 'standard': return 'Standard';
      case 'late': return 'Late';
      case 'vip': return 'VIP';
      default: return type;
    }
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
          <h2 className="text-xl font-semibold text-gray-900">Types de billets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configurez les différents types de billets pour votre événement
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTicketType(null);
            form.reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un type de billet
        </button>
      </div>

      {/* Liste des types de billets */}
      {ticketTypes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun type de billet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre premier type de billet
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ticketTypes.map((ticketType) => (
            <div
              key={ticketType.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {ticketType.nom}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeTarifColor(ticketType.type_tarif)}`}>
                      {getTypeTarifLabel(ticketType.type_tarif)}
                    </span>
                    {!ticketType.visible && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        Masqué
                      </span>
                    )}
                  </div>

                  {ticketType.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {ticketType.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      <span className="font-medium text-gray-900">
                        {ticketType.prix.toFixed(2)}€
                      </span>
                      {ticketType.tva_applicable && (
                        <span className="text-xs">
                          (+{ticketType.taux_tva * 100}% TVA)
                        </span>
                      )}
                    </div>

                    {ticketType.quota_total && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {ticketType.quota_disponible ?? 'Illimité'} / {ticketType.quota_total}
                        </span>
                        <span>disponibles</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        Min: {ticketType.minimum_achat} / Max: {ticketType.maximum_achat}
                      </span>
                    </div>

                    {ticketType.date_debut_vente && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Vente: {new Date(ticketType.date_debut_vente).toLocaleDateString()}
                          {ticketType.date_fin_vente && ` - ${new Date(ticketType.date_fin_vente).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {ticketType.billets_vendus > 0 && (
                    <div className="mt-3 text-sm text-green-600 font-medium">
                      {ticketType.billets_vendus} billet{ticketType.billets_vendus > 1 ? 's' : ''} vendu{ticketType.billets_vendus > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleVisibility(ticketType)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={ticketType.visible ? 'Masquer' : 'Afficher'}
                  >
                    {ticketType.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(ticketType)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingTicketType(ticketType)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création/modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTicketType ? 'Modifier le type de billet' : 'Nouveau type de billet'}
              </h2>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du billet *
                  </label>
                  <input
                    {...form.register('nom')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Billet Standard"
                  />
                  {form.formState.errors.nom && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.nom.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...form.register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Description détaillée du billet..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de tarif *
                  </label>
                  <select
                    {...form.register('type_tarif')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="early">Early Bird</option>
                    <option value="standard">Standard</option>
                    <option value="late">Late</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€) *
                  </label>
                  <input
                    {...form.register('prix', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  {form.formState.errors.prix && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.prix.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota total (laisser vide pour illimité)
                  </label>
                  <input
                    {...form.register('quota_total', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Illimité"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taux de TVA
                  </label>
                  <select
                    {...form.register('taux_tva', { valueAsNumber: true })}
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
                    Début des ventes
                  </label>
                  <input
                    {...form.register('date_debut_vente')}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fin des ventes
                  </label>
                  <input
                    {...form.register('date_fin_vente')}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité minimale
                  </label>
                  <input
                    {...form.register('minimum_achat', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité maximale
                  </label>
                  <input
                    {...form.register('maximum_achat', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    {...form.register('visible')}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Visible sur la page de vente</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    {...form.register('vente_en_ligne')}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Vente en ligne activée</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    {...form.register('tva_applicable')}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">TVA applicable</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTicketType(null);
                    form.reset();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTicketType ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deletingTicketType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <Trash2 className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Supprimer le type de billet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer "{deletingTicketType.nom}" ?
                {deletingTicketType.billets_vendus > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Attention : {deletingTicketType.billets_vendus} billet{deletingTicketType.billets_vendus > 1 ? 's' : ''} a déjà été vendu{deletingTicketType.billets_vendus > 1 ? 's' : ''} !
                  </span>
                )}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingTicketType(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deletingTicketType)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTypeManager;