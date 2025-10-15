// Types pour le système de templates de tickets

export interface TicketTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'concert' | 'conference' | 'sports' | 'theatre' | 'custom';
  preview: string;
  template: TicketTemplate;
}

export interface TicketTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  background: {
    color: string;
    image?: string;
    gradient?: {
      start: string;
      end: string;
      direction: 'horizontal' | 'vertical' | 'diagonal';
    };
  };
  zones: TicketZone[];
  styles: {
    global: {
      fontFamily: string;
      color: string;
    };
    customCSS?: string;
  };
}

export interface TicketZone {
  id: string;
  type: 'text' | 'image' | 'barcode' | 'qrcode' | 'rectangle' | 'circle';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: TicketZoneContent;
  style: TicketZoneStyle;
  locked?: boolean;
  required?: boolean;
}

export interface TicketZoneContent {
  type: 'static' | 'dynamic' | 'image';
  value?: string;
  variable?: string;
  placeholder?: string;
  imageUrl?: string;
}

export interface TicketZoneStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | number;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  padding?: number;
  margin?: number;
  opacity?: number;
  rotation?: number;
}

// Types pour les données du ticket
export interface EventData {
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
  pricing: {
    currency: string;
    price: number;
    fees: number;
    tax: number;
    total: number;
  };
  description: string;
  termsUrl: string;
  websiteUrl: string;
}

export interface AttendeeData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  dateOfBirth?: string;
  profession?: string;
  company?: string;
  ticketId: string;
  registrationDate: string;
  registrationSource: string;
}

export interface ProductData {
  ticketType: string;
  ticketCategory: string;
  accessLevel: string;
  seating: {
    section: string;
    row: string;
    seat: string;
    entrance: string;
  };
  benefits: string[];
  restrictions: string[];
  addOns: {
    name: string;
    quantity: number;
  }[];
}

export interface SecurityData {
  qrCode: string;
  qrUrl: string;
  barcode: string;
  barcodeFormat: string;
  ticketNumber: string;
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
}

export interface LegalData {
  termsAndConditions: string;
  privacyPolicy: string;
  liabilityWaiver: string;
  cancelationPolicy: string;
  ageRestriction: string;
  photoConsent: string;
  dataProtection: string;
}

export interface TemplateLayoutOptions {
  format: {
    size: 'A4' | 'A5' | 'A6' | 'A7' | 'custom';
    orientation: 'portrait' | 'landscape';
    width: number;
    height: number;
    units: 'mm' | 'inches' | 'pixels';
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
  design: {
    colorScheme: string[];
    typography: {
      primaryFont: string;
      secondaryFont: string;
      headingFont: string;
    };
    branding: {
      logo: string;
      sponsorLogos: string[];
      colorProfile: string;
    };
  };
}

export interface TicketData {
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
  description: string;
  termsUrl: string;
  websiteUrl: string;

  // Attendee Information
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  dateOfBirth?: string;
  profession?: string;
  company?: string;
  ticketId: string;
  registrationDate: string;
  registrationSource: string;

  // Product Information
  ticketType: string;
  ticketCategory: string;
  accessLevel: string;
  seating: {
    section: string;
    row: string;
    seat: string;
    entrance: string;
  };
  benefits: string[];
  restrictions: string[];
  addOns: {
    name: string;
    quantity: number;
  }[];

  // Pricing Information
  currency: string;
  price: number;
  fees: number;
  tax: number;
  total: number;

  // Security Features
  qrCode: string;
  qrUrl: string;
  barcode: string;
  barcodeFormat: string;
  ticketNumber: string;
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
  termsAndConditions: string;
  privacyPolicy: string;
  liabilityWaiver: string;
  cancelationPolicy: string;
  ageRestriction: string;
  photoConsent: string;
  dataProtection: string;

  // Layout Options
  format: {
    size: 'A4' | 'A5' | 'A6' | 'A7' | 'custom';
    orientation: 'portrait' | 'landscape';
    width: number;
    height: number;
    units: 'mm' | 'inches' | 'pixels';
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
  artistImage?: string;
  sponsorLogos?: string[];
  customFields?: Record<string, string>;
}

export interface TemplateEditorState {
  template: TicketTemplate | null;
  selectedZone: TicketZone | null;
  isEditing: boolean;
  zoom: number;
  showGrid: boolean;
  data: TicketData;
}

// Templates prédéfinis basés sur la structure de données complète
export const TAYLOR_SWIFT_TEMPLATE: TicketTemplate = {
  id: 'concert-pro-template',
  name: 'Concert Pro',
  width: 350,
  height: 800,
  background: {
    gradient: {
      start: '#1a1a1a',
      end: '#2d2d2d',
      direction: 'vertical'
    }
  },
  zones: [
    {
      id: 'event-header',
      type: 'rectangle',
      name: 'En-tête Événement',
      x: 0,
      y: 0,
      width: 350,
      height: 120,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: '#FF1744',
        borderRadius: 0,
        borderWidth: 0
      },
      locked: true
    },
    {
      id: 'event-type',
      type: 'text',
      name: 'Type Événement',
      x: 20,
      y: 15,
      width: 310,
      height: 20,
      content: {
        type: 'dynamic',
        variable: 'eventType',
        placeholder: 'CONCERT'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial',
        letterSpacing: 2
      }
    },
    {
      id: 'event-name',
      type: 'text',
      name: 'Nom Événement',
      x: 20,
      y: 40,
      width: 310,
      height: 40,
      content: {
        type: 'dynamic',
        variable: 'eventName',
        placeholder: 'TAYLOR SWIFT | THE ERAS TOUR'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial Black',
        lineHeight: 1.2
      }
    },
    {
      id: 'organizer-name',
      type: 'text',
      name: 'Organisateur',
      x: 20,
      y: 85,
      width: 310,
      height: 20,
      content: {
        type: 'dynamic',
        variable: 'organizerName',
        placeholder: 'Live Nation Entertainment'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.8
      }
    },
    {
      id: 'venue-section',
      type: 'rectangle',
      name: 'Section Lieu',
      x: 20,
      y: 140,
      width: 310,
      height: 80,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
      },
      locked: true
    },
    {
      id: 'venue-name',
      type: 'text',
      name: 'Nom Lieu',
      x: 30,
      y: 150,
      width: 290,
      height: 25,
      content: {
        type: 'dynamic',
        variable: 'venue.name',
        placeholder: ''
      },
      style: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'venue-address',
      type: 'text',
      name: 'Adresse Lieu',
      x: 30,
      y: 175,
      width: 290,
      height: 35,
      content: {
        type: 'dynamic',
        variable: 'venue.address',
        placeholder: ''
      },
      style: {
        color: '#FFFFFF',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.9
      }
    },
    {
      id: 'date-time-section',
      type: 'rectangle',
      name: 'Section Date/Heure',
      x: 20,
      y: 240,
      width: 310,
      height: 80,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: 'rgba(255,23,68,0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,23,68,0.3)'
      },
      locked: true
    },
    {
      id: 'event-date',
      type: 'text',
      name: 'Date Événement',
      x: 30,
      y: 250,
      width: 140,
      height: 30,
      content: {
        type: 'dynamic',
        variable: 'schedule.startDate',
        placeholder: '31 MAI 2024'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'left',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'event-time',
      type: 'text',
      name: 'Heure Événement',
      x: 180,
      y: 250,
      width: 140,
      height: 30,
      content: {
        type: 'dynamic',
        variable: 'schedule.startTime',
        placeholder: '20:00'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'doors-open',
      type: 'text',
      name: 'Ouverture Portes',
      x: 30,
      y: 280,
      width: 290,
      height: 25,
      content: {
        type: 'dynamic',
        variable: 'schedule.doorsOpen',
        placeholder: 'Ouverture des portes : 18:30'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 11,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.8
      }
    },
    {
      id: 'attendee-section',
      type: 'rectangle',
      name: 'Section Participant',
      x: 20,
      y: 340,
      width: 310,
      height: 60,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      },
      locked: true
    },
    {
      id: 'attendee-name',
      type: 'text',
      name: 'Nom Participant',
      x: 30,
      y: 355,
      width: 290,
      height: 30,
      content: {
        type: 'dynamic',
        variable: 'fullName',
        placeholder: 'JOHN DOE'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'ticket-details',
      type: 'text',
      name: 'Détails Billet',
      x: 30,
      y: 378,
      width: 290,
      height: 15,
      content: {
        type: 'dynamic',
        variable: 'ticketType',
        placeholder: 'CATÉGORIE 1 - PLACEMENT DEBOUT'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.8
      }
    },
    {
      id: 'seating-info',
      type: 'rectangle',
      name: 'Infos Placement',
      x: 20,
      y: 420,
      width: 310,
      height: 80,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: '#FF1744',
        borderRadius: 8,
        borderWidth: 0
      },
      locked: true
    },
    {
      id: 'seating-label',
      type: 'text',
      name: 'Label Placement',
      x: 30,
      y: 435,
      width: 290,
      height: 20,
      content: {
        type: 'static',
        value: 'VOTRE PLACEMENT'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial',
        letterSpacing: 1
      }
    },
    {
      id: 'seating-details',
      type: 'text',
      name: 'Détails Placement',
      x: 30,
      y: 460,
      width: 290,
      height: 25,
      content: {
        type: 'dynamic',
        variable: 'seating.section',
        placeholder: 'BLOC N3 - RANG 3 - SIÈGE 15'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'pricing-section',
      type: 'rectangle',
      name: 'Section Prix',
      x: 20,
      y: 520,
      width: 150,
      height: 60,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
      },
      locked: true
    },
    {
      id: 'price-label',
      type: 'text',
      name: 'Label Prix',
      x: 30,
      y: 530,
      width: 130,
      height: 15,
      content: {
        type: 'static',
        value: 'PRIX'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.8
      }
    },
    {
      id: 'ticket-price',
      type: 'text',
      name: 'Prix Billet',
      x: 30,
      y: 550,
      width: 130,
      height: 20,
      content: {
        type: 'dynamic',
        variable: 'total',
        placeholder: '125,00 €'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'security-section',
      type: 'rectangle',
      name: 'Section Sécurité',
      x: 180,
      y: 520,
      width: 150,
      height: 60,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      },
      locked: true
    },
    {
      id: 'ticket-id',
      type: 'text',
      name: 'ID Billet',
      x: 190,
      y: 530,
      width: 130,
      height: 15,
      content: {
        type: 'dynamic',
        variable: 'ticketId',
        placeholder: 'ID: TS2024-001234'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 9,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.8
      }
    },
    {
      id: 'serial-number',
      type: 'text',
      name: 'Numéro Série',
      x: 190,
      y: 550,
      width: 130,
      height: 20,
      content: {
        type: 'dynamic',
        variable: 'serialNumber',
        placeholder: 'S/N: TSERAS2024'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'barcode-section',
      type: 'rectangle',
      name: 'Section Code-barres',
      x: 20,
      y: 600,
      width: 310,
      height: 80,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 0
      },
      locked: true
    },
    {
      id: 'barcode',
      type: 'barcode',
      name: 'Code-barres',
      x: 50,
      y: 610,
      width: 250,
      height: 50,
      content: {
        type: 'dynamic',
        variable: 'barcode',
        placeholder: '12345678901234567890'
      },
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4
      }
    },
    {
      id: 'barcode-text',
      type: 'text',
      name: 'Texte Code-barres',
      x: 30,
      y: 665,
      width: 290,
      height: 12,
      content: {
        type: 'dynamic',
        variable: 'ticketNumber',
        placeholder: 'N° 001234'
      },
      style: {
        color: '#000000',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.7
      }
    },
    {
      id: 'qr-section',
      type: 'rectangle',
      name: 'Section QR',
      x: 20,
      y: 700,
      width: 100,
      height: 80,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 0
      },
      locked: true
    },
    {
      id: 'qrcode',
      type: 'qrcode',
      name: 'Code QR',
      x: 30,
      y: 710,
      width: 80,
      height: 60,
      content: {
        type: 'dynamic',
        variable: 'qrCode',
        placeholder: 'QR_DATA'
      },
      style: {
        backgroundColor: '#FFFFFF'
      }
    },
    {
      id: 'legal-section',
      type: 'rectangle',
      name: 'Section Légal',
      x: 130,
      y: 700,
      width: 200,
      height: 80,
      content: {
        type: 'static',
        value: ''
      },
      style: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
      },
      locked: true
    },
    {
      id: 'legal-text',
      type: 'text',
      name: 'Texte Légal',
      x: 140,
      y: 710,
      width: 180,
      height: 60,
      content: {
        type: 'dynamic',
        variable: 'termsAndConditions',
        placeholder: 'Ce billet est personnel et incessible. La vente est définitive. Aucun remboursement. Annulation possible jusqu\'à 48h avant l\'événement.'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 8,
        textAlign: 'center',
        fontFamily: 'Arial',
        opacity: 0.7,
        lineHeight: 1.2
      }
    }
  ],
  styles: {
    global: {
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }
  }
};

export const CONCERT_TEMPLATE: TicketTemplate = {
  id: 'concert-standard',
  name: 'Concert Standard',
  width: 350,
  height: 600,
  background: {
    gradient: {
      start: '#6B46C1',
      end: '#EC4899',
      direction: 'diagonal'
    }
  },
  zones: [
    {
      id: 'event-name',
      type: 'text',
      name: 'Nom Événement',
      x: 20,
      y: 30,
      width: 310,
      height: 40,
      content: {
        type: 'dynamic',
        variable: 'eventName',
        placeholder: 'NOM DE L\'ÉVÉNEMENT'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial Black'
      }
    },
    {
      id: 'venue-date',
      type: 'text',
      name: 'Lieu & Date',
      x: 20,
      y: 80,
      width: 310,
      height: 60,
      content: {
        type: 'dynamic',
        variable: 'venue',
        placeholder: 'LIEU\nDATE'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'seat-info',
      type: 'text',
      name: 'Infos Siège',
      x: 20,
      y: 180,
      width: 310,
      height: 50,
      content: {
        type: 'dynamic',
        variable: 'seatInfo',
        placeholder: 'SECTION - RANG - SIÈGE'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        padding: 10
      }
    },
    {
      id: 'participant-name',
      type: 'text',
      name: 'Nom Participant',
      x: 20,
      y: 250,
      width: 310,
      height: 30,
      content: {
        type: 'dynamic',
        variable: 'participantName',
        placeholder: 'NOM DU PARTICIPANT'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    },
    {
      id: 'barcode',
      type: 'barcode',
      name: 'Code-barres',
      x: 50,
      y: 300,
      width: 250,
      height: 60,
      content: {
        type: 'dynamic',
        variable: 'barcode',
        placeholder: '1234567890123'
      },
      style: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4
      }
    },
    {
      id: 'ticket-number',
      type: 'text',
      name: 'Numéro Ticket',
      x: 20,
      y: 380,
      width: 310,
      height: 25,
      content: {
        type: 'dynamic',
        variable: 'ticketNumber',
        placeholder: 'N° TICKET'
      },
      style: {
        color: '#FFFFFF',
        fontSize: 12,
        textAlign: 'center',
        fontFamily: 'Arial'
      }
    }
  ],
  styles: {
    global: {
      fontFamily: 'Arial',
      color: '#FFFFFF'
    }
  }
};

// Variables disponibles pour les templates
export const TEMPLATE_VARIABLES = {
  EVENT: {
    eventName: '{{eventName}}',
    eventId: '{{eventId}}',
    eventType: '{{eventType}}',
    organizerName: '{{organizerName}}',
    organizerEmail: '{{organizerContact.email}}',
    organizerPhone: '{{organizerContact.phone}}',
    organizerWebsite: '{{organizerContact.website}}',
    venueName: '{{venue.name}}',
    venueAddress: '{{venue.address}}',
    venueCity: '{{venue.city}}',
    venuePostalCode: '{{venue.postalCode}}',
    venueCountry: '{{venue.country}}',
    venueCapacity: '{{venue.capacity}}',
    startDate: '{{schedule.startDate}}',
    endDate: '{{schedule.endDate}}',
    doorsOpen: '{{schedule.doorsOpen}}',
    startTime: '{{schedule.startTime}}',
    endTime: '{{schedule.endTime}}',
    timezone: '{{schedule.timezone}}',
    currency: '{{currency}}',
    price: '{{price}}',
    fees: '{{fees}}',
    tax: '{{tax}}',
    total: '{{total}}',
    description: '{{description}}',
    termsUrl: '{{termsUrl}}',
    websiteUrl: '{{websiteUrl}}'
  },
  ATTENDEE: {
    firstName: '{{firstName}}',
    lastName: '{{lastName}}',
    fullName: '{{fullName}}',
    email: '{{email}}',
    phone: '{{phone}}',
    addressStreet: '{{address.street}}',
    addressCity: '{{address.city}}',
    addressPostalCode: '{{address.postalCode}}',
    addressCountry: '{{address.country}}',
    dateOfBirth: '{{dateOfBirth}}',
    profession: '{{profession}}',
    company: '{{company}}',
    ticketId: '{{ticketId}}',
    registrationDate: '{{registrationDate}}',
    registrationSource: '{{registrationSource}}'
  },
  PRODUCT: {
    ticketType: '{{ticketType}}',
    ticketCategory: '{{ticketCategory}}',
    accessLevel: '{{accessLevel}}',
    seatingSection: '{{seating.section}}',
    seatingRow: '{{seating.row}}',
    seatingSeat: '{{seating.seat}}',
    seatingEntrance: '{{seating.entrance}}',
    benefits: '{{benefits}}',
    restrictions: '{{restrictions}}',
    addOns: '{{addOns}}'
  },
  SECURITY: {
    qrCode: '{{qrCode}}',
    qrUrl: '{{qrUrl}}',
    barcode: '{{barcode}}',
    barcodeFormat: '{{barcodeFormat}}',
    ticketNumber: '{{ticketNumber}}',
    serialNumber: '{{serialNumber}}',
    watermark: '{{securityFeatures.watermark}}',
    hologram: '{{securityFeatures.hologram}}',
    uvFeatures: '{{securityFeatures.uvFeatures}}',
    microtext: '{{securityFeatures.microtext}}',
    validFrom: '{{validation.validFrom}}',
    validUntil: '{{validation.validUntil}}',
    maxEntries: '{{validation.maxEntries}}',
    usedEntries: '{{validation.usedEntries}}'
  },
  LEGAL: {
    termsAndConditions: '{{termsAndConditions}}',
    privacyPolicy: '{{privacyPolicy}}',
    liabilityWaiver: '{{liabilityWaiver}}',
    cancelationPolicy: '{{cancelationPolicy}}',
    ageRestriction: '{{ageRestriction}}',
    photoConsent: '{{photoConsent}}',
    dataProtection: '{{dataProtection}}'
  },
  MEDIA: {
    backgroundImage: '{{backgroundImage}}',
    artistImage: '{{artistImage}}',
    sponsorLogos: '{{sponsorLogos}}'
  }
};