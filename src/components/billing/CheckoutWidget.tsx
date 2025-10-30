'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Tag, Euro, CreditCard, Check, AlertCircle, X } from 'lucide-react';
import { TicketType, PromoCode, Cart, CartItem, CheckoutFormData, CreateOrderResponse } from '@/types/billing';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Schéma de validation pour le formulaire de checkout
const checkoutFormSchema = z.object({
  acheteur_nom: z.string().min(1, 'Le nom est requis'),
  acheteur_prenom: z.string().min(1, 'Le prénom est requis'),
  acheteur_email: z.string().email('Email invalide'),
  acheteur_telephone: z.string().optional(),
  accepte_cgv: z.boolean().refine(val => val === true, 'Vous devez accepter les CGV'),
  accepte_newsletter: z.boolean().default(false),
  consentements_rgpd: z.object({
    commercial: z.boolean(),
    analytics: z.boolean(),
    profiling: z.boolean()
  }).default({
    commercial: false,
    analytics: false,
    profiling: false
  })
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface CheckoutWidgetProps {
  evenementId: string;
  ticketTypes: TicketType[];
  onSuccess?: (order: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const CheckoutWidget: React.FC<CheckoutWidgetProps> = ({
  evenementId,
  ticketTypes,
  onSuccess,
  onError,
  className = ''
}) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    sous_total: 0,
    tva: 0,
    frais: 0,
    total: 0,
    reduction: 0
  });

  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [appliedPromoError, setAppliedPromoError] = useState<string | null>(null);
  const [quotaErrors, setQuotaErrors] = useState<Record<number, string>>({});

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      acheteur_nom: '',
      acheteur_prenom: '',
      acheteur_email: '',
      acheteur_telephone: '',
      accepte_cgv: false,
      accepte_newsletter: false,
      consentements_rgpd: {
        commercial: false,
        analytics: false,
        profiling: false
      }
    }
  });

  // Filtrer uniquement les types de billets visibles et en vente
  const availableTicketTypes = ticketTypes.filter(tt => {
    const now = new Date();
    const debut = tt.date_debut_vente ? new Date(tt.date_debut_vente) : null;
    const fin = tt.date_fin_vente ? new Date(tt.date_fin_vente) : null;

    return tt.visible &&
           tt.vente_en_ligne &&
           (!debut || now >= debut) &&
           (!fin || now <= fin) &&
           (tt.quota_disponible === null || tt.quota_disponible > 0);
  });

  // Ajouter un billet au panier
  const addToCart = (ticketType: TicketType) => {
    setQuotaErrors({});

    const existingItem = cart.items.find(item => item.ticket_type.id === ticketType.id);

    if (existingItem) {
      // Vérifier la quantité maximale
      if (existingItem.quantite >= ticketType.maximum_achat) {
        setQuotaErrors(prev => ({
          ...prev,
          [ticketType.id]: `Maximum ${ticketType.maximum_achat} billets par commande`
        }));
        return;
      }

      // Vérifier le quota disponible
      if (ticketType.quota_disponible !== null && existingItem.quantite >= ticketType.quota_disponible) {
        setQuotaErrors(prev => ({
          ...prev,
          [ticketType.id]: 'Plus de billets disponibles'
        }));
        return;
      }

      updateQuantity(ticketType.id, existingItem.quantite + 1);
    } else {
      const newItem: CartItem = {
        ticket_type: ticketType,
        quantite: 1,
        prix_unitaire: ticketType.prix,
        prix_total: ticketType.prix
      };

      const newItems = [...cart.items, newItem];
      recalculateCart(newItems);
    }
  };

  // Mettre à jour la quantité d'un billet
  const updateQuantity = (ticketTypeId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const ticketType = availableTicketTypes.find(tt => tt.id === ticketTypeId);
    if (!ticketType) return;

    // Vérifier les limites
    if (newQuantity > ticketType.maximum_achat) {
      setQuotaErrors(prev => ({
        ...prev,
        [ticketTypeId]: `Maximum ${ticketType.maximum_achat} billets par commande`
      }));
      return;
    }

    if (ticketType.quota_disponible !== null && newQuantity > ticketType.quota_disponible) {
      setQuotaErrors(prev => ({
        ...prev,
        [ticketTypeId]: 'Plus de billets disponibles'
      }));
      return;
    }

    setQuotaErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[ticketTypeId];
      return newErrors;
    });

    const newItems = cart.items.map(item =>
      item.ticket_type.id === ticketTypeId
        ? {
            ...item,
            quantite: newQuantity,
            prix_total: item.prix_unitaire * newQuantity
          }
        : item
    );

    recalculateCart(newItems);
  };

  // Retirer un billet du panier
  const removeFromCart = (ticketTypeId: number) => {
    const newItems = cart.items.filter(item => item.ticket_type.id !== ticketTypeId);
    recalculateCart(newItems);
    setQuotaErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[ticketTypeId];
      return newErrors;
    });
  };

  // Recalculer le panier
  const recalculateCart = (items: CartItem[]) => {
    const sous_total = items.reduce((sum, item) => sum + item.prix_total, 0);
    const tva = items.reduce((sum, item) => {
      return sum + (item.ticket_type.tva_applicable ? item.prix_total * item.ticket_type.taux_tva : 0);
    }, 0);

    let reduction = 0;
    if (promoCode) {
      if (promoCode.type_reduction === 'percentage') {
        reduction = sous_total * (promoCode.valeur_reduction / 100);
      } else if (promoCode.type_reduction === 'fixed') {
        reduction = Math.min(promoCode.valeur_reduction, sous_total);
      }
    }

    const frais = 1.5; // Frais de traitement fixes
    const total = Math.max(0, sous_total + frais - reduction);

    setCart({
      items,
      sous_total,
      tva,
      frais,
      total,
      reduction
    });
  };

  // Appliquer un code promo
  const applyPromoCode = async () => {
    if (!promoCodeInput.trim()) return;

    try {
      const response = await fetch('/api/promo-codes?action=apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput,
          evenement_id: evenementId,
          client_email: form.watch('acheteur_email') || 'temp@example.com',
          panier: cart.items.map(item => ({
            ticket_type_id: item.ticket_type.id,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        setPromoCode(result.data.promo_code);
        setPromoCodeInput('');
        setAppliedPromoError(null);
        recalculateCart(cart.items);
      } else {
        setAppliedPromoError(result.message || 'Code promo invalide');
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du code promo:', error);
      setAppliedPromoError('Erreur lors de l\'application du code promo');
    }
  };

  // Retirer le code promo
  const removePromoCode = () => {
    setPromoCode(null);
    setAppliedPromoError(null);
    recalculateCart(cart.items);
  };

  // Soumettre la commande
  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.items.length === 0) {
      onError?.('Votre panier est vide');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        ...data,
        billets: cart.items.map(item => ({
          ticket_type_id: item.ticket_type.id,
          quantite: item.quantite
        })),
        code_promo: promoCode?.code
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result: CreateOrderResponse = await response.json();

      if (result.success && result.data) {
        // Si nous avons un payment_intent, rediriger vers le paiement
        if (result.data.payment_intent) {
          // TODO: Intégrer Stripe Elements pour le paiement
          onSuccess?.(result.data.order);
        } else {
          // Commande gratuite (montant = 0)
          onSuccess?.(result.data.order);
        }
      } else {
        onError?.(result.error || 'Erreur lors de la création de la commande');
      }
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      onError?.('Erreur lors de la commande');
    } finally {
      setIsProcessing(false);
    }
  };

  // Recalculer le panier quand le code promo change
  useEffect(() => {
    recalculateCart(cart.items);
  }, [promoCode]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Billetterie en ligne
        </h2>
        <p className="mt-2 text-blue-100">
          Sélectionnez vos billets et procédez au paiement sécurisé
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Sélection des billets */}
        {availableTicketTypes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Aucun billet disponible
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Les billets ne sont pas encore en vente pour cet événement
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sélectionnez vos billets</h3>

            {availableTicketTypes.map(ticketType => {
              const cartItem = cart.items.find(item => item.ticket_type.id === ticketType.id);
              const quotaError = quotaErrors[ticketType.id];

              return (
                <div key={ticketType.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{ticketType.nom}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ticketType.type_tarif === 'early' ? 'bg-green-100 text-green-800' :
                          ticketType.type_tarif === 'standard' ? 'bg-blue-100 text-blue-800' :
                          ticketType.type_tarif === 'late' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {ticketType.type_tarif === 'early' ? 'Early Bird' :
                           ticketType.type_tarif === 'standard' ? 'Standard' :
                           ticketType.type_tarif === 'late' ? 'Late' : 'VIP'}
                        </span>
                      </div>

                      {ticketType.description && (
                        <p className="text-sm text-gray-600 mb-2">{ticketType.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-semibold text-lg text-gray-900">
                          {formatPrice(ticketType.prix)}
                        </span>

                        {ticketType.quota_disponible !== null && (
                          <span>
                            {ticketType.quota_disponible} disponible{ticketType.quota_disponible > 1 ? 's' : ''}
                          </span>
                        )}

                        <span>
                          Min: {ticketType.minimum_achat} / Max: {ticketType.maximum_achat}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(ticketType.id, cartItem.quantite - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {cartItem.quantite}
                          </span>
                          <button
                            onClick={() => updateQuantity(ticketType.id, cartItem.quantite + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(ticketType.id)}
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(ticketType)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>

                  {quotaError && (
                    <p className="mt-2 text-sm text-red-600">{quotaError}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Panier */}
        {cart.items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Votre panier</h3>

            <div className="space-y-2 mb-4">
              {cart.items.map(item => (
                <div key={item.ticket_type.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantite} × {item.ticket_type.nom}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.prix_total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Code promo */}
            <div className="border-t pt-4">
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Code promo appliqué : {promoCode.code}
                    </span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="Code promo"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={!promoCodeInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              )}

              {appliedPromoError && (
                <p className="mt-2 text-sm text-red-600">{appliedPromoError}</p>
              )}
            </div>

            {/* Total */}
            <div className="border-t mt-4 pt-4 space-y-2">
              {cart.sous_total > 0 && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(cart.sous_total)}</span>
                  </div>
                  {cart.reduction > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(cart.reduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frais de traitement</span>
                    <span>{formatPrice(cart.frais)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de commande */}
        {cart.items.length > 0 && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="font-semibold text-gray-900">Informations de l'acheteur</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  {...form.register('acheteur_nom')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dupont"
                />
                {form.formState.errors.acheteur_nom && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.acheteur_nom.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  {...form.register('acheteur_prenom')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jean"
                />
                {form.formState.errors.acheteur_prenom && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.acheteur_prenom.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...form.register('acheteur_email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="jean.dupont@example.com"
                />
                {form.formState.errors.acheteur_email && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.acheteur_email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  {...form.register('acheteur_telephone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Consentements RGPD */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-start">
                <input
                  {...form.register('accepte_cgv')}
                  type="checkbox"
                  id="accepte_cgv"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="accepte_cgv" className="ml-2 text-sm text-gray-700">
                  J'accepte les conditions générales de vente *
                </label>
              </div>
              {form.formState.errors.accepte_cgv && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.accepte_cgv.message}
                </p>
              )}

              <div className="flex items-start">
                <input
                  {...form.register('accepte_newsletter')}
                  type="checkbox"
                  id="accepte_newsletter"
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="accepte_newsletter" className="ml-2 text-sm text-gray-700">
                  Je souhaite recevoir la newsletter et les informations sur les événements
                </label>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Conformément au RGPD, j'accepte que mes données soient utilisées pour :</p>
                <div className="flex items-center gap-2">
                  <input
                    {...form.register('consentements_rgpd.commercial')}
                    type="checkbox"
                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label>La communication commerciale</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    {...form.register('consentements_rgpd.analytics')}
                    type="checkbox"
                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label>L'analyse et l'amélioration des services</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    {...form.register('consentements_rgpd.profiling')}
                    type="checkbox"
                    className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label>Le profilage pour des offres personnalisées</label>
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <div className="border-t pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {cart.total > 0 ? `Payer ${formatPrice(cart.total)}` : 'Confirmer la commande'}
                  </>
                )}
              </button>

              <p className="mt-3 text-xs text-center text-gray-500">
                Paiement sécurisé via Stripe • Vos informations sont protégées
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutWidget;