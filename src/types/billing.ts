// ========================================
// TYPES BILLETERIE SaaS
// ========================================
// Types TypeScript pour le système de billetterie
// Compatible avec les types existants dans src/types/index.ts
// ========================================

export * from './tickets';
export * from './badge';

// ========================================
// ORGANISATIONS (MULTI-TENANT)
// ========================================

export interface Organization {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  email_contact: string;
  telephone_contact?: string;

  // Informations légales
  siret?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  pays: string;

  // Configuration billetterie
  stripe_connect_id?: string;
  billing_email: string;
  tva_rate: number;

  // Settings
  settings: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ========================================
// TYPES DE BILLETS / TARIFS
// ========================================

export type TicketTypeTarif = 'early' | 'standard' | 'late' | 'vip';

export interface TicketType {
  id: number;
  evenement_id: string;
  organization_id?: string;

  // Informations tarifaires
  nom: string;
  description?: string;
  prix: number;
  devise: string;

  // Gestion des quotas
  quota_total?: number;
  quota_disponible?: number | null; // null = illimité
  billets_vendus: number;

  // Périodes de tarification
  type_tarif: TicketTypeTarif;
  date_debut_vente?: string;
  date_fin_vente?: string;

  // Configuration
  visible: boolean;
  vente_en_ligne: boolean;
  minimum_achat: number;
  maximum_achat: number;

  // Taxes
  tva_applicable: boolean;
  taux_tva: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ========================================
// COMMANDES (ORDERS)
// ========================================

export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'cancelled' | 'refunded' | 'expired';
export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'sepa' | 'cash' | 'other';

export interface Order {
  id: string;
  order_number: string;
  evenement_id: string;
  organization_id?: string;

  // Acheteur
  acheteur_nom: string;
  acheteur_prenom: string;
  acheteur_email: string;
  acheteur_telephone?: string;

  // État de la commande
  statut: OrderStatus;

  // Montants
  montant_total: number;
  montant_sous_total: number;
  montant_tva: number;
  montant_frais: number;
  devise: string;

  // Paiement
  payment_method?: PaymentMethod;
  payment_intent_id?: string;
  stripe_charge_id?: string;

  // Tracking et analytics
  source_achat: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  affiliate_id?: string;

  // Données additionnelles
  notes?: string;
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
  paid_at?: string;
  expired_at?: string;
}

// ========================================
// ITEMS DE COMMANDE
// ========================================

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_type_id: number;

  // Détails de l'item
  quantite: number;
  prix_unitaire: number;
  prix_total: number;

  // Participant associé (pour les billets nominatifs)
  participant_id?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ========================================
// PAIEMENTS
// ========================================

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export interface Payment {
  id: string;
  order_id: string;

  // Informations Stripe
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_balance_transaction_id?: string;

  // Détails du paiement
  montant: number;
  devise: string;
  payment_method: PaymentMethod;

  // État du paiement
  statut: PaymentStatus;

  // Informations de carte (si applicable)
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;

  // Fees et commissions
  frais_stripe: number;
  commission_plateforme: number;

  // Metadata
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

// ========================================
// REMBOURSEMENTS
// ========================================

export type RefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'requested_by_organizer' | 'event_cancelled';
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled';

export interface Refund {
  id: string;
  payment_id: string;
  order_id: string;

  // Stripe refund
  stripe_refund_id?: string;

  // Montants
  montant: number;
  devise: string;

  // Raison du remboursement
  raison: string;
  type_raison: RefundReason;

  // État
  statut: RefundStatus;

  // Traitement
  processed_by?: string;
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

// ========================================
// CODES PROMOTIONNELS
// ========================================

export type PromoCodeType = 'percentage' | 'fixed' | 'bogo';

export interface PromoCode {
  id: string;
  evenement_id: string;
  organization_id?: string;

  // Code et configuration
  code: string;
  description?: string;

  // Type de réduction
  type_reduction: PromoCodeType;
  valeur_reduction: number;

  // Conditions d'utilisation
  montant_minimum?: number;
  utilisation_maximum?: number;
  utilisation_par_client: number;

  // Période de validité
  date_debut: string;
  date_fin?: string;

  // Restriction par type de billet
  ticket_types_applicables?: number[];

  // Tracking
  utilise_count: number;

  // État
  actif: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUse {
  id: string;
  promo_code_id: string;
  order_id: string;
  client_email: string;
  montant_reduction: number;
  created_at: string;
}

// ========================================
// BUNDLES DE BILLETS
// ========================================

export interface BundleItem {
  ticket_type_id: number;
  quantite: number;
}

export interface Bundle {
  id: string;
  evenement_id: string;
  organization_id?: string;

  // Configuration du bundle
  nom: string;
  description?: string;

  // Prix du bundle
  prix_total: number;
  pourcentage_reduction?: number;

  // Contenu du bundle
  contenu: BundleItem[];

  // Disponibilité
  quota_total?: number;
  quota_vendu: number;

  // Période de validité
  date_debut: string;
  date_fin?: string;

  // État
  actif: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ========================================
// AFFILIATION
// ========================================

export type AffiliateCommissionType = 'percentage' | 'fixed';

export interface Affiliate {
  id: string;
  organization_id?: string;

  // Informations affilié
  nom: string;
  email: string;
  telephone?: string;

  // Configuration commission
  type_commission: AffiliateCommissionType;
  valeur_commission: number;

  // Code affilié unique
  code_affilie: string;

  // Paiements
  paypal_email?: string;
  iban?: string;
  bic?: string;

  // État
  actif: boolean;
  approuve: boolean;

  // Stats
  total_commissions: number;
  total_ventes: number;
  nombre_ventes: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AffiliateClick {
  id: string;
  affiliate_id: string;
  evenement_id?: string;

  // Tracking
  url_origine?: string;
  referer?: string;
  user_agent?: string;
  ip_address?: string;

  // UTM parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;

  // Conversion tracking
  order_id?: string;

  // Timestamp
  created_at: string;
}

// ========================================
// LOGS D'ACCÈS POUR ANALYTICS
// ========================================

export type AccessLogPageType = 'landing_page' | 'checkout' | 'payment' | 'confirmation' | 'admin';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface AccessLog {
  id: string;
  evenement_id?: string;

  // Page consultée
  page_type: AccessLogPageType;
  page_url?: string;

  // Visitor info
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referer?: string;

  // Tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  affiliate_code?: string;

  // Device info
  device_type?: DeviceType;
  browser?: string;
  os?: string;

  // Conversion tracking
  order_id?: string;

  // Timestamp
  created_at: string;
}

// ========================================
// EXTENSIONS DES TYPES EXISTANTS
// ========================================

// Extension du type Event existant
export interface EventWithBilling {
  // Champs existants (de src/types/index.ts)
  id: string;
  nom: string;
  description?: string;
  lieu?: string;
  date_debut: string;
  date_fin: string;
  prix?: number;
  places_disponibles?: number;
  organisateur?: string;
  email_contact?: string;
  telephone_contact?: string;
  logo_url?: string;
  statut: string;
  type_evenement: string;
  code_acces?: string;
  created_at: string;

  // Nouveaux champs billetterie
  billetterie_active: boolean;
  billetterie_settings: Record<string, any>;
  organization_id?: string;
  capacite_max_evenement?: number;
  billets_vendus_evenement: number;
  date_fin_vente?: string;
  vente_en_ligne_active: boolean;
  tva_applicable: boolean;
  taux_tva_defaut: number;
  devise: string;
  stripe_connect_id?: string;
  payment_methods_allowed: PaymentMethod[];
  settings_avances: Record<string, any>;
}

// Extension du type Participant existant
export interface ParticipantWithBilling {
  // Champs existants (de src/types/index.ts)
  id: number;
  evenement_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profession?: string;
  site_web?: string;
  date_naissance?: string;
  url_linkedin?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_instagram?: string;
  checked_in: boolean;
  checked_in_at?: string;
  token_landing_page?: string;
  ticket_sent: boolean;
  ticket_sent_at?: string;
  created_at: string;

  // Nouveaux champs billetterie
  order_id?: string;
  ticket_type_id?: number;
  order_item_id?: string;
  source_inscription: 'gratuite' | 'payante' | 'manuelle' | 'import' | 'affiliate';
  prix_paye?: number;
  devise_paiement?: string;
  statut_paiement?: 'gratuit' | 'paye' | 'en_attente' | 'annule' | 'rembourse';
  rembourse_id?: string;
  date_paiement?: string;
  metadata_billetterie: Record<string, any>;
}

// ========================================
// VUES UTILITAIRES
// ========================================

export interface AllParticipantsView {
  // Champs participant
  id: number;
  evenement_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  // ... autres champs participant

  // Champs additionnels
  type_participant: 'gratuit' | 'payant';
  numero_commande: string;
  statut_commande: string;
  nom_billet: string;
  montant_final: number;
}

export interface EventStatsView {
  evenement_id: string;
  evenement_nom: string;
  total_participants: number;
  participants_gratuits: number;
  participants_payants: number;
  chiffre_affaires: number;
  billetterie_active: boolean;
  capacite_max_evenement?: number;
  billets_vendus_evenement: number;
}

export interface EventSalesView {
  evenement_id: string;
  evenement_nom: string;
  nombre_commandes: number;
  commandes_payees: number;
  chiffre_affaires: number;
  tva_collectee: number;
  participants_uniques: number;
  derniere_vente?: string;
}

// ========================================
// FORMULAIRES ET INTERFACES
// ========================================

export interface CheckoutFormData {
  // Informations acheteur
  acheteur_nom: string;
  acheteur_prenom: string;
  acheteur_email: string;
  acheteur_telephone?: string;

  // Sélection des billets
  billets: {
    ticket_type_id: number;
    quantite: number;
  }[];

  // Code promo
  code_promo?: string;

  // CGV et consentements
  accepte_cgv: boolean;
  accepte_newsletter: boolean;
  consentements_rgpd: {
    commercial: boolean;
    analytics: boolean;
    profiling: boolean;
  };
}

export interface BillingSettings {
  // Configuration générale
  devise: string;
  tva_applicable: boolean;
  taux_tva_defaut: number;

  // Méthodes de paiement
  payment_methods: PaymentMethod[];

  // Frais
  frais_fixes: number;
  frais_percentage: number;

  // Configuration Stripe
  stripe_publishable_key: string;
  stripe_connect_id?: string;

  // Confirmation emails
  email_confirmation_achat: boolean;
  email_billets: boolean;

  // Limites
  delai_paiement_minutes: number;
  delai_annulation_heures: number;
}

export interface TicketTypeFormData {
  nom: string;
  description?: string;
  prix: number;
  type_tarif: TicketTypeTarif;
  quota_total?: number;
  date_debut_vente?: string;
  date_fin_vente?: string;
  visible: boolean;
  vente_en_ligne: boolean;
  minimum_achat: number;
  maximum_achat: number;
  tva_applicable: boolean;
  taux_tva: number;
}

// ========================================
// RÉPONSES API
// ========================================

export interface CreateOrderResponse {
  success: boolean;
  data?: {
    order: Order;
    payment_intent?: {
      client_secret: string;
      payment_intent_id: string;
    };
  };
  error?: string;
}

export interface ApplyPromoCodeResponse {
  success: boolean;
  data?: {
    promo_code: PromoCode;
    reduction: number;
    nouveau_total: number;
  };
  error?: string;
}

export interface CheckQuotaResponse {
  success: boolean;
  data?: {
    disponible: boolean;
    quantite_disponible: number;
    quota_depassee: boolean;
  };
  error?: string;
}

export interface EventBillingStatsResponse {
  success: boolean;
  data?: {
    total_ventes: number;
    total_participants: number;
    chiffre_affaires: number;
    billets_par_type: Array<{
      ticket_type_id: number;
      nom: string;
      quantite_vendue: number;
      chiffre_affaires: number;
    }>;
    ventes_par_jour: Array<{
      date: string;
      nombre_ventes: number;
      chiffre_affaires: number;
    }>;
  };
  error?: string;
}

// ========================================
// UTILITAIRES
// ========================================

export interface BillingContext {
  event: EventWithBilling;
  ticketTypes: TicketType[];
  order?: Order;
  userCurrency: string;
  locale: string;
}

export interface QuotaReservation {
  ticket_type_id: number;
  quantite: number;
  expires_at: string;
  reservation_id: string;
}

export interface CartItem {
  ticket_type: TicketType;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

export interface Cart {
  items: CartItem[];
  sous_total: number;
  tva: number;
  frais: number;
  total: number;
  promo_code?: PromoCode;
  reduction: number;
}

export type BillingError =
  | 'QUOTA_DEPASSE'
  | 'BILLET_INDISPONIBLE'
  | 'PROMO_CODE_INVALIDE'
  | 'PROMO_CODE_EXPIRE'
  | 'PROMO_CODE_UTILISE'
  | 'PAIEMENT_ECHOUE'
  | 'COMMANDE_INEXISTANTE'
  | 'EVENEMENT_INEXISTANT'
  | 'ORGANISATION_NON_AUTORISEE'
  | 'VALIDATION_ERROR';

export interface BillingApiError {
  error: BillingError;
  message: string;
  details?: Record<string, any>;
}