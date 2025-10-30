// Types pour les données de badges et templates

import { BadgeTemplate, BadgeSchema, BadgeZone, BadgeStyles, BadgeSettings } from './badge';

export interface BadgeData {
  // Event Information
  eventName: string;
  eventId: string;
  eventType: string;
  organizerName: string;
  organizerContact: {
    email: string;
    phone: string;
    website: string;
  };
  venue: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    capacity: number;
  };
  schedule: {
    startDate: string;
    endDate: string;
    doorsOpen: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  description?: string;
  termsUrl?: string;
  websiteUrl?: string;

  // Attendee Information
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  company?: string;
  profession?: string;
  badgeId: string;
  registrationDate: string;
  registrationSource: string;
  role?: string;
  department?: string;

  // Badge Information
  badgeType: string;
  badgeCategory: string;
  accessLevel: string;
  seating: {
    section?: string;
    table?: string;
    chair?: string;
  };
  benefits: string[];
  restrictions: string[];
  addOns: Array<{
    name: string;
    quantity: number;
  }>;

  // Security & Access
  qrCode: string;
  qrUrl: string;
  barcode: string;
  barcodeFormat: string;
  badgeNumber: string;
  serialNumber: string;
  securityFeatures: {
    watermark: boolean;
    hologram: boolean;
    uvFeatures: boolean;
    microtext: boolean;
  };
  validation: {
    validFrom: string;
    validUntil: string;
    maxEntries: number;
    usedEntries: number;
  };

  // Legal Information
  termsAndConditions?: string;
  privacyPolicy?: string;
  liabilityWaiver?: string;
  ageRestriction?: string;
  photoConsent?: string;
  dataProtection?: string;

  // Layout Options
  format: {
    size: string;
    orientation: 'portrait' | 'landscape';
    width: number;
    height: number;
    units: string;
  };
  layout: {
    columns: number;
    rows: number;
    spacing: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    perforation: boolean;
    folding: boolean;
  };

  // Media
  backgroundImage?: string;
  photoUrl?: string;
  logoUrl?: string;
}

// Étendre BadgeTemplate avec les propriétés utilisées dans l'éditeur
export interface ExtendedBadgeTemplate extends BadgeTemplate {
  width: number;
  height: number;
  zones: BadgeZone[];
  background: BadgeSchema['background'];
  styles: BadgeStyles;
}

// Types pour l'éditeur de badge
export interface BadgeTemplateSelectorProps {
  eventId: string;
  onTemplateSelect: (template: ExtendedBadgeTemplate) => void;
  onTemplateEdit: (template: ExtendedBadgeTemplate) => void;
  selectedTemplate?: ExtendedBadgeTemplate;
}

export interface BadgeEditorProps {
  template: ExtendedBadgeTemplate;
  onTemplateChange: (template: ExtendedBadgeTemplate) => void;
  onSave: () => void;
  data: BadgeData;
  onDataChange: (data: BadgeData) => void;
}

export interface BadgePDFGeneratorProps {
  template: ExtendedBadgeTemplate;
  data: BadgeData;
}

// Templates prédéfinis pour badges
export const CORPORATE_BADGE_TEMPLATE: ExtendedBadgeTemplate = {
  id: 'corporate-badge',
  event_id: '',
  name: 'Badge Corporate',
  type: 'standard',
  orientation: 'portrait',
  width: 105,
  height: 148,
  schema: {
    layout: {
      width: 105,
      height: 148,
      margins: { top: 8, right: 8, bottom: 8, left: 8 }
    },
    zones: [
      {
        id: 'company-logo',
        type: 'image',
        name: 'Logo Entreprise',
        position: { x: 8, y: 8, width: 35, height: 25 },
        content: { image_url: '{{logoUrl}}' },
        style: { object_fit: 'contain' }
      },
      {
        id: 'participant-name',
        type: 'text',
        name: 'Nom Participant',
        position: { x: 15, y: 40, width: 75, height: 18 },
        content: { text: '{{fullName}}', variable: 'fullName' },
        style: {
          font_size: 18,
          font_weight: 'bold',
          text_align: 'center',
          color: '#000000'
        }
      },
      {
        id: 'participant-company',
        type: 'text',
        name: 'Entreprise',
        position: { x: 15, y: 60, width: 75, height: 12 },
        content: { text: '{{company}}', variable: 'company' },
        style: {
          font_size: 12,
          text_align: 'center',
          color: '#666666'
        }
      },
      {
        id: 'role-badge',
        type: 'shape',
        name: 'Badge Rôle',
        position: { x: 15, y: 80, width: 75, height: 25 },
        content: { text: '' },
        style: {
          background: '#1f2937',
          border_radius: 5,
          borderWidth: 0
        }
      },
      {
        id: 'role-text',
        type: 'text',
        name: 'Texte Rôle',
        position: { x: 15, y: 87, width: 75, height: 12 },
        content: { text: '{{role}}', variable: 'role' },
        style: {
          color: '#FFFFFF',
          font_size: 12,
          font_weight: 'bold',
          text_align: 'center'
        }
      },
      {
        id: 'qr-code',
        type: 'qr',
        name: 'QR Code',
        position: { x: 70, y: 115, width: 25, height: 25 },
        content: { variable: 'qrCode' },
        style: {}
      }
    ],
    background: {
      color: '#FFFFFF'
    }
  },
  styles: {
    global: {
      font_family: 'Arial',
      primary_color: '#000000',
      secondary_color: '#666666',
      accent_color: '#3B82F6',
      background_color: '#FFFFFF',
      text_color: '#000000'
    }
  },
  settings: {
    print: {
      dpi: 300,
      quality: 'high',
      duplex: false,
      color: true
    },
    qr: {
      error_correction: 'M',
      size: 150,
      margin: 2,
      foreground: '#000000',
      background: '#FFFFFF'
    },
    security: {
      watermark: false,
      watermark_opacity: 0.1,
      serialize: true
    },
    badge: {
      material: 'plastic',
      lamination: true,
      holder: 'lanyard'
    }
  },
  preview_image: '',
  is_default: false,
  is_active: true,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const CONFERENCE_BADGE_TEMPLATE: ExtendedBadgeTemplate = {
  id: 'conference-badge',
  event_id: '',
  name: 'Badge Conférence',
  type: 'standard',
  orientation: 'portrait',
  width: 105,
  height: 148,
  schema: {
    layout: {
      width: 105,
      height: 148,
      margins: { top: 5, right: 5, bottom: 5, left: 5 }
    },
    zones: [
      {
        id: 'event-header',
        type: 'shape',
        name: 'En-tête Événement',
        position: { x: 0, y: 0, width: 105, height: 35 },
        content: { text: '' },
        style: {
          background: '#3B82F6',
          border_radius: 8,
          borderWidth: 0
        }
      },
      {
        id: 'event-name',
        type: 'text',
        name: 'Nom Événement',
        position: { x: 0, y: 10, width: 105, height: 14 },
        content: { text: '{{eventName}}', variable: 'eventName' },
        style: {
          color: '#FFFFFF',
          font_size: 14,
          font_weight: 'bold',
          text_align: 'center'
        }
      },
      {
        id: 'participant-name',
        type: 'text',
        name: 'Nom Participant',
        position: { x: 8, y: 50, width: 89, height: 20 },
        content: { text: '{{fullName}}', variable: 'fullName' },
        style: {
          font_size: 18,
          font_weight: 'bold',
          text_align: 'center',
          color: '#000000'
        }
      },
      {
        id: 'participant-info',
        type: 'text',
        name: 'Info Participant',
        position: { x: 8, y: 75, width: 89, height: 12 },
        content: { text: '{{company}} - {{profession}}', variable: 'company' },
        style: {
          font_size: 12,
          text_align: 'center',
          color: '#666666'
        }
      },
      {
        id: 'qr-code',
        type: 'qr',
        name: 'QR Code',
        position: { x: 72, y: 105, width: 28, height: 28 },
        content: { variable: 'qrCode' },
        style: {}
      }
    ],
    background: {
      color: '#FFFFFF'
    }
  },
  styles: {
    global: {
      font_family: 'Arial',
      primary_color: '#000000',
      secondary_color: '#666666',
      accent_color: '#3B82F6',
      background_color: '#FFFFFF',
      text_color: '#000000'
    }
  },
  settings: {
    print: {
      dpi: 300,
      quality: 'high',
      duplex: false,
      color: true
    },
    qr: {
      error_correction: 'M',
      size: 150,
      margin: 2,
      foreground: '#000000',
      background: '#FFFFFF'
    },
    security: {
      watermark: false,
      watermark_opacity: 0.1,
      serialize: true
    },
    badge: {
      material: 'plastic',
      lamination: true,
      holder: 'lanyard'
    }
  },
  preview_image: '',
  is_default: false,
  is_active: true,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const VIP_BADGE_TEMPLATE: ExtendedBadgeTemplate = {
  id: 'vip-badge',
  event_id: '',
  name: 'Badge VIP',
  type: 'vip',
  orientation: 'portrait',
  width: 105,
  height: 148,
  schema: {
    layout: {
      width: 105,
      height: 148,
      margins: { top: 5, right: 5, bottom: 5, left: 5 }
    },
    zones: [
      {
        id: 'vip-header',
        type: 'shape',
        name: 'En-tête VIP',
        position: { x: 0, y: 0, width: 105, height: 40 },
        content: { text: '' },
        style: {
          background: 'linear-gradient(135deg, #DC2626, #F59E0B)',
          border_radius: 8,
          borderWidth: 0
        }
      },
      {
        id: 'vip-label',
        type: 'text',
        name: 'Label VIP',
        position: { x: 0, y: 12, width: 105, height: 14 },
        content: { text: '⭐ VIP ACCESS ⭐' },
        style: {
          color: '#FFFFFF',
          font_size: 14,
          font_weight: 'bold',
          text_align: 'center'
        }
      },
      {
        id: 'participant-name',
        type: 'text',
        name: 'Nom Participant',
        position: { x: 8, y: 55, width: 89, height: 20 },
        content: { text: '{{fullName}}', variable: 'fullName' },
        style: {
          font_size: 18,
          font_weight: 'bold',
          text_align: 'center',
          color: '#000000'
        }
      },
      {
        id: 'participant-company',
        type: 'text',
        name: 'Entreprise',
        position: { x: 8, y: 80, width: 89, height: 12 },
        content: { text: '{{company}}', variable: 'company' },
        style: {
          font_size: 12,
          text_align: 'center',
          color: '#666666'
        }
      },
      {
        id: 'qr-code',
        type: 'qr',
        name: 'QR Code',
        position: { x: 72, y: 105, width: 28, height: 28 },
        content: { variable: 'qrCode' },
        style: {}
      },
      {
        id: 'badge-number',
        type: 'text',
        name: 'Numéro Badge',
        position: { x: 5, y: 52, width: 50, height: 6 },
        content: { text: '{{badgeNumber}}', variable: 'badgeNumber' },
        style: {
          font_size: 8,
          text_align: 'left',
          color: '#999999'
        }
      }
    ],
    background: {
      gradient: {
        start: '#FFF8DC',
        end: '#FFFAF0',
        direction: 'diagonal'
      }
    }
  },
  styles: {
    global: {
      font_family: 'Arial',
      primary_color: '#000000',
      secondary_color: '#666666',
      accent_color: '#F59E0B',
      background_color: '#FFF8DC',
      text_color: '#000000'
    }
  },
  settings: {
    print: {
      dpi: 300,
      quality: 'high',
      duplex: false,
      color: true
    },
    qr: {
      error_correction: 'M',
      size: 150,
      margin: 2,
      foreground: '#000000',
      background: '#FFFFFF'
    },
    security: {
      watermark: false,
      watermark_opacity: 0.1,
      serialize: true
    },
    badge: {
      material: 'plastic',
      lamination: true,
      holder: 'lanyard'
    }
  },
  preview_image: '',
  is_default: false,
  is_active: true,
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const BADGE_TEMPLATE_PRESETS = {
  CORPORATE_BADGE_TEMPLATE,
  CONFERENCE_BADGE_TEMPLATE,
  VIP_BADGE_TEMPLATE
} as const;