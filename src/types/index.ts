export interface Participant {
  id?: string;
  nom: string;  // Champ obligatoire
  prenom: string;  // Champ obligatoire
  email: string;  // Champ obligatoire
  telephone?: string;
  entreprise?: string; // Nouveau champ entreprise
  profession?: string;
  site_web?: string;
  date_naissance?: string;
  url_linkedin?: string;
  url_facebook?: string;
  url_twitter?: string;
  url_instagram?: string;
  statut?: string;
  evenement_id?: string;
  created_at?: string;
  updated_at?: string;
  checked_in?: boolean;
}

// Types pour les modèles de landing page
export interface LandingPageTemplate {
  id: string
  name: string
  description: string
  preview: string
  thumbnail: string
  category: 'business' | 'creative' | 'minimal' | 'modern'
  features: string[]
  isPremium?: boolean
}

export interface LandingPageCustomization {
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  backgroundColor?: string
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  ctaButtonText?: string
  logoUrl?: string
  backgroundImage?: string
  customCSS?: string
}

export interface LandingPageConfig {
  templateId: string
  customization: LandingPageCustomization
}

export interface LandingPageConfigDB {
  id: string
  event_id: string
  template_id: string
  customization: LandingPageCustomization
  created_at: string
  updated_at: string
}

// Type pour les événements
export interface Event {
  id: string;
  nom: string;
  description?: string;
  lieu: string;
  date_debut: string;
  date_fin?: string;
  prix?: number;
  places_disponibles?: number;
  organisateur?: string;
  email_contact?: string;
  telephone_contact?: string;
  logo_url?: string;
  statut: 'brouillon' | 'publié' | 'archivé';
  type_evenement?: string;
  code_acces?: string;
  email_envoi?: string; // Nouveau champ pour l'email d'envoi personnalisé
  created_at?: string;
  updated_at?: string;
}
