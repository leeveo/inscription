// Types pour le système avancé de badges d'événements

export type BadgeTemplateType = 'standard' | 'vip' | 'speaker' | 'staff' | 'visitor';
export type BadgeTemplateOrientation = 'portrait' | 'landscape';
export type BadgeStatus = 'active' | 'used' | 'cancelled' | 'expired';
export type PrintType = 'pdf' | 'thermal' | 'local';
export type PrintJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BadgeTemplate {
  id: string;
  event_id: string;
  name: string;
  type: BadgeTemplateType;
  orientation?: BadgeTemplateOrientation;
  schema: BadgeSchema; // Structure du template
  styles: BadgeStyles; // Styles CSS personnalisés
  settings: BadgeSettings; // Paramètres généraux
  preview_image?: string;
  is_default: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BadgeSchema {
  // Structure du template avec zones définies
  layout: {
    width: number;
    height: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  zones: BadgeZone[]; // Zones du badge
  background?: {
    color?: string;
    image?: string;
    opacity?: number;
    gradient?: {
      start: string;
      end: string;
      direction: 'horizontal' | 'vertical' | 'diagonal';
    };
  };
}

export interface BadgeZone {
  id: string;
  type: 'text' | 'image' | 'qr' | 'shape' | 'line' | 'table';
  name: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: BadgeZoneContent;
  style: BadgeZoneStyle;
  data_binding?: string; // Variable liée (ex: "{{participant.name}}")
}

export interface BadgeZoneContent {
  // Contenu selon le type
  text?: string;
  image_url?: string;
  variable?: string; // Variable dynamique
  format?: string; // Formatage
  condition?: string; // Condition d'affichage
}

export interface BadgeZoneStyle {
  // Styles communs
  background?: string;
  border?: string;
  border_radius?: number;
  padding?: number | { top: number; right: number; bottom: number; left: number };
  margin?: number | { top: number; right: number; bottom: number; left: number };

  // Styles texte
  font_family?: string;
  font_size?: number;
  font_weight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  color?: string;
  text_align?: 'left' | 'center' | 'right' | 'justify';
  line_height?: number;

  // Spécifiques aux images
  object_fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  opacity?: number;

  // Rotation et transformation
  rotation?: number;
  transform?: string;
}

export interface BadgeStyles {
  // Styles globaux du template
  global: {
    font_family?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
  };
  css?: string; // CSS personnalisé
}

export interface BadgeSettings {
  // Paramètres généraux
  print: {
    dpi?: number;
    quality?: 'low' | 'medium' | 'high';
    duplex?: boolean;
    color?: boolean;
  };
  qr: {
    error_correction?: 'L' | 'M' | 'Q' | 'H';
    size?: number;
    margin?: number;
    foreground?: string;
    background?: string;
  };
  security: {
    watermark?: boolean;
    watermark_text?: string;
    watermark_opacity?: number;
    serialize?: boolean; // Numérotation automatique
  };
  badge: {
    material?: 'plastic' | 'paper' | 'vinyl';
    lamination?: boolean;
    holder?: 'clip' | 'pin' | 'magnet' | 'lanyard';
  };
}

export interface BadgeInstance {
  id: string;
  event_id: string;
  participant_id: number;
  template_id: string;
  payload: BadgePayload; // Données spécifiques
  qr_data: string;
  badge_number: string;
  status: BadgeStatus;
  issued_at: string;
  used_at?: string;
  print_count: number;
  last_printed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BadgePayload {
  participant_name: string;
  participant_firstname: string;
  participant_lastname: string;
  participant_email: string;
  participant_phone?: string;
  participant_company?: string;
  participant_profession?: string;
  participant_role?: string;
  participant_badge_type?: string;
  participant_access_level?: string;
  participant_permissions?: string[];
  event_name: string;
  event_date: string;
  event_location: string;
  event_description?: string;
  registration_date: string;
  custom_fields?: Record<string, any>;
}

export interface PrintJob {
  id: string;
  badge_instance_id: string;
  print_type: PrintType;
  printer_name?: string;
  print_options: PrintOptions;
  status: PrintJobStatus;
  error_message?: string;
  file_size?: number;
  print_duration?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  retry_count: number;
}

export interface PrintOptions {
  format?: string; // 'A4', 'Letter', '85mm x 55mm', 'credit-card', etc.
  quality?: 'low' | 'medium' | 'high';
  copies?: number;
  color?: boolean;
  duplex?: boolean;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  custom?: Record<string, any>;
}

export interface BadgeTemplateElement {
  id: string;
  key: string;
  label: string;
  category: 'text' | 'image' | 'qr' | 'shape' | 'layout';
  element_type: string;
  schema: Record<string, any>;
  default_props: Record<string, any>;
  preview_image?: string;
  tags: string[];
  is_public: boolean;
  is_system: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface BadgeTemplatePreset {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: string; // 'conference', 'corporate', 'vip', 'staff', 'visitor', etc.
  template_type: BadgeTemplateType;
  schema: BadgeSchema;
  styles: BadgeStyles;
  settings: BadgeSettings;
  preview_image?: string;
  thumbnail?: string;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types pour l'éditeur visuel
export interface BadgeTemplateEditorState {
  template: BadgeTemplate | null;
  selectedZone: BadgeZone | null;
  isEditing: boolean;
  previewMode: 'desktop' | 'mobile';
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface DragDropZone {
  zone: BadgeZone;
  isDragging: boolean;
  isSelected: boolean;
}

// Types pour les formulaires
export interface CreateBadgeTemplateRequest {
  event_id: string;
  name: string;
  type: BadgeTemplateType;
  orientation?: BadgeTemplateOrientation;
  preset_id?: string; // Utiliser un preset comme point de départ
}

export interface UpdateBadgeTemplateRequest {
  name?: string;
  schema?: BadgeSchema;
  styles?: BadgeStyles;
  settings?: BadgeSettings;
  preview_image?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface GenerateBadgeRequest {
  participant_ids: number[];
  template_id?: string; // Optionnel, utilisera le template par défaut
  options?: {
    force_regenerate?: boolean; // Regénérer même si existe déjà
    send_email?: boolean; // Envoyer par email
  };
}

export interface PrintBadgeRequest {
  badge_instance_id: string;
  print_type: PrintType;
  printer_name?: string;
  print_options?: PrintOptions;
}

// Types pour les réponses API
export interface BadgeTemplateResponse {
  success: boolean;
  data?: BadgeTemplate;
  templates?: BadgeTemplate[];
  message?: string;
  error?: string;
}

export interface BadgeInstanceResponse {
  success: boolean;
  data?: BadgeInstance;
  instances?: BadgeInstance[];
  message?: string;
  error?: string;
}

export interface PrintJobResponse {
  success: boolean;
  data?: PrintJob;
  jobs?: PrintJob[];
  download_url?: string; // URL pour télécharger le PDF/impression
  message?: string;
  error?: string;
}

// Types pour les statistiques
export interface BadgeStats {
  total_badges: number;
  active_badges: number;
  used_badges: number;
  printed_badges: number;
  templates_count: number;
  recent_print_jobs: PrintJob[];
  popular_templates: Array<{
    template: BadgeTemplate;
    usage_count: number;
  }>;
}

// Variables disponibles pour les templates de badges
export const BADGE_TEMPLATE_VARIABLES = {
  EVENT: {
    name: '{{event_name}}',
    date: '{{event_date}}',
    location: '{{event_location}}',
    description: '{{event_description}}',
  },
  PARTICIPANT: {
    firstname: '{{participant_firstname}}',
    lastname: '{{participant_lastname}}',
    name: '{{participant_name}}',
    email: '{{participant_email}}',
    phone: '{{participant_phone}}',
    company: '{{participant_company}}',
    profession: '{{participant_profession}}',
    role: '{{participant_role}}',
    badge_type: '{{participant_badge_type}}',
    access_level: '{{participant_access_level}}',
    permissions: '{{participant_permissions}}',
  },
  BADGE: {
    number: '{{badge_number}}',
    qr_code: '{{qr_code}}',
    url: '{{badge_url}}',
  },
  DATES: {
    registration: '{{registration_date}}',
    issued: '{{issued_date}}',
    current: '{{current_date}}',
  }
} as const;

export type BadgeTemplateVariable = typeof BADGE_TEMPLATE_VARIABLES;