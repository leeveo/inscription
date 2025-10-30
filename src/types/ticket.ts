// Types pour le système avancé de tickets de concert

export type TicketTemplateType = 'a4' | 'thermal' | 'mobile';
export type TicketTemplateOrientation = 'portrait' | 'landscape';
export type TicketStatus = 'active' | 'used' | 'cancelled' | 'expired';
export type PrintType = 'pdf' | 'thermal' | 'local';
export type PrintJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TicketTemplate {
  id: string;
  event_id: string;
  name: string;
  type: TicketTemplateType;
  orientation?: TicketTemplateOrientation;
  schema: TicketSchema; // Structure du template
  styles: TicketStyles; // Styles CSS personnalisés
  settings: TicketSettings; // Paramètres généraux
  preview_image?: string;
  is_default: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TicketSchema {
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
  zones: TicketZone[]; // Zones du ticket
  background?: {
    color?: string;
    image?: string;
    opacity?: number;
  };
}

export interface TicketZone {
  id: string;
  type: 'text' | 'image' | 'qr' | 'barcode' | 'shape' | 'line' | 'table';
  name: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: TicketZoneContent;
  style: TicketZoneStyle;
  data_binding?: string; // Variable liée (ex: "{{participant.name}}")
}

export interface TicketZoneContent {
  // Contenu selon le type
  text?: string;
  image_url?: string;
  variable?: string; // Variable dynamique
  format?: string; // Formatage
  condition?: string; // Condition d'affichage
}

export interface TicketZoneStyle {
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

export interface TicketStyles {
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

export interface TicketSettings {
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
  barcode: {
    format?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14';
    width?: number;
    height?: number;
    show_text?: boolean;
  };
  security: {
    watermark?: boolean;
    watermark_text?: string;
    watermark_opacity?: number;
    serialize?: boolean; // Numérotation automatique
  };
}

export interface TicketInstance {
  id: string;
  event_id: string;
  participant_id: number;
  template_id: string;
  payload: TicketPayload; // Données spécifiques
  qr_data: string;
  barcode_data?: string;
  ticket_number: string;
  status: TicketStatus;
  issued_at: string;
  used_at?: string;
  print_count: number;
  last_printed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketPayload {
  participant_name: string;
  participant_firstname: string;
  participant_lastname: string;
  participant_email: string;
  participant_phone?: string;
  participant_profession?: string;
  participant_sessions?: string[];
  event_name: string;
  event_date: string;
  event_location: string;
  event_description?: string;
  registration_date: string;
  custom_fields?: Record<string, any>;
}

export interface PrintJob {
  id: string;
  ticket_instance_id: string;
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
  format?: string; // 'A4', 'Letter', '80mm', '58mm', etc.
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

export interface TicketTemplateElement {
  id: string;
  key: string;
  label: string;
  category: 'text' | 'image' | 'qr' | 'barcode' | 'shape' | 'layout';
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

export interface TicketTemplatePreset {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: string; // 'concert', 'conference', 'theatre', 'sports', etc.
  template_type: TicketTemplateType;
  schema: TicketSchema;
  styles: TicketStyles;
  settings: TicketSettings;
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
export interface TemplateEditorState {
  template: TicketTemplate | null;
  selectedZone: TicketZone | null;
  isEditing: boolean;
  previewMode: 'desktop' | 'mobile' | 'thermal';
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface DragDropZone {
  zone: TicketZone;
  isDragging: boolean;
  isSelected: boolean;
}

// Types pour les formulaires
export interface CreateTicketTemplateRequest {
  event_id: string;
  name: string;
  type: TicketTemplateType;
  orientation?: TicketTemplateOrientation;
  preset_id?: string; // Utiliser un preset comme point de départ
}

export interface UpdateTicketTemplateRequest {
  name?: string;
  schema?: TicketSchema;
  styles?: TicketStyles;
  settings?: TicketSettings;
  preview_image?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface GenerateTicketRequest {
  participant_ids: number[];
  template_id?: string; // Optionnel, utilisera le template par défaut
  options?: {
    force_regenerate?: boolean; // Regénérer même si existe déjà
    send_email?: boolean; // Envoyer par email
  };
}

export interface PrintTicketRequest {
  ticket_instance_id: string;
  print_type: PrintType;
  printer_name?: string;
  print_options?: PrintOptions;
}

// Types pour les réponses API
export interface TicketTemplateResponse {
  success: boolean;
  data?: TicketTemplate;
  templates?: TicketTemplate[];
  message?: string;
  error?: string;
}

export interface TicketInstanceResponse {
  success: boolean;
  data?: TicketInstance;
  instances?: TicketInstance[];
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
export interface TicketStats {
  total_tickets: number;
  active_tickets: number;
  used_tickets: number;
  printed_tickets: number;
  templates_count: number;
  recent_print_jobs: PrintJob[];
  popular_templates: Array<{
    template: TicketTemplate;
    usage_count: number;
  }>;
}

// Variables disponibles pour les templates
export const TEMPLATE_VARIABLES = {
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
    profession: '{{participant_profession}}',
    sessions: '{{participant_sessions}}',
  },
  TICKET: {
    number: '{{ticket_number}}',
    qr_code: '{{qr_code}}',
    barcode: '{{barcode}}',
    url: '{{ticket_url}}',
  },
  DATES: {
    registration: '{{registration_date}}',
    issued: '{{issued_date}}',
    current: '{{current_date}}',
  }
} as const;

export type TemplateVariable = typeof TEMPLATE_VARIABLES;