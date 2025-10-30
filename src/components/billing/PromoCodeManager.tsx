'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Percent, Calendar, Copy, Eye } from 'lucide-react';
import { PromoCode } from '@/types/billing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schéma de validation
const promoCodeFormSchema = z.object({
  code: z.string().min(1, 'Le code est requis').regex(/^[A-Z0-9_-]+$/, 'Code invalide (majuscules, chiffres, underscore, tiret uniquement)'),
  description: z.string().optional(),
  type_reduction: z.enum(['percentage', 'fixed', 'bogo']),
  valeur_reduction: z.number().min(0, 'La valeur de réduction doit être positive'),
  montant_minimum: z.number().min(0).optional(),
  utilisation_maximum: z.number().positive().optional(),
  utilisation_par_client: z.number().min(1).default(1),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().optional(),
  actif: z.boolean().default(true)
});

type PromoCodeFormData = z.infer<typeof promoCodeFormSchema>;

interface PromoCodeManagerProps {
  evenementId: string;
  onPromoCodeChange?: () => void;
}

const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({
  evenementId,
  onPromoCodeChange
}) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deletingPromoCode, setDeletingPromoCode] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: '',
      description: '',
      type_reduction: 'percentage',
      valeur_reduction: 10,
      montant_minimum: undefined,
      utilisation_maximum: undefined,
      utilisation_par_client: 1,
      date_debut: new Date().toISOString().slice(0, 16),
      date_fin: '',
      actif: true
    }
  });

  // Charger les codes promo
  useEffect(() => {
    loadPromoCodes();
  }, [evenementId]);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/promo-codes?evenement_id=${evenementId}`);
      const result = await response.json();

      if (result.success) {
        setPromoCodes(result.data);
      } else {
        console.error('Erreur lors du chargement des codes promo:', result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data: PromoCodeFormData) => {
    try {
      const payload = {
        ...data,
        evenement_id: evenementId,
        code: data.code.toUpperCase()
      };

      let response;
      if (editingPromoCode) {
        response = await fetch(`/api/promo-codes/${editingPromoCode.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/promo-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (result.success) {
        await loadPromoCodes();
        setIsModalOpen(false);
        setEditingPromoCode(null);
        form.reset();
        onPromoCodeChange?.();
      } else {
        console.error('Erreur:', result.error);
        // Afficher l'erreur à l'utilisateur
        if (result.details) {
          result.details.forEach((detail: any) => {
            form.setError(detail.field as any, { message: detail.message });
          });
        } else {
          alert('Erreur: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Modifier un code promo
  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    form.reset({
      code: promoCode.code,
      description: promoCode.description || '',
      type_reduction: promoCode.type_reduction,
      valeur_reduction: promoCode.valeur_reduction,
      montant_minimum: promoCode.montant_minimum || undefined,
      utilisation_maximum: promoCode.utilisation_maximum || undefined,
      utilisation_par_client: promoCode.utilisation_par_client,
      date_debut: new Date(promoCode.date_debut).toISOString().slice(0, 16),
      date_fin: promoCode.date_fin ? new Date(promoCode.date_fin).toISOString().slice(0, 16) : '',
      actif: promoCode.actif
    });
    setIsModalOpen(true);
  };

  // Supprimer un code promo
  const handleDelete = async (promoCode: PromoCode) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le code "${promoCode.code}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/promo-codes/${promoCode.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await loadPromoCodes();
        setDeletingPromoCode(null);
        onPromoCodeChange?.();
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Copier le code dans le presse-papier
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Basculer l'état actif/inactif
  const toggleActive = async (promoCode: PromoCode) => {
    try {
      const response = await fetch(`/api/promo-codes/${promoCode.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !promoCode.actif })
      });

      if (response.ok) {
        await loadPromoCodes();
        onPromoCodeChange?.();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getReductionTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Pourcentage';
      case 'fixed': return 'Montant fixe';
      case 'bogo': return 'BOGO (1 acheté = 1 offert)';
      default: return type;
    }
  };

  const getReductionDisplay = (promoCode: PromoCode) => {
    if (promoCode.type_reduction === 'percentage') {
      return `-${promoCode.valeur_reduction}%`;
    } else if (promoCode.type_reduction === 'fixed') {
      return `-${promoCode.valeur_reduction.toFixed(2)}€`;
    } else {
      return 'BOGO';
    }
  };

  const isPromoCodeValid = (promoCode: PromoCode) => {
    const maintenant = new Date();
    const debut = new Date(promoCode.date_debut);
    const fin = promoCode.date_fin ? new Date(promoCode.date_fin) : null;

    return promoCode.actif &&
           maintenant >= debut &&
           (!fin || maintenant <= fin) &&
           (!promoCode.utilisation_maximum || promoCode.utilise_count < promoCode.utilisation_maximum);
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
          <h2 className="text-xl font-semibold text-gray-900">Codes promotionnels</h2>
          <p className="text-sm text-gray-500 mt-1">
            Créez des codes promo pour encourager les ventes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPromoCode(null);
            form.reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un code promo
        </button>
      </div>

      {/* Liste des codes promo */}
      {promoCodes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun code promo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre premier code promo
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {promoCodes.map((promoCode) => {
            const isValid = isPromoCodeValid(promoCode);
            const isExpired = promoCode.date_fin && new Date() > new Date(promoCode.date_fin);
            const isLimitReached = promoCode.utilisation_maximum && promoCode.utilise_count >= promoCode.utilisation_maximum;

            return (
              <div
                key={promoCode.id}
                className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
                  !isValid ? 'border-gray-300 opacity-60' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-mono font-bold text-gray-900 uppercase">
                          {promoCode.code}
                        </h3>
                        <button
                          onClick={() => copyCode(promoCode.code)}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="Copier le code"
                        >
                          {copiedCode === promoCode.code ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        isValid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isValid ? 'Actif' : (
                          isExpired ? 'Expiré' :
                          isLimitReached ? 'Limite atteinte' :
                          'Inactif'
                        )}
                      </span>

                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promoCode.type_reduction === 'percentage' ? 'bg-blue-100 text-blue-800' :
                        promoCode.type_reduction === 'fixed' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {getReductionTypeLabel(promoCode.type_reduction)}
                      </span>
                    </div>

                    {promoCode.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {promoCode.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        <span className="font-medium text-lg text-green-600">
                          {getReductionDisplay(promoCode)}
                        </span>
                      </div>

                      {promoCode.montant_minimum && (
                        <div className="flex items-center gap-1">
                          <span>Min: {promoCode.montant_minimum.toFixed(2)}€</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <span>
                          Utilisations: {promoCode.utilise_count}
                          {promoCode.utilisation_maximum && ` / ${promoCode.utilisation_maximum}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Du {new Date(promoCode.date_debut).toLocaleDateString()}
                          {promoCode.date_fin && ` au ${new Date(promoCode.date_fin).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(promoCode)}
                      className={`p-2 rounded-lg transition-colors ${
                        promoCode.actif
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title={promoCode.actif ? 'Désactiver' : 'Activer'}
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(promoCode)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPromoCode(promoCode)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création/modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPromoCode ? 'Modifier le code promo' : 'Nouveau code promo'}
              </h2>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo *
                  </label>
                  <input
                    {...form.register('code')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                    placeholder="WELCOME2025"
                  />
                  {form.formState.errors.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de réduction *
                  </label>
                  <select
                    {...form.register('type_reduction')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                    <option value="bogo">BOGO (1 acheté = 1 offert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur de la réduction *
                  </label>
                  <input
                    {...form.register('valeur_reduction', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max={form.watch('type_reduction') === 'percentage' ? 100 : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      form.watch('type_reduction') === 'percentage' ? '10' : '10.00'
                    }
                  />
                  {form.formState.errors.valeur_reduction && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.valeur_reduction.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {form.watch('type_reduction') === 'percentage' ? 'En % (ex: 10 pour 10%)' : 'En € (ex: 10.00 pour 10€)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant minimum d'achat
                  </label>
                  <input
                    {...form.register('montant_minimum', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Laisser vide si aucun minimum requis
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisations maximales
                  </label>
                  <input
                    {...form.register('utilisation_maximum', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Illimité"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Laisser vide pour illimité
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisations par client
                  </label>
                  <input
                    {...form.register('utilisation_par_client', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <input
                    {...form.register('date_debut')}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.formState.errors.date_debut && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.date_debut.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    {...form.register('date_fin')}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Laisser vide si aucune date de fin
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description du code promo..."
                />
              </div>

              <div className="flex items-center">
                <input
                  {...form.register('actif')}
                  type="checkbox"
                  id="actif"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="actif" className="ml-2 text-sm text-gray-700">
                  Code promo actif
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPromoCode(null);
                    form.reset();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingPromoCode ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deletingPromoCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <Trash2 className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Supprimer le code promo
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer le code "{deletingPromoCode.code}" ?
                {deletingPromoCode.utilise_count > 0 && (
                  <span className="block mt-2 text-orange-600 font-medium">
                    Attention : Ce code a déjà été utilisé {deletingPromoCode.utilise_count} fois !
                  </span>
                )}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingPromoCode(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deletingPromoCode)}
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

export default PromoCodeManager;