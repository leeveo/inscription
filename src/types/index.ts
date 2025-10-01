export interface Participant {
  id?: string;
  nom: string;  // Nous choisissons de rendre nom obligatoire
  prenom: string;
  email: string;
  telephone?: string;
  statut?: string;
  evenement_id?: string;
  // Ajoutez d'autres champs selon vos besoins
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
