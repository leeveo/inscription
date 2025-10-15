'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CreditCard, User, Mail, Phone, Calendar, Tag, Euro, Trash2, Plus, Minus, Check } from 'lucide-react';
import { TicketType, Cart, CartItem, Order, CheckoutFormData } from '@/types/billing';

// Schéma de validation pour le formulaire de checkout
const checkoutFormSchema = z.object({
  acheteur_nom: z.string().min(1, 'Le nom est requis'),
  acheteur_prenom: z.string().min(1, 'Le prénom est requis'),
  acheteur_email: z.string().email('Email invalide'),
  acheteur_telephone: z.string().optional(),
  billets: z.array(z.object({
    ticket_type_id: z.number(),
    quantite: z.number().min(1)
  })).min(1, 'Au moins un billet est requis'),
  code_promo: z.string().optional(),
  accepte_cgv: z.boolean().refine(val => val === true, 'Vous devez accepter les CGV'),
  accepte_newsletter: z.boolean().default(false),
  consentements_rgpd: z.object({
    commercial: z.boolean().default(false),
    analytics: z.boolean().default(false),
    profiling: z.boolean().default(false)
  })
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface CheckoutFormProps {
  evenementId: string;
  ticketTypes: TicketType[];
  onSuccess?: (order: Order) => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  evenementId,
  ticketTypes,
  onSuccess,
  onError
}) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    sous_total: 0,
    tva: 0,
    frais: 0,
    total: 0
  });
  const [promoCode, setPromoCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      acheteur_nom: '',
      acheteur_prenom: '',
      acheteur_email: '',
      acheteur_telephone: '',
      billets: [],
      code_promo: '',
      accepte_cgv: false,
      accepte_newsletter: false,
      consentements_rgpd: {
        commercial: false,
        analytics: false,
        profiling: false
      }
    }
  });

  // Calculer le panier
  useEffect(() => {
    calculateCart();
  }, [cart.items, appliedPromo]);

  const calculateCart = () => {
    let sous_total = 0;
    let tva = 0;

    cart.items.forEach(item => {
      const itemTotal = item.prix_unitaire * item.quantite;
      sous_total += itemTotal;

      if (item.ticket_type.tva_applicable) {
        tva += itemTotal * item.ticket_type.taux_tva;
      }
    });

    const frais = calculateFrais(sous_total);
    let total = sous_total + tva + frais;

    // Appliquer la réduction si code promo
    let reduction = 0;
    if (appliedPromo) {
      reduction = calculatePromoReduction(total, appliedPromo);
      total -= reduction;
    }

    setCart(prev => ({
      ...prev,
      sous_total,
      tva,
      frais,
      total: Math.max(0, total),
      reduction
    }));
  };

  const calculateFrais = (sous_total: number): number => {
    // Frais fixes : 1€ par commande
    // Frais variables : 2.5% du total
    return 1.00 + (sous_total * 0.025);
  };

  const calculatePromoReduction = (total: number, promo: any): number => {
    if (promo.type_reduction === 'percentage') {
      return total * (promo.valeur_reduction / 100);
    } else if (promo.type_reduction === 'fixed') {
      return Math.min(promo.valeur_reduction, total);
    }
    return 0;
  };

  const addToCart = (ticketType: TicketType) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.ticket_type.id === ticketType.id);

      if (existingItem) {
        // Vérifier la quantité maximale
        if (existingItem.quantite >= ticketType.maximum_achat) {
          return prev;
        }

        return {
          ...prev,
          items: prev.items.map(item =>
            item.ticket_type.id === ticketType.id
              ? { ...item, quantite: item.quantite + 1, prix_total: item.prix_unitaire * (item.quantite + 1) }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, {
            ticket_type: ticketType,
            quantite: 1,
            prix_unitaire: ticketType.prix,
            prix_total: ticketType.prix
          }]
        };
      }
    });
  };

  const updateQuantity = (ticketTypeId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const ticketType = ticketTypes.find(tt => tt.id === ticketTypeId);
    if (!ticketType) return;

    if (newQuantity > ticketType.maximum_achat) return;

    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.ticket_type.id === ticketTypeId
          ? { ...item, quantite: newQuantity, prix_total: item.prix_unitaire * newQuantity }
          : item
      )
    }));
  };

  const removeFromCart = (ticketTypeId: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.ticket_type.id !== ticketTypeId)
    }));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsCheckingPromo(true);
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          evenement_id: evenementId,
          montant_total: cart.total
        })
      });

      const result = await response.json();

      if (result.success) {
        setAppliedPromo(result.data.promo_code);
        form.setValue('code_promo', promoCode);
      } else {
        onError?.(result.error || 'Code promo invalide');
      }
    } catch (error) {
      onError?.('Erreur lors de la validation du code promo');
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    form.setValue('code_promo', '');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.items.length === 0) {
      onError?.('Votre panier est vide');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        ...data,
        evenement_id: evenementId,
        billets: cart.items.map(item => ({
          ticket_type_id: item.ticket_type.id,
          quantite: item.quantite
        })),
        montant_total: cart.total,
        montant_sous_total: cart.sous_total,
        montant_tva: cart.tva,
        montant_frais: cart.frais,
        code_promo: appliedPromo?.code
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        onSuccess?.(result.data.order);
      } else {
        onError?.(result.error || 'Erreur lors de la création de la commande');
      }
    } catch (error) {
      onError?.('Erreur lors du traitement de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Finaliser ma commande</h1>
        <p className="text-gray-600 mt-2">
          {ticketTypes.length} type{ticketTypes.length > 1 ? 's' : ''} de billet{ticketTypes.length > 1 ? 's' : ''} disponible{ticketTypes.length > 1 ? 's' : ''}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* Sélection des billets */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Choix des billets
          </h2>

          <div className="grid gap-4">
            {ticketTypes.map(ticketType => (
              <div key={ticketType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{ticketType.nom}</h3>
                    {ticketType.description && (
                      <p className="text-sm text-gray-600 mt-1">{ticketType.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold text-blue-600">
                        {ticketType.prix.toFixed(2)}€
                      </span>

                      {ticketType.quota_total && (
                        <span className="text-sm text-gray-500">
                          {ticketType.quota_disponible ?? 0} / {ticketType.quota_total} disponibles
                        </span>
                      )}

                      {ticketType.billets_vendus > 0 && (
                        <span className="text-sm text-green-600">
                          {ticketType.billets_vendus} vendu{ticketType.billets_vendus > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToCart(ticketType)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      disabled={
                        !ticketType.vente_en_ligne ||
                        (ticketType.quota_total !== null && (ticketType.quota_disponible ?? 0) <= 0)
                      }
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panier */}
        {cart.items.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon panier</h2>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {cart.items.map(item => (
                <div key={item.ticket_type.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.ticket_type.nom}</h4>
                    <p className="text-sm text-gray-600">
                      {item.prix_unitaire.toFixed(2)}€ × {item.quantite}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.ticket_type.id, item.quantite - 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-8 text-center">{item.quantite}</span>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.ticket_type.id, item.quantite + 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      disabled={item.quantite >= item.ticket_type.maximum_achat}
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <span className="w-20 text-right font-medium">
                      {item.prix_total.toFixed(2)}€
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.ticket_type.id)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Code promo */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Code promo"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!!appliedPromo}
                  />
                  {!appliedPromo ? (
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={isCheckingPromo || !promoCode.trim()}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {isCheckingPromo ? '...' : 'Appliquer'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retirer
                    </button>
                  )}
                </div>

                {appliedPromo && (
                  <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm">
                    Code promo appliqué : -{cart.reduction?.toFixed(2)}€
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total :</span>
                  <span>{cart.sous_total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA :</span>
                  <span>{cart.tva.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frais de service :</span>
                  <span>{cart.frais.toFixed(2)}€</span>
                </div>
                {cart.reduction && cart.reduction > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction :</span>
                    <span>-{cart.reduction.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total :</span>
                  <span>{cart.total.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informations acheteur */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations de l'acheteur
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                {...form.register('acheteur_nom')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre nom"
              />
              {form.formState.errors.acheteur_nom && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.acheteur_nom.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                {...form.register('acheteur_prenom')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre prénom"
              />
              {form.formState.errors.acheteur_prenom && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.acheteur_prenom.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                {...form.register('acheteur_email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="votre@email.com"
              />
              {form.formState.errors.acheteur_email && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.acheteur_email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                {...form.register('acheteur_telephone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre numéro de téléphone"
              />
            </div>
          </div>
        </div>

        {/* CGV et consentements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conditions et consentements</h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                {...form.register('accepte_cgv')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <span className="text-sm text-gray-700">
                J'accepte les conditions générales de vente *
              </span>
            </label>

            {form.formState.errors.accepte_cgv && (
              <p className="text-sm text-red-600">
                {form.formState.errors.accepte_cgv.message}
              </p>
            )}

            <label className="flex items-start gap-3">
              <input
                {...form.register('accepte_newsletter')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <span className="text-sm text-gray-700">
                Je souhaite recevoir la newsletter
              </span>
            </label>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Conformément au RGPD, j'accepte que mes données soient utilisées pour :</p>

              <label className="flex items-start gap-3">
                <input
                  {...form.register('consentements_rgpd.commercial')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <span className="text-sm text-gray-700">La communication commerciale</span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  {...form.register('consentements_rgpd.analytics')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <span className="text-sm text-gray-700">Les analyses et statistiques</span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  {...form.register('consentements_rgpd.profiling')}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <span className="text-sm text-gray-700">Le profilage</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bouton de paiement */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || cart.items.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Payer {cart.total.toFixed(2)}€
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;